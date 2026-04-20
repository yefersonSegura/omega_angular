export interface FacturaRow {
  readonly id: string;
  readonly nombre: string;
}

export type FacturaListResult =
  | { readonly ok: true; readonly items: readonly FacturaRow[] }
  | { readonly ok: false; readonly reason: string };
