import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Container from "react-bootstrap/Container";
import "../../Assets/CSS/style.css";
import heroVideo from "../../Assets/videos/1761381301391.mp4";
import About from "./About";
import Statistics from "./Statistics";
import Testimonials from "./Testimonials";
import HowItWorks from "./HowItWorks";
import Features from "./Features";
import Navbar from "../Navbar";
import { Link } from "react-router-dom";
import AnimatedButton from "../AnimatedButton";
import ScrollAnimation from "../ScrollAnimation";
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem } from "../../utils/animations";

function Hero() {
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);

  useEffect(() => {
    // Check if user just logged out
    const logoutSuccess = localStorage.getItem("logout_success");
    if (logoutSuccess === "true") {
      setShowLogoutMessage(true);
      // Clear the flag
      localStorage.removeItem("logout_success");
      // Hide message after 3 seconds
      setTimeout(() => {
        setShowLogoutMessage(false);
      }, 3000);
    }
  }, []);
  return (
    <div>
      {/* <Navbar /> */}

      {/* Logout Success Message */}
      {showLogoutMessage && (
        <motion.div 
          className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="flex items-center gap-2">
            <motion.span 
              className="text-xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              ✅
            </motion.span>
            <span className="font-semibold">You have logged out successfully!</span>
          </div>
        </motion.div>
      )}

      <Container className="main_container">
        <motion.section 
          className="text-gray-700 body-font"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <div className="container mx-auto flex px-5 py-20 md:flex-row flex-col items-center">
            {/* Left - Hero Illustration */}
            <motion.div 
              className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6 mb-10 md:mb-0 drop-shadow-xl"
              variants={fadeInLeft}
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ duration: 0.3 }}
            >
              <motion.video
                className="object-cover object-center rounded-xl w-full h-auto rounded-xl overflow-hidden"
                autoPlay
                loop
                muted
                playsInline
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
                style={{ 
                  objectFit: 'cover',
                  objectPosition: 'center',
                  transform: 'scale(1.1)',
                  transformOrigin: 'center'
                }}
              >
                <source src={heroVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </motion.video>
            </motion.div>

            {/* Right - Text Section */}
            <motion.div 
              className="lg:flex-grow md:w-1/2 lg:pl-20 md:pl-14 flex flex-col md:items-start md:text-left items-center text-left"
              variants={fadeInRight}
            >
              <motion.h1 
                className="title-font sm:text-5xl text-3xl mb-4 font-bold text-gray-900 leading-tight"
                variants={staggerItem}
              >
                Citizen Grievance Redressal Portal
              </motion.h1>
              <motion.p 
                className="mb-8 leading-relaxed text-gray-600 text-lg"
                variants={staggerItem}
              >
                Transform your community with the power of digital governance. Report civic issues like waste management, roads, lighting, or water supply — all in one place. Track updates, get transparent responses, and be part of a responsive governance system that listens to you.
              </motion.p>
              <motion.div 
                className="mb-8 flex flex-wrap gap-4 text-sm"
                variants={staggerItem}
              >
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                  ✓ 24/7 Support
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                  ✓ Real-time Tracking
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                  ✓ Secure Platform
                </span>
              </motion.div>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                variants={staggerItem}
              >
                <Link to="/register">
                  <AnimatedButton 
                    variant="primary"
                    className="inline-flex py-3 px-8 text-lg font-semibold w-full sm:w-auto"
                  >
                    Register Complaint
                  </AnimatedButton>
                </Link>
                <Link to="/login">
                  <AnimatedButton 
                    variant="outline"
                    className="inline-flex py-3 px-8 text-lg font-semibold w-full sm:w-auto"
                  >
                    Track Status
                  </AnimatedButton>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </Container>

      {/* Statistics Section */}
      <Statistics />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Features Section */}
      <Features />

      {/* Testimonials Section */}
      <Testimonials />

      {/* About Section */}
      <About />
    </div>
  );
}

export default Hero;
