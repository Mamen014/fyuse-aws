'use client';

import { useState } from 'react';
import { useAuth } from 'react-oidc-context';

export default function TestRecommendationPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  const fetchRecommendation = async () => {
    setLoading(true);
    setError('');
    setProduct(null);

    try {
      const res = await fetch('/api/recommend-product', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.id_token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get recommendation');
      }

      setProduct(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4 text-primary">Test Product Recommendation</h1>
      <button
        onClick={fetchRecommendation}
        disabled={loading}
        className="bg-primary text-white px-4 py-2 rounded hover:bg-[#0a1b56]"
      >
        {loading ? 'Fetching...' : 'Get Recommendation'}
      </button>

      {error && (
        <p className="text-red-600 mt-4">
          ❌ Error: {error}
        </p>
      )}

      {product && (
        <div className="mt-6 border p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">{product.productName}</h2>
          <p><strong>Brand:</strong> {product.brand}</p>
          <p><strong>Product ID:</strong> {product.productId}</p>
          <p><strong>Link:</strong> <a href={product.productLink} target="_blank" className="text-blue-600 underline">View Product</a></p>
          {product.imageS3Url && (
            <img src={product.imageS3Url} alt={product.productName} className="mt-4 w-full max-w-xs rounded" />
          )}
        </div>
      )}
    </div>
  );
}
