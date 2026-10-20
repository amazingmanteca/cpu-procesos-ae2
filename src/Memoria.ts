import { BloqueMemoria } from "./BloqueMemoria";
import { Proceso } from "./Proceso";
import { MetricasMemoria } from "./MetricasMemoria";

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
    this.coalescencia();
    return true;
  }

  coalescencia(): void {
    let i = 0;
    while (i < this.bloques.length - 1) {
      const actual = this.bloques[i];
      const siguiente = this.bloques[i + 1];
      if (actual.libre && siguiente.libre) {
        actual.tamanio += siguiente.tamanio;
        this.bloques.splice(i + 1, 1);
        // No se avanza i porque el bloque crecio y puede unirse tambien con el que sigue
      } else {
        i++;
      }
    }
  }

  obtenerMetricas(): MetricasMemoria {
    let ocupada = 0;
    let libreTotal = 0;
    let mayorHueco = 0;

    for (const bloque of this.bloques) {
      if (bloque.libre) {
        libreTotal += bloque.tamanio;
        mayorHueco = Math.max(mayorHueco, bloque.tamanio);
      } else {
        ocupada += bloque.tamanio;
      }
    }

    return {
      ocupada,
      libreTotal,
      mayorHueco,
      porcentajeOcupacion: (ocupada / this.tamanioTotal) * 100,
      fragmentacionExterna: 0,
    };
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
