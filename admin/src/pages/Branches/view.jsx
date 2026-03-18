import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft, MapPin, Phone, Building2,
    Calendar, Hash, ShieldCheck, Mail, User, Globe, Users
} from "lucide-react";
import { Avatar } from "antd";
import branchApi from "../../api/branchApi";
import userBranchApi from "../../api/userApi";

export default function ViewBranch() {
    const { id } = useParams();
    const [branch, setBranch] = useState(null);
    const [personnel, setPersonnel] = useState([]);

    const fetchData = async () => {
        try {
            const [branchRes, personnelRes] = await Promise.all([
                branchApi.getById(id),
                userBranchApi.getPersonnel(id)
            ]);
            setBranch(branchRes.data);
            setPersonnel(personnelRes.data);
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    if (!branch) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FFFFFF] p-6 lg:p-12 text-black">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* TOP NAVIGATION */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                    <Link
                        to="/branches"
                        className="group flex items-center gap-3 text-black transition-all font-bold text-[11px] tracking-[0.2em] uppercase"
                    >
                        <div className="p-2 bg-white border border-black rounded-lg group-hover:bg-black group-hover:text-white transition-all">
                            <ArrowLeft size={16} />
                        </div>
                        <span>Danh sách chi nhánh</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-black/30">System Records / Verified</span>
                    </div>
                </div>

                {/* MAIN LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* CỘT TRÁI: THÔNG TIN CHI NHÁNH & STAFF LIST */}
                    <div className="lg:col-span-8 space-y-20">
                        <header className="space-y-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-black text-white rounded-2xl shadow-xl">
                                <Building2 size={40} />
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-7xl font-black tracking-tighter text-black leading-tight">
                                    {branch.name}
                                </h1>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-md">
                                        <Hash size={14} />
                                        <span className="font-mono text-xs font-bold uppercase tracking-tighter">{branch.code}</span>
                                    </div>
                                    <div className="flex items-center gap-2 border border-black px-3 py-1.5 rounded-md">
                                        <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Active Status</span>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* GRID THÔNG TIN CƠ SỞ */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100 border border-slate-100 rounded-3xl overflow-hidden">
                            <div className="p-10 bg-white space-y-5">
                                <div className="text-black/20"><MapPin size={24} /></div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Địa chỉ đăng ký</span>
                                    <p className="text-xl font-bold text-black mt-2 leading-snug">{branch.address}</p>
                                </div>
                            </div>

                            <div className="p-10 bg-white space-y-5">
                                <div className="text-black/20"><Phone size={24} /></div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Đường dây nóng</span>
                                    <p className="text-xl font-bold text-black mt-2">{branch.phone || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        {/* DANH SÁCH ĐỘI NGŨ (READ ONLY) */}
                        <section className="space-y-10">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                <Users size={20} />
                                <h2 className="text-xl font-black uppercase tracking-tight">Đội ngũ trực thuộc</h2>
                                {/* Nút + */}
                                <Link
                                    to={`/branches/${id}/personnel`}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-black bg-white hover:bg-black hover:text-white transition-all"
                                    title="Thêm nhân sự"
                                >
                                    <span className="text-lg leading-none font-black">+</span>
                                </Link>
                                <span className="ml-auto text-[10px] font-bold bg-slate-100 px-3 py-1 rounded-full uppercase">
                                    {personnel.length} Nhân sự
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {personnel.length > 0 ? (
                                    personnel.map((item) => (
                                        <div key={item._id} className="flex items-center gap-4 p-5 border border-slate-100 rounded-2xl shadow-sm">
                                            <Avatar size={48} src={item.userId?.avatar} icon={<User />} className="bg-slate-100" />
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-tight">{item.userId?.name}</p>
                                                <p className="text-[11px] text-black/40 font-medium italic">{item.role === 'branch_manager' ? 'Manager' : 'Staff'}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-400 text-xs italic uppercase tracking-widest py-4">Chưa có dữ liệu nhân sự...</p>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* CỘT PHẢI: QUẢN LÝ (STICKY) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-12">
                            <div className="bg-white border-2 border-black rounded-[3rem] p-10 relative overflow-hidden">
                                <div className="relative z-10 space-y-10">
                                    <div className="flex items-center gap-3 text-black font-black text-[11px] uppercase tracking-[0.25em]">
                                        <ShieldCheck size={18} />
                                        <span>Manager In Charge</span>
                                    </div>

                                    {branch.manager ? (
                                        <div className="space-y-8">
                                            <div className="space-y-6">
                                                <Avatar
                                                    size={120}
                                                    src={branch.manager.avatar}
                                                    icon={<User />}
                                                    className="bg-black border-4 border-white shadow-xl"
                                                >
                                                    {branch.manager.name?.charAt(0)}
                                                </Avatar>

                                                <div className="space-y-1">
                                                    <h3 className="text-3xl font-black text-black tracking-tight uppercase leading-none">
                                                        {branch.manager.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-black/60 font-medium italic">
                                                        <Mail size={14} />
                                                        <span className="text-sm underline underline-offset-4">{branch.manager.email}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-8 border-t border-slate-100">
                                                <p className="text-black/50 text-[12px] leading-relaxed font-bold uppercase tracking-wider">
                                                    Đại diện pháp lý và chịu trách nhiệm cao nhất về hoạt động kinh doanh của đơn vị.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center space-y-4 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                            <User size={32} className="mx-auto text-slate-300" />
                                            <p className="text-black/40 text-[10px] font-black uppercase tracking-widest">Unassigned</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <footer className="mt-8 px-6 space-y-4">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-black/20">
                                    <span>Operated in</span>
                                    <span>HCM, VN</span>
                                </div>
                                <p className="text-[9px] text-black/30 font-black uppercase tracking-[0.4em] leading-relaxed">
                                    Centralized Management System <br /> Authenticated Data Only
                                </p>
                            </footer>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}