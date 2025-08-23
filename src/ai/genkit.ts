export const ai = {
  defineFlow: (_config: any, handler: any) => handler,
  definePrompt: (_config: any) => async (_input: any) => ({
    output: () => undefined as unknown,
    toolRequest: (_name: string) => ({ result: async () => ({}) as any })
  }),
  defineTool: (_config: any, handler: any) => handler,
};
