export function Grafica({ series }) {
  return (
    <div className="rounded-[6px] border border-[#dcdfe6] p-[1.1rem]">
      <h3 className="text-[0.92rem] mb-[0.7rem]">Ventas por semana</h3>
      <svg viewBox="0 0 200 60">
        <path d="M0 50 L40 30 L80 38 L120 14 L160 22 L200 8" stroke="#2f6b63" fill="none" />
        <circle cx="200" cy="8" r="3" fill="#24544e" />
      </svg>
      <p className="text-[0.78rem]" style={{ color: '#5f6470' }}>Últimas seis semanas</p>
    </div>
  );
}
