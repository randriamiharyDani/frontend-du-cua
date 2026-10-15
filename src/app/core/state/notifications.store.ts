import { Injectable, computed, inject, signal } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { catchError, of, startWith, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationApiService } from '../services/notification-api.service';
import { NotificationApp } from '../models/notification.model';

/**
 * État des notifications temps réel (cloche du topbar).
 *
 * Stratégie sans WebSocket (compatible XAMPP, zéro dépendance) :
 * polling court toutes les 15 s + compteur instantané, anti-doublons par `id`,
 * reconnexion automatique avec backoff en cas d'erreur réseau.
 */
@Injectable({ providedIn: 'root' })
export class NotificationsStore {
  private readonly api = inject(NotificationApiService);
  private readonly auth = inject(AuthService);
  private abonnement: Subscription | null = null;
  private echecConsecutifs = 0;

  private readonly _liste = signal<NotificationApp[]>([]);
  private readonly _nonLues = signal(0);
  private readonly _erreur = signal(false);
  private readonly _actif = signal(false);

  readonly liste = this._liste.asReadonly();
  readonly nonLues = this._nonLues.asReadonly();
  readonly erreur = this._erreur.asReadonly();
  readonly dernierId = computed(() => Math.max(0, ...this._liste().map((n) => n.id)));

  /** Démarre le polling (topbar). Idempotent. */
  demarrer(): void {
    if (typeof window === 'undefined' || this._actif()) return;
    this._actif.set(true);
    this.chargerInitial();
    this.abonnement = interval(15000)
      .pipe(startWith(-1), switchMap(() => this.interroger()))
      .subscribe();
  }

  /** Arrête le polling (déconnexion). */
  arreter(): void {
    this.abonnement?.unsubscribe();
    this.abonnement = null;
    this._actif.set(false);
    this._liste.set([]);
    this._nonLues.set(0);
    this.echecConsecutifs = 0;
  }

  /** Recharge complète (ouverture cloche / reconnexion). */
  rafraichir(): void {
    this.chargerInitial();
  }

  /** Marque une notification comme lue (optimiste, rollback si 4xx/5xx). */
  marquerLue(id: number): void {
    const avant = this._liste();
    this._liste.set(avant.map((n) => (n.id === id ? { ...n, lue_at: new Date().toISOString() } : n)));
    this._nonLues.set(Math.max(0, this._nonLues() - 1));
    this.api.marquerLue(id).subscribe({
      error: () => {
        this._liste.set(avant);
        this.chargerInitial();
      },
    });
  }

  /** Marque tout comme lu (optimiste). */
  toutMarquerLues(): void {
    const avant = this._liste();
    this._liste.set(avant.map((n) => ({ ...n, lue_at: n.lue_at ?? new Date().toISOString() })));
    this._nonLues.set(0);
    this.api.toutMarquerLues().subscribe({ error: () => this.chargerInitial() });
  }

  private chargerInitial(): void {
    if (!this.auth.estConnecte()) return;
    this.api.liste().subscribe({
      next: (r) => {
        this._liste.set(r.data);
        this._nonLues.set(r.non_lues);
        this._erreur.set(false);
        this.echecConsecutifs = 0;
      },
      error: () => this._erreur.set(true),
    });
  }

  private interroger() {
    if (!this.auth.estConnecte()) return of(null);
    // Backoff : après 3 échecs, on saute des cycles (30 s effectifs).
    if (this.echecConsecutifs >= 3 && this.echecConsecutifs % 2 === 1) {
      this.echecConsecutifs++;
      return of(null);
    }
    return this.api.nonLues(this.dernierId()).pipe(
      catchError(() => {
        this.echecConsecutifs++;
        this._erreur.set(true);
        return of(null);
      }),
      switchMap((r) => {
        if (r) {
          this._erreur.set(false);
          this.echecConsecutifs = 0;
          this._nonLues.set(r.non_lues);
          if (r.data.length) this.fusionner(r.data);
        }
        return of(null);
      }),
    );
  }

  /** Fusionne sans doublon (par `id`), tri décroissant, max 20. */
  private fusionner(nouvelles: NotificationApp[]): void {
    const connus = new Set(this._liste().map((n) => n.id));
    const ajouts = nouvelles.filter((n) => !connus.has(n.id));
    if (!ajouts.length) return;
    this._liste.set([...ajouts, ...this._liste()].sort((a, b) => b.id - a.id).slice(0, 20));
  }
}
