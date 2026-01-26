import React, { useState, useEffect } from "react";

function AddComplaintModal() {
  const [data, setData] = useState({
    username: localStorage.getItem("citizen_username") || "",
    uid: localStorage.getItem("uid") || "",
    category: "",
    location: "",
    description: "",
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  // AI Prediction State
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const addData = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image file selection with AI Prediction
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit

      if (!isValidType) {
        alert(`❌ ${file.name} is not a valid image file.`);
        return false;
      }
      if (!isValidSize) {
        alert(`❌ ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });

    // Limit to 3 images maximum
    if (images.length + validFiles.length > 3) {
      alert("❌ Maximum 3 images allowed.");
      return;
    }

    setImages(prev => [...prev, ...validFiles]);

    // Create previews
    const newPreviews = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target.result;
        setImagePreviews(prev => [...prev, { file, preview: previewUrl }]);

        // Trigger prediction on the first image if not already predicted
        if (!prediction && validFiles.indexOf(file) === 0) {
          predictCategory(file, previewUrl);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const predictCategory = async (file, previewUrl) => {
    setIsPredicting(true);
    setPrediction({ status: 'scanning', preview: previewUrl });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch("http://localhost:9000/predict", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Prediction failed");

      const result = await res.json();

      // Artificial delay for better UX animation
      setTimeout(() => {
        setPrediction({
          status: 'complete',
          label: result.label,
          confidence: result.confidence,
          preview: previewUrl
        });

        // Auto-select category if confidence is good
        if (result.confidence > 0.6) {
          let matchedCategory = "Others";
          const label = result.label.toLowerCase();

          if (label.includes("road") || label.includes("pothole") || label.includes("street")) matchedCategory = "Roads & Streetlights";
          else if (label.includes("water") || label.includes("pipe")) matchedCategory = "Water Supply";
          else if (label.includes("garbage") || label.includes("trash") || label.includes("waste")) matchedCategory = "Garbage / Sanitation";
          else if (label.includes("electricity") || label.includes("pole") || label.includes("wire")) matchedCategory = "Electricity";
          else if (label.includes("health") || label.includes("stray")) matchedCategory = "Health / Safety";

          setData(prev => ({ ...prev, category: matchedCategory }));
        }
        setIsPredicting(false);
      }, 1500);

    } catch (error) {
      console.error("Prediction error:", error);
      setPrediction(null);
      setIsPredicting(false);
    }
  };

  // Remove image
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    if (images.length <= 1) setPrediction(null); // Clear prediction if all images removed
  };

  async function sendData(e) {
    e.preventDefault();
    setUploading(true);

    if (!data.username || !data.uid || !data.category || !data.location || !data.description) {
      alert("❌ Please fill in all required fields!");
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('username', data.username);
      formData.append('uid', data.uid);
      formData.append('category', data.category);
      formData.append('location', data.location);
      formData.append('description', data.description);
      formData.append('departmentOfficer', 'officer');
      formData.append('status', 'Submitted');

      images.forEach((image) => {
        formData.append(`images`, image);
      });

      const res = await fetch("http://localhost:8000/complaints", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("✅ Complaint submitted successfully!");
        setData({
          username: localStorage.getItem("citizen_username") || "",
          uid: localStorage.getItem("uid") || "",
          category: "",
          location: "",
          description: "",
        });
        setImages([]);
        setImagePreviews([]);
        setPrediction(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        const errorData = await res.json();
        alert(`❌ Failed to submit complaint: ${errorData.msg || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Server error. Try again later.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100 p-4">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* LEFT COLUMN: FORM */}
          <div className="p-8">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-indigo-600">📝</span> Submit Grievance
            </h2>

            <form onSubmit={sendData} className="space-y-5 text-gray-700">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Username</label>
                  <input
                    name="username"
                    type="text"
                    value={data.username}
                    readOnly
                    className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">UID</label>
                  <input
                    name="uid"
                    type="text"
                    value={data.uid}
                    readOnly
                    className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Category</label>
                <div className="relative">
                  <select
                    name="category"
                    value={data.category}
                    onChange={addData}
                    required
                    className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none appearance-none"
                  >
                    <option value="">Select category</option>
                    <option>Roads & Streetlights</option>
                    <option>Water Supply</option>
                    <option>Garbage / Sanitation</option>
                    <option>Electricity</option>
                    <option>Health / Safety</option>
                    <option>Others</option>
                  </select>
                  <div className="absolute right-3 top-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Location</label>
                <input
                  name="location"
                  type="text"
                  placeholder="e.g., Ward 12, JP Nagar"
                  value={data.location}
                  onChange={addData}
                  required
                  className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea
                  name="description"
                  placeholder="Describe the issue in detail..."
                  value={data.description}
                  onChange={addData}
                  required
                  rows="3"
                  className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Photos (Max 3)</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span className="text-sm font-medium">Click to upload images</span>
                  </div>
                </div>
              </div>

              {/* Thumbnails */}
              {imagePreviews.length > 0 && (
                <div className="flex gap-2 mt-2 bg-gray-50 p-2 rounded-lg">
                  {imagePreviews.map((item, index) => (
                    <div key={index} className="relative w-16 h-16 rounded overflow-hidden border border-gray-200">
                      <img src={item.preview} alt="thumb" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={uploading}
                className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transform transition-transform active:scale-95 flex items-center justify-center gap-2 ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                  }`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Submitting...
                  </>
                ) : (
                  <>🚀 Submit Complaint</>
                )}
              </button>

            </form>
          </div>

          {/* RIGHT COLUMN: AI ANALYSIS & PREDICTION VISUALIZATION */}
          <div className="bg-gray-50 border-l border-gray-100 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">

            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 -left-10 w-40 h-40 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
              <div className="absolute top-0 -right-10 w-40 h-40 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-40 h-40 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
            </div>

            {!prediction && !isPredicting ? (
              <div className="z-10 text-gray-400">
                <div className="mb-4 bg-white p-6 rounded-full inline-block shadow-sm">
                  <svg className="w-16 h-16 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-500 mb-2">AI-Powered Analysis</h3>
                <p className="text-sm max-w-xs mx-auto">Upload an image to let our AI automatically detect the issue and category.</p>
              </div>
            ) : (
              <div className="z-10 w-full max-w-sm">

                {/* Scanning Animation */}
                {prediction?.status === 'scanning' && (
                  <div className="relative">
                    <div className="w-full h-64 bg-gray-900 rounded-xl overflow-hidden relative shadow-lg">
                      <img src={prediction.preview} alt="Scanning" className="w-full h-full object-cover opacity-80" />

                      {/* Scanning Line */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/70 text-green-400 px-4 py-2 rounded font-mono text-sm animate-pulse border border-green-500/50">
                          ANALYZING IMAGE...
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Result Display */}
                {prediction?.status === 'complete' && (
                  <div className="animate-in fade-in zoom-in duration-500">
                    <div className="relative w-full h-48 bg-gray-900 rounded-t-xl overflow-hidden">
                      <img src={prediction.preview} alt="Result" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent h-20"></div>
                      <div className="absolute bottom-3 left-4 text-white">
                        <p className="text-xs text-green-400 font-mono mb-0.5">ANALYSIS COMPLETE</p>
                        <h3 className="text-lg font-bold">{prediction.label.replace(/_/g, " ")}</h3>
                      </div>
                    </div>

                    <div className="bg-white rounded-b-xl shadow-lg border border-gray-100 p-5 text-left">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-500">Confidence Score</span>
                        <span className="text-lg font-bold text-indigo-600">{(prediction.confidence * 100).toFixed(1)}%</span>
                      </div>

                      <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${prediction.confidence * 100}%` }}
                        ></div>
                      </div>

                      <div className="p-3 bg-indigo-50 rounded-lg text-sm text-indigo-800 flex gap-2">
                        <span>🤖</span>
                        <span>
                          AI has identified this as <strong>{prediction.label.split('_').pop()}</strong> and auto-selected the category.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>
      </div>

      {/* Custom CSS for Scanning Animation */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default AddComplaintModal;
