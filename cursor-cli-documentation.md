# Cursor CLI Documentation

> Source: https://cursor.com/docs/cli/
> Captured: February 5, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Using Agent in CLI](#using-agent-in-cli)
4. [Shell Mode](#shell-mode)
5. [MCP](#mcp)
6. [Using Headless CLI](#using-headless-cli)
7. [GitHub Actions](#github-actions)
8. [Cookbook: Code Review](#cookbook-code-review)
9. [Cookbook: Update Docs](#cookbook-update-docs)
10. [Cookbook: Fix CI Failures](#cookbook-fix-ci-failures)
11. [Cookbook: Secret Audit](#cookbook-secret-audit)
12. [Cookbook: Translate Keys](#cookbook-translate-keys)
13. [Reference: Slash Commands](#reference-slash-commands)
14. [Reference: Parameters](#reference-parameters)
15. [Reference: Authentication](#reference-authentication)
16. [Reference: Permissions](#reference-permissions)
17. [Reference: Configuration](#reference-configuration)
18. [Reference: Output Format](#reference-output-format)
19. [Reference: Terminal Setup](#reference-terminal-setup)

---

## Overview

Cursor CLI lets you interact with AI agents directly from your terminal to write, review, and modify code. Whether you prefer an interactive terminal interface or print automation for scripts and CI pipelines, the CLI provides powerful coding assistance right where you work.

### Getting started

```bash
# Install (macOS, Linux, WSL)
curl https://cursor.com/install -fsS | bash

# Install (Windows PowerShell)
irm 'https://cursor.com/install?win32=true' | iex

# Run interactive session
agent
```

### Interactive mode

Start a conversational session with the agent to describe your goals, review proposed changes, and approve commands:

```bash
# Start interactive session
agent

# Start with initial prompt
agent "refactor the auth module to use JWT tokens"
```

### Modes

The CLI supports the same modes as the editor. Switch between modes using slash commands, keyboard shortcuts, or the `--mode` flag.

| Mode | Description | Shortcut |
|------|-------------|----------|
| **Agent** | Full access to all tools for complex coding tasks | Default |
| **Plan** | Design your approach before coding with clarifying questions | Shift+Tab, `/plan`, `--mode=plan` |
| **Ask** | Read-only exploration without making changes | `/ask`, `--mode=ask` |

### Non-interactive mode

Use print mode for non-interactive scenarios like scripts, CI pipelines, or automation:

```bash
# Run with specific prompt and model
agent -p "find and fix performance issues" --model "gpt-5.2"

# Use with git changes included for review
agent -p "review these changes for security issues" --output-format text
```

### Cloud Agent handoff

Push your conversation to a Cloud Agent to continue running while you're away. Prepend `&` to any message:

```bash
# Send a task to Cloud Agent
& refactor the auth module and add comprehensive tests
```

Pick up your Cloud Agent tasks on web or mobile at [cursor.com/agents](https://cursor.com/agents).

### Sessions

Resume previous conversations to maintain context across multiple interactions:

```bash
# List all previous chats
agent ls

# Resume latest conversation
agent resume

# Resume specific conversation
agent --resume="chat-id-here"
```

### Sandbox controls

Configure command execution settings with `/sandbox`. Toggle sandbox mode on or off and control network access through an interactive menu. Settings persist across sessions.

### Max mode

Toggle max mode on models that support it using `/max-mode [on|off]`.

### Sudo password prompting

Run commands requiring elevated privileges without leaving the CLI. When a command needs `sudo`, Cursor displays a secure, masked password prompt. Your password flows directly to `sudo` via a secure IPC channel; the AI model never sees it.

---

## Installation

### macOS, Linux and Windows (WSL)

Install Cursor CLI with a single command:

```bash
curl https://cursor.com/install -fsS | bash
```

### Windows (native)

Install Cursor CLI on Windows using PowerShell:

```powershell
irm 'https://cursor.com/install?win32=true' | iex
```

### Verification

After installation, verify that Cursor CLI is working correctly:

```bash
agent --version
```

### Post-installation setup

1. **Add ~/.local/bin to your PATH:**

   For bash:
   ```bash
   echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
   source ~/.bashrc
   ```

   For zsh:
   ```bash
   echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

2. **Start using Cursor Agent:**
   ```bash
   agent
   ```

### Updates

Cursor CLI will try to auto-update by default to ensure you always have the latest version.

To manually update Cursor CLI to the latest version:

```bash
agent update
# or
agent upgrade
```

Both commands will update Cursor Agent to the latest version.

---

## Using Agent in CLI

### Modes

The CLI supports the same modes as the editor. Switch modes using slash commands or the `--mode` flag.

#### Plan mode

Use Plan mode to design your approach before coding. The agent asks clarifying questions to refine your plan.

- Press Shift+Tab to rotate to Plan mode
- Use `/plan` to switch to Plan mode
- Start with `--mode=plan` flag

#### Ask mode

Use Ask mode to explore code without making changes. The agent searches your codebase and provides answers without editing files.

- Use `/ask` to switch to Ask mode
- Start with `--mode=ask` flag

### Prompting

Stating intent clearly is recommended for the best results. For example, you can use the prompt "do not write any code" to ensure that the agent won't edit any files. This is generally helpful when planning tasks before implementing them.

Agent has tools for file operations, searching, running shell commands, and web access.

### MCP

Agent supports MCP (Model Context Protocol) for extended functionality and integrations. The CLI will automatically detect and respect your `mcp.json` configuration file, enabling the same MCP servers and tools that you've configured for the editor.

### Rules

The CLI agent supports the same rules system as the editor. You can create rules in the `.cursor/rules` directory to provide context and guidance to the agent. These rules will be automatically loaded and applied based on their configuration, allowing you to customize the agent's behavior for different parts of your project or specific file types.

The CLI also reads `AGENTS.md` and `CLAUDE.md` at the project root (if present) and applies them as rules alongside `.cursor/rules`.

### Working with Agent

#### Navigation

Previous messages can be accessed using arrow up (↑) where you can cycle through them.

#### Input shortcuts

- **Shift+Tab** — Rotate between modes (Agent, Plan, Ask)
- **Shift+Enter** — Insert a newline instead of submitting, making it easier to write multi-line prompts.
- **Ctrl+D** — Exit the CLI. Follows standard shell behavior, requiring a double-press to exit.
- **Ctrl+J** or **+Enter** — Universal alternatives for inserting newlines that work in all terminals.

Shift+Enter works in iTerm2, Ghostty, Kitty, Warp, and Zed. For tmux users, use Ctrl+J instead.

#### Review

Review changes with Ctrl+R. Press i to add follow-up instructions. Use ↑/↓ to scroll, and ←/→ to switch files.

#### Selecting context

Select files and folders to include in context with @. Free up space in the context window by running `/compress`.

### Cloud Agent handoff

Push your conversation to a Cloud Agent and let it keep running while you're away. Prepend `&` to any message to send it to the cloud, then pick it back up on web or mobile at cursor.com/agents.

```bash
# Send a task to Cloud Agent
& refactor the auth module and add comprehensive tests
```

### History

Continue from an existing thread with `--resume [thread id]` to load prior context.

To resume the most recent conversation, use `agent resume` or the `/resume` slash command.

You can also run `agent ls` to see a list of previous conversations.

### Command approval

Before running terminal commands, CLI will ask you to approve (y) or reject (n) execution.

### Non-interactive mode

Use `-p` or `--print` to run Agent in non-interactive mode. This will print the response to the console.

With non-interactive mode, you can invoke Agent in a non-interactive way. This allows you to integrate it in scripts, CI pipelines, etc.

You can combine this with `--output-format` to control how the output is formatted. For example, use `--output-format json` for structured output that's easier to parse in scripts, or `--output-format text` for plain text output of the agent's final response.

> Cursor has full write access in non-interactive mode.

---

## Shell Mode

Shell Mode runs shell commands directly from the CLI without leaving your conversation. Use it for quick, non-interactive commands with safety checks and output displayed in the conversation.

### Command execution

Commands run in your login shell (`$SHELL`) with the CLI's working directory and environment. Chain commands to run in other directories:

```bash
cd subdir && npm test
```

### Output

Large outputs are truncated automatically and long-running processes timeout to maintain performance.

### Limitations

- Commands timeout after 30 seconds
- Long-running processes, servers, and interactive prompts are not supported
- Use short, non-interactive commands for best results

### Permissions

Commands are checked against your permissions and team settings before execution.

Admin policies may block certain commands, and commands with redirection cannot be allowlisted inline.

### Usage guidelines

Shell Mode works well for status checks, quick builds, file operations, and environment inspection.

Avoid long-running servers, interactive applications, and commands requiring input.

Each command runs independently - use `cd <dir> && ...` to run commands in other directories.

### Troubleshooting

- If a command hangs, cancel with Ctrl+C and add non-interactive flags
- When prompted for permissions, approve once or add to allowlist with Tab
- For truncated output, use Ctrl+O to expand
- To run in different directories, use `cd <dir> && ...` since changes don't persist
- Shell Mode supports zsh and bash from your `$SHELL` variable

### FAQ

- **Does `cd` persist across runs?** No
- **Can I change the timeout?** No
- **Where are permissions configured?** See Permissions reference
- **How do I exit Shell Mode?** Type exit or use Ctrl+D

---

## MCP

### Overview

The Cursor CLI supports Model Context Protocol (MCP) servers, allowing you to connect external tools and data sources to `agent`. **MCP in the CLI uses the same configuration as the editor** - any MCP servers you've configured will work with both.

### CLI commands

Use the `agent mcp` command to manage MCP servers

#### List configured servers

View all configured MCP servers and their current status:

```bash
agent mcp list
```

This opens an interactive menu where you can browse, enable, and configure MCP servers at a glance. The list shows:

- Server names and identifiers
- Connection status (connected/disconnected)
- Configuration source (project or global)
- Transport method (stdio, HTTP, SSE)

You can also use the `/mcp list` slash command in interactive mode for the same interface.

#### List available tools

View tools provided by a specific MCP server:

```bash
agent mcp list-tools <identifier>
```

This displays:

- Tool names and descriptions
- Required and optional parameters
- Parameter types and constraints

#### Login to MCP server

Authenticate with an MCP server configured in your `mcp.json`:

```bash
agent mcp login <identifier>
```

The CLI uses a streamlined login flow with automatic callback handling. The agent gets access to authenticated MCPs immediately after login completes.

#### Enable MCP server

Enable an MCP server:

```bash
agent mcp enable <identifier>
```

You can also use the `/mcp enable <name>` slash command in interactive mode.

#### Disable MCP server

Disable an MCP server:

```bash
agent mcp disable <identifier>
```

You can also use the `/mcp disable <name>` slash command in interactive mode.

> MCP server names with spaces are supported in all `/mcp` commands.

### Using MCP with Agent

Once you have MCP servers configured, `agent` automatically discovers and uses available tools when relevant to your requests.

```bash
# Check what MCP servers are available
agent mcp list

# See what tools a specific server provides
agent mcp list-tools playwright

# Use agent - it automatically uses MCP tools when helpful
agent -p "Navigate to google.com and take a screenshot of the search page"
```

The CLI follows the same configuration precedence as the editor (project → global → nested), automatically discovering configurations from parent directories.

---

## Using Headless CLI

Use Cursor CLI in scripts and automation workflows for code analysis, generation, and refactoring tasks.

### How it works

Use print mode (`-p, --print`) for non-interactive scripting and automation.

#### File modification in scripts

Combine `--print` with `--force` to modify files in scripts:

```bash
# Enable file modifications in print mode
agent -p --force "Refactor this code to use modern ES6+ syntax"

# Without --force, changes are only proposed, not applied
agent -p "Add JSDoc comments to this file"  # Won't modify files

# Batch processing with actual file changes
find src/ -name "*.js" | while read file; do
  agent -p --force "Add comprehensive JSDoc comments to $file"
done
```

> The `--force` flag allows the agent to make direct file changes without confirmation

### Setup

See Installation and Authentication for complete setup details.

```bash
# Install Cursor CLI (macOS, Linux, WSL)
curl https://cursor.com/install -fsS | bash

# Install Cursor CLI (Windows PowerShell)
irm 'https://cursor.com/install?win32=true' | iex

# Set API key for scripts
export CURSOR_API_KEY=your_api_key_here
agent -p "Analyze this code"
```

### Example scripts

Use different output formats for different script needs.

#### Searching the codebase

By default, `--print` uses `text` format for clean, final-answer-only responses:

```bash
#!/bin/bash
# Simple codebase question - uses text format by default
agent -p "What does this codebase do?"
```

#### Automated code review

Use `--output-format json` for structured analysis:

```bash
#!/bin/bash
# simple-code-review.sh - Basic code review script

echo "Starting code review..."

# Review recent changes
agent -p --force --output-format text \
  "Review the recent code changes and provide feedback on:
   - Code quality and readability
   - Potential bugs or issues
   - Security considerations
   - Best practices compliance
   Provide specific suggestions for improvement and write to review.txt"

if [ $? -eq 0 ]; then
  echo "✅ Code review completed successfully"
else
  echo "❌ Code review failed"
  exit 1
fi
```

#### Real-time progress tracking

Use `--output-format stream-json` for message-level progress tracking, or add `--stream-partial-output` for incremental streaming of deltas.

### Working with images

To send images, media files, or other binary data to the agent, include file paths in your prompts. The agent can read any files through tool calling, including images, videos, and other formats.

#### Including file paths in prompts

Simply reference file paths in your prompt text. The agent will automatically read the files when needed:

```bash
# Analyze an image
agent -p "Analyze this image and describe what you see: ./screenshot.png"

# Process multiple media files
agent -p "Compare these two images and identify differences: ./before.png ./after.png"

# Combine file paths with text instructions
agent -p "Review the code in src/app.ts and the design mockup in designs/homepage.png. Suggest improvements to match the design."
```

#### How it works

When you include file paths in your prompt:

1. The agent receives your prompt with the file path references
2. The agent uses tool calling to read the files automatically
3. Images are handled transparently
4. You can reference files using relative or absolute paths

#### Example: Image analysis script

```bash
#!/bin/bash
# analyze-image.sh - Analyze images using the headless CLI

IMAGE_PATH="./screenshots/ui-mockup.png"

agent -p --output-format json \
  "Analyze this image and provide a detailed description: $IMAGE_PATH" | \
  jq -r '.result'
```

#### Example: Batch media processing

```bash
#!/bin/bash
# process-media.sh - Process multiple media files

for image in images/*.png; do
  echo "Processing $image..."
  agent -p --output-format text \
    "Describe what's in this image: $image" > "${image%.png}.description.txt"
done
```

> File paths can be relative to the current working directory or absolute paths. The agent will read files through tool calls, so ensure the files exist and are accessible from where you run the command.

---

## GitHub Actions

Use Cursor CLI in GitHub Actions and other CI/CD systems to automate development tasks.

### GitHub Actions integration

Basic setup:

```yaml
- name: Install Cursor CLI
  run: |
    curl https://cursor.com/install -fsS | bash
    echo "$HOME/.cursor/bin" >> $GITHUB_PATH

- name: Run Cursor Agent
  env:
    CURSOR_API_KEY: ${{ secrets.CURSOR_API_KEY }}
  run: |
    agent -p "Your prompt here" --model gpt-5.2
```

For Windows runners, use PowerShell: `irm 'https://cursor.com/install?win32=true' | iex`

### Cookbook examples

See our cookbook examples for practical workflows: updating documentation and fixing CI issues.

### Other CI systems

Use Cursor CLI in any CI/CD system with:

- **Shell script execution** (bash, zsh, etc.)
- **Environment variables** for API key configuration
- **Internet connectivity** to reach Cursor's API

### Autonomy levels

Choose your agent's autonomy level:

#### Full autonomy approach

Give the agent complete control over git operations, API calls, and external interactions. Simpler setup, requires more trust.

```yaml
- name: Update docs (full autonomy)
  run: |
    agent -p "You have full access to git, GitHub CLI, and PR operations.
    Handle the entire docs update workflow including commits, pushes, and PR comments."
```

#### Restricted autonomy approach

Limit agent operations while handling critical steps in separate workflow steps. Better control and predictability.

```yaml
- name: Generate docs updates (restricted)
  run: |
    agent -p "IMPORTANT: Do NOT create branches, commit, push, or post PR comments.
    Only modify files in the working directory. A later workflow step handles publishing."

- name: Publish docs branch (deterministic)
  run: |
    # Deterministic git operations handled by CI
    git checkout -B "docs/${{ github.head_ref }}"
    git add -A
    git commit -m "docs: update for PR"
    git push origin "docs/${{ github.head_ref }}"

- name: Post PR comment (deterministic)
  run: |
    # Deterministic PR commenting handled by CI
    gh pr comment ${{ github.event.pull_request.number }} --body "Docs updated"
```

#### Permission-based restrictions

Use permission configurations to enforce restrictions at the CLI level:

```json
{
  "permissions": {
    "allow": [
      "Read(**/*.md)",
      "Write(docs/**/*)",
      "Shell(grep)",
      "Shell(find)"
    ],
    "deny": [
      "Shell(git)",
      "Shell(gh)",
      "Write(.env*)",
      "Write(package.json)"
    ]
  }
}
```

### Authentication

#### Generate your API key

First, generate an API key from your Cursor dashboard.

#### Configure repository secrets

Store your Cursor API key securely in your repository using the GitHub CLI:

```bash
# Repository secret
gh secret set CURSOR_API_KEY --repo OWNER/REPO --body "$CURSOR_API_KEY"

# Organization secret (all repos)
gh secret set CURSOR_API_KEY --org ORG --visibility all --body "$CURSOR_API_KEY"
```

Alternatively, use the GitHub UI: Go to your repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

#### Use in workflows

Set your `CURSOR_API_KEY` environment variable:

```yaml
env:
  CURSOR_API_KEY: ${{ secrets.CURSOR_API_KEY }}
```

---

## Cookbook: Code Review

This tutorial shows you how to set up code review using Cursor CLI in GitHub Actions. The workflow will analyze pull requests, identify issues, and post feedback as comments.

> For most users, we recommend using Bugbot instead. Bugbot provides managed automated code review with no setup required. This CLI approach is useful to explore capabilities and for advanced customization.

### Configure authentication

Set up your API key and repository secrets to authenticate Cursor CLI in GitHub Actions.

### Set up agent permissions

Create a configuration file to control what actions the agent can perform. This prevents unintended operations like pushing code or creating pull requests.

Create `.cursor/cli.json` in your repository root:

```json
{
  "permissions": {
    "deny": [
      "Shell(git push)",
      "Shell(gh pr create)",
      "Write(**)"
    ]
  }
}
```

This configuration allows the agent to read files and use the GitHub CLI for comments, but prevents it from making changes to your repository.

### Build the GitHub Actions workflow

#### Set up the workflow trigger

Create `.github/workflows/cursor-code-review.yml` and configure it to run on pull requests:

```yaml
name: Cursor Code Review

on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

jobs:
  code-review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
```

#### Checkout the repository

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
  with:
    fetch-depth: 0
    ref: ${{ github.event.pull_request.head.sha }}
```

#### Install Cursor CLI

```yaml
- name: Install Cursor CLI
  run: |
    curl https://cursor.com/install -fsS | bash
    echo "$HOME/.cursor/bin" >> $GITHUB_PATH
```

#### Configure the review agent

```yaml
- name: Perform code review
  env:
    CURSOR_API_KEY: ${{ secrets.CURSOR_API_KEY }}
    GH_TOKEN: ${{ github.token }}
  run: |
    agent --force --model "$MODEL" --output-format=text --print "You are operating in a GitHub Actions runner performing automated code review...
    
    Context:
    - Repo: ${{ github.repository }}
    - PR Number: ${{ github.event.pull_request.number }}
    - PR Head SHA: ${{ github.event.pull_request.head.sha }}
    - PR Base SHA: ${{ github.event.pull_request.base.sha }}
    
    Objectives:
    1) Re-check existing review comments and reply resolved when addressed
    2) Review the current PR diff and flag only clear, high-severity issues
    3) Leave very short inline comments (1-2 sentences) on changed lines only and a brief summary at the end
    
    Commenting rules:
    - Max 10 inline comments total; prioritize the most critical issues
    - One issue per comment; place on the exact changed line
    - Use emojis: 🚨Critical 🔒Security ⚡Performance ⚠️Logic ✅Resolved ✨Improvement
    
    Submission:
    - Submit one review containing inline comments plus a concise summary
    - Use only: gh pr review --comment
    - Do not use: gh pr review --approve or --request-changes"
```

---

## Cookbook: Update Docs

Update documentation using Cursor CLI in GitHub Actions. Two approaches: full agent autonomy or deterministic workflow with agent-only file modifications.

**Example: `.github/workflows/update-docs.yml`**

```yaml
name: Update Docs

on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

permissions:
  contents: write
  pull-requests: write

jobs:
  docs:
    if: ${{ !startsWith(github.head_ref, 'docs/') }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Cursor CLI
        run: |
          curl https://cursor.com/install -fsS | bash
          echo "$HOME/.cursor/bin" >> $GITHUB_PATH

      - name: Configure git
        run: |
          git config user.name "Cursor Agent"
          git config user.email "cursoragent@cursor.com"

      - name: Update docs
        env:
          MODEL: gpt-5.2
          CURSOR_API_KEY: ${{ secrets.CURSOR_API_KEY }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          BRANCH_PREFIX: docs
        run: |
          agent -p "You are operating in a GitHub Actions runner...
          
          # Goal:
          - Implement an end-to-end docs update flow driven by incremental changes to the original PR.
          
          # Requirements:
          1) Determine what changed in the original PR
          2) Update only the relevant docs based on those incremental changes
          3) Maintain the persistent docs branch for this PR head
          4) Post or update a single PR comment that explains the docs updates" --force --model "$MODEL" --output-format=text
```

---

## Cookbook: Fix CI Failures

Fix CI failures using Cursor CLI in GitHub Actions. This workflow analyzes failures, makes targeted fixes, and creates a fix branch with a quick-create PR link.

**Example: `.github/workflows/fix-ci.yml`**

```yaml
name: Fix CI Failures

on:
  workflow_run:
    workflows: [Test]
    types: [completed]

permissions:
  contents: write
  pull-requests: write
  actions: read

jobs:
  attempt-fix:
    if: >-
      ${{ github.event.workflow_run.conclusion == 'failure' &&
          github.event.workflow_run.name != 'Fix CI Failures' }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Cursor CLI
        run: |
          curl https://cursor.com/install -fsS | bash
          echo "$HOME/.cursor/bin" >> $GITHUB_PATH

      - name: Configure git identity
        run: |
          git config user.name "Cursor Agent"
          git config user.email "cursoragent@cursor.com"

      - name: Fix CI failure
        env:
          CURSOR_API_KEY: ${{ secrets.CURSOR_API_KEY }}
          MODEL: gpt-5.2
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          BRANCH_PREFIX: ci-fix
        run: |
          agent -p "You are operating in a GitHub Actions runner...
          
          # Goal:
          - Implement an end-to-end CI fix flow driven by the failing PR
          
          # Requirements:
          1) Identify the PR associated with the failed workflow run
          2) Maintain a persistent fix branch for this PR head
          3) Attempt to resolve the CI failure by making minimal, targeted edits
          4) Post or update a single PR comment with the fix" --force --model "$MODEL" --output-format=text
```

---

## Cookbook: Secret Audit

Audit your repository for security vulnerabilities and secrets exposure using Cursor CLI. This workflow scans for potential secrets, detects risky workflow patterns, and proposes security fixes.

**Example: `.github/workflows/secret-audit.yml`**

```yaml
name: Secrets Audit

on:
  schedule:
    - cron: "0 4 * * *"
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write
  actions: read

jobs:
  secrets-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Cursor CLI
        run: |
          curl https://cursor.com/install -fsS | bash
          echo "$HOME/.cursor/bin" >> $GITHUB_PATH

      - name: Configure git identity
        run: |
          git config user.name "Cursor Agent"
          git config user.email "cursoragent@cursor.com"

      - name: Scan and propose hardening
        env:
          CURSOR_API_KEY: ${{ secrets.CURSOR_API_KEY }}
          MODEL: gpt-5.2
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          BRANCH_PREFIX: audit
        run: |
          agent -p "You are operating in a GitHub Actions runner...
          
          # Goal:
          - Perform a repository secrets exposure and workflow hardening audit
          
          # Requirements:
          1) Scan for potential secrets in tracked files and recent history
          2) Detect risky workflow patterns: unpinned actions, overbroad permissions, unsafe pull_request_target usage
          3) Propose minimal edits: redact literals, add ignore rules, pin actions to SHA, reduce permissions
          4) Add a SECURITY_LOG.md summarizing changes and remediation guidance" --force --model "$MODEL" --output-format=text
```

---

## Cookbook: Translate Keys

Manage translation keys for internationalization using Cursor CLI. This workflow detects new or changed i18n keys in pull requests and fills missing translations without overwriting existing ones.

**Example: `.github/workflows/translate-keys.yml`**

```yaml
name: Translate Keys

on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

permissions:
  contents: write
  pull-requests: write

jobs:
  i18n:
    if: ${{ !startsWith(github.head_ref, 'translate/') }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Cursor CLI
        run: |
          curl https://cursor.com/install -fsS | bash
          echo "$HOME/.cursor/bin" >> $GITHUB_PATH

      - name: Configure git identity
        run: |
          git config user.name "Cursor Agent"
          git config user.email "cursoragent@cursor.com"

      - name: Propose i18n updates
        env:
          CURSOR_API_KEY: ${{ secrets.CURSOR_API_KEY }}
          MODEL: gpt-5.2
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          BRANCH_PREFIX: translate
        run: |
          agent -p "You are operating in a GitHub Actions runner...
          
          # Goal:
          - Detect i18n keys added or changed in the PR and fill only missing locales
          
          # Requirements:
          1) Determine changed keys by inspecting the PR diff
          2) Compute missing keys per locale using the source/canonical locale as truth
          3) Add entries only for missing keys. Preserve all existing values untouched
          4) Validate JSON formatting and schemas" --force --model "$MODEL" --output-format=text
```

---

## Reference: Slash Commands

| Command | Description |
|---------|-------------|
| `/plan` | Switch to Plan mode to design your approach before coding |
| `/ask` | Switch to Ask mode for read-only exploration |
| `/model <model>` | Set or list models |
| `/auto-run [state]` | Toggle auto-run (default) or set [on\|off\|status] |
| `/sandbox` | Configure sandbox mode and network access settings |
| `/max-mode [on\|off]` | Toggle max mode on models that support it |
| `/new-chat` | Start a new chat session |
| `/vim` | Toggle Vim keys |
| `/help [command]` | Show help (/help [cmd]) |
| `/feedback <message>` | Share feedback with the team |
| `/resume <chat>` | Resume a previous chat by folder name |
| `/usage` | View Cursor streaks and usage stats |
| `/about` | Show environment and CLI setup details |
| `/copy-request-id` | Copy last request ID to clipboard |
| `/copy-conversation-id` | Copy conversation ID to clipboard |
| `/logout` | Sign out from Cursor |
| `/quit` | Exit |
| `/setup-terminal` | Auto-configure terminal keybindings |
| `/mcp list` | Browse, enable, and configure MCP servers |
| `/mcp enable <name>` | Enable an MCP server |
| `/mcp disable <name>` | Disable an MCP server |
| `/rules` | Create new rules or edit existing rules |
| `/commands` | Create new commands or edit existing commands |
| `/compress` | Summarize conversation to free context space |

---

## Reference: Parameters

### Global options

Global options can be used with any command:

| Option | Description |
|--------|-------------|
| `-v, --version` | Output the version number |
| `-a, --api-key <key>` | API key for authentication (can also use `CURSOR_API_KEY` env var) |
| `-p, --print` | Print responses to console (for scripts or non-interactive use). Has access to all tools, including write and bash. |
| `--output-format <format>` | Output format (only works with `--print`): `text`, `json`, or `stream-json` (default: `text`) |
| `--stream-partial-output` | Stream partial output as individual text deltas (only works with `--print` and `stream-json` format) |
| `-b, --background` | Start in background mode (open composer picker on launch) |
| `--fullscreen` | Enable fullscreen mode |
| `--resume [chatId]` | Resume a chat session |
| `-m, --model <model>` | Model to use |
| `--mode <mode>` | Set agent mode: `agent` (default), `plan`, or `ask` |
| `--list-models` | List all available models |
| `-f, --force` | Force allow commands unless explicitly denied |
| `-h, --help` | Display help for command |

### Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `login` | Authenticate with Cursor | `agent login` |
| `logout` | Sign out and clear stored authentication | `agent logout` |
| `status` | Check authentication status | `agent status` |
| `models` | List all available models | `agent models` |
| `mcp` | Manage MCP servers | `agent mcp` |
| `update\|upgrade` | Update Cursor Agent to the latest version | `agent update` or `agent upgrade` |
| `ls` | Resume a chat session | `agent ls` |
| `resume` | Resume the latest chat session | `agent resume` |
| `help [command]` | Display help for command | `agent help [command]` |

> When no command is specified, Cursor Agent starts in interactive chat mode by default.

### MCP

Manage MCP servers configured for Cursor Agent.

| Subcommand | Description | Usage |
|------------|-------------|-------|
| `login <identifier>` | Authenticate with an MCP server configured in `.cursor/mcp.json` | `agent mcp login <identifier>` |
| `list` | List configured MCP servers and their status | `agent mcp list` |
| `list-tools <identifier>` | List available tools and their argument names for a specific MCP | `agent mcp list-tools <identifier>` |
| `enable <identifier>` | Enable an MCP server | `agent mcp enable <identifier>` |
| `disable <identifier>` | Disable an MCP server | `agent mcp disable <identifier>` |

### Arguments

When starting in chat mode (default behavior), you can provide an initial prompt:

- `prompt` — Initial prompt for the agent

### Getting help

All commands support the global `-h, --help` option to display command-specific help.

---

## Reference: Authentication

Cursor CLI supports two authentication methods: browser-based login (recommended) and API keys.

### Browser authentication (recommended)

Use the browser flow for the easiest authentication experience:

```bash
# Log in using browser flow
agent login

# Check authentication status
agent status

# Log out and clear stored authentication
agent logout
```

The login command will open your default browser and prompt you to authenticate with your Cursor account. Once completed, your credentials are securely stored locally.

### API key authentication

For automation, scripts, or CI/CD environments, use API key authentication:

#### Step 1: Generate an API key

Generate an API key in your Cursor dashboard under Integrations > User API Keys.

#### Step 2: Set the API key

You can provide the API key in two ways:

**Option 1: Environment variable (recommended)**

```bash
export CURSOR_API_KEY=your_api_key_here
agent "implement user authentication"
```

**Option 2: Command line flag**

```bash
agent --api-key your_api_key_here "implement user authentication"
```

### Authentication status

Check your current authentication status:

```bash
agent status
```

This command will display:

- Whether you're authenticated
- Your account information
- Current endpoint configuration

### Troubleshooting

- **"Not authenticated" errors:** Run `agent login` or ensure your API key is correctly set
- **SSL certificate errors:** Use the `--insecure` flag for development environments
- **Endpoint issues:** Use the `--endpoint` flag to specify a custom API endpoint

---

## Reference: Permissions

Configure what the agent is allowed to do using permission tokens in your CLI configuration. Permissions are set in `~/.cursor/cli-config.json` (global) or `<project>/.cursor/cli.json` (project-specific).

### Permission types

#### Shell commands

**Format:** `Shell(commandBase)`

Controls access to shell commands. The `commandBase` is the first token in the command line.

| Example | Description |
|---------|-------------|
| `Shell(ls)` | Allow running `ls` commands |
| `Shell(git)` | Allow any `git` subcommand |
| `Shell(npm)` | Allow npm package manager commands |
| `Shell(rm)` | Deny destructive file removal (commonly in `deny`) |

#### File reads

**Format:** `Read(pathOrGlob)`

Controls read access to files and directories. Supports glob patterns.

| Example | Description |
|---------|-------------|
| `Read(src/**/*.ts)` | Allow reading TypeScript files in `src` |
| `Read(**/*.md)` | Allow reading markdown files anywhere |
| `Read(.env*)` | Deny reading environment files |
| `Read(/etc/passwd)` | Deny reading system files |

#### File writes

**Format:** `Write(pathOrGlob)`

Controls write access to files and directories. Supports glob patterns. When using in print mode, `--force` is required to write files.

| Example | Description |
|---------|-------------|
| `Write(src/**)` | Allow writing to any file under `src` |
| `Write(package.json)` | Allow modifying package.json |
| `Write(**/*.key)` | Deny writing private key files |
| `Write(**/.env*)` | Deny writing environment files |

### Configuration

Add permissions to the `permissions` object in your CLI configuration file:

```json
{
  "permissions": {
    "allow": [
      "Shell(ls)",
      "Shell(git)",
      "Read(src/**/*.ts)",
      "Write(package.json)"
    ],
    "deny": [
      "Shell(rm)",
      "Read(.env*)",
      "Write(**/*.key)"
    ]
  }
}
```

### Pattern matching

- Glob patterns use `**`, `*`, and `?` wildcards
- Relative paths are scoped to the current workspace
- Absolute paths can target files outside the project
- Deny rules take precedence over allow rules

---

## Reference: Configuration

Configure the Agent CLI using the `cli-config.json` file.

### File location

| Type | Platform | Path |
|------|----------|------|
| Global | macOS/Linux | `~/.cursor/cli-config.json` |
| Global | Windows | `$env:USERPROFILE\.cursor\cli-config.json` |
| Project | All | `<project>/.cursor/cli.json` |

> Only permissions can be configured at the project level. All other CLI settings must be set globally.

Override with environment variables:

- **`CURSOR_CONFIG_DIR`**: custom directory path
- **`XDG_CONFIG_HOME`** (Linux/BSD): uses `$XDG_CONFIG_HOME/cursor/cli-config.json`

### Schema

#### Required fields

| Field | Type | Description |
|-------|------|-------------|
| `version` | number | Config schema version (current: `1`) |
| `editor.vimMode` | boolean | Enable Vim keybindings (default: `false`) |
| `permissions.allow` | string[] | Permitted operations |
| `permissions.deny` | string[] | Forbidden operations |

#### Optional fields

| Field | Type | Description |
|-------|------|-------------|
| `model` | object | Selected model configuration |
| `hasChangedDefaultModel` | boolean | CLI-managed model override flag |
| `network.useHttp1ForAgent` | boolean | Use HTTP/1.1 instead of HTTP/2 for agent connections (default: `false`) |
| `attribution.attributeCommitsToAgent` | boolean | Add `Co-authored-by: Cursor` trailer to Agent commits (default: `true`) |
| `attribution.attributePRsToAgent` | boolean | Add "Made with Cursor" footer to Agent PRs (default: `true`) |

### Examples

#### Minimal config

```json
{
  "version": 1,
  "editor": {
    "vimMode": false
  },
  "permissions": {
    "allow": ["Shell(ls)"],
    "deny": []
  }
}
```

#### Enable Vim mode

```json
{
  "version": 1,
  "editor": {
    "vimMode": true
  },
  "permissions": {
    "allow": ["Shell(ls)"],
    "deny": []
  }
}
```

#### Configure permissions

```json
{
  "version": 1,
  "editor": {
    "vimMode": false
  },
  "permissions": {
    "allow": ["Shell(ls)", "Shell(echo)"],
    "deny": ["Shell(rm)"]
  }
}
```

### Troubleshooting

**Config errors**: Move the file aside and restart:

```bash
mv ~/.cursor/cli-config.json ~/.cursor/cli-config.json.bad
```

**Changes don't persist**: Ensure valid JSON and write permissions. Some fields are CLI-managed and may be overwritten.

### Notes

- Pure JSON format (no comments)
- CLI performs self-repair for missing fields
- Corrupted files are backed up as `.bad` and recreated
- Permission entries are exact strings

### Models

You can select a model for the CLI using the `/model` slash command.

```
/model auto
/model gpt-5.2
/model sonnet-4.5-thinking
```

### Proxy configuration

If your network routes traffic through a proxy server, configure the CLI using environment variables and the config file.

#### Environment variables

Set these environment variables before running the CLI:

```bash
export HTTP_PROXY=http://your-proxy:port
export HTTPS_PROXY=http://your-proxy:port
export NODE_USE_ENV_PROXY=1
```

If your proxy performs SSL inspection (man-in-the-middle), also trust your organization's CA certificate:

```bash
export NODE_EXTRA_CA_CERTS=/path/to/corporate-ca-cert.pem
```

#### HTTP/1.1 fallback

Some enterprise proxies (like Zscaler) don't support HTTP/2 bidirectional streaming. Enable HTTP/1.1 mode in your config:

```json
{
  "version": 1,
  "editor": {
    "vimMode": false
  },
  "permissions": {
    "allow": [],
    "deny": []
  },
  "network": {
    "useHttp1ForAgent": true
  }
}
```

This switches agent connections to HTTP/1.1 with Server-Sent Events (SSE), which works with most corporate proxies.

---

## Reference: Output Format

The Cursor Agent CLI provides multiple output formats with the `--output-format` option when combined with `--print`. These formats include structured formats for programmatic use (`json`, `stream-json`) and a simplified text format for human-readable output (`text`).

> The default `--output-format` is `text`. This option is only valid when printing (`--print`) or when print mode is inferred (non-TTY stdout or piped stdin).

### JSON format

The `json` output format emits a single JSON object (followed by a newline) when the run completes successfully. Deltas and tool events are not emitted; text is aggregated into the final result.

On failure, the process exits with a non-zero code and writes an error message to stderr. No well-formed JSON object is emitted in failure cases.

#### Success response

When successful, the CLI outputs a JSON object with the following structure:

```json
{
  "type": "result",
  "subtype": "success",
  "is_error": false,
  "duration_ms": 1234,
  "duration_api_ms": 1234,
  "result": "<full assistant text>",
  "session_id": "<uuid>",
  "request_id": "<optional request id>"
}
```

| Field | Description |
|-------|-------------|
| `type` | Always `"result"` for terminal results |
| `subtype` | Always `"success"` for successful completions |
| `is_error` | Always `false` for successful responses |
| `duration_ms` | Total execution time in milliseconds |
| `duration_api_ms` | API request time in milliseconds |
| `result` | Complete assistant response text |
| `session_id` | Unique session identifier |
| `request_id` | Optional request identifier |

### Stream JSON format

The `stream-json` output format emits newline-delimited JSON (NDJSON). Each line contains a single JSON object representing an event during execution. This format aggregates text deltas and outputs **one line per assistant message** (the complete message between tool calls).

**Streaming partial output:** For real-time character-level streaming, use `--stream-partial-output` with `--output-format stream-json`. This emits text as it's generated in small chunks.

#### Event types

- **System initialization** - Emitted once at the beginning of each session
- **User message** - Contains the user's input prompt
- **Assistant message** - Emitted once per complete assistant message
- **Tool call events** - Tool calls are tracked with start and completion events
- **Terminal result** - The final event emitted on successful completion

### Text format

The `text` output format provides only the final assistant message without any intermediate progress updates or tool call summaries. This is the cleanest output format for scripts that only need the agent's final response.

#### Example output

```
The command to move this branch onto main is `git rebase --onto main HEAD~3`.
```

Only the final assistant message (after the last tool call) is output, with no tool call summaries or intermediate text.

### Implementation notes

- Each event is emitted as a single line terminated by `\n`
- `thinking` events are suppressed in print mode and will not appear in any output format
- Field additions may occur over time in a backward-compatible way
- The `json` format waits for completion before outputting results
- The `stream-json` format outputs complete agent messages
- The `--stream-partial-output` flag provides real-time text deltas for character-level streaming
- Tool call IDs can be used to correlate start/completion events
- Session IDs remain consistent throughout a single agent execution

---

## Reference: Terminal Setup

Configure your terminal for the best Cursor CLI experience. This guide covers keybindings for multi-line input, Vim mode, and theme synchronization.

### Quick start

If Shift+Enter doesn't work for newlines in your terminal, run `/setup-terminal` for guidance on configuring alternatives:

```
/setup-terminal
```

This command detects your terminal and provides instructions for configuring Option+Enter / Alt+Enter as an alternative way to insert newlines.

### Universal options

These methods work in **all terminals**, including tmux, screen, and SSH sessions:

| Method | Description |
|--------|-------------|
| `\`+Enter | Type a backslash, then press Enter to insert a newline |
| Ctrl+J | Standard control character for newline (ASCII line feed) |

> If you're in tmux or having trouble with other keybindings, Ctrl+J is the most reliable option.

### Terminal support

#### Native Shift+Enter support

These terminals support Shift+Enter for newlines out of the box:

- **iTerm2** (macOS)
- **Ghostty**
- **Kitty**
- **Warp**
- **Zed** (integrated terminal)

#### Requires `/setup-terminal`

These terminals need `/setup-terminal` to configure Option+Enter / Alt+Enter for newlines:

- **Apple Terminal** (macOS)
- **Alacritty**
- **VS Code** (integrated terminal)

#### Terminal multiplexers

**tmux** and **screen** intercept Shift+Enter before it reaches applications. Use the universal options instead:

- Ctrl+J — Works reliably in all multiplexer sessions
- `\`+Enter — Also works universally

### Vim mode

Enable Vim keybindings for navigation and editing in the CLI input area.

#### Toggle with slash command

```
/vim
```

This toggles Vim mode on or off for the current session and saves the preference.

#### Configure in settings

Add to your `~/.cursor/cli-config.json`:

```json
{
  "version": 1,
  "editor": {
    "vimMode": true
  },
  "permissions": {
    "allow": [],
    "deny": []
  }
}
```

#### Modes

Vim mode uses modal editing:

- **Normal mode** — Navigate and execute commands (default when Vim mode is enabled)
- **Insert mode** — Type text normally

Press Esc to return to normal mode from insert mode.

#### Navigation

| Key | Description |
|-----|-------------|
| h, l | Move left / right |
| j, k | Move down / up |
| w, b | Next / previous word |
| e | End of word |
| W, B, E | Same as above, but for WORD (non-whitespace sequence) |
| 0, $ | Start / end of line |

#### Editing

| Key | Description |
|-----|-------------|
| x | Delete character under cursor |
| X | Delete character before cursor |
| d + motion | Delete range (e.g., `dw` deletes word) |
| dd | Delete entire line |
| D | Delete to end of line |
| s | Substitute character (delete + insert mode) |
| S, cc | Change entire line |
| C | Change to end of line |

#### Entering insert mode

| Key | Description |
|-----|-------------|
| i | Insert at cursor |
| a | Insert after cursor |
| I | Insert at start of line |
| A | Insert at end of line |
| o | Open new line below |
| O | Open new line above |

#### Counts

Prefix commands with a number to repeat them. For example, `3w` moves forward 3 words, `2dd` deletes 2 lines.

> Vim mode affects the input area only. Navigation through chat history and other UI elements uses standard keybindings.

### Terminal theme

Cursor CLI automatically detects your terminal's color scheme and adapts its appearance.

#### Automatic detection

The CLI queries your terminal for its background color using standard escape sequences. Most modern terminals support this:

- **Dark terminals** → CLI uses dark theme
- **Light terminals** → CLI uses light theme

#### Terminals with automatic detection

These terminals report their color scheme correctly:

- iTerm2
- Ghostty
- Kitty
- Alacritty
- Apple Terminal
- Windows Terminal
- VS Code integrated terminal

#### Forcing a theme

If automatic detection doesn't work, you can override it with an environment variable:

```bash
# Force dark theme
export COLORFGBG="15;0"

# Force light theme
export COLORFGBG="0;15"
```

Add this to your shell profile (`.bashrc`, `.zshrc`, etc.) to make it permanent.

### Troubleshooting

**Keybindings not working:**

- Verify your terminal is detecting the keys correctly using `cat` or `showkey`
- Check if a terminal multiplexer (tmux/screen) is intercepting the keys
- Use Ctrl+J as a reliable fallback

**tmux users:**

- Shift+Enter and Option+Enter / Alt+Enter won't work through tmux
- Use Ctrl+J or `\`+Enter instead
- These universal options work everywhere, including nested tmux sessions

**SSH sessions:**

- Remote terminal capabilities depend on your local terminal emulator
- Ctrl+J works reliably over SSH
- `\`+Enter is another reliable option

### Summary

| Keybinding | Works in | Notes |
|------------|----------|-------|
| Ctrl+J | All terminals | Most reliable, works everywhere |
| `\`+Enter | All terminals | Universal alternative |
| Shift+Enter | iTerm2, Ghostty, Kitty, Warp, Zed | Native support, no config needed |
| Option+Enter / Alt+Enter | After `/setup-terminal` | Newline alternative for Apple Terminal, Alacritty, VS Code |

---

*End of Cursor CLI Documentation*
