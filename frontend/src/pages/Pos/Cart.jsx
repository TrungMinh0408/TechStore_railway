import { useState } from "react";
import { Banknote, QrCode, ChevronRight } from 'lucide-react';
export default function Cart({ cartItems, setCartItems, handleCheckout }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const increaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item._id === id) {
          if (item.quantity >= item.stock) {
            alert("Số lượng vượt quá tồn kho!");
            return item;
          }
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
    );
  };

  const decreaseQty = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item._id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    if (cartItems.length === 0) return;
    setCartItems([]);
    sessionStorage.removeItem("cart");
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) {
      alert("Giỏ hàng đang trống!");
      return;
    }
    setShowConfirm(true);
  };

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden relative bg-white border-l font-sans">

      {/* HEADER */}
      <div className="p-5 border-b flex-none">
        <h2 className="text-lg font-black text-gray-800 text-center uppercase tracking-[0.2em]">
          Giỏ Hàng
        </h2>
      </div>

      {/* CART LIST */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {cartItems.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            <p className="text-sm font-bold">Giỏ hàng trống</p>
            <p className="text-xs">Chọn sản phẩm để bắt đầu bán</p>
          </div>
        )}

        {cartItems.map((item) => (
          <div key={item._id} className="grid grid-cols-12 items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="col-span-5 min-w-0">
              <p className="font-bold text-gray-700 text-[13px] truncate">{item.name}</p>
              <p className="text-[11px] text-blue-600 font-bold">${item.price.toLocaleString()}</p>
            </div>

            <div className="col-span-4 flex justify-center">
              <div className="flex items-center bg-white border rounded-lg h-7 overflow-hidden">
                <button onClick={() => decreaseQty(item._id)} className="w-7 h-full flex items-center justify-center hover:bg-gray-100 transition-colors">−</button>
                <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                <button onClick={() => increaseQty(item._id)} className="w-7 h-full flex items-center justify-center bg-gray-900 text-white">+</button>
              </div>
            </div>

            <div className="col-span-3 text-right font-black text-[13px] text-gray-800">
              ${(item.price * item.quantity).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="p-5 border-t border-dashed flex-none bg-white">
        <div className="flex justify-between mb-4 items-end">
          <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Tổng thanh toán</span>
          <span className="text-3xl font-black text-gray-900">${total.toLocaleString()}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={clearCart}
            disabled={cartItems.length === 0}
            className="flex-1 border-2 border-gray-200 font-bold py-3 rounded-xl text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-all"
          >
            Xóa hết
          </button>
          <button
            onClick={handleCheckoutClick}
            disabled={cartItems.length === 0}
            className="flex-[2] bg-gray-900 text-white font-black py-3 rounded-xl text-xs hover:bg-black disabled:bg-gray-200 transition-all shadow-lg shadow-gray-200"
          >
            Thanh toán
          </button>
        </div>
      </div>

      {/* POPUP THANH TOÁN MỚI */}
      {showConfirm && (
        <div className="absolute inset-0 z-50 flex items-end justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full bg-white rounded-2xl shadow-2xl p-6 mb-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" /> {/* Handle bar for mobile feel */}

            <h3 className="text-xl font-black text-gray-900 mb-2">Hình thức thanh toán</h3>
            <p className="text-gray-500 text-sm mb-6">Vui lòng chọn phương thức phù hợp để hoàn tất đơn hàng.</p>

            <div className="space-y-3">
              {/* Nút Tiền mặt */}
              <button
                onClick={() => { setShowConfirm(false); handleCheckout("cash"); }}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                    {/* Thay 💵 bằng Banknote */}
                    <Banknote className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  </div>
                  <span className="font-bold text-gray-700">Tiền mặt</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900" />
              </button>

              {/* Nút Chuyển khoản / QR */}
              <button
                onClick={() => { setShowConfirm(false); handleCheckout("qr"); }}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                    {/* Thay 📱 bằng QrCode */}
                    <QrCode className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  </div>
                  <span className="font-bold text-gray-700">Chuyển khoản / QR</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900" />
              </button>

              <button
                onClick={() => { setShowConfirm(false); handleCheckout("vnpay"); }}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                    💳
                  </div>
                  <span className="font-bold text-gray-700">Visa / VNPay</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900" />
              </button>

            </div>

            <button
              onClick={() => setShowConfirm(false)}
              className="mt-6 w-full text-center text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors py-2"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      )}

    </div>
  );
}