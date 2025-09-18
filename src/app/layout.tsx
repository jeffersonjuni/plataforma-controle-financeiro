import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import LGPDAlert from "../components/LGPDAlert";

export const metadata = {
  title: "Plataforma de Controle Financeiro",
  description: "Aplicação com Next.js, Tailwind e MySQL no Docker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Navbar />
        <div style={{ display: "flex" }}>
          <Sidebar />
          <main style={{ flex: 1, padding: "1rem" }}>{children}</main>
        </div>
        <Footer />
        <LGPDAlert />
      </body>
    </html>
  );
}
