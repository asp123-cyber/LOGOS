import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sun,
  Moon,
  PenSquare,
  Bookmark,
  Compass,
  Users,
  Menu,
  X,
  Shield,
  Settings as SettingsIcon,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import Avatar from '../ui/Avatar';

export default function Header() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-paper-50/90 dark:bg-ink-900/90 backdrop-blur-md border-b border-ink-100 dark:border-ink-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2 font-serif text-2xl font-bold tracking-tight text-ink-900 dark:text-paper-100 hover:text-cobalt-600 dark:hover:text-cobalt-400 transition-colors"
          >
            <span className="w-7 h-7 rounded bg-cobalt-600 text-white flex items-center justify-center font-serif text-base font-bold shadow-sm">
              L
            </span>
            LOGOS
          </Link>

          {/* Desktop Primary Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              to="/explore"
              className={`flex items-center gap-1.5 transition-colors ${
                isActive('/explore')
                  ? 'text-cobalt-600 dark:text-cobalt-400 font-semibold'
                  : 'text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-paper-100'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore
            </Link>
            <Link
              to="/community"
              className={`flex items-center gap-1.5 transition-colors ${
                isActive('/community')
                  ? 'text-cobalt-600 dark:text-cobalt-400 font-semibold'
                  : 'text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-paper-100'
              }`}
            >
              <Users className="w-4 h-4" />
              Community
            </Link>
            {user && (
              <Link
                to="/bookmarks"
                className={`flex items-center gap-1.5 transition-colors ${
                  isActive('/bookmarks')
                    ? 'text-cobalt-600 dark:text-cobalt-400 font-semibold'
                  : 'text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-paper-100'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                Bookmarks
              </Link>
            )}
          </nav>
        </div>

        {/* Right Nav / Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-ink-500 hover:text-ink-900 dark:text-ink-300 dark:hover:text-paper-100 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Write CTA (Desktop) */}
          {user && (
            <Link to="/write" className="hidden sm:inline-flex btn-primary text-xs py-2 px-3.5">
              <PenSquare className="w-3.5 h-3.5" />
              Write Essay
            </Link>
          )}

          {/* User Auth Section */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-cobalt-400/40 focus:outline-none transition-all"
                aria-expanded={userDropdownOpen}
                aria-label="User menu"
              >
                <Avatar
                  src={profile?.avatar_url}
                  name={profile?.display_name || user.email || 'Author'}
                  size="sm"
                />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-ink-800 rounded-xl shadow-lg border border-ink-100 dark:border-ink-700 py-1.5 animate-slide-up z-50">
                  <div className="px-4 py-2 border-b border-ink-100 dark:border-ink-700">
                    <p className="text-xs font-semibold text-ink-900 dark:text-paper-100 truncate">
                      {profile?.display_name || 'Member'}
                    </p>
                    <p className="text-[11px] text-ink-400 truncate">
                      @{profile?.username || 'user'}
                    </p>
                  </div>

                  <Link
                    to={`/profile/${profile?.username}`}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-ink-600 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700/60"
                  >
                    <User className="w-3.5 h-3.5" />
                    Your Profile
                  </Link>
                  <Link
                    to="/write"
                    className="flex sm:hidden items-center gap-2.5 px-4 py-2 text-xs text-ink-600 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700/60"
                  >
                    <PenSquare className="w-3.5 h-3.5" />
                    Write Essay
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-ink-600 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700/60"
                  >
                    <SettingsIcon className="w-3.5 h-3.5" />
                    Settings
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-cobalt-600 dark:text-cobalt-300 font-medium hover:bg-ink-50 dark:hover:bg-ink-700/60"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Admin Dashboard
                    </Link>
                  )}

                  <div className="my-1 border-t border-ink-100 dark:border-ink-700" />

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth" className="btn-ghost text-xs px-3 py-1.5">
                Sign In
              </Link>
              <Link to="/auth?mode=signup" className="btn-primary text-xs px-3.5 py-1.5">
                Join LOGOS
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 text-ink-600 dark:text-ink-300 hover:text-ink-900 focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 px-4 py-4 space-y-3">
          <Link
            to="/explore"
            className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-ink-200 py-1.5"
          >
            <Compass className="w-4 h-4" />
            Explore
          </Link>
          <Link
            to="/community"
            className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-ink-200 py-1.5"
          >
            <Users className="w-4 h-4" />
            Community
          </Link>
          {user && (
            <Link
              to="/bookmarks"
              className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-ink-200 py-1.5"
            >
              <Bookmark className="w-4 h-4" />
              Bookmarks
            </Link>
          )}
          <Link
            to="/about"
            className="block text-sm font-medium text-ink-500 dark:text-ink-400 py-1.5"
          >
            About LOGOS
          </Link>
          <Link
            to="/guidelines"
            className="block text-sm font-medium text-ink-500 dark:text-ink-400 py-1.5"
          >
            Community Guidelines
          </Link>
        </div>
      )}
    </header>
  );
}
