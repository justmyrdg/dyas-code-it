# DyasCodeIT

Gamified Coding Learning Platform with AI Teaching Assistant

## Quick Start

### Prerequisites
- Node.js 22.22+ or 24.13+
- PostgreSQL 14+

### Development

```bash
# Install dependencies
npm install

# Copy environment files
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env with your config

# Start dev servers (frontend & backend)
npm run dev

# Frontend: http://localhost:4200
# Backend: http://localhost:3000
```

### Project Structure

```
dyascodeit/
├── apps/
│   ├── frontend/          # Angular App
│   └── backend/           # Express API
├── shared/                # Shared types & models
└── package.json           # Monorepo config
```

## Tech Stack

- **Frontend**: Angular + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL
- **Auth**: OAuth2 (GitHub, Google)
- **AI**: Claude API
- **Design**: UNO Card Game Theme

## License

MIT

## Support

Documentation: Coming soon
Email: support@dyascodeit.com
