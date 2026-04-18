export interface ClienteRow {
  readonly id: string;
  readonly nombre: string;
}

export type ClienteListResult =
  | { readonly ok: true; readonly items: readonly ClienteRow[] }
  | { readonly ok: false; readonly reason: string };
