import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { SERVICES, ServiceDossier } from '../../core/models/dossier.model';
import {
  FiltresTransferts,
  MouvementDto,
  MouvementState,
} from '../../core/models/dossier-api.model';
import { DossierApiService } from '../../core/services/dossier-api.service';
import { IconComponent } from '../../shared/ui/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

/** États de transfert (alignés sur l'enum backend MouvementState). */
const ETATS: readonly MouvementState[] = ['envoye', 'recu', 'retourne'];

const ETAT_LABEL: Record<MouvementState, string> = {
  envoye: 'Envoyé',
  recu: 'Reçu',
  retourne: 'Retourné',
};

const ETAT_BADGE: Record<MouvementState, string> = {
  envoye: 'badge badge--warning',
  recu: 'badge badge--success',
  retourne: 'badge badge--danger',
};

/**
 * Page « Mouvements » : liste globale des transferts réels (`GET /api/transferts`).
 * Lecture seule + réception / retour du transfert en attente via les endpoints
 * métier existants (`POST .../reception`, `POST .../retour`).
 * Aucune donnée simulée : tout transite par le backend (portée par service).
 */
@Component({
  selector: 'du-page-mouvements',
  imports: [RouterLink, DatePipe, IconComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mouvements.component.html',
  styleUrl: './mouvements.component.scss',
})
export class MouvementsComponent {
  private readonly api = inject(DossierApiService);

  protected readonly services = SERVICES;
  protected readonly etats = ETATS;
  protected readonly etatLabel = ETAT_LABEL;
  protected readonly etatBadge = ETAT_BADGE;

  // --- Filtres (serveur) ---
  protected readonly recherche = signal('');
  protected readonly service = signal<ServiceDossier | ''>('');
  protected readonly etat = signal<MouvementState | ''>('');
  protected readonly du = signal('');
  protected readonly au = signal('');
  protected readonly taillePage = 8;

  // --- État liste ---
  protected readonly mouvements = signal<MouvementDto[]>([]);
  protected readonly chargement = signal(false);
  protected readonly erreur = signal('');
  protected readonly page = signal(1);
  protected readonly dernierPage = signal(1);
  protected readonly total = signal(0);

  // --- Actions réception / retour ---
  protected readonly actionEnCours = signal<number | null>(null);
  protected readonly messageSucces = signal('');
  protected readonly messageErreur = signal('');

  protected readonly filtresActifs = computed(
    () => !!(this.recherche() || this.service() || this.etat() || this.du() || this.au()),
  );

  constructor() {
    this.charger();
  }

  /** Interroge `GET /api/transferts` avec les filtres courants. */
  private charger(): void {
    if (this.chargement()) return;
    this.chargement.set(true);
    this.erreur.set('');

    const filtres: FiltresTransferts = {
      search: this.recherche().trim(),
      service: this.service(),
      state: this.etat(),
      du: this.du(),
      au: this.au(),
      per_page: this.taillePage,
      page: this.page(),
    };

    this.api.listerTransferts(filtres).subscribe({
      next: (reponse) => {
        this.mouvements.set(reponse.data ?? []);
        this.page.set(reponse.meta.current_page);
        this.dernierPage.set(reponse.meta.last_page);
        this.total.set(reponse.meta.total);
        this.chargement.set(false);
      },
      error: (e: unknown) => {
        this.erreur.set(this.lireErreur(e));
        this.chargement.set(false);
      },
    });
  }

  private resetPage(): void {
    this.page.set(1);
  }

  protected setRecherche(v: string): void { this.recherche.set(v); }
  protected setService(v: string): void { this.service.set(v as ServiceDossier | ''); }
  protected setEtat(v: string): void { this.etat.set(v as MouvementState | ''); }
  protected setDu(v: string): void { this.du.set(v); }
  protected setAu(v: string): void { this.au.set(v); }

  protected allerA(p: number): void {
    const cible = Math.min(Math.max(1, p), this.dernierPage());
    this.page.set(cible);
    this.charger();
  }

  /** Relance la recherche depuis la première page. */
  protected rechercher(): void {
    this.resetPage();
    this.charger();
  }

  protected reinitialiser(): void {
    this.recherche.set('');
    this.service.set('');
    this.etat.set('');
    this.du.set('');
    this.au.set('');
    this.page.set(1);
    this.charger();
  }

  /** Réceptionne le transfert en attente (`state === 'envoye'`). */
  protected receptionner(m: MouvementDto): void {
    if (!this.confirmer(`Confirmer la réception du dossier « ${this.refDossier(m)} » ?`)) return;
    this.executerAction(m, () =>
      this.api.receptionnerTransfert(m.dossier_id, m.id, {}),
    );
  }

  /** Retourne le transfert en attente à l'expéditeur (motif obligatoire). */
  protected retourner(m: MouvementDto): void {
    const motif = typeof window === 'undefined' ? '' : window.prompt('Motif du retour à l’expéditeur (obligatoire) :', '') ?? '';
    if (!motif.trim()) return;
    if (!this.confirmer(`Retourner le dossier « ${this.refDossier(m)} » à l’expéditeur ?`)) return;
    this.executerAction(m, () =>
      this.api.retournerTransfert(m.dossier_id, m.id, { motif: motif.trim() }),
    );
  }

  private executerAction(m: MouvementDto, op: () => Observable<unknown>): void {
    this.actionEnCours.set(m.id);
    this.messageSucces.set('');
    this.messageErreur.set('');
    op().subscribe({
      next: () => {
        this.messageSucces.set('Opération enregistrée.');
        this.actionEnCours.set(null);
        this.charger();
      },
      error: (e: unknown) => {
        this.messageErreur.set(this.lireErreur(e));
        this.actionEnCours.set(null);
      },
    });
  }

  protected refDossier(m: MouvementDto): string {
    return m.dossier_reference || `Dossier n°${m.dossier_id}`;
  }

  protected expediteur(m: MouvementDto): string {
    return m.expediteur?.name ?? '—';
  }

  protected destinataire(m: MouvementDto): string {
    return m.destinataire?.name ?? '—';
  }

  private confirmer(message: string): boolean {
    if (typeof window === 'undefined') return true;
    return window.confirm(message);
  }

  private lireErreur(e: unknown): string {
    const err = e as { error?: { message?: string }; status?: number; message?: string };
    if (err?.error && typeof err.error.message === 'string' && err.error.message.trim()) {
      return err.error.message;
    }
    if (err?.status === 0) return 'Serveur injoignable. Vérifiez que l’API Laravel est démarrée.';
    if (err?.status === 401) return 'Session expirée. Reconnectez-vous.';
    if (err?.status === 403) return 'Accès refusé : hors de votre périmètre de service.';
    if (err?.status === 404) return 'Ressource introuvable.';
    if (typeof err?.status === 'number' && err.status >= 500) return 'Erreur serveur. Réessayez plus tard.';
    return err?.message || 'Une erreur inattendue est survenue.';
  }
}
