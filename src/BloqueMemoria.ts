export class BloqueMemoria {
  inicio: number;
  tamanio: number;
  libre: boolean;
  pid: string | null;

  constructor(inicio: number, tamanio: number, libre = true, pid: string | null = null) {
    this.inicio = inicio;
    this.tamanio = tamanio;
    this.libre = libre;
    this.pid = pid;
  }

  get fin(): number {
    return this.inicio + this.tamanio;
  }
}
