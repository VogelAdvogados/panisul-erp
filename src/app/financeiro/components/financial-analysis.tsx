
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { analyzeFinancials, type FinancialAnalysisInput, type FinancialAnalysisOutput } from '@/ai/flows/analyze-financials';

const mockFinancialData: FinancialAnalysisInput = {
    revenues: 1247.50,
    expenses: 380.00,
    receivable: 245.00,
    payable: 450.00
};

export function FinancialAnalysis() {
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<FinancialAnalysisOutput | null>(null);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setAnalysis(null);
        try {
            const result = await analyzeFinancials(mockFinancialData);
            setAnalysis(result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="bg-primary/5">
            <CardHeader>
                <div className='flex items-center justify-between'>
                    <div className="flex items-center gap-3">
                         <div className="bg-primary/10 text-primary p-2 rounded-lg">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle>Análise Financeira com IA</CardTitle>
                            <CardDescription>Obtenha insights sobre a saúde financeira do dia.</CardDescription>
                        </div>
                    </div>
                    <Button onClick={handleAnalyze} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Analisando...' : 'Analisar Agora'}
                    </Button>
                </div>
            </CardHeader>
            {analysis && (
                <CardContent>
                    <div className="p-4 bg-background rounded-lg border space-y-3">
                        <div>
                            <h4 className="font-semibold">Resultado do Dia: <span className={analysis.netResult > 0 ? 'text-green-600' : 'text-red-600'}>{analysis.netResult.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></h4>
                            <p className="text-sm text-muted-foreground">{analysis.resultComment}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Situação das Contas:</h4>
                             <p className="text-sm text-muted-foreground">{analysis.accountsAnalysis}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Recomendação da IA:</h4>
                             <p className="text-sm text-muted-foreground">{analysis.recommendation}</p>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
