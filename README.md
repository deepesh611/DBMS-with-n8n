# 🚀 DBMS-with-n8n

> **[PREVIEW LIVE DEMO](https://dbms-with-n8n.vercel.app/)**

Ever wished you *didn’t* have to code a full-blown backend just to make your frontend work?  
Tired of repeating boring database tasks or building APIs from scratch?

Well, say hello to your new productivity cheat code — **DBMS-with-n8n** 😎  
A modern Vite + TypeScript frontend that **outsources your backend pain to n8n workflows**, so you can focus on building cool stuff — not wiring up endpoints all day.

Oh, and yes — **you can self-host it**. Total control, zero mystery.

---

## 🧠 What’s Inside?

- ⚡ **Super-fast Vite frontend** — built with TypeScript (of course).
- 🔗 **Webhook integration with n8n** — because writing boilerplate backend code is *so last year*.
- 🔐 **Secure env variable handling** — because we care about your secrets.
- 🧩 **Modular code structure** — easy to scale, easy to maintain.
- 🚀 **One-command startup** — because nobody reads setup docs anyway, right?

---

## 🛠️ Tech Stack

| Role                 | Tech                          |
|----------------------|-------------------------------|
| Frontend             | Vite + TypeScript + JavaScript |
| Backend + Automation | [n8n](https://n8n.io/) (via webhooks) |
| Package Management   | npm                         |

---

## 🧪 Prerequisites

You’ll need a few things installed — but you probably have them already:

- **Node.js** (v16+ recommended)
- **npm** (comes with Node.js)
- **n8n instance** (local, remote, Docker — totally up to you)

---

## 🚀 Getting Started

1. **Clone the repo (classic move):**

   ```bash
   git clone https://github.com/deepesh611/DBMS-with-n8n.git
   cd DBMS-with-n8n
    ```

2. **Install the goodies:**

    ```bash
    npm install
    ```
3. **Configure the .env file (aka the magic sauce):**
    ```bash    
    cp .env.example .env
    ```
    Now open `.env` and set your actual `VITE_N8N_WEBHOOK_URL`.
    This is where the frontend will send requests.


4. **Run the app:**
    ```bash
    npm run dev
    ```
    Boom 💥. Local dev server should be up and running.

## 💡 How It Works
- Your frontend talks to n8n using webhooks.
- n8n handles all the backend logic (DB operations, validations, etc.).
- You don’t have to write backend code — just create smart workflows visually in n8n.
- Want to change the webhook URL? Just update .env and restart.

## 😤 Having CORS nightmares?

If you see this in the console:
```bash
   Cross-Origin Request Blocked... blah blah...
```
Add this env variable to your n8n instance:
```bash
N8N_CORS_ENABLED=true
```
Restart n8n and enjoy the peace.

## ✨ Why You’ll Love This
- Frontend devs: Skip the backend grind and focus on UI/UX.
- Backend devs: Prototype stuff faster with low-code automation.
- Non-tech folks: Control workflows in n8n without needing to touch code.
- Your manager: Will think you built an entire platform solo.

## 🧠 Pro Tips
- Use n8n cloud or self-host with Docker for production.
- You can plug in any DB n8n supports (MySQL, Postgres, etc.).
- Easily extend workflows to send emails, push notifications, or trigger AI tools.

## 👀 What’s Next?
- Add authentication
- Add fancy UI dashboards
- Deploy with Docker or Netlify
- Let the robots (n8n) do your backend work