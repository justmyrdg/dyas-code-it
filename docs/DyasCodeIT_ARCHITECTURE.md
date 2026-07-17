# DyasCodeIT - Tech Architecture & Design System

## 🎮 Project Overview
**Name**: DyasCodeIT
**Theme**: UNO Card Game (bold colors, card-based UI, playful yet professional)
**Stack**: Angular + Express.js (Mono Repo)
**Design**: Tailwind CSS (no emoji)
**Infrastructure**: No Docker (direct Node.js deployment)

---

## 🏗️ Project Structure (Monorepo)

```
dyascodeit/
├── apps/
│   ├── frontend/                    # Angular Application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── components/
│   │   │   │   │   ├── landing/
│   │   │   │   │   ├── lesson-viewer/
│   │   │   │   │   ├── code-editor/
│   │   │   │   │   ├── activity-board/
│   │   │   │   │   ├── dyas-chat/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   └── practice-sandbox/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── home/
│   │   │   │   │   ├── class-enrollment/
│   │   │   │   │   ├── learning/
│   │   │   │   │   └── admin/
│   │   │   │   ├── services/
│   │   │   │   │   ├── api.service.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── dyas.service.ts
│   │   │   │   │   └── code-execution.service.ts
│   │   │   │   ├── guards/
│   │   │   │   │   ├── auth.guard.ts
│   │   │   │   │   └── role.guard.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   └── auth.interceptor.ts
│   │   │   │   ├── models/
│   │   │   │   └── app.component.ts
│   │   │   ├── styles/
│   │   │   │   ├── tailwind.css
│   │   │   │   ├── variables.css
│   │   │   │   └── themes.css
│   │   │   ├── assets/
│   │   │   │   ├── images/
│   │   │   │   ├── icons/
│   │   │   │   └── fonts/
│   │   │   ├── index.html
│   │   │   └── main.ts
│   │   ├── angular.json
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── backend/                     # Express.js Server
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth.routes.ts
│       │   │   ├── curriculum.routes.ts
│       │   │   ├── classes.routes.ts
│       │   │   ├── activities.routes.ts
│       │   │   ├── assessments.routes.ts
│       │   │   ├── dyas.routes.ts
│       │   │   ├── projects.routes.ts
│       │   │   └── code-execution.routes.ts
│       │   ├── controllers/
│       │   │   ├── auth.controller.ts
│       │   │   ├── curriculum.controller.ts
│       │   │   ├── dyas.controller.ts
│       │   │   └── [other controllers]
│       │   ├── models/
│       │   │   ├── User.ts
│       │   │   ├── Topic.ts
│       │   │   ├── Class.ts
│       │   │   ├── Lesson.ts
│       │   │   ├── DyasConversation.ts
│       │   │   └── [other models]
│       │   ├── services/
│       │   │   ├── auth.service.ts
│       │   │   ├── dyas.service.ts
│       │   │   ├── code-executor.service.ts
│       │   │   ├── plagiarism.service.ts
│       │   │   └── [other services]
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts
│       │   │   ├── error-handler.ts
│       │   │   ├── rate-limiter.ts
│       │   │   └── cheating-detector.ts
│       │   ├── utils/
│       │   │   ├── stripe-client.ts
│       │   │   ├── oauth.ts
│       │   │   └── logger.ts
│       │   ├── config/
│       │   │   ├── database.ts
│       │   │   ├── env.ts
│       │   │   └── constants.ts
│       │   ├── app.ts
│       │   └── server.ts
│       ├── .env
│       ├── .env.example
│       ├── tsconfig.json
│       ├── package.json
│       └── nodemon.json
│
├── shared/                          # Shared Types & Models
│   ├── src/
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   ├── curriculum.model.ts
│   │   │   ├── class.model.ts
│   │   │   ├── dyas.model.ts
│   │   │   └── [other shared models]
│   │   └── types/
│   │       ├── auth.types.ts
│   │       ├── api.types.ts
│   │       └── [other types]
│   └── package.json
│
├── package.json                     # Root package.json
├── tsconfig.json                    # Root TypeScript config
├── nx.json                          # NX Config (for monorepo)
├── .gitignore
├── README.md
└── DEPLOYMENT.md
```

---

## 🎨 UNO Design System

### Color Palette (UNO-Inspired)

**Primary Colors** (Card Colors):
```css
--uno-red: #FF4444;      /* 50% opacity active state */
--uno-yellow: #FFD700;   /* Gold/Yellow cards */
--uno-blue: #0066FF;     /* Blue cards */
--uno-green: #00AA44;    /* Green cards */
--uno-black: #222222;    /* Dark/Black for action cards */
```

**Supporting Colors**:
```css
--primary-bg: #FFFFFF;   /* White background */
--secondary-bg: #F5F5F5; /* Light gray for sections */
--tertiary-bg: #E8E8E8;  /* Darker gray for contrast */
--text-primary: #1A1A1A; /* Main text */
--text-secondary: #666666; /* Secondary text */
--text-light: #999999;   /* Light text */
--border-color: #DDDDDD; /* Borders */
--success: #00AA44;      /* Green (same as UNO green) */
--warning: #FFD700;      /* Yellow (same as UNO yellow) */
--error: #FF4444;        /* Red (same as UNO red) */
--info: #0066FF;         /* Blue (same as UNO blue) */
```

### Typography

**Font Stack**:
```css
font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
```

**Font Sizes**:
```
- H1 (Page Title): 48px, weight 700
- H2 (Section Title): 36px, weight 700
- H3 (Subsection): 24px, weight 600
- H4 (Card Title): 20px, weight 600
- Body Large: 16px, weight 400
- Body Regular: 14px, weight 400
- Body Small: 12px, weight 400
- Button: 14px, weight 600
- Label: 12px, weight 600
```

### Card Component (Core UNO Element)

**Card Structure**:
```html
<div class="uno-card uno-card-blue">
  <!-- Colored background with card-specific color -->
  <div class="uno-card-header">
    <span class="uno-card-title">Lesson Title</span>
    <span class="uno-card-badge">Blue</span>
  </div>
  <div class="uno-card-body">
    <!-- Content here -->
  </div>
  <div class="uno-card-footer">
    <button class="uno-btn-primary">Action</button>
  </div>
</div>
```

**Tailwind Classes for UNO Cards**:
```tailwind
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
```

### Button Components

```tailwind
/* Primary Button (UNO Style) */
.uno-btn-primary {
  @apply px-6 py-3 rounded-xl bg-red-600 text-white font-bold border-2 border-black shadow-md hover:shadow-lg hover:scale-105 transition-all active:scale-95;
}

/* Secondary Button */
.uno-btn-secondary {
  @apply px-6 py-3 rounded-xl bg-blue-600 text-white font-bold border-2 border-black shadow-md hover:shadow-lg hover:scale-105 transition-all;
}

/* Success Button (Green) */
.uno-btn-success {
  @apply px-6 py-3 rounded-xl bg-green-600 text-white font-bold border-2 border-black shadow-md hover:shadow-lg hover:scale-105 transition-all;
}

/* Action Button (Yellow - Draw/Skip) */
.uno-btn-action {
  @apply px-6 py-3 rounded-xl bg-yellow-400 text-gray-900 font-bold border-2 border-black shadow-md hover:shadow-lg hover:scale-105 transition-all;
}

/* Outline Button */
.uno-btn-outline {
  @apply px-6 py-3 rounded-xl bg-white text-gray-900 font-bold border-2 border-black shadow-md hover:shadow-lg transition-all;
}
```

### Layout Components

**Header/Navigation**:
```tailwind
.uno-header {
  @apply bg-white border-b-4 border-black shadow-lg;
}

.uno-nav {
  @apply flex items-center justify-between px-6 py-4;
}

.uno-logo {
  @apply text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-yellow-400 to-blue-600;
}
```

**Card Grid Layout**:
```tailwind
.uno-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6;
}
```

---

## ⚙️ Tech Stack Details

### Frontend (Angular)

**Dependencies**:
```json
{
  "dependencies": {
    "@angular/animations": "^22.0.0",
    "@angular/common": "^22.0.0",
    "@angular/compiler": "^22.0.0",
    "@angular/core": "^22.0.0",
    "@angular/forms": "^22.0.0",
    "@angular/platform-browser": "^22.0.0",
    "@angular/platform-browser-dynamic": "^22.0.0",
    "@angular/router": "^22.0.0",
    "axios": "^1.6.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "ngx-markdown": "^22.0.0",
    "highlight.js": "^11.8.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^22.0.0",
    "@angular/cli": "^22.0.0",
    "@angular/compiler-cli": "^22.0.0",
    "typescript": "~6.0.0"
  }
}
```

**Key Features**:
- Standalone components (no modules)
- Signal-based state management
- Route-based lazy loading
- Service-based architecture
- Interceptors for auth & API calls

### Backend (Express.js)

**Dependencies**:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "typescript": "^5.2.0",
    "ts-node": "^10.9.1",
    "dotenv": "^16.3.1",
    "postgresql": "^0.0.1",
    "sequelize": "^6.33.0",
    "jsonwebtoken": "^9.1.0",
    "bcryptjs": "^2.4.3",
    "stripe": "^13.10.0",
    "axios": "^1.6.0",
    "socket.io": "^4.7.1",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^7.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.20",
    "@types/node": "^20.8.0",
    "nodemon": "^3.0.1"
  }
}
```

**Key Features**:
- RESTful API
- WebSocket for real-time (Dyas chat)
- PostgreSQL with Sequelize ORM
- JWT authentication
- Stripe integration
- Express middleware pipeline

### Database (PostgreSQL)

**ORM**: Sequelize (TypeScript)

**Key Tables**:
- users
- topics
- chapters
- lessons
- code_examples
- mini_activities
- chapter_assessments
- classes
- class_enrollments
- student_progress
- activity_submissions
- assessment_submissions
- dyas_conversations
- practice_projects
- project_versions
- certificates
- teacher_subscriptions

---

## 🚀 Deployment (No Docker)

### Backend Server Setup

**Option 1: Direct Node.js on Linux Server**
```bash
# SSH into server
ssh user@your-server.com

# Clone repo
git clone https://github.com/yourusername/dyascodeit.git
cd dyascodeit/apps/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with production values

# Build TypeScript
npm run build

# Start with PM2 (process manager)
npm install -g pm2
pm2 start dist/server.js --name dyascodeit-api
pm2 save
pm2 startup

# OR start directly
npm start
```

**Option 2: Heroku Deployment**
```bash
# Login to Heroku
heroku login

# Create app
heroku create dyascodeit-api

# Set environment variables
heroku config:set DATABASE_URL=your_db_url
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

**Option 3: AWS EC2**
```bash
# Launch EC2 instance (Ubuntu 22.04)
# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Rest same as Option 1
```

### Frontend Deployment (Angular)

**Build for Production**:
```bash
cd apps/frontend
ng build --configuration production
```

**Deploy to Static Host**:
```bash
# Option 1: Netlify
npm run build
netlify deploy --prod --dir=dist/browser

# Option 2: Vercel
vercel --prod

# Option 3: AWS S3 + CloudFront
aws s3 sync dist/browser s3://your-bucket --delete
```

**Or serve from same Express server**:
```typescript
// In backend express.ts
app.use(express.static('../frontend/dist/browser'));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/browser/index.html'));
});
```

---

## 🔐 Authentication Flow

**OAuth2 with GitHub/Google**:
```
1. User clicks "Sign in with GitHub"
2. Redirects to: https://github.com/login/oauth/authorize?client_id=...
3. GitHub redirects back with code
4. Backend exchanges code for token
5. Backend creates/updates user in DB
6. Backend generates JWT
7. Frontend stores JWT in localStorage
8. All API calls include JWT in Authorization header
```

**JWT Payload**:
```json
{
  "userId": "uuid",
  "email": "student@example.com",
  "role": "student",
  "classIds": ["class-1", "class-2"],
  "iat": 1234567890,
  "exp": 1234571490
}
```

---

## 📱 Landing Page Structure

### Hero Section
- Large UNO-styled headline
- Color blocks (Red, Yellow, Blue, Green)
- Call-to-action button
- Student/Teacher toggle

### Features Section
- 4 feature cards (different UNO colors)
- Icons (no emoji)
- Short descriptions

### How It Works Section
- Step-by-step cards
- 1. Create Class (Red)
- 2. Share Code (Yellow)
- 3. Learn Together (Blue)
- 4. Get Certificate (Green)

### Pricing Section
- Free vs Premium (UNO card style)
- Feature comparison table

### Testimonials Section
- Student testimonial card (Yellow)
- Teacher testimonial card (Blue)

### Footer
- Links
- Social
- Copyright

---

## 🛣️ API Endpoints Overview

### Auth
- `POST /api/auth/github` - GitHub OAuth
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Curriculum (Admin)
- `POST /api/topics` - Create topic
- `GET /api/topics` - List topics
- `POST /api/chapters` - Create chapter
- `POST /api/lessons` - Create lesson
- `POST /api/activities` - Create activity

### Classes (Teacher)
- `POST /api/classes` - Create class
- `GET /api/classes` - List teacher's classes
- `GET /api/classes/:id/students` - Get enrolled students
- `GET /api/classes/:id/progress` - Get class progress

### Learning (Student)
- `POST /api/classes/join` - Join class with code
- `GET /api/lessons/:id` - Get lesson content
- `POST /api/activities/:id/submit` - Submit activity
- `POST /api/assessments/:id/submit` - Submit assessment

### Dyas AI
- `POST /api/dyas/chat` - Send message to Dyas
- `GET /api/dyas/history` - Get conversation history
- `GET /api/dyas/profile` - Get learning profile

### Code Execution
- `POST /api/code/execute` - Execute code
- `GET /api/code/languages` - List supported languages

### Practice Projects
- `POST /api/projects` - Create project
- `POST /api/projects/:id/versions` - Create version
- `GET /api/projects/:id/versions` - Get version history

### Certificates
- `GET /api/certificates/:id` - Get certificate
- `GET /api/certificates/:id/verify` - Verify QR code

---

## 🚦 Development Workflow

### Setup Local Environment

```bash
# Clone repo
git clone https://github.com/yourusername/dyascodeit.git
cd dyascodeit

# Install dependencies
npm install

# Setup .env
cp apps/backend/.env.example apps/backend/.env

# Start backend
cd apps/backend
npm run dev

# In another terminal, start frontend
cd apps/frontend
ng serve

# Frontend: http://localhost:4200
# Backend: http://localhost:3000
```

### Running Tests

```bash
# Backend tests
cd apps/backend
npm test

# Frontend tests
cd apps/frontend
ng test
```

### Build for Production

```bash
# Backend
cd apps/backend
npm run build

# Frontend
cd apps/frontend
ng build --configuration production
```

---

## 📊 Development Timeline

- **Phase 1 (Weeks 1-4)**: Setup, Landing Page, Auth
- **Phase 2 (Weeks 5-8)**: Core Learning Features
- **Phase 3 (Weeks 9-12)**: Dyas AI Integration
- **Phase 4 (Weeks 13-16)**: Practice Sandbox
- **Phase 5 (Weeks 17-20)**: Polish & Deployment

---

**Project Name**: DyasCodeIT
**Theme**: UNO Card Game
**Status**: Ready for Development
