import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReponsePaginee, ReponseRessource } from '../models/dossier-api.model';
import { FiltresUtilisateurs, PayloadUtilisateur, UtilisateurDto } from '../models/utilisateur-api.model';

/**
 * Accès aux endpoints `/api/users` (gestion des comptes, espace admin).
 * Les chemins sont relatifs à `environment.apiUrl` et transitent par le proxy.
 */
@Injectable({ providedIn: 'root' })
export class UtilisateurApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  /** Liste paginée avec recherche et filtres (`GET /users`). */
  lister(filtres: FiltresUtilisateurs): Observable<ReponsePaginee<UtilisateurDto>> {
    let params = new HttpParams();
    const entrees: Record<string, unknown> = { ...filtres };

    for (const [cle, valeur] of Object.entries(entrees)) {
      if (valeur !== undefined && valeur !== null && valeur !== '') {
        params = params.set(cle, String(valeur));
      }
    }

    return this.http.get<ReponsePaginee<UtilisateurDto>>(`${this.base}/users`, { params });
  }

  /** Création d'un compte (`POST /users`). */
  creer(corps: PayloadUtilisateur): Observable<ReponseRessource<UtilisateurDto>> {
    return this.http.post<ReponseRessource<UtilisateurDto>>(`${this.base}/users`, corps);
  }

  /** Modification d'un compte (`PUT /users/{id}`). */
  modifier(
    id: number | string,
    corps: Partial<PayloadUtilisateur>,
  ): Observable<ReponseRessource<UtilisateurDto>> {
    return this.http.put<ReponseRessource<UtilisateurDto>>(`${this.base}/users/${id}`, corps);
  }

  /** Suppression d'un compte (`DELETE /users/{id}`). */
  supprimer(id: number | string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/users/${id}`);
  }
}
