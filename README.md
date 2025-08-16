# PIXEL & PEN - A SPACE FOR READERS AND WRITERS

A **next-generation full-stack blogging platform** designed for writers, readers, and administrators. Built with **React, Express.js, MySQL, and Slate.js**, Pixel&Pen combines **content creation, community interaction, and platform management** into one seamless experience.

The goal of Pixel&Pen is to empower contributors with a professional writing experience, give readers a clean and interactive reading journey, and provide admins with powerful moderation and analytics tools.

---

## 🌟 Key Highlights

- 🔒 **Secure Authentication** with OTP verification, JWT, and bcrypt
- 🖋 **Rich Text Editor** built on Slate.js with multimedia support
- 📊 **Role-Based Dashboards** (Admin, Contributor, Reader)
- 🌐 **Decentralized Image Storage** using Pinata (IPFS)
- 🎨 **Modern UI** with Tailwind CSS, Dark Mode, and Responsive Design

---

## 🚀 Features

### 👑 Admin Panel
Admins have complete control over platform moderation and contributor management.

- ✅ Approve, Reject, or Block Contributors
- 📑 Approve or Reject Articles with custom **Reject Reasons**
- 🗨️ Moderate and delete inappropriate comments
- 📢 Post announcements for the community
- 📊 Access detailed analytics:
  - Number of articles submitted, approved, or rejected
  - Contributor engagement stats
  - Reader activity (views, comments, bookmarks)

---

### ✍️ Contributor Panel
Contributors can create a professional profile and publish articles.

- 👤 Profile Management:
  - Profile Image upload
  - Bio, Area of Expertise, Location
  - Social Links (Twitter, LinkedIn, GitHub, etc.)

- 📝 Writing Articles:
  - **Slate.js Custom Editor** with:
    - Text Formatting (Bold, Italic, Underline, Strikethrough)
    - Headings (H1–H6)
    - Paragraph alignment (Left, Center, Right, Justify)
    - Code Blocks
    - Hyperlinks
    - Image Upload & Embeds (via Pinata)
    - YouTube Video Embeds
  - Article Settings:
    - Featured Image
    - Tags, Category, and SEO-friendly Description
    - Draft Saving and Preview
    - Submit for Admin Review

- 📈 Contributor Analytics:
  - Article performance metrics (views, likes, bookmarks)
  - Follower count
  - Engagement trends

---

### 📖 Reader / Subscriber Panel
Readers enjoy a smooth browsing and interaction experience.

- 💬 Comment on articles
- ⭐ Follow contributors to get notified of new posts
- 🔖 Bookmark favorite articles for later reading
- 👤 Manage profile and preferences

---

### 📡 Integrations
- 📧 **Nodemailer** → OTP for email verification
- 🖼️ **Pinata** → Decentralized image storage (IPFS)
- 🎨 **Lucide-react & React-icons** → Iconography
- ⚡ **Tailwind CSS** → UI styling with dark mode support

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Slate.js (Custom Rich Text Editor)
- Tailwind CSS (UI & Dark Mode)
- Lucide-react, React-icons (Icons)

### Backend
- Node.js
- Express.js
- MySQL Database
- JWT Authentication
- Nodemailer (OTP Verification)

### Storage & Infrastructure
- Pinata (IPFS for Images)
- Bcrypt (Password Security)

---

## 📸 Screenshots

> _Coming Soon_

- 🏠 Landing Page → ![Coming Soon](https://via.placeholder.com/600x350?text=Coming+Soon)
- 📊 Admin Dashboard → ![Coming Soon](https://via.placeholder.com/600x350?text=Coming+Soon)
- ✍️ Contributor Editor → ![Coming Soon](https://via.placeholder.com/600x350?text=Coming+Soon)
- 📖 Reader View → ![Coming Soon](https://via.placeholder.com/600x350?text=Coming+Soon)

---

## ⚙️ Installation & Setup

### Clone the Repository
```bash
git clone https://github.com/your-username/PixelandPen.git
cd PixelandPen
```

### Setup Backend
```bash
cd server
npm install
cp .env.example .env   # Fill in environment variables (DB, JWT_SECRET, gmail credentials, etc.)
npm run dev
```

### Setup Frontend
```bash
cd ../client
npm install
cp .env.example .env   # Add frontend-specific env variables
npm start
```

---
