# Optional: Git Configuration Tips

If you haven't already, set up Git with your name and email:

```bash
# Configure Git globally (one time)
git config --global user.name "Your Son's Name"
git config --global user.email "email@example.com"

# Verify it worked
git config --list
```

## Useful Git Aliases (Optional)

Add these aliases to make Git easier:

```bash
# Add to ~/.gitconfig [alias] section
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'

# Then use:
git st          # instead of git status
git co -b name  # instead of git checkout -b name
```

## Pre-commit Hook (Optional)

To automatically run checks before each commit:

```bash
# Copy the example pre-commit hook
cp .github/pre-commit.example .git/hooks/pre-commit

# Make it executable
chmod +x .git/hooks/pre-commit
```

This will automatically lint and format code before commits!

## Useful Git Commands

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# See changes before committing
git diff

# See what's staged
git diff --staged

# Interactive rebase (clean up commits)
git rebase -i HEAD~3

# Stash work temporarily
git stash
git stash pop
```

## Resources

- [Pro Git Book](https://git-scm.com/book/en/v2)
- [Git Cheat Sheet](https://github.github.com/training-kit/downloads/github-git-cheat-sheet.pdf)
- [Atlassian Git Tutorials](https://www.atlassian.com/git)
