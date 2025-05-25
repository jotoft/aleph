# Staging Deployment Guide

## Setup Complete! 🎉

Your staging deployment is now configured. Here's how it works:

### Deployment URLs
- **Production**: `https://[username].github.io/aleph/`
- **Staging**: `https://[username].github.io/aleph/staging/`

### How to Deploy

1. **Create a staging branch** (first time only):
   ```bash
   git checkout -b staging
   git push -u origin staging
   ```

2. **Deploy to staging**:
   ```bash
   git checkout staging
   git merge master  # or merge your feature branch
   git push origin staging
   ```

3. **Deploy to production**:
   ```bash
   git checkout master
   git merge staging  # after testing
   git push origin master
   ```

### What Was Created

1. **`.github/workflows/deploy-staging.yml`**: Staging deployment workflow
   - Triggers on pushes to `staging` branch
   - Builds with staging configuration
   - Deploys to `/aleph/staging/` subdirectory

2. **Updated `vite.config.ts`**: Now supports staging mode
   - Production: base = `/aleph/`
   - Staging: base = `/aleph/staging/`
   - Development: base = `/`

3. **`.env.staging`**: Staging environment variables

4. **Updated `package.json`**: Added staging scripts
   - `npm run build:staging`: Build for staging
   - `npm run preview:staging`: Preview staging build locally

### Testing Workflow

1. Make changes on a feature branch
2. Merge to `staging` branch
3. Wait for staging deployment (~2-3 minutes)
4. Test at staging URL
5. If everything works, merge to `master`

### Local Testing

To test the staging build locally:
```bash
npm run build:staging
npm run preview:staging
```

### Notes

- Both workflows can run independently
- Staging and production builds are isolated
- The staging build is accessible at `/aleph/staging/` path
- All assets and routing will work correctly with the staging base path