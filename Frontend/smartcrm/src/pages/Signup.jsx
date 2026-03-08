import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Mail, Lock, Eye, EyeOff, Briefcase } from "lucide-react";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "sales",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/users/signup", form);
      toast.success("Account created successfully 🔥");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-black via-slate-900 to-orange-900 px-4">
      
      <div className="w-full max-w-md backdrop-blur-lg bg-white/10 border border-orange-400/20 shadow-2xl rounded-2xl p-8 text-white">

        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-500">
            SmartCRM
          </h1>
          <p className="text-amber-300 text-sm mt-2">
            Create your account and start closing deals
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-amber-400" size={18} />
            <input
              type="text"
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-2 bg-white/20 border border-orange-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-300"
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-amber-400" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-2 bg-white/20 border border-orange-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-300"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-amber-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-10 pr-10 py-2 bg-white/20 border border-orange-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-300"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-amber-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Role Select */}
          <div className="relative">
            <Briefcase className="absolute left-3 top-3 text-amber-400" size={18} />
            <select
              className="w-full pl-10 pr-4 py-2 bg-white/20 border border-orange-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-200"
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
              value={form.role}
            >
              <option value="sales" className="text-black">
                Sales Executive
              </option>
              <option value="manager" className="text-black">
                Manager
              </option>
            </select>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-orange-600 hover:bg-orange-700 transition duration-300 font-semibold shadow-lg disabled:bg-orange-400 flex items-center justify-center"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-amber-300 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-orange-400 hover:underline font-medium"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}