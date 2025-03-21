// components/LoginModal.jsx
import { useState } from 'react';
import { Auth } from 'aws-amplify';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const user = await Auth.signIn(email, password);
      const session = await Auth.currentSession();
      const jwt = session.getIdToken().getJwtToken();
      sessionStorage.setItem('jwt', jwt);
      onLoginSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Login to Continue</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex justify-between">
          <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-2 rounded">
            Login
          </button>
          <button onClick={onClose} className="text-gray-600 hover:text-black">Cancel</button>
        </div>
      </div>
    </div>
  );
}