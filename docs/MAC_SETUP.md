# Set up a Mac for Banana Wheels

Use Terminal or iTerm2. Run each block after the previous one succeeds.
The Homebrew installer may ask for the Mac administrator password in Terminal;
typing it shows no characters. Never put passwords or access tokens in chat.

## Tools

Install [Homebrew](https://docs.brew.sh/Installation) using its official command:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the installer's printed shell setup instructions. On an Apple Silicon Mac,
the prefix is `/opt/homebrew`. Then install the development tools:

```bash
brew install git gh node@24
brew install --cask iterm2
```

Follow `brew info node@24` to add its `bin` directory to your PATH, then open a
new terminal. This repo uses Node 24 LTS, recorded in `.node-version` for CI.
Node includes npm and npx: npm installs project dependencies, and npx runs
package commands. You do not use npx to bootstrap a missing Node installation.

```bash
git --version
gh --version
node --version
npm --version
npx --version
```

## GitHub sign-in and clone

```bash
gh auth login --hostname github.com --git-protocol https --web
gh auth setup-git
gh auth status
gh repo clone anythingisgoodforme/banana-wheels
cd banana-wheels
```

Complete GitHub's browser/device sign-in yourself. Use the intended repository
account; never share a token with the assistant. A public clone checks read
access; signing in and pushing a feature branch also checks write access.
If the repo is already on this Mac, open that folder instead of cloning over it.

Set an agreed commit name and the private noreply address shown in that GitHub
account's email settings. Repo-local settings keep other projects unaffected:

```bash
git config user.name "YOUR CHOSEN COMMIT NAME"
git config user.email "YOUR GITHUB NOREPLY ADDRESS"
npm ci
npm run dev
```

Visit `http://localhost:8000/`. Stop the server with Control-C.

## VS Code

Open this folder in VS Code. Install its recommended extensions (listed in
`.vscode/extensions.json`): ESLint catches JavaScript mistakes, Prettier formats
code, and GitHub Pull Requests lets you read and review changes. JavaScript,
HTML, CSS, Git, and debugging support are already built in. The repo's
`npm run dev` supplies the server, so another live-server extension is unnecessary.

To enable `code .`, open the Command Palette and choose **Shell Command:
Install 'code' command in PATH**. For an assistant already installed on this Mac,
sign in through its UI when needed.

## Make a game together

Copy [NEW_GAME_PROMPT.md](NEW_GAME_PROMPT.md), replace the idea, and start with
one fun action. Parent and learner can describe three things: what the player
does, what should feel fun, and what the learner wants to change themselves.
After a short playtest, give concrete feedback: “I couldn't tell why I crashed”
is more useful than “make it better.”

The repository's `AGENTS.md` asks assistants to make and push meaningful
checkpoints during active work and keep the helper current. It is not a scheduled
background backup. Assistants handle PRs for larger features as a review and
history trail. Focus together on trying features and giving feedback; Git and PR
lessons can wait until the learner or parent asks for them.
