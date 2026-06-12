/** Estados del flujo conversacional del bot para crear una orden de lavado. */
export enum WaFlowState {
  INICIO = 'INICIO',
  ESPERANDO_SERVICIO = 'ESPERANDO_SERVICIO',
  ESPERANDO_PLACA = 'ESPERANDO_PLACA',
  ESPERANDO_TIPO = 'ESPERANDO_TIPO',
  CONFIRMACION = 'CONFIRMACION',
}
