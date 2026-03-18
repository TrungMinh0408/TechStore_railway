import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiArrowLeft,
  FiPackage,
  FiTruck,
  FiDollarSign,
  FiFileText,
  FiInfo
} from "react-icons/fi";

import purchaseApi from "../../api/purchaseApi";
import supplierApi from "../../api/supplierApi";
import productApi from "../../api/productApi";
import { getMyBranchApi } from "../../api/branchApi";

export default function CreatePurchase() {
  const navigate = useNavigate();
  const fetched = useRef(false);

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [user, setUser] = useState(null);
  const [branchName, setBranchName] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    supplierId: "",
    branchId: "",
    managerId: "",
    productId: "",
    quantity: 1,
    costPrice: 0,
    note: "",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser) {
      setUser(storedUser);
      setForm((prev) => ({
        ...prev,
        managerId: storedUser.id || "",
        branchId: storedUser.branchId || "",
      }));
    }

    const fetchBranch = async () => {
      try {
        const res = await getMyBranchApi();
        setBranchName(res.data.name);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBranch();
  }, []);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const fetchData = async () => {
      try {
        const [supplierRes, productRes] = await Promise.all([
          supplierApi.getAll(),
          productApi.getAll(),
        ]);

        const supplierList = Array.isArray(supplierRes?.data?.data)
          ? supplierRes.data.data
          : supplierRes.data;

        const productList =
          productRes?.data?.data ||
          productRes?.data?.products ||
          (Array.isArray(productRes?.data) ? productRes.data : []);

        setSuppliers(supplierList || []);
        setProducts(productList || []);
      } catch (error) {
        toast.error("Lỗi tải dữ liệu hệ thống");
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "supplierId") {
      const supplier = suppliers.find((s) => s._id === value);
      setSelectedSupplier(supplier);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.supplierId || !form.productId) {
      return toast.error("Vui lòng điền đủ thông tin bắt buộc");
    }

    try {
      setLoading(true);

      await purchaseApi.create({
        ...form,
        quantity: Number(form.quantity),
        costPrice: Number(form.costPrice),
      });

      toast.success("Tạo đơn hàng thành công!");

      setTimeout(() => {
        navigate("/purchases");
      }, 1200);

    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = form.quantity * form.costPrice;

  return (
    <div className="p-6 md:p-10 bg-white min-h-screen text-black font-sans">
      <div className="max-w-6xl mx-auto">

        {/* Breadcrumb */}
        <div className="mb-10">
          <Link
            to="/purchases"
            className="text-gray-500 hover:text-black flex items-center gap-2 mb-4 transition-colors w-fit"
          >
            <FiArrowLeft />
            <span className="text-sm">Trở về danh sách</span>
          </Link>

          <h1 className="text-4xl font-light tracking-tight text-black">
            Tạo <span className="font-bold">Đơn Nhập Hàng</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* FORM */}
          <div className="lg:col-span-2 space-y-10">

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Thông tin */}
              <section className="space-y-6">
                <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400 border-b pb-2">
                  Thông tin cơ bản
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-black">
                      Nhà cung cấp *
                    </label>

                    <div className="relative">
                      <FiTruck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                      <select
                        name="supplierId"
                        value={form.supplierId}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-black outline-none"
                        required
                      >
                        <option value="">Chọn nhà cung cấp</option>

                        {suppliers.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-black">
                      Sản phẩm *
                    </label>

                    <div className="relative">
                      <FiPackage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                      <select
                        name="productId"
                        value={form.productId}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-black outline-none"
                        required
                      >
                        <option value="">Chọn sản phẩm</option>

                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                </div>
              </section>

              {/* Chi tiết */}
              <section className="space-y-6">
                <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400 border-b pb-2">
                  Chi tiết nhập hàng
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-black">
                      Số lượng
                    </label>

                    <input
                      type="number"
                      name="quantity"
                      value={form.quantity}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-black outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-black">
                      Đơn giá nhập
                    </label>

                    <div className="relative">
                      <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                      <input
                        type="number"
                        name="costPrice"
                        value={form.costPrice}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-black outline-none"
                      />
                    </div>
                  </div>

                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-black flex items-center gap-2">
                    <FiFileText className="text-gray-400" />
                    Ghi chú
                  </label>

                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-black outline-none resize-none"
                    placeholder="Lưu ý cho đơn hàng này..."
                  />
                </div>
              </section>

              {/* BUTTON */}
              <div className="pt-6 flex items-center gap-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 md:flex-none px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all disabled:bg-gray-300"
                >
                  {loading ? "Đang xử lý..." : "Xác nhận tạo đơn"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/purchases")}
                  className="text-sm font-medium text-gray-400 hover:text-red-500"
                >
                  Hủy đơn
                </button>
              </div>

            </form>
          </div>

          {/* SUMMARY */}
          <div className="space-y-8">

            <div className="border border-black p-8 rounded-2xl bg-white shadow-sm">
              <p className="text-xs uppercase font-bold tracking-widest text-gray-400 mb-2">
                Thanh toán
              </p>

              <h3 className="text-4xl font-bold text-black mb-1">
                {totalPrice.toLocaleString()}
              </h3>

              <p className="text-gray-500 text-sm border-b pb-4 mb-4">$</p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Người lập đơn:</span>
                  <span className="font-semibold">{user?.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Chi nhánh:</span>
                  <span className="font-semibold">{branchName}</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-100 p-6 rounded-2xl bg-gray-50">
              <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 flex items-center gap-2">
                <FiInfo /> Đối tác cung ứng
              </h3>

              {selectedSupplier ? (
                <div className="space-y-3">

                  <div>
                    <p className="text-lg font-bold text-black">
                      {selectedSupplier.name}
                    </p>

                    <p className="text-sm text-blue-600 break-all">
                      {selectedSupplier.email}
                    </p>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1 pt-2 border-t">
                    <p>SĐT: {selectedSupplier.phone}</p>
                    <p>Đ/C: {selectedSupplier.address}</p>
                  </div>

                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  Vui lòng chọn nhà cung cấp để xem thông tin chi tiết.
                </p>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}