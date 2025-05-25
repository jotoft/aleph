# Deploying to GitHub Pages

## Option 1: GitHub Actions (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin master
   ```

2. **Enable GitHub Pages in your repository**:
   - Go to your repo on GitHub
   - Settings → Pages
   - Source: Select "GitHub Actions"

3. **The workflow will automatically**:
   - Build your app on every push to master
   - Deploy to: https://[your-username].github.io/aleph/

## Option 2: Manual Deployment

1. **Update base path** in `vite.config.ts`:
   ```typescript
   base: '/your-repo-name/',
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Deploy using gh-pages package**:
   ```bash
   npm install --save-dev gh-pages
   ```

   Add to `package.json` scripts:
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```

   Then run:
   ```bash
   npm run deploy
   ```

## Important Notes

- The `base` path in `vite.config.ts` must match your repository name
- If your repo is named `persian-app`, use `base: '/persian-app/'`
- For custom domains, create a `CNAME` file in the `public` folder
- The site will be available at: https://[username].github.io/[repo-name]/

## Troubleshooting

- **404 errors**: Check that the `base` path matches your repo name
- **Blank page**: Ensure you're using the correct URL with the repo name
- **Build failures**: Check GitHub Actions tab for error logs