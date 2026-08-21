# SMB2GO Beta — Ubuntu VM + Google Antigravity + GitHub Setup Guide

Goal: a real, working demo you can show tax/notary prospects, running on your own
Ubuntu VM, with zero cloud spend, version-controlled in GitHub so you can pull
updates onto the server with one command.

**Note on tooling:** Google Antigravity is a free (public preview) desktop IDE,
not a server CLI — you install and run it on your own laptop/desktop, not on the
headless VM. The VM's job is purely to host the running app. Your workflow is:
develop with Antigravity locally → push to GitHub → pull + deploy on the VM.

---

## 1. Recommended stack for the beta (deliberately lightweight)

Don't build the full multi-tenant platform yet. Build **one working vertical site
+ the minimum admin/client loop**, on a stack that runs comfortably on a small VM
and has a clear upgrade path to Vercel/AWS later without a rewrite.

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router, TypeScript)** | One codebase for public site + admin + client portal; easy later move to Vercel if you outgrow the VM |
| Database | **PostgreSQL** (via Docker on the VM) | Same engine you'd use in production later — no migration pain. SQLite is tempting but skip it; Postgres on a VM is trivial via Docker and saves you a future rewrite |
| ORM | **Prisma** | Fast to scaffold, agent coding tools work well with it, easy schema migrations |
| Auth (client portal) | **Auth.js (NextAuth) with magic link email**, or simple email+password for the demo | Non-technical clients shouldn't manage passwords long-term, but email+password is fine to ship the demo faster |
| Calendar integration | **Google Calendar API** first, **Microsoft Graph API (Outlook)** second | Build one provider end-to-end before adding the second — they have different OAuth flows and token refresh logic |
| Reverse proxy / HTTPS | **Caddy** | Automatic HTTPS (even for a demo subdomain), 5-line config, far simpler than nginx+certbot |
| Process manager | **PM2** or a **systemd service** | Keeps the Next.js app running, restarts on crash/reboot |
| Containers | **Docker Compose** for Postgres (+ optionally the whole app) | Keeps the VM clean, easy to tear down/rebuild |

This stack runs fine on a modest VM (2 vCPU / 4GB RAM is plenty for a demo) and
every piece of it maps directly onto a real cloud deployment later — you're not
building throwaway code.

---

## 2. One-time VM setup

Run this on your Ubuntu server VM:

```bash
# System update
sudo apt update && sudo apt upgrade -y

# Git
sudo apt install -y git curl build-essential

# Docker + Docker Compose (for Postgres)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker

# Node.js (LTS) via nvm — needed for the Next.js app itself
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
node --version   # confirm v18+ (v20/22 LTS preferred)

# Caddy (reverse proxy / HTTPS)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy

# PM2
npm install -g pm2
```

That's everything the VM needs — it only ever runs Postgres, the built Next.js
app, and Caddy. No AI coding tool needs to be installed here.

### Install Google Antigravity on your local machine (not the VM)

Download it from antigravity.google/download and sign in with a Google account
— the public preview is free, no paid plan required. Once installed:

1. Open the `smb2go-beta` repo folder (see section 3 below) as your project in
   Antigravity.
2. Drop the `AGENTS.md` file (companion file) in the project root — Antigravity
   reads it automatically as standing project context for every task.
3. Start in **Planning mode** so you can review its approach before it writes
   code, rather than letting it run fully autonomously right away.

---

## 3. GitHub repo setup

On GitHub: create a new **private** repo, e.g. `smb2go-beta`.

On whichever machine you're developing from (VM or laptop):

```bash
mkdir smb2go-beta && cd smb2go-beta
git init
git remote add origin git@github.com:YOUR_USERNAME/smb2go-beta.git
```

Add an SSH key to GitHub if you haven't (`ssh-keygen -t ed25519`, then add the
`.pub` key under GitHub → Settings → SSH keys) so pushes/pulls are password-free
on the server.

Create `.gitignore` immediately (Antigravity will also do this, but good to have
from the start):

```
node_modules/
.env
.env.local
.next/
*.log
```

**Secrets never go in git.** Database URL, OAuth client secrets, session
secrets, etc. live in a `.env` file on the server only, referenced by Claude
Code but not committed.

---

## 4. Deploy loop (server pulls from GitHub)

Simplest version for a demo — no CI/CD needed yet:

```bash
# On the VM, first time:
git clone git@github.com:YOUR_USERNAME/smb2go-beta.git
cd smb2go-beta
cp .env.example .env      # fill in real secrets on the server only
npm install
npx prisma migrate deploy
npm run build
pm2 start npm --name smb2go -- start
pm2 save
pm2 startup              # so it survives a VM reboot
```

To ship an update after Antigravity makes changes and you push to GitHub:

```bash
cd ~/smb2go-beta
git pull origin main
npm install
npx prisma migrate deploy
npm run build
pm2 restart smb2go
```

Save that as `deploy.sh` on the server so it's a one-liner. Once this feels
routine, a GitHub webhook or Actions runner can automate it — not needed yet.

---

## 5. Caddy config (HTTPS reverse proxy)

`/etc/caddy/Caddyfile`:

```
your-demo-domain.com {
    reverse_proxy localhost:3000
}
```

If you don't have a domain pointed at the VM yet, you can run over plain HTTP on
the VM's IP for internal testing, and add the domain once you're ready to show
prospects. Caddy handles Let's Encrypt automatically the moment a real domain
points at it.

---

## 6. Suggested repo structure (let Antigravity create this, don't hand-build it)

```
smb2go-beta/
├── CLAUDE.md                # project instructions — see companion file
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (public)/        # marketing site: home, services, about, contact
│   │   ├── (admin)/         # your internal admin dashboard
│   │   ├── (client)/        # client portal (preview/feedback/approve)
│   │   └── api/
│   ├── components/
│   ├── lib/                 # calendar integration, db client, auth
│   └── styles/
├── .env.example
└── docker-compose.yml       # Postgres
```

---

## 7. Suggested build order for the beta

Don't ask Antigravity to build everything in one giant prompt. Sequence it:

1. **Scaffold** — Next.js + Prisma + Postgres + Caddy-ready, empty but running, pushed to GitHub, deployed to the VM. Confirm the deploy loop works before writing real features.
2. **Public marketing site** — home, services (tax/notary), about, contact form that saves to DB + emails you.
3. **Admin dashboard** — simple auth-gated view of leads/inquiries, basic site content editing.
4. **"Schedule a time" module** — start with Google Calendar only: OAuth connect your business calendar, show real availability, let a visitor book a slot, create the calendar event.
5. **Client portal** — even a minimal version: client logs in, sees their site preview, can leave comments.
6. **Outlook/Microsoft Graph calendar support** — once Google flow is solid, mirror it for Outlook.

This order gets you a demoable product after step 2–3 (days), not weeks.
