import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, X } from "lucide-react";

import productApi from "../../api/productApi";
import categoryApi from "../../api/categoriesApi";
import brandApi from "../../api/brandApi";

const ProductCreate = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    description: "",
    categoryId: "",
    brandId: "",
    unit: "",
    isActive: true,
    images: [],
  });

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll();
        setCategories(res.data.categories || res.data || []);
      } catch (error) {
        console.error("Lỗi categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await brandApi.getAll();
        setBrands(res.data.brands || res.data || []);
      } catch (error) {
        console.error("Lỗi brands:", error);
      }
    };

    fetchBrands();
  }, []);

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  /* ================= IMAGE UPLOAD ================= */

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    setFormData({
      ...formData,
      images: [...formData.images, ...files],
    });

    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    const newPreviews = [...previews];

    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setFormData({
      ...formData,
      images: newImages,
    });

    setPreviews(newPreviews);
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("sku", formData.sku);
      data.append("price", formData.price);
      data.append("description", formData.description);
      data.append("categoryId", formData.categoryId);
      data.append("brandId", formData.brandId);
      data.append("unit", formData.unit);
      data.append("isActive", formData.isActive);

      formData.images.forEach((file) => {
        data.append("images", file);
      });

      await productApi.create(data);

      alert("Tạo sản phẩm thành công");
      navigate("/products");

    } catch (error) {
      console.error("CREATE PRODUCT ERROR:", error);
      alert(error.response?.data?.message || "Lỗi tạo sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="max-w-4xl mx-auto pb-10">

      <button
        onClick={() => navigate("/products")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
      >
        <ArrowLeft size={18} /> Quay lại
      </button>

      <div className="bg-white p-8 rounded-2xl border shadow-sm">

        <h1 className="text-2xl font-bold mb-8">
          Thêm sản phẩm mới
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-2 gap-6">

            {/* NAME */}
            <div className="col-span-2">
              <label className="block font-semibold mb-2">
                Tên sản phẩm *
              </label>
              <input
                required
                className="w-full px-4 py-3 border rounded-xl"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>

            {/* SKU */}
            <div>
              <label className="block font-semibold mb-2">
                SKU *
              </label>
              <input
                required
                className="w-full px-4 py-3 border rounded-xl"
                value={formData.sku}
                onChange={(e) => handleChange("sku", e.target.value)}
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label className="block font-semibold mb-2">
                Danh mục *
              </label>
              <select
                required
                className="w-full px-4 py-3 border rounded-xl"
                value={formData.categoryId}
                onChange={(e) => handleChange("categoryId", e.target.value)}
              >
                <option value="">Chọn danh mục</option>

                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}

              </select>
            </div>

            {/* BRAND */}
            <div>
              <label className="block font-semibold mb-2">
                Thương hiệu
              </label>
              <select
                className="w-full px-4 py-3 border rounded-xl"
                value={formData.brandId}
                onChange={(e) => handleChange("brandId", e.target.value)}
              >
                <option value="">Chọn brand</option>

                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}

              </select>
            </div>

            {/* UNIT */}
            <div>
              <label className="block font-semibold mb-2">
                Đơn vị *
              </label>
              <input
                required
                placeholder="vd: chai, hộp, kg"
                className="w-full px-4 py-3 border rounded-xl"
                value={formData.unit}
                onChange={(e) => handleChange("unit", e.target.value)}
              />
            </div>

            {/* PRICE */}
            <div>
              <label className="block font-semibold mb-2">
                Giá bán *
              </label>
              <input
                type="number"
                required
                className="w-full px-4 py-3 border rounded-xl"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
              />
            </div>

          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="block font-semibold mb-2">
              Mô tả
            </label>

            <textarea
              rows="4"
              className="w-full px-4 py-3 border rounded-xl"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          {/* IMAGE */}

          <div>
            <label className="block font-semibold mb-2">
              Hình ảnh
            </label>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />

            <div className="flex gap-4 mt-4 flex-wrap">
              {previews.map((img, index) => (
                <div key={index} className="relative">

                  <img
                    src={img}
                    alt=""
                    className="w-24 h-24 object-cover rounded-lg"
                  />

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={14} />
                  </button>

                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE */}

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleChange("isActive", e.target.checked)}
            />
            <span>Kích hoạt sản phẩm</span>
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex justify-center items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? "Đang lưu..." : "Lưu sản phẩm"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ProductCreate;