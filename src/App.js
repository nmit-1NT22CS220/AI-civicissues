import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";

// 🔹 Global Components
import CitizenNavbar from "./Components/Navbar";
import ParticleBackground from "./Components/ParticleBackground";

// 🔹 Pages
import Hero from "./Components/home/Hero";
import About from "./Components/About";
import Contact from "./Components/Contact";
import Login from "./Components/Login";
import Register from "./Components/Register";
import TrackComplaints from "./Components/TrackComplaints";

// 🔹 Dashboards
import CitizenDashboard from "./Components/Dashboard/Dashboard";
import AdminDashboard from "./Components/Dashboard/AdminDashboard";
import OfficerDashboard from "./Components/Dashboard/ResolverDashboard";

// 🔹 Optional future pages
// import About from "./Components/About";
// import Contact from "./Components/Contact";

function AppContent() {
  const location = useLocation();

  return (
    <div className="App bg-gray-50 min-h-screen relative">
      {/* 🌐 Particle Background */}
      <ParticleBackground />

      {/* 🌐 Top Navbar (Visible on all pages) */}
      <CitizenNavbar />

      {/* 🔹 App Routes with Animations */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Hero />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Citizen Dashboard */}
          <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
          <Route path="/track-complaints" element={<TrackComplaints />} />

          {/* Department Officer Dashboard */}
          <Route path="/officer/dashboard" element={<OfficerDashboard />} />

          {/* Admin Dashboard */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Future Pages */}
          {/* <Route path="/about" element={<About />} /> */}
          {/* <Route path="/contact" element={<Contact />} /> */}
        </Routes>
      </AnimatePresence>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
