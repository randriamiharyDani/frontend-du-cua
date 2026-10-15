import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentDto, FiltresDocuments, ReponsePaginee, ReponseRessource } from '../models/dossier-api.model';

/**
 * Accès aux endpoints documents. La liste est globale (`GET /documents`,
 * paginée et filtrée, portée par service côté serveur) ; le dépôt reste
 * rattaché à un dossier (`POST /dossiers/{id}/documents`) et le
 * téléchargement passe par l'endpoint authentifié global.
 */
@Injectable({ providedIn: 'root' })
export class DocumentApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  /** Liste paginée des documents (`GET /documents`). */
  lister(filtres: FiltresDocuments): Observable<ReponsePaginee<DocumentDto>> {
    let params = new HttpParams();
    const entrees: Record<string, unknown> = { ...filtres };

    for (const [cle, valeur] of Object.entries(entrees)) {
      if (valeur !== undefined && valeur !== null && valeur !== '') {
        params = params.set(cle, String(valeur));
      }
    }

    return this.http.get<ReponsePaginee<DocumentDto>>(`${this.base}/documents`, { params });
  }

  /** Dépôt d'un document sur un dossier (`POST /dossiers/{id}/documents`, multipart). */
  deposer(dossierId: number | string, donnees: FormData): Observable<ReponseRessource<DocumentDto>> {
    return this.http.post<ReponseRessource<DocumentDto>>(
      `${this.base}/dossiers/${dossierId}/documents`,
      donnees,
    );
  }

  /** Téléchargement authentifié d'un document (`GET /documents/{id}/download`). */
  telecharger(documentId: number | string): Observable<Blob> {
    return this.http.get(`${this.base}/documents/${documentId}/download`, { responseType: 'blob' });
  }
}
