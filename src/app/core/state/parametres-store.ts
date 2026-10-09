import { Injectable, afterNextRender, signal } from '@angular/core';
import { ServiceDossier } from '../models/dossier.model';
import {
  ApplicationParametres,
  CLE_STOCKAGE_PARAMETRES,
  Parametres,
  PreferencesParametres,
  ProfilParametres,
  parametresParDefaut,
} from '../models/parametres.model';

/**
 * Paramètres de l’espace administrateur.
 * Conservation locale uniquement (stockage navigateur) — aucune synchronisation serveur.
 * Le chargement est différé après le premier rendu pour rester compatible avec le rendu SSR.
 */
@Injectable({ providedIn: 'root' })
export class ParametresStore {
  private readonly _parametres = signal<Parametres>(parametresParDefaut());
  readonly parametres = this._parametres.asReadonly();

  constructor() {
    afterNextRender(() => this._parametres.set(this.charger()));
  }

  /** Lit les paramètres depuis le stockage local (navigateur uniquement). */
  private charger(): Parametres {
    if (typeof window === 'undefined' || !window.localStorage) return parametresParDefaut();
    try {
      const brut = window.localStorage.getItem(CLE_STOCKAGE_PARAMETRES);
      if (!brut) return parametresParDefaut();
      return this.fusionner(JSON.parse(brut) as Partial<Parametres>);
    } catch {
      return parametresParDefaut();
    }
  }

  /** Complète une valeur partielle avec les valeurs par défaut. */
  private fusionner(partiel: Partial<Parametres>): Parametres {
    const defaut = parametresParDefaut();
    const services = defaut.services.map((s) => {
      const trouve = partiel.services?.find((x) => x.code === s.code);
      return trouve ? { ...s, ...trouve } : s;
    });
    return {
      profil: { ...defaut.profil, ...partiel.profil },
      preferences: { ...defaut.preferences, ...partiel.preferences },
      application: { ...defaut.application, ...partiel.application },
      services,
    };
  }

  private persister(valeur: Parametres): void {
    this._parametres.set(valeur);
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(CLE_STOCKAGE_PARAMETRES, JSON.stringify(valeur));
    } catch {
      /* stockage indisponible : on conserve en mémoire uniquement */
    }
  }

  enregistrerProfil(profil: ProfilParametres): void {
    this.persister({ ...this._parametres(), profil });
  }

  enregistrerPreferences(preferences: PreferencesParametres): void {
    this.persister({ ...this._parametres(), preferences });
  }

  enregistrerApplication(application: ApplicationParametres): void {
    this.persister({ ...this._parametres(), application });
  }

  /** Active / désactive un service (démonstration, sans impact sur les permissions). */
  basculerService(code: ServiceDossier): void {
    const services = this._parametres().services.map((s) =>
      s.code === code ? { ...s, actif: !s.actif } : s,
    );
    this.persister({ ...this._parametres(), services });
  }

  /** Rétablit tous les paramètres par défaut. */
  reinitialiser(): void {
    this.persister(parametresParDefaut());
  }
}
