# DyasCodeIT - Quick Start Guide

## 🚀 Project Setup (Monorepo with NX)

### Prerequisites
- Node.js 22.22+ or 24.13+ (Angular 22 requires this; Node 18 is no longer supported)
- npm 9+
- Git
- PostgreSQL 14+ (local or cloud)

### Step 1: Create Monorepo Structure

```bash
# Create project directory
mkdir dyascodeit
cd dyascodeit

# Initialize git
git init
git config user.email "your-email@example.com"
git config user.name "Your Name"

# Initialize npm monorepo
npm init -y

# Install NX CLI (Monorepo tool)
npm install -D nx

# Install root dependencies
npm install typescript

# Create directory structure
mkdir -p apps/frontend apps/backend shared
```

### Step 2: Setup Backend (Express + TypeScript)

```bash
cd apps/backend

# Initialize package.json for backend
npm init -y

# Install dependencies
npm install express cors helmet dotenv jsonwebtoken bcryptjs axios socket.io pg sequelize stripe

# Install dev dependencies
npm install -D typescript ts-node @types/express @types/node nodemon

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Create .env.example
cat > .env.example << 'EOF'
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dyascodeit

# Auth
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=7d

# OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret

# Claude/OpenAI for Dyas
CLAUDE_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_key

# Frontend URL
FRONTEND_URL=http://localhost:4200

# Email
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_key
EOF

# Create nodemon.json
cat > nodemon.json << 'EOF'
{
  "watch": ["src"],
  "ext": "ts",
  "ignore": ["src/**/*.spec.ts"],
  "exec": "ts-node",
  "env": {
    "NODE_ENV": "development"
  }
}
EOF

# Update package.json scripts
cat > package.json << 'EOF'
{
  "name": "dyascodeit-backend",
  "version": "1.0.0",
  "description": "DyasCodeIT Backend API",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.1.0",
    "bcryptjs": "^2.4.3",
    "axios": "^1.6.0",
    "socket.io": "^4.7.1",
    "pg": "^8.11.0",
    "sequelize": "^6.33.0",
    "stripe": "^13.10.0"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "ts-node": "^10.9.1",
    "@types/express": "^4.17.20",
    "@types/node": "^20.8.0",
    "nodemon": "^3.0.1"
  }
}
EOF

# Create src directory structure
mkdir -p src/{routes,controllers,models,services,middleware,utils,config}

# Create main app.ts
cat > src/app.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Routes will go here

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
    },
  });
});

export default app;
EOF

# Create server.ts
cat > src/server.ts << 'EOF'
import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`DyasCodeIT API running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
EOF

cd ../..
```

### Step 3: Setup Frontend (Angular + Tailwind)

Angular doesn't ship with Tailwind pre-configured, but `ng add` automates the setup. Since Angular 17, Tailwind has moved to v4, which replaces `tailwind.config.js` with CSS-first configuration (a `@theme` block) — there's no `content` array to maintain either, since v4 detects template files automatically.

```bash
cd apps/frontend

# Install Angular CLI globally (if not already installed)
npm install -g @angular/cli

# Create new Angular app
ng new . --skip-git --routing --style=css --package-manager=npm

# Add Tailwind CSS v4 (installs deps, wires up PostCSS/build config automatically)
ng add tailwindcss

# Update src/styles.css: import Tailwind, define UNO design tokens, and component classes
cat > src/styles.css << 'EOF'
@import "tailwindcss";

@theme {
  --color-uno-red: #FF4444;
  --color-uno-yellow: #FFD700;
  --color-uno-blue: #0066FF;
  --color-uno-green: #00AA44;
  --radius-uno: 24px;
}

/* UNO Card Component Styles */
@layer components {
  .uno-card {
    @apply rounded-2xl shadow-lg overflow-hidden border-2 border-black cursor-pointer transition-all hover:shadow-xl hover:scale-105;
  }

  .uno-card-red { @apply bg-red-600 text-white; }
  .uno-card-yellow { @apply bg-yellow-400 text-gray-900; }
  .uno-card-blue { @apply bg-blue-600 text-white; }
  .uno-card-green { @apply bg-green-600 text-white; }
  .uno-card-black { @apply bg-gray-900 text-white; }

  .uno-card-header {
    @apply px-6 py-4 border-b-2 border-black font-bold text-xl flex justify-between items-center;
  }

  .uno-card-body {
    @apply px-6 py-4 min-h-32;
  }

  .uno-card-footer {
    @apply px-6 py-4 border-t-2 border-black bg-opacity-80;
  }

  .uno-card-badge {
    @apply inline-block px-3 py-1 rounded-full bg-white text-gray-900 font-bold text-xs;
  }

  .uno-btn-primary {
    @apply px-6 py-3 rounded-xl bg-red-600 text-white font-bold border-2 border-black shadow-md hover:shadow-lg hover:scale-105 transition-all active:scale-95;
  }

  .uno-btn-secondary {
    @apply px-6 py-3 rounded-xl bg-blue-600 text-white font-bold border-2 border-black shadow-md hover:shadow-lg hover:scale-105 transition-all;
  }

  .uno-btn-success {
    @apply px-6 py-3 rounded-xl bg-green-600 text-white font-bold border-2 border-black shadow-md hover:shadow-lg hover:scale-105 transition-all;
  }

  .uno-btn-outline {
    @apply px-6 py-3 rounded-xl bg-white text-gray-900 font-bold border-2 border-black shadow-md hover:shadow-lg transition-all;
  }

  .uno-grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6;
  }
}
EOF

# Create environment files
mkdir -p src/environments

cat > src/environments/environment.ts << 'EOF'
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
EOF

cat > src/environments/environment.prod.ts << 'EOF'
export const environment = {
  production: true,
  apiUrl: 'https://api.dyascodeit.com/api',
};
EOF

cd ../..
```

### Step 4: Setup Shared (Shared Types & Models)

```bash
cd shared

# Create package.json
cat > package.json << 'EOF'
{
  "name": "@dyascodeit/shared",
  "version": "1.0.0",
  "description": "Shared types and models",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch"
  }
}
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Create src directory
mkdir -p src/{models,types}

# Create index.ts
cat > src/index.ts << 'EOF'
export * from './models';
export * from './types';
EOF

# Create basic models
cat > src/models/index.ts << 'EOF'
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  createdAt: Date;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  adminId: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
}

export interface Class {
  id: string;
  topicId: string;
  teacherId: string;
  name: string;
  classCode: string;
  maxStudents: number;
  createdAt: Date;
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  content: string;
  order: number;
  createdAt: Date;
}

export interface Certificate {
  id: string;
  studentId: string;
  classId: string;
  topicId: string;
  certificateCode: string;
  qrCodeUrl: string;
  issuedDate: Date;
  pdfUrl: string;
  status: 'active' | 'revoked';
}
EOF

cd ..
```

### Step 5: Root Setup

```bash
# Update root package.json
cat > package.json << 'EOF'
{
  "name": "dyascodeit",
  "version": "1.0.0",
  "description": "DyasCodeIT - Gamified Coding Learning Platform",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev -w apps/backend\" \"npm run dev -w apps/frontend\"",
    "dev:backend": "npm run dev -w apps/backend",
    "dev:frontend": "npm run dev -w apps/frontend",
    "build": "npm run build -w apps/backend && npm run build -w apps/frontend",
    "start": "npm start -w apps/backend"
  },
  "workspaces": [
    "apps/backend",
    "apps/frontend",
    "shared"
  ],
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
EOF

# Create root .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Production
/dist
/build
/out

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Angular
/apps/frontend/dist/
/apps/frontend/.angular/

# Coverage
/coverage/
EOF

# Create root README
cat > README.md << 'EOF'
# DyasCodeIT

🎮 Gamified Coding Learning Platform with AI Teaching Assistant

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

- **Frontend**: Angular 22 + Tailwind CSS
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
EOF

# Install root dependencies
npm install
```

### Step 6: Start Development

```bash
# From root directory
npm run dev

# Or individually:
npm run dev:backend   # Terminal 1
npm run dev:frontend  # Terminal 2
```

**Expected Output**:
```
Frontend: http://localhost:4200
Backend: http://localhost:3000
```

---

## 📝 Next Steps After Setup

### 1. Create Database
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE dyascodeit;

-- Create user (optional)
CREATE USER dyascodeit WITH PASSWORD 'your_password';
ALTER ROLE dyascodeit SET client_encoding TO 'utf8';
ALTER ROLE dyascodeit SET default_transaction_isolation TO 'read committed';
ALTER ROLE dyascodeit SET default_transaction_deferrable TO on;
ALTER ROLE dyascodeit SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE dyascodeit TO dyascodeit;
```

### 2. Setup OAuth Apps

**GitHub OAuth**:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Copy Client ID and Secret to `.env`

**Google OAuth**:
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Copy credentials to `.env`

### 3. Setup Stripe (for payments)

1. Create Stripe account
2. Get Secret Key
3. Add to `.env`

### 4. Get Claude/OpenAI API Key

For Dyas AI:
1. Create account at Claude.ai or OpenAI
2. Generate API key
3. Add to `.env`

---

## 🎨 First Component: Landing Page

Create `apps/frontend/src/app/components/landing/landing.component.ts`:

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent {}
```

See `DyasCodeIT_LANDING_PAGE.md` for HTML structure.

---

## 🚀 Deployment

See `DyasCodeIT_ARCHITECTURE.md` for deployment options.

---

## 📚 Resources

- [Angular Docs](https://angular.io/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express.js](https://expressjs.com/)
- [Sequelize ORM](https://sequelize.org/)

---

**Status**: ✅ Ready to Code!
