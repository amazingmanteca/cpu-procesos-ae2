import { BloqueMemoria } from "./BloqueMemoria";
import { Proceso } from "./Proceso";

export class Memoria {
  readonly tamanioTotal: number;
  bloques: BloqueMemoria[];

  constructor(tamanioTotal = 1024) {
    if (!Number.isInteger(tamanioTotal) || tamanioTotal <= 0) {
      throw new Error("El tamanio de la memoria debe ser un entero mayor a 0");
    }
    this.tamanioTotal = tamanioTotal;
    // Al iniciar toda la memoria es un unico bloque libre
    this.bloques = [new BloqueMemoria(0, tamanioTotal)];
  }

  asignarBestFit(proceso: Proceso): boolean {
    let mejorIndice = -1;
    let menorDesperdicio = Infinity;

    for (let i = 0; i < this.bloques.length; i++) {
      const bloque = this.bloques[i];
      if (bloque.libre && bloque.tamanio >= proceso.tamanioMemoria) {
        const desperdicio = bloque.tamanio - proceso.tamanioMemoria;
        // Con menor estricto, si hay empate queda el primer bloque encontrado
        if (desperdicio < menorDesperdicio) {
          menorDesperdicio = desperdicio;
          mejorIndice = i;
        }
      }
    }

    if (mejorIndice === -1) {
      return false;
    }
    this.partirYAsignar(mejorIndice, proceso);
    return true;
  }

  liberar(pid: string): boolean {
    const bloque = this.bloques.find((b) => b.pid === pid);
    if (!bloque) {
      return false;
    }
    bloque.libre = true;
    bloque.pid = null;
    return true;
  }

  private partirYAsignar(indice: number, proceso: Proceso): void {
    const bloque = this.bloques[indice];
    // Si sobra espacio se crea un bloque libre justo despues del asignado
    if (bloque.tamanio > proceso.tamanioMemoria) {
      const sobrante = new BloqueMemoria(
        bloque.inicio + proceso.tamanioMemoria,
        bloque.tamanio - proceso.tamanioMemoria
      );
      bloque.tamanio = proceso.tamanioMemoria;
      this.bloques.splice(indice + 1, 0, sobrante);
    }
    bloque.libre = false;
    bloque.pid = proceso.pid;
  }
}
