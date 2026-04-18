export interface PedidosRow {
  readonly id: string;
  readonly nombre: string;
}

export type PedidosListResult =
  | { readonly ok: true; readonly items: readonly PedidosRow[] }
  | { readonly ok: false; readonly reason: string };
