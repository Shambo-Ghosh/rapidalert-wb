<div align="center">
  <img src="public/next.svg" alt="RapidAlert Logo" width="120" height="120" />
  <h1>RapidAlert WB</h1>
  <p><strong>A Real-Time Crisis Response & Incident Management System for West Bengal Hospitality</strong></p>
</div>

---

## 🚨 Overview

**RapidAlert WB** is a production-grade, full-stack web application built to streamline emergency reporting and crisis management for hospitality venues (hotels, resorts) across West Bengal, India. It provides a seamless interface for guests and staff to report incidents, while offering a powerful, real-time dashboard for response teams to triage, track, and resolve emergencies.

The platform is designed with a premium, vibrant **"Light-Slate" glassmorphism UI**, optimized for high visibility during critical scenarios.

## ✨ Key Features

* **Public Incident Reporting**: Guests can report emergencies instantly without logging in. The system captures exact coordinates based on the selected property.
* **Real-Time Staff Dashboard**: A live-syncing Kanban-style dashboard for responders and admins, featuring real-time statistics (Active Incidents, Critical Issues, Resolving).
* **AI-Powered Triage**: Integrates **Google Gemini AI** to automatically classify incoming reports, assign a severity score (1-5), and suggest immediate recommended actions.
* **Live Map Visualizations**: Uses the **Google Maps JavaScript API** to dynamically plot incident locations with severity-color-coded markers.
* **Role-Based Access Control**: Secure, auto-provisioning login system with distinct roles (`admin`, `staff`, `responder`).
* **Real-Time Database**: Fully powered by **Firebase Firestore** with `onSnapshot` listeners to ensure all staff see updates instantly without refreshing.
* **Multilingual Support**: Integrated language toggle for English and Bengali (বাংলা).

## 🛠️ Technology Stack & Tools Used

### Frontend & UI
* **[Next.js 14](https://nextjs.org/)**: React framework using the modern App Router for optimized routing and server-side rendering.
* **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework used for the custom vibrant glassmorphism design system.
* **[shadcn/ui](https://ui.shadcn.com/)**: Accessible, customizable UI components.
* **[Framer Motion](https://www.framer.com/motion/)**: For smooth micro-animations and page transitions.
* **[Recharts](https://recharts.org/)**: Composable charting library used in the Analytics dashboard.
* **[Lucide React](https://lucide.dev/)**: Clean, modern iconography.

### Backend & Infrastructure
* **[Firebase Firestore](https://firebase.google.com/products/firestore)**: NoSQL real-time database for instantaneous data syncing across all clients.
* **[Firebase Authentication](https://firebase.google.com/products/auth)**: Secure email/password authentication system.
* **[Vercel](https://vercel.com/)**: Cloud platform for seamless serverless deployment and hosting.

### APIs & AI Integrations
* **[Google Gemini 1.5 Flash](https://deepmind.google/technologies/gemini/)**: Advanced Large Language Model (LLM) used via the Gemini API to parse unstructured crisis descriptions, categorize risks, and generate response plans.
* **[Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/overview)** (`@react-google-maps/api`): For rendering interactive maps and dynamic property geolocation markers.
* **[Zustand](https://zustand-demo.pmnd.rs/)**: Lightweight, fast state-management tool utilized with `persist` middleware for robust client-side state caching.

## 🚀 Getting Started

### Prerequisites
* Node.js 18+
* A Firebase Project (with Firestore and Authentication enabled)
* A Google Cloud Project (with Maps JavaScript API and Gemini API enabled)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YourUsername/rapidalert-wb.git
   cd rapidalert-wb
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your API keys:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 👥 Usage Guide

### 1. Reporting an Emergency
Navigate to `/report`. Fill out the required details, select the affected property, describe the crisis, and submit. The Gemini AI will process the report and generate a tracking ID.

### 2. Staff Portal & Login
Navigate to `/login`. Use the robust Tabs interface to Sign In or Create an Account. 
* *Note: Using an email containing `admin` or `responder` during registration will auto-assign those respective roles for demo purposes.*

### 3. Dashboard Management
Once logged in, navigate to `/dashboard`. You will see all active incidents. Click **"Assign to Me"** to claim an incident (updates status to "Responding"). Click **"View Details"** to see the Google Map location, AI analysis, and to log incident notes.

---
*Built with ❤️ for rapid response and safety.*
