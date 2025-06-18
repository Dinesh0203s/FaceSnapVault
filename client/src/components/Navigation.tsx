import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Camera, Sun, Moon, Menu, LogOut } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const userNavItems = user ? [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
    ...(user.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ] : [];

  const NavLink = ({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) => (
    <Link href={href}>
      <a
        className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
          location === href ? "text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-800" : ""
        }`}
        onClick={onClick}
      >
        {label}
      </a>
    </Link>
  );

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-3">
              <Camera className="text-2xl text-blue-600" />
              <span className="text-xl font-bold">FaceSnapVault</span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
            
            {userNavItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
            
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-gray-700 dark:text-gray-300 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <div className="flex items-center space-x-2 ml-4">
                <Link href="/login">
                  <a className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3 py-2">
                    Login
                  </a>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="ml-2"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-yellow-500" />
              ) : (
                <Moon className="h-4 w-4 text-gray-600" />
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-yellow-500" />
              ) : (
                <Moon className="h-4 w-4 text-gray-600" />
              )}
            </Button>
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="py-4">
                  <div className="flex items-center space-x-3 mb-6">
                    <Camera className="text-2xl text-blue-600" />
                    <span className="text-xl font-bold">FaceSnapVault</span>
                  </div>
                  
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <NavLink key={item.href} {...item} onClick={() => setMobileMenuOpen(false)} />
                    ))}
                    
                    {userNavItems.map((item) => (
                      <NavLink key={item.href} {...item} onClick={() => setMobileMenuOpen(false)} />
                    ))}
                    
                    <hr className="border-gray-200 dark:border-gray-700 my-4" />
                    
                    {user ? (
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700"
                        onClick={() => {
                          signOut();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    ) : (
                      <>
                        <NavLink href="/login" label="Login" onClick={() => setMobileMenuOpen(false)} />
                        <NavLink href="/signup" label="Sign Up" onClick={() => setMobileMenuOpen(false)} />
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
