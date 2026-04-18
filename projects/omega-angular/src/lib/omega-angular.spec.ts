import { firstValueFrom } from 'rxjs';

import { OmegaChannel } from './core/channel/omega-channel';

describe('OmegaChannel', () => {
  it('emits and filters by name', async () => {
    const channel = new OmegaChannel();
    const promise = firstValueFrom(channel.on('ping'));
    channel.emitNamed('pong');
    channel.emitNamed('ping', { x: 1 });
    const e = await promise;
    expect(e.name).toBe('ping');
    expect(e.payloadAs<{ x: number }>()?.x).toBe(1);
  });
});
