import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import purchaseApi from "../../api/purchaseApi";
import productApi from "../../api/productApi";
import supplierApi from "../../api/supplierApi";

export default function EditPurchase() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    supplierId: "",
    productId: "",
    quantity: 1,
    costPrice: 0,
    note: "",
  });

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [purchaseRes, productRes, supplierRes] = await Promise.all([
          purchaseApi.getById(id),
          productApi.getAll(),
          supplierApi.getAll(),
        ]);

        const p = purchaseRes.data.data;

        setForm({
          supplierId: p.supplierId?._id || "",
          productId: p.productId?._id || "",
          quantity: p.quantity || 1,
          costPrice: p.costPrice || 0,
          note: p.note || "",
        });

        setProducts(productRes.data.data || []);
        setSuppliers(supplierRes.data.data || []);

      } catch (error) {
        console.error(error);
        alert("Failed to load purchase data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await purchaseApi.update(id, {
        ...form,
        quantity: Number(form.quantity),
        costPrice: Number(form.costPrice),
      });

      alert("Purchase updated successfully");
      navigate("/purchases");

    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Edit Purchase</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-4 rounded shadow"
      >
        {/* Supplier */}
        <div>
          <label className="block mb-1">Supplier</label>

          <select
            name="supplierId"
            value={form.supplierId}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select supplier</option>

            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product */}
        <div>
          <label className="block mb-1">Product</label>

          <select
            name="productId"
            value={form.productId}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select product</option>

            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block mb-1">Quantity</label>

          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            min="1"
            required
          />
        </div>

        {/* Cost Price */}
        <div>
          <label className="block mb-1">Cost Price</label>

          <input
            type="number"
            name="costPrice"
            value={form.costPrice}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            min="1"
            required
          />
        </div>

        {/* Note */}
        <div>
          <label className="block mb-1">Note</label>

          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            rows="4"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update Purchase
        </button>
      </form>
    </div>
  );
}