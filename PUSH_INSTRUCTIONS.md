# ALAYA INSIDER — Git Push Instructions (Updated 2026-06-17)

**Target:** https://github.com/giri843136-cmd/ARENA-ALAYA-INSIDER.git

## Current Local State (Ready to Push)

| Metric | Value |
|--------|-------|
| Branch | `main` |
| Latest commit | `debe7a3a974d08f47f80ac8e8231e4a49e149cf8` |
| Commit message | `fix: move BulkConfirmModal outside component, fix hoisting bug, update push docs` |
| Commits ahead of origin | **11** (see below) |
| Tracked files | **592** |
| Source files (.ts/.tsx/.js/.jsx) | **406** |
| Folders (unique paths) | **283** |
| Remote URL | `https://github.com/giri843136-cmd/ARENA-ALAYA-INSIDER.git` |

**Recent commits (in order, oldest → newest):**
1. `cd2c843` — Complete ALAYA INSIDER: Storybook fix, 85 new tests, WCAG AAA
2. `7382c6f` — fix: typecheck script, add .env.example, fix .gitignore
3. `eaaf28d` — fix: Prisma v7 adapter compatibility
4. `086c762` — chore: add deploy.py to .gitignore
5. `3224147` — chore: add initial Prisma migration SQL (2,132 lines)
6. `a63a3ab` — fix: add baseUrl to tsconfig for @/* path alias resolution
7. `07a4157` — fix: add webpack alias for @ in next.config.ts to fix path resolution on Hostinger
8. `ca6b31b` — fix: add react-is dependency (peer dep required by recharts)
9. `ceb45fc` — fix: move typescript and @types packages to dependencies (NODE_ENV=production skips devDeps)
10. `ec7678a` — fix: skip TypeScript checking during build (storybook types in devDeps not installed)
11. `debe7a3` — fix: move BulkConfirmModal outside component, fix hoisting bug, update push docs

**No .env, node_modules, .next, or other forbidden files in the index** — all properly gitignored.

**Note:** Archived build artifacts (.tar.gz, .zip) are untracked and gitignored — they will NOT be pushed.

---

## Step-by-Step Push Instructions

### Step 1: Get the project on your local machine

**Option A — Copy from this sandbox (recommended):**
If you have direct filesystem access to this sandbox at `C:\Users\rocki\Downloads\workspace-019ebb86-c6f6-7e2b-bff6-e03ad83125ed`, copy the entire folder to your machine. It already has the full Git repo with all commits.

**Option B — Use the source tarball:**
The file `alaya-insider-source.tar.gz` in the workspace contains all source files. Extract and init git:
```bash
tar -xzf alaya-insider-source.tar.gz
cd alaya-insider
```

### Step 2: Open terminal in the project folder
```bash
cd /path/to/alaya-insider-project   # where app/, lib/, prisma/ etc. are
```

### Step 3: Generate a GitHub Personal Access Token
1. Go to https://github.com/settings/tokens/new
2. Give it a name (e.g. "Alaya Insider Push")
3. Select scopes: **`repo`** (full control) + **`workflow`**
4. Click "Generate token"
5. **Copy the token now** — you won't see it again

### Step 4: Configure the remote (copy-paste these one at a time)

```bash
# Remove any existing origin
git remote remove origin 2>/dev/null || true

# Set the correct remote
git remote add origin https://github.com/giri843136-cmd/ARENA-ALAYA-INSIDER.git

# Verify
git remote -v
```

### Step 5: Authenticate with your PAT

**Recommended — use credential helper (only prompted once):**
```bash
git config --global credential.helper store
```
Then when you push, use:
- Username: `giri843136-cmd`
- Password: **paste your PAT** (not your GitHub password)

**Alternative — inline token URL (one-time):**
```bash
git remote set-url origin https://giri843136-cmd:YOUR_PAT_HERE@github.com/giri843136-cmd/ARENA-ALAYA-INSIDER.git
```

### Step 6: Push to GitHub
```bash
# Ensure we're on main
git branch -M main

# Sync with remote (keep local version as authoritative)
git fetch origin
git pull origin main --allow-unrelated-histories --strategy=recursive -X ours 2>/dev/null || echo "No remote content to pull"

# THE MAIN COMMAND — force push the complete repo
git push -u origin main --force
```

### Step 7: Verify the push

Run these commands to confirm everything was pushed correctly:

```bash
echo "=== VERIFICATION ==="
echo "Branch: $(git branch --show-current)"
echo "Commit: $(git rev-parse HEAD)"
echo "Remote: $(git remote get-url origin)"
echo ""
echo "Tracked files: $(git ls-files | wc -l)"
echo "Source files: $(git ls-files | grep -E '\.(ts|tsx|js|jsx)$' | wc -l)"
echo "Folders: $(git ls-tree -r --name-only HEAD | grep -o '.*/' | sort -u | wc -l)"
echo ""
echo "Forbidden items (must be 0): $(git ls-files | grep -E '(\.next/|node_modules/|\.cache/|\.npm/|dist/|coverage/|\.turbo/|\.env[^.])' | wc -l)"
echo ""
echo "Key production files:"
git ls-files | grep -E 'prisma/schema.prisma|scripts/deploy-to-hostinger.sh|lib/config/env.ts|workers/index.ts|nginx.conf|ecosystem.config.js|Dockerfile|docker-compose.yml|\.github/workflows' | sort
echo ""
echo "Top-level folders:"
git ls-tree -r --name-only HEAD | grep -o '^[a-zA-Z0-9_.-]*/' | sort -u
echo ""
echo "Open: https://github.com/giri843136-cmd/ARENA-ALAYA-INSIDER"
echo "Verify: 592 files, 283 folders, latest commit debe7a3, all folders present"
```

### Step 8: Confirm on GitHub

Visit **https://github.com/giri843136-cmd/ARENA-ALAYA-INSIDER** in your browser.

You should see:
- **592 files** across **283 folders**
- **17 top-level folders**: .github/, .storybook/, agents/, api/, app/, apps/, components/, docs/, infra/, lib/, prisma/, public/, runbooks/, scripts/, sdk/, tests/, workers/
- Latest commit: `debe7a3` — "fix: move BulkConfirmModal outside component, fix hoisting bug, update push docs"
- Full commit history (all 11 production commits)
- **No** node_modules, .next, .env, or cache folders

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Authentication failed` | PAT might have wrong scopes. Regenerate at https://github.com/settings/tokens with **repo** scope |
| `Repository not found` | Double-check the remote URL is exactly `https://github.com/giri843136-cmd/ARENA-ALAYA-INSIDER.git` — the repo must already exist |
| `Push declined` | Use `--force` flag: `git push -u origin main --force` |
| `Filename too long` on Windows | Run `git config --global core.longpaths true` and retry |
| PAT doesn't work as password | Generate a new PAT. The token itself IS the password (not your GitHub password) |

---

After successful push, the entire ALAYA INSIDER production platform is on GitHub. You can then clone it anywhere, continue development, and deploy from the remote.

