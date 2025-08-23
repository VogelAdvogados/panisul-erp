import { ZodSchema } from 'zod';

type FlowOptions<I, O> = {
  name: string;
  inputSchema: ZodSchema<I>;
  outputSchema: ZodSchema<O>;
};

type PromptOptions<I, O> = {
  name: string;
  prompt: string;
  tools?: Array<unknown>;
  input: { schema: ZodSchema<I> };
  output: { schema: ZodSchema<O> };
};

type ToolOptions<I, O> = {
  name: string;
  description: string;
  inputSchema: ZodSchema<I>;
  outputSchema: ZodSchema<O>;
};

type Handler<I, O> = (input: I) => Promise<O> | O;

function defineFlow<I, O>(opts: FlowOptions<I, O>, handler: Handler<I, O>) {
  return async (input: I): Promise<O> => {
    const parsed = opts.inputSchema.parse(input);
    const result = await handler(parsed);
    return opts.outputSchema.parse(result);
  };
}

function definePrompt<I, O>(opts: PromptOptions<I, O>) {
  return async (input: I): Promise<{ output: O }> => {
    opts.input.schema.parse(input);
    throw new Error('Prompt execution not implemented.');
  };
}

function defineTool<I, O>(opts: ToolOptions<I, O>, handler: Handler<I, O>) {
  return async (input: I): Promise<O> => {
    const parsed = opts.inputSchema.parse(input);
    const result = await handler(parsed);
    return opts.outputSchema.parse(result);
  };
}

export const ai = {
  defineFlow,
  definePrompt,
  defineTool,
};
