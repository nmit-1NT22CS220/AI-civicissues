import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SideNav from "./SideNav";
import AddComplaintModal from "./AddComplaintModal";
import ComplaintHistory from "./ComplaintHistory";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { handleLogout } from "../../utils/logout";
import { fadeInUp, staggerContainer, staggerItem } from "../../utils/animations";


function Dashboard() {
  const navigate = useNavigate();
  const [citizen, setCitizen] = useState({
    username: localStorage.getItem("citizen_username") || "",
    uid: localStorage.getItem("uid") || "",
  });

  // Check if citizen data is loaded
  useEffect(() => {
    if (!citizen.username || !citizen.uid) {
      // Citizen data not loaded - user may need to login again
    }
  }, [citizen]);

  return (
    <motion.div 
      className="flex flex-col lg:flex-row min-h-screen bg-gray-50 text-gray-800"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
        {/* Sidebar Navigation */}
        <motion.div 
          className="lg:w-1/5 w-full"
          variants={fadeInUp}
        >
          <SideNav username={citizen.username} />
        </motion.div>

        {/* Main Section */}
        <motion.div 
          className="flex flex-col lg:flex-row justify-between flex-1 p-6 gap-6"
          variants={staggerItem}
        >
          {/* Complaint Submission */}
          <motion.div 
            className="w-full lg:w-1/2 h-full flex justify-center items-start"
            variants={staggerItem}
          >
            <AddComplaintModal />
          </motion.div>

          {/* Complaint History & Feedback */}
          <motion.div 
            className="w-full lg:w-1/2 h-full"
            variants={staggerItem}
          >
            <ComplaintHistory uid={citizen.uid} />
          </motion.div>
        </motion.div>
      </motion.div>
  );
}

export default Dashboard;
