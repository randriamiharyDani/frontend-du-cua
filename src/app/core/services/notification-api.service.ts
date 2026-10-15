import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReponseNotifications } from '../models/notification.model';

/**
 * Accès aux notifications temps réel persistées en MySQL.
 * Sanctum (Bearer) appliqué par l'intercepteur existant.
 */
@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  /** 20 dernières + compteur (`GET /notifications`). */
  liste(): Observable<ReponseNotifications> {
    return this.http.get<ReponseNotifications>(`${this.base}/notifications`);
  }

  /** Compteur + nouvelles depuis `depuis_id` (`GET /notifications/non-lues`). */
  nonLues(depuisId = 0): Observable<ReponseNotifications> {
    const params = new HttpParams().set('depuis_id', String(depuisId));
    return this.http.get<ReponseNotifications>(`${this.base}/notifications/non-lues`, { params });
  }

  /** Marque une notification comme lue. */
  marquerLue(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/notifications/${id}/lue`, {});
  }

  /** Marque tout comme lu. */
  toutMarquerLues(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/notifications/tout-lues`, {});
  }
}
