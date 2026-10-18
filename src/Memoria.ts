import { BloqueMemoria } from "./BloqueMemoria";

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
}
