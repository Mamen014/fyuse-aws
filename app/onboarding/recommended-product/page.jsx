'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';

export default function RecommendedProductPage() {
  const router = useRouter();
  const auth = useAuth();
  const [taskId, setTaskId] = useState(null);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

  const trackPersonalizeEvent = async ({ userId, itemId, eventType, liked }) => {
    const sessionId = `session-${Date.now()}`;

    try {
      const res = await fetch(`${API_BASE_URL}/trackRec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          sessionId,
          itemId,
          eventType,
          liked
        })
      });

      const data = await res.json();
      console.log("Event tracked:", data);
    } catch (error) {
      console.error("Failed to track personalize event:", error);
    }
  };
  const logAndStoreImageS3Url = (productObj) => {
    if (productObj?.imageS3Url) {
      localStorage.setItem("apparel_image", productObj.imageS3Url);
      console.log("apparel_image stored in local storage.");
    } else {
      console.log("Error: apparel_image not found in product object.");
    }
  };

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const email = auth?.user?.profile?.email;
    if (!email) return;
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/stylingRecommendation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userEmail: email }),
        });

        const data = await res.json();
        console.log("API response:", data);

        if (data && typeof data === 'object' && data.productId) {
          setProduct(data);
        } else {
          console.warn("No valid product returned from API.");
          setProduct(null);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [auth?.user?.profile?.email]);


  console.log('Rendered product:', product);

  if (!loading && (!product?.productId || !product?.imageS3Url)) {
    return <div className="text-center mt-10 text-red-500">Invalid product data.</div>;
  }

  if (loading) {
    return <div className="text-center mt-10 text-[#0B1F63]">Loading recommendation...</div>;
  }
  if (!product) {
    return <div className="text-center mt-10 text-red-500">No product found.</div>;
  }

    const handleSubmit = async () => {
      try {
        setError(null);
        logAndStoreImageS3Url(product);
        const userImage = localStorage.getItem('user_image');
        console.log('url:', userImage);
        const apparelImage = localStorage.getItem("apparel_image");
        
        if (!userImage || !apparelImage) {
          setError("Missing user or apparel image.");
        return;
        }
        const userEmail = auth?.user?.profile?.email;
        const response = await axios.post(`${API_BASE_URL}/tryon-image`, {
          person_image_url: userImage,
          garment_image_url: apparelImage,
          userEmail,
        });
  
        if (response?.data?.taskId) {
          const taskId = response.data.taskId;
          setTaskId(taskId);
          localStorage.setItem('taskId', taskId);

        }
      } catch (err) {
          setError(
            err.response?.data?.error ||
              "An error occurred during virtual try-on."
          );
      }
    };
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
        Personalized Style
      </h2>
      <p style={{ fontSize: '14px', fontWeight: '500', color: '#0B1F63' }}>Product Preview</p>
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
      {product.modelRef && (
        <div style={{ marginTop: '10px' }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#0B1F63', textAlign: 'center' }}>On-Model Preview</p>
          <img
            src={product.modelRef}
            alt={`${product.productName} on model`}
            style={{
              width: '100%',
              height: 'auto',
              maxWidth: '200px',
              objectFit: 'cover',
              borderRadius: '8px',
              marginTop: '5px',
            }}
          />
        </div>
      )}

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
          onClick={async () => {
            await trackPersonalizeEvent({
              userId: auth?.user?.profile?.email,
              itemId: product.productId,
              eventType: 'tryon',
              liked: true
            });
            await handleSubmit();
            await router.push('/onboarding/virtual-tryon-result');
          }}
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
          Style Me
        </button>
        <button
          onClick={async () => {
            await trackPersonalizeEvent({
              userId: auth?.user?.profile?.email,
              itemId: product.productId,
              eventType: 'retry'
            });
            window.location.reload();
          }}
          style={{
            backgroundColor: 'white',
            color: '#0B1F63',
            padding: '10px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Retry
        </button>
      </div>
    </div>
  );
}
