# Rydex Repository

This workspace contains the Rydex ride-sharing application and its socket backend.

## Repository Structure

```
rydex/                       # repository root
├── README.md                # repository-level documentation (this file)
├── .gitignore
├── socket-server/           # Node socket backend for real-time ride updates
│   ├── .env                 # environment variables for socket server
│   ├── index.js             # Express + Socket.IO server entrypoint
│   ├── models/              # backend Mongoose models
│   ├── package.json         # socket-server dependencies and scripts
│   └── package-lock.json
└── rydex/                   # Next.js application folder
    ├── .env.local           # environment variables for Next.js app
    ├── package.json         # Next.js app dependencies and scripts
    ├── tsconfig.json
    ├── next.config.ts
    ├── postcss.config.mjs
    ├── eslint.config.mjs
    ├── public/
    ├── src/
    │   ├── app/             # Next.js app routes and API routes
    │   ├── components/      # reusable UI components
    │   ├── hooks/           # custom React hooks
    │   ├── lib/             # helpers, DB connection, service clients
    │   ├── models/          # Mongoose model definitions
    │   ├── redux/           # Redux store and slices
    │   ├── auth.ts
    │   ├── global.d.ts
    │   └── types.d.ts
    ├── .next/               # Next.js build artifacts
    ├── node_modules/
    └── README.md            # app-specific README scaffold
```

> Note: The actual Next.js application lives inside the nested `rydex/rydex` folder.

## Project Overview

- `rydex/rydex`: Next.js frontend and API routes for the ride-sharing app.
- `rydex/socket-server`: Express + Socket.IO backend used for realtime driver location updates, room joins, chat, and emit-based notifications.

## Prerequisites

- Node.js 18+ (recommended)
- npm
- MongoDB database instance
- Cloudinary account for media uploads
- Razorpay account for payments
- Google OAuth credentials for login

## Setup

### 1. Configure environment variables

#### App environment variables (`rydex/rydex/.env.local`)

```env
MONGODB_URI=<your_mongodb_uri>
AUTH_SECRET=<nextauth_secret>
AUTH_GOOGLE_ID=<google_oauth_client_id>
AUTH_GOOGLE_SECRET=<google_oauth_client_secret>
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=<razorpay_key_id>
RAZORPAY_KEY_ID=<razorpay_key_id>
RAZORPAY_KEY_SECRET=<razorpay_key_secret>
EMAIL=<gmail_address_for_notifications>
PASSWORD=<gmail_app_password>
CLOUDINARY_CLOUD_NAME=<cloudinary_cloud_name>
CLOUDINARY_API_KEY=<cloudinary_api_key>
CLOUDINARY_API_SECRET=<cloudinary_api_secret>
NEXT_PUBLIC_ZEGO_APP_ID=<zego_app_id>
NEXT_PUBLIC_ZEGO_SERVER_SECRET=<zego_server_secret>
GEMINI_API_URL=<gemini_api_url>
NEXTAUTH_URL=http://localhost:3000
```

> If you use a different port or domain, update `NEXT_PUBLIC_SOCKET_SERVER_URL` and `NEXTAUTH_URL` accordingly.

#### Socket server environment variables (`socket-server/.env`)

```env
PORT=5000
MONGODB_URI=<your_mongodb_uri>
NEXT_BASE_URL=http://localhost:3000
```

### 2. Install dependencies

From the repository root:

```bash
cd rydex/rydex
npm install

cd ../socket-server
npm install
```

### 3. Run the services

Start the socket backend:

```bash
cd rydex/socket-server
npm run dev
```

Start the Next.js application:

```bash
cd rydex/rydex
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Scripts

### Next.js app (`rydex/rydex/package.json`)

- `npm run dev` — start Next.js in development mode
- `npm run build` — build the production app
- `npm run start` — run the production build
- `npm run lint` — lint the project using ESLint

### Socket server (`socket-server/package.json`)

- `npm run dev` — start the Express/Socket.IO backend with nodemon

## Notes

- The socket server expects a CORS origin from `NEXT_BASE_URL`.
- The Next.js app uses `NEXT_PUBLIC_SOCKET_SERVER_URL` to connect to Socket.IO.
- Payment flow uses Razorpay keys and server-side signature verification.
- Cloudinary is used for image/document uploads.
- Google OAuth login is configured via `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.
