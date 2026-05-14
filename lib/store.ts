export interface Route {
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

export interface Booking {
  id: string;
  routeId: string;
  passengerName: string;
  passengerEmail: string;
  seatNumber: string;
  bookingDate: string;
  status: 'confirmed' | 'cancelled';
}

const routes: Route[] = [
  { id: '1', trainNumber: '22436', from: 'New Delhi', to: 'Varanasi', departureTime: '2024-06-01T06:00:00Z', arrivalTime: '2024-06-01T14:00:00Z', price: 1750, availableSeats: 450, totalSeats: 1100 },
  { id: '2', trainNumber: '12952', from: 'New Delhi', to: 'Mumbai Central', departureTime: '2024-06-01T16:30:00Z', arrivalTime: '2024-06-02T08:35:00Z', price: 4100, availableSeats: 120, totalSeats: 1200 },
  { id: '3', trainNumber: '12008', from: 'Bengaluru', to: 'Chennai', departureTime: '2024-06-02T06:00:00Z', arrivalTime: '2024-06-02T11:00:00Z', price: 1200, availableSeats: 80, totalSeats: 800 },
  { id: '4', trainNumber: '12301', from: 'Kolkata (HWH)', to: 'New Delhi', departureTime: '2024-06-02T16:50:00Z', arrivalTime: '2024-06-03T10:05:00Z', price: 4500, availableSeats: 200, totalSeats: 1200 },
  { id: '5', trainNumber: '20833', from: 'Visakhapatnam', to: 'Secunderabad', departureTime: '2024-06-03T05:45:00Z', arrivalTime: '2024-06-03T14:15:00Z', price: 1720, availableSeats: 500, totalSeats: 1100 },
  { id: '6', trainNumber: '12261', from: 'Mumbai CST', to: 'Howrah', departureTime: '2024-06-03T17:15:00Z', arrivalTime: '2024-06-04T13:45:00Z', price: 3800, availableSeats: 150, totalSeats: 1000 },
];

const bookings: Booking[] = [];

export function getRoutes() {
  return routes;
}

export function getRouteById(id: string) {
  return routes.find((route) => route.id === id) || null;
}

export function getBookings() {
  return bookings;
}

export function addRoute(input: {
  trainNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number | string;
  totalSeats: number | string;
}) {
  const totalSeats = Number(input.totalSeats);

  const newRoute: Route = {
    id: Math.random().toString(36).substring(7),
    trainNumber: input.trainNumber,
    from: input.from,
    to: input.to,
    departureTime: input.departureTime,
    arrivalTime: input.arrivalTime,
    price: Number(input.price),
    totalSeats,
    availableSeats: totalSeats,
  };

  routes.push(newRoute);
  return newRoute;
}

export function createBooking(input: {
  routeId: string;
  passengerName: string;
  passengerEmail: string;
}) {
  const routeIndex = routes.findIndex((route) => route.id === input.routeId);

  if (routeIndex === -1) {
    return { status: 404 as const, body: { message: 'Route not found' } };
  }

  if (routes[routeIndex].availableSeats <= 0) {
    return { status: 400 as const, body: { message: 'No seats available' } };
  }

  const newBooking: Booking = {
    id: Math.random().toString(36).substring(7),
    routeId: input.routeId,
    passengerName: input.passengerName,
    passengerEmail: input.passengerEmail,
    seatNumber: `S-${routes[routeIndex].totalSeats - routes[routeIndex].availableSeats + 1}`,
    bookingDate: new Date().toISOString(),
    status: 'confirmed',
  };

  routes[routeIndex].availableSeats -= 1;
  bookings.push(newBooking);

  return { status: 201 as const, body: newBooking };
}

export function cancelBooking(id: string) {
  const bookingIndex = bookings.findIndex((booking) => booking.id === id);

  if (bookingIndex === -1) {
    return { status: 404 as const, body: { message: 'Booking not found' } };
  }

  const booking = bookings[bookingIndex];

  if (booking.status === 'cancelled') {
    return { status: 400 as const, body: { message: 'Booking already cancelled' } };
  }

  const routeIndex = routes.findIndex((route) => route.id === booking.routeId);
  if (routeIndex !== -1) {
    routes[routeIndex].availableSeats += 1;
  }

  bookings[bookingIndex].status = 'cancelled';
  return { status: 200 as const, body: { message: 'Booking cancelled', booking: bookings[bookingIndex] } };
}
