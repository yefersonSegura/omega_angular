# Example application

`projects/example` is the demo used in this repository:

- **Login** mock (`demo` / `demo`) via `AuthFlow` and `AuthApi`.
- **Home** with session data from a resolver (no storage reads inside the component).
- **Sample features** (cliente, pedidos, factura, …) generated with `ng generate omega-angular:feature` to show the list-page + flow + agent pattern.

Run locally from the repo root:

```bash
npm install
npm run start
```

This uses the same **eslint-then** contract as a consumer app after `ng add omega-angular`.
