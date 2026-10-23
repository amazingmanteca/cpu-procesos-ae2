import { describe, it, expect } from "vitest";
import { SimuladorSO } from "../src/SimuladorSO";
import { Proceso } from "../src/Proceso";
import { EstadoProceso } from "../src/EstadoProceso";

describe("Simulacion con quantum 1 y memoria de 512 KB", () => {
  it("alterna los procesos en cada tick y el tercero entra cuando termina el primero", () => {
    const sim = new SimuladorSO(1, 512);
    const p1 = new Proceso("P1", 300, 2);
    const p2 = new Proceso("P2", 200, 2);
    const p3 = new Proceso("P3", 100, 1);
    sim.agregarProceso(p1);
    sim.agregarProceso(p2);
    sim.agregarProceso(p3);

    sim.avanzarTick();
    expect(sim.colaListos.map((p) => p.pid)).toEqual(["P2", "P1"]);
    expect(p3.estado).toBe(EstadoProceso.EsperandoMemoria);

    sim.avanzarTick();
    expect(sim.colaListos.map((p) => p.pid)).toEqual(["P1", "P2"]);
    expect(sim.cambiosContexto).toBe(2);

    sim.avanzarTick();
    expect(p1.estado).toBe(EstadoProceso.Terminado);
    expect(sim.memoria.obtenerMetricas().libreTotal).toBe(312);

    sim.avanzarTick();
    expect(sim.colaEsperandoMemoria).toHaveLength(0);
    expect(sim.memoria.bloques[0]).toMatchObject({ inicio: 0, tamanio: 100, pid: "P3" });
    expect(p2.estado).toBe(EstadoProceso.Terminado);
  });
});
