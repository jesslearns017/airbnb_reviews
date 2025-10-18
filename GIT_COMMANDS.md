# Git Commands Reference

## Initial Setup (First Time Only)

### 1. Initialize Git Repository
```bash
git init
```

### 2. Add Remote Repository
```bash
git remote add origin https://github.com/jesslearns017/airbnb_reviews.git
```

### 3. Verify Remote
```bash
git remote -v
```

## Committing Your Code

### 1. Check Status
```bash
git status
```

### 2. Add All Files
```bash
git add .
```

Or add specific files:
```bash
git add README.md
git add backend/app.py
```

### 3. Commit Changes
```bash
git commit -m "Initial commit: Airbnb sentiment analysis application"
```

### 4. Push to GitHub
```bash
git push -u origin main
```

Or if your default branch is master:
```bash
git push -u origin master
```

## Common Workflows

### Update Existing Code
```bash
git add .
git commit -m "Description of changes"
git push
```

### Pull Latest Changes
```bash
git pull origin main
```

### Create a New Branch
```bash
git checkout -b feature/new-feature
```

### Switch Branches
```bash
git checkout main
```

### Merge Branch
```bash
git checkout main
git merge feature/new-feature
```

### View Commit History
```bash
git log
```

Or for a compact view:
```bash
git log --oneline
```

## Useful Commands

### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

### Discard Local Changes
```bash
git checkout -- filename
```

### View Differences
```bash
git diff
```

### Remove File from Git (Keep Local)
```bash
git rm --cached filename
```

### Update .gitignore
After updating .gitignore:
```bash
git rm -r --cached .
git add .
git commit -m "Update .gitignore"
```

## First Push Checklist

Before pushing to GitHub for the first time:

- [ ] Ensure `reviews.csv` is in `.gitignore` (already done)
- [ ] Remove any sensitive information (API keys, passwords)
- [ ] Test that the application works
- [ ] Update README with accurate information
- [ ] Add LICENSE file (already done)

## Recommended First Commit

```bash
# Initialize repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Full-stack Airbnb sentiment analysis app

- Backend: Flask API with TextBlob sentiment analysis
- Frontend: React dashboard with visualizations
- Features: Dashboard, reviews browser, custom analyzer
- Dataset: Kaggle Airbnb reviews (not included in repo)"

# Add remote
git remote add origin https://github.com/jesslearns017/airbnb_reviews.git

# Push to GitHub
git push -u origin main
```

## Troubleshooting

### If you get "fatal: remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/jesslearns017/airbnb_reviews.git
```

### If you get authentication errors
Use a Personal Access Token (PAT) instead of password:
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with 'repo' scope
3. Use token as password when prompted

### If branch names don't match
```bash
# Rename local branch to main
git branch -M main

# Then push
git push -u origin main
```

## Best Practices

1. **Commit often** - Make small, focused commits
2. **Write clear messages** - Describe what and why
3. **Pull before push** - Always pull latest changes first
4. **Use branches** - For new features or experiments
5. **Review before commit** - Use `git status` and `git diff`

## Example Commit Messages

Good commit messages:
- ✅ "Add sentiment filter to reviews page"
- ✅ "Fix: Resolve pagination bug in API endpoint"
- ✅ "Update: Improve chart responsiveness on mobile"
- ✅ "Docs: Add installation instructions to README"

Avoid:
- ❌ "Update"
- ❌ "Fix stuff"
- ❌ "Changes"
