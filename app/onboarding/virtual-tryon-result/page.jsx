'use client'

import { useRouter } from 'next/navigation';

export default function VirtualTryOnResultPage() {
  const router = useRouter();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid #0B1F63',
      borderRadius: '20px',
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
        Virtual try-on result
      </h2>
      <img
        src="/images/virtual_try_on_result.jpg"
        alt="Virtual Try-On Result"
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: '200px',
          objectFit: 'cover',
          marginBottom: '20px'
        }}
      />
      <button
        onClick={() => router.push('/restyle')}
        style={{
          backgroundColor: 'transparent',
          color: '#0B1F63',
          padding: '10px',
          border: '1px solid #0B1F63',
          borderRadius: '5px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%'
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
          <path d="M14 2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
        Re-style
      </button>
    </div>
  );
}
