'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';

export default function RecommendedProductPage() {
  const router = useRouter();
  const auth = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

  useEffect(() => {
    const fetchProduct = async () => {
      const email = auth?.user?.profile?.email;
      if (!email) return;

      try {
        const res = await fetch(`${API_BASE_URL}/stylingRecommendation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userEmail: email }),
        });

        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProduct(data[0]);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (auth?.user?.profile?.email) {
      fetchProduct();
    }
  }, [auth?.user?.profile?.email]);

  if (loading) {
    return <div className="text-center mt-10 text-[#0B1F63]">Loading recommendation...</div>;
  }

  if (!product) {
    return <div className="text-center mt-10 text-red-500">No product found.</div>;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      width: '100%',
      maxWidth: '300px',
      margin: 'auto'
    }}>
      <h2 style={{
        color: '#0B1F63',
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        Recommended Product
      </h2>

      <img
        src={product.imageS3Url}
        alt={product.productName}
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: '200px',
          objectFit: 'cover',
          borderRadius: '8px',
        }}
      />

      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <p style={{ fontWeight: 'bold', color: '#0B1F63' }}>{product.productName}</p>
        <p style={{ fontSize: '14px', color: '#555' }}>{product.brand}</p>
        <a
          href={product.productLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#0B1F63', fontSize: '12px', textDecoration: 'underline' }}
        >
          View Product
        </a>
      </div>

      <div style={{
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%'
      }}>
        <button
          onClick={() => router.push('/onboarding/virtual-tryon-result')}
          style={{
            backgroundColor: '#0B1F63',
            color: 'white',
            padding: '10px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Yes, I like this
        </button>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#0B1F63',
            color: 'white',
            padding: '10px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Generate more product
        </button>
      </div>
    </div>
  );
}
