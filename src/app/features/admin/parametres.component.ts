import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AdminPlaceholderComponent } from './admin-placeholder.component';

@Component({
  selector: 'du-page-parametres',
  standalone: true,
  imports: [AdminPlaceholderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <du-admin-placeholder
      titre="Paramètres"
      sousTitre="Configuration de l’espace administrateur"
      [points]="[
        'Types d’infraction, statuts et priorités.',
        'Arrondissements et services responsables.',
        'Préférences d’affichage et notifications.',
      ]"
    />
  `,
})
export class ParametresComponent {}
