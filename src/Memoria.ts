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
