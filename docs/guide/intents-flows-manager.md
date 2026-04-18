# Intents, flows & flow manager

## `OmegaIntent`

An intent is a **typed request** routed by **`OmegaFlowManager`** to active flows.

- Create with **`OmegaIntent.fromName(name, { payload, namespace, meta, id })`**.
- **`name`** resolves from a string or from a wire-name helper (see `OmegaIntentName`).
- **`payloadAs<T>()`** safely narrows `payload` when present.

Intents are **not** persisted by the library — they are in-memory messages from UI or services.

## `OmegaFlow`

Subclass **`OmegaFlow`** once per feature slice:

- **`id`**: unique string (used with `activate` / `switchTo` / `deactivate`).
- **`onIntent(intent)`**: handle intents while this flow is **active**.
- **`onEvent(event)`**: optional; invoked for **every channel event** while active (manager forwards broadcasts).
- **`emit(...)`** (protected): wraps **`OmegaEvent.fromName`** and **`channel.emit`** — prefer this for consistent payloads from the flow.

Keep flows free of **HttpClient** calls; emit events and let **agents** perform IO (enforced by your ESLint presets if enabled).

## `OmegaFlowManager`

Constructed with the same **`OmegaChannel`** instance passed to your flows.

| Method | Purpose |
| ------ | ------- |
| **`registerFlow(flow)`** | Adds `flow.id` → flow. Prefer this over deprecated **`register`**. |
| **`activate(flowId)`** | Adds a flow to the **active set** (multi active). |
| **`deactivate(flowId)`** | Removes from the active set. |
| **`switchTo(flowId)`** | **Single-flow mode**: clears actives and sets one flow. |
| **`handleIntent(intent)`** | Calls **`onIntent`** on **each active flow**. Prefer over deprecated **`dispatch`**. |
| **`getChannel()`** | Access shared bus. |

**Event forwarding**: every **`OmegaEvent`** on the channel is delivered to **`onEvent`** on **each active flow** (in addition to agents listening globally).

## Choosing `activate` vs `switchTo`

- **`switchTo`**: one “screen owner” at a time (typical for wizard or single-route features).
- **`activate`**: multiple flows concurrently (e.g. background sync + visible feature), use carefully to avoid duplicate handling of the same intent.

Set your initial flow in **`provideOmega`**’s **`bootstrap`** hook, e.g. `manager.switchTo('auth')`.
