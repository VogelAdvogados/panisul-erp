
import { config } from 'dotenv';
config();

import '@/ai/flows/import-purchase-data.ts';
import '@/ai/flows/generate-image.ts';
import '@/ai/flows/analyze-financials.ts';
import '@/ai/flows/analyze-sales.ts';
