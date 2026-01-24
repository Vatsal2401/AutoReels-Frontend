# Vercel Deployment Setup Guide

## Step 1: Create a New Vercel Project

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. **Import your GitHub repository:**
   - Select: `Vatsal2401/AI-GEN-REELS-FRONTEND`
   - Or click "Import" and search for your repo
4. **Configure project settings:**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: Leave empty (or `./` if deploying from monorepo root)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm ci` (default)
5. Click **"Deploy"**
6. After deployment, go to **Project Settings** → **General**
7. Copy the **"Project ID"** and **"Team ID"** (Organization ID)

### Option B: Via Vercel CLI (Local)

```bash
cd frontend
npm install -g vercel
vercel login
vercel link
# Follow prompts to create new project or link existing
```

After linking, check `.vercel/project.json` for Project ID and Org ID.

## Step 2: Get Required Values

After creating the project, you need:

1. **VERCEL_TOKEN**
   - Go to: https://vercel.com/account/tokens
   - Click "Create Token"
   - Copy the token

2. **VERCEL_ORG_ID** (Team/Organization ID)
   - Go to your project: https://vercel.com/dashboard
   - Project Settings → General
   - Look for "Team" or "Organization"
   - Copy the ID (or check your team settings)

3. **VERCEL_PROJECT_ID**
   - Same page: Project Settings → General
   - Copy the "Project ID"

## Step 3: Add GitHub Secrets

1. Go to your GitHub repository: `Vatsal2401/AI-GEN-REELS-FRONTEND`
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these three secrets:
   - `VERCEL_TOKEN` = Your Vercel access token
   - `VERCEL_ORG_ID` = Your organization/team ID
   - `VERCEL_PROJECT_ID` = Your new project ID

## Step 4: Push to Trigger Deployment

Once secrets are added, push to `master` or `main` branch:

```bash
git add .github/workflows/deploy-vercel.yml
git commit -m "Add Vercel deployment workflow"
git push origin master
```

The GitHub Actions workflow will automatically:
1. Run linting and type checking
2. Build and deploy to Vercel production

## Troubleshooting

- **Project not found**: Make sure `VERCEL_PROJECT_ID` matches your project
- **Authentication failed**: Verify `VERCEL_TOKEN` is valid
- **Org ID mismatch**: Check `VERCEL_ORG_ID` matches your team/organization
