import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DocumentDto,
  DossierDto,
  FiltresDossiers,
  HistoriqueResponse,
  MouvementDto,
  PayloadReception,
  PayloadRetour,
  PayloadTransfert,
  ReponsePaginee,
  ReponseRessource,
  WorkflowState,
} from '../models/dossier-api.model';
import { Statistiques } from '../models/statistiques.model';

/**
 * Accès aux endpoints `/api` du backend Laravel (dossiers, workflow,
 * transferts, historique, documents). Les chemins sont relatifs à
 * `environment.apiUrl` et transitent par le proxy de développement.
 */
@Injectable({ providedIn: 'root' })
export class DossierApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  /**
   * Statistiques agrégées du tableau de bord (`GET /statistiques`).
   * La portée (globale pour admin_systeme, service pour les autres) est
   * appliquée côté serveur.
   */
  statistiques(): Observable<Statistiques> {
    return this.http.get<Statistiques>(`${this.base}/statistiques`);
  }

  /** Liste paginée avec recherche et filtres (`GET /dossiers`). */
  lister(filtres: FiltresDossiers): Observable<ReponsePaginee<DossierDto>> {
    let params = new HttpParams();
    const entrees: Record<string, unknown> = { ...filtres };

    for (const [cle, valeur] of Object.entries(entrees)) {
      if (valeur !== undefined && valeur !== null && valeur !== '') {
        params = params.set(cle, String(valeur));
      }
    }

    return this.http.get<ReponsePaginee<DossierDto>>(`${this.base}/dossiers`, { params });
  }

  /** Détail d'un dossier (`GET /dossiers/{id}`). */
  voir(id: number | string): Observable<ReponseRessource<DossierDto>> {
    return this.http.get<ReponseRessource<DossierDto>>(`${this.base}/dossiers/${id}`);
  }

  /** Création (`POST /dossiers`). */
  creer(corps: Record<string, unknown>): Observable<ReponseRessource<DossierDto>> {
    return this.http.post<ReponseRessource<DossierDto>>(`${this.base}/dossiers`, corps);
  }

  /** Modification (`PUT /dossiers/{id}`). */
  modifier(id: number | string, corps: Record<string, unknown>): Observable<ReponseRessource<DossierDto>> {
    return this.http.put<ReponseRessource<DossierDto>>(`${this.base}/dossiers/${id}`, corps);
  }

  /** État de workflow + transitions disponibles (`GET /dossiers/{id}/workflow`). */
  workflow(id: number | string): Observable<WorkflowState> {
    return this.http.get<WorkflowState>(`${this.base}/dossiers/${id}/workflow`);
  }

  /** Exécute une transition identifiée par son code (`POST .../workflow/{code}`). */
  executerTransition(
    id: number | string,
    code: string,
    corps: Record<string, unknown> = {},
  ): Observable<ReponseRessource<DossierDto>> {
    return this.http.post<ReponseRessource<DossierDto>>(
      `${this.base}/dossiers/${id}/workflow/${code}`,
      corps,
    );
  }

  /** Historique des transferts (`GET /dossiers/{id}/transferts`). */
  transferts(id: number | string): Observable<ReponseRessource<MouvementDto[]>> {
    return this.http.get<ReponseRessource<MouvementDto[]>>(`${this.base}/dossiers/${id}/transferts`);
  }

  /** Envoi d'un transfert (`POST /dossiers/{id}/transferts`). */
  envoyerTransfert(
    id: number | string,
    corps: PayloadTransfert,
  ): Observable<ReponseRessource<MouvementDto>> {
    return this.http.post<ReponseRessource<MouvementDto>>(`${this.base}/dossiers/${id}/transferts`, corps);
  }

  /** Réception d'un transfert (`POST .../transferts/{mouvement}/reception`). */
  receptionnerTransfert(
    id: number | string,
    mouvementId: number | string,
    corps: PayloadReception = {},
  ): Observable<ReponseRessource<MouvementDto>> {
    return this.http.post<ReponseRessource<MouvementDto>>(
      `${this.base}/dossiers/${id}/transferts/${mouvementId}/reception`,
      corps,
    );
  }

  /** Retour d'un transfert à l'expéditeur (`POST .../transferts/{mouvement}/retour`). */
  retournerTransfert(
    id: number | string,
    mouvementId: number | string,
    corps: PayloadRetour,
  ): Observable<ReponseRessource<MouvementDto>> {
    return this.http.post<ReponseRessource<MouvementDto>>(
      `${this.base}/dossiers/${id}/transferts/${mouvementId}/retour`,
      corps,
    );
  }

  /** Historique complet (`GET /dossiers/{id}/historique`). */
  historique(id: number | string): Observable<HistoriqueResponse> {
    return this.http.get<HistoriqueResponse>(`${this.base}/dossiers/${id}/historique`);
  }

  /** Documents d'un dossier (`GET /dossiers/{id}/documents`). */
  documents(id: number | string): Observable<ReponseRessource<DocumentDto[]>> {
    return this.http.get<ReponseRessource<DocumentDto[]>>(`${this.base}/dossiers/${id}/documents`);
  }

  /** Dépôt d'un document (`POST /dossiers/{id}/documents`, multipart). */
  deposerDocument(id: number | string, donnees: FormData): Observable<ReponseRessource<DocumentDto>> {
    return this.http.post<ReponseRessource<DocumentDto>>(`${this.base}/dossiers/${id}/documents`, donnees);
  }

  /** Téléchargement authentifié d'un document (`GET .../documents/{doc}/download`). */
  telechargerDocument(id: number | string, documentId: number | string): Observable<Blob> {
    return this.http.get(
      `${this.base}/dossiers/${id}/documents/${documentId}/download`,
      { responseType: 'blob' },
    );
  }
}
