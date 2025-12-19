# KadeRadar 🎯

AI Engineer job aggregator for Singapore using Firecrawl scraping.

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh) (recommended) or Node.js 18+
- [Docker](https://www.docker.com/) and Docker Compose (for containerized setup)
- Firecrawl API key from [firecrawl.dev](https://firecrawl.dev)

### 1. Setup Environment

```bash
# Clone the repository
git clone <your-repo-url>
cd kaderadar

# Copy environment file
cp .env.example .env

# Edit .env and add your FIRECRAWL_API_KEY
```

### 2. Local Development (Without Docker)

```bash
# Install dependencies
bun install

# Run development servers (frontend + backend)
bun run dev

# Run linting
bun run lint
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/api/health

### 3. Docker Development

```bash
# Run in development mode with hot-reload
docker-compose -f docker-compose.dev.yml up --build

# Stop containers
docker-compose -f docker-compose.dev.yml down
```

### 4. Docker Production

```bash
# Build and run production containers
docker-compose up --build

# Stop containers
docker-compose down

# View logs
docker-compose logs -f
```

Access:
- Frontend: http://localhost
- Backend API: http://localhost:3001

## 📁 Project Structure

```
kaderadar/
├── apps/
│   ├── backend/          # Express API server
│   │   ├── src/
│   │   │   ├── app.ts
│   │   │   ├── server.ts
│   │   │   ├── db/       # SQLite database
│   │   │   ├── routes/   # API routes
│   │   │   ├── services/ # Business logic
│   │   │   └── types/    # TypeScript types
│   │   ├── Dockerfile
│   │   └── package.json
│   └── frontend/         # React + Vite SPA
│       ├── src/
│       │   ├── components/
│       │   ├── services/
│       │   └── types/
│       ├── Dockerfile
│       └── package.json
├── docker-compose.yml        # Production setup
├── docker-compose.dev.yml    # Development setup
└── package.json              # Workspace root
```

## 🛠️ Available Scripts

### Root Level
```bash
bun run dev              # Run both frontend and backend in dev mode
bun run dev:backend      # Run only backend
bun run dev:frontend     # Run only frontend
bun run build            # Build both apps
bun run lint             # Lint both apps
```

### Backend (apps/backend)
```bash
bun run dev              # Development with hot-reload
bun run build            # Build TypeScript
bun run start            # Start production server
bun run lint             # Run ESLint
bun run lint:fix         # Fix linting issues
```

### Frontend (apps/frontend)
```bash
bun run dev              # Development server
bun run build            # Production build
bun run lint             # Run ESLint
bun run preview          # Preview production build
```

## 🐳 Docker Commands

```bash
# Development mode (with hot-reload)
docker-compose -f docker-compose.dev.yml up --build

# Production mode
docker-compose up --build

# Stop all containers
docker-compose down

# View logs
docker-compose logs -f [backend|frontend]

# Rebuild a specific service
docker-compose build backend
docker-compose up -d backend

# Clean everything
docker-compose down -v  # Remove volumes too
```

## 🔧 API Endpoints

- `GET /api/health` - Health check
- `GET /api/jobs` - Get all active jobs
- `GET /api/jobs/search?q=query` - Search jobs
- `GET /api/jobs/stats` - Get job statistics
- `GET /api/jobs/:id` - Get specific job
- `POST /api/jobs/scrape` - Scrape all platforms
- `POST /api/jobs/scrape/:platform` - Scrape specific platform (linkedin|indeed)
- `DELETE /api/jobs/:id` - Soft delete a job

## 🐛 Troubleshooting

### Issue: `bun run dev` hangs/freezes PC

**Solution**: The issue was caused by mixing `bun` with `npm` workspace commands, creating multiple conflicting processes. This has been fixed in the updated scripts.

If you still experience issues:
1. Kill all Node/Bun processes: `pkill -f node && pkill -f bun`
2. Use Docker instead: `docker-compose -f docker-compose.dev.yml up`
3. Run services individually:
   ```bash
   # Terminal 1
   cd apps/backend && bun run dev
   
   # Terminal 2
   cd apps/frontend && bun run dev
   ```

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Docker Issues

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
FIRECRAWL_API_KEY=your_api_key_here
PORT=3001
NODE_ENV=development
```

## 🧪 Linting

Both frontend and backend have ESLint configured:

```bash
# Lint everything
bun run lint

# Lint with auto-fix
cd apps/backend && bun run lint:fix
cd apps/frontend && bun run lint
```

## 📦 Tech Stack

### Backend
- **Runtime**: Bun/Node.js
- **Framework**: Express
- **Database**: SQLite (better-sqlite3)
- **Scraping**: Firecrawl
- **Language**: TypeScript

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Language**: TypeScript

### DevOps
- **Containerization**: Docker & Docker Compose
- **Process Manager**: Concurrently
- **Linting**: ESLint 9
- **Web Server**: Nginx (production)

## 📄 License

MIT
