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
  validationResult: z.string().describe('The result of the data validation.'),
  stockUpdateResult: z.string().describe('The result of the stock update.'),
  accountsPayableUpdateResult: z
    .string()
    .describe('The result of the accounts payable update.'),
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
  prompt: `You are an expert data extractor and validator for purchase data.

You will receive a file (either XML or PDF) containing purchase information.
Your task is to extract the relevant details such as supplier, invoice number, invoice date, item details (name, quantity, unit price), and total amount.
After extracting the data, you will perform a basic validation to ensure the data is consistent and reasonable.
Finally, you will provide a summary of the data extraction, validation, and the steps required to update the stock and accounts payable.

File Type: {{{fileType}}}
File Content: {{media url=fileDataUri}}

Ensure that the extracted data is accurate and complete. Pay attention to details and handle potential inconsistencies or errors gracefully.

Output the data in JSON format according to the schema.`,
});

const importPurchaseDataFlow = ai.defineFlow(
  {
    name: 'importPurchaseDataFlow',
    inputSchema: ImportPurchaseDataInputSchema,
    outputSchema: ImportPurchaseDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Assuming data validation, stock update, and accounts payable update are
    // handled outside the Genkit flow for now.
    return output!;
  }
);
