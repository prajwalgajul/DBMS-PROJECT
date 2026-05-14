import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// --- Types ---
interface Route {
  id: string;
  trainNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
}

interface Booking {
  id: string;
  routeId: string;
  passengerName: string;
  passengerEmail: string;
  seatNumber: string;
  bookingDate: string;
  status: 'confirmed' | 'cancelled';
}

// --- In-Memory DB (Transient) ---
let routes: Route[] = [
  { id: '1', trainNumber: '22436', from: 'New Delhi', to: 'Varanasi', departureTime: '2024-06-01T06:00:00Z', arrivalTime: '2024-06-01T14:00:00Z', price: 1750, availableSeats: 450, totalSeats: 1100 },
  { id: '2', trainNumber: '12952', from: 'New Delhi', to: 'Mumbai Central', departureTime: '2024-06-01T16:30:00Z', arrivalTime: '2024-06-02T08:35:00Z', price: 4100, availableSeats: 120, totalSeats: 1200 },
  { id: '3', trainNumber: '12008', from: 'Bengaluru', to: 'Chennai', departureTime: '2024-06-02T06:00:00Z', arrivalTime: '2024-06-02T11:00:00Z', price: 1200, availableSeats: 80, totalSeats: 800 },
  { id: '4', trainNumber: '12301', from: 'Kolkata (HWH)', to: 'New Delhi', departureTime: '2024-06-02T16:50:00Z', arrivalTime: '2024-06-03T10:05:00Z', price: 4500, availableSeats: 200, totalSeats: 1200 },
  { id: '5', trainNumber: '20833', from: 'Visakhapatnam', to: 'Secunderabad', departureTime: '2024-06-03T05:45:00Z', arrivalTime: '2024-06-03T14:15:00Z', price: 1720, availableSeats: 500, totalSeats: 1100 },
  { id: '6', trainNumber: '12261', from: 'Mumbai CST', to: 'Howrah', departureTime: '2024-06-03T17:15:00Z', arrivalTime: '2024-06-04T13:45:00Z', price: 3800, availableSeats: 150, totalSeats: 1000 },
];

let bookings: Booking[] = [];

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
    res.json(routes);
  });

  // Get a specific route
  app.get("/api/routes/:id", (req, res) => {
    const route = routes.find(r => r.id === req.params.id);
    if (!route) return res.status(404).json({ message: "Route not found" });
    res.json(route);
  });

  // Create a booking
  app.post("/api/bookings", (req, res) => {
    const { routeId, passengerName, passengerEmail } = req.body;
    
    const routeIndex = routes.findIndex(r => r.id === routeId);
    if (routeIndex === -1) return res.status(404).json({ message: "Route not found" });
    
    if (routes[routeIndex].availableSeats <= 0) {
      return res.status(400).json({ message: "No seats available" });
    }

    const newBooking: Booking = {
      id: Math.random().toString(36).substring(7),
      routeId,
      passengerName,
      passengerEmail,
      seatNumber: `S-${routes[routeIndex].totalSeats - routes[routeIndex].availableSeats + 1}`,
      bookingDate: new Date().toISOString(),
      status: 'confirmed'
    };

    // Update availability
    routes[routeIndex].availableSeats -= 1;
    bookings.push(newBooking);

    res.status(201).json(newBooking);
  });

  // Create a route (Admin)
  app.post("/api/routes", (req, res) => {
    const { trainNumber, from, to, departureTime, arrivalTime, price, totalSeats } = req.body;
    
    const newRoute: Route = {
      id: Math.random().toString(36).substring(7),
      trainNumber,
      from,
      to,
      departureTime,
      arrivalTime,
      price: Number(price),
      totalSeats: Number(totalSeats),
      availableSeats: Number(totalSeats)
    };

    routes.push(newRoute);
    res.status(201).json(newRoute);
  });

  // Get all bookings
  app.get("/api/bookings", (req, res) => {
    res.json(bookings);
  });

  // Cancel a booking
  app.delete("/api/bookings/:id", (req, res) => {
    const bookingIndex = bookings.findIndex(b => b.id === req.params.id);
    if (bookingIndex === -1) return res.status(404).json({ message: "Booking not found" });

    const booking = bookings[bookingIndex];
    if (booking.status === 'cancelled') return res.status(400).json({ message: "Booking already cancelled" });

    // Restore seat
    const routeIndex = routes.findIndex(r => r.id === booking.routeId);
    if (routeIndex !== -1) {
      routes[routeIndex].availableSeats += 1;
    }

    bookings[bookingIndex].status = 'cancelled';
    res.json({ message: "Booking cancelled", booking: bookings[bookingIndex] });
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
