
'use server';

/**
 * @fileOverview Imports purchase data from XML or PDF files, extracts relevant details,
 * and automatically creates the purchase record, financial movements, and updates stock.
 *
 * - importPurchaseData - A function that handles the purchase data import process.
 * - ImportPurchaseDataInput - The input type for the importPurchaseData function.
 * - ImportPurchaseDataOutput - The return type for the importPurchaseData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, increment, runTransaction } from 'firebase/firestore';
import type { Purchase, FinancialMovement, Ingredient } from '@/lib/types';

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
});

const ImportPurchaseDataOutputSchema = z.object({
    purchaseId: z.string(),
    message: z.string(),
});
export type ImportPurchaseDataOutput = z.infer<typeof ImportPurchaseDataOutputSchema>;


// This is a simplified tool. A real implementation would query the database
// to find a matching supplier and products. For now, it returns mock IDs.
const findSupplierAndIngredientsTool = ai.defineTool(
    {
        name: 'findSupplierAndIngredientsTool',
        description: 'Finds the supplier and ingredients in the database and returns their IDs.',
        inputSchema: z.object({
            supplierName: z.string(),
            itemNames: z.array(z.string()),
        }),
        outputSchema: z.object({
            supplierId: z.string(),
            ingredientIds: z.array(z.string()),
        }),
    },
    async ({ supplierName, itemNames }) => {
        // In a real app, you would query Firestore here.
        // For now, we'll return the first supplier and matching ingredients from the initial data.
        return {
            supplierId: 'SUP-001', // Mock ID
            ingredientIds: itemNames.map(name => 'ING-001') // Mock IDs
        };
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

File Type: {{{fileType}}}
File Content: {{media url=fileDataUri}}

After extracting the data, you MUST use the 'findSupplierAndIngredientsTool' to get the database IDs for the supplier and the ingredients.

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
    
    // Find the tool call in the LLM response
    const toolRequest = llmResponse.toolRequest('findSupplierAndIngredientsTool');
    if (!toolRequest) {
        throw new Error("AI did not request to find supplier and ingredients.");
    }

    // Execute the tool and get the result
    const { supplierId, ingredientIds } = await toolRequest.result();

    if (!supplierId || ingredientIds.length !== extractedData.items.length) {
        throw new Error("Could not find a matching supplier or ingredients in the database.");
    }

    const purchaseDocData: Omit<Purchase, 'id' | 'financialMovements'> = {
        supplierId,
        invoiceNumber: extractedData.invoiceNumber,
        date: extractedData.invoiceDate,
        totalAmount: extractedData.totalAmount,
        items: extractedData.items,
        paymentMethod: 'boleto', // Defaulting, could be extracted too
    };

    // Use a transaction to ensure all writes succeed or none do.
    const purchaseId = await runTransaction(db, async (transaction) => {
        // 1. Create the Purchase document
        const purchaseRef = await addDoc(collection(db, 'purchases'), purchaseDocData);

        // 2. Create the Financial Movement (accounts payable)
        const financialMovement: Omit<FinancialMovement, 'id'> = {
            description: `Compra NFE ${extractedData.invoiceNumber} de ${extractedData.supplierName}`,
            referenceId: purchaseRef.id,
            dueDate: new Date(extractedData.invoiceDate).toISOString().split('T')[0], // Simplified due date
            amount: extractedData.totalAmount,
            status: 'pending',
            category: 'insumos',
            sourceAccount: 'bank', // Defaulting, could be extracted
            type: 'expense',
        };
        await addDoc(collection(db, 'financialMovements'), financialMovement);

        // 3. Update stock for each ingredient
        for (let i = 0; i < extractedData.items.length; i++) {
            const item = extractedData.items[i];
            const ingredientId = ingredientIds[i];
            if (ingredientId) {
                const ingredientRef = doc(db, 'ingredients', ingredientId);
                transaction.update(ingredientRef, {
                    stock: increment(item.quantity)
                });
            }
        }
        return purchaseRef.id;
    });

    return {
        purchaseId,
        message: `Compra de ${extractedData.supplierName} no valor de ${extractedData.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} importada com sucesso!`
    };
  }
);
