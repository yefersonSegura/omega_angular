---
title: Testing
description: Unit-test omega-angular flows and channel behavior in Angular — OmegaChannel, OmegaFlowManager, intents, and events without spinning the full UI.
outline: deep
---

# Testing

Omega pushes **orchestration** into **`OmegaFlow`** and **IO** into **agents** behind **`OmegaChannel`**. That makes **unit tests** straightforward: construct a channel (and optionally a manager), **emit** or **`handleIntent`**, and assert **RxJS** emissions or side effects on doubles.

## What to test first

| Target | Approach |
| ------ | -------- |
| **`OmegaChannel`** | `new OmegaChannel()`, `emitNamed`, `firstValueFrom(channel.on('name')))` — see library tests below. |
| **`OmegaFlow`** | Instantiate with the same channel; call **`onIntent`** / **`onEvent`** directly, or register on **`OmegaFlowManager`** and use **`handleIntent`**. |
| **`OmegaFlowManager`** | `registerFlow`, **`switchTo`** / **`activate`**, then **`handleIntent`**; subscribe to **`channel.events`** for expected emissions. |
| **Agent + behaviors** | Pass a test **`OmegaChannel`**; **`emitNamed`** events the behavior listens for; assert **`AuthApi`** (mock) calls from the reaction handler. |

## Minimal channel test (same style as the library)

The **`omega-angular`** package itself tests the channel with **Jasmine** + **`firstValueFrom`**:

```typescript
import { firstValueFrom } from 'rxjs';
import { OmegaChannel } from 'omega-angular';

it('emits and filters by name', async () => {
  const channel = new OmegaChannel();
  const promise = firstValueFrom(channel.on('ping'));
  channel.emitNamed('pong');
  channel.emitNamed('ping', { x: 1 });
  const e = await promise;
  expect(e.name).toBe('ping');
  expect(e.payloadAs<{ x: number }>()?.x).toBe(1);
});
```

Copy this pattern into **`src/app/auth/omega/auth.flow.spec.ts`** (or a single **`omega.runtime.spec.ts`**) to lock wire names and payloads.

## Testing a flow through the manager

```typescript
import { OmegaChannel, OmegaFlowManager, OmegaIntent } from 'omega-angular';
import { AuthFlow } from './auth.flow';
import { AuthWire } from './auth.constants';

it('emits loginRequested when intent is valid', () => {
  const channel = new OmegaChannel();
  const received: string[] = [];
  channel.events.subscribe((e) => received.push(e.name));

  const manager = new OmegaFlowManager(channel);
  manager.registerFlow(new AuthFlow(channel));
  manager.switchTo('auth');

  manager.handleIntent(
    OmegaIntent.fromName(AuthWire.intentLogin, {
      payload: { username: 'u', password: 'p' },
    }),
  );

  expect(received).toContain(AuthWire.loginRequested);
});
```

Use **`fakeAsync`** / **`tick()`** if your agent schedules microtasks or timers.

## Angular `TestBed` (optional)

If you need **`inject(AuthApi)`** inside **`createAgents`**, use **`TestBed.configureTestingModule({ providers: [...provideOmega(...), { provide: AuthApi, useValue: mock }] })`** and **`TestBed.inject(OmegaFlowManager)`**. For **pure** flow logic, **`new AuthFlow(channel)`** without **`TestBed`** is often enough.

## Component tests

Prefer **testing the flow + channel** over clicking the full template for every branch. When you do test a component, provide **`OmegaChannel`** and **`OmegaFlowManager`** (or override with test doubles) via **`TestBed`**.

## What’s next

- **[Cookbook](./cookbook)** — reference implementations  
- **[Agents & behaviors](./agents-behaviors)** — reaction handler patterns  
- Library source test: `projects/omega-angular/src/lib/omega-angular.spec.ts`  
