import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
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
import { LoaderComponent } from '../../shared/ui/loader.component';
import { BarChartComponent } from './charts/bar-chart.component';
import { DonutChartComponent } from './charts/donut-chart.component';
import { LineChartComponent } from './charts/line-chart.component';
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

/** Palette cohérente des graphiques (alignée sur le design DU). */
const COULEUR_NATURE: Record<NatureDossier, string> = {
  plainte: '#143a6b',
  signalement: '#c08a2e',
  ratissage: '#16794c',
};

const COULEUR_STATUT: Record<StatutDossier, string> = {
  en_cours: '#1d4ed8',
  en_attente: '#b7791f',
  cloture: '#16794c',
};

const COULEUR_ETAPE: Record<EtapeDossier, string> = {
  constat: '#1d4ed8',
  instruction: '#c08a2e',
  mise_en_demeure: '#c0392b',
  regularisation: '#16794c',
  cloture: '#0d294d',
};

const COULEUR_SERVICE: Record<ServiceDossier, string> = {
  DU: '#143a6b',
  DIS: '#c08a2e',
  SCAD: '#16794c',
};

const COULEUR_MOUVEMENT: Record<string, string> = {
  envoye: '#b7791f',
  recu: '#16794c',
  retourne: '#c0392b',
};

type Granularite = 'mois' | 'trimestre' | 'semestre';
type TypeGraphe = 'courbe' | 'histogramme';

/** Regroupements glissants calculés à partir de la série mensuelle réelle. */
const GRANULARITES: { cle: Granularite; label: string; taille: number }[] = [
  { cle: 'mois', label: 'Mois', taille: 1 },
  { cle: 'trimestre', label: '3 mois', taille: 3 },
  { cle: 'semestre', label: '6 mois', taille: 6 },
];

/** Géométrie du graphique SVG d'évolution. */
const GW = 600;
const GH = 220;
const GPX = 28;
const GPT = 16;
const GPB = 32;

/**
 * Tableau de bord — DONNÉES RÉELLES (API Laravel `GET /api/statistiques`).
 * Affiche : statistiques avancées, cartes indicateurs, répartition par nature/statut/étape/service,
 * évolution mensuelle, transferts et derniers dossiers.
 * Gère les états chargement, erreur et absence de données.
 */
@Component({
  selector: 'du-dashboard',
  imports: [RouterLink, DatePipe, IconComponent, LoaderComponent, PageHeaderComponent, StatCardComponent, StatusBadgeComponent, BarChartComponent, DonutChartComponent, LineChartComponent],
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
  protected readonly clotures = computed(() => this.dossiers()?.clotures ?? 0);
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

  // --- Données graphiques (SVG, 100 % API réelle `GET /api/statistiques`) ---
  /** Dossiers par nature → anneau. */
  protected readonly graphiqueNature = computed(() =>
    this.parNature().map((n) => ({
      label: n.label,
      value: n.total,
      color: COULEUR_NATURE[n.cle as NatureDossier],
    })),
  );
  /** Dossiers par statut → barres verticales. */
  protected readonly graphiqueStatut = computed(() =>
    this.parStatut().map((s) => ({
      label: s.label,
      value: s.total,
      color: COULEUR_STATUT[s.cle as StatutDossier],
      tooltip: `${s.label} : ${s.total} dossier(s)`,
    })),
  );
  /** Dossiers par étape → barres verticales. */
  protected readonly graphiqueEtape = computed(() =>
    this.parEtape().map((e) => ({
      label: e.label,
      value: e.total,
      color: COULEUR_ETAPE[e.cle as EtapeDossier],
      tooltip: `${e.label} : ${e.total} dossier(s)`,
    })),
  );
  /** Dossiers par service → anneau. */
  protected readonly graphiqueService = computed(() =>
    this.parService().map((sv) => ({
      label: `${sv.cle} — ${sv.label}`,
      value: sv.total,
      color: COULEUR_SERVICE[sv.cle as ServiceDossier],
    })),
  );
  /** Évolution mensuelle → courbe. */
  protected readonly graphiqueEvolution = computed(() =>
    this.evolution().map((p) => ({
      label: p.periode,
      court: this.formatPeriode(p.periode),
      value: p.total,
    })),
  );

  // --- Statistiques avancées (100 % données de GET /api/statistiques) ---
  protected readonly granularites = GRANULARITES;
  protected readonly granularite = signal<Granularite>('mois');
  protected readonly typeGraphe = signal<TypeGraphe>('courbe');
  protected readonly survol = signal<number | null>(null);

  /** « Traités » = dossiers pris en charge ou clôturés (en cours + clôturés). */
  protected readonly traites = computed(() => this.enCours() + this.clotures());
  protected readonly total12Mois = computed(() => this.evolution().reduce((a, p) => a + p.total, 0));

  private part(n: number): number {
    const t = this.totalActifs();
    return t ? Math.round((n / t) * 1000) / 10 : 0;
  }

  /** KPI : reçus, traités, en attente, clôturés. */
  protected readonly kpis = computed(() => [
    { cle: 'recus', label: 'Reçus', total: this.totalActifs(), part: 100, couleur: '#143a6b', note: 'Tous les dossiers' },
    { cle: 'traites', label: 'Traités', total: this.traites(), part: this.part(this.traites()), couleur: COULEUR_STATUT.en_cours, note: 'En cours + clôturés' },
    { cle: 'attente', label: 'En attente', total: this.enAttente(), part: this.part(this.enAttente()), couleur: COULEUR_STATUT.en_attente, note: 'Traités, en attente de validation' },
    { cle: 'clotures', label: 'Clôturés', total: this.clotures(), part: this.part(this.clotures()), couleur: COULEUR_STATUT.cloture, note: 'Dossiers terminés' },
  ]);

  /** Indicateurs de performance (jauges). */
  protected readonly indicateurs = computed(() => {
    const t = this.totalActifs();
    return [
      { cle: 'cloture', label: 'Taux de clôture', pct: this.part(this.clotures()), detail: `${this.clotures()} / ${t} dossiers`, couleur: COULEUR_STATUT.cloture },
      { cle: 'prise', label: 'Taux de prise en charge', pct: this.part(this.traites()), detail: `${this.traites()} / ${t} dossiers`, couleur: COULEUR_STATUT.en_cours },
      { cle: 'attente', label: "Taux d'attente", pct: this.part(this.enAttente()), detail: `${this.enAttente()} / ${t} dossiers`, couleur: COULEUR_STATUT.en_attente },
      { cle: 'recents', label: `Créés sur ${this.periodeRecente()} j`, pct: this.part(this.recents()), detail: `${this.recents()} / ${t} dossiers`, couleur: '#143a6b' },
    ];
  });

  protected readonly segmentsStatut = computed(() =>
    this.parStatut().map((s) => ({ ...s, pct: this.part(s.total), couleur: COULEUR_STATUT[s.cle as StatutDossier] })),
  );
  protected readonly servicesPart = computed(() =>
    this.parService().map((sv) => ({ ...sv, pct: this.part(sv.total), couleur: COULEUR_SERVICE[sv.cle as ServiceDossier] })),
  );

  /** Série d'évolution regroupée par blocs complets, en partant du mois le plus récent. */
  protected readonly serie = computed(() => {
    const taille = GRANULARITES.find((g) => g.cle === this.granularite())?.taille ?? 1;
    const ev = this.evolution();
    const blocs: { label: string; total: number }[] = [];
    for (let fin = ev.length; fin - taille >= 0; fin -= taille) {
      const bloc = ev.slice(fin - taille, fin);
      blocs.unshift({
        label:
          taille === 1
            ? this.formatPeriode(bloc[0].periode)
            : `${this.formatPeriode(bloc[0].periode)}–${this.formatPeriode(bloc[taille - 1].periode)}`,
        total: bloc.reduce((a, p) => a + p.total, 0),
      });
    }
    return blocs;
  });

  /** Géométrie SVG (courbe, aire, barres). */
  protected readonly graphe = computed(() => {
    const s = this.serie();
    const n = s.length;
    const max = Math.max(1, ...s.map((p) => p.total));
    const zone = (GW - 2 * GPX) / Math.max(n, 1);
    const base = GH - GPB;
    const pts = s.map((p, i) => ({
      i,
      label: p.label,
      total: p.total,
      x: GPX + (i + 0.5) * zone,
      y: base - (p.total / max) * (base - GPT),
    }));
    const ligne = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const aire = n ? `${ligne} L${pts[n - 1].x.toFixed(1)},${base} L${pts[0].x.toFixed(1)},${base} Z` : '';
    return { pts, ligne, aire, base, zone, largeurBarre: Math.min(34, zone * 0.6), largeur: GW, hauteur: GH, px: GPX };
  });

  protected readonly pointActif = computed(() => {
    const pts = this.graphe().pts;
    return pts[this.survol() ?? pts.length - 1] ?? null;
  });

  /** Variation en % du point actif par rapport au précédent (null si non calculable). */
  protected readonly variationActive = computed(() => {
    const pts = this.graphe().pts;
    const i = this.survol() ?? pts.length - 1;
    return i > 0 ? this.variation(pts[i - 1].total, pts[i].total) : null;
  });

  /** Variation entre les deux dernières périodes de la série. */
  protected readonly variationPeriode = computed(() => {
    const s = this.serie();
    return s.length > 1 ? this.variation(s[s.length - 2].total, s[s.length - 1].total) : null;
  });

  /** Transferts : flux départ → arrivée sur les derniers mouvements renvoyés par l'API. */
  protected readonly fluxTransferts = computed(() => {
    const map = new Map<string, { depart: string; arrivee: string; total: number }>();
    for (const m of this.derniersMouvements()) {
      const depart = m.service_depart || '—';
      const arrivee = m.service_arrivee || '—';
      const cle = `${depart}→${arrivee}`;
      const e = map.get(cle) ?? { depart, arrivee, total: 0 };
      e.total++;
      map.set(cle, e);
    }
    const liste = [...map.values()].sort((a, b) => b.total - a.total);
    const max = Math.max(1, ...liste.map((e) => e.total));
    return liste.map((e) => ({ ...e, pct: Math.round((e.total / max) * 100) }));
  });
  protected readonly etatsTransferts = computed(() => {
    const l = this.derniersMouvements();
    return Object.keys(MOUVEMENT_STATE_LABEL).map((cle) => ({
      cle,
      label: MOUVEMENT_STATE_LABEL[cle],
      total: l.filter((m) => (m.state as string) === cle).length,
      couleur: COULEUR_MOUVEMENT[cle],
    }));
  });

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

  /** Variation en % (null si la période précédente est à 0 : non calculable). */
  private variation(precedent: number, courant: number): { valeur: number } | null {
    return precedent === 0 ? null : { valeur: Math.round(((courant - precedent) / precedent) * 1000) / 10 };
  }

  protected formatPct(n: number): string {
    return `${n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;
  }

  protected formatDelta(n: number): string {
    return `${n > 0 ? '+' : ''}${this.formatPct(n)}`;
  }

  protected fleche(n: number): string {
    return n > 0 ? '▲' : n < 0 ? '▼' : '■';
  }
}
