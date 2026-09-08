const COLORES = {
  cian: { primario: "#22e0ff" },
  naranja: { primario: "#ff9500" },
};

export default function MotoTron({ variante = "cian", direccion = "derecha", className = "", style }) {
  const color = COLORES[variante] || COLORES.cian;
  const gradId = `moto-grad-${variante}`;

  return (
    <div
      className={`moto-tron moto-tron-${direccion} moto-tron-${variante} ${className}`}
      style={style}
      aria-hidden="true"
    >
      <svg viewBox="0 0 200 50" className="moto-svg">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color.primario} stopOpacity="0" />
            <stop offset="100%" stopColor={color.primario} stopOpacity="1" />
          </linearGradient>
        </defs>

        <rect className="moto-estela" x="0" y="21" width="150" height="4" fill={`url(#${gradId})`} />

        <g className="moto-cuerpo">
          <path d="M150 32 L194 32 L186 15 L160 15 Z" fill="#050810" stroke={color.primario} strokeWidth="2.5" />
          <rect x="164" y="19" width="16" height="7" rx="3" fill={color.primario} opacity="0.9" />
          <circle cx="168" cy="40" r="9" fill="#050810" stroke={color.primario} strokeWidth="2.5" />
          <circle cx="188" cy="40" r="9" fill="#050810" stroke={color.primario} strokeWidth="2.5" />
        </g>
      </svg>
    </div>
  );
}
