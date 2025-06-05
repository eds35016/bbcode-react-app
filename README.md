# BBCode Template App

This repository contains a small React application for building and previewing BBCode templates. A minimal Node.js backend is included for user accounts and storing templates securely.

## Development

1. `cd bbcode-app`
2. Install dependencies with `npm install`
3. Start the development server:
   ```sh
   npm run dev
   ```
   The site will be available at `http://localhost:5173` by default.

4. In another terminal start the backend server:
   ```sh
   cd ../server
   npm install
   npm start
   ```
   The API will run on `http://localhost:3001`.

## Building

Run `npm run build` inside the `bbcode-app` directory to create a production build.
