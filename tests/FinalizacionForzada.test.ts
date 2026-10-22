import { describe, it, expect } from "vitest";
import { SimuladorSO } from "../src/SimuladorSO";
import { Proceso } from "../src/Proceso";
import { EstadoProceso } from "../src/EstadoProceso";

describe("Finalizacion forzada de un proceso", () => {
  it("finalizar el proceso en cpu libera la cpu y su memoria", () => {
    const sim = new SimuladorSO(2);
    const p1 = new Proceso("P1", 200, 5);
    sim.agregarProceso(p1);
    sim.agregarProceso(new Proceso("P2", 300, 5));
    sim.avanzarTick();
    expect(sim.finalizarProceso("P1")).toBe(true);
    expect(p1.estado).toBe(EstadoProceso.Terminado);
    expect(sim.cpuProceso).toBeNull();
    expect(sim.memoria.bloques[0]).toMatchObject({ inicio: 0, tamanio: 200, libre: true });
    // Quedan huecos de 200 y 524 KB separados por P2
    expect(sim.obtenerMetricas().fragmentacionExterna).toBeCloseTo(27.62, 2);
  });

  it("finalizar un proceso de la cola de listos lo saca de la cola", () => {
    const sim = new SimuladorSO(2);
    sim.agregarProceso(new Proceso("P1", 200, 5));
    sim.agregarProceso(new Proceso("P2", 300, 5));
    sim.agregarProceso(new Proceso("P3", 100, 5));
    sim.avanzarTick();
    sim.finalizarProceso("P2");
    expect(sim.colaListos.map((p) => p.pid)).toEqual(["P3"]);
    expect(sim.procesosTerminados.map((p) => p.pid)).toEqual(["P2"]);
    expect(sim.memoria.obtenerMetricas().ocupada).toBe(300);
  });

  it("finalizar un proceso que espera memoria no toca la memoria", () => {
    const sim = new SimuladorSO(2, 512);
    const grande = new Proceso("P1", 600, 3);
    sim.agregarProceso(grande);
    sim.avanzarTick();
    expect(sim.finalizarProceso("P1")).toBe(true);
    expect(sim.colaEsperandoMemoria).toHaveLength(0);
    expect(sim.memoria.bloques).toHaveLength(1);
  });

  it("devuelve false si el pid no existe o ya termino", () => {
    const sim = new SimuladorSO(2);
    sim.agregarProceso(new Proceso("P1", 200, 1));
    sim.avanzarTick();
    expect(sim.finalizarProceso("P1")).toBe(false);
    expect(sim.finalizarProceso("P9")).toBe(false);
  });
});
