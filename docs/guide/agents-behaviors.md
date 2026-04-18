# Agents & behaviors

**`OmegaAgent`** is a **channel listener** with pluggable rules. For each incoming **`OmegaEvent`**, it runs **behavior engines** in order until one returns a **non-null reaction**; that reaction is passed to **your** handler (HTTP, `sessionStorage`, etc.).

## Pieces

| Type | Role |
| ---- | ---- |
| **`OmegaAgentBehaviorEngine`** | Abstract class: implement **`evaluate(ctx)`** → `OmegaAgentReaction \| null`. First match wins for that event. |
| **`OmegaAgentBehaviorContext`** | `{ event }` — read name/payload and decide. |
| **`OmegaAgentReaction`** | `{ action: string; payload?: unknown }` — domain-specific discriminator for your handler. |
| **`OmegaAgentReactionHandler`** | `(reaction) => void` — perform side effects (call **`AuthApi`**, write session, …). |

## `OmegaAgent` lifecycle

```ts
const agent = new OmegaAgent(channel, [new LoginBehavior(), new LogoutBehavior()], (reaction) => {
  switch (reaction.action) {
    case 'remoteLogin':
      // call HttpClient, then channel.emitNamed(...) with results
      return;
  }
});
```

- The agent **subscribes** to **`channel.events`** in the constructor.
- **`destroy()`** unsubscribes — call if you ever replace agents at runtime (uncommon in root bootstrap).

## Pattern used in the example app

1. Flow emits **`auth.loginRequested`** with credentials.
2. **`AuthLoginBehavior`** matches that event and returns `{ action: AuthAgentAction.remoteLogin, payload }`.
3. The reaction handler runs **`authApi.login`**; on success it **`emitNamed(AuthWire.success, …)`**.
4. **`AuthFlow.onEvent`** listens for success and emits **navigator** payload for the router bridge.

This keeps **Angular services** injectable in the factory (`createAuthAgent(channel, inject(AuthApi))`) while flows stay orchestration-only.

## Testing

- Provide a test **`OmegaChannel`**, register minimal flows/agents, and assert **`emit` / `handleIntent`** sequences with **RxJS** `TestScheduler` or simple subscriptions in **`fakeAsync`**.
