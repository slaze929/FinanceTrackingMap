# Vite + React Project

A modern React application built with Vite, ready for collaborative development and deployment.

## Quick Start

### First Time Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:5173` to see your app.

## Collaborative Development with Git

### Initial Setup (Project Owner)

1. **Create a GitHub repository**
   - Go to GitHub and create a new repository
   - Copy the repository URL

2. **Push this project to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

### Setup for Collaborator

1. **Clone the repository (ONE TIME ONLY)**
   ```bash
   git clone <repo-url>
   cd <project-folder>
   npm install
   ```

### Daily Workflow (Both People)

```bash
# 1. BEFORE starting work - get latest changes
git pull

# 2. Make your changes to files...

# 3. Save your changes
git add .
git commit -m "Describe what you changed"
git push

# 4. The other person runs "git pull" to get your changes
```

### Tips for Collaboration
- Always `git pull` before starting work
- Commit and push frequently
- Use descriptive commit messages
- If you edit different files, Git merges automatically
- If you edit the same file, Git will ask you to resolve conflicts

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "New Project" and select your repository
4. Vercel will auto-detect Vite settings (already configured in `vercel.json`)
5. Click "Deploy"

**Auto-deployment**: Every push to `main` branch automatically deploys to Vercel

### Deploy to Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) and sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect settings (configured in `railway.json`)
6. Click "Deploy"

**Auto-deployment**: Every push to `main` branch automatically deploys to Railway

## Project Structure

```
├── src/
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── assets/          # Images, styles, etc.
├── public/              # Static files
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── vercel.json          # Vercel deployment config
└── railway.json         # Railway deployment config
```

## Tech Stack

- **React** - UI library
- **Vite** - Build tool and dev server
- **ESLint** - Code linting
- **Git** - Version control
- **Vercel/Railway** - Deployment platforms
