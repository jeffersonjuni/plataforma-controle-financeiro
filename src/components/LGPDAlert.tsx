"use client";
import { useState } from "react";
import "../styles/lgpd.css";

export default function LGPDAlert() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="lgpd-alert">
      <p>
         Este sistema protege suas informações em conformidade com a{" "}
        <strong>LGPD</strong>.
      </p>
      <button onClick={() => setVisible(false)}>Entendi</button>
    </div>
  );
}
