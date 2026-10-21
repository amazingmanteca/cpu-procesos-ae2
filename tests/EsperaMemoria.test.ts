import { describe, it, expect } from "vitest";
import { SimuladorSO } from "../src/SimuladorSO";
import { Proceso } from "../src/Proceso";
import { EstadoProceso } from "../src/EstadoProceso";

describe("Ingreso de procesos y espera de memoria", () => {
  it("agregarProceso deja el proceso como nuevo hasta el primer tick", () => {
    const sim = new SimuladorSO();
    const p1 = new Proceso("P1", 200, 4);
    sim.agregarProceso(p1);
    expect(p1.estado).toBe(EstadoProceso.Nuevo);
    expect(sim.colaNuevos).toEqual([p1]);
  });

  it("no permite dos procesos con el mismo pid", () => {
    const sim = new SimuladorSO();
    sim.agregarProceso(new Proceso("P1", 200, 4));
    expect(() => sim.agregarProceso(new Proceso("P1", 100, 2))).toThrow();
  });

  it("los que entran en memoria pasan a listo y el que no entra queda esperando", () => {
    const sim = new SimuladorSO();
    const p2 = new Proceso("P2", 350, 3);
    const p3 = new Proceso("P3", 150, 2);
    const p4 = new Proceso("P4", 400, 3);
    sim.agregarProceso(new Proceso("P1", 200, 4));
    sim.agregarProceso(p2);
    sim.agregarProceso(p3);
    sim.agregarProceso(p4);
    sim.avanzarTick();

    expect(sim.colaNuevos).toHaveLength(0);
    expect(p2.estado).toBe(EstadoProceso.Listo);
    expect(p3.estado).toBe(EstadoProceso.Listo);
    expect(p4.estado).toBe(EstadoProceso.EsperandoMemoria);
    expect(sim.colaEsperandoMemoria.map((p) => p.pid)).toEqual(["P4"]);
    expect(sim.memoria.obtenerMetricas().ocupada).toBe(700);
  });

  it("un proceso mas grande que toda la memoria sigue esperando", () => {
    const sim = new SimuladorSO(2, 512);
    const grande = new Proceso("P1", 600, 2);
    sim.agregarProceso(grande);
    sim.avanzarTick();
    sim.avanzarTick();
    sim.avanzarTick();
    expect(grande.estado).toBe(EstadoProceso.EsperandoMemoria);
    expect(sim.memoria.obtenerMetricas().ocupada).toBe(0);
  });
});
