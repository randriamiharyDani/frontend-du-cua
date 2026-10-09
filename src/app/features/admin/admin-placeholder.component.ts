import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

/**
 * Page générique temporaire : affiche un titre, un sous-titre et 3 cartes
 * de démonstration. Le contenu détaillé sera développé plus tard.
 * Données d’affichage uniquement — aucune API.
 */
@Component({
  selector: 'du-admin-placeholder',
  standalone: true,
  imports: [PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <du-page-header [title]="titre" [subtitle]="sousTitre" />
    <section class="card">
      <div class="card__body">
        <p class="muted">Page en préparation — affichage temporaire.</p>
        <ul class="placeholder__liste">
          @for (point of points; track $index) {
            <li>{{ point }}</li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: [
    `
      .placeholder__liste {
        margin: 0.75rem 0 0;
        padding-left: 1.1rem;
        display: grid;
        gap: 0.35rem;
        color: var(--du-text);
        font-size: 0.9rem;
      }
    `,
  ],
})
export class AdminPlaceholderComponent {
  @Input() titre = 'Page';
  @Input() sousTitre = '';
  @Input() points: string[] = [
    'Liste et recherche des éléments.',
    'Fiche de détail et historique.',
    'Création et modification.',
  ];
}
