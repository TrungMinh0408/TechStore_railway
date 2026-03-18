import { useNavigate, useLocation } from "react-router-dom";
import { checkoutApi } from "../../api/checkoutApi";
import { useState } from "react";
const ConfirmPayment = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    const cart = location.state?.cartItems || [];
    const paymentMethod = location.state?.paymentMethod;

    const branchId = localStorage.getItem("branchId");

    const subTotal = cart.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
    );

    const discount = 0;
    const grandTotal = subTotal - discount;

    const confirmPayment = async () => {

        if (loading) return;

        if (!paymentMethod) {
            alert("Payment method missing");
            return;
        }

        setLoading(true);

        try {

            const data = {
                paymentMethod: paymentMethod.toLowerCase(),
                discount,
                items: cart.map(i => ({
                    productId: i._id,
                    quantity: i.quantity,
                    price: i.price
                }))
            };

            console.log("CHECKOUT DATA:", data);

            const res = await checkoutApi(data);

            if (res.data.success) {

                sessionStorage.removeItem("cart");
                navigate("/pos");

            }

        } catch (err) {

            console.error("CHECKOUT ERROR:", err.response?.data);

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="p-6">

            <h2 className="text-xl font-bold mb-4">
                Confirm Payment
            </h2>

            {cart.map(item => (
                <div key={item._id}>
                    {item.name} x {item.quantity}
                </div>
            ))}

            <div className="mt-4">
                Subtotal: {subTotal}
            </div>

            <div>
                Payment method: {paymentMethod}
            </div>

            <div className="font-bold">
                Total: {grandTotal}
            </div>

            <button
                onClick={confirmPayment}
                disabled={loading}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
                {loading ? "Processing..." : "Confirm Payment"}
            </button>

        </div>

    );

};

export default ConfirmPayment;