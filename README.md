# EduNexus

EduNexus is a Vite/React frontend with an Express API in `server.ts`. The API serves the frontend during local development and is deployed separately from the frontend for production.

## Run locally

**Prerequisite:** Node.js 22 or later.

1. Install dependencies: `npm install`
2. Create `.env.local` in the project root and add `GEMINI_API_KEY=your_gemini_api_key`.
3. Start the app: `npm run dev`

The local server hosts both the Vite app and API at `http://localhost:3000`.

## Deploy the frontend to Vercel and the API to Render

The included `render.yaml` deploys the Express API as a Render web service. The included `vercel.json` sends frontend `/api/*` requests to `https://edunexus-backend.onrender.com`, so the existing relative API requests and live-update stream continue to work without browser cross-origin configuration.

1. Push the project to a Git provider supported by Render and Vercel.
2. In Render, create a new **Blueprint** from the repository. Render reads `render.yaml` from the repository root. Set the secret `GEMINI_API_KEY` when prompted and deploy the `edunexus-backend` service.
3. In Vercel, import the same repository. Use the repository root as the project root. Vercel detects Vite; the build command is `npm run build` and the output directory is `dist`.
4. Confirm the Render service URL is `https://edunexus-backend.onrender.com`. If Render assigns a different URL, update the destination in `vercel.json` to that URL and redeploy Vercel.
5. Verify the connection at `https://<your-vercel-domain>/api/health`. It should return a JSON response with `"status": "healthy"`.

The Render free plan may take a short time to wake after inactivity. The Express API currently keeps its demo records in process memory; those changes are not durable and are lost when the Render service restarts or redeploys. Configure persistent storage before using this deployment for real institutional data.

`python_app/` is a separate FastAPI backend with a different API contract; this deployment configuration targets the Express API that the current frontend uses.
