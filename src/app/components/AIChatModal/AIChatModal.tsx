import React, { useState, useRef, useEffect } from "react";
import styles from "./AIChatModal.module.css";

interface AIChatModalProps {
  onClose: () => void;
}
interface Message {
  role: "user" | "model";
  text: string;
}

const AIChatModal: React.FC<AIChatModalProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialGreeting = {
    role: "model" as const,
    text: "שלום! אני GrouPay Assistant. איך אוכל לעזור לך עם הקבוצות וההוצאות שלך היום?",
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([initialGreeting]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const newUserMessage: Message = { role: "user", text: input.trim() };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const historyForAPI = updatedMessages.map((m) => ({
        role: m.role,
        message: m.text,
      }));

      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newUserMessage.text,
          history: historyForAPI,
        }),
      });

      const data = await response.json();

      if (data.response) {
        setMessages((prev) => [
          ...prev,
          { role: "model", text: data.response },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "model", text: "מצטער, נתקלתי בשגיאה בשרת." },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "אירעה שגיאת רשת. נסה שוב." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.chatWindow}>
        <div className={styles.chatHeader}>
          <span>GrouPay Assistant</span>
          <button onClick={onClose} className={styles.closeButton}>
            X
          </button>
        </div>
        <div className={styles.messagesContainer}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles.message} ${styles[msg.role]}`}
            >
              {msg.text}
            </div>
          ))}
          {loading && <div className={styles.loadingIndicator}>מקליד...</div>}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSend} className={styles.inputArea}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="שאל שאלה על GrouPay..."
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            שלח
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatModal;
