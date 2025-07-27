# DBMS-with-n8n

> **[PREVIEW](https://dbms-with-n8n.vercel.app/)**

A modern React application for database management, integrated with [n8n](https://n8n.io/) for backend and workflow automation. This project demonstrates how to connect a React frontend to n8n using webhooks, with configuration via environment variables.

> **This project can be completely self-hosted, giving you full control over your data and workflows.**

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Usage](#usage)

## Features

- React frontend built with TypeScript
- Connects to n8n via configurable webhook endpoint
- Secure environment variable management
- Modular and scalable codebase
- Easy setup and deployment

## Tech Stack

- **Frontend:** React, TypeScript, JavaScript
- **Automation:** n8n (via webhook)
- **Package Manager:** npm

## Prerequisites

- Node.js (v16 or higher recommended)
- npm (comes with Node.js)
- n8n instance (local or remote, both can be self-hosted for full control)

## Getting Started

Follow these steps to set up and run the project locally:

1. **Clone the repository:**
   ```sh
   git clone https://github.com/deepesh611/DBMS-with-n8n.git
   cd DBMS-with-n8n
   ```

2. **Install dependencies:**
   ```sh
    npm install
    ```

3. **Set up environment variables:**
   Copy the `.env.example` file to `.env` and update the values as needed:
   ```sh
   cp .env.example .env
   ```
    Update the `REACT_APP_N8N_WEBHOOK_URL` with your n8n webhook URL.
4. **Start the development server:**
   ```sh
   npm run dev
   ```
   
## Usage
- The app uses the webhook URL from .env for API calls to n8n.
- To change the n8n endpoint, update the value in .env and restart the server.
- All database management actions are automated via n8n workflows.