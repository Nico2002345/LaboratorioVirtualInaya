const COLORES = {
  cian: { primario: "#22e0ff", secundario: "#0891b2" },
  violeta: { primario: "#b478ff", secundario: "#7c3aed" },
  magenta: { primario: "#ff4fd8", secundario: "#a21caf" },
};

export default function RobotFlotante({ variante = "cian", className = "", style }) {
  const color = COLORES[variante] || COLORES.cian;
  const gradId = `robot-grad-${variante}`;

  return (
    <div className={`robot-flotante ${className}`} style={style} aria-hidden="true">
      <svg viewBox="0 0 120 170" className="robot-svg">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color.primario} />
            <stop offset="100%" stopColor={color.secundario} />
          </linearGradient>
        </defs>

        <g className="robot-cuerpo">
          <line x1="60" y1="2" x2="60" y2="14" stroke={`url(#${gradId})`} strokeWidth="3" />
          <circle cx="60" cy="0" r="4" className="robot-antena-luz" fill={color.primario} />

          <g className="robot-cabeza">
            <rect x="32" y="14" width="56" height="42" rx="12" fill="#0a0e1aee" stroke={`url(#${gradId})`} strokeWidth="2.5" />
            <rect x="44" y="30" width="32" height="9" rx="4.5" className="robot-visor" fill={color.primario} />
          </g>

          <rect x="51" y="56" width="18" height="10" fill={`url(#${gradId})`} opacity="0.6" />

          <rect x="20" y="66" width="80" height="58" rx="16" fill="#0a0e1aee" stroke={`url(#${gradId})`} strokeWidth="2.5" />
          <circle cx="60" cy="95" r="9" className="robot-nucleo" fill="none" stroke={color.primario} strokeWidth="2.5" />
          <circle cx="60" cy="95" r="3" fill={color.primario} />

          <g className="robot-brazo-izq">
            <rect x="2" y="72" width="14" height="42" rx="7" fill="#0a0e1aee" stroke={`url(#${gradId})`} strokeWidth="2.5" />
          </g>
          <g className="robot-brazo-der">
            <rect x="104" y="72" width="14" height="42" rx="7" fill="#0a0e1aee" stroke={`url(#${gradId})`} strokeWidth="2.5" />
          </g>

          <rect x="34" y="122" width="16" height="38" rx="8" fill="#0a0e1aee" stroke={`url(#${gradId})`} strokeWidth="2.5" />
          <rect x="70" y="122" width="16" height="38" rx="8" fill="#0a0e1aee" stroke={`url(#${gradId})`} strokeWidth="2.5" />
        </g>
      </svg>
    </div>
  );
}
