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
    this.admitirProcesos();
    this.despachar();
    this.ejecutar();
  }

  private ejecutar(): void {
    const proceso = this.cpuProceso;
    if (proceso === null) {
      return;
    }
    this.ticksCpuOcupada++;
    proceso.tiempoCpuRestante--;
    proceso.quantumConsumido++;

    if (proceso.tiempoCpuRestante === 0) {
      proceso.estado = EstadoProceso.Terminado;
      this.memoria.liberar(proceso.pid);
      this.procesosTerminados.push(proceso);
      this.cpuProceso = null;
    } else if (proceso.quantumConsumido === this.quantum) {
      if (this.colaListos.length > 0) {
        proceso.estado = EstadoProceso.Listo;
        proceso.quantumConsumido = 0;
        this.colaListos.push(proceso);
        this.cpuProceso = null;
        this.cambiosContexto++;
      }
    }
  }

  private despachar(): void {
    if (this.cpuProceso === null && this.colaListos.length > 0) {
      const proceso = this.colaListos.shift() as Proceso;
      proceso.estado = EstadoProceso.Ejecutando;
      proceso.quantumConsumido = 0;
      this.cpuProceso = proceso;
    }
  }

  private admitirProcesos(): void {
    for (const proceso of this.colaNuevos.splice(0)) {
      proceso.estado = EstadoProceso.EsperandoMemoria;
      this.colaEsperandoMemoria.push(proceso);
    }

    // Se reintenta en cada tick, asi un proceso que no entro puede hacerlo cuando se libere memoria
    let i = 0;
    while (i < this.colaEsperandoMemoria.length) {
      const proceso = this.colaEsperandoMemoria[i];
      if (this.memoria.asignarBestFit(proceso)) {
        proceso.estado = EstadoProceso.Listo;
        this.colaListos.push(proceso);
        this.colaEsperandoMemoria.splice(i, 1);
      } else {
        i++;
      }
    }
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
