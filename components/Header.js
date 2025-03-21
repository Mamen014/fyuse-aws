"use client";
import { useAuthenticator } from '@aws-amplify/ui-react';

const Header = () => {
  const { user, signOut, authStatus } = useAuthenticator(context => [
    context.user,
    context.authStatus,
  ]);

  return (
    <header className="flex justify-between items-center p-4 border-b shadow-sm">
      <h1 className="text-xl font-bold">FYUSE</h1>

      {authStatus === 'configuring' ? (
        <p>Loading auth...</p>
      ) : authStatus === 'authenticated' ? (
        <div className="flex items-center gap-4">
          <span className="text-sm">{user?.username}</span>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <p className="text-sm">You’re not signed in.</p>
      )}
    </header>
  );
};

export default Header;