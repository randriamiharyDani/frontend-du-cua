import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AdminPlaceholderComponent } from './admin-placeholder.component';

@Component({
  selector: 'du-page-documents',
  standalone: true,
  imports: [AdminPlaceholderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <du-admin-placeholder
      titre="Documents"
      sousTitre="Pièces jointes et courriers des dossiers"
      [points]="[
        'Liste des documents avec type et date de dépôt.',
        'Lien vers le dossier et le propriétaire.',
        'Téléversement et prévisualisation (à venir).',
      ]"
    />
  `,
})
export class DocumentsComponent {}
