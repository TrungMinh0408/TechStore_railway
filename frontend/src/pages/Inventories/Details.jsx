import { useEffect } from "react";
import { useParams } from "react-router-dom";
import inventoriesApi from "../../api/inventoriesApi";

export default function Details() {
  const { productId } = useParams();

  const fetchData = async () => {
    try {
      const res = await inventoriesApi.getDetails(productId);

      console.log("API RESPONSE:", res);
      console.log("DATA:", res.data);

    } catch (error) {
      console.error("Fetch inventory details error:", error);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchData();
    }
  }, [productId]);

  return (
    <div>
      <h2>Inventory Details</h2>
      <p>Product ID: {productId}</p>
    </div>
  );
}