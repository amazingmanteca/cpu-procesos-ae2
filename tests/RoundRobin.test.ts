import { describe, it, expect } from "vitest";
import { SimuladorSO } from "../src/SimuladorSO";
import { Proceso } from "../src/Proceso";
import { EstadoProceso } from "../src/EstadoProceso";

function pids(procesos: Proceso[]): string[] {
  return procesos.map((p) => p.pid);
}

describe("Planificacion Round-Robin", () => {
  it("no permite un quantum menor o igual a cero", () => {
    expect(() => new SimuladorSO(0)).toThrow();
    expect(() => new SimuladorSO(-1)).toThrow();
  });

  it("despacha los procesos listos en orden de llegada", () => {
    const sim = new SimuladorSO(2);
    sim.agregarProceso(new Proceso("P1", 100, 4));
    sim.agregarProceso(new Proceso("P2", 100, 4));
    sim.agregarProceso(new Proceso("P3", 100, 4));
    sim.avanzarTick();
    expect(sim.cpuProceso?.pid).toBe("P1");
    expect(sim.cpuProceso?.estado).toBe(EstadoProceso.Ejecutando);
    expect(pids(sim.colaListos)).toEqual(["P2", "P3"]);
  });

  it("al agotar el quantum vuelve al final de listos y suma un cambio de contexto", () => {
    const sim = new SimuladorSO(2);
    const p1 = new Proceso("P1", 100, 4);
    sim.agregarProceso(p1);
    sim.agregarProceso(new Proceso("P2", 100, 3));
    sim.avanzarTick();
    sim.avanzarTick();
    expect(sim.cpuProceso).toBeNull();
    expect(p1.estado).toBe(EstadoProceso.Listo);
    expect(p1.tiempoCpuRestante).toBe(2);
    expect(pids(sim.colaListos)).toEqual(["P2", "P1"]);
    expect(sim.cambiosContexto).toBe(1);

    sim.avanzarTick();
    expect(sim.cpuProceso?.pid).toBe("P2");
  });

  it("si no hay otro proceso listo renueva el quantum sin cambio de contexto", () => {
    const sim = new SimuladorSO(2);
    const p1 = new Proceso("P1", 100, 5);
    sim.agregarProceso(p1);
    sim.avanzarTick();
    sim.avanzarTick();
    sim.avanzarTick();
    expect(sim.cpuProceso).toBe(p1);
    expect(p1.quantumConsumido).toBe(1);
    expect(sim.cambiosContexto).toBe(0);
  });

  it("si termina en el mismo tick que agota el quantum cuenta como terminado", () => {
    const sim = new SimuladorSO(2);
    const p1 = new Proceso("P1", 100, 2);
    sim.agregarProceso(p1);
    sim.agregarProceso(new Proceso("P2", 100, 3));
    sim.avanzarTick();
    sim.avanzarTick();
    expect(p1.estado).toBe(EstadoProceso.Terminado);
    expect(pids(sim.colaListos)).toEqual(["P2"]);
    expect(sim.cambiosContexto).toBe(0);
  });

  it("al terminar libera la memoria del proceso", () => {
    const sim = new SimuladorSO(2);
    sim.agregarProceso(new Proceso("P1", 300, 1));
    sim.avanzarTick();
    expect(sim.memoria.obtenerMetricas().ocupada).toBe(0);
    expect(sim.memoria.bloques).toHaveLength(1);
  });

  it("respeta un quantum distinto al de por defecto", () => {
    const sim = new SimuladorSO(3);
    const p1 = new Proceso("P1", 100, 5);
    sim.agregarProceso(p1);
    sim.agregarProceso(new Proceso("P2", 100, 2));
    sim.avanzarTick();
    sim.avanzarTick();
    expect(sim.cpuProceso).toBe(p1);
    sim.avanzarTick();
    expect(sim.cpuProceso).toBeNull();
    expect(pids(sim.colaListos)).toEqual(["P2", "P1"]);
    expect(sim.cambiosContexto).toBe(1);
  });
});
