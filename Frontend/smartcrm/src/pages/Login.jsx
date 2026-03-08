import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Login({ setIsAuthenticated, setUser }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("/users/login", form);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setIsAuthenticated(true);
      setUser(data.user);

      toast.success("Welcome back 🔥");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-black via-slate-900 to-orange-900 px-4">
      
      <div className="w-full max-w-md backdrop-blur-lg bg-white/10 border border-orange-400/20 shadow-2xl rounded-2xl p-8 text-white">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-500">
            SmartCRM
          </h1>
          <p className="text-amber-300 text-sm mt-2 font-sans">
            Manage smarter. Close faster.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

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

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-orange-600 hover:bg-orange-700 transition duration-300 font-semibold shadow-lg disabled:bg-orange-400 flex items-center justify-center"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-amber-300 mt-6">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-orange-400 hover:underline font-medium"
          >
            Sign Up
          </Link>
        </p>

      </div>
    </div>
  );
}