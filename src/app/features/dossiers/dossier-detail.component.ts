import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ETAPE_LABEL, NATURE_LABEL, STATUT_LABEL, STATUTS, StatutDossier, TYPE_LABEL } from '../../core/models/dossier.model';
import { DossierStore } from '../../core/state/dossier-store';
import { IconComponent } from '../../shared/ui/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PriorityBadgeComponent } from '../../shared/ui/priority-badge.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'du-dossier-detail',
  imports: [RouterLink, DatePipe, IconComponent, PageHeaderComponent, StatusBadgeComponent, PriorityBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dossier-detail.component.html',
  styles: `
    .detail-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; align-items: start; }
    .stack { display: grid; gap: 1rem; }
    .timeline { list-style: none; margin: 0; padding: 0 0 0 1rem; border-left: 2px solid var(--du-border); display: grid; gap: 1rem; }
    .timeline li { position: relative; }
    .timeline li::before { content: ''; position: absolute; left: calc(-1rem - 6px); top: 0.35rem; width: 10px; height: 10px; border-radius: 50%; background: var(--du-primary); }
    .description { margin: 0; white-space: pre-line; }
    @media (max-width: 900px) { .detail-grid { grid-template-columns: 1fr; } }`,
})
export class DossierDetailComponent {
  private readonly store = inject(DossierStore);
  private readonly id = toSignal(inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('id') ?? '')), { initialValue: '' });

  protected readonly dossier = computed(() => this.store.getById(this.id()));
  protected readonly statuts = STATUTS;
  protected readonly statutLabel = STATUT_LABEL;
  protected readonly typeLabel = TYPE_LABEL;
  protected readonly natureLabel = NATURE_LABEL;
  protected readonly etapeLabel = ETAPE_LABEL;

  protected changerStatut(valeur: string): void {
    const d = this.dossier();
    if (d) this.store.changeStatut(d.id, valeur as StatutDossier);
  }
}