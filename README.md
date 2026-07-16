# 🎵 Paixão Music

Sistema proprietário de gerenciamento e reprodução de videoclipes pessoais —
não é um clone do YouTube Music. Suporta reprodução em modo **Vídeo** e
**Apenas Áudio** a partir do mesmo arquivo MP4.

Este pacote contém o **esqueleto arquitetural completo** do projeto: estrutura
de pastas, schema de banco de dados, camada de Storage Provider desacoplada,
stores, repositories, services e as primeiras telas (Home, Painel de
Importação). É a fundação sobre a qual cada módulo do Readme original será
implementado nas próximas etapas.

## 1. Instalar dependências

```bash
npm install
```

## 2. Configurar o Supabase

As credenciais já estão em `.env.local` (URL + anon key do seu projeto:
`mgfpqnamjknnttdhimtn`). Você ainda precisa preencher duas coisas:

1. **Service Role Key** — em `Supabase Dashboard > Project Settings > API >
   service_role` — cole em `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`. É
   usada apenas em rotas de servidor (pipeline de importação), nunca exposta
   ao navegador.
2. **Credenciais do Archive.org** (se for fazer upload real de vídeos) — gere
   em `https://archive.org/account/s3.php` e preencha
   `ARCHIVE_ORG_ACCESS_KEY` / `ARCHIVE_ORG_SECRET_KEY`.

Depois, aplique o schema no seu projeto Supabase:

```bash
npx supabase login
npx supabase link --project-ref mgfpqnamjknnttdhimtn
npx supabase db push   # aplica supabase/migrations/0001_init.sql
```

Isso cria todas as tabelas (`artists`, `albums`, `songs`, `videos`, `genres`,
`favorites`, `history`, `playlists`, `playlist_items`, `ratings`, `devices`,
`settings`, `storage_provider`, `profiles`), com RLS habilitada em 100% delas.

Depois de aplicar, gere os tipos reais do banco (substitui o placeholder em
`types/supabase.ts`):

```bash
npm run db:types
```

## 3. Rodar o projeto

```bash
npm run dev
```

Abra `http://localhost:3000`.

## ⚠️ Sobre o link do logotipo

O link do logotipo que você enviou (`raw.githubusercontent.com/.../logopaixaomusic.png?token=...`)
inclui um **token de acesso temporário** do GitHub — esse tipo de token expira
rapidamente (geralmente em minutos/horas). Ele já está referenciado em
`components/layout/sidebar.tsx`, mas quando expirar a imagem vai parar de
carregar. O ideal é:

1. Baixar o arquivo `logopaixaomusic.png` e colocá-lo em `public/logo.png`
   (arquivo local, sem token, sem expiração).
2. Trocar a referência em `sidebar.tsx` de uma URL remota para `/logo.png`.

Isso também elimina a dependência de um repositório privado do GitHub para
carregar um asset estático do próprio app.

## O que já está pronto

- ✅ Estrutura de pastas modular (`/app`, `/components`, `/features`,
  `/services`, `/repositories`, `/hooks`, `/lib`, `/types`, `/utils`,
  `/providers`, `/store`)
- ✅ Schema completo do banco (13 tabelas + view `continue_watching`),
  normalizado, com RLS
- ✅ Camada **Storage Provider** desacoplada (`lib/storage`), com
  `ArchiveOrgProvider` implementado e pronto para trocar de provedor sem
  reescrever o resto do sistema
- ✅ Clientes Supabase (browser, server, service role)
- ✅ Repository Pattern (`repositories/songs.repository.ts`) + exemplo de
  Service Layer (`services/smart-shuffle.service.ts` — o algoritmo de Shuffle
  Inteligente descrito no Readme)
- ✅ Store global do player (Zustand) com toggle Vídeo/Áudio, shuffle,
  repeat, fila
- ✅ Design system (Tailwind) com identidade visual própria — paleta
  "ink + paixão crimson + dourado de vinil", tipografia Fraunces/Manrope/IBM
  Plex Mono, e o "sprocket divider" (perfuração de película) como elemento
  de assinatura
- ✅ Homepage com estado vazio (onboarding para importar) e trilhos de
  biblioteca
- ✅ Painel de importação (esqueleto de UI)
- ✅ Rota de streaming desacoplada (`/api/stream/[id]`) que nunca fala
  diretamente com o provider

## Próximos passos sugeridos

1. **Pipeline de importação real** (`features/import`): varredura recursiva
   de pastas, extração de metadados com `music-metadata`, upload em lote
2. **Player de vídeo/áudio** (`features/player`): componente `<video>` com
   toggle de exibição, Media Session API (tela bloqueada, Android Auto),
   gapless/crossfade
3. **Páginas de Artista e Álbum**
4. **Busca instantânea** (`features/search`)
5. **Estatísticas e Dashboard** (`features/stats`)
6. **Android Auto / Smart TV**: layouts alternativos por `useMediaQuery` +
   Media Session API

Me diga qual desses módulos você quer que eu desenvolva a seguir.
