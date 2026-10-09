import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import {
  ETAPE_LABEL,
  NATURE_LABEL,
  nomContrevenant,
  SERVICE_LABEL,
  SERVICES,
  ServiceDossier,
  STATUT_LABEL,
  STATUTS,
  StatutDossier,
  TYPE_DOCUMENT_LABEL,
  TYPE_LABEL,
} from '../../core/models/dossier.model';
import { DossierStore } from '../../core/state/dossier-store';
import { IconComponent } from '../../shared/ui/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PriorityBadgeComponent } from '../../shared/ui/priority-badge.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

/** État d’un service dans le circuit visuel DU → DIS → SCAD. */
type EtatService = 'traverse' | 'actuel' | 'a_venir';

@Component({
  selector: 'du-dossier-detail',
  imports: [RouterLink, DatePipe, IconComponent, PageHeaderComponent, StatusBadgeComponent, PriorityBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dossier-detail.component.html',
  styles: `
    .detail-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
      gap: 1rem;
      align-items: start;
    }
    .stack { display: grid; gap: 1rem; align-content: start; }

    /* En-tête métadonnées */
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem 1.75rem;
      padding: 1rem 1.25rem;
    }
    .meta__item { display: flex; flex-direction: column; gap: 0.15rem; }
    .meta__label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--du-muted);
    }
    .meta__value { display: flex; align-items: center; gap: 0.4rem; font-weight: 600; }

    /* Liste de définitions */
    .dl {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem 1.5rem;
      margin: 0;
    }
    .dl > .full { grid-column: 1 / -1; }
    .absent { color: var(--du-muted); font-style: italic; font-weight: 400; }

    /* Parcours des services */
    .parcours { display: flex; align-items: stretch; gap: 0.25rem; flex-wrap: wrap; }
    .parcours__node {
      flex: 1 1 0;
      min-width: 5.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.15rem;
      padding: 0.6rem 0.5rem;
      border: 1px solid var(--du-border);
      border-radius: var(--du-radius);
      background: #fff;
      text-align: center;
    }
    .parcours__code { font-weight: 700; color: var(--du-muted); }
    .parcours__label { font-size: 0.72rem; color: var(--du-muted); line-height: 1.2; }
    .parcours__node.is-traverse { border-color: var(--du-primary); background: var(--du-primary-soft); }
    .parcours__node.is-traverse .parcours__code,
    .parcours__node.is-traverse .parcours__label { color: var(--du-primary-dark); }
    .parcours__node.is-actuel { border-color: var(--du-primary); background: var(--du-primary); }
    .parcours__node.is-actuel .parcours__code,
    .parcours__node.is-actuel .parcours__label { color: #fff; }
    .parcours__link { display: flex; align-items: center; color: var(--du-border); font-weight: 700; }

    .parcours__chemin {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-top: 1rem;
    }
    .parcours__arrow { color: var(--du-muted); }
    .chip {
      display: inline-block;
      padding: 0.15rem 0.6rem;
      border-radius: 999px;
      background: var(--du-primary-soft);
      color: var(--du-primary-dark);
      font-size: 0.78rem;
      font-weight: 700;
    }

    /* Chronologie verticale */
    .timeline { list-style: none; margin: 0; padding: 0; }
    .timeline__item { position: relative; padding: 0 0 1.25rem 1.75rem; }
    .timeline__item::before {
      content: '';
      position: absolute;
      left: 6px;
      top: 0.35rem;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--du-primary);
      box-shadow: 0 0 0 3px var(--du-primary-soft);
    }
    .timeline__item::after {
      content: '';
      position: absolute;
      left: 10px;
      top: 0.85rem;
      bottom: 0;
      width: 2px;
      background: var(--du-border);
    }
    .timeline__item:last-child { padding-bottom: 0; }
    .timeline__item:last-child::after { display: none; }
    .timeline__head { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
    .timeline__date { font-weight: 600; }
    .timeline__action { margin: 0.3rem 0 0; font-weight: 600; color: var(--du-primary-dark); }
    .timeline__obs { margin: 0.15rem 0 0; }
    .timeline__agent { margin-top: 0.25rem; }
    .flux { color: var(--du-muted); font-weight: 700; }

    /* Documents */
    .docs { list-style: none; margin: 0; padding: 0; }
    .docs__item { padding: 0.75rem 0; border-bottom: 1px solid var(--du-border); }
    .docs__item:last-child { border-bottom: 0; padding-bottom: 0; }
    .docs__row { display: flex; align-items: center; gap: 0.75rem; }
    .docs__icon {
      display: grid;
      place-items: center;
      width: 2.25rem;
      height: 2.25rem;
      border-radius: var(--du-radius);
      background: var(--du-primary-soft);
      color: var(--du-primary);
      flex: 0 0 auto;
    }
    .docs__info { flex: 1; min-width: 0; }
    .docs__nom { font-weight: 600; overflow-wrap: anywhere; }
    .docs__detail {
      margin-top: 0.6rem;
      padding: 0.6rem 0.75rem;
      border-radius: var(--du-radius);
      background: #f7f9fc;
      font-size: 0.85rem;
    }

    @media (max-width: 900px) {
      .detail-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 600px) {
      .dl { grid-template-columns: 1fr; }
      .parcours__link { display: none; }
      .parcours__node { min-width: 0; }
    }
  `,
})
export class DossierDetailComponent {
  private readonly store = inject(DossierStore);
  private readonly id = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('id') ?? '')),
    { initialValue: '' },
  );

  protected readonly dossier = computed(() => this.store.getById(this.id()));
  protected readonly mouvements = computed(() => this.store.mouvementsDuDossier(this.id()));
  protected readonly documents = computed(() => this.store.documentsDuDossier(this.id()));

  protected readonly statuts = STATUTS;
  protected readonly statutLabel = STATUT_LABEL;
  protected readonly typeLabel = TYPE_LABEL;
  protected readonly natureLabel = NATURE_LABEL;
  protected readonly etapeLabel = ETAPE_LABEL;
  protected readonly serviceLabel = SERVICE_LABEL;
  protected readonly typeDocumentLabel = TYPE_DOCUMENT_LABEL;
  protected readonly nomContrevenant = nomContrevenant;

  /** Document dont le panneau de détails est déplié (interaction locale). */
  protected readonly documentOuvert = signal<string | null>(null);

  /** Chronologie des mouvements enrichie pour l’affichage. */
  protected readonly timeline = computed(() => {
    const liste = this.mouvements();
    return liste.map((m, i) => ({
      ...m,
      action:
        m.action ||
        (m.de === m.vers ? `Traitement au service ${m.de}` : `Transfert de ${m.de} vers ${m.vers}`),
      dernier: i === liste.length - 1,
    }));
  });

  /** Chemin chronologique des services traversés par le dossier. */
  protected readonly parcours = computed<ServiceDossier[]>(() => {
    const d = this.dossier();
    const chemin: ServiceDossier[] = [];
    for (const m of this.mouvements()) {
      if (chemin.length === 0) chemin.push(m.de);
      if (chemin[chemin.length - 1] !== m.vers) chemin.push(m.vers);
    }
    if (d && (chemin.length === 0 || chemin[chemin.length - 1] !== d.service)) {
      chemin.push(d.service);
    }
    return chemin;
  });

  /** État de chaque service (traversé, actuel, à venir) pour le circuit visuel. */
  protected readonly etatsServices = computed(() => {
    const d = this.dossier();
    const parcourus = new Set<ServiceDossier>(this.parcours());
    return SERVICES.map((code) => ({
      code,
      label: SERVICE_LABEL[code],
      etat: (code === d?.service ? 'actuel' : parcourus.has(code) ? 'traverse' : 'a_venir') as EtatService,
    }));
  });

  protected changerStatut(valeur: string): void {
    const d = this.dossier();
    if (d) this.store.changeStatut(d.id, valeur as StatutDossier);
  }

  protected basculerDocument(id: string): void {
    this.documentOuvert.update((courant) => (courant === id ? null : id));
  }
}
