import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SERVICES, SERVICE_LABEL, ServiceDossier, StatutDossier } from '../../core/models/dossier.model';
import { DossierStore } from '../../core/state/dossier-store';
import { IconComponent } from '../../shared/ui/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PriorityBadgeComponent } from '../../shared/ui/priority-badge.component';
import { StatCardComponent } from '../../shared/ui/stat-card.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

/**
 * Tableau de bord — DONNEES DE DEMONSTRATION (aucune API).
 * 4 cartes stats + repartition DU/DIS/SCAD + mouvements + recents + attention.
 */
@Component({
  selector: 'du-dashboard',
  imports: [RouterLink, DatePipe, IconComponent, PageHeaderComponent, StatCardComponent, StatusBadgeComponent, PriorityBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly store = inject(DossierStore);
  private readonly dossiers = this.store.dossiers;
  protected readonly mouvements = this.store.mouvements;
  protected readonly serviceLabel = SERVICE_LABEL;

  private readonly count = (statuts: StatutDossier[]) =>
    this.dossiers().filter((d) => statuts.includes(d.statut)).length;

  /** Total des dossiers. */
  protected readonly total = computed(() => this.dossiers().length);
  /** Dossiers en cours : verification, mise en demeure, regularisation. */
  protected readonly enCours = computed(() =>
    this.count(['en_verification', 'mise_en_demeure', 'en_regularisation']),
  );
  /** Dossiers en attente : signales, non pris en charge. */
  protected readonly enAttente = computed(() => this.count(['signale']));
  /** Dossiers termines : regularises + clotures. */
  protected readonly termines = computed(() => this.count(['regularise', 'cloture']));

  /** Repartition des dossiers par service DU / DIS / SCAD. */

  
  protected readonly parService = computed(() =>
    SERVICES.map((service: ServiceDossier) => {
      const liste = this.dossiers().filter((d) => d.service === service);
      return {
        service,
        label: SERVICE_LABEL[service],
        total: liste.length,
        enCours: liste.filter((d) => d.statut === 'en_verification' || d.statut === 'mise_en_demeure' || d.statut === 'en_regularisation').length,
        pct: this.total() ? Math.round((liste.length / this.total()) * 100) : 0,
      };
    }),
  );

  /** Dossiers recemment enregistres (5 derniers). */
  protected readonly recents = computed(() =>
    [...this.dossiers()].sort((a, b) => b.infos.dateEntree.localeCompare(a.infos.dateEntree)).slice(0, 5),
  );

  /** Dossiers necessitant une attention particuliere. */
  protected readonly attention = computed(() =>
    this.dossiers().filter((d) => d.attentionRequise).slice(0, 5),
  );
}
