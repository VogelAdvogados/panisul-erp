
'use server';

/**
 * @fileOverview An AI agent that analyzes a supplier's history using tools.
 *
 * - analyzeSupplierHistory - A function that performs the analysis.
 * - analyzeSupplierHistoryFlow - The Genkit flow that defines the agent.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db, collection, doc, getDoc, getDocs, query, where } from '@/lib/netly';
import type { Supplier, Purchase, FinancialMovement } from '@/lib/types';

// Tool to get basic supplier details
const getSupplierDetailsTool = ai.defineTool(
    {
        name: 'getSupplierDetails',
        description: 'Get the basic details of a supplier by their ID.',
        inputSchema: z.string().describe('The supplier ID.'),
        outputSchema: z.custom<Supplier>(),
    },
    async (supplierId) => {
        const docRef = doc(db, 'suppliers', supplierId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error('Supplier not found');
        }
        return { id: docSnap.id, ...docSnap.data() } as Supplier;
    }
);

// Tool to get all purchases from a supplier
const getSupplierPurchasesTool = ai.defineTool(
    {
        name: 'getSupplierPurchases',
        description: "Get a list of all purchases made from a specific supplier.",
        inputSchema: z.string().describe('The supplier ID.'),
        outputSchema: z.array(z.custom<Purchase>()),
    },
    async (supplierId) => {
        const q = query(collection(db, 'purchases'), where('supplierId', '==', supplierId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase));
    }
);

// Tool to get financial movements related to a set of purchases
const getFinancialMovementsForPurchasesTool = ai.defineTool(
    {
        name: 'getFinancialMovementsForPurchases',
        description: 'Get all financial movements (accounts payable) associated with a list of purchase IDs.',
        inputSchema: z.array(z.string()).describe('An array of purchase IDs.'),
        outputSchema: z.array(z.custom<FinancialMovement>()),
    },
    async (purchaseIds) => {
        if (purchaseIds.length === 0) return [];
        const q = query(collection(db, 'financialMovements'), where('referenceId', 'in', purchaseIds));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancialMovement));
    }
);


const AnalysisSchema = z.object({
  analysis: z.string().describe("A concise, insightful analysis of the supplier relationship in Portuguese, based on the data provided. Mention key metrics and provide a strategic recommendation."),
});

const prompt = ai.definePrompt({
    name: 'supplierAnalysisPrompt',
    tools: [getSupplierDetailsTool, getSupplierPurchasesTool, getFinancialMovementsForPurchasesTool],
    input: { schema: z.string() },
    output: { schema: AnalysisSchema },
    prompt: `You are an expert purchasing and financial analyst for a bakery. 
Your goal is to analyze the complete history of a given supplier and provide a summary.

Supplier ID: {{{input}}}

Follow these steps:
1. Use the 'getSupplierDetails' tool to get the supplier's name and other basic information.
2. Use the 'getSupplierPurchases' tool to get all purchases from this supplier.
3. Extract all the purchase IDs from the result of the previous step.
4. Use the 'getFinancialMovementsForPurchases' tool with the extracted purchase IDs to get all related financial transactions (installments).
5. With all this data, calculate the following key metrics:
    - Total value of all purchases.
    - Total amount paid to the supplier.
    - Current outstanding balance (pending payments).
6. Finally, write a concise analysis in Portuguese. Include the key metrics you calculated and provide a brief, actionable recommendation about the relationship with this supplier (e.g., "Continue partnership", "Negotiate better terms", "Monitor payments closely").
`,
});

const analyzeSupplierHistoryFlow = ai.defineFlow(
  {
    name: 'analyzeSupplierHistoryFlow',
    inputSchema: z.string(),
    outputSchema: AnalysisSchema,
  },
  async (supplierId) => {
    const response = await prompt(supplierId);
    return response.output()!;
  }
);

export async function analyzeSupplierHistory(supplierId: string): Promise<z.infer<typeof AnalysisSchema>> {
    return analyzeSupplierHistoryFlow(supplierId);
}
