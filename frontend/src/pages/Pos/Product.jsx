export default function Product({ product, addToCart }) {
    const isOutOfStock = product.stock === 0;

    return (
        <div
            onClick={() => !isOutOfStock && addToCart(product)}
            /* Giữ h-fit để card không bị dãn dài, và trả lại màu border cũ */
            className={`relative flex flex-col bg-white rounded-xl border-2 cursor-pointer overflow-hidden transition-all h-fit
      ${isOutOfStock
                    ? "border-red-200 bg-red-50 opacity-70 cursor-not-allowed"
                    : "border-emerald-100 hover:border-emerald-500 hover:shadow-md"
                }`}
        >
            {/* Badge Trạng thái - Màu cũ */}
            <div
                className={`absolute top-2 right-2 text-xs px-2 py-1 rounded text-white z-10
        ${isOutOfStock ? "bg-red-500" : "bg-green-500"}`}
            >
                {isOutOfStock ? "Hết hàng" : `Kho ${product.stock}`}
            </div>

            {/* Container Ảnh - Fix lỗi méo ảnh bằng object-contain và aspect-square */}
            <div className="aspect-square w-full bg-gray-50 flex items-center justify-center overflow-hidden p-2">
                {product.images?.[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-contain"
                    />
                ) : (
                    <span className="text-gray-400 text-xs">No image</span>
                )}
            </div>

            {/* Nội dung - Fix lỗi lệch dòng bằng h-10 và line-clamp */}
            <div className="p-3 flex flex-col bg-white">
                <h3 className="text-sm font-semibold mb-2 line-clamp-2 h-10 leading-tight">
                    {product.name}
                </h3>

                <div className="flex justify-between items-center mt-2">
                    {/* Màu xanh blue-600 cũ của bạn */}
                    <span className="text-lg font-bold text-blue-600">
                        ${product.price?.toLocaleString()}
                    </span>

                    {!isOutOfStock && (
                        <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-600 hover:text-white transition-colors">
                            +
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}