# 🚨 URGENT: Remove Secrets from Git History

## Problem
Your previous commits contain exposed secrets in `appsettings.Development.json`. Even though we've removed them in the latest commit, they still exist in Git history.

## ⚠️ IMPORTANT: Rotate All Secrets First

Before cleaning Git history, **immediately rotate all exposed credentials**:

### 1. Google OAuth Credentials
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Navigate to **Credentials**
- Delete the exposed OAuth Client ID
- Create a new OAuth 2.0 Client ID
- Update your `.env` file with new credentials

### 2. Gmail App Password
- Go to [Google Account Security](https://myaccount.google.com/security)
- Go to **App passwords**
- Delete the old "NexApply" app password
- Generate a new app password
- Update your `.env` file

### 3. JWT Secret
- Generate a new random 64-character string
- Update `AppSettings__Token` in your `.env` file

### 4. Database Password (if needed)
- Change your PostgreSQL password
- Update `ConnectionStrings__DefaultConnection` in your `.env` file

---

## Solution: Clean Git History

You have two options:

### Option 1: Force Push (Recommended for Solo Projects)

This rewrites Git history to remove the commit with secrets:

```bash
# 1. Reset to the commit BEFORE the one with secrets
git reset --hard <commit-hash-before-secrets>

# 2. Re-apply the security changes
git cherry-pick 2fbc3dc

# 3. Force push to GitHub
git push origin master --force
```

**⚠️ Warning:** This will delete all commits after the reset point. Only use if you're the only developer.

---

### Option 2: BFG Repo-Cleaner (Recommended for Team Projects)

This removes secrets from all commits without losing history:

#### Step 1: Install BFG
Download from: https://rtyley.github.io/bfg-repo-cleaner/

#### Step 2: Create a file with secrets to remove
Create `secrets.txt` with the exposed values:
```
YOUR_EXPOSED_GOOGLE_CLIENT_ID
YOUR_EXPOSED_GOOGLE_CLIENT_SECRET
YOUR_EXPOSED_EMAIL_PASSWORD
YOUR_EXPOSED_EMAIL_ADDRESS
YOUR_EXPOSED_JWT_TOKEN
```

#### Step 3: Run BFG
```bash
# Clone a fresh copy
git clone --mirror https://github.com/Clinttttt/NexApply.git

# Run BFG to remove secrets
java -jar bfg.jar --replace-text secrets.txt NexApply.git

# Clean up
cd NexApply.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push cleaned history
git push --force
```

---

### Option 3: Delete and Recreate Repository (Nuclear Option)

If the above options are too complex:

1. **Download your code** (without .git folder)
2. **Delete the GitHub repository**
3. **Create a new repository**
4. **Push clean code:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit with secure configuration"
   git remote add origin https://github.com/Clinttttt/NexApply.git
   git push -u origin master
   ```

---

## Verify Secrets Are Removed

After cleaning, verify no secrets remain:

```bash
# Search for Google Client ID
git log -S "7329258126" --all

# Search for Client Secret
git log -S "GOCSPX-vqbWy6FodqonUdp" --all

# Should return no results
```

---

## Prevent Future Leaks

✅ **Already Done:**
- `.env` is gitignored
- `appsettings.Development.json` is gitignored
- Secrets moved to environment variables

✅ **Additional Protection:**
- Enable GitHub Secret Scanning (already detected the leak)
- Use pre-commit hooks to scan for secrets
- Never commit files with "secret", "password", "key" in content

---

## Current Status

✅ Latest commit is clean (no secrets)
❌ Previous commits still contain secrets in Git history
⚠️ **Action Required:** Choose one of the options above to clean history

---

## Need Help?

If you're unsure which option to choose:
- **Solo project, no collaborators:** Use Option 1 (Force Push)
- **Team project:** Use Option 2 (BFG)
- **Want fresh start:** Use Option 3 (Delete & Recreate)
