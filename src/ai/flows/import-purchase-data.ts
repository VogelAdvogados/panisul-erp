'use server';

/**
 * @fileOverview Imports purchase data from XML or PDF files, extracts relevant details,
 * validates them, and updates stock and accounts payable.
 *
 * - importPurchaseData - A function that handles the purchase data import process.
 * - ImportPurchaseDataInput - The input type for the importPurchaseData function.
 * - ImportPurchaseDataOutput - The return type for the importPurchaseData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImportPurchaseDataInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The purchase data file (XML or PDF) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  fileType: z.enum(['xml', 'pdf']).describe('The type of the uploaded file.'),
});
export type ImportPurchaseDataInput = z.infer<typeof ImportPurchaseDataInputSchema>;

const ImportPurchaseDataOutputSchema = z.object({
  purchaseDetails: z.object({
    supplier: z.string().describe('The name of the supplier.'),
    invoiceNumber: z.string().describe('The invoice number.'),
    invoiceDate: z.string().describe('The invoice date (YYYY-MM-DD).'),
    items: z
      .array(
        z.object({
          name: z.string().describe('The name of the item.'),
          quantity: z.number().describe('The quantity of the item.'),
          unitPrice: z.number().describe('The unit price of the item.'),
        })
      )
      .describe('The list of items in the purchase.'),
    totalAmount: z.number().describe('The total amount of the purchase.'),
  }),
  validationResult: z.string().describe('The result of the data validation. Example: "Fornecedor e todos os 3 produtos já cadastrados."'),
  stockUpdateResult: z.string().describe('The result of the stock update. Example: "Estoque de 3 insumos será atualizado."'),
  accountsPayableUpdateResult: z
    .string()
    .describe('The result of the accounts payable update. Example: "Conta a pagar de R$ 1.500,00 será lançada para o fornecedor."'),
});
export type ImportPurchaseDataOutput = z.infer<typeof ImportPurchaseDataOutputSchema>;

export async function importPurchaseData(
  input: ImportPurchaseDataInput
): Promise<ImportPurchaseDataOutput> {
  return importPurchaseDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'importPurchaseDataPrompt',
  input: {schema: ImportPurchaseDataInputSchema},
  output: {schema: ImportPurchaseDataOutputSchema},
  prompt: `You are an expert data processor for a bakery management system.

You will receive a purchase file (XML or PDF). Your tasks are:
1.  **Extract**: Meticulously extract supplier name, invoice number, invoice date, all line items (name, quantity, unit price), and the total amount.
2.  **Analyze & Summarize**: After extraction, provide three concise summary sentences in Portuguese for the result fields, following these rules:
    -   `validationResult`: Simulate checking if the supplier and products are already registered. Respond like "Fornecedor e todos os [X] produtos já cadastrados." or "Fornecedor novo. 1 de [X] produtos é novo."
    -   `stockUpdateResult`: Describe the stock update action. Respond like "Estoque de [X] insumos será atualizado."
    -   `accountsPayableUpdateResult`: Describe the financial entry. Respond like "Conta a pagar de R$ [Total] será lançada para o fornecedor."

File Type: {{{fileType}}}
File Content: {{media url=fileDataUri}}

Produce the final output in JSON format according to the schema.`,
});

const importPurchaseDataFlow = ai.defineFlow(
  {
    name: 'importPurchaseDataFlow',
    inputSchema: ImportPurchaseDataInputSchema,
    outputSchema: ImportPurchaseDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // In a real scenario, this is where you would add logic to interact with
    // a database to perform the actual validation and data persistence.
    // For now, the prompt simulates these actions.
    return output!;
  }
);
