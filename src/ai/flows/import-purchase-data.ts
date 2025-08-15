
'use server';

/**
 * @fileOverview Imports purchase data from XML or PDF files, extracts relevant details,
 * and automatically creates the purchase record, financial movements, and updates stock and average cost.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, increment, runTransaction, getDoc, getDocs, query, where } from 'firebase/firestore';
import type { Purchase, FinancialMovement, Ingredient, Supplier } from '@/lib/types';
import { format, addMonths } from 'date-fns';


const ImportPurchaseDataInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The purchase data file (XML or PDF) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  fileType: z.enum(['xml', 'pdf']).describe('The type of the uploaded file.'),
});
export type ImportPurchaseDataInput = z.infer<typeof ImportPurchaseDataInputSchema>;


const ExtractedItemSchema = z.object({
    name: z.string().describe('The name of the item.'),
    quantity: z.number().describe('The quantity of the item.'),
    unitPrice: z.number().describe('The unit price of the item.'),
});

const ExtractedPurchaseSchema = z.object({
    supplierName: z.string().describe('The name of the supplier.'),
    invoiceNumber: z.string().describe('The invoice number.'),
    invoiceDate: z.string().describe('The invoice date (YYYY-MM-DD).'),
    items: z.array(ExtractedItemSchema).describe('The list of items in the purchase.'),
    totalAmount: z.number().describe('The total amount of the purchase.'),
    installments: z.number().int().min(1).describe('The number of payment installments. Default to 1 if not specified.'),
});

const ImportPurchaseDataOutputSchema = z.object({
    purchaseId: z.string(),
    message: z.string(),
});
export type ImportPurchaseDataOutput = z.infer<typeof ImportPurchaseDataOutputSchema>;


const findSupplierAndIngredientsTool = ai.defineTool(
    {
        name: 'findSupplierAndIngredientsTool',
        description: 'Finds the supplier and ingredients in the database by name and returns their database IDs. It is critical to use this tool to get IDs before creating any records.',
        inputSchema: z.object({
            supplierName: z.string().describe('The name of the supplier to find.'),
            itemNames: z.array(z.string()).describe('An array of ingredient names to find.'),
        }),
        outputSchema: z.object({
            supplierId: z.string().optional(),
            ingredientIds: z.array(z.string().optional()),
        }),
    },
    async ({ supplierName, itemNames }) => {
        // Find Supplier
        const suppliersRef = collection(db, 'suppliers');
        const q = query(suppliersRef, where('name', '==', supplierName));
        const supplierSnapshot = await getDocs(q);
        const supplierId = supplierSnapshot.docs.length > 0 ? supplierSnapshot.docs[0].id : undefined;

        // Find Ingredients
        const ingredientIds: (string | undefined)[] = [];
        for (const name of itemNames) {
            const ingredientsRef = collection(db, 'ingredients');
            const iq = query(ingredientsRef, where('name', '==', name));
            const ingredientSnapshot = await getDocs(iq);
            ingredientIds.push(ingredientSnapshot.docs.length > 0 ? ingredientSnapshot.docs[0].id : undefined);
        }

        return { supplierId, ingredientIds };
    }
);


const prompt = ai.definePrompt({
  name: 'extractPurchaseDataPrompt',
  tools: [findSupplierAndIngredientsTool],
  input: {schema: ImportPurchaseDataInputSchema},
  output: {schema: ExtractedPurchaseSchema},
  prompt: `You are an expert data processor for a bakery management system.

Your task is to meticulously extract the following details from the provided purchase file (XML or PDF):
- Supplier Name (supplierName)
- Invoice Number (invoiceNumber)
- Invoice Date (invoiceDate in YYYY-MM-DD format)
- All line items, including their name, quantity, and unit price.
- The total purchase amount (totalAmount).
- The number of payment installments (installments). If not specified, assume 1.

File Type: {{{fileType}}}
File Content: {{media url=fileDataUri}}

After extracting the data, you MUST use the 'findSupplierAndIngredientsTool' to get the database IDs for the supplier and all the ingredients before finishing.

Produce the final output in JSON format according to the schema.`,
});


export async function importPurchaseData(
  input: ImportPurchaseDataInput
): Promise<ImportPurchaseDataOutput> {
  return importPurchaseDataFlow(input);
}


const importPurchaseDataFlow = ai.defineFlow(
  {
    name: 'importPurchaseDataFlow',
    inputSchema: ImportPurchaseDataInputSchema,
    outputSchema: ImportPurchaseDataOutputSchema,
  },
  async (input) => {
    const llmResponse = await prompt(input);
    const extractedData = llmResponse.output;

    if (!extractedData) {
        throw new Error("Failed to extract data from the document.");
    }
    
    const toolRequest = llmResponse.toolRequest('findSupplierAndIngredientsTool');
    if (!toolRequest) {
        throw new Error("AI did not request to find supplier and ingredients. It might be that the document is not a valid invoice.");
    }

    const { supplierId, ingredientIds } = await toolRequest.result();

    if (!supplierId) {
        throw new Error(`O fornecedor "${extractedData.supplierName}" não foi encontrado no sistema. Por favor, cadastre-o primeiro.`);
    }
     if (ingredientIds.some(id => !id)) {
        const missingItemIndex = ingredientIds.findIndex(id => !id);
        const missingItemName = extractedData.items[missingItemIndex].name;
        throw new Error(`O insumo "${missingItemName}" não foi encontrado no sistema. Por favor, cadastre-o primeiro.`);
    }

    const supplierDoc = await getDoc(doc(db, 'suppliers', supplierId));
     if (!supplierDoc.exists()) {
        throw new Error('Fornecedor não encontrado no banco de dados.');
    }
    const supplier = supplierDoc.data() as Supplier;


    const purchaseDocData: Omit<Purchase, 'id'> = {
        supplierId,
        invoiceNumber: extractedData.invoiceNumber,
        date: extractedData.invoiceDate,
        totalAmount: extractedData.totalAmount,
        items: extractedData.items,
        paymentMethod: 'boleto', 
    };

    const purchaseId = await runTransaction(db, async (transaction) => {
        const purchaseRef = doc(collection(db, 'purchases'));
        transaction.set(purchaseRef, purchaseDocData);

        const installmentValue = extractedData.totalAmount / extractedData.installments;
        for (let i = 0; i < extractedData.installments; i++) {
            const dueDate = addMonths(new Date(extractedData.invoiceDate), i + 1);
            const financialMovement: Omit<FinancialMovement, 'id'> = {
                description: `Compra NFE ${extractedData.invoiceNumber} - ${supplier.name} (Parc. ${i + 1}/${extractedData.installments})`,
                referenceId: purchaseRef.id,
                dueDate: format(dueDate, 'yyyy-MM-dd'),
                amount: -installmentValue,
                status: 'pending',
                category: 'insumos',
                sourceAccount: 'bank',
                type: 'expense',
            };
            const movementRef = doc(collection(db, 'financialMovements'));
            transaction.set(movementRef, financialMovement);
        }

        for (let i = 0; i < extractedData.items.length; i++) {
            const item = extractedData.items[i];
            const ingredientId = ingredientIds[i]!;
            const ingredientRef = doc(db, 'ingredients', ingredientId);
            
            const ingredientDoc = await transaction.get(ingredientRef);
            if (!ingredientDoc.exists()) throw new Error (`Insumo ${item.name} não encontrado no BD.`);

            const ingredientData = ingredientDoc.data() as Ingredient;
            const oldStock = ingredientData.stock;
            const oldCost = ingredientData.cost;
            const newQuantity = item.quantity;
            const newPrice = item.unitPrice;

            const newTotalStock = oldStock + newQuantity;
            const newAverageCost = newTotalStock > 0 
                ? ((oldStock * oldCost) + (newQuantity * newPrice)) / newTotalStock
                : newPrice;

            transaction.update(ingredientRef, {
                stock: increment(item.quantity),
                cost: newAverageCost,
            });
        }
        return purchaseRef.id;
    });

    return {
        purchaseId,
        message: `Compra de ${extractedData.supplierName} no valor de ${extractedData.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} importada com sucesso!`
    };
  }
);
