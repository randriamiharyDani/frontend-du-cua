import { Component, Input } from '@angular/core';
import { STATUT_LABEL, StatutDossier } from '../../core/models/dossier.model';

@Component({
  selector: 'du-status-badge',
  standalone: true,
  template: `<span class="badge" [class]="classe">{{ STATUT_LABEL[statut] }}</span>`,
})
export class StatusBadgeComponent {
  @Input() statut: StatutDossier = 'signale';
  protected readonly STATUT_LABEL = STATUT_LABEL;

  protected get classe(): string {
    switch (this.statut) {
      case 'signale':
        return 'badge badge--warning';
      case 'en_verification':
        return 'badge badge--info';
      case 'mise_en_demeure':
        return 'badge badge--danger';
      case 'en_regularisation':
        return 'badge badge--info';
      case 'regularise':
        return 'badge badge--success';
      case 'cloture':
        return 'badge badge--neutral';
      default:
        return 'badge badge--neutral';
    }
  }
}
