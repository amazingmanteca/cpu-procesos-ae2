import { EstadoProceso } from "./EstadoProceso";

export class Proceso {
  readonly pid: string;
  readonly tamanioMemoria: number;
  readonly tiempoCpuTotal: number;
  tiempoCpuRestante: number;
  estado: EstadoProceso = EstadoProceso.Nuevo;
  quantumConsumido = 0;
  tiempoBloqueoRestante = 0;

  constructor(pid: string, tamanioMemoria: number, tiempoCpuTotal: number) {
    if (pid.trim() === "") {
      throw new Error("El pid no puede estar vacio");
    }
    if (!Number.isInteger(tamanioMemoria) || tamanioMemoria <= 0) {
      throw new Error("El tamanio de memoria debe ser un entero mayor a 0");
    }
    if (!Number.isInteger(tiempoCpuTotal) || tiempoCpuTotal <= 0) {
      throw new Error("El tiempo de cpu debe ser un entero mayor a 0");
    }
    this.pid = pid;
    this.tamanioMemoria = tamanioMemoria;
    this.tiempoCpuTotal = tiempoCpuTotal;
    this.tiempoCpuRestante = tiempoCpuTotal;
  }
}
