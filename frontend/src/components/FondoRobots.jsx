import RobotFlotante from "./RobotFlotante";
import "./RobotFlotante.css";

export default function FondoRobots() {
  return (
    <>
      <RobotFlotante
        variante="cian"
        className="robot-pos-1"
        style={{ "--robot-tam": "130px", "--robot-duracion": "7s", "--robot-retraso": "0s" }}
      />
      <RobotFlotante
        variante="violeta"
        className="robot-pos-2"
        style={{ "--robot-tam": "90px", "--robot-duracion": "5.5s", "--robot-retraso": "1.2s" }}
      />
      <RobotFlotante
        variante="magenta"
        className="robot-pos-3"
        style={{ "--robot-tam": "100px", "--robot-duracion": "6.5s", "--robot-retraso": "2.1s" }}
      />
      <RobotFlotante
        variante="cian"
        className="robot-pos-4"
        style={{ "--robot-tam": "75px", "--robot-duracion": "5s", "--robot-retraso": "0.6s" }}
      />
    </>
  );
}
