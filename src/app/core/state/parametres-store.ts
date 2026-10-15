import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, map, tap } from 'rxjs';
import { ServiceDossier } from '../models/dossier.model';
import {
  ApplicationParametres,
  Parametres,
  PreferencesParametres,
  ProfilParametres,
  parametresParDefaut,
} from '../models/parametres.model';
import { ParametresApiService } from '../services/parametres-api.service';
import { messageErreur } from './dossier-api.store';

/**
 * État de la page « Paramètres » alimenté par l'API Laravel : profil de
 * l'utilisateur connecté, préférences d'affichage personnelles, informations
 * globales de l'application et état des services. Aucune donnée simulée ni
 * stockage navigateur.
 */
@Injectable({ providedIn: 'root' })
export class ParametresStore {
  private readonly api = inject(ParametresApiService);

  private readonly _parametres = signal<Parametres>(parametresParDefaut());
  private readonly _chargement = signal(true);
  private readonly _erreur = signal('');
  private readonly _enCours = signal(false);
  private readonly _message = signal('');
  private readonly _erreurAction = signal('');

  readonly parametres = this._parametres.asReadonly();
  readonly chargement = this._chargement.asReadonly();
  readonly erreur = this._erreur.asReadonly();
  readonly enCours = this._enCours.asReadonly();
  readonly message = this._message.asReadonly();
  readonly erreurAction = this._erreurAction.asReadonly();

  /** Charge l'état complet des paramètres depuis l'API. */
  charger(): void {
    this._chargement.set(true);
    this._erreur.set('');

    this.api.charger().subscribe({
      next: (reponse) => {
        this._parametres.set(reponse.parametres);
        this._chargement.set(false);
      },
      error: (erreur: unknown) => {
        this._erreur.set(messageErreur(erreur));
        this._chargement.set(false);
      },
    });
  }

  /** Enregistre le profil puis met à jour l'état local. */
  enregistrerProfil(profil: ProfilParametres): Observable<Parametres> {
    return this.muter(() => this.api.enregistrerProfil(profil));
  }

  /** Enregistre les préférences d'affichage puis met à jour l'état local. */
  enregistrerPreferences(preferences: PreferencesParametres): Observable<Parametres> {
    return this.muter(() => this.api.enregistrerPreferences(preferences));
  }

  /** Enregistre les informations de l'application puis met à jour l'état local. */
  enregistrerApplication(application: ApplicationParametres): Observable<Parametres> {
    return this.muter(() => this.api.enregistrerApplication(application));
  }

  /** Active / désactive un service (réservé aux rôles privilégiés). */
  basculerService(code: ServiceDossier): Observable<Parametres> {
    const actuel = this._parametres().services.find((s) => s.code === code)?.actif ?? false;
    return this.muter(() => this.api.basculerService(code, !actuel));
  }

  /** Réinitialise les messages d'action. */
  effacerMessages(): void {
    this._message.set('');
    this._erreurAction.set('');
  }

  /**
   * Enveloppe commune des écritures : verrouille l'action, applique l'opération,
   * met à jour l'état depuis la réponse et gère les erreurs.
   */
  private muter(
    operation: () => Observable<{ message: string; parametres: Parametres }>,
  ): Observable<Parametres> {
    this._enCours.set(true);
    this._message.set('');
    this._erreurAction.set('');

    return operation().pipe(
      tap((reponse) => {
        this._parametres.set(reponse.parametres);
        this._message.set(reponse.message);
      }),
      map((reponse) => reponse.parametres),
      tap({
        error: (erreur: unknown) => this._erreurAction.set(messageErreur(erreur)),
      }),
      finalize(() => this._enCours.set(false)),
    );
  }
}
