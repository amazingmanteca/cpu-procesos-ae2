import { describe, it, expect } from "vitest";
import { SimuladorSO } from "../src/SimuladorSO";
import { Proceso } from "../src/Proceso";

// Caso de prueba de la catedra con quantum 2 y 1024 KB, los procesos piden 1100 KB en total
function crearSimulador(): SimuladorSO {
  const sim = new SimuladorSO(2, 1024);
  sim.agregarProceso(new Proceso("P1", 200, 4));
  sim.agregarProceso(new Proceso("P2", 350, 3));
  sim.agregarProceso(new Proceso("P3", 150, 2));
  sim.agregarProceso(new Proceso("P4", 400, 3));
  return sim;
}

// Estado esperado al final de cada tick, tomado de la salida del programa original
const esperado = [
  { listos: ["P2", "P3"], ocupada: 700, libre: 324, mayor: 324, frag: 0, cc: 0 },
  { listos: ["P2", "P3", "P1"], ocupada: 700, libre: 324, mayor: 324, frag: 0, cc: 1 },
  { listos: ["P3", "P1"], ocupada: 700, libre: 324, mayor: 324, frag: 0, cc: 1 },
  { listos: ["P3", "P1", "P2"], ocupada: 700, libre: 324, mayor: 324, frag: 0, cc: 2 },
  { listos: ["P1", "P2"], ocupada: 700, libre: 324, mayor: 324, frag: 0, cc: 2 },
  { listos: ["P1", "P2"], ocupada: 550, libre: 474, mayor: 474, frag: 0, cc: 2 },
  { listos: ["P2", "P4"], ocupada: 950, libre: 74, mayor: 74, frag: 0, cc: 2 },
  { listos: ["P2", "P4"], ocupada: 750, libre: 274, mayor: 200, frag: 27.01, cc: 2 },
  { listos: ["P4"], ocupada: 400, libre: 624, mayor: 550, frag: 11.86, cc: 2 },
  { listos: [], ocupada: 400, libre: 624, mayor: 550, frag: 11.86, cc: 2 },
  { listos: [], ocupada: 400, libre: 624, mayor: 550, frag: 11.86, cc: 2 },
  { listos: [], ocupada: 0, libre: 1024, mayor: 1024, frag: 0, cc: 2 },
];

describe("Traza de referencia de 12 ticks", () => {
  it("coincide tick a tick con la salida del programa original", () => {
    const sim = crearSimulador();
    esperado.forEach((e, i) => {
      sim.avanzarTick();
      const m = sim.obtenerMetricas();
      expect(sim.relojTick).toBe(i + 1);
      expect(sim.colaListos.map((p) => p.pid)).toEqual(e.listos);
      expect(m.ocupada).toBe(e.ocupada);
      expect(m.libreTotal).toBe(e.libre);
      expect(m.mayorHueco).toBe(e.mayor);
      expect(m.fragmentacionExterna).toBeCloseTo(e.frag, 2);
      expect(m.cambiosContexto).toBe(e.cc);
    });
  });

  it("P4 espera memoria hasta el tick 7 y la cpu nunca queda ociosa", () => {
    const sim = crearSimulador();
    for (let tick = 1; tick <= 6; tick++) {
      sim.avanzarTick();
      expect(sim.colaEsperandoMemoria.map((p) => p.pid)).toEqual(["P4"]);
    }
    sim.avanzarTick();
    expect(sim.colaEsperandoMemoria).toHaveLength(0);
    for (let tick = 8; tick <= 12; tick++) {
      sim.avanzarTick();
    }
    expect(sim.obtenerMetricas().usoCpu).toBe(100);
  });

  it("al final todos terminan en orden y la memoria vuelve a ser un unico bloque", () => {
    const sim = crearSimulador();
    for (let tick = 1; tick <= 12; tick++) {
      sim.avanzarTick();
    }
    expect(sim.procesosTerminados.map((p) => p.pid)).toEqual(["P3", "P1", "P2", "P4"]);
    expect(sim.cpuProceso).toBeNull();
    expect(sim.memoria.bloques).toHaveLength(1);
    expect(sim.memoria.bloques[0]).toMatchObject({ inicio: 0, tamanio: 1024, libre: true });
  });
});
