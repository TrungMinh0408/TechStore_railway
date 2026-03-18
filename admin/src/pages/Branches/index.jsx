import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import branchApi from "../../api/branchApi";
import { Plus, Edit, Trash2, Eye, MapPin, Phone, User as UserIcon } from "lucide-react";

export default function BranchList() {
  const [branches, setBranches] = useState([]);

  const fetchBranches = async () => {
    try {
      const res = await branchApi.getAll();
      setBranches(res.data.branches);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Chi nhánh</h1>

        <Link
          to="/branches/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
        >
          <Plus size={18} /> Thêm chi nhánh
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <div
            key={branch._id}
            className={`bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow ${!branch.isActive && "opacity-60"
              }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  #{branch.code}
                </span>
                <h3 className="text-lg font-bold mt-1 text-slate-800">
                  {branch.name}
                </h3>
              </div>

              <div
                className={`px-2 py-1 rounded-full text-xs ${branch.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                  }`}
              >
                {branch.isActive ? "Hoạt động" : "Tạm dừng"}
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600 mb-6">
              <div className="flex items-center gap-2">
                <MapPin size={16} /> {branch.address}
              </div>

              <div className="flex items-center gap-2">
                <Phone size={16} /> {branch.phone || "N/A"}
              </div>

              <div className="flex items-center gap-2">
                <UserIcon size={16} />
                {branch.manager ? branch.manager.name : "Chưa có quản lý"}
              </div>
            </div>

            <div className="flex gap-2 border-t pt-4">
              <Link
                title="Xem"
                to={`/branches/view/${branch._id}`}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                <Eye size={18} />
              </Link>

              <Link
                title="Sửa"
                to={`/branches/update/${branch._id}`}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
              >
                <Edit size={18} />
              </Link>

              <Link
                title="Xóa"
                to={`/branches/delete/${branch._id}`}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={18} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
