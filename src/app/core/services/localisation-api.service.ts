import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReponsePaginee, ReponseRessource } from '../models/dossier-api.model';
import {
  FiltresLocalisations,
  LocalisationDto,
  PayloadLocalisation,
} from '../models/localisation-api.model';

/**
 * Accès aux endpoints `/api/localisations` (référentiel des zones).
 * La liste est paginée et filtrable ; les écritures sont réservées aux rôles
 * privilégiés (contrôlé côté serveur par `LocalisationPolicy`).
 */
@Injectable({ providedIn: 'root' })
export class LocalisationApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  /** Liste paginée avec recherche et filtres (`GET /localisations`). */
  lister(filtres: FiltresLocalisations): Observable<ReponsePaginee<LocalisationDto>> {
    let params = new HttpParams();
    const entrees: Record<string, unknown> = { ...filtres };

    for (const [cle, valeur] of Object.entries(entrees)) {
      if (valeur !== undefined && valeur !== null && valeur !== '') {
        params = params.set(cle, String(valeur));
      }
    }

    return this.http.get<ReponsePaginee<LocalisationDto>>(`${this.base}/localisations`, { params });
  }

  /** Création d'une localisation (`POST /localisations`). */
  creer(corps: PayloadLocalisation): Observable<ReponseRessource<LocalisationDto>> {
    return this.http.post<ReponseRessource<LocalisationDto>>(`${this.base}/localisations`, corps);
  }

  /** Modification d'une localisation (`PUT /localisations/{id}`). */
  modifier(
    id: number | string,
    corps: PayloadLocalisation,
  ): Observable<ReponseRessource<LocalisationDto>> {
    return this.http.put<ReponseRessource<LocalisationDto>>(`${this.base}/localisations/${id}`, corps);
  }

  /** Suppression logique d'une localisation (`DELETE /localisations/{id}`). */
  supprimer(id: number | string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/localisations/${id}`);
  }
}
