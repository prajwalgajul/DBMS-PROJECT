import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { addRoute, cancelBooking, createBooking, getBookings, getRouteById, getRoutes } from "./lib/store";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);
  const allowedOrigin = process.env.CORS_ORIGIN;

  app.use(express.json());
  app.use((req, res, next) => {
    if (allowedOrigin) {
      res.header("Access-Control-Allow-Origin", allowedOrigin);
      res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type");
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    next();
  });

  // --- API Routes ---

  app.get("/healthz", (req, res) => {
    res.json({ ok: true });
  });

  // Get all routes
  app.get("/api/routes", (req, res) => {
    res.json(getRoutes());
  });

  // Get a specific route
  app.get("/api/routes/:id", (req, res) => {
    const route = getRouteById(req.params.id);
    if (!route) return res.status(404).json({ message: "Route not found" });
    res.json(route);
  });

  // Create a booking
  app.post("/api/bookings", (req, res) => {
    const result = createBooking(req.body);
    res.status(result.status).json(result.body);
  });

  // Create a route (Admin)
  app.post("/api/routes", (req, res) => {
    const newRoute = addRoute(req.body);
    res.status(201).json(newRoute);
  });

  // Get all bookings
  app.get("/api/bookings", (req, res) => {
    res.json(getBookings());
  });

  // Cancel a booking
  app.delete("/api/bookings/:id", (req, res) => {
    const result = cancelBooking(req.params.id);
    res.status(result.status).json(result.body);
  });

  // --- Vite Middleware ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
