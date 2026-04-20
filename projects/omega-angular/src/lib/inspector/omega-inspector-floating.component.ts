import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';

import { OmegaInspectorPanelComponent } from './omega-inspector-panel.component';

/**
 * Dev overlay independent of the Angular {@link Router}, toggled by keyboard shortcut.
 * Window-like behavior: drag, resize, maximize/restore.
 * Mount with {@link provideOmegaInspectorFloatingUi}.
 */
@Component({
  selector: 'omega-inspector-floating',
  standalone: true,
  imports: [OmegaInspectorPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="omega-inspector-floating__root">
      @if (expanded()) {
        <div
          class="omega-inspector-floating__panel"
          role="dialog"
          aria-label="Omega Inspector"
          [class.omega-inspector-floating__panel--maximized]="maximized()"
          [style.left.px]="rect().x"
          [style.top.px]="rect().y"
          [style.width.px]="rect().width"
          [style.height.px]="rect().height"
        >
          <div
            class="omega-inspector-floating__head"
            (pointerdown)="onDragStart($event)"
          >
            <span class="omega-inspector-floating__title">OMEGA INSPECTOR</span>
            <span class="omega-inspector-floating__hint">Ctrl+Shift+O</span>
            <button
              type="button"
              class="omega-inspector-floating__max"
              [attr.aria-label]="maximized() ? 'Restore inspector' : 'Maximize inspector'"
              (click)="toggleMaximize()"
            >
              {{ maximized() ? '❐' : '□' }}
            </button>
            <button
              type="button"
              class="omega-inspector-floating__min"
              aria-label="Minimize inspector"
              (click)="expanded.set(false)"
            >
              −
            </button>
          </div>
          <div class="omega-inspector-floating__body">
            <omega-inspector-panel />
          </div>
          @if (!maximized()) {
            <div
              class="omega-inspector-floating__resize"
              role="presentation"
              aria-hidden="true"
              (pointerdown)="onResizeStart($event)"
            ></div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .omega-inspector-floating__root {
        position: static;
        z-index: 2147483646;
        pointer-events: none;
      }
      .omega-inspector-floating__root > * {
        pointer-events: auto;
      }
      .omega-inspector-floating__panel {
        position: fixed;
        display: flex;
        flex-direction: column;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid rgba(0, 210, 255, 0.25);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
        background: #0a0a0c;
      }
      .omega-inspector-floating__panel--maximized {
        border-radius: 12px;
      }
      .omega-inspector-floating__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 12px;
        background: linear-gradient(90deg, rgba(157, 80, 187, 0.2), rgba(0, 210, 255, 0.08));
        border-bottom: 1px solid rgba(0, 210, 255, 0.18);
        cursor: move;
        user-select: none;
      }
      .omega-inspector-floating__title {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.12em;
        color: #c8c8d4;
      }
      .omega-inspector-floating__hint {
        margin-left: auto;
        font-size: 10px;
        color: #8b8b9a;
        letter-spacing: 0.08em;
      }
      .omega-inspector-floating__max,
      .omega-inspector-floating__min {
        border: none;
        background: transparent;
        color: #8b8b9a;
        font-size: 14px;
        line-height: 1;
        cursor: pointer;
        padding: 4px 8px;
      }
      .omega-inspector-floating__max:hover,
      .omega-inspector-floating__min:hover {
        color: #00d2ff;
      }
      .omega-inspector-floating__body {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }
      .omega-inspector-floating__body ::ng-deep omega-inspector-panel {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }
      .omega-inspector-floating__body ::ng-deep .omega-inspector {
        flex: 1;
        min-height: 0;
      }
      .omega-inspector-floating__resize {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 16px;
        height: 16px;
        cursor: nwse-resize;
        background: linear-gradient(135deg, transparent 50%, rgba(0, 210, 255, 0.35) 50%);
      }
    `,
  ],
})
export class OmegaInspectorFloatingComponent {
  protected readonly expanded = signal(false);
  protected readonly maximized = signal(false);
  protected readonly rect = signal(defaultRect());

  private restoreRect: Rect | null = null;
  private dragState: { startX: number; startY: number; x: number; y: number } | null = null;
  private resizeState: { startX: number; startY: number; width: number; height: number } | null = null;

  @HostListener('window:keydown', ['$event'])
  protected onWindowKeydown(event: KeyboardEvent): void {
    const isToggle = (event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'o';
    if (!isToggle || isTypingTarget(event.target)) {
      return;
    }
    event.preventDefault();
    this.expanded.update((v) => !v);
    if (!this.expanded()) {
      this.dragState = null;
      this.resizeState = null;
    } else {
      this.ensureRectWithinViewport();
    }
  }

  @HostListener('window:keydown.escape')
  protected onEscape(): void {
    if (this.expanded()) {
      this.expanded.set(false);
      this.dragState = null;
      this.resizeState = null;
    }
  }

  @HostListener('window:resize')
  protected onWindowResize(): void {
    if (this.maximized()) {
      this.rect.set(maximizedRect());
      return;
    }
    this.ensureRectWithinViewport();
  }

  @HostListener('window:pointermove', ['$event'])
  protected onPointerMove(event: PointerEvent): void {
    if (this.dragState) {
      const dx = event.clientX - this.dragState.startX;
      const dy = event.clientY - this.dragState.startY;
      const current = this.rect();
      this.rect.set(
        clampRect({
          ...current,
          x: this.dragState.x + dx,
          y: this.dragState.y + dy,
        }),
      );
      return;
    }
    if (this.resizeState) {
      const dx = event.clientX - this.resizeState.startX;
      const dy = event.clientY - this.resizeState.startY;
      const current = this.rect();
      this.rect.set(
        clampRect({
          ...current,
          width: this.resizeState.width + dx,
          height: this.resizeState.height + dy,
        }),
      );
    }
  }

  @HostListener('window:pointerup')
  protected onPointerUp(): void {
    this.dragState = null;
    this.resizeState = null;
  }

  protected onDragStart(event: PointerEvent): void {
    if (event.button !== 0 || this.maximized()) {
      return;
    }
    const r = this.rect();
    this.dragState = { startX: event.clientX, startY: event.clientY, x: r.x, y: r.y };
    this.resizeState = null;
    event.preventDefault();
  }

  protected onResizeStart(event: PointerEvent): void {
    if (event.button !== 0 || this.maximized()) {
      return;
    }
    const r = this.rect();
    this.resizeState = {
      startX: event.clientX,
      startY: event.clientY,
      width: r.width,
      height: r.height,
    };
    this.dragState = null;
    event.preventDefault();
  }

  protected toggleMaximize(): void {
    if (!this.maximized()) {
      this.restoreRect = this.rect();
      this.rect.set(maximizedRect());
      this.maximized.set(true);
      return;
    }
    this.maximized.set(false);
    this.rect.set(clampRect(this.restoreRect ?? defaultRect()));
  }

  private ensureRectWithinViewport(): void {
    this.rect.set(clampRect(this.rect()));
  }
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return target.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const EDGE = 12;
const MIN_WIDTH = 420;
const MIN_HEIGHT = 320;

function defaultRect(): Rect {
  if (typeof window === 'undefined') {
    return { x: EDGE, y: EDGE, width: 720, height: 560 };
  }
  const maxW = Math.max(MIN_WIDTH, window.innerWidth - EDGE * 2);
  const maxH = Math.max(MIN_HEIGHT, window.innerHeight - EDGE * 2);
  const width = Math.min(720, maxW);
  const height = Math.min(560, maxH);
  return {
    x: Math.max(EDGE, window.innerWidth - width - EDGE),
    y: Math.max(EDGE, window.innerHeight - height - EDGE),
    width,
    height,
  };
}

function maximizedRect(): Rect {
  if (typeof window === 'undefined') {
    return { x: EDGE, y: EDGE, width: 900, height: 700 };
  }
  return {
    x: EDGE,
    y: EDGE,
    width: Math.max(MIN_WIDTH, window.innerWidth - EDGE * 2),
    height: Math.max(MIN_HEIGHT, window.innerHeight - EDGE * 2),
  };
}

function clampRect(rect: Rect): Rect {
  if (typeof window === 'undefined') {
    return rect;
  }
  const maxWidth = Math.max(MIN_WIDTH, window.innerWidth - EDGE * 2);
  const maxHeight = Math.max(MIN_HEIGHT, window.innerHeight - EDGE * 2);
  const width = clamp(rect.width, MIN_WIDTH, maxWidth);
  const height = clamp(rect.height, MIN_HEIGHT, maxHeight);
  const maxX = Math.max(EDGE, window.innerWidth - width - EDGE);
  const maxY = Math.max(EDGE, window.innerHeight - height - EDGE);
  return {
    x: clamp(rect.x, EDGE, maxX),
    y: clamp(rect.y, EDGE, maxY),
    width,
    height,
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
