export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-black text-blue-600">Dashboard</h1>
      <p className="mt-2 text-sm text-slate-500">
        Tổng quan hệ thống bán hàng
      </p>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-slate-500">Doanh thu hôm nay</p>
          <h2 className="text-xl font-bold">1,200,000₫</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-slate-500">Đơn hàng</p>
          <h2 className="text-xl font-bold">24</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-slate-500">Khách hàng</p>
          <h2 className="text-xl font-bold">8</h2>
        </div>
      </div>
    </div>
  );
}
