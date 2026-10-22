import { MetricasMemoria } from "./MetricasMemoria";

export interface MetricasSimulador extends MetricasMemoria {
  usoCpu: number;
  cambiosContexto: number;
}
