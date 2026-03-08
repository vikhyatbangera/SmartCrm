import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function EditLead() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    revenue: 0, // ✅ Added revenue
  });

  useEffect(() => {
    fetchLead();
  }, []);

  const fetchLead = async () => {
    try {
      const res = await api.get(`/leads/${id}`);
      setFormData({
        name: res.data.data.name || "",
        email: res.data.data.email || "",
        phone: res.data.data.phone || "",
        revenue: res.data.data.revenue || 0, // ✅ Fetch revenue
      });
    } catch (error) {
      toast.error("Failed to load lead");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === "revenue" ? Number(value) : value, // ✅ Convert to number
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/leads/${id}`, formData);
      toast.success("Lead updated successfully");
      navigate("/leads");
    } catch (error) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-lg p-8 border border-amber-100">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-orange-700">
            Edit Lead
          </h1>
          <p className="text-gray-500 mt-1">
            Update lead information below
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              className="w-full border border-amber-300 focus:ring-2 focus:ring-orange-400 focus:outline-none p-3 rounded-lg transition"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className="w-full border border-amber-300 focus:ring-2 focus:ring-orange-400 focus:outline-none p-3 rounded-lg transition"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full border border-amber-300 focus:ring-2 focus:ring-orange-400 focus:outline-none p-3 rounded-lg transition"
            />
          </div>

          {/* ✅ Revenue Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Revenue (₹)
            </label>
            <input
              type="number"
              name="revenue"
              value={formData.revenue}
              onChange={handleChange}
              min="0"
              placeholder="Enter expected revenue"
              className="w-full border border-amber-300 focus:ring-2 focus:ring-orange-400 focus:outline-none p-3 rounded-lg transition"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/leads")}
              className="px-5 py-2 rounded-lg border border-amber-400 text-amber-700 hover:bg-amber-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition shadow-sm"
            >
              Update Lead
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}