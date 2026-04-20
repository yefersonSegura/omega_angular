/**
 * Wire names and agent actions for the factura feature (single place for strings).
 */
export const FacturaWire = {
  intentLoadList: 'factura.loadList',
  listRequested: 'factura.list.requested',
  listSuccess: 'factura.list.success',
  listFailure: 'factura.list.failure',
} as const;

export const FacturaAgentAction = {
  remoteList: 'remoteList',
} as const;
