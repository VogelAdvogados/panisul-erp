
import { config } from 'dotenv';
config();

import '@/ai/flows/import-purchase-data.ts';
import '@/ai/flows/register-production.ts';
import '@/ai/flows/register-sale.ts';
import '@/ai/flows/settle-customer-payment.ts';
import '@/ai/flows/register-manual-purchase.ts';
import '@/ai/flows/register-expense.ts';

    
