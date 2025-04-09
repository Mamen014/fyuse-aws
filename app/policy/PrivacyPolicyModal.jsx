'use client';

import { useEffect, useState } from 'react';

export default function PrivacyPolicyPage() {
  const [privacyHtml, setPrivacyHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/FYUSE_Syarat_Ketentuan_Privasi.html')
      .then((res) => res.text())
      .then((html) => {
        setPrivacyHtml(html);
        setLoading(false);
      })
      .catch(() => {
        setPrivacyHtml('<p>Failed to load privacy policy.</p>');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-4xl mx-auto bg-white text-black p-8 rounded shadow-lg">
        <h1 className="text-3xl font-bold mb-6">FYUSE Privacy Policy</h1>
        {loading ? (
          <p>Loading privacy policy...</p>
        ) : (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: privacyHtml }}
          />
        )}
      </div>
    </div>
  );
}
