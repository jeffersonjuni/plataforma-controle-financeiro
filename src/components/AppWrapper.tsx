"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface AppWrapperProps {
  children: React.ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    setIsAuthenticated(!!token);
    setCheckedAuth(true);

    if (!token && pathname !== "/login") {
      router.replace("/login");
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    router.push("/login");
  };

  if (!checkedAuth) return <div>Carregando...</div>;

  const hideLayout = pathname === "/login";

  return (
    <div className="app-container">
      {!hideLayout && isAuthenticated && <Sidebar onLogout={handleLogout} />}
      <div className="main-content">
        {!hideLayout && isAuthenticated && <Navbar onLogout={handleLogout} />}
        {children}
        {!hideLayout && isAuthenticated && <Footer />}
      </div>
    </div>
  );
}
