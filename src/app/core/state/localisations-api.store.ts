import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, map, tap } from 'rxjs';
import { donneesLocalisationPourApi, localisationDepuisApi, LocalisationLigne } from '../mappers/localisation.mapper';
import { FiltresLocalisations, LocalisationDto } from '../models/localisation-api.model';
import { LocalisationApiService } from '../services/localisation-api.service';
import { PaginationListe, messageErreur } from './dossier-api.store';

/**
 * Liste paginée avec recherche / filtres et CRUD des localisations.
 * Le nombre de dossiers associés est fourni par l'API. Aucune donnée simulée.
 */
@Injectable({ providedIn: 'root' })
export class LocalisationsApiStore {
  private readonly api = inject(LocalisationApiService);

  private readonly _localisations = signal<LocalisationLigne[]>([]);
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

  readonly localisations = this._localisations.asReadonly();
  readonly chargement = this._chargement.asReadonly();
  readonly erreur = this._erreur.asReadonly();
  readonly pagination = this._pagination.asReadonly();
  readonly enCours = this._enCours.asReadonly();
  readonly message = this._message.asReadonly();
  readonly erreurAction = this._erreurAction.asReadonly();

  /** Derniers filtres appliqués (pour recharger après une mutation). */
  private derniersFiltres: FiltresLocalisations = {};

  /** Charge la liste paginée correspondant aux filtres fournis. */
  chargerListe(filtres: FiltresLocalisations): void {
    this.derniersFiltres = filtres;
    this._chargement.set(true);
    this._erreur.set('');

    this.api.lister(filtres).subscribe({
      next: (reponse) => {
        this._localisations.set(reponse.data.map(localisationDepuisApi));
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
        this._localisations.set([]);
        this._chargement.set(false);
      },
    });
  }

  /** Crée une localisation puis recharge la liste. */
  creer(valeur: Parameters<typeof donneesLocalisationPourApi>[0]): Observable<LocalisationDto> {
    this._enCours.set(true);
    this._message.set('');
    this._erreurAction.set('');

    return this.api.creer(donneesLocalisationPourApi(valeur)).pipe(
      map((reponse) => reponse.data),
      tap(() => {
        this._message.set('Localisation ajoutée avec succès.');
        this.recharger();
      }),
      tap({
        error: (erreur: unknown) => this._erreurAction.set(messageErreur(erreur)),
      }),
      finalize(() => this._enCours.set(false)),
    );
  }

  /** Modifie une localisation puis recharge la liste. */
  modifier(
    id: number | string,
    valeur: Parameters<typeof donneesLocalisationPourApi>[0],
  ): Observable<LocalisationDto> {
    this._enCours.set(true);
    this._message.set('');
    this._erreurAction.set('');

    return this.api.modifier(id, donneesLocalisationPourApi(valeur)).pipe(
      map((reponse) => reponse.data),
      tap(() => {
        this._message.set('Localisation modifiée avec succès.');
        this.recharger();
      }),
      tap({
        error: (erreur: unknown) => this._erreurAction.set(messageErreur(erreur)),
      }),
      finalize(() => this._enCours.set(false)),
    );
  }

  /** Supprime logiquement une localisation puis recharge la liste. */
  supprimer(id: number | string): Observable<{ message: string }> {
    this._enCours.set(true);
    this._message.set('');
    this._erreurAction.set('');

    return this.api.supprimer(id).pipe(
      tap((reponse) => {
        this._message.set(reponse.message ?? 'Localisation supprimée.');
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
