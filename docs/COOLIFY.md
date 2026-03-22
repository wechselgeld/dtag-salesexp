# Coolify Deployment Guide

This project is optimized for deployment on Coolify.

## Prerequisites

1. A **PostgreSQL** database (Coolify provides this easily).
2. A **Redis** (Dragonfly) instance for caching.
3. Environment variables configured in Coolify.

## Coolify Configuration

### 🐳 Build Strategy

- **Service Type**: Static or Proxy (use Proxy for Next.js).
- **Build Pack**: `Dockerfile` (Select this manually in Coolify settings).
- **Dockerfile Path**: `./Dockerfile` (default).

### 🔑 Environment Variables

Add these in the Coolify "Environment Variables" section:

- `DATABASE_URL`: Your PostgreSQL connection string.
- `REDIS_URL`: Your Redis/Dragonfly connection string.
- `NEXTAUTH_SECRET`: A random string for auth.
- `NEXT_PUBLIC_APP_URL`: The URL where the app is hosted.

### 🚄 Performance Tips

- **Standalone Mode**: Already enabled in `next.config.ts`. This reduces image size from ~1GB to ~150MB.
- **Image Optimization**: If you use many images, Coolify's server might need `sharp`. It's included in the build process if listed in `package.json`.

## 🔧 Maintenance

- **Prisma Migrations**: Coolify doesn't run `prisma migrate deploy` automatically. You should add it to your "Pre-deployment command" in Coolify:
  ```bash
  npx prisma migrate deploy
  ```
- **Health Check**:
  - Path: `/` or `/api/health`
  - Port: `3000`
