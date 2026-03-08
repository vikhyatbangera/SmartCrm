import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Trash2, UserCheck, Clock } from "lucide-react";

export default function UserApprovals() {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState({});
  const [selectedManagers, setSelectedManagers] = useState({});

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.data || []);
    } catch {
      toast.error("Failed to load users");
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await api.get("/users?role=manager");
      const managerList = res.data.data || [];

      const map = {};
      managerList.forEach((m) => {
        map[m._id] = m.name;
      });

      setManagers(map);
    } catch {
      toast.error("Failed to load managers");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchManagers();
  }, []);

  const handleApprove = async (user) => {
    try {
      if (user.role === "sales" && !selectedManagers[user._id]) {
        return toast.error("Please assign a manager first");
      }

      await api.put(`/users/approve/${user._id}`, {
        managerId: selectedManagers[user._id],
      });

      fetchUsers();
      toast.success("User Approved Successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed");
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Reject this user?")) {
      await api.delete(`/users/${id}`);
      fetchUsers();
      toast.success("User Rejected");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this user?")) {
      await api.delete(`/users/${id}`);
      fetchUsers();
      toast.success("User Deleted");
    }
  };

  const pendingUsers = users.filter((u) => !u.isApproved);
  const approvedUsers = users.filter((u) => u.isApproved);

  return (
    <div className=" p-8 bg-[#121212] min-h-screen text-white">
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-orange-400">User Management</h1>
        <p className="text-gray-400 mt-1">Manage user approvals and access control</p>
      </div>

      {/* ================= PENDING SECTION ================= */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Clock size={22} className="text-orange-500" />
          <h2 className="text-xl font-semibold text-orange-400">
            Pending Approvals ({pendingUsers.length})
          </h2>
        </div>

        {pendingUsers.length === 0 && (
          <div className="bg-[#1f1f1f] shadow-sm rounded-xl p-6 text-gray-400">
            No pending approvals
          </div>
        )}

        <div className="space-y-4">
          {pendingUsers.map((user) => (
            <div
              key={user._id}
              className="bg-[#1f1f1f] border border-orange-500/20 shadow-sm rounded-2xl p-6 flex justify-between items-center hover:shadow-md transition"
            >
              {/* User Info */}
              <div>
                <p className="text-lg font-semibold text-white">{user.name}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {user.email} • {user.role}
                </p>

                {user.role === "sales" && (
                  <select
                    className="mt-3 border border-orange-500 focus:ring-2 focus:ring-orange-400 focus:outline-none p-2 rounded-lg text-sm bg-[#121212] text-white"
                    onChange={(e) =>
                      setSelectedManagers({
                        ...selectedManagers,
                        [user._id]: e.target.value,
                      })
                    }
                  >
                    <option value="">Assign Manager</option>
                    {Object.entries(managers).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(user)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Approve
                </button>

                <button
                  onClick={() => handleReject(user._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= APPROVED SECTION ================= */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <UserCheck size={22} className="text-orange-500" />
          <h2 className="text-xl font-semibold text-orange-400">
            Approved Users ({approvedUsers.length})
          </h2>
        </div>

        {approvedUsers.length === 0 && (
          <div className="bg-[#1f1f1f] shadow-sm rounded-xl p-6 text-gray-400">
            No approved users yet
          </div>
        )}

        <div className="bg-[#1f1f1f] shadow-sm rounded-2xl overflow-hidden border border-orange-500/20">
          {approvedUsers.map((user, index) => (
            <div
              key={user._id}
              className={`flex justify-between items-center p-5 ${
                index !== approvedUsers.length - 1 ? "border-b border-orange-500/20" : ""
              }`}
            >
              <div>
                <p className="font-medium text-white">{user.name}</p>
                <p className="text-sm text-gray-400">
                  {user.email} • {user.role}
                </p>
              </div>

              <button
                onClick={() => handleDelete(user._id)}
                className="text-red-500 hover:text-red-700 transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}