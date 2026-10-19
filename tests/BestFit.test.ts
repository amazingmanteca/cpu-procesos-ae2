import { describe, it, expect } from "vitest";
import { Memoria } from "../src/Memoria";
import { BloqueMemoria } from "../src/BloqueMemoria";
import { Proceso } from "../src/Proceso";

// Arma una memoria de 1024 KB con huecos de 300, 120 y 500 KB separados por bloques ocupados
function memoriaConHuecos(): Memoria {
  const memoria = new Memoria(1024);
  memoria.bloques = [
    new BloqueMemoria(0, 300),
    new BloqueMemoria(300, 52, false, "X1"),
    new BloqueMemoria(352, 120),
    new BloqueMemoria(472, 52, false, "X2"),
    new BloqueMemoria(524, 500),
  ];
  return memoria;
}

describe("Memoria con Best-Fit", () => {
  it("al iniciar es un unico bloque libre de 1024 KB", () => {
    const memoria = new Memoria();
    expect(memoria.bloques).toHaveLength(1);
    expect(memoria.bloques[0].inicio).toBe(0);
    expect(memoria.bloques[0].tamanio).toBe(1024);
    expect(memoria.bloques[0].libre).toBe(true);
  });

  it("permite configurar el tamanio total", () => {
    const memoria = new Memoria(2048);
    expect(memoria.tamanioTotal).toBe(2048);
    expect(memoria.bloques[0].tamanio).toBe(2048);
    expect(() => new Memoria(0)).toThrow();
  });

  it("al asignar en memoria vacia parte el bloque y deja el resto libre", () => {
    const memoria = new Memoria();
    expect(memoria.asignarBestFit(new Proceso("P1", 200, 4))).toBe(true);
    expect(memoria.bloques).toHaveLength(2);
    expect(memoria.bloques[0]).toMatchObject({ inicio: 0, tamanio: 200, libre: false, pid: "P1" });
    expect(memoria.bloques[1]).toMatchObject({ inicio: 200, tamanio: 824, libre: true, pid: null });
  });

  it("elige el hueco que deja menor desperdicio", () => {
    const memoria = memoriaConHuecos();
    memoria.asignarBestFit(new Proceso("P1", 100, 3));
    // El hueco de 120 KB es el mas ajustado, aunque no sea el primero ni el mas grande
    expect(memoria.bloques[2]).toMatchObject({ inicio: 352, tamanio: 100, pid: "P1" });
    expect(memoria.bloques[3]).toMatchObject({ inicio: 452, tamanio: 20, libre: true });
    expect(memoria.bloques[0].libre).toBe(true);
    expect(memoria.bloques[5].tamanio).toBe(500);
  });

  it("los bloques quedan ordenados por direccion despues de varias asignaciones", () => {
    const memoria = new Memoria();
    memoria.asignarBestFit(new Proceso("P1", 200, 4));
    memoria.asignarBestFit(new Proceso("P2", 350, 3));
    memoria.asignarBestFit(new Proceso("P3", 150, 2));
    const inicios = memoria.bloques.map((b) => b.inicio);
    expect(inicios).toEqual([0, 200, 550, 700]);
    expect(memoria.bloques[3]).toMatchObject({ tamanio: 324, libre: true });
  });

  it("si dos huecos dejan el mismo desperdicio elige el primero", () => {
    const memoria = new Memoria(1024);
    memoria.bloques = [
      new BloqueMemoria(0, 200),
      new BloqueMemoria(200, 100, false, "X1"),
      new BloqueMemoria(300, 200),
      new BloqueMemoria(500, 524, false, "X2"),
    ];
    memoria.asignarBestFit(new Proceso("P1", 150, 2));
    expect(memoria.bloques[0]).toMatchObject({ inicio: 0, pid: "P1" });
    expect(memoria.bloques[3]).toMatchObject({ inicio: 300, tamanio: 200, libre: true });
  });

  it("si el hueco tiene el tamanio exacto no se parte", () => {
    const memoria = memoriaConHuecos();
    memoria.asignarBestFit(new Proceso("P1", 120, 2));
    expect(memoria.bloques).toHaveLength(5);
    expect(memoria.bloques[2]).toMatchObject({ inicio: 352, tamanio: 120, libre: false, pid: "P1" });
  });

  it("devuelve false y no modifica nada si ningun hueco alcanza", () => {
    const memoria = memoriaConHuecos();
    const antes = JSON.stringify(memoria.bloques);
    expect(memoria.asignarBestFit(new Proceso("P1", 600, 2))).toBe(false);
    expect(JSON.stringify(memoria.bloques)).toBe(antes);
  });

  it("no asigna aunque la suma de los huecos alcance, por fragmentacion externa", () => {
    const memoria = memoriaConHuecos();
    // Hay 920 KB libres en total pero el hueco mas grande es de 500 KB
    expect(memoria.asignarBestFit(new Proceso("P1", 550, 2))).toBe(false);
  });
});
