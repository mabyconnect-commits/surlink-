import React from 'react';
import { Outlet, Link } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="min-h-screen bg-[var(--secondary)] flex flex-col">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="container mx-auto">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="w-10 h-10 rounded-lg bg-[var(--primary)] flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold">
              <span className="text-[var(--primary)]">Sur</span>
              <span className="text-[var(--surlink-gray)]">link</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-[var(--card)] rounded-2xl shadow-xl p-8 border border-[var(--border)]">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4">
        <div className="container mx-auto text-center text-sm text-[var(--muted-foreground)]">
          <p>&copy; {new Date().getFullYear()} Surlink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default AuthLayout;
