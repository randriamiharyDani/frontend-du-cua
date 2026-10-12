import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoleUtilisateur } from '../models/utilisateur.model';
import { ServiceDossier } from '../models/dossier.model';

/** Utilisateur renvoyé par l'API (`UserResource`). */
export interface UtilisateurConnecte {
  id: number;
  name: string;
  email: string;
  service: ServiceDossier | null;
  role: RoleUtilisateur | null;
  role_label?: string;
  created_at?: string;
}

interface ReponseConnexion {
  message: string;
  token: string;
  token_type: string;
  user: UtilisateurConnecte;
}

/** Clés de stockage navigateur du jeton et de l'utilisateur. */
const CLE_JETON = 'du.token';
const CLE_UTILISATEUR = 'du.user';

/**
 * Authentification Sanctum (token Bearer) de l'espace administrateur.
 *
 * Le jeton est conservé dans `localStorage` si l'utilisateur a coché
 * « Rester connecté », sinon dans `sessionStorage` (session de l'onglet).
 * Les accès au stockage sont désactivés côté serveur (rendu SSR).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _utilisateur = signal<UtilisateurConnecte | null>(null);
  private readonly _jeton = signal<string | null>(null);

  readonly utilisateur = this._utilisateur.asReadonly();
  readonly estConnecte = computed(() => this._utilisateur() !== null && this._jeton() !== null);

  constructor() {
    this.restaurerSession();
  }

  /** Jeton courant (ou null). */
  token(): string | null {
    return this._jeton();
  }

  /** Connexion : `POST /login`, puis mémorisation du jeton. */
  connexion(email: string, motDePasse: string, memoriser: boolean): Observable<ReponseConnexion> {
    return this.http
      .post<ReponseConnexion>(`${environment.apiUrl}/login`, { email, password: motDePasse })
      .pipe(
        tap((reponse) => {
          this.enregistrer(reponse.token, reponse.user, memoriser);
        }),
      );
  }

  /** Rafraîchit l'utilisateur courant depuis `GET /me`. */
  rafraichirProfil(): Observable<{ user: UtilisateurConnecte }> {
    return this.http
      .get<{ user: UtilisateurConnecte }>(`${environment.apiUrl}/me`)
      .pipe(tap((reponse) => this._utilisateur.set(reponse.user)));
  }

  /** Déconnexion : révoque le jeton côté serveur puis purge la session locale. */
  deconnexion(): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${environment.apiUrl}/logout`, {})
      .pipe(tap(() => this.purger()));
  }

  /** Purge la session locale sans appel serveur (401, expiration…). */
  purger(): void {
    this._jeton.set(null);
    this._utilisateur.set(null);
    this.ecrireStockage(CLE_JETON, null);
    this.ecrireStockage(CLE_UTILISATEUR, null);
  }

  private enregistrer(jeton: string, utilisateur: UtilisateurConnecte, memoriser: boolean): void {
    this._jeton.set(jeton);
    this._utilisateur.set(utilisateur);
    this.ecrireStockage(CLE_JETON, jeton, memoriser);
    this.ecrireStockage(CLE_UTILISATEUR, JSON.stringify(utilisateur), memoriser);
  }

  /** Recharge la session depuis le stockage au démarrage (navigateur uniquement). */
  private restaurerSession(): void {
    const jeton = this.lireStockage(CLE_JETON);
    const utilisateur = this.lireStockage(CLE_UTILISATEUR);
    if (!jeton || !utilisateur) {
      this.purger();
      return;
    }
    try {
      this._jeton.set(jeton);
      this._utilisateur.set(JSON.parse(utilisateur) as UtilisateurConnecte);
    } catch {
      this.purger();
    }
  }

  private lireStockage(cle: string): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(cle) ?? window.sessionStorage.getItem(cle);
  }

  private ecrireStockage(cle: string, valeur: string | null, memoriser = true): void {
    if (typeof window === 'undefined') return;
    const cible = memoriser ? window.localStorage : window.sessionStorage;
    const autre = memoriser ? window.sessionStorage : window.localStorage;
    if (valeur === null) {
      window.localStorage.removeItem(cle);
      window.sessionStorage.removeItem(cle);
      return;
    }
    cible.setItem(cle, valeur);
    autre.removeItem(cle);
  }
}
