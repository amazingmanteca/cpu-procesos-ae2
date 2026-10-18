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
    this.pid = pid;
    this.tamanioMemoria = tamanioMemoria;
    this.tiempoCpuTotal = tiempoCpuTotal;
    this.tiempoCpuRestante = tiempoCpuTotal;
  }
}
