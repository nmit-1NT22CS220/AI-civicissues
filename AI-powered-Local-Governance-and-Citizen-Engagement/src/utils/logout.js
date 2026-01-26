import { useNavigate } from 'react-router-dom';

export const handleLogout = (navigate) => {
  // Clear all localStorage data
  localStorage.removeItem("citizen_username");
  localStorage.removeItem("uid");
  localStorage.removeItem("admin_username");
  localStorage.removeItem("officer_name");
  
  // Set logout success flag
  localStorage.setItem("logout_success", "true");
  
  // Navigate to home page
  navigate("/");
};
