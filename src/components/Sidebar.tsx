"use client";

import { useEffect, useState } from "react";
import "../styles/sidebar.css";

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setUsername(userObj.name || "");
    }
  }, []);

  return (
    <aside className="sidebar">
      <p className="username">
        <span className="username-icon">👤</span>
        <span className="username-text">{username}</span>
      </p>
      <nav>
        <ul>
          <li>
            <a href="/dashboard">Dashboard</a>
          </li>
          <li>
            <a href="/transactions">Transações</a>
          </li>
          <li>
            <a href="/relatorios">Relatórios</a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
