"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "../styles/sidebar.css";

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  const [username, setUsername] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setUsername(userObj.name || "");
    }
  }, []);

  // Função auxiliar para saber se o link está ativo
  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  return (
    <aside className="sidebar">
      <Link href="/configuracoes" className="username-link">
        <p className="username">
          <span className="username-icon">
            <img src="/icons/user-icon.png" alt="Usuário" />
          </span>
          <span className="username-text">{username}</span>
        </p>
      </Link>

      <nav>
        <ul>
          <li>
            <Link
              href="/dashboard"
              className={isActive("/dashboard") ? "active" : ""}
            >
              Dashboard
            </Link>
          </li>

          <li>
            <Link
              href="/transactions"
              className={isActive("/transactions") ? "active" : ""}
            >
              Transações
            </Link>
          </li>

          <li>
            <Link
              href="/relatorios"
              className={isActive("/relatorios") ? "active" : ""}
            >
              Relatórios
            </Link>
          </li>

          <li>
            <Link
              href="/accounts"
              className={isActive("/accounts") ? "active" : ""}
            >
              Contas
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
