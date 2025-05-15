'use client'

import { useRouter } from 'next/navigation';

export default function RecommendedProductPage() {
  const router = useRouter();

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
        src="/images/virtual_try_on.jpg"
        alt="Try-on Preview"
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: '200px',
          objectFit: 'cover'
        }}
      />
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
