import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, map, tap } from 'rxjs';
import { documentDepuisApi, DocumentLigne } from '../mappers/document.mapper';
import { DocumentDto, FiltresDocuments } from '../models/dossier-api.model';
import { DocumentApiService } from '../services/document-api.service';
import { DossierApiService } from '../services/dossier-api.service';
import { PaginationListe, messageErreur } from './dossier-api.store';

/** Option de dossier proposée dans les sélecteurs (filtre et dépôt). */
export interface OptionDossier {
  id: number;
  reference: string;
}

/**
 * État de la page « Documents » alimenté par l'API Laravel : liste globale
 * paginée (recherche, filtres), dépôt rattaché à un dossier et
 * téléchargement authentifié. Aucune donnée simulée.
 */
@Injectable({ providedIn: 'root' })
export class DocumentsApiStore {
  private readonly api = inject(DocumentApiService);
  private readonly dossiersApi = inject(DossierApiService);

  private readonly _documents = signal<DocumentLigne[]>([]);
  private readonly _chargement = signal(false);
  private readonly _erreur = signal('');
  private readonly _pagination = signal<PaginationListe>({
    page: 1,
    parPage: 15,
    total: 0,
    dernierPage: 1,
    de: null,
    a: null,
  });

  private readonly _dossiers = signal<OptionDossier[]>([]);
  private readonly _chargementDossiers = signal(false);

  private readonly _enCours = signal(false);
  private readonly _message = signal('');
  private readonly _erreurAction = signal('');

  readonly documents = this._documents.asReadonly();
  readonly chargement = this._chargement.asReadonly();
  readonly erreur = this._erreur.asReadonly();
  readonly pagination = this._pagination.asReadonly();
  readonly dossiers = this._dossiers.asReadonly();
  readonly chargementDossiers = this._chargementDossiers.asReadonly();
  readonly enCours = this._enCours.asReadonly();
  readonly message = this._message.asReadonly();
  readonly erreurAction = this._erreurAction.asReadonly();

  /** Derniers filtres appliqués (pour recharger après une mutation). */
  private derniersFiltres: FiltresDocuments = {};

  /** Charge la liste paginée globale correspondant aux filtres fournis. */
  chargerListe(filtres: FiltresDocuments): void {
    this.derniersFiltres = filtres;
    this._chargement.set(true);
    this._erreur.set('');

    this.api.lister(filtres).subscribe({
      next: (reponse) => {
        this._documents.set(reponse.data.map(documentDepuisApi));
        this._pagination.set({
          page: reponse.meta.current_page,
          parPage: reponse.meta.per_page,
          total: reponse.meta.total,
          dernierPage: reponse.meta.last_page,
          de: reponse.meta.from,
          a: reponse.meta.to,
        });
        this._chargement.set(false);
      },
      error: (erreur: unknown) => {
        this._erreur.set(messageErreur(erreur));
        this._documents.set([]);
        this._chargement.set(false);
      },
    });
  }

  /** Charge les dossiers accessibles (pour les sélecteurs filtre et dépôt). */
  chargerDossiers(): void {
    this._chargementDossiers.set(true);

    this.dossiersApi.lister({ per_page: 100 }).subscribe({
      next: (reponse) => {
        this._dossiers.set(
          reponse.data.map((d) => ({
            id: d.id,
            reference: d.num_bd ?? d.ref_arrivee ?? `#${d.id}`,
          })),
        );
        this._chargementDossiers.set(false);
      },
      error: () => {
        this._dossiers.set([]);
        this._chargementDossiers.set(false);
      },
    });
  }

  /** Dépose un document sur un dossier puis recharge la liste. */
  deposer(dossierId: number | string, donnees: FormData): Observable<DocumentDto> {
    this._enCours.set(true);
    this._message.set('');
    this._erreurAction.set('');

    return this.api.deposer(dossierId, donnees).pipe(
      map((reponse) => reponse.data),
      tap(() => {
        this._message.set('Document déposé avec succès.');
        this.recharger();
      }),
      tap({
        error: (erreur: unknown) => this._erreurAction.set(messageErreur(erreur)),
      }),
      finalize(() => this._enCours.set(false)),
    );
  }

  /** Télécharge un document via l'endpoint authentifié. */
  telecharger(ligne: DocumentLigne): void {
    this._erreurAction.set('');

    this.api.telecharger(ligne.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const lien = window.document.createElement('a');
        lien.href = url;
        lien.download = ligne.nom;
        lien.click();
        URL.revokeObjectURL(url);
      },
      error: (erreur: unknown) => this._erreurAction.set(messageErreur(erreur)),
    });
  }

  /** Réinitialise les messages d'action. */
  effacerMessages(): void {
    this._message.set('');
    this._erreurAction.set('');
  }

  private recharger(): void {
    this.chargerListe(this.derniersFiltres);
  }
}
