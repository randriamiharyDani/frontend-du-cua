import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AdminPlaceholderComponent } from './admin-placeholder.component';

@Component({
  selector: 'du-page-canevas-excel',
  standalone: true,
  imports: [AdminPlaceholderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <du-admin-placeholder
      titre="Canevas Excel"
      sousTitre="Modèles d’import et gabarits d’export"
      [points]="[
        'Téléchargement des canevas vierges.',
        'Import contrôlé des dossiers et mouvements.',
        'Exports périodiques pour le reporting.',
      ]"
    />
  `,
})
export class CanevasExcelComponent {}
