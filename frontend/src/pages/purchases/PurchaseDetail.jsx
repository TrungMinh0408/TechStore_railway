import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import purchaseApi from "../../api/purchaseApi";

export default function PurchaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await purchaseApi.getById(id);
      setPurchase(res?.data?.data || res?.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) return <LoadingSkeleton />;
  if (!purchase) return <NotFound />;

  const total = (purchase.quantity || 0) * (purchase.costPrice || 0);

  return (
    <div className="min-h-screen bg-gray-50 md:py-10 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto px-4">

        {/* THANH ĐIỀU HƯỚNG - ẨN HOÀN TOÀN KHI IN */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-500 hover:text-black transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại danh sách
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-all shadow-md active:scale-95"
          >
            <Printer className="w-4 h-4" />
            In đơn hàng
          </button>
        </div>

        {/* TỜ HÓA ĐƠN CHÍNH */}
        <div className="bg-white p-8 md:p-16 shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">

          {/* Header hóa đơn */}
          <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-10">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 text-slate-900">
                Purchase Order
              </h1>
              <p className="text-sm font-mono text-gray-500">ID: {purchase._id}</p>
            </div>
            <div className={`px-6 py-1.5 border-2 font-black uppercase text-sm tracking-widest ${purchase.status === 'confirmed' ? 'border-black text-black' : 'border-gray-300 text-gray-400'
              }`}>
              {purchase.status}
            </div>
          </div>

          {/* Grid thông tin chi tiết */}
          <div className="grid grid-cols-2 gap-16 mb-16">
            <section>
              <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-[0.2em]">Supplier Information</h3>
              <p className="font-bold text-xl text-slate-900">{purchase.supplierId?.name || "N/A"}</p>
              <div className="text-sm text-gray-600 mt-2 space-y-1">
                <p>{purchase.supplierId?.email}</p>
                <p>{purchase.supplierId?.phone}</p>
                <p>{purchase.supplierId?.address}</p>
              </div>

              <div className="mt-10">
                <h3 className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">Responsibility</h3>
                <p className="text-sm"><span className="text-gray-400 font-medium tracking-wide uppercase text-[9px]">Branch:</span> <b>{purchase.branchId?.name || "Main Office"}</b></p>
                <p className="text-sm"><span className="text-gray-400 font-medium tracking-wide uppercase text-[9px]">Manager:</span> <b>{purchase.managerId?.name || "Staff"}</b></p>
              </div>
            </section>

            <section className="text-right flex flex-col justify-between">
              <div>
                <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-[0.2em]">Product</h3>
                <p className="font-bold text-xl text-slate-900 leading-tight">{purchase.productId?.name}</p>

                <div className="flex justify-end gap-12 mt-8">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Qty</p>
                    <p className="text-2xl font-bold text-slate-800">{purchase.quantity}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Unit Price</p>
                    <p className="text-2xl font-bold text-slate-800">${(purchase.costPrice || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Grand Total</p>
                <p className="text-5xl font-black text-black inline-block relative">
                  ${total.toLocaleString()}
                  <span className="absolute left-0 -bottom-2 w-full h-1.5 bg-yellow-400 -z-10"></span>
                </p>
              </div>
            </section>
          </div>

          {/* Footer hóa đơn (Ghi chú & Chữ ký) */}
          <div className="pt-12 border-t border-dashed border-gray-200 flex justify-between items-start">
            <div className="max-w-xs">
              <h3 className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">Internal Note</h3>
              <p className="text-sm italic text-gray-500 leading-relaxed font-serif">
                "{purchase.note || "No specific instructions were provided for this purchase order."}"
              </p>
            </div>

            <div className="text-right">
              <div className="mb-10">
                <p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest uppercase">Recorded On</p>
                <p className="text-sm font-bold text-slate-700">{new Date(purchase.createdAt).toLocaleString('vi-VN')}</p>
              </div>

              {/* Vùng chữ ký khi in ra */}
              <div className="hidden print:block mt-20">
                <div className="w-48 border-b border-black ml-auto"></div>
                <p className="text-[10px] font-bold uppercase mt-2 pr-12">Authorized Signature</p>
              </div>
            </div>
          </div>

        </div>

        {/* NÚT IN DƯỚI CÙNG */}
        <div className="mt-12 flex flex-col items-center gap-4 print:hidden">
          <div className="h-px w-20 bg-gray-200"></div>
          <p className="text-gray-400 text-[11px] uppercase tracking-[0.3em] font-medium">End of Document</p>
        </div>
      </div>
    </div>
  );
}

/* COMPONENT PHỤ */

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-black rounded-full animate-spin mb-4"></div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-10 rounded-2xl shadow-sm text-center border border-gray-100 max-w-sm">
        <h2 className="text-2xl font-black text-slate-800 mb-2">404</h2>
        <p className="text-gray-500 mb-6">Đơn hàng không tồn tại hoặc đã bị gỡ khỏi hệ thống.</p>
        <button
          onClick={() => window.history.back()}
          className="w-full bg-black text-white py-3 rounded-xl font-bold"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}