# Project Setup & Startup Instructions

This repository contains both the frontend and backend of the application.

## Prerequisites

- Node.js (v18 or higher recommended, tested with v25)
- MongoDB running locally on port 27017

## Backend Setup

The backend is located in the `back` directory.

### 1. Install Dependencies

```bash
cd back
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `back` directory with the following content:

```ini
MONGO_URI=mongodb://localhost:27017/msr-crm
JWT_SECRET=dev_secret_key_123
PORT=5001
```

> **Note:** Port 5001 is used because port 5000 is often occupied by system processes on macOS.

### 3. Patch for Node.js v25 (Important)

If you are using Node.js v25+, you may encounter a crash due to `buffer-equal-constant-time` package using `SlowBuffer`.
To fix this, edit `node_modules/buffer-equal-constant-time/index.js` and ensure it handles `SlowBuffer` correctly or use a patched version.
(The current setup includes a manual patch applied during initial configuration).

### 4. Start the Server

```bash
cd back
npm run dev
```

The server will start at `http://localhost:5001`.

## Frontend Setup

The frontend is located in the `front` directory.

### 1. Install Dependencies

```bash
cd front
npm install
```

### 2. Configure API Endpoint

Ensure `src/utils/constants.js` points to the local backend:

```javascript
export const API_URI = "http://localhost:5001/api";
```

### 3. Start the Development Server

```bash
cd front
npm run dev
```

The application will be available at `http://localhost:5173`.

## Running Both Simultaneously

Open two terminal windows:
1. In the first terminal: `cd back && npm run dev`
2. In the second terminal: `cd front && npm run dev`
