
'use server';

/**
 * @fileOverview An AI agent that analyzes a supplier's history using database tools.
 *
 * - analyzeSupplierHistory - A function that performs the analysis.
 */

import { z } from 'zod';

const AnalysisSchema = z.object({
  analysis: z.string().describe(
    'A concise, insightful analysis of the supplier relationship in Portuguese, based on the data provided. Mention key metrics and provide a strategic recommendation.'
  ),
});
export type SupplierHistoryAnalysis = z.infer<typeof AnalysisSchema>;

export async function analyzeSupplierHistory(_supplierId: string): Promise<SupplierHistoryAnalysis> {
  throw new Error('AI functionality disabled');
}
