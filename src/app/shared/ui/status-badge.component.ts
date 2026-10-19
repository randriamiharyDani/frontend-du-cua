import { Component, Input } from '@angular/core';
import { STATUT_LABEL, StatutDossier } from '../../core/models/dossier.model';

@Component({
  selector: 'du-status-badge',
  standalone: true,
  template: `<span class="badge" [class]="classe">{{ STATUT_LABEL[statut] }}</span>`,
})
export class StatusBadgeComponent {
  @Input() statut: StatutDossier = 'en_attente';
  protected readonly STATUT_LABEL = STATUT_LABEL;

  protected get classe(): string {
    switch (this.statut) {
      case 'en_cours':
        return 'badge badge--info';
      case 'en_attente':
        return 'badge badge--warning';
      case 'cloture':
        return 'badge badge--success';
      default:
        return 'badge badge--neutral';
    }
  }
}
