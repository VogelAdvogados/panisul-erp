
'use server';

/**
 * @fileOverview Analyzes sales data within a date range to provide insights.
 *
 * - analyzeSales - A function that performs the sales analysis.
 * - SalesAnalysisInput - The input type for the analysis.
 * - SalesAnalysisOutput - The return type for the analysis.
 */

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

export async function analyzeSales(_input: SalesAnalysisInput): Promise<SalesAnalysisOutput> {
  throw new Error('AI functionality disabled');
}
