export function FieldGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

export function FInput({ value, onChange, placeholder, type = "text", mask }) {
  const handleChange = (e) => {
    let val = e.target.value;
    if (mask === "cnpj") {
      val = val.replace(/\D/g, "").slice(0, 14);
      val = val.replace(/(\d{2})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
    }
    onChange({ ...e, target: { ...e.target, value: val } });
  };
  return (
    <input type={type} value={value} onChange={handleChange} placeholder={placeholder}
      style={{ width: "100%", border: "1px solid #ddd", borderRadius: 6, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", outline: "none", color: "#333", WebkitAppearance: "none", boxSizing: "border-box" }} />
  );
}

export function FTextarea({ value, onChange, rows = 3 }) {
  return (
    <textarea value={value} onChange={onChange} rows={rows}
      style={{ width: "100%", border: "1px solid #ddd", borderRadius: 6, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", outline: "none", color: "#333", resize: "vertical", boxSizing: "border-box" }} />
  );
}
