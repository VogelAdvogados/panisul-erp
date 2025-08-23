
'use server';

/**
 * @fileOverview Analyzes sales data within a date range to provide insights.
 *
 * - analyzeSales - A function that performs the sales analysis.
 * - SalesAnalysisInput - The input type for the analysis.
 * - SalesAnalysisOutput - The return type for the analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ProductSaleSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantitySold: z.number(),
  totalValue: z.number(),
});

const ProductInfoSchema = z.object({
    id: z.string(),
    name: z.string(),
    stock: z.number(),
});

export const SalesAnalysisInputSchema = z.object({
  startDate: z.string().describe('The start date of the analysis period (ISO 8601).'),
  endDate: z.string().describe('The end date of the analysis period (ISO 8601).'),
  salesData: z.array(ProductSaleSchema).describe('An array of sales data for the period.'),
  products: z.array(ProductInfoSchema).describe('A list of all products for context.'),
});
export type SalesAnalysisInput = z.infer<typeof SalesAnalysisInputSchema>;

export const SalesAnalysisOutputSchema = z.object({
  summary: z.string().describe('A high-level executive summary of the sales performance in the period.'),
  topSellingProducts: z.array(ProductSaleSchema).describe('A list of the top 3 selling products.'),
  lowSellingProducts: z.array(ProductSaleSchema).describe('A list of the bottom 3 selling products.'),
  trends: z.string().describe('A detailed analysis of observed trends, patterns, or anomalies in sales.'),
  recommendations: z.string().describe('Actionable strategic recommendations based on the analysis (e.g., promotions, stock adjustments, new products).'),
});
export type SalesAnalysisOutput = z.infer<typeof SalesAnalysisOutputSchema>;

export async function analyzeSales(input: SalesAnalysisInput): Promise<SalesAnalysisOutput> {
  return analyzeSalesFlow(input);
}


const prompt = ai.definePrompt({
  name: 'analyzeSalesPrompt',
  input: { schema: SalesAnalysisInputSchema },
  output: { schema: SalesAnalysisOutputSchema },
  prompt: `You are an expert sales analyst for a bakery. Analyze the provided sales data for the period from {{startDate}} to {{endDate}}.
The full product list is also provided for context, including current stock levels. All responses should be in Portuguese.

Sales Data:
{{jsonStringify salesData}}

All Products (for stock context):
{{jsonStringify products}}

Your tasks are:
1.  **summary**: Write a concise executive summary of the sales performance. Mention the total revenue and general performance.
2.  **topSellingProducts**: Identify the top 3 best-selling products by quantitySold.
3.  **lowSellingProducts**: Identify the 3 worst-selling products by quantitySold.
4.  **trends**: Describe any notable trends or patterns. Are sales concentrated on certain products? Is there a mismatch between high sales and low stock for any item?
5.  **recommendations**: Based on everything, provide clear, actionable recommendations. For example: "Consider a promotion for Croissants to increase sales" or "Increase production of Pão Francês to avoid stockouts."

Produce the final output in JSON format according to the schema.
`,
});

const analyzeSalesFlow = ai.defineFlow(
  {
    name: 'analyzeSalesFlow',
    inputSchema: SalesAnalysisInputSchema,
    outputSchema: SalesAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
