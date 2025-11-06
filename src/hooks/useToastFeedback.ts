
import { useState } from "react";

export function useToastFeedback() {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "error" | "">("");

  const showSuccess = (msg: string) => {
    setMessage(msg);
    setType("success");
    setTimeout(() => setMessage(""), 3000);
  };

  const showError = (msg: string) => {
    setMessage(msg);
    setType("error");
    setTimeout(() => setMessage(""), 3000);
  };

  return { message, type, showSuccess, showError };
}
