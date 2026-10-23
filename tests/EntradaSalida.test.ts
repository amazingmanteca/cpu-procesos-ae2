import { describe, it, expect } from "vitest";
import { SimuladorSO } from "../src/SimuladorSO";
import { Proceso } from "../src/Proceso";
import { EstadoProceso } from "../src/EstadoProceso";

describe("Bloqueo por entrada/salida", () => {
  it("el proceso en cpu pasa a bloqueado y se suma un cambio de contexto", () => {
    const sim = new SimuladorSO(2);
    const p1 = new Proceso("P1", 200, 5);
    sim.agregarProceso(p1);
    sim.avanzarTick();
    expect(sim.bloquearProcesoActual(3)).toBe(true);
    expect(p1.estado).toBe(EstadoProceso.Bloqueado);
    expect(p1.tiempoBloqueoRestante).toBe(3);
    expect(sim.cpuProceso).toBeNull();
    expect(sim.colaBloqueados).toEqual([p1]);
    expect(sim.cambiosContexto).toBe(1);
  });

  it("mientras esta bloqueado conserva su memoria", () => {
    const sim = new SimuladorSO(2);
    sim.agregarProceso(new Proceso("P1", 200, 5));
    sim.avanzarTick();
    sim.bloquearProcesoActual();
    sim.avanzarTick();
    expect(sim.memoria.obtenerMetricas().ocupada).toBe(200);
    expect(sim.memoria.bloques[0].pid).toBe("P1");
  });

  it("al cumplir los ticks de bloqueo vuelve a listos y retoma la cpu", () => {
    const sim = new SimuladorSO(2);
    const p1 = new Proceso("P1", 200, 5);
    sim.agregarProceso(p1);
    sim.avanzarTick();
    sim.bloquearProcesoActual(2);

    sim.avanzarTick();
    expect(p1.estado).toBe(EstadoProceso.Bloqueado);
    expect(sim.cpuProceso).toBeNull();

    sim.avanzarTick();
    expect(sim.colaBloqueados).toHaveLength(0);
    expect(p1.estado).toBe(EstadoProceso.Ejecutando);
    expect(p1.tiempoCpuRestante).toBe(3);
  });

  it("sin proceso en cpu no bloquea nada", () => {
    const sim = new SimuladorSO(2);
    expect(sim.bloquearProcesoActual()).toBe(false);
    expect(sim.cambiosContexto).toBe(0);
    expect(() => sim.bloquearProcesoActual(0)).toThrow();
  });
});
