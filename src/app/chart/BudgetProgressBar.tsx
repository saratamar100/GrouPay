import React from "react";
import { formatILS } from "../utils/money";

interface BudgetProgressBarProps {
  used: number;
  total: number;
}

export default function BudgetProgressBar({
  used,
  total,
}: BudgetProgressBarProps) {
  const percentage = Math.min((used / total) * 100, 100);

  const containerStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "#e0e0e0",
    borderRadius: "8px",
    overflow: "hidden",
    height: "30px",
    marginBottom: "10px",
  };

  const rawPercentage = (used / total) * 100;
  const fillerStyle: React.CSSProperties = {
    height: "100%",
    width: `${percentage}%`,
    backgroundColor:
      rawPercentage > 100
        ? "#e53935"
        : rawPercentage >= 80
        ? "#fb8c00"
        : "var(--primary)",
    transition: "width 0.5s ease-in-out",
  };

  const textStyle: React.CSSProperties = {
    textAlign: "center",
    color: "var(--primary)",
    marginBottom: "5px",
  };

  return (
    <div>
      <div style={textStyle}>
        {formatILS(used)} מתוך {formatILS(total)} נוצלו
      </div>
      <div style={containerStyle}>
        <div style={fillerStyle}></div>
      </div>
    </div>
  );
}
