import { describe, it, expect } from "vitest";
import { Proceso } from "../src/Proceso";
import { EstadoProceso } from "../src/EstadoProceso";

describe("Proceso", () => {
  it("guarda pid, tamanio de memoria y tiempo de cpu", () => {
    const p = new Proceso("P1", 200, 4);
    expect(p.pid).toBe("P1");
    expect(p.tamanioMemoria).toBe(200);
    expect(p.tiempoCpuTotal).toBe(4);
  });

  it("empieza en estado nuevo", () => {
    const p = new Proceso("P1", 200, 4);
    expect(p.estado).toBe(EstadoProceso.Nuevo);
  });

  it("el tiempo restante arranca igual al total y los contadores en cero", () => {
    const p = new Proceso("P1", 200, 4);
    expect(p.tiempoCpuRestante).toBe(4);
    expect(p.quantumConsumido).toBe(0);
    expect(p.tiempoBloqueoRestante).toBe(0);
  });

  it("no permite un pid vacio", () => {
    expect(() => new Proceso("  ", 200, 4)).toThrow();
  });

  it("no permite tamanio ni tiempo de cpu menores o iguales a cero", () => {
    expect(() => new Proceso("P1", 0, 4)).toThrow();
    expect(() => new Proceso("P1", -50, 4)).toThrow();
    expect(() => new Proceso("P1", 200, 0)).toThrow();
    expect(() => new Proceso("P1", 200, 2.5)).toThrow();
  });
});
