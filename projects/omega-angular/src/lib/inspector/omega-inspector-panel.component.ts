import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { OmegaInspectorService } from './omega-inspector.service';

@Component({
  selector: 'omega-inspector-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './omega-inspector-panel.component.html',
  styleUrl: './omega-inspector-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OmegaInspectorPanelComponent {
  protected readonly inspector = inject(OmegaInspectorService);

  protected clear(): void {
    this.inspector.clearLogs();
  }

  protected isChannelActive(entry: { id: string }): boolean {
    return this.inspector.selectedChannelEntry()?.id === entry.id;
  }

  protected isIntentActive(entry: { id: string }): boolean {
    return this.inspector.selectedIntentEntry()?.id === entry.id;
  }
}
