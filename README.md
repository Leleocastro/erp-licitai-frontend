# ERP Licitai - Frontend Web

Frontend Next.js do ERP governamental brasileiro Licitai.

## Stack

- **Next.js** 15 + **React** 19 + **TypeScript**
- **TailwindCSS** + **Shadcn/ui** (design system)
- **React Query** (TanStack) - gerenciamento de estado servidor
- **React Hook Form** + **Zod** - formularios
- **Playwright** + **Cucumber** (BDD) + **axe-core** (a11y)

## Estrutura

```
app/
├── (auth)/         # Rotas publicas (login)
└── (dashboard)/    # Rotas autenticadas por modulo
    ├── core/       # Usuarios, orgaos, roles, auditoria
    ├── gestao/     # Portal transparencia (fase 2)
    └── ...

components/
├── ui/             # Shadcn/ui components base
└── features/       # Componentes especificos por modulo

tests/
├── e2e/            # Playwright tests
└── features/       # Cucumber .feature files
```

## Convencao data-cy

```
data-cy='modulo-pagina-tipo-acao'

Exemplos:
  data-cy='core-login-btn-submit'
  data-cy='core-login-input-email'
  data-cy='core-usuarios-table-lista'
```

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Acesse http://localhost:3001

## Testes

```bash
npm run test:e2e    # Playwright E2E
npm run test:bdd    # Cucumber BDD
```
