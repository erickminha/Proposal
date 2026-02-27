import { useState } from "react";

export function FieldGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ 
        display: "block", 
        fontSize: 11, 
        fontWeight: 800, 
        letterSpacing: "0.05em", 
        textTransform: "uppercase", 
        color: "#64748b", 
        marginBottom: 8,
        marginLeft: 2
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function FInput({ value, onChange, placeholder, type = "text", mask }) {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleChange = (e) => {
    let val = e.target.value;
    if (mask === "cnpj") {
      val = val.replace(/\D/g, "").slice(0, 14);
      val = val.replace(/(\d{2})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
    }
    onChange({ ...e, target: { ...e.target, value: val } });
  };

  return (
    <input 
      type={type} 
      value={value} 
      onChange={handleChange} 
      placeholder={placeholder}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{ 
        width: "100%", 
        border: `1.5px solid ${isFocused ? "#3b82f6" : "#e2e8f0"}`, 
        borderRadius: 10, 
        padding: "12px 16px", 
        fontSize: 14, 
        fontFamily: "'Inter', sans-serif", 
        outline: "none", 
        color: "#1e293b", 
        transition: "all 0.2s ease",
        boxShadow: isFocused ? "0 0 0 4px rgba(59, 130, 246, 0.08)" : "none",
        background: isFocused ? "white" : "#f8fafc",
        boxSizing: "border-box" 
      }} 
    />
  );
}

export function FTextarea({ value, onChange, rows = 3 }) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <textarea 
      value={value} 
      onChange={onChange} 
      rows={rows}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{ 
        width: "100%", 
        border: `1.5px solid ${isFocused ? "#3b82f6" : "#e2e8f0"}`, 
        borderRadius: 10, 
        padding: "12px 16px", 
        fontSize: 14, 
        fontFamily: "'Inter', sans-serif", 
        outline: "none", 
        color: "#1e293b", 
        resize: "vertical", 
        transition: "all 0.2s ease",
        boxShadow: isFocused ? "0 0 0 4px rgba(59, 130, 246, 0.08)" : "none",
        background: isFocused ? "white" : "#f8fafc",
        boxSizing: "border-box" 
      }} 
    />
  );
}
