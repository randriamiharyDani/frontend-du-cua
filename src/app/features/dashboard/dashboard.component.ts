import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ETAPE_LABEL,
  ETAPES,
  EtapeDossier,
  NATURE_LABEL,
  NATURES,
  NatureDossier,
  SERVICE_LABEL,
  SERVICES,
  ServiceDossier,
  STATUT_LABEL,
  STATUTS,
  StatutDossier,
} from '../../core/models/dossier.model';
import { StatistiquesStore } from '../../core/state/statistiques.store';
import { IconComponent } from '../../shared/ui/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatCardComponent } from '../../shared/ui/stat-card.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

/** Libellés des états de transfert (alignés sur l'enum backend MouvementState). */
const MOUVEMENT_STATE_LABEL: Record<string, string> = {
  envoye: 'Envoyé',
  recu: 'Reçu',
  retourne: 'Retourné',
};

/** Classes de badge par état de transfert. */
const MOUVEMENT_STATE_BADGE: Record<string, string> = {
  envoye: 'badge badge--warning',
  recu: 'badge badge--success',
  retourne: 'badge badge--danger',
};

/**
 * Tableau de bord — DONNÉES RÉELLES (API Laravel `GET /api/statistiques`).
 * Affiche : cartes indicateurs, répartition par nature/statut/étape/service,
 * évolution mensuelle, transferts et derniers dossiers.
 * Gère les états chargement, erreur et absence de données.
 */
@Component({
  selector: 'du-dashboard',
  imports: [RouterLink, DatePipe, IconComponent, PageHeaderComponent, StatCardComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly store = inject(StatistiquesStore);

  /** Statistiques brutes (null tant que non chargées). */
  protected readonly stats = this.store.donnees;
  protected readonly chargement = this.store.chargement;
  protected readonly erreur = this.store.erreur;

  protected readonly serviceLabel = SERVICE_LABEL;
  protected readonly natureLabel = NATURE_LABEL;
  protected readonly statutLabel = STATUT_LABEL;
  protected readonly etapeLabel = ETAPE_LABEL;
  protected readonly natures = NATURES;
  protected readonly statuts = STATUTS;
  protected readonly etapes = ETAPES;
  protected readonly mouvementStateLabel = MOUVEMENT_STATE_LABEL;
  protected readonly mouvementStateBadge = MOUVEMENT_STATE_BADGE;

  // --- Agrégats (extraits des données API) ---
  protected readonly dossiers = computed(() => this.stats()?.dossiers ?? null);
  protected readonly transferts = computed(() => this.stats()?.transferts ?? null);
  protected readonly evolution = computed(() => this.stats()?.evolution ?? []);
  protected readonly derniers = computed(() => this.stats()?.derniers_dossiers ?? []);
  protected readonly portee = computed(() => this.stats()?.portee ?? null);

  /** Indicateurs principaux (cartes). */
  protected readonly totalActifs = computed(() => this.dossiers()?.total_actifs ?? 0);
  protected readonly enAttente = computed(() => this.dossiers()?.en_attente ?? 0);
  protected readonly enCours = computed(() => this.dossiers()?.en_cours ?? 0);
  protected readonly termines = computed(() => this.dossiers()?.termines ?? 0);
  protected readonly recents = computed(() => this.dossiers()?.recemment_crees ?? 0);
  protected readonly periodeRecente = computed(() => this.dossiers()?.periode_recente_jours ?? 30);

  /** Répartitions (tableaux de compteurs). */
  protected readonly parNature = computed(() => {
    const d = this.dossiers();
    return this.natures.map((n: NatureDossier) => ({
      cle: n,
      label: this.natureLabel[n],
      total: d?.par_nature?.[n] ?? 0,
    }));
  });
  protected readonly parStatut = computed(() => {
    const d = this.dossiers();
    return this.statuts.map((s: StatutDossier) => ({
      cle: s,
      label: this.statutLabel[s],
      total: d?.par_statut?.[s] ?? 0,
    }));
  });
  protected readonly parEtape = computed(() => {
    const d = this.dossiers();
    return this.etapes.map((e: EtapeDossier) => ({
      cle: e,
      label: this.etapeLabel[e],
      total: d?.par_etape?.[e] ?? 0,
    }));
  });
  protected readonly parService = computed(() => {
    const d = this.dossiers();
    return SERVICES.map((sv: ServiceDossier) => ({
      cle: sv,
      label: this.serviceLabel[sv],
      total: d?.par_service?.[sv] ?? 0,
    }));
  });

  /** Transferts en attente de réception. */
  protected readonly transfertsEnAttente = computed(() => this.transferts()?.en_attente ?? 0);
  /** Derniers mouvements (transferts). */
  protected readonly derniersMouvements = computed(() => this.transferts()?.recents ?? []);

  /** Évolution mensuelle : hauteur de barre en % du maximum. */
  protected readonly evolutionMax = computed(() => {
    const e = this.evolution();
    return Math.max(1, ...e.map((p) => p.total));
  });
  protected readonly evolutionPct = computed(() =>
    this.evolution().map((p) => ({ ...p, pct: Math.round((p.total / this.evolutionMax()) * 100) })),
  );

  /** Aucune donnée chargée pour l'instant. */
  protected readonly aucuneDonnee = computed(
    () => !this.chargement() && !this.erreur() && this.stats() !== null && this.totalActifs() === 0,
  );

  ngOnInit(): void {
    this.store.charger();
  }

  ngOnDestroy(): void {
    this.store.detruire();
  }

  protected reessayer(): void {
    this.store.charger();
  }

  /** Formate une période `YYYY-MM` en `MM/AA`. */
  protected formatPeriode(periode: string): string {
    const [, m] = periode.split('-');
    return m ? `${m}/${periode.slice(2, 4)}` : periode;
  }
}
