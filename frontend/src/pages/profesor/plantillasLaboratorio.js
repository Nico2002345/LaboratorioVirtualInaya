export const PLANTILLAS_CONFIGURACION = {
  quiz: {
    preguntas: [
      {
        id: 1,
        enunciado: "Enunciado de la pregunta",
        tipo: "opcion_multiple",
        opciones: ["Opción A", "Opción B", "Opción C"],
        respuesta_correcta: "Opción A",
        puntaje: 1,
      },
    ],
  },
  entrega_archivo: {},
  direccionamiento_ip: {
    red: "192.168.1.0",
    prefijo: 24,
    gateway_esperado: "192.168.1.1",
    mascaras_opciones: ["255.255.255.0", "255.255.0.0", "255.0.0.0"],
  },
  ensamble_pc: {
    piezas: [
      { id: "ram", nombre: "Memoria RAM", zona_correcta: "zona-ram" },
      { id: "mouse", nombre: "Mouse", zona_correcta: null },
    ],
    zonas: [{ id: "zona-ram", nombre: "Ranura de memoria" }],
  },
  editor_web: {
    html_inicial: "<!-- Escribe aquí el contenido de tu página -->\n",
    css_inicial: "body {\n  font-family: sans-serif;\n}\n",
    js_inicial: "",
    criterios: [{ campo: "html", contiene: "<h1", mensaje: "Debe existir un <h1>." }],
  },
  simulador_bd: {
    consigna: "Describe aquí lo que el estudiante debe modelar.",
    criterios: [
      { tipo: "min_tablas", valor: 2, mensaje: "Debes crear al menos 2 tablas." },
      { tipo: "min_relaciones", valor: 1, mensaje: "Debes crear al menos 1 relación." },
    ],
  },
};

export const TIPOS_LABORATORIO = [
  { value: "quiz", label: "Cuestionario (autocalificado)" },
  { value: "entrega_archivo", label: "Entrega de archivo" },
  { value: "direccionamiento_ip", label: "Direccionamiento IP" },
  { value: "ensamble_pc", label: "Ensamble de computador" },
  { value: "editor_web", label: "Editor HTML/CSS/JS" },
  { value: "simulador_bd", label: "Simulador de base de datos" },
];
