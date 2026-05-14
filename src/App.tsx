import React, { useState, useEffect } from 'react';
import { 
  Train, 
  Search, 
  History, 
  MapPin, 
  Clock, 
  User, 
  Ticket, 
  Info, 
  ArrowRight,
  ShieldCheck,
  X,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function apiUrl(path: string) {
  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

async function parseApiResponse(response: Response) {
  let payload: any = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'bookings' | 'admin'>('search');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Booking Modal State
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [passengerName, setPassengerName] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Admin State
  const [newRoute, setNewRoute] = useState({
    trainNumber: '',
    from: '',
    to: '',
    departureTime: '',
    arrivalTime: '',
    price: '',
    totalSeats: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [routesRes, bookingsRes] = await Promise.all([
        fetch(apiUrl('/api/routes')),
        fetch(apiUrl('/api/bookings'))
      ]);
      const [routesData, bookingsData] = await Promise.all([
        parseApiResponse(routesRes),
        parseApiResponse(bookingsRes)
      ]);
      setRoutes(routesData);
      setBookings(bookingsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load train data.';
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl('/api/routes'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoute)
      });
      await parseApiResponse(res);
      await fetchData();
      setNewRoute({
        trainNumber: '',
        from: '',
        to: '',
        departureTime: '',
        arrivalTime: '',
        price: '',
        totalSeats: ''
      });
      setActiveTab('search');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute) return;

    setBookingLoading(true);
    try {
      const res = await fetch(apiUrl('/api/bookings'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId: selectedRoute.id,
          passengerName,
          passengerEmail
        })
      });

      await parseApiResponse(res);

      await fetchData(); // Refresh data
      setSelectedRoute(null);
      setPassengerName('');
      setPassengerEmail('');
      setActiveTab('bookings');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const cancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      const res = await fetch(apiUrl(`/api/bookings/${id}`), { method: 'DELETE' });
      await parseApiResponse(res);
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateStr));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Train className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">TrackLine India</h1>
          </div>
          
          <nav className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'search' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Search className="w-4 h-4" />
              Trains
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'bookings' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <History className="w-4 h-4" />
              Bookings
              {bookings.length > 0 && (
                <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                  {bookings.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'admin' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 animate-pulse">Loading schedules...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex items-start gap-4">
            <AlertCircle className="text-red-500 w-6 h-6 shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Server Connection Issue</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <p className="text-red-500 text-xs mt-2">If this is on Vercel, redeploy after pulling the latest GitHub changes so the `/api` functions are included.</p>
              <button 
                onClick={fetchData}
                className="mt-4 bg-red-100 hover:bg-red-200 text-red-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'search' ? (
              // ... existing search view ...
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Available Routes</h2>
                    <p className="text-gray-500 text-sm">Real-time availability for today's departures</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {routes.map((route) => (
                    <motion.div
                      layoutId={route.id}
                      key={route.id}
                      className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow group"
                    >
                      <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1 w-full space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                              {route.trainNumber}
                            </span>
                            <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                              <Info className="w-3.5 h-3.5" />
                              Express Service
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="text-2xl font-bold text-gray-900">{route.from}</div>
                              <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(route.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center">
                              <div className="w-full h-px bg-gray-200 relative">
                                <div className="absolute left-0 -top-1 w-2 h-2 rounded-full border-2 border-gray-300 bg-white shadow-sm"></div>
                                <div className="absolute right-0 -top-1 w-2 h-2 rounded-full border-2 border-gray-300 bg-white shadow-sm"></div>
                                <ArrowRight className="absolute left-1/2 -top-2.5 -translate-x-1/2 w-5 h-5 text-gray-300 bg-white px-1" />
                              </div>
                              <span className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest leading-none">
                                Direct
                              </span>
                            </div>

                            <div className="space-y-1 text-right">
                              <div className="text-2xl font-bold text-gray-900">{route.to}</div>
                              <div className="flex items-center justify-end gap-1.5 text-gray-500 text-sm">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(route.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="w-full md:w-px md:h-16 bg-gray-100 hidden md:block"></div>

                        <div className="w-full md:w-48 flex md:flex-col justify-between items-center gap-4">
                          <div className="text-center md:text-left">
                            <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Starting from</div>
                            <div className="text-3xl font-black text-gray-900">
                              <span className="text-sm font-medium text-gray-400 mr-0.5">₹</span>
                              {route.price}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => setSelectedRoute(route)}
                            disabled={route.availableSeats === 0}
                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                              route.availableSeats > 0
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {route.availableSeats > 0 ? (
                              <>
                                <Ticket className="w-4 h-4" />
                                Reserve Now
                              </>
                            ) : (
                              'Sold Out'
                            )}
                          </button>
                          
                          <div className={`text-[10px] font-bold uppercase tracking-wider text-center ${
                            route.availableSeats < 15 ? 'text-orange-500' : 'text-green-500'
                          }`}>
                            {route.availableSeats} seats left
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : activeTab === 'bookings' ? (
              // ... existing bookings view ...
              <motion.div
                key="bookings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Your Bookings</h2>
                    <p className="text-gray-500 text-sm">Manage your upcoming journeys and history</p>
                  </div>
                </div>

                {bookings.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl py-20 flex flex-col items-center justify-center text-center px-6">
                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                      <Ticket className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No bookings yet</h3>
                    <p className="text-gray-500 text-sm mt-1 max-w-xs">Your reserved tickets will appear here once you've made a booking.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {bookings.map((booking) => {
                      const route = routes.find(r => r.id === booking.routeId);
                      return (
                        <div 
                          key={booking.id}
                          className={`bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all ${
                            booking.status === 'cancelled' ? 'opacity-60 grayscale' : ''
                          }`}
                        >
                          <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                              ID: {booking.id}
                            </div>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                              booking.status === 'confirmed' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          
                          <div className="p-6 flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                              <div className="flex items-center gap-4">
                                <div className="space-y-0.5">
                                  <div className="text-sm text-gray-400 font-bold uppercase tracking-wider">From</div>
                                  <div className="font-bold text-gray-900">{route?.from || 'Unknown'}</div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-300" />
                                <div className="space-y-0.5">
                                  <div className="text-sm text-gray-400 font-bold uppercase tracking-wider">To</div>
                                  <div className="font-bold text-gray-900">{route?.to || 'Unknown'}</div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-0.5">
                                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Passenger</div>
                                  <div className="text-sm font-semibold flex items-center gap-1.5 capitalize">
                                    <User className="w-3.5 h-3.5" />
                                    {booking.passengerName}
                                  </div>
                                </div>
                                <div className="space-y-0.5 text-right">
                                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Departure</div>
                                  <div className="text-sm font-semibold flex items-center justify-end gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    {route ? formatDate(route.departureTime) : 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="w-full md:w-48 flex md:flex-col justify-end items-center gap-3">
                              <div className="bg-gray-100 w-full rounded-xl p-3 text-center border border-gray-200">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Seat</div>
                                <div className="text-xl font-black text-gray-900">{booking.seatNumber}</div>
                              </div>
                              
                              {booking.status === 'confirmed' && (
                                <button
                                  onClick={() => cancelBooking(booking.id)}
                                  className="w-full px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                                >
                                  Cancel Booking
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-xl mx-auto"
              >
                <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                    Manage Routes
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">Add new train services to the network</p>

                  <form onSubmit={handleAddRoute} className="mt-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Train Number</label>
                        <input
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium"
                          placeholder="TR-123"
                          value={newRoute.trainNumber}
                          onChange={e => setNewRoute({...newRoute, trainNumber: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Price (₹)</label>
                        <input
                          required
                          type="number"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium"
                          placeholder="99"
                          value={newRoute.price}
                          onChange={e => setNewRoute({...newRoute, price: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest">From</label>
                        <input
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium"
                          placeholder="Departure City"
                          value={newRoute.from}
                          onChange={e => setNewRoute({...newRoute, from: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest">To</label>
                        <input
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium"
                          placeholder="Arrival City"
                          value={newRoute.to}
                          onChange={e => setNewRoute({...newRoute, to: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Departure Time</label>
                        <input
                          required
                          type="datetime-local"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium"
                          value={newRoute.departureTime}
                          onChange={e => setNewRoute({...newRoute, departureTime: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Arrival Time</label>
                        <input
                          required
                          type="datetime-local"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium"
                          value={newRoute.arrivalTime}
                          onChange={e => setNewRoute({...newRoute, arrivalTime: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Seats</label>
                      <input
                        required
                        type="number"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium"
                        placeholder="100"
                        value={newRoute.totalSeats}
                        onChange={e => setNewRoute({...newRoute, totalSeats: e.target.value})}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 mt-4"
                    >
                      Publish Route
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedRoute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRoute(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Confirm Booking</h3>
                  <p className="text-gray-500 text-xs mt-0.5">Please provide passenger details</p>
                </div>
                <button 
                  onClick={() => setSelectedRoute(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 bg-blue-600">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-white">
                    <div className="text-[10px] font-bold opacity-60 uppercase tracking-wider mb-1">Service</div>
                    <div className="text-lg font-black">{selectedRoute.trainNumber}</div>
                  </div>
                  <div className="text-right text-white">
                    <div className="text-[10px] font-bold opacity-60 uppercase tracking-wider mb-1">Ticket Price</div>
                    <div className="text-2xl font-black">₹{selectedRoute.price}</div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-white/90">
                  <div className="space-y-1">
                    <div className="text-sm font-bold">{selectedRoute.from}</div>
                    <div className="text-[10px]">{new Date(selectedRoute.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-40" />
                  <div className="space-y-1 text-right">
                    <div className="text-sm font-bold">{selectedRoute.to}</div>
                    <div className="text-[10px]">{new Date(selectedRoute.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleBook} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      required
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                      placeholder="Jane Doe"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      required
                      type="email"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                      placeholder="jane@example.com"
                      value={passengerEmail}
                      onChange={(e) => setPassengerEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    disabled={bookingLoading}
                    type="submit"
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                  >
                    {bookingLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        Complete Reservation
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                  By clicking this button, you agree to our Terms of Service and Privacy Policy. Confirmation will be sent to your email.
                </p>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
