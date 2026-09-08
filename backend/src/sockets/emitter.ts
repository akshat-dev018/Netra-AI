type Handler = (event: string, payload: unknown) => void;
let emit: Handler = () => undefined;

export function setTrackingEmitter(fn: Handler): void {
  emit = fn;
}

export function emitTracking(event: string, payload: unknown): void {
  emit(event, payload);
}

let emitMap: Handler = () => undefined;
export function setMapEmitter(fn: Handler): void {
  emitMap = fn;
}
export function emitMapEvent(event: string, payload: unknown): void {
  emitMap(event, payload);
}

let emitAlerts: Handler = () => undefined;
export function setAlertEmitter(fn: Handler): void {
  emitAlerts = fn;
}
export function emitAlert(event: string, payload: unknown): void {
  emitAlerts(event, payload);
}

let emitRisk: Handler = () => undefined;
export function setRiskEmitter(fn: Handler): void {
  emitRisk = fn;
}
export function emitRiskEvent(event: string, payload: unknown): void {
  emitRisk(event, payload);
}
