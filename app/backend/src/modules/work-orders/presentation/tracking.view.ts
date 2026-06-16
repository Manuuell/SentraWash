interface TrackOrder {
  numeroOrden: number;
  estado: string;
  fechaIngreso: Date;
  fechaListo: Date | null;
  fechaEntrega: Date | null;
}
interface TrackVehicle {
  placa: string;
  tipo: string;
}

const STAGES = [
  { key: 'recibido', label: 'Recibido', emoji: '📥' },
  { key: 'en_proceso', label: 'En lavado', emoji: '🚿' },
  { key: 'secado', label: 'Secado', emoji: '💨' },
  { key: 'listo', label: 'Listo', emoji: '✅' },
  { key: 'entregado', label: 'Entregado', emoji: '🎉' },
];

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const fmt = (d: Date | null): string => {
  if (!d) return '';
  try {
    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return d.toISOString();
  }
};

const shell = (title: string, body: string): string => `<!DOCTYPE html>
<html lang="es"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · SentraWash</title>
<style>
  :root { --brand:#0F6FFF; --green:#34C759; --bg:#F2F2F7; --muted:#8a8a8e; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:#1c1c1e;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
    display:flex; justify-content:center; padding:24px 16px; }
  .card { background:#fff; border-radius:22px; max-width:440px; width:100%;
    padding:28px 24px; box-shadow:0 10px 30px rgba(0,0,0,.06); }
  .brand { color:var(--brand); font-weight:800; letter-spacing:-.3px; font-size:15px; }
  h1 { font-size:24px; margin:6px 0 2px; letter-spacing:-.5px; }
  .sub { color:var(--muted); font-size:14px; margin-bottom:24px; }
  .plate { display:inline-block; background:#1c1c1e; color:#fff; font-weight:800;
    letter-spacing:2px; padding:6px 14px; border-radius:8px; font-size:18px; }
  .steps { margin-top:24px; }
  .step { display:flex; gap:14px; align-items:flex-start; }
  .rail { display:flex; flex-direction:column; align-items:center; }
  .dot { width:34px; height:34px; border-radius:50%; display:flex; align-items:center;
    justify-content:center; font-size:16px; background:#e5e5ea; color:#8a8a8e; flex:0 0 auto; }
  .line { width:3px; flex:1; min-height:26px; background:#e5e5ea; }
  .step.done .dot { background:var(--green); }
  .step.active .dot { background:var(--brand); box-shadow:0 0 0 6px rgba(15,111,255,.15); }
  .step .meta { padding-bottom:18px; }
  .step .name { font-weight:700; font-size:16px; }
  .step.pending .name { color:#b0b0b5; font-weight:600; }
  .step .time { color:var(--muted); font-size:13px; margin-top:2px; }
  .badge { margin-top:6px; display:inline-block; font-size:12.5px; font-weight:700;
    padding:5px 12px; border-radius:20px; }
  .footer { margin-top:24px; text-align:center; color:var(--muted); font-size:12.5px; }
</style></head>
<body><div class="card">${body}</div></body></html>`;

export function renderTrackingPage(order: TrackOrder, vehicle: TrackVehicle | null): string {
  if (order.estado === 'cancelado') {
    return shell(
      `Orden #${order.numeroOrden}`,
      `<div class="brand">SENTRAWASH</div>
       <h1>Orden #${order.numeroOrden}</h1>
       ${vehicle ? `<span class="plate">${esc(vehicle.placa)}</span>` : ''}
       <div class="badge" style="background:#ffeceb;color:#FF3B30;margin-top:18px;">Orden cancelada</div>
       <div class="footer">SentraWash · Seguimiento de tu vehículo</div>`,
    );
  }

  const current = STAGES.findIndex((s) => s.key === order.estado);
  const times: Record<string, Date | null> = {
    recibido: order.fechaIngreso,
    listo: order.fechaListo,
    entregado: order.fechaEntrega,
  };

  const steps = STAGES.map((s, i) => {
    const state = i < current ? 'done' : i === current ? 'active' : 'pending';
    const time = times[s.key] ? `<div class="time">${fmt(times[s.key])}</div>` : '';
    const dotIcon = state === 'done' ? '✓' : s.emoji;
    const line = i < STAGES.length - 1 ? '<div class="line"></div>' : '';
    return `<div class="step ${state}">
      <div class="rail"><div class="dot">${dotIcon}</div>${line}</div>
      <div class="meta"><div class="name">${s.label}</div>${time}</div>
    </div>`;
  }).join('');

  const headline = current >= 3 ? '¡Tu vehículo está listo! 🎉' : 'Estamos trabajando en tu vehículo';

  return shell(
    `Orden #${order.numeroOrden}`,
    `<div class="brand">SENTRAWASH</div>
     <h1>${esc(headline)}</h1>
     <div class="sub">Orden #${order.numeroOrden}${vehicle ? ` · ${esc(vehicle.tipo)}` : ''}</div>
     ${vehicle ? `<span class="plate">${esc(vehicle.placa)}</span>` : ''}
     <div class="steps">${steps}</div>
     <div class="footer">SentraWash · Seguimiento en vivo</div>`,
  );
}

export function renderNotFoundPage(): string {
  return shell(
    'No encontrada',
    `<div class="brand">SENTRAWASH</div>
     <h1>Orden no encontrada</h1>
     <div class="sub">El enlace no es válido o la orden ya no existe.</div>`,
  );
}
