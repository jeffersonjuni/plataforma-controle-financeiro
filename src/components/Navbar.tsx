"use client";
import "../styles/navbar.css";

export default function Navbar() {

  return (
    <nav className="navbar">
      <div className="navbar-logo">💰 Controle Financeiro</div>
      <div className="navbar-actions">
        <div className="navbar-user">👤 Usuário</div>
      </div>
    </nav>
  );
}
