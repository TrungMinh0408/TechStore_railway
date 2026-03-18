import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cart from "./Cart";
import Search from "./Search";
import Category from "./Category";
import Product from "./Product";
import {
  getPosProductsApi,
  getCategoriesApi,
  checkoutPosApi
} from "../../api/posApi";
import {
  createVNPay
} from "../../api/vnpayApi";

export default function Pos() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = sessionStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const fetchProducts = async (categoryId = null) => {
    const params = { page: 1, limit: 40 };
    if (categoryId) params.category = categoryId;
    try {
      const res = await getPosProductsApi(params);
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("FETCH PRODUCTS ERROR:", err);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    sessionStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategoriesApi();
        setCategories(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const addToCart = (product) => {
    if (product.stock === 0) return;
    setCartItems((prev) => {
      const exist = prev.find((item) => item._id === product._id);
      if (exist) {
        if (exist.quantity >= product.stock) {
          alert("Không đủ hàng trong kho!");
          return prev;
        }
        return prev.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleCheckout = async (method) => {
    if (cartItems.length === 0) {
      alert("Giỏ hàng đang trống");
      return;
    }

    try {
      const items = cartItems.map((item) => ({
        productId: item._id,
        qty: item.quantity,
        price: item.price
      }));

      // 🔥 VNPay (xử lý riêng)
      if (method === "vnpay") {
        const total = cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        const res = await createVNPay({
          amount: total,
          items // 🔥 thêm dòng này
        });

        // 👉 redirect sang VNPay
        window.location.href = res.paymentUrl;
        return;
      }

      // 👉 các method khác (cash, qr)
      const res = await checkoutPosApi({
        paymentMethod: method,
        customerName: "Walk-in",
        items
      });

      if (res.data.paymentMethod === "qr") {
        navigate("/pos/qr-payment", {
          state: { qr: res.data.qr, paymentId: res.data.paymentId }
        });
      } else {
        alert("Thanh toán thành công");
        setCartItems([]);
        sessionStorage.removeItem("cart");
      }

    } catch (err) {
      console.error(err);
      alert("Checkout failed");
    }
  };

  return (
    <div className="flex h-screen w-full bg-white text-black p-4 gap-6 overflow-hidden">

      {/* LEFT SIDE: Danh sách sản phẩm (Bỏ Tabs dưới cùng) */}
      <div className="flex-1 flex flex-col border border-gray-100 rounded-sm overflow-hidden">

        {/* Thanh tìm kiếm */}
        <div className="p-4 border-b border-gray-50">
          <Search addToCart={addToCart} />
        </div>

        {/* Danh mục sản phẩm */}
        <Category
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          fetchProducts={fetchProducts}
        />

        {/* Grid sản phẩm - Chiếm toàn bộ phần còn lại */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6 overflow-y-auto flex-1 bg-white">
          {products.map((product) => (
            <Product
              key={product._id}
              product={product}
              addToCart={addToCart}
            />
          ))}
        </div>
      </div>

      {/* RIGHT SIDE: Giỏ hàng */}
      <div className="w-[400px] flex flex-col border border-gray-100 rounded-sm overflow-hidden bg-white">
        <Cart
          cartItems={cartItems}
          setCartItems={setCartItems}
          handleCheckout={handleCheckout}
        />
      </div>

    </div>
  );
}