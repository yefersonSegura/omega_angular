/**
 * Wire names and agent actions for the pedidos feature (single place for strings).
 */
export const PedidosWire = {
  intentLoadList: 'pedidos.loadList',
  listRequested: 'pedidos.list.requested',
  listSuccess: 'pedidos.list.success',
  listFailure: 'pedidos.list.failure',
} as const;

export const PedidosAgentAction = {
  remoteList: 'remoteList',
} as const;
