"use client";
import "../styles/navbar.css";

interface NavbarProps {
  onLogout?: () => void;
}

export default function Navbar({ onLogout }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">💰 Controle Financeiro</div>
      <div className="navbar-actions">
        {onLogout && <button onClick={onLogout}>Sair</button>}
      </div>
    </nav>
  );
}
