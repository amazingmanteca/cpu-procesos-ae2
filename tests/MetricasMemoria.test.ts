import { describe, it, expect } from "vitest";
import { Memoria } from "../src/Memoria";
import { BloqueMemoria } from "../src/BloqueMemoria";
import { Proceso } from "../src/Proceso";

describe("Metricas de memoria", () => {
  it("memoria vacia tiene todo libre y fragmentacion cero", () => {
    const m = new Memoria().obtenerMetricas();
    expect(m.ocupada).toBe(0);
    expect(m.libreTotal).toBe(1024);
    expect(m.mayorHueco).toBe(1024);
    expect(m.porcentajeOcupacion).toBe(0);
    expect(m.fragmentacionExterna).toBe(0);
  });

  it("memoria llena no divide por cero", () => {
    const memoria = new Memoria(512);
    memoria.asignarBestFit(new Proceso("P1", 512, 2));
    const m = memoria.obtenerMetricas();
    expect(m.libreTotal).toBe(0);
    expect(m.mayorHueco).toBe(0);
    expect(m.porcentajeOcupacion).toBe(100);
    expect(m.fragmentacionExterna).toBe(0);
  });

  it("calcula el porcentaje de ocupacion", () => {
    const memoria = new Memoria();
    memoria.asignarBestFit(new Proceso("P1", 256, 2));
    expect(memoria.obtenerMetricas().porcentajeOcupacion).toBe(25);
  });

  it("calcula 27,01% de fragmentacion con huecos de 200 y 74 KB", () => {
    const memoria = new Memoria(1024);
    memoria.bloques = [
      new BloqueMemoria(0, 200),
      new BloqueMemoria(200, 350, false, "P2"),
      new BloqueMemoria(550, 400, false, "P4"),
      new BloqueMemoria(950, 74),
    ];
    const m = memoria.obtenerMetricas();
    expect(m.ocupada).toBe(750);
    expect(m.libreTotal).toBe(274);
    expect(m.mayorHueco).toBe(200);
    expect(m.fragmentacionExterna).toBeCloseTo(27.01, 2);
  });

  it("la coalescencia baja la fragmentacion de 50% a 0%", () => {
    const memoria = new Memoria(1024);
    memoria.bloques = [
      new BloqueMemoria(0, 200, false, "P1"),
      new BloqueMemoria(200, 200),
      new BloqueMemoria(400, 224, false, "P2"),
      new BloqueMemoria(624, 200),
      new BloqueMemoria(824, 200, false, "P3"),
    ];
    expect(memoria.obtenerMetricas().fragmentacionExterna).toBe(50);
    memoria.liberar("P2");
    const m = memoria.obtenerMetricas();
    expect(m.mayorHueco).toBe(624);
    expect(m.fragmentacionExterna).toBe(0);
  });
});
