import React, { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Calendar, User, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function TrackComplaints() {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComplaints = async () => {
            const storedUid = localStorage.getItem("uid");
            if (!storedUid) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`http://localhost:8000/history/${storedUid}`);
                const data = await res.json();
                setComplaints(data.reverse());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchComplaints();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "Resolved": return "bg-green-100 text-green-700 border-green-200";
            case "Rejected": return "bg-red-100 text-red-700 border-red-200";
            case "In Progress": return "bg-blue-100 text-blue-700 border-blue-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    if (loading) {
        return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8 pt-24">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate("/citizen/dashboard")}
                        className="p-2 hover:bg-gray-200 rounded-full transition"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">Track My Complaints</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: List */}
                    <div className="lg:col-span-1 space-y-4 h-[80vh] overflow-y-auto pr-2">
                        {complaints.length === 0 ? (
                            <div className="text-center p-8 bg-white rounded-xl shadow-sm">
                                <p className="text-gray-500">No complaints found.</p>
                            </div>
                        ) : (
                            complaints.map((c) => (
                                <div
                                    key={c._id}
                                    onClick={() => setSelectedComplaint(c)}
                                    className={`bg-white p-4 rounded-xl shadow-sm border cursor-pointer transition hover:shadow-md ${selectedComplaint?._id === c._id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-semibold text-gray-800">{c.category}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(c.status)}`}>
                                            {c.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{c.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Calendar size={12} />
                                        <span>{new Date(c.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Right Column: Detail & Timeline */}
                    <div className="lg:col-span-2">
                        {selectedComplaint ? (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

                                {/* Images */}
                                <div className="h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
                                    {selectedComplaint.images && selectedComplaint.images.length > 0 ? (
                                        <div className="flex gap-2 overflow-x-auto p-4 w-full">
                                            {selectedComplaint.images.map((img, i) => (
                                                <img key={i} src={`http://localhost:8000/uploads/${img}`} className="h-56 rounded-lg shadow-md object-cover" alt="complaint" />
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">No Images Uploaded</span>
                                    )}
                                </div>

                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedComplaint.category}</h2>
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <MapPin size={18} />
                                                {selectedComplaint.latitude && selectedComplaint.longitude ? (
                                                    <a
                                                        href={`https://www.google.com/maps?q=${selectedComplaint.latitude},${selectedComplaint.longitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 group"
                                                        title="View on Google Maps"
                                                    >
                                                        <span>{selectedComplaint.location}</span>
                                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗️</span>
                                                    </a>
                                                ) : (
                                                    <span>{selectedComplaint.location}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${getStatusColor(selectedComplaint.status)}`}>
                                            {selectedComplaint.status === 'Resolved' && <CheckCircle size={18} />}
                                            <span className="font-bold">{selectedComplaint.status}</span>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                                        <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
                                            {selectedComplaint.description}
                                        </p>
                                    </div>

                                    {/* Timeline */}
                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-6 flex items-center gap-2">
                                            <Clock size={20} className="text-indigo-500" />
                                            Status Timeline
                                        </h3>

                                        <div className="border-l-2 border-gray-200 ml-3 space-y-8 pl-8 relative">
                                            {/* Legacy/Initial Status */}
                                            {(!selectedComplaint.statusHistory || selectedComplaint.statusHistory.length === 0) && (
                                                <div className="relative">
                                                    <span className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-gray-300 border-4 border-white shadow-sm"></span>
                                                    <div>
                                                        <p className="font-bold text-gray-800">{selectedComplaint.status}</p>
                                                        <p className="text-sm text-gray-500 mb-1">{new Date(selectedComplaint.date).toLocaleString()}</p>
                                                        <p className="text-sm text-gray-600">Complaint filed</p>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedComplaint.statusHistory && selectedComplaint.statusHistory.map((history, idx) => (
                                                <div key={idx} className="relative">
                                                    <span className={`absolute -left-[41px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${idx === selectedComplaint.statusHistory.length - 1 ? 'bg-indigo-600 scale-125' : 'bg-gray-300'}`}></span>
                                                    <div>
                                                        <p className={`font-bold ${idx === selectedComplaint.statusHistory.length - 1 ? 'text-indigo-600' : 'text-gray-800'}`}>
                                                            {history.status}
                                                        </p>
                                                        <p className="text-sm text-gray-500 mb-1">{new Date(history.timestamp).toLocaleString()}</p>
                                                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 border border-gray-100 italic">
                                                            "{history.remark || 'No remarks'}"
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-2">Updated by: {history.updatedBy}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
                                <Clock size={48} className="mb-4 text-gray-200" />
                                <p>Select a complaint to view details</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default TrackComplaints;
