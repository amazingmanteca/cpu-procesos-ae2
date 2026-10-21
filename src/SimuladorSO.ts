import { Memoria } from "./Memoria";
import { Proceso } from "./Proceso";
import { EstadoProceso } from "./EstadoProceso";

export class SimuladorSO {
  readonly memoria: Memoria;
  readonly quantum: number;

  colaNuevos: Proceso[] = [];
  colaEsperandoMemoria: Proceso[] = [];
  colaListos: Proceso[] = [];
  colaBloqueados: Proceso[] = [];
  procesosTerminados: Proceso[] = [];

  cpuProceso: Proceso | null = null;
  relojTick = 0;
  cambiosContexto = 0;
  ticksCpuOcupada = 0;

  constructor(quantum = 2, tamanioMemoria = 1024) {
    if (!Number.isInteger(quantum) || quantum <= 0) {
      throw new Error("El quantum debe ser un entero mayor a 0");
    }
    this.quantum = quantum;
    this.memoria = new Memoria(tamanioMemoria);
  }

  agregarProceso(proceso: Proceso): void {
    if (this.todosLosProcesos().some((p) => p.pid === proceso.pid)) {
      throw new Error(`Ya existe un proceso con pid ${proceso.pid}`);
    }
    proceso.estado = EstadoProceso.Nuevo;
    this.colaNuevos.push(proceso);
  }

  avanzarTick(): void {
    this.relojTick++;
  }

  private todosLosProcesos(): Proceso[] {
    const procesos = [
      ...this.colaNuevos,
      ...this.colaEsperandoMemoria,
      ...this.colaListos,
      ...this.colaBloqueados,
      ...this.procesosTerminados,
    ];
    if (this.cpuProceso) {
      procesos.push(this.cpuProceso);
    }
    return procesos;
  }
}
