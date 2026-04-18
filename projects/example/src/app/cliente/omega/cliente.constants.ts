/**
 * Wire names and agent actions for the cliente feature (single place for strings).
 */
export const ClienteWire = {
  intentLoadList: 'cliente.loadList',
  listRequested: 'cliente.list.requested',
  listSuccess: 'cliente.list.success',
  listFailure: 'cliente.list.failure',
} as const;

export const ClienteAgentAction = {
  remoteList: 'remoteList',
} as const;
