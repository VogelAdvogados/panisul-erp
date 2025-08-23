
'use server';

/**
 * @fileOverview Analyzes daily financial data to provide insights and recommendations.
 *
 * - analyzeFinancials - A function that performs the financial analysis.
 * - FinancialAnalysisInput - The input type for the analysis.
 * - FinancialAnalysisOutput - The return type for the analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const FinancialAnalysisInputSchema = z.object({
  revenues: z.number().describe('Total revenues for the day.'),
  expenses: z.number().describe('Total expenses for the day.'),
  receivable: z.number().describe('Total accounts receivable for the day.'),
  payable: z.number().describe('Total accounts payable for the day.'),
});
export type FinancialAnalysisInput = z.infer<typeof FinancialAnalysisInputSchema>;

const FinancialAnalysisOutputSchema = z.object({
  netResult: z.number().describe('The calculated net result (Revenues - Expenses).'),
  resultComment: z.string().describe('A brief comment on the net result (e.g., "positive", "negative").'),
  accountsAnalysis: z.string().describe('A comment on the balance between accounts receivable and payable.'),
  recommendation: z.string().describe('A strategic recommendation based on the overall financial picture.'),
});
export type FinancialAnalysisOutput = z.infer<typeof FinancialAnalysisOutputSchema>;


export async function analyzeFinancials(input: FinancialAnalysisInput): Promise<FinancialAnalysisOutput> {
  return analyzeFinancialsFlow(input);
}


const prompt = ai.definePrompt({
  name: 'analyzeFinancialsPrompt',
  input: { schema: FinancialAnalysisInputSchema },
  output: { schema: FinancialAnalysisOutputSchema },
  prompt: `You are a financial analyst for a bakery. Analyze the following daily financial data and provide insights in Portuguese.

Data:
- Revenues: {{{revenues}}}
- Expenses: {{{expenses}}}
- Accounts Receivable: {{{receivable}}}
- Accounts Payable: {{{payable}}}

Tasks:
1.  Calculate the 'netResult' (Revenues - Expenses).
2.  Write a 'resultComment' about the net result.
3.  Write an 'accountsAnalysis' commenting on the relationship between receivables and payables for the day.
4.  Provide a short, actionable 'recommendation' for the bakery manager based on these numbers.

Produce the final output in JSON format according to the schema.
`,
});

const analyzeFinancialsFlow = ai.defineFlow(
  {
    name: 'analyzeFinancialsFlow',
    inputSchema: FinancialAnalysisInputSchema,
    outputSchema: FinancialAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
