# **App Name**: Sistema de Gestão Integrado Panisul

## Core Features:

- Visão Geral do Dashboard: Dashboard com visão geral dos indicadores financeiros e resumos operacionais.
- Painel de Operações Diárias: Painel de operações diárias para registrar a produção e gerenciar os cards de produtos.
- Gerenciamento Financeiro: Gerenciamento de contas separadas de 'Caixa Físico' e 'Conta Corrente' com alocação automática de receitas.
- Importação Automatizada de Compras: Importação automatizada de dados de compra a partir de arquivos XML ou PDF, extração de detalhes, validação e verificação em fontes online.
- Manuseio de Trocas: Processamento de trocas de produtos, deduzindo o estoque e atualizando o histórico do cliente.
- Persistência de Dados: Manutenção do armazenamento de dados de clientes, produtos e especificações técnicas.
- Geração de Relatórios: Geração de relatórios detalhados de vendas, ranking de clientes, análises de trocas, contas a receber/pagar e fluxo de caixa.
- Dashboard - Indicadores Chave e Atalhos: Painel com indicadores financeiros chave e atalhos de ações rápidas.
- Dashboard - Resumo Operacional e Alertas: Exibição de resumos operacionais, alertas para estoque baixo, contas vencidas e gráficos rápidos.
- Operações Diárias - Cards de Produtos e Ações: Registro da produção, exibição de cards de produtos com níveis de estoque e botões de ação direta.
- Módulo Financeiro - Gerenciamento de Múltiplas Contas: Gerenciamento de caixa físico e contas correntes, alocando automaticamente as receitas com base nos métodos de pagamento.
- Módulo Financeiro - Transferências e Contas a Pagar/Receber: Permissão para transferir fundos entre contas de caixa e correntes e gerenciamento de contas a pagar/receber.
- Módulo de Compras - Importação Inteligente: Importação de dados de compra de XML/PDF, validação de dados e atualização de estoque/contas a pagar.
- Funcionalidade de Troca - Manuseio Detalhado: Manuseio de trocas de produtos, dedução de estoque e registro de custos, enquanto atualiza o histórico do cliente.
- Gerenciamento de Clientes: Gerenciamento de dados de clientes com integração de API externa para consulta de CNPJ/CEP e consolidação do histórico.
- Gerenciamento de Dados Base: Manutenção de dados de produtos, ingredientes e receitas para redução automática de estoque durante a produção.
- Relatórios Gerenciais: Geração de relatórios de vendas, ranking de clientes, trocas, contas e fluxo de caixa.
- Módulo de Clientes: Cadastro completo de clientes com integração a APIs externas para preenchimento automático de dados por CNPJ (Receita Federal) e CEP. A ficha do cliente consolida o histórico de compras, trocas e o saldo devedor.
- Módulo de Cadastros Base: Cadastro de produtos (nome, preço de venda), insumos (matéria-prima, unidade de medida, estoque mínimo para alertas) e fichas técnicas (receita de cada produto para baixa automática de insumos durante a produção).
- Módulo de Relatórios Gerenciais: Geração de relatórios de vendas (por período, cliente), ranking de clientes, análise de trocas, contas a receber/pagar (com filtros por status) e um fluxo de caixa detalhado por conta financeira (Caixa Físico e Conta Corrente).

## Style Guidelines:

- Cor primária: Deep Teal (#008080) para representar estabilidade e confiança.
- Cor de fundo: Light gray (#F0F8FF) proporciona um pano de fundo limpo e neutro.
- Cor de destaque: Vibrant Coral (#FF7F50) para destacar ações e alertas importantes.
- Fonte do corpo e do título: 'PT Sans', uma fonte humanista sans-serif para legibilidade.
- Uso de ícones simples e modernos para representar diferentes funções e pontos de dados.
- Manutenção de um layout limpo e baseado em grade com espaçamento consistente para facilitar a digestão das informações.

## Implantação e Configuração na Netly

1. Crie um novo site na Netly e conecte este repositório Git.
2. Configure o comando de build como `npm run build` e o diretório de publicação como `.next`.
3. Defina as variáveis de ambiente necessárias no painel da Netly.
4. Salve e acompanhe o processo de implantação pelo painel.