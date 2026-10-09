import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { STATUT_LABEL, STATUTS, StatutDossier } from '../../core/models/dossier.model';
import { DossierStore } from '../../core/state/dossier-store';
import { IconComponent } from '../../shared/ui/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PriorityBadgeComponent } from '../../shared/ui/priority-badge.component';
import { StatCardComponent } from '../../shared/ui/stat-card.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'du-dashboard',
  imports: [RouterLink, DatePipe, IconComponent, PageHeaderComponent, StatCardComponent, StatusBadgeComponent, PriorityBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styles: `
    .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; margin-bottom: 1.25rem; }
    .columns { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; align-items: start; }
    .bars { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.9rem; }
    .bar-row { display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 0.25rem; }
    .bar { height: 8px; background: #e8edf4; border-radius: 999px; overflow: hidden; }
    .bar span { display: block; height: 100%; background: var(--du-primary); border-radius: 999px; }
    .urgent { list-style: none; margin: 0; padding: 0; }
    .urgent li { padding: 0.75rem 0; border-bottom: 1px solid var(--du-border); }
    .urgent li:last-child { border-bottom: 0; padding-bottom: 0; }
    .urgent a { font-weight: 600; text-decoration: none; }
    .urgent a:hover { text-decoration: underline; }
    @media (max-width: 1100px) { .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } .columns { grid-template-columns: 1fr; } }
    @media (max-width: 500px) { .stats { grid-template-columns: 1fr; } }`,
})
export class DashboardComponent {
  private readonly store = inject(DossierStore);
  private readonly dossiers = this.store.dossiers;

  private readonly count = (statut: StatutDossier) => this.dossiers().filter((d) => d.statut === statut).length;

  protected readonly total = computed(() => this.dossiers().length);
  protected readonly enVerification = computed(() => this.count('en_verification') + this.count('signale'));
  protected readonly misesEnDemeure = computed(() => this.count('mise_en_demeure'));
  protected readonly regularises = computed(() => this.count('regularise'));

  protected readonly repartition = computed(() =>
    STATUTS.map((statut) => {
      const nb = this.count(statut);
      return { statut, label: STATUT_LABEL[statut], nb, pct: this.total() ? Math.round((nb / this.total()) * 100) : 0 };
    }),
  );

  protected readonly recents = computed(() =>
    [...this.dossiers()].sort((a, b) => b.dateSignalement.localeCompare(a.dateSignalement)).slice(0, 5),
  );

  protected readonly urgents = computed(() =>
    this.dossiers()
      .filter((d) => d.priorite === 'haute' && d.statut !== 'regularise' && d.statut !== 'cloture')
      .slice(0, 4),
  );
}