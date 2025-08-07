import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <nav className="bg-gray-300 border-b border-gray-300 px-6 py-4 fixed w-full top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center border-b border-gray-400 p-3">
        {/* Left side menu (Harcamalar, Dashboard, Analiz) */}
        <ul className="hidden md:flex items-center space-x-6">
          {user && (
            <>
              <li>
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-gray-900 font-bold uppercase tracking-widest"
                >
                  Harcamalar
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-gray-900 font-bold uppercase tracking-widest"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/analysis"
                  className="text-gray-700 hover:text-gray-900 font-bold uppercase tracking-widest"
                >
                  Analiz
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Right side menu (email, logout) */}
        <ul className="hidden md:flex items-center space-x-6">
          {!user ? (
            <>
              <li>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-gray-900 font-bold uppercase tracking-widest"
                >
                  Log in
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-gray-900 px-4 py-2 rounded-full font-semibold uppercase tracking-widest hover:text-white bg-gray-200 hover:bg-gray-900 transition"
                >
                  Sign up
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="flex items-center gap-4 text-gray-700 font-semibold uppercase tracking-widest">
                <span>{user.email}</span>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-full font-semibold uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center p-2"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col items-center rounded-lg shadow-lg mt-2 bg-white">
          {!user ? (
            <>
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 font-bold uppercase tracking-widest"
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="text-gray-900 px-4 py-2 rounded-full font-semibold uppercase tracking-widest hover:text-white bg-gray-200 hover:bg-gray-900 transition"
                onClick={() => setMenuOpen(false)}
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center w-full space-y-3 p-4">
                <Link
                  href="/profile"
                  className="w-full text-center text-gray-700 font-bold uppercase tracking-widest hover:text-gray-900"
                  onClick={() => setMenuOpen(false)}
                >
                  Harcamalar
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full text-center text-gray-700 font-bold uppercase tracking-widest hover:text-gray-900"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    router.push('/analysis');
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm uppercase tracking-widest font-semibold transition"
                >
                  Analiz
                </button>
                <span className="text-gray-700 font-semibold uppercase tracking-widest mt-4">{user.email}</span>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 rounded-full font-semibold uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Header;
