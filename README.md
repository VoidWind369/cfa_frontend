# CFA — Clan Battle Points System

A management dashboard for the **Clan Battle Points (CFA)** system, built with React + TypeScript. Supports clan management, battle tracking, round scheduling, user administration, and public score queries.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3 + custom sakura theme
- **Routing**: React Router DOM v6
- **i18n**: i18next + react-i18next (zh_CN / zh_TW / en)
- **State**: Zustand
- **HTTP**: Axios + MessagePack
- **Icons**: lucide-react

## Features

- **Clan Management** — List, search, add, edit, delete clans; track server region (Global / China)
- **Battle Tracking** — Track win/lose/draw records with point history and reward changes; admin registration with first/last toggle
- **Round Scheduling** — Manage battle rounds; create rounds with manual or auto-fetched times
- **User Administration** — Manage users, roles, and status; login log with MessagePack decoding
- **Public Score Queries** — Look up clan scores by tag; reference compositions based on average town hall level
- **Operation Logs** — Review admin actions and reward types
- **Internationalization** — Full zh_CN / zh_TW / en support
- **Responsive** — Desktop sidebar navigation + mobile drawer menu with sticky headers and glass-morphism effects

## Quick Start

```bash
npm install
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Type-check + production build
npm run preview    # Preview production build
```

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `admin123` |

Actual accounts depend on the backend database.

## Project Structure

```
src/
├── api/              # Axios request layer + module APIs
├── store/            # Zustand user state (token, roles)
├── types/            # TypeScript type definitions
├── components/       # UI components (Card, Button, Badge, etc.) + DashboardLayout
├── contexts/         # Sidebar state context
├── pages/
│   ├── auth/         # Login
│   ├── dashboard/    # Home
│   ├── clan/         # Clan management, track records
│   ├── user/         # User management
│   ├── track/        # Battle records, rounds
│   ├── log/          # Operation & login logs
│   ├── settings/     # Profile, language, security
│   └── middle/       # Public score queries, reference comps
├── i18n.ts           # i18next config
├── locales.ts        # Translation dictionaries (zh_CN / zh_TW / en)
├── App.tsx           # Root component + routing + guards
└── index.css         # Global styles + Tailwind directives
```

## API Overview

All paginated endpoints follow the pattern `GET /orange/{resource}_{page}/{page_size}` and return `RestApi<Vec<T>>` with a `data_count` field.

| Resource | Endpoint | Access |
|----------|----------|--------|
| Clans | `GET /orange/clan_{page}/{page_size}` | Public |
| Clan Search | `POST /orange/clan_search` | Public |
| Battle Tracks | `GET /orange/track_{page}/{page_size}` | User |
| Rounds | `GET /orange/round_{page}/{page_size}` | User |
| Operation Logs | `GET /orange/operate_log_{page}/{page_size}` | Public |
| Login Logs | `GET /safety/login_log_{page}/{page_size}` | Public (MsgPack) |
| Users | `GET /system/user_{page}/{page_size}` | User |

Authentication uses dual tokens: `cfa*login*auth` for login, per-user JWT tokens for authenticated requests, and endpoint-specific tokens for public interfaces.

## Design System

**Sakura Cockpit** — a pink-toned, glass-morphism theme with subtle glow effects.

Key design tokens:
- **Primary**: `#D8688A` — rose pink
- **Surface**: Glass panels with `rgba(255,255,255,0.75)`
- **Text**: `#5B4455` — deep plum
- **Glow**: `#F472B6` — soft neon pink
- **Shadows**: Soft rose-tinted spread shadows
- **Border radius**: Custom `rounded-3xl` (1.25rem) and `rounded-4xl` (1.75rem)
- **Animations**: Fade, slide, pulse, float, glow, shake

## License

Internal project — not licensed for public use.
