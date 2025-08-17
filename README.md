# 🚀 DBMS with n8n

> **[PREVIEW LIVE DEMO](https://dbms-with-n8n.vercel.app/)**

A comprehensive **Member Management System** built with modern web technologies and powered by n8n workflows. Manage member information, track family relationships, monitor employment status, and generate detailed analytics — all without writing backend code!

> **Example Implementation**: This repository demonstrates a church member management system, but the architecture can be adapted for any organization needing member/user management.

**Completely self-hosted** for total data privacy and control. Your data stays on your servers. 🔒

---

## ✨ Features

- 👥 **Complete Member Management** — Add, edit, delete members with detailed profiles
- 🖼️ **Image Management** — Upload and display profile pictures and family photos with automatic compression
- 👨‍👩‍👧‍👦 **Family Relationships** — Track spouses, children, and family connections
- 📊 **Rich Analytics Dashboard** — Age distribution, geographic insights, employment stats
- 📱 **Multi-Contact Support** — Primary, WhatsApp, emergency, and origin country phones
- 💼 **Employment Tracking** — Job details, professions, and employment status
- 🎂 **Birthday Reminders** — Never miss a member's special day
- 📈 **Visual Reports** — Charts, graphs, and exportable data summaries
- 🌙 **Dark/Light Theme** — Beautiful UI that adapts to user preference
- 📤 **Bulk Import/Export** — CSV support with Google Drive image integration for easy data migration
- ⚡ **Real-time Updates** — Powered by n8n webhooks for instant data sync

---

## 🛠️ Tech Stack

| Component            | Technology                    |
|----------------------|-------------------------------|
| Frontend             | Vite + React + TypeScript     |
| UI Components        | shadcn/ui + Tailwind CSS      |
| Backend Logic        | [n8n](https://n8n.io/) workflows |
| Database             | MySQL (via n8n)               |
| Charts & Analytics   | Recharts                      |
| Package Management   | npm                           |

---

## 📋 Prerequisites

- **Node.js** (v18+ recommended)
- **npm** (comes with Node.js)
- **Self-hosted n8n instance** (Docker recommended)
- **Self-hosted MySQL database** (complete data ownership)

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
    Now open `.env` and set your actual URLs:
    - `VITE_N8N_WEBHOOK_URL` - Your n8n webhook endpoint for member operations
    - `VITE_N8N_IMAGE_URL` - Your n8n image server endpoint for serving uploaded images


4. **Run the app:**
    ```bash
    npm run dev
    ```
    Boom 💥. Local dev server should be up and running.

## 🏗️ Self-Hosted Architecture

- **Frontend**: Self-hosted React app communicates with your n8n instance
- **n8n Workflows**: Your own n8n server handles all backend logic and database operations
- **MySQL Database**: Your private database with complete control over member data
- **Zero External Dependencies**: Everything runs on your infrastructure
- **Complete Privacy**: No data leaves your servers

### Database Schema
The system uses a normalized MySQL schema:
- `members` - Core member information
- `member_phones` - Multiple phone numbers per member
- `member_employment` - Employment history and status
- `family_relationships` - Family connections and relationships

### AI-Enhanced Features
With the n8n AI starter kit, you can extend the system with:
- **Smart member categorization** using local AI models
- **Automated insights** from member data
- **Natural language queries** for member search
- **Intelligent data validation** and cleanup

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

## 🎯 Perfect For

- **Organizations** wanting complete control over sensitive member data
- **Communities** requiring data privacy and self-hosted solutions
- **Teams** wanting to avoid cloud vendor lock-in
- **Developers** building privacy-first applications with visual workflows
- **Anyone** who values data sovereignty and self-hosting

## 💡 Key Features Walkthrough

### Member Management
- **Multi-step Form**: Organized data entry across 5 logical steps
- **Dual Image Support**: Local uploads (compressed) or Google Drive links from bulk imports
- **Family Support**: Add spouse and children with automatic relationship linking
- **Contact Flexibility**: Multiple phone types and email validation
- **Employment Tracking**: Current job status, company, and profession details

### Analytics & Insights
- **Age Demographics**: Visual breakdown of congregation age groups
- **Geographic Distribution**: See where your members live
- **Join Trends**: Track membership growth over time
- **Employment Stats**: Understand your congregation's professional landscape
- **Birthday Tracking**: Upcoming celebrations in the next 30 days

### Data Management
- **Bulk Import**: CSV/XLSX upload or Google Sheets URL with Google Drive image support
- **Google Forms Integration**: Direct import from Google Forms responses with image attachments
- **Export Options**: Generate comprehensive reports and summaries
- **Search & Filter**: Quickly find members by various criteria
- **Backup Ready**: All data stored in standard MySQL format

## 🚀 Self-Hosting Setup

### Docker Compose (Recommended)
This project uses the **n8n AI Starter Kit** configuration for enhanced capabilities.

**⚠️ Important**: Please verify the latest configuration at the official repository before using:
**https://github.com/n8n-io/self-hosted-ai-starter-kit**

```bash
# 1. Clone and setup
git clone https://github.com/deepesh611/DBMS-with-n8n.git
cd DBMS-with-n8n

# 2. Configure environment
cp .env.example .env
# Edit .env with your settings

# 3. Start the complete stack
docker-compose --profile cpu up -d

# For GPU support (NVIDIA)
docker-compose --profile gpu-nvidia up -d

# For GPU support (AMD)
docker-compose --profile gpu-amd up -d
```

### What's Included
- **MySQL**: Database for n8n and your member data
- **Adminer**: Web-based database management interface
- **n8n**: Workflow automation with AI capabilities
- **Ollama**: Local AI model hosting
- **Qdrant**: Vector database for AI features
- **React Frontend**: Member management interface

### Access Points
- **Frontend**: http://localhost:3000 (Member Management System)
- **n8n**: http://localhost:5678 (Workflow Editor)
- **Adminer**: http://localhost:8080 (Database Management)
- **Qdrant**: http://localhost:6333 (Vector Database)
- **Ollama**: http://localhost:11434 (AI Models)
- **Image Server**: http://localhost:5678/webhook-test/uploads (Image serving endpoint)

### n8n Workflows
Three main workflows power the system:
1. **Member Management Workflow** - Handles CRUD operations, family relationships, and local image processing
2. **Bulk Import Workflow** - Processes CSV/XLSX files with Google Drive image integration
3. **Image Server Workflow** - Serves locally uploaded images with proper caching headers

Sample workflows are included in the repository.

## 📊 Sample Data
The app includes [mock data](./assets/member_import_sample.csv) for development and testing. In production, all data flows through your n8n workflows to MySQL.

## 🖼️ Google Drive Integration

### For Google Forms Integration
When using Google Forms for member registration:
1. **File Upload Questions**: Google Forms automatically saves uploaded images to Google Drive
2. **CSV Export**: Contains Google Drive URLs for uploaded images
3. **Bulk Import**: System automatically handles both local uploads and Google Drive links
4. **Image Display**: Uses Google Drive thumbnail API for fast, reliable image viewing

### Supported Image Sources
- **Individual Registration**: Local upload with compression and n8n file serving
- **Bulk Import**: Google Drive URLs stored directly in database
- **Mixed Environment**: System automatically detects and handles both types seamlessly

### Google Drive Setup
- Images must be set to "Anyone with the link can view"
- No Google API keys required - uses public thumbnail endpoints
- Automatic file ID extraction from various Google Drive URL formats

## 🔧 Self-Hosted Customization
Complete control means unlimited customization:
- **Add custom fields** without vendor restrictions
- **Create private workflows** for your organization's unique needs
- **Integrate with your existing systems** (email servers, SMS gateways)
- **Backup and migrate** your data however you want
- **Scale on your hardware** without subscription limits

## 📝 License
MIT License - feel free to use this for your organization!