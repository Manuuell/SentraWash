/** Línea de detalle de una orden (servicio aplicado con su precio congelado). */
export interface WorkOrderItemProps {
  id: string | null;
  serviceId: string | null;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}
