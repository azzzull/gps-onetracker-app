import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-800 px-6 py-4 relative lg:px-40 md:px-10">
      <div className="flex justify-between items-center text-white">
        <a href="#" className="text-2xl font-bold">OneTracker</a>

        {/* Desktop menu */}
        <div className="hidden md:flex space-x-1 text-sm font-medium lg:space-x-4">
          <a href="#" className="nav-link">Dashboard</a>
          <a href="#" className="nav-link">Realtime Position</a>
          <a href="#" className="nav-link">Mapview</a>
          <a href="#" className="nav-link">History Log</a>
          <a href="#" className="nav-link">Admin</a>
        </div>

        {/* Hamburger icon */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white focus:outline-none cursor-pointer nav-link"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      </div>

      {/* Mobile popup menu */}
      {menuOpen && (
        <div className="absolute right-4 top-full mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg z-50 p-4 flex flex-col space-y-3 md:hidden">
          <a href="#" className="nav-link" onClick={() => setMenuOpen(false)}>Dashboard</a>
          <a href="#" className="nav-link" onClick={() => setMenuOpen(false)}>Realtime Position</a>
          <a href="#" className="nav-link" onClick={() => setMenuOpen(false)}>Mapview</a>
          <a href="#" className="nav-link" onClick={() => setMenuOpen(false)}>History Log</a>
          <a href="#" className="nav-link" onClick={() => setMenuOpen(false)}>Admin</a>
        </div>
      )}
    </nav>
  );
}
