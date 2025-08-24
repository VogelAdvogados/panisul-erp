# Netly Starter

This is a Next.js starter configured for deployment on Netly.

To get started, take a look at `src/app/page.tsx`.

## Desenvolvimento Local

Certifique-se de usar Node.js 18 ou superior.

1. Instale as dependências: `npm ci`
2. Inicie o servidor de desenvolvimento: `npm run dev` e acesse `http://localhost:9002`.

## Implantação na Netly

1. Crie um novo site no painel da Netly e conecte este repositório.
2. Defina o comando de build como `npm run build` e o diretório de publicação como `.next`.
3. Configure as variáveis de ambiente necessárias no painel da Netly.
4. Faça commit e push para a branch principal para disparar o deploy.
5. Utilize o painel da Netly para acompanhar logs e reimplantações.

## Environment Variables

- `NEXT_PUBLIC_NETLY_API_URL` (**required**): Base URL for the Netly API used by the application.
- `NEXT_PUBLIC_NETLY_API_KEY` (optional): API key for authenticating requests when required.

