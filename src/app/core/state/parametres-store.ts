import { HttpErrorResponse } from '@angular/common/http';
import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, map, tap } from 'rxjs';
import { ServiceDossier } from '../models/dossier.model';
import { ReponseParametresMessage } from '../models/parametres-api.model';
import {
  ApplicationParametres,
  Parametres,
  PreferencesParametres,
  ProfilParametres,
  parametresParDefaut,
} from '../models/parametres.model';
import { ParametresApiService } from '../services/parametres-api.service';
import { messageErreur } from './dossier-api.store';

/** Section de la page « Paramètres » concernée par une écriture. */
export type SectionParametres = 'profil' | 'preferences' | 'application' | 'services';

/**
 * Extrait les erreurs de validation par champ d'une réponse 422 de Laravel.
 *
 * @param  erreur  erreur HTTP interceptée
 * @return message associé à chaque champ invalide
 */
export function erreursParChamp(erreur: unknown): Record<string, string> {
  const champs: Record<string, string> = {};

  if (!(erreur instanceof HttpErrorResponse)) {
    return champs;
  }

  const corps: unknown = erreur.error;
  if (!corps || typeof corps !== 'object') {
    return champs;
  }

  const erreurs = (corps as Record<string, unknown>)['errors'];
  if (!erreurs || typeof erreurs !== 'object') {
    return champs;
  }

  for (const [champ, messages] of Object.entries(erreurs as Record<string, unknown>)) {
    if (Array.isArray(messages) && typeof messages[0] === 'string' && messages[0].trim() !== '') {
      champs[champ] = messages[0];
    }
  }

  return champs;
}

/**
 * État de la page « Paramètres » alimenté par l'API Laravel : profil de
 * l'utilisateur connecté, préférences d'affichage personnelles, informations
 * globales de l'application, état des services et référentiels du domaine.
 * Aucune donnée simulée ni stockage navigateur.
 */
@Injectable({ providedIn: 'root' })
export class ParametresStore {
  private readonly api = inject(ParametresApiService);
  private readonly document = inject(DOCUMENT);

  private readonly _parametres = signal<Parametres>(parametresParDefaut());
  private readonly _chargement = signal(true);
  private readonly _erreur = signal('');
  private readonly _enCours = signal(false);
  private readonly _sectionEnCours = signal<SectionParametres | null>(null);
  private readonly _message = signal('');
  private readonly _erreurAction = signal('');
  private readonly _erreursChamps = signal<Record<string, string>>({});

  readonly parametres = this._parametres.asReadonly();
  readonly chargement = this._chargement.asReadonly();
  readonly erreur = this._erreur.asReadonly();
  readonly enCours = this._enCours.asReadonly();
  readonly sectionEnCours = this._sectionEnCours.asReadonly();
  readonly message = this._message.asReadonly();
  readonly erreurAction = this._erreurAction.asReadonly();
  readonly erreursChamps = this._erreursChamps.asReadonly();

  /** Charge l'état complet des paramètres depuis l'API. */
  charger(): void {
    this._chargement.set(true);
    this._erreur.set('');
    this.api.charger().subscribe({
      next: (reponse) => {
        this._parametres.set(reponse.parametres);
        this.appliquerLangue(reponse.parametres.preferences.langue);
        this._chargement.set(false);
      },
      error: (erreur: unknown) => {
        this._erreur.set(messageErreur(erreur));
        this._chargement.set(false);
      },
    });
  }

  enregistrerProfil(profil: ProfilParametres): Observable<Parametres> {
    return this.muter('profil', () => this.api.enregistrerProfil(profil));
  }

  enregistrerPreferences(preferences: PreferencesParametres): Observable<Parametres> {
    return this.muter('preferences', () => this.api.enregistrerPreferences(preferences));
  }

  enregistrerApplication(application: ApplicationParametres): Observable<Parametres> {
    return this.muter('application', () => this.api.enregistrerApplication(application));
  }

  /** Active / désactive un service (réservé aux rôles privilégiés). */
  basculerService(code: ServiceDossier): Observable<Parametres> {
    const actuel = this._parametres().services.find((s) => s.code === code)?.actif ?? false;
    return this.muter('services', () => this.api.basculerService(code, !actuel));
  }

  /** Réinitialise les messages d'action. */
  effacerMessages(): void {
    this._message.set('');
    this._erreurAction.set('');
    this._erreursChamps.set({});
  }

  /**
   * Enveloppe commune des écritures : verrouille l'action, applique l'opération,
   * met à jour l'état depuis la réponse et gère les erreurs.
   */
  private muter(
    section: SectionParametres,
    operation: () => Observable<ReponseParametresMessage>,
  ): Observable<Parametres> {
    this._enCours.set(true);
    this._sectionEnCours.set(section);
    this._message.set('');
    this._erreurAction.set('');
    this._erreursChamps.set({});

    return operation().pipe(
      tap((reponse) => {
        this._parametres.set(reponse.parametres);
        this._message.set(reponse.message);
        if (section === 'preferences') {
          this.appliquerLangue(reponse.parametres.preferences.langue);
        }
      }),
      map((reponse) => reponse.parametres),
      tap({
        error: (erreur: unknown) => {
          const champs = erreursParChamp(erreur);
          this._erreursChamps.set(champs);
          // Les erreurs de validation sont affichées sous les champs
          // concernés : le bandeau global n'est réservé qu'aux autres
          // erreurs (accès refusé, serveur injoignable…).
          this._erreurAction.set(Object.keys(champs).length > 0 ? '' : messageErreur(erreur));
        },
      }),
      finalize(() => {
        this._enCours.set(false);
        this._sectionEnCours.set(null);
      }),
    );
  }

  /**
   * Applique la langue d'interface choisie par l'utilisateur au document.
   */
  private appliquerLangue(langue: string): void {
    const racine = this.document?.documentElement;
    if (racine && langue) {
      racine.lang = langue;
    }
  }
}
