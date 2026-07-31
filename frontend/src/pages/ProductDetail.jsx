import { publicApi } from '../api/axiosInstance';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import AccountMenu from '../components/AccountMenu';


function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notFound, setNotFound] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    publicApi
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-600 mb-4">Product not found.</p>
        <Link to="/store" className="text-blue-600 hover:underline">
          ← Back to store
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8 max-w-3xl mx-auto">
        <Link to="/store" className="text-blue-600 text-sm hover:underline">
          ← Back to store
        </Link>
        <div className="flex gap-3">
          <AccountMenu />
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
        <p className="text-gray-500 mb-1">
          Category: {product.categoryName || 'N/A'}
        </p>
        <p className="text-2xl font-semibold text-blue-600 mb-4">
          ₹{product.price}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          {product.quantity > 0
            ? `${product.quantity} in stock`
            : 'Out of stock'}
        </p>

        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-medium text-gray-700">Quantity</label>
          <div className="flex items-center border rounded-md">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-1 text-lg hover:bg-gray-100"
            >
              −
            </button>
            <span className="px-4">{quantity}</span>
            <button
              onClick={() =>
                setQuantity((q) => Math.min(product.quantity, q + 1))
              }
              className="px-3 py-1 text-lg hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={() => addToCart(product, quantity)}
          disabled={product.quantity === 0}
          className={`px-6 py-2 rounded-md text-white font-medium ${
            product.quantity === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

export default ProductDetail;