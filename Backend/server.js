const express = require("express");
const app = express();
const port = 8000;
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
  })
);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ***** MongoDB Connection *****
// Try local MongoDB first, then fallback to Atlas
const localMongoURL = "mongodb://localhost:27017/citizen_grievance";
const atlasMongoURL = "mongodb+srv://aditigem2003_db_user:Iamthat@cluster0.b4eaxwk.mongodb.net/citizen_grievance?retryWrites=true&w=majority";

// Try local MongoDB first
mongoose
  .connect(localMongoURL)
  .then(() => console.log("✅ Local MongoDB connected successfully"))
  .catch((err) => {
    console.log("❌ Local MongoDB failed, trying Atlas...");
    console.error("Local MongoDB error:", err.message);

    // Fallback to Atlas
    mongoose
      .connect(atlasMongoURL)
      .then(() => console.log("✅ MongoDB Atlas connected successfully"))
      .catch((atlasErr) => {
        console.error("❌ Both MongoDB connections failed:");
        console.error("Local MongoDB error:", err.message);
        console.error("Atlas MongoDB error:", atlasErr.message);
        console.log("💡 Please check your MongoDB setup or IP whitelist");
      });
  });

// ***** User Schema *****
const userSchema = new mongoose.Schema({
  role: { type: String, enum: ["citizen", "officer", "admin"], default: "citizen" },
  name: String,
  username: String,
  email: String,
  password: String,
  uid: String,
  pushToken: String, // Added for mobile push notifications
});

const User = mongoose.model("users", userSchema);

// ***** Complaint Schema *****
const complaintSchema = new mongoose.Schema({
  username: String,
  uid: String,
  departmentOfficer: String,
  category: String,
  location: String,
  latitude: Number, // Added for map support
  longitude: Number, // Added for map support
  description: String,
  images: [String], // Array of image file paths
  date: { type: Date, default: Date.now },
  status: { type: String, default: "Submitted" },
  comments: String,
  resolutionRating: String,
  citizenFeedback: String,
  name: String, // Added to store real user name
  statusHistory: [{
    status: String,
    updatedBy: String,
    remark: String,
    timestamp: { type: Date, default: Date.now }
  }]
});

const Complaint = mongoose.model("complaints", complaintSchema);

// Helper: Send Push Notification
const sendPushNotification = async (expoPushToken, title, body) => {
  if (!expoPushToken) return;

  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: { someData: 'goes here' },
  };

  try {
    await axios.post('https://exp.host/--/api/v2/push/send', message, {
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
    });
    console.log("📲 Notification sent to:", expoPushToken);
  } catch (error) {
    console.error("❌ Error sending notification:", error);
  }
};

// ***** Register User *****
app.post("/register", async (req, res) => {
  try {
    const { role, name, username, email, pass, uid } = req.body;
    const existing = await User.findOne({
      $or: [{ email }, { username }, { uid }],
    });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    await User.create({ role, name, username, email, password: pass, uid });
    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ***** Login *****
app.post("/login", async (req, res) => {
  try {
    const { uname, pass } = req.body;
    console.log("🔐 Login attempt:", { uname, pass });

    if (uname === "admin" && pass === "admin@1234") return res.sendStatus(201);
    if (uname === "officer" && pass === "officer@1234") return res.sendStatus(202);

    console.log("🔍 Searching for user:", uname);
    const user = await User.findOne({ username: uname });
    console.log("👤 User found:", user ? "Yes" : "No");

    if (!user) {
      console.log("❌ User not found");
      return res.status(400).json({ msg: "User not found" });
    }

    if (user.password !== pass) {
      console.log("❌ Invalid password");
      return res.status(400).json({ msg: "Invalid password" });
    }

    console.log("✅ Login successful for:", uname);
    res.status(200).json({ uid: user.uid, role: user.role, username: user.username });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ***** Update Push Token *****
app.post("/update-push-token", async (req, res) => {
  try {
    const { uid, pushToken } = req.body;
    await User.findOneAndUpdate({ uid }, { pushToken });
    console.log(`📲 Push token updated for ${uid}`);
    res.status(200).send("Token updated");
  } catch (e) {
    console.error("Error updating push token", e);
    res.status(500).send("Error");
  }
});

// ***** File Complaint (with images) *****
app.post("/complaints", upload.array('images', 3), async (req, res) => {
  try {
    // Debug: Log everything received
    console.log("📥 Full req.body:", req.body);
    console.log("📥 req.files:", req.files);
    console.log("📥 Content-Type:", req.get('Content-Type'));

    const { username, uid, departmentOfficer, category, location, description, latitude, longitude } = req.body;

    // Debug: Log received data
    console.log("📥 Parsed complaint data:", {
      username,
      uid,
      departmentOfficer,
      category,
      location,
      description,
      latitude,
      longitude
    });
    console.log("📥 Files received:", req.files ? req.files.length : 0);

    // Get uploaded file paths
    const imagePaths = req.files ? req.files.map(file => file.filename) : [];

    console.log("📥 Image paths to save:", imagePaths);
    console.log("📥 Number of images:", imagePaths.length);

    // Validate required fields
    if (!username || !uid || !category || !location || !description) {
      console.error("❌ Missing required fields:", { username, uid, category, location, description });
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const user = await User.findOne({ uid }); // Fetch user to get name
    const name = user ? user.name : username; // Fallback to username if name not found

    const complaint = await Complaint.create({
      username,
      name, // Save the real name
      uid,
      departmentOfficer,
      category,
      location,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      description,
      images: imagePaths,
      statusHistory: [{
        status: "Submitted",
        updatedBy: "citizen",
        remark: "Complaint filed",
        timestamp: new Date()
      }]
    });

    // console.log("✅ Complaint created with images:", complaint.images);

    // Auto-run image prediction on the first uploaded image, if present
    let prediction = null;
    if (imagePaths.length > 0) {
      const imagePath = path.join(uploadsDir, imagePaths[0]);
      console.log("🔍 Attempting prediction for image:", imagePath);

      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        console.error("❌ Image file not found:", imagePath);
      } else {
        const form = new FormData();
        form.append("file", fs.createReadStream(imagePath));

        try {
          console.log("📡 Calling prediction service at http://localhost:9000/predict");
          const resp = await axios.post("http://localhost:9000/predict", form, {
            headers: form.getHeaders(),
            timeout: 15000, // Increased timeout
          });
          prediction = resp.data;
          console.log("✅ Prediction successful:", prediction);
        } catch (err) {
          // Log full error details
          console.error("❌ Prediction error details:");
          console.error("  - Message:", err.message);
          console.error("  - Code:", err.code);
          if (err.response) {
            console.error("  - Status:", err.response.status);
            console.error("  - Data:", err.response.data);
          }
          if (err.code === 'ECONNREFUSED') {
            console.error("  - 💡 Python inference service is not running on port 9000");
            console.error("  - 💡 Start it with: cd inference_service && uvicorn main:app --host 0.0.0.0 --port 9000");
          }
        }
      }
    }

    console.log("✅ Complaint created with images:", complaint);
    res.status(201).json({
      msg: "Complaint submitted successfully",
      complaint,
      images: imagePaths,
      prediction
    });
  } catch (err) {
    console.error("Complaint error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ***** Update Complaint (Admin/Officer) *****
app.put("/complaints/:id", async (req, res) => {
  try {
    const { status, comments, updatedBy } = req.body;
    const { id } = req.params;

    const updateData = { status, comments };

    // Push to history if status changed
    if (status) {
      updateData.$push = {
        statusHistory: {
          status: status,
          updatedBy: updatedBy || 'officer',
          remark: comments || 'Status updated',
          timestamp: new Date()
        }
      };
    }

    const updated = await Complaint.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: "Complaint not found" });

    // Send Push Notification if status changed
    if (status) {
      // Find the user who created the complaint
      const user = await User.findOne({ uid: updated.uid });
      if (user && user.pushToken) {
        await sendPushNotification(
          user.pushToken,
          `Complaint Status Update: ${status}`,
          `Your complaint regarding ${updated.category} is now ${status}. ${comments ? 'Remark: ' + comments : ''}`
        );
      }
    }

    res.json({ msg: "Complaint updated successfully", updated });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ***** Citizen Feedback *****
app.put("/feedback/:id", async (req, res) => {
  try {
    const { resolutionRating, citizenFeedback } = req.body;
    const { id } = req.params;

    const updated = await Complaint.findByIdAndUpdate(
      id,
      { resolutionRating, citizenFeedback },
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: "Complaint not found" });
    res.json({ msg: "Feedback submitted successfully", updated });
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ***** Admin View All Complaints *****
app.get("/admin", async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.json(complaints);
  } catch (err) {
    console.error("Admin view error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ***** Officer View Assigned Complaints *****
app.get("/officer/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const complaints = await Complaint.find({ departmentOfficer: name });
    res.json(complaints);
  } catch (err) {
    console.error("Officer view error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ***** Citizen Complaint History *****
app.get("/history/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const complaints = await Complaint.find({ uid });
    res.json(complaints);
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


// ***** Delete Complaint (Admin Only) *****
app.delete("/complaints/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Complaint.findByIdAndDelete(id);
    res.json({ msg: "Complaint deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ***** Remove User *****
app.delete("/removeUser/:username", async (req, res) => {
  try {
    const { username } = req.params;
    await User.deleteOne({ username });
    res.json({ msg: "User removed successfully" });
  } catch (err) {
    console.error("Remove user error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Server is running!", timestamp: new Date() });
});

// Test uploads directory
app.get("/test-uploads", (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const uploadsDir = path.join(__dirname, 'uploads');

  try {
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      res.json({
        message: "Uploads directory exists",
        path: uploadsDir,
        files: files
      });
    } else {
      res.json({
        message: "Uploads directory does not exist",
        path: uploadsDir
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ***** Simple Complaint (fallback without images) *****
app.post("/complaints-simple", async (req, res) => {
  try {
    console.log("📥 Simple complaint data:", req.body);
    console.log("📥 Request headers:", req.headers);

    const { username, uid, departmentOfficer, category, location, description } = req.body;

    console.log("📥 Parsed fields:", { username, uid, departmentOfficer, category, location, description });

    if (!username || !uid || !category || !location || !description) {
      console.error("❌ Missing fields:", { username, uid, category, location, description });
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const complaint = await Complaint.create({
      username,
      uid,
      departmentOfficer: departmentOfficer || 'officer',
      category,
      location,
      description,
      images: [],
    });

    console.log("✅ Complaint created:", complaint);
    res.status(201).json({ msg: "Complaint submitted successfully", complaint });
  } catch (err) {
    console.error("Simple complaint error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

app.listen(port, () => console.log(`🚀 Citizen Grievance server running on port ${port}`));
