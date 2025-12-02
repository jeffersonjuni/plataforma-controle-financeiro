"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "../styles/sidebar.css";



export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  const [username, setUsername] = useState("");
  const [isOpen, setIsOpen] = useState(false); 
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setUsername(userObj.name || "");
    }
  }, []);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  return (
    <>
      {/* Botão de menu para mobile */}
      <button
        className="menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir menu"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "active" : ""}`}>
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
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            </li>

            <li>
              <Link
                href="/transactions"
                className={isActive("/transactions") ? "active" : ""}
                onClick={() => setIsOpen(false)}
              >
                Transações
              </Link>
            </li>

            <li>
              <Link
                href="/relatorios"
                className={isActive("/relatorios") ? "active" : ""}
                onClick={() => setIsOpen(false)}
              >
                Relatórios
              </Link>
            </li>

            <li>
              <Link
                href="/accounts"
                className={isActive("/accounts") ? "active" : ""}
                onClick={() => setIsOpen(false)}
              >
                Contas
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Fundo escuro quando o menu está aberto */}
      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
}
