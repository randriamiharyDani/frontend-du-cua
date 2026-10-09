import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AdminPlaceholderComponent } from './admin-placeholder.component';

@Component({
  selector: 'du-page-mouvements',
  standalone: true,
  imports: [AdminPlaceholderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <du-admin-placeholder
      titre="Mouvements"
      sousTitre="Entrées, sorties et transferts des dossiers"
      [points]="[
        'Registre des mouvements avec dates et motifs.',
        'Filtre par type : entrée, sortie, transfert.',
        'Traçabilité liée au dossier concerné.',
      ]"
    />
  `,
})
export class MouvementsComponent {}
