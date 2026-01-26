import React, { useState, useEffect } from "react";

function ComplaintHistory() {
  const [historyModal, setHistoryModal] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [rating, setRating] = useState("");
  const [feedback, setFeedback] = useState("");

  // ✅ Fetch complaint history for logged-in citizen
  const fetchComplaints = () => {
    const storedUid = localStorage.getItem("uid");

    if (!storedUid) {
      return;
    }

    fetch(`http://localhost:8000/history/${storedUid}`)
      .then((res) => res.json())
      .then((data) => {
        setComplaints(data.reverse());
      })
      .catch((err) => {
        // Handle fetch error silently
      });
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // ✅ Submit citizen feedback
  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!selectedId || !rating || !feedback) {
      alert("Please fill all feedback details.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/feedback/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolutionRating: rating,
          citizenFeedback: feedback,
        }),
      });

      if (res.ok) {
        alert("✅ Feedback submitted successfully!");
        setFeedbackModal(false);
        setRating("");
        setFeedback("");
        fetchComplaints();
      } else {
        alert("❌ Failed to submit feedback.");
      }
    } catch (err) {
      alert("Server error.");
    }
  };

  // 🎨 Status badge helper with color coding
  const getStatusBadge = (status) => {
    const colors = {
      Submitted: "bg-yellow-100 text-yellow-700",
      "In Progress": "bg-blue-100 text-blue-700",
      Resolved: "bg-green-100 text-green-700",
      Rejected: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold transition ${colors[status] || "bg-gray-100 text-gray-600"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <section className="text-gray-700 min-h-screen bg-gray-50 p-6">
      {/* ✅ Feedback Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-xl w-[450px] shadow-2xl animate-fadeIn">
            <h2 className="text-xl font-semibold text-indigo-600 mb-4">
              Submit Feedback
            </h2>
            <form onSubmit={submitFeedback}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Complaint ID
                </label>
                <input
                  type="text"
                  value={selectedId}
                  readOnly
                  className="w-full py-2 px-3 border border-gray-300 rounded bg-gray-100 text-gray-600"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Resolution Satisfaction
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full border border-gray-300 py-2 px-3 rounded focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value="">Select rating</option>
                  <option>Very Satisfied</option>
                  <option>Satisfied</option>
                  <option>Neutral</option>
                  <option>Unsatisfied</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Your Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows="3"
                  className="w-full border border-gray-300 py-2 px-3 rounded focus:outline-none focus:border-indigo-500"
                  placeholder="Write about your experience..."
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-5 py-2 rounded-md hover:bg-green-600 transition"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackModal(false)}
                  className="bg-gray-400 text-white px-5 py-2 rounded-md hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Complaint History Modal */}
      {historyModal && (
        <div className="fixed inset-0 z-10 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-11/12 md:w-3/4 max-h-[80vh] overflow-auto animate-fadeIn">
            <h2 className="text-lg font-bold mb-3 text-indigo-600 text-center">
              Complaint History
            </h2>

            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">#</th>
                  <th className="py-3 px-4 text-left">Category</th>
                  <th className="py-3 px-4 text-left">Location</th>
                  {/* <th className="py-3 px-4 text-left">Officer</th> */}
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Comments</th>
                  <th className="py-3 px-4 text-left">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center text-gray-500 py-6 italic"
                    >
                      No complaints found yet. Try submitting one!
                    </td>
                  </tr>
                ) : (
                  complaints.map((c, i) => (
                    <tr key={c._id} className="border-t hover:bg-gray-50">
                      <td className="py-2 px-4">{i + 1}</td>
                      <td className="py-2 px-4">{c.category}</td>
                      <td className="py-2 px-4">{c.location}</td>
                      {/* <td className="py-2 px-4">{c.departmentOfficer || "—"}</td> */}
                      <td className="py-2 px-4">{getStatusBadge(c.status)}</td>
                      <td className="py-2 px-4 text-gray-600 max-w-[250px]">
                        {c.comments || "No comments"}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <div className="flex flex-col gap-2">
                          {/* Images */}
                          {(() => {
                            console.log("🔍 Checking images for complaint:", c._id, "Images:", c.images, "Type:", typeof c.images, "Length:", Array.isArray(c.images) ? c.images.length : 'not array');
                            
                            // Handle both array and object formats
                            let imageArray = [];
                            if (Array.isArray(c.images)) {
                              imageArray = c.images;
                            } else if (c.images && typeof c.images === 'object') {
                              imageArray = Object.values(c.images).filter(img => img && img.trim() !== '');
                            }
                            
                            console.log("🔍 Processed image array:", imageArray);
                            
                            return imageArray.length > 0 ? (
                              <div className="flex gap-1 justify-center">
                                {imageArray.slice(0, 2).map((image, idx) => (
                                  <img
                                    key={idx}
                                    src={`http://localhost:8000/uploads/${image}`}
                                    alt={`Complaint ${idx + 1}`}
                                    className="w-8 h-8 object-cover rounded border hover:scale-110 transition-transform cursor-pointer"
                                    onError={(e) => {
                                      console.error("❌ Image load error:", image, e);
                                      e.target.style.display = 'none';
                                    }}
                                    onLoad={() => {
                                      console.log("✅ Image loaded successfully:", image);
                                    }}
                                    title={`Click to view image ${idx + 1}`}
                                  />
                                ))}
                                {imageArray.length > 2 && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded flex items-center">
                                    +{imageArray.length - 2}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">No images</span>
                            );
                          })()}
                          <button
                            onClick={() => {
                              setSelectedId(c._id);
                              setFeedbackModal(true);
                              setHistoryModal(false);
                            }}
                            className="text-blue-600 hover:text-blue-800 transition"
                            title="Give Feedback"
                          >
                            🖊️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="text-center mt-4">
              <button
                onClick={() => setHistoryModal(false)}
                className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Dashboard Card */}
      <div className="max-w-5xl mx-auto mt-10">
        {/* Complaint History Card */}
        <div className="flex items-center justify-between p-6 rounded-lg bg-white shadow-md border border-gray-200 hover:shadow-lg transition">
          <div>
            <h2 className="text-gray-800 text-lg font-bold">
              Complaint History
            </h2>
            <button
              onClick={() => setHistoryModal(true)}
              className="mt-5 px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 transition"
            >
              View Records
            </button>
          </div>
          <div className="bg-indigo-100 w-24 h-24 flex items-center justify-center rounded-full border-2 border-indigo-400">
            <span className="text-indigo-600 text-xl font-bold">📜</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ComplaintHistory;
