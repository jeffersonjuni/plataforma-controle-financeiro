"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  async function submit() {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setStatus(data.message);
  }

  return (
    <div className="login-container">
      <form
        className="login-form"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <h2>Recuperar senha</h2>

        <input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" className="submit-btn">
          Enviar link
        </button>

        {status && <p>{status}</p>}
      </form>
    </div>
  );
}
