import { Component, Input } from '@angular/core';
import { PRIORITE_LABEL, PrioriteDossier } from '../../core/models/dossier.model';

@Component({
  selector: 'du-priority-badge',
  standalone: true,
  template: `<span class="badge" [class]="classe">{{ PRIORITE_LABEL[priorite] }}</span>`,
})
export class PriorityBadgeComponent {
  @Input() priorite: PrioriteDossier = 'moyenne';
  protected readonly PRIORITE_LABEL = PRIORITE_LABEL;

  protected get classe(): string {
    switch (this.priorite) {
      case 'basse':
        return 'badge badge--neutral';
      case 'moyenne':
        return 'badge badge--info';
      case 'haute':
        return 'badge badge--danger';
      default:
        return 'badge badge--neutral';
    }
  }
}
