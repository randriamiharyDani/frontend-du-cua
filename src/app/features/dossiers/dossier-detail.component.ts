import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { formatTaille } from '../../core/mappers/dossier.mapper';
import { DocumentDto, MouvementDto, TransitionOption } from '../../core/models/dossier-api.model';
import {
  ETAPE_LABEL, NATURE_LABEL, nomContrevenant, SERVICE_LABEL, SERVICES, ServiceDossier,
  TYPE_LABEL,
} from '../../core/models/dossier.model';
import { DossierApiStore } from '../../core/state/dossier-api.store';
import { IconComponent } from '../../shared/ui/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

/** État d’un service dans le circuit visuel DU → DIS → SCAD. */
type EtatService = 'traverse' | 'actuel' | 'a_venir';

/** Événement d’historique prêt à l’affichage. */
interface EvenementAffiche {
  id: string;
  date: string;
  source: string;
  titre: string;
  service: ServiceDossier | null;
  auteur: string;
}

@Component({
  selector: 'du-dossier-detail',
  imports: [RouterLink, DatePipe, IconComponent, PageHeaderComponent, StatusBadgeComponent],
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

    /* Actions de workflow / transfert */
    .actions-stack { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 1rem; }
    .actions-ligne { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: flex-end; }
    .transfert-form { display: grid; gap: 0.6rem; margin: 0.75rem 0 1rem; }
    .transfert-item { padding: 0.6rem 0; border-top: 1px solid var(--du-border); }
    .transfert-item__entete { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .transfert-item__actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap; }
    .message {
      margin-top: 0.75rem;
      padding: 0.5rem 0.75rem;
      border-radius: var(--du-radius);
      font-size: 0.85rem;
    }
    .message--succes { background: var(--du-success-soft); color: var(--du-success); }
    .message--erreur { background: var(--du-danger-soft); color: var(--du-danger); }

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
  private readonly store = inject(DossierApiStore);
  private readonly router = inject(Router);
  private readonly id = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('id') ?? '')),
    { initialValue: '' },
  );

  protected readonly dossier = this.store.dossier;
  protected readonly transferts = this.store.transferts;
  protected readonly documents = this.store.documents;
  protected readonly workflow = this.store.workflow;
  protected readonly chargement = this.store.chargementDetail;
  protected readonly erreur = this.store.erreurDetail;
  protected readonly enCours = this.store.enCours;
  protected readonly messageAction = this.store.messageAction;
  protected readonly erreurAction = this.store.erreurAction;

  protected readonly natureLabel = NATURE_LABEL;
  protected readonly etapeLabel = ETAPE_LABEL;
  protected readonly serviceLabel = SERVICE_LABEL;
  protected readonly typeLabel = TYPE_LABEL;
  protected readonly nomContrevenant = nomContrevenant;
  protected readonly formatTaille = formatTaille;
  protected readonly services = SERVICES;

  /** Champ de saisie des actions de transfert. */
  protected readonly serviceDestination = signal<ServiceDossier>('DIS');
  protected readonly motifTransfert = signal('');
  protected readonly noteReception = signal('');
  protected readonly motifRetour = signal('');
  protected readonly fichierSelectionne = signal<File | null>(null);
  protected readonly libelleDocument = signal('');

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.store.chargerDetail(id);
    });
  }

  /** Transitions de workflow disponibles depuis l'état courant. */
  protected readonly transitions = computed<TransitionOption[]>(
    () => this.workflow()?.available_transitions ?? [],
  );

  /** Étape courante du circuit (libellé). */
  protected readonly etapeCourante = computed(() => this.workflow()?.current_step?.label ?? '');

  /** Transfert encore en attente de traitement (au plus un). */
  protected readonly transfertEnAttente = computed<MouvementDto | null>(
    () => this.transferts().find((m) => m.state === 'envoye') ?? null,
  );

  /** Chronologie de l'historique réel (création, workflow, transferts). */
  protected readonly timeline = computed<EvenementAffiche[]>(() =>
    this.store.historique().map((e) => ({
      id: e.id,
      date: e.date ?? '',
      source: e.source,
      titre: e.description ?? e.action ?? 'Événement',
      service: e.service,
      auteur: e.user?.name ?? '',
    })),
  );

  /** Chemin chronologique des services traversés par le dossier. */
  protected readonly parcours = computed<ServiceDossier[]>(() => {
    const chemin: ServiceDossier[] = [];
    const tries = [...this.transferts()].sort((a, b) => a.id - b.id);
    for (const m of tries) {
      if (m.service_depart && (chemin.length === 0 || chemin[chemin.length - 1] !== m.service_depart)) {
        chemin.push(m.service_depart);
      }
      if (m.service_arrivee && chemin[chemin.length - 1] !== m.service_arrivee) {
        chemin.push(m.service_arrivee);
      }
    }
    const d = this.dossier();
    if (d && chemin[chemin.length - 1] !== d.service) chemin.push(d.service);
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

  /** Applique une transition de workflow (avec confirmation). */
  protected avancer(transition: TransitionOption): void {
    if (!this.confirmer(`Appliquer « ${transition.label} » à ce dossier ?`)) return;
    this.store.executerTransition(this.id(), transition.code).subscribe();
  }

  /** Expédie le dossier vers le service choisi. */
  protected transferer(): void {
    if (this.transfertEnAttente()) return;
    const destination = this.serviceDestination();
    const actuel = this.dossier()?.service;
    if (actuel && destination === actuel) return;
    if (!this.confirmer(`Transférer le dossier vers ${destination} ?`)) return;
    this.store
      .envoyerTransfert(this.id(), {
        service_arrivee: this.serviceDestination(),
        motif: this.motifTransfert().trim() || null,
      })
      .subscribe({ next: () => this.motifTransfert.set('') });
  }

  /** Accepte la réception du transfert en attente. */
  protected receptionner(mouvement: MouvementDto): void {
    if (!this.confirmer('Confirmer la réception de ce dossier ?')) return;
    this.store
      .receptionnerTransfert(this.id(), mouvement.id, { note: this.noteReception().trim() || null })
      .subscribe({ next: () => this.noteReception.set('') });
  }

  /** Retourne le transfert en attente à l'expéditeur. */
  protected retourner(mouvement: MouvementDto): void {
    const motif = this.motifRetour().trim();
    if (!motif) return;
    if (!this.confirmer('Retourner ce dossier à l’expéditeur ?')) return;
    this.store
      .retournerTransfert(this.id(), mouvement.id, { motif })
      .subscribe({ next: () => this.motifRetour.set('') });
  }

  /** Mémorise le fichier choisi pour le dépôt. */
  protected choisirFichier(evenement: Event): void {
    const input = evenement.target as HTMLInputElement;
    this.fichierSelectionne.set(input.files?.[0] ?? null);
  }

  /** Dépose le document sélectionné (multipart). */
  protected deposerDocument(): void {
    const fichier = this.fichierSelectionne();
    if (!fichier) return;
    const donnees = new FormData();
    donnees.append('file', fichier);
    const libelle = this.libelleDocument().trim();
    if (libelle) donnees.append('libelle', libelle);
    this.store.deposerDocument(this.id(), donnees).subscribe({
      next: () => {
        this.fichierSelectionne.set(null);
        this.libelleDocument.set('');
      },
    });
  }

  /** Télécharge un document via l'endpoint authentifié. */
  protected telecharger(document: DocumentDto): void {
    this.store.telecharger(document);
  }

  /** Recharge tout le détail (bouton réessayer). */
  protected recharger(): void {
    const id = this.id();
    if (id) this.store.chargerDetail(id);
  }

  /** Supprime logiquement le dossier après confirmation, puis retourne à la liste. */
  protected supprimer(): void {
    const d = this.dossier();
    const id = this.id();
    if (!d || !id) return;
    if (!this.confirmer(`Supprimer le dossier « ${d.reference || d.infos.numero || `#${d.id}`} » ?`)) return;
    this.store.supprimer(id).subscribe({
      next: () => void this.router.navigate(['/admin/dossiers']),
    });
  }

  private confirmer(message: string): boolean {
    if (typeof window === 'undefined') return true;
    return window.confirm(message);
  }
}
