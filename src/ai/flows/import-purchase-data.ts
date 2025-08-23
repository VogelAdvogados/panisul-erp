'use server';

/**
 * @fileOverview Imports purchase data from XML or PDF files, extracts relevant details,
 * and automatically creates the purchase record, financial movements, and updates stock and average cost.
 */

import { z } from 'zod';

const ImportPurchaseDataInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The purchase data file (XML or PDF) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.",
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
  installments: z
    .number()
    .int()
    .min(1)
    .describe('The number of payment installments. Default to 1 if not specified.'),
});

const ImportPurchaseDataOutputSchema = z.object({
  purchaseId: z.string(),
  message: z.string(),
});
export type ImportPurchaseDataOutput = z.infer<typeof ImportPurchaseDataOutputSchema>;

export async function importPurchaseData(
  _input: ImportPurchaseDataInput,
): Promise<ImportPurchaseDataOutput> {
  throw new Error('AI functionality disabled');
}

