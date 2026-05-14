<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# TrackLine India

Train route and booking demo built with React, Vite, and Express.

## Run locally

Prerequisite: Node.js 22+

1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env.local`
3. Leave `VITE_API_BASE_URL` empty for local development
4. Run `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Deploy to GitHub

1. Commit your changes locally
2. Push the branch to GitHub
3. Use that GitHub repo as the source for Vercel and Render

## Deploy to Render

Render hosts the Node.js server and API for this project.

1. Create a new Web Service from this GitHub repo
2. Render will detect [render.yaml](./render.yaml)
3. Confirm the service uses:
   Build command: `npm ci && npm run build`
   Start command: `npm start`
4. Set `CORS_ORIGIN` to your Vercel production URL after Vercel is created
5. Deploy and copy the generated `https://...onrender.com` URL

## Deploy to Vercel

Vercel now supports this project directly, including the `/api` endpoints.

1. Import the same GitHub repo into Vercel
2. Vercel will detect [vercel.json](./vercel.json)
3. You can leave `VITE_API_BASE_URL` empty to use Vercel's built-in API routes
4. Deploy
5. Only set `VITE_API_BASE_URL` if you explicitly want the frontend to call a separate Render backend

## Notes

- Bookings and routes are stored in memory, so data resets whenever the Render service restarts.
- Vercel serverless functions also use in-memory demo data, so state can reset between cold starts or new instances.
- Local development uses one Express server for both the frontend and API.
