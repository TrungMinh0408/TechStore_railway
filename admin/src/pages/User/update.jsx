import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, message, Modal } from "antd";
import {
  ArrowLeft,
  Users,
  User as UserIcon,
  ShieldCheck,
  Search,
  X,
  Trash2,
  UserPlus,
} from "lucide-react";

import branchApi from "../../api/branchApi";
import accountApi from "../../api/accountApi";
import userBranchApi from "../../api/userApi";

const normalizeRole = (role) => String(role || "").trim().toLowerCase();
const isManagerRole = (role) => normalizeRole(role) === "branch_manager";

export default function BranchPersonnelUpdate() {
  const { id: branchId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState(null);
  const [personnel, setPersonnel] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(null);


  const [assignedUserIds, setAssignedUserIds] = useState(new Set());


  const [pickOpen, setPickOpen] = useState(false);
  const [pickUser, setPickUser] = useState(null);
  const [pickRole, setPickRole] = useState("staff"); // "staff" | "branch_manager"

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branchRes, personnelRes, accountsRes, assignedRes] =
        await Promise.all([
          branchApi.getById(branchId),
          userBranchApi.getPersonnel(branchId),
          accountApi.getAll(),
          userBranchApi.getAssignedUserIds(), // ✅ danh sách userIds đã được gán ở đâu đó
        ]);

      setBranch(branchRes.data);
      setPersonnel(personnelRes.data || []);
      setAccounts(accountsRes.data?.users || []);

      const ids = (assignedRes.data?.userIds || []).map((x) => String(x));
      setAssignedUserIds(new Set(ids));
    } catch (e) {
      console.error(e);
      message.error("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  const hasManager = useMemo(
    () => personnel.some((p) => isManagerRole(p?.role)),
    [personnel]
  );

  const currentManager = useMemo(
    () => personnel.find((p) => isManagerRole(p?.role)) || null,
    [personnel]
  );

  // ✅ các userId đã thuộc chi nhánh hiện tại
  const assignedIds = useMemo(() => {
    return new Set(personnel.map((p) => p?.userId?._id).filter(Boolean));
  }, [personnel]);

  const normalizedQ = q.trim().toLowerCase();

  // ✅ Candidates: "chưa thuộc chi nhánh hiện tại" + "chưa thuộc chi nhánh khác" + search
  const candidates = useMemo(() => {
    return accounts
      .filter((u) => u?.isActive !== false)
      .filter((u) => normalizeRole(u?.role) !== "admin")
      // ❌ đã thuộc chi nhánh hiện tại thì không hiện
      .filter((u) => !assignedIds.has(u?._id))
      // ✅ NEW: đã thuộc chi nhánh khác (bất kỳ) thì ẩn luôn
      // (vì assignedUserIds chứa tất cả userId đang nằm trong userBranches)
      .filter((u) => !assignedUserIds.has(String(u?._id)))
      .filter((u) => {
        if (!normalizedQ) return true;
        const name = (u?.name || "").toLowerCase();
        const email = (u?.email || "").toLowerCase();
        const code = (u?.userCode || "").toLowerCase();
        return (
          name.includes(normalizedQ) ||
          email.includes(normalizedQ) ||
          code.includes(normalizedQ)
        );
      });
  }, [accounts, assignedIds, assignedUserIds, normalizedQ]);

  const confirmRemove = (mapping) => {
    Modal.confirm({
      title: "Gỡ nhân sự khỏi chi nhánh?",
      content: "Thao tác này sẽ xóa liên kết user-branch.",
      okText: "Gỡ",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setBusy(mapping?._id);
          await userBranchApi.remove(mapping?._id);
          message.success("Đã gỡ nhân sự.");
          fetchData();
        } catch (e) {
          console.error(e);
          message.error("Gỡ thất bại.");
        } finally {
          setBusy(null);
        }
      },
    });
  };

  const addStaff = async (userId) => {
    try {
      setBusy(userId);
      await userBranchApi.addStaff({ branchId, userId });
      message.success("Đã thêm staff.");
      fetchData();
    } catch (e) {
      console.error(e);
      message.error("Thêm staff thất bại.");
    } finally {
      setBusy(null);
    }
  };

  const assignManager = async (userId) => {
    try {
      setBusy(userId);
      await userBranchApi.assignManager({ branchId, userId }); // backend sẽ set role = "branch_manager"
      message.success("Đã gán manager.");
      fetchData();
    } catch (e) {
      console.error(e);
      message.error("Gán manager thất bại.");
    } finally {
      setBusy(null);
    }
  };

  // ✅ Mở modal chọn role
  const openPickRole = (u) => {
    setPickUser(u);
    setPickRole("staff"); // default staff
    setPickOpen(true);
  };

  const closePickRole = () => {
    if (busy) return;
    setPickOpen(false);
    setPickUser(null);
    setPickRole("staff");
  };

  const confirmPickRole = async () => {
    if (!pickUser?._id) return;

    try {
      setBusy(pickUser._id);

      if (pickRole === "branch_manager") {
        await assignManager(pickUser._id);
      } else {
        await addStaff(pickUser._id);
      }

      setPickOpen(false);
      setPickUser(null);
      setPickRole("staff");
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-sm text-black/60 font-bold">
          Không tìm thấy chi nhánh.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-6 lg:p-10">
      <div className="w-full space-y-8">
        {/* TOP BAR */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
          <button
            onClick={() => navigate(`/branches/view/${branchId}`)}
            className="group flex items-center gap-3 font-black text-[11px] tracking-[0.2em] uppercase"
          >
            <span className="p-2 bg-white border border-black rounded-lg group-hover:bg-black group-hover:text-white transition">
              <ArrowLeft size={16} />
            </span>
            Quay lại chi nhánh
          </button>

          <div className="text-[10px] font-black uppercase tracking-widest text-black/30">
            System Records / Verified
          </div>
        </div>

        {/* TITLE */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Users size={18} />
              <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight">
                Cập nhật nhân sự — {branch.name}
              </h1>
            </div>
            <p className="text-xs text-black/50 font-bold uppercase tracking-wider">
              Manager tối đa 1 • Thêm staff theo nhu cầu • Không add trùng
            </p>
          </div>
        </div>

        {/* MAIN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: CANDIDATES */}
          <div className="lg:col-span-8">
            <div className="border border-slate-100 rounded-3xl overflow-hidden">
              {/* controls */}
              <div className="p-5 lg:p-6 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-slate-200 w-full">
                    <Search size={16} className="text-black/40" />
                    <input
                      className="w-full outline-none text-sm font-semibold placeholder:text-black/20"
                      placeholder="Tìm theo tên / email / mã..."
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                    {q ? (
                      <button
                        onClick={() => setQ("")}
                        className="p-1 rounded-lg hover:bg-slate-50"
                        title="Xóa"
                      >
                        <X size={16} />
                      </button>
                    ) : null}
                  </div>

                  <div className="hidden lg:flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/30">
                      Ứng viên: {candidates.length}
                    </span>
                  </div>
                </div>

                {/* info line */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/30">
                    Ứng viên chưa thuộc chi nhánh (và chưa thuộc chi nhánh khác)
                  </span>

                  {hasManager ? (
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/30">
                      Đã có manager → khi thêm chỉ chọn Staff
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/30">
                      Bấm Thêm → chọn Staff hoặc Manager
                    </span>
                  )}
                </div>
              </div>

              {/* list */}
              <div className="p-3 lg:p-4">
                {candidates.length === 0 ? (
                  <div className="p-10 text-center border border-dashed border-slate-200 rounded-2xl">
                    <p className="text-xs text-black/40 font-black uppercase tracking-widest">
                      Không có ứng viên phù hợp
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {candidates.map((u) => {
                      const isSubmitting = busy === u?._id;

                      return (
                        <div
                          key={u._id}
                          className="flex items-center gap-4 py-4 px-2 lg:px-4 hover:bg-slate-50 rounded-xl transition"
                        >
                          <Avatar
                            size={44}
                            src={u?.avatar}
                            icon={<UserIcon />}
                            className="bg-slate-100"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black uppercase tracking-tight truncate">
                              {u?.name}
                            </p>
                            <p className="text-[11px] text-black/40 font-medium truncate">
                              {u?.email} • {u?.userCode || "N/A"}
                            </p>
                          </div>

                          <button
                            onClick={() => openPickRole(u)}
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition disabled:opacity-50"
                          >
                            <UserPlus size={14} />
                            {isSubmitting ? "Đang xử lý..." : "Thêm"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: CURRENT */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-10 space-y-6">
              {/* Manager card */}
              <div
                className="border-2 border-black rounded-[2.5rem] p-6"
              >
                <div className="flex items-center gap-3 text-black font-black text-[11px] uppercase tracking-[0.25em]">
                  <ShieldCheck size={18} />
                  <span>Manager In Charge</span>
                </div>

                <div className="mt-5">
                  {currentManager ? (
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <Avatar
                        size={52}
                        src={currentManager?.userId?.avatar}
                        icon={<UserIcon />}
                        className="bg-black"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black uppercase tracking-tight truncate">
                          {currentManager?.userId?.name}
                        </p>
                        <p className="text-[11px] text-black/40 font-medium truncate">
                          {currentManager?.userId?.email}
                        </p>
                      </div>

                      <button
                        onClick={() => confirmRemove(currentManager)}
                        disabled={busy === currentManager?._id}
                        className="p-2 rounded-xl border border-black hover:bg-black hover:text-white transition disabled:opacity-50"
                        title="Gỡ manager"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
                        Chưa có manager
                      </p>
                      <p className="mt-2 text-[11px] text-black/30 font-semibold">
                        Bấm Thêm → chọn Manager để gán 1 người.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Personnel list */}
              <div className="border border-slate-100 rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-[11px] font-black uppercase tracking-widest text-black/40">
                    Nhân sự thuộc chi nhánh
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/30">
                    {personnel.length}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {personnel.length === 0 ? (
                    <p className="text-slate-400 text-xs italic uppercase tracking-widest py-2">
                      Chưa có dữ liệu nhân sự...
                    </p>
                  ) : (
                    personnel.map((p) => {
                      const u = p?.userId;
                      const isSubmitting = busy === p?._id;

                      return (
                        <div
                          key={p._id}
                          className="flex items-center gap-3 p-3 border border-slate-100 rounded-2xl"
                        >
                          <Avatar
                            size={40}
                            src={u?.avatar}
                            icon={<UserIcon />}
                            className="bg-slate-100"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black uppercase tracking-tight truncate">
                              {u?.name}
                            </p>
                            <p className="text-[11px] text-black/40 font-medium truncate">
                              {isManagerRole(p?.role) ? "Manager" : "Staff"}
                            </p>
                          </div>

                          <button
                            onClick={() => confirmRemove(p)}
                            disabled={isSubmitting}
                            className="p-2 rounded-xl border border-black hover:bg-black hover:text-white transition disabled:opacity-50"
                            title="Gỡ"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="text-[9px] text-black/30 font-black uppercase tracking-[0.35em] leading-relaxed">
                Centralized Management System <br /> Authenticated Data Only
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ MODAL CHỌN ROLE */}
      <Modal
        open={pickOpen}
        onCancel={closePickRole}
        onOk={confirmPickRole}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ disabled: !!busy }}
        cancelButtonProps={{ disabled: !!busy }}
        title="Chọn vai trò trong chi nhánh"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
            <Avatar size={44} src={pickUser?.avatar} icon={<UserIcon />} />
            <div className="min-w-0">
              <p className="font-black uppercase truncate">{pickUser?.name}</p>
              <p className="text-xs text-black/50 truncate">{pickUser?.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-widest text-black/40">
              Vai trò
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPickRole("staff")}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition
                  ${pickRole === "staff"
                    ? "border-black bg-black text-white"
                    : "border-slate-200 bg-white"
                  }
                `}
              >
                Staff
              </button>

              <button
                type="button"
                onClick={() => !hasManager && setPickRole("branch_manager")}
                disabled={hasManager}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition
                  ${pickRole === "branch_manager"
                    ? "border-black bg-black text-white"
                    : "border-slate-200 bg-white"
                  }
                `}
                title={hasManager ? "Chi nhánh đã có manager" : "Gán làm manager"}
              >
                Manager
              </button>
            </div>

            {hasManager ? (
              <p className="text-xs text-black/40">
                Chi nhánh đã có manager → chỉ có thể thêm Staff.
              </p>
            ) : (
              <p className="text-xs text-black/40">
                Bạn có thể chọn Staff hoặc Manager (tối đa 1 manager).
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
