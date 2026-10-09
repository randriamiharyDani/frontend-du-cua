import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AdminPlaceholderComponent } from './admin-placeholder.component';

@Component({
  selector: 'du-page-utilisateurs',
  standalone: true,
  imports: [AdminPlaceholderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <du-admin-placeholder
      titre="Utilisateurs"
      sousTitre="Agents, rôles et habilitations"
      [points]="[
        'Liste des agents avec service et rôle.',
        'Activation et désactivation des comptes.',
        'Affectation des dossiers aux agents.',
      ]"
    />
  `,
})
export class UtilisateursComponent {}
