import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, map, tap } from 'rxjs';
import { utilisateurDepuisApi } from '../mappers/utilisateur.mapper';
import { FiltresUtilisateurs, PayloadUtilisateur, UtilisateurDto } from '../models/utilisateur-api.model';
import { Utilisateur } from '../models/utilisateur.model';
import { UtilisateurApiService } from '../services/utilisateur-api.service';
import { PaginationListe, messageErreur } from './dossier-api.store';

/**
 * État de la page « Utilisateurs » alimenté par l'API Laravel : liste paginée
 * (recherche, filtres) et CRUD des comptes. Aucune donnée simulée.
 */
@Injectable({ providedIn: 'root' })
export class UtilisateursApiStore {
  private readonly api = inject(UtilisateurApiService);

  private readonly _utilisateurs = signal<Utilisateur[]>([]);
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

  private readonly _enCours = signal(false);
  private readonly _message = signal('');
  private readonly _erreurAction = signal('');

  readonly utilisateurs = this._utilisateurs.asReadonly();
  readonly chargement = this._chargement.asReadonly();
  readonly erreur = this._erreur.asReadonly();
  readonly pagination = this._pagination.asReadonly();
  readonly enCours = this._enCours.asReadonly();
  readonly message = this._message.asReadonly();
  readonly erreurAction = this._erreurAction.asReadonly();

  /** Derniers filtres appliqués (pour recharger après une mutation). */
  private derniersFiltres: FiltresUtilisateurs = {};

  /** Charge la liste paginée correspondant aux filtres fournis. */
  chargerListe(filtres: FiltresUtilisateurs): void {
    this.derniersFiltres = filtres;
    this._chargement.set(true);
    this._erreur.set('');

    this.api.lister(filtres).subscribe({
      next: (reponse) => {
        this._utilisateurs.set(reponse.data.map(utilisateurDepuisApi));
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
        this._utilisateurs.set([]);
        this._chargement.set(false);
      },
    });
  }

  /** Crée un compte puis recharge la liste. */
  creer(valeur: PayloadUtilisateur): Observable<UtilisateurDto> {
    this._enCours.set(true);
    this._message.set('');
    this._erreurAction.set('');

    return this.api.creer(valeur).pipe(
      map((reponse) => reponse.data),
      tap(() => {
        this._message.set('Utilisateur créé avec succès.');
        this.recharger();
      }),
      tap({
        error: (erreur: unknown) => this._erreurAction.set(messageErreur(erreur)),
      }),
      finalize(() => this._enCours.set(false)),
    );
  }

  /** Modifie un compte puis recharge la liste. */
  modifier(id: number | string, valeur: Partial<PayloadUtilisateur>): Observable<UtilisateurDto> {
    this._enCours.set(true);
    this._message.set('');
    this._erreurAction.set('');

    return this.api.modifier(id, valeur).pipe(
      map((reponse) => reponse.data),
      tap(() => {
        this._message.set('Utilisateur modifié avec succès.');
        this.recharger();
      }),
      tap({
        error: (erreur: unknown) => this._erreurAction.set(messageErreur(erreur)),
      }),
      finalize(() => this._enCours.set(false)),
    );
  }

  /** Supprime un compte puis recharge la liste. */
  supprimer(id: number | string): Observable<{ message: string }> {
    this._enCours.set(true);
    this._message.set('');
    this._erreurAction.set('');

    return this.api.supprimer(id).pipe(
      tap((reponse) => {
        this._message.set(reponse.message ?? 'Utilisateur supprimé.');
        this.recharger();
      }),
      tap({
        error: (erreur: unknown) => this._erreurAction.set(messageErreur(erreur)),
      }),
      finalize(() => this._enCours.set(false)),
    );
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
