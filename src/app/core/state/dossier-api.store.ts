import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, forkJoin, map, of, switchMap, tap, throwError } from 'rxjs';
import {
  DocumentDto,
  DossierDto,
  FiltresDossiers,
  HistoriqueEvenementDto,
  MouvementDto,
  PayloadReception,
  PayloadRetour,
  PayloadTransfert,
  WorkflowState,
} from '../models/dossier-api.model';
import { Dossier, DossierFormValue } from '../models/dossier.model';
import { dossierDepuisApi, donneesMetierPourApi } from '../mappers/dossier.mapper';
import { DossierApiService } from '../services/dossier-api.service';

/** En-tête de pagination affiché sous la liste. */
export interface PaginationListe {
  page: number;
  parPage: number;
  total: number;
  dernierPage: number;
  de: number | null;
  a: number | null;
}

/** Extrait un message d'erreur lisible d'une réponse HTTP Laravel. */
export function messageErreur(erreur: unknown): string {
  if (erreur instanceof HttpErrorResponse) {
    const corps: unknown = erreur.error;
    if (corps && typeof corps === 'object') {
      const objet = corps as Record<string, unknown>;
      const erreurs = objet['errors'];
      if (erreurs && typeof erreurs === 'object') {
        const entrees = Object.entries(erreurs as Record<string, string[]>);
        const details = entrees
          .map(([, messages]) => (Array.isArray(messages) ? messages[0] : null))
          .filter((m): m is string => typeof m === 'string' && m.trim() !== '');
        if (details.length > 0) {
          const premier = String(details[0]);
          return details.length > 1
            ? `${premier} (${details.length - 1} autre(s) erreur(s))`
            : premier;
        }
      }
      if (typeof objet['message'] === 'string' && (objet['message'] as string).trim()) {
        return objet['message'] as string;
      }
    }
    if (erreur.status === 0) return 'Serveur injoignable. Vérifiez que l’API Laravel est démarrée.';
    if (erreur.status === 401) return 'Session expirée. Reconnectez-vous.';
    if (erreur.status === 403) return 'Accès refusé : cette page est réservée à l’administrateur système.';
    if (erreur.status === 404) return 'Ressource introuvable.';
    if (erreur.status === 429) return 'Trop de tentatives. Patientez une minute puis réessayez.';
    if (erreur.status >= 500) return 'Erreur serveur. Réessayez plus tard.';
    return `Erreur ${erreur.status}.`;
  }
  return 'Une erreur inattendue est survenue.';
}

/**
 * État des dossiers alimenté par l'API Laravel : liste paginée, détail,
 * workflow, transferts, historique et documents. Aucune donnée simulée.
 */
@Injectable({ providedIn: 'root' })
export class DossierApiStore {
  private readonly api = inject(DossierApiService);

  // --- Liste ---
  private readonly _dossiers = signal<Dossier[]>([]);
  private readonly _chargementListe = signal(false);
  private readonly _erreurListe = signal('');
  /** Derniers filtres appliqués (pour recharger après une mutation). */
  private derniersFiltres: FiltresDossiers = {};
  private readonly _pagination = signal<PaginationListe>({
    page: 1,
    parPage: 15,
    total: 0,
    dernierPage: 1,
    de: null,
    a: null,
  });

  readonly dossiers = this._dossiers.asReadonly();
  readonly chargementListe = this._chargementListe.asReadonly();
  readonly erreurListe = this._erreurListe.asReadonly();
  readonly pagination = this._pagination.asReadonly();

  // --- Détail ---
  private readonly _dossier = signal<Dossier | null>(null);
  private readonly _chargementDetail = signal(false);
  private readonly _erreurDetail = signal('');
  private readonly _workflow = signal<WorkflowState | null>(null);
  private readonly _transferts = signal<MouvementDto[]>([]);
  private readonly _documents = signal<DocumentDto[]>([]);
  private readonly _historique = signal<HistoriqueEvenementDto[]>([]);
  private readonly _enCours = signal(false);
  private readonly _messageAction = signal('');
  private readonly _erreurAction = signal('');

  readonly dossier = this._dossier.asReadonly();
  readonly chargementDetail = this._chargementDetail.asReadonly();
  readonly erreurDetail = this._erreurDetail.asReadonly();
  readonly workflow = this._workflow.asReadonly();
  readonly transferts = this._transferts.asReadonly();
  readonly documents = this._documents.asReadonly();
  readonly historique = this._historique.asReadonly();
  readonly enCours = this._enCours.asReadonly();
  readonly messageAction = this._messageAction.asReadonly();
  readonly erreurAction = this._erreurAction.asReadonly();

  /** Charge la liste paginée correspondant aux filtres fournis. */
  chargerListe(filtres: FiltresDossiers): void {
    this.derniersFiltres = { ...filtres };
    this._chargementListe.set(true);
    this._erreurListe.set('');

    this.api.lister(filtres).subscribe({
      next: (reponse) => {
        this._dossiers.set((reponse.data ?? []).filter((dto) => !!dto).map(dossierDepuisApi));
        this._pagination.set({
          page: reponse.meta.current_page,
          parPage: reponse.meta.per_page,
          total: reponse.meta.total,
          dernierPage: reponse.meta.last_page,
          de: reponse.meta.from,
          a: reponse.meta.to,
        });
        this._chargementListe.set(false);
      },
      error: (erreur: unknown) => {
        this._erreurListe.set(messageErreur(erreur));
        this._dossiers.set([]);
        this._chargementListe.set(false);
      },
    });
  }

  /** Charge le détail complet (dossier, workflow, transferts, historique, documents). */
  chargerDetail(id: number | string): void {
    this._chargementDetail.set(true);
    this._erreurDetail.set('');
    this._messageAction.set('');
    this._erreurAction.set('');

    forkJoin({
      dossier: this.api.voir(id),
      workflow: this.api.workflow(id),
      transferts: this.api.transferts(id),
      historique: this.api.historique(id),
      documents: this.api.documents(id),
    }).subscribe({
      next: (reponse) => {
        this._dossier.set(dossierDepuisApi(reponse.dossier.data));
        this._workflow.set(reponse.workflow);
        this._transferts.set(reponse.transferts.data);
        this._historique.set(reponse.historique.data);
        this._documents.set(reponse.documents.data);
        this._chargementDetail.set(false);
      },
      error: (erreur: unknown) => {
        this._erreurDetail.set(messageErreur(erreur));
        this._dossier.set(null);
        this._chargementDetail.set(false);
      },
    });
  }

  /** Crée un dossier à partir des valeurs du formulaire. */
  creer(valeur: DossierFormValue): Observable<Dossier> {
    const corps = { ...donneesMetierPourApi(valeur), service: valeur.service };
    this._enCours.set(true);
    this._messageAction.set('');
    this._erreurAction.set('');
    return this.api.creer(corps).pipe(
      map((reponse) => dossierDepuisApi(reponse.data)),
      tap((dossier) => {
        this._dossier.set(dossier);
        this._messageAction.set(`Dossier ${dossier.reference || `#${dossier.id}`} créé avec succès.`);
        this.rechargerListe();
      }),
      tap({
        error: (erreur: unknown) => {
          this._erreurAction.set(messageErreur(erreur));
        },
      }),
      finalize(() => this._enCours.set(false)),
    );
  }

  /** Modifie un dossier existant (champs métier uniquement). */
  modifier(id: number | string, valeur: DossierFormValue): Observable<Dossier> {
    this._enCours.set(true);
    this._messageAction.set('');
    this._erreurAction.set('');
    return this.api.modifier(id, donneesMetierPourApi(valeur)).pipe(
      map((reponse) => dossierDepuisApi(reponse.data)),
      tap((dossier) => {
        this._dossier.set(dossier);
        this._messageAction.set('Dossier modifié avec succès.');
        this.rechargerListe();
      }),
      tap({
        error: (erreur: unknown) => {
          this._erreurAction.set(messageErreur(erreur));
        },
      }),
      finalize(() => this._enCours.set(false)),
    );
  }

  /** Supprime logiquement un dossier (soft delete). */
  supprimer(id: number | string): Observable<{ message?: string }> {
    this._enCours.set(true);
    this._messageAction.set('');
    this._erreurAction.set('');
    return this.api.supprimer(id).pipe(
      tap((reponse) => this._messageAction.set(reponse.message ?? 'Dossier supprimé.')),
      finalize(() => this._enCours.set(false)),
    );
  }

  /** Exécute une transition de workflow (décisions et dates comprises) puis rafraîchit le détail. */
  executerTransition(
    id: number | string,
    code: string,
    corps: Record<string, unknown> = {},
  ): Observable<Dossier> {
    return this.muter(id, () => this.api.executerTransition(id, code, corps));
  }

  /** Expédie le dossier vers un autre service. */
  envoyerTransfert(id: number | string, corps: PayloadTransfert): Observable<Dossier> {
    return this.muter(id, () => this.api.envoyerTransfert(id, corps), true);
  }

  /** Enregistre la réception du transfert en attente. */
  receptionnerTransfert(
    id: number | string,
    mouvementId: number | string,
    corps: PayloadReception = {},
  ): Observable<Dossier> {
    return this.muter(id, () => this.api.receptionnerTransfert(id, mouvementId, corps));
  }

  /** Retourne le transfert en attente à l'expéditeur. */
  retournerTransfert(id: number | string, mouvementId: number | string, corps: PayloadRetour): Observable<Dossier> {
    return this.muter(id, () => this.api.retournerTransfert(id, mouvementId, corps));
  }

  /** Dépose un document (multipart) puis rafraîchit le détail. */
  deposerDocument(id: number | string, donnees: FormData): Observable<Dossier> {
    return this.muter(id, () => this.api.deposerDocument(id, donnees));
  }

  /** Télécharge un document via l'endpoint authentifié. */
  telecharger(document: DocumentDto): void {
    if (document.dossier_id === null) return;
    this.api.telechargerDocument(document.dossier_id, document.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const lien = window.document.createElement('a');
        lien.href = url;
        lien.download = document.nom ?? `document-${document.id}`;
        lien.click();
        URL.revokeObjectURL(url);
      },
      error: (erreur: unknown) => this._erreurAction.set(messageErreur(erreur)),
    });
  }

  /** Réinitialise les messages d'action. */
  effacerMessages(): void {
    this._messageAction.set('');
    this._erreurAction.set('');
  }

  /** Recharge la liste avec les derniers filtres (après ajout / modification). */
  private rechargerListe(): void {
    this.chargerListe(this.derniersFiltres);
  }

  /**
   * Enveloppe commune des mutations : verrouille l'action, applique l'opération
   * puis recharge le dossier (toutes les mutations ne renvoient pas le dossier),
   * rafraîchit les données dérivées et gère les erreurs.
   *
   * `rechargementTolerant` : après un envoi de transfert, l'expéditeur peut
   * perdre l'accès en lecture (dossier passé au service destinataire, 403) ;
   * le rechargement est alors ignoré pour préserver le message de succès
   * (l'utilisateur retrouve le dossier via la page Mouvements).
   */
  private muter(
    id: number | string,
    operation: () => Observable<{ message?: string }>,
    rechargementTolerant = false,
  ): Observable<Dossier> {
    this._enCours.set(true);
    this._messageAction.set('');
    this._erreurAction.set('');

    return operation().pipe(
      tap({
        next: (reponse) => this._messageAction.set(reponse.message ?? 'Opération effectuée.'),
        error: (erreur: unknown) => this._erreurAction.set(messageErreur(erreur)),
      }),
      switchMap(() => this.api.voir(id).pipe(
        catchError((erreur: unknown) => {
          if (rechargementTolerant && erreur instanceof HttpErrorResponse && (erreur.status === 403 || erreur.status === 404)) {
            return of(null);
          }
          return throwError(() => erreur);
        }),
      )),
      tap((reponse) => {
        if (reponse !== null) this._dossier.set(dossierDepuisApi(reponse.data));
      }),
      map(() => this._dossier() as Dossier),
      finalize(() => this._enCours.set(false)),
      tap(() => this.rafraichirDerivees(id)),
    );
  }

  /** Recharge les sous-ressources (workflow, transferts, historique, documents). */
  private rafraichirDerivees(id: number | string): void {
    forkJoin({
      workflow: this.api.workflow(id),
      transferts: this.api.transferts(id),
      historique: this.api.historique(id),
      documents: this.api.documents(id),
    }).subscribe({
      next: (reponse) => {
        this._workflow.set(reponse.workflow);
        this._transferts.set(reponse.transferts.data);
        this._historique.set(reponse.historique.data);
        this._documents.set(reponse.documents.data);
      },
      // Après un envoi, l'expéditeur peut perdre l'accès (403) : ne pas écraser
      // le message de succès affiché par `muter`.
      error: () => undefined,
    });
  }
}
