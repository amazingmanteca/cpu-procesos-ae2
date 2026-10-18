import { describe, it, expect } from "vitest";
import { BloqueMemoria } from "../src/BloqueMemoria";

describe("BloqueMemoria", () => {
  it("por defecto se crea libre y sin pid", () => {
    const b = new BloqueMemoria(0, 1024);
    expect(b.libre).toBe(true);
    expect(b.pid).toBeNull();
  });

  it("puede crearse ocupado por un proceso", () => {
    const b = new BloqueMemoria(200, 350, false, "P2");
    expect(b.libre).toBe(false);
    expect(b.pid).toBe("P2");
  });

  it("calcula la direccion final con inicio mas tamanio", () => {
    const b = new BloqueMemoria(550, 150);
    expect(b.fin).toBe(700);
  });
});
