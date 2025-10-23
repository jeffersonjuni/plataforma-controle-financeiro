"use client";
import { useEffect, useState } from "react";
import "../styles/lgpd.css";

export default function LGPDAlert() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("lgpdAccepted");
    if (!accepted) setShow(true);
  }, []);

  function handleAccept() {
    localStorage.setItem("lgpdAccepted", "true");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="lgpd-alert">
      <p>Este site utiliza cookies para melhorar sua experiência.</p>
      <button onClick={handleAccept}>Entendi</button>
    </div>
  );
}
