import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FiltresDossiers } from '../models/dossier-api.model';
import { RapportImportCanevas } from '../models/canevas-api.model';

/**
 * Accès aux endpoints `/api/canevas` du backend Laravel :
 * téléchargement du canevas Excel et import d'un canevas rempli.
 */
@Injectable({ providedIn: 'root' })
export class CanevasApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  /**
   * Télécharge le canevas Excel (`.xlsx`) des dossiers accessibles,
   * filtres appliqués côté serveur (`GET /canevas/export`).
   */
  exporter(filtres: FiltresDossiers): Observable<Blob> {
    let params = new HttpParams();
    const entrees: Record<string, unknown> = { ...filtres };

    for (const [cle, valeur] of Object.entries(entrees)) {
      if (valeur !== undefined && valeur !== null && valeur !== '') {
        params = params.set(cle, String(valeur));
      }
    }

    return this.http.get(`${this.base}/canevas/export`, { params, responseType: 'blob' });
  }

  /**
   * Importe un canevas rempli (`.xlsx` ou `.csv`) et renvoie le rapport
   * (`POST /canevas/import`, multipart).
   */
  importer(donnees: FormData): Observable<RapportImportCanevas> {
    return this.http.post<RapportImportCanevas>(`${this.base}/canevas/import`, donnees);
  }
}
