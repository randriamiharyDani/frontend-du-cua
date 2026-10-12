import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { DossierApiService } from '../services/dossier-api.service';
import { Statistiques } from '../models/statistiques.model';
import { messageErreur } from './dossier-api.store';

/**
 * État des statistiques du tableau de bord, alimenté par l'API Laravel
 * (`GET /api/statistiques`). Aucune donnée simulée : le store n'expose
 * que ce que le serveur renvoie, avec les états de chargement et d'erreur.
 */
@Injectable({ providedIn: 'root' })
export class StatistiquesStore {
  private readonly api = inject(DossierApiService);
  private readonly abonnement = signal<Subscription | null>(null);

  private readonly _donnees = signal<Statistiques | null>(null);
  private readonly _chargement = signal(false);
  private readonly _erreur = signal('');

  readonly donnees = this._donnees.asReadonly();
  readonly chargement = this._chargement.asReadonly();
  readonly erreur = this._erreur.asReadonly();

  /** Charge (ou recharge) les statistiques pour l'utilisateur connecté. */
  charger(): void {
    if (this._chargement()) return;

    this.abonnement()?.unsubscribe();
    this._chargement.set(true);
    this._erreur.set('');

    const sub = this.api.statistiques().subscribe({
      next: (reponse) => {
        this._donnees.set(reponse);
        this._chargement.set(false);
      },
      error: (err: unknown) => {
        this._erreur.set(messageErreur(err));
        this._chargement.set(false);
      },
    });

    this.abonnement.set(sub);
  }

  /** Libère la souscription (déconnexion du composant). */
  detruire(): void {
    this.abonnement()?.unsubscribe();
  }
}
