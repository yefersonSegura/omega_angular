import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  isDevMode,
  type EnvironmentProviders,
  type Provider,
  provideAppInitializer,
} from '@angular/core';

import { OmegaInspectorFloatingComponent } from './omega-inspector-floating.component';

/**
 * Mounts {@link OmegaInspectorFloatingComponent} on `document.body` after bootstrap — **no Router route**.
 * Requires {@link provideOmegaInspector} (and thus {@link provideOmega}) to be registered first.
 *
 * ```ts
 * providers: [
 *   ...provideOmegaInspector({ consoleLog: true }),
 *   ...provideOmega(createOptions()),
 *   ...provideOmegaInspectorFloatingUi(),
 * ]
 * ```
 */
export interface OmegaInspectorFloatingUiOptions {
  /**
   * Enable floating inspector window in production builds.
   *
   * @remarks
   * Defaults to `false` so UI is dev-only.
   */
  allowInProd?: boolean;
}

export function provideOmegaInspectorFloatingUi(
  options: OmegaInspectorFloatingUiOptions = {},
): Array<Provider | EnvironmentProviders> {
  if (!isDevMode() && !options.allowInProd) {
    return [];
  }
  return [
    provideAppInitializer(() => {
      const env = inject(EnvironmentInjector);
      const appRef = inject(ApplicationRef);
      queueMicrotask(() => {
        const ref = createComponent(OmegaInspectorFloatingComponent, {
          environmentInjector: env,
        });
        document.body.appendChild(ref.location.nativeElement);
        appRef.attachView(ref.hostView);
        ref.changeDetectorRef.detectChanges();
      });
    }),
  ];
}
