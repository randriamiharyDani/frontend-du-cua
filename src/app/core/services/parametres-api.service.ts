import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ServiceDossier } from '../models/dossier.model';
import {
  PayloadApplication,
  PayloadPreferences,
  PayloadProfil,
  ReponseParametres,
  ReponseParametresMessage,
} from '../models/parametres-api.model';

/**
 * Accès aux endpoints `/api/parametres` (profil, préférences, informations de
 * l'application et état des services). Les sections application et services
 * sont contrôlées côté serveur (rôles privilégiés uniquement).
 */
@Injectable({ providedIn: 'root' })
export class ParametresApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  /** Charge l'état complet des paramètres (`GET /parametres`). */
  charger(): Observable<ReponseParametres> {
    return this.http.get<ReponseParametres>(`${this.base}/parametres`);
  }

  /** Enregistre le profil de l'utilisateur connecté (`PUT /parametres/profil`). */
  enregistrerProfil(corps: PayloadProfil): Observable<ReponseParametresMessage> {
    return this.http.put<ReponseParametresMessage>(`${this.base}/parametres/profil`, corps);
  }

  /** Enregistre les préférences d'affichage (`PUT /parametres/preferences`). */
  enregistrerPreferences(corps: PayloadPreferences): Observable<ReponseParametresMessage> {
    return this.http.put<ReponseParametresMessage>(`${this.base}/parametres/preferences`, corps);
  }

  /** Enregistre les informations de l'application (`PUT /parametres/application`). */
  enregistrerApplication(corps: PayloadApplication): Observable<ReponseParametresMessage> {
    return this.http.put<ReponseParametresMessage>(`${this.base}/parametres/application`, corps);
  }

  /** Active ou désactive un service (`PUT /parametres/services`). */
  basculerService(code: ServiceDossier, actif: boolean): Observable<ReponseParametresMessage> {
    return this.http.put<ReponseParametresMessage>(`${this.base}/parametres/services`, { code, actif });
  }
}
