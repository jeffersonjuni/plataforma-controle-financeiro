"use client";
import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Plataforma de Controle Financeiro</p>
    </footer>
  );
}
