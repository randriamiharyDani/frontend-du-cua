import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AdminPlaceholderComponent } from './admin-placeholder.component';

@Component({
  selector: 'du-page-localisations',
  standalone: true,
  imports: [AdminPlaceholderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <du-admin-placeholder
      titre="Localisations"
      sousTitre="Quartiers, arrondissements et adresses suivis"
      [points]="[
        'Référentiel des quartiers et arrondissements.',
        'Regroupement des dossiers par zone.',
        'Corrections d’adresses et de bornage.',
      ]"
    />
  `,
})
export class LocalisationsComponent {}
