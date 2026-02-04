# Gallery Feed App

A responsive gallery feed application that displays media items with infinite scrolling, tag-based filtering, and detailed gallery views.  
Built with Next.js and MySQL, optimized for performance and clean UX.

---

## 🚀 Features

- Masonry-style responsive gallery layout
- Infinite scroll pagination
- Tag-based filtering
- Gallery detail page with similar items
- Server-side APIs using Next.js App Router
- Optimized database queries with MySQL
- Deployed on Vercel with cloud MySQL (Aiven)

---

## 🛠 Tech Stack

### Frontend
- **Next.js (App Router)** – Server components & API routes
- **React** – UI state management
- **Tailwind CSS** – Utility-first styling

### Backend
- **Next.js API Routes** – Backend without separate server
- **MySQL** – Relational database
- **mysql2** – Connection pooling and queries

### Infrastructure
- **Aiven MySQL** – Cloud-managed MySQL database
- **Vercel** – Hosting and deployment

---

## ⚙️ Setup Instructions (Local)

### 
1. Clone the repository
```bash
  git clone https://github.com/subhankarbanik/gallery-feed-app.git
  cd gallery-feed-app

2. Install dependencies
  npm install

3. Environment variables

   Create a .env.local file using .env.example as reference:
   cp .env.example .env.local

4. Run the app
   npm run dev
   App will be available at: http://localhost:3000

  ------

5. the app is hoisted at:
   https://gallery-feed-app.vercel.app/

##
Assumptions Made

  A MySQL database with the required schema and seed data already exists.
  Environment variables are correctly configured in both local and production environments.
  Media assets are hosted externally and are publicly accessible.
  The application is expected to run on Node.js 18 or later.
  Traffic volume is moderate and can be handled by MySQL with paginated queries. 
