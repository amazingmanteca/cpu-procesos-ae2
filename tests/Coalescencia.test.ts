import { describe, it, expect } from "vitest";
import { Memoria } from "../src/Memoria";
import { BloqueMemoria } from "../src/BloqueMemoria";

// Caso de la catedra: P2 queda entre dos huecos de 200 KB
function memoriaCasoCatedra(): Memoria {
  const memoria = new Memoria(1024);
  memoria.bloques = [
    new BloqueMemoria(0, 200, false, "P1"),
    new BloqueMemoria(200, 200),
    new BloqueMemoria(400, 224, false, "P2"),
    new BloqueMemoria(624, 200),
    new BloqueMemoria(824, 200, false, "P3"),
  ];
  return memoria;
}

describe("Liberacion y coalescencia", () => {
  it("liberar marca el bloque libre y le quita el pid", () => {
    const memoria = memoriaCasoCatedra();
    expect(memoria.liberar("P1")).toBe(true);
    expect(memoria.bloques[0]).toMatchObject({ inicio: 0, libre: true, pid: null });
  });

  it("devuelve false si el pid no esta en memoria", () => {
    const memoria = memoriaCasoCatedra();
    expect(memoria.liberar("P9")).toBe(false);
    expect(memoria.bloques).toHaveLength(5);
  });

  it("une el bloque liberado con el hueco de la derecha", () => {
    const memoria = memoriaCasoCatedra();
    memoria.liberar("P1");
    expect(memoria.bloques).toHaveLength(4);
    expect(memoria.bloques[0]).toMatchObject({ inicio: 0, tamanio: 400, libre: true });
  });

  it("une el bloque liberado con el hueco de la izquierda", () => {
    const memoria = memoriaCasoCatedra();
    memoria.liberar("P3");
    expect(memoria.bloques).toHaveLength(4);
    expect(memoria.bloques[3]).toMatchObject({ inicio: 624, tamanio: 400, libre: true });
  });

  it("une los tres bloques cuando el liberado queda entre dos huecos", () => {
    const memoria = memoriaCasoCatedra();
    memoria.liberar("P2");
    expect(memoria.bloques).toHaveLength(3);
    expect(memoria.bloques[1]).toMatchObject({ inicio: 200, tamanio: 624, libre: true });
  });

  it("no fusiona si los vecinos estan ocupados", () => {
    const memoria = new Memoria(600);
    memoria.bloques = [
      new BloqueMemoria(0, 200, false, "P1"),
      new BloqueMemoria(200, 200, false, "P2"),
      new BloqueMemoria(400, 200, false, "P3"),
    ];
    memoria.liberar("P2");
    expect(memoria.bloques).toHaveLength(3);
    expect(memoria.bloques[1]).toMatchObject({ inicio: 200, tamanio: 200, libre: true });
  });
});
