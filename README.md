# Ateliê Sueli Crochê — E-commerce B2C

Loja virtual oficial do **Ateliê Sueli Crochê** ([`@atelie_sueli_croche`](https://www.instagram.com/atelie_sueli_croche/)), construída em arquitetura moderna **Next.js 15 (App Router)**, gerenciada via **Yarn**, integrada ao **Supabase (`@supabase/ssr`)** com rotina dupla de *Keep-Alive*, **Google Analytics 4 Enhanced Ecommerce** e **SEO técnico completo para Google Search Console**.

## Stack Tecnológica

- **Framework**: Next.js 15 (App Router, SSR/ISR, Server Actions, Metadata API)
- **Gerenciador de Pacotes**: Yarn (`yarn.lock`)
- **Linguagem & UI**: TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide Icons
- **Backend & Auth**: Supabase (`@supabase/supabase-js` + `@supabase/ssr`)
- **Analytics & SEO**: `@next/third-parties/google` (GA4 + GTM + Consent Mode v2), Schema.org `JSON-LD`, Sitemap XML e Robots dinâmicos

## Como Rodar Localmente

1. Instale as dependências com **Yarn**:
   ```bash
   yarn install
   ```

2. Configure o arquivo `.env.local` (veja `.env.example` como referência):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://vaoxdmdoqtkbbkccmnxh.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

3. No painel do Supabase (**SQL Editor**), execute a migration inicial em:
   `supabase/migrations/20261124000001_init_ecommerce.sql`

4. Inicie o servidor de desenvolvimento:
   ```bash
   yarn dev
   ```

5. Valide tipagem e build de produção:
   ```bash
   yarn typecheck
   yarn build
   ```

## Rotina Anti-Pausa do Supabase (Keep-Alive)

- **Endpoint Next.js**: `GET /api/cron/keepalive` (acionado via Vercel Cron configurado em `vercel.json`).
- **GitHub Actions**: `.github/workflows/supabase-keepalive.yml` executa ping automático a cada 3 dias na RPC `public.ping_keepalive()`.
