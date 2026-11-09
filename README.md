# 🍇 Açaí Express - Gestão Financeira, PDV & Delivery

Sistema completo e moderno para lojas de açaí, combinando vitrine para clientes, autoatendimento, operação de balcão e retaguarda financeira/cozinha.

---

## 🌟 Principais Funcionalidades

### 1. 🛍️ Vitrine Interativa & Montador de Copos
* Montagem visual do copo de açaí camada por camada em tempo real.
* Seleção de tamanhos (300ml, 500ml, 700ml), bases de açaí e complementos por categorias (Frutas, Cremes, Crocantes, Caldas e Especiais).
* Modo lojista para edição ao vivo de textos, preços e fotos na vitrine.
* Carrinho dinâmico e checkout integrado.

### 2. 🏪 Modo Balcão (PDV Presencial)
* Interface rápida para atendimento no caixa físico sem cobrança de frete.
* Identificação por Nome, Mesa ou Comanda sem exigir cadastro de cliente.
* Geração de comanda imediata para produção.

### 3. 🖥️ Totem de Autoatendimento (Kiosk)
* Interface de autoatendimento touch-friendly em tela cheia.
* Pagamento no Totem via PIX (QR Code na tela) ou Cartão.
* Geração automática de senhas sequenciais em destaque gigante (ex: `#TOTEM-104`).
* Contagem regressiva para reiniciar a tela automaticamente para o próximo cliente da fila.

### 4. 🖨️ Impressão Automática de Comandas
* Integração direta com impressoras térmicas (58mm e 80mm) e impressoras padrão.
* Disparo automático da comanda assim que qualquer pedido (Delivery, Balcão ou Totem) é confirmado.

### 5. 💬 Chat do Pedido em Tempo Real
* Canal de comunicação direto entre lojista e cliente vinculado ao pedido.
* Sugestões de respostas rápidas para o atendente e cliente.
* Sincronização em nuvem e persistência local.

### 6. 📊 Gestão Financeira & DRE
* Fluxo de caixa em tempo real com conciliação automática das vendas.
* Registro de despesas operacionais (insumos, embalagens, motoboy, aluguel).
* DRE simplificado e acompanhamento de metas mensais.
* Kanban da cozinha com colunas de produção: Novos, Na Cozinha, Em Entrega e Concluídos.

### 7. 🔒 Segurança & Controle de Acesso (RBAC)
* Super Admin inalienável: Arlei (`arleisilverio41@gmail.com`).
* Painel Master para cadastrar e gerenciar lojistas e gerentes autorizados.
* Políticas de Row Level Security (RLS) blindadas no PostgreSQL/Supabase.

---

## 🛠️ Tecnologias Utilizadas

* **React 19** + **TypeScript**
* **Vite**
* **Tailwind CSS**
* **Lucide React** (Ícones)
* **Framer Motion** (Animações)
* **Supabase** (PostgreSQL, Auth e Realtime)
* **Canvas Confetti**

---

## 🚀 Como Executar o Projeto

1. Clone o repositório:
   ```bash
   git clone https://github.com/Arleisilverio/acai-horts.git
   cd acai-horts
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente no arquivo `.env`:
   ```env
   VITE_SUPABASE_URL=sua_url_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_supabase
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Para gerar a versão de produção:
   ```bash
   npm run build
   ```
