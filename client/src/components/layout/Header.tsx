import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSite } from "@/contexts/SiteContext";
import {
  User,
  LogOut,
  Settings,
  Upload,
  Users,
  List,
  Home,
} from "lucide-react";

export function Header() {
  const { user, logout } = useAuth();
  const { settings } = useSite();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const renderNavLinks = () => {
    if (!user) {
      // Not logged in
      return (
        <>
          <Link
            to="/"
            className="text-gray-300 hover:text-purple-400 transition-colors"
          >
            <Home className="w-4 h-4 mr-1 inline" />
            Home
          </Link>
          <Link
            to="/anime"
            className="text-gray-300 hover:text-purple-400 transition-colors"
          >
            Anime Library
          </Link>
        </>
      );
    }

    // Base links for all logged-in users
    const baseLinks = (
      <>
        <Link
          to="/"
          className="text-gray-300 hover:text-purple-400 transition-colors"
        >
          <Home className="w-4 h-4 mr-1 inline" />
          Home
        </Link>
        <Link
          to="/anime"
          className="text-gray-300 hover:text-purple-400 transition-colors"
        >
          Anime Library
        </Link>
      </>
    );

    if (user.role === "user") {
      return (
        <>
          {baseLinks}
          <Link
            to="/my-list"
            className="text-gray-300 hover:text-purple-400 transition-colors"
          >
            <List className="w-4 h-4 mr-1 inline" />
            My List
          </Link>
        </>
      );
    }

    if (user.role === "staff") {
      return (
        <>
          {baseLinks}
          <Link
            to="/admin"
            className="text-gray-300 hover:text-purple-400 transition-colors"
          >
            <Upload className="w-4 h-4 mr-1 inline" />
            Upload Anime
          </Link>
          <Link
            to="/admin"
            className="text-gray-300 hover:text-purple-400 transition-colors"
          >
            Upload Episodes
          </Link>
        </>
      );
    }

    if (user.role === "admin") {
      return (
        <>
          {baseLinks}
          <Link
            to="/admin"
            className="text-gray-300 hover:text-purple-400 transition-colors"
          >
            <Upload className="w-4 h-4 mr-1 inline" />
            Upload Anime
          </Link>
          <Link
            to="/admin"
            className="text-gray-300 hover:text-purple-400 transition-colors"
          >
            Upload Episodes
          </Link>
          <Link
            to="/admin/staff"
            className="text-gray-300 hover:text-purple-400 transition-colors"
          >
            <Users className="w-4 h-4 mr-1 inline" />
            Manage Staff
          </Link>
          <Link
            to="/admin/settings"
            className="text-gray-300 hover:text-purple-400 transition-colors"
          >
            <Settings className="w-4 h-4 mr-1 inline" />
            Site Settings
          </Link>
        </>
      );
    }

    return baseLinks;
  };

  return (
    <>
      {settings.site_announcement && (
        <div className="bg-purple-600 text-white text-center py-2 px-4 text-sm">
          {settings.site_announcement}
        </div>
      )}
      <header className="bg-black/90 backdrop-blur-sm border-b border-purple-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 mb-[10px] mt-[10px] mr-[25px] ml-[25px] rounded-tl-[px] rounded-tr-[px] rounded-br-[px] rounded-bl-[px]">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              {settings.site_logo && settings.site_logo.startsWith("/") ? (
                <img
                  src={settings.site_logo}
                  alt="Site Logo"
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <div className="text-2xl font-bold text-purple-400">
                  {settings.site_logo}
                </div>
              )}
              <h1 className="text-2xl font-bold text-white">
                {settings.site_name}
              </h1>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              {renderNavLinks()}
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user.username}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        user.role === "admin"
                          ? "bg-red-600"
                          : user.role === "staff"
                            ? "bg-blue-600"
                            : "bg-green-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-white"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:text-white"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
