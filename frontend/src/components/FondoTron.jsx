import MotoTron from "./MotoTron";
import "./MotoTron.css";

export default function FondoTron() {
  return (
    <>
      <MotoTron
        variante="naranja"
        direccion="izquierda"
        style={{ "--moto-top": "28%", "--moto-tam": "130px", "--moto-duracion": "12s", "--moto-retraso": "2.5s" }}
      />
      <MotoTron
        variante="naranja"
        direccion="derecha"
        style={{ "--moto-top": "46%", "--moto-tam": "110px", "--moto-duracion": "7.5s", "--moto-retraso": "4s" }}
      />
      <MotoTron
        variante="cian"
        direccion="izquierda"
        style={{ "--moto-top": "64%", "--moto-tam": "150px", "--moto-duracion": "10.5s", "--moto-retraso": "1.2s" }}
      />
      <MotoTron
        variante="cian"
        direccion="derecha"
        style={{ "--moto-top": "82%", "--moto-tam": "120px", "--moto-duracion": "8.5s", "--moto-retraso": "5.5s" }}
      />
      <MotoTron
        variante="naranja"
        direccion="izquierda"
        style={{ "--moto-top": "95%", "--moto-tam": "100px", "--moto-duracion": "9.5s", "--moto-retraso": "3.2s" }}
      />
    </>
  );
}
