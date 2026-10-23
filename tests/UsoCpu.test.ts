import { describe, it, expect } from "vitest";
import { SimuladorSO } from "../src/SimuladorSO";
import { Proceso } from "../src/Proceso";

describe("Uso de cpu", () => {
  it("antes del primer tick el uso de cpu es cero", () => {
    const sim = new SimuladorSO();
    expect(sim.obtenerMetricas().usoCpu).toBe(0);
  });

  it("los ticks con la cpu ociosa bajan el porcentaje de uso", () => {
    const sim = new SimuladorSO(2);
    sim.agregarProceso(new Proceso("P1", 200, 4));
    sim.avanzarTick();
    sim.bloquearProcesoActual(3);
    sim.avanzarTick();
    sim.avanzarTick();
    // Ejecuto en el tick 1 y estuvo bloqueado en los ticks 2 y 3
    expect(sim.ticksCpuOcupada).toBe(1);
    expect(sim.obtenerMetricas().usoCpu).toBeCloseTo(33.33, 2);
  });

  it("las metricas del simulador incluyen las de memoria y los cambios de contexto", () => {
    const sim = new SimuladorSO(2);
    sim.agregarProceso(new Proceso("P1", 256, 4));
    sim.agregarProceso(new Proceso("P2", 256, 4));
    sim.avanzarTick();
    sim.avanzarTick();
    const m = sim.obtenerMetricas();
    expect(m.usoCpu).toBe(100);
    expect(m.cambiosContexto).toBe(1);
    expect(m.ocupada).toBe(512);
    expect(m.porcentajeOcupacion).toBe(50);
    expect(m.fragmentacionExterna).toBe(0);
  });
});
