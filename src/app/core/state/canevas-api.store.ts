import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, map, tap } from 'rxjs';
import { CanevasApiService } from '../services/canevas-api.service';
import { DossierApiService } from '../services/dossier-api.service';
import { DossierDto, FiltresDossiers } from '../models/dossier-api.model';
import { RapportImportCanevas } from '../models/canevas-api.model';
import { PaginationListe, messageErreur } from './dossier-api.store';

/** État de l'import en cours : fichier sélectionné localement. */
export interface FichierCanevas {
  fichier: File;
  nom: string;
  taille: string;
}

/** Formate une taille de fichier en unité lisible. */
export function formaterTaille(octets: number): string {
  if (!octets) return '—';
  const unites = ['o', 'Ko', 'Mo', 'Go'];
  const i = Math.min(unites.length - 1, Math.floor(Math.log(octets) / Math.log(1024)));
  const valeur = octets / Math.pow(1024, i);
  return `${valeur.toFixed(i === 0 ? 0 : 1).replace('.', ',')} ${unites[i]}`;
}

/**
 * État de la page « Canevas Excel » alimenté par l'API Laravel : liste des
 * dossiers accessibles (portée par service côté serveur), téléchargement du
 * canevas (.xlsx) et import d'un canevas rempli. Aucune donnée simulée.
 */
@Injectable({ providedIn: 'root' })
export class CanevasApiStore {
  private readonly dossiersApi = inject(DossierApiService);
  private readonly canevasApi = inject(CanevasApiService);

  private readonly _dossiers = signal<DossierDto[]>([]);
  private readonly _chargement = signal(false);
  private readonly _erreur = signal('');
  private readonly _pagination = signal<PaginationListe>({
    page: 1,
    parPage: 100,
    total: 0,
    dernierPage: 1,
    de: null,
    a: null,
  });

  private readonly _enCours = signal(false);
  private readonly _message = signal('');
  private readonly _erreurAction = signal('');
  private readonly _rapport = signal<RapportImportCanevas | null>(null);

  readonly dossiers = this._dossiers.asReadonly();
  readonly chargement = this._chargement.asReadonly();
  readonly erreur = this._erreur.asReadonly();
  readonly pagination = this._pagination.asReadonly();
  readonly enCours = this._enCours.asReadonly();
  readonly message = this._message.asReadonly();
  readonly erreurAction = this._erreurAction.asReadonly();
  readonly rapport = this._rapport.asReadonly();

  /** Derniers filtres appliqués (pour l'export et le rechargement). */
  private derniersFiltres: FiltresDossiers = {};

  /** Charge la liste des dossiers accessibles correspondant aux filtres. */
  chargerListe(filtres: FiltresDossiers): void {
    this.derniersFiltres = filtres;
    this._chargement.set(true);
    this._erreur.set('');

    this.dossiersApi.lister(filtres).subscribe({
      next: (reponse) => {
        this._dossiers.set(reponse.data);
        this._pagination.set({
          page: reponse.meta.current_page,
          parPage: reponse.meta.per_page,
          total: reponse.meta.total,
          dernierPage: reponse.meta.last_page,
          de: reponse.meta.from,
          a: reponse.meta.to,
        });
        this._chargement.set(false);
      },
      error: (erreur: unknown) => {
        this._erreur.set(messageErreur(erreur));
        this._dossiers.set([]);
        this._chargement.set(false);
      },
    });
  }

  /** Télécharge le canevas Excel (filtres courants) et déclenche le téléchargement. */
  exporter(filtres: FiltresDossiers): void {
    this._erreurAction.set('');
    this._message.set('');

    this.canevasApi.exporter(filtres).subscribe({
      next: (blob) => {
        const nom = `canevas-dossiers-${new Date().toISOString().slice(0, 10)}.xlsx`;
        const url = URL.createObjectURL(blob);
        const lien = window.document.createElement('a');
        lien.href = url;
        lien.download = nom;
        lien.click();
        URL.revokeObjectURL(url);
        this._message.set('Canevas Excel téléchargé.');
      },
      error: (erreur: unknown) => this._erreurAction.set(messageErreur(erreur)),
    });
  }

  /** Importe un canevas rempli puis recharge la liste. */
  importer(fichier: File): Observable<RapportImportCanevas> {
    this._enCours.set(true);
    this._message.set('');
    this._erreurAction.set('');
    this._rapport.set(null);

    const donnees = new FormData();
    donnees.append('file', fichier);

    return this.canevasApi.importer(donnees).pipe(
      tap((rapport) => {
        this._rapport.set(rapport);
        this._message.set(rapport.message);
      }),
      tap({
        error: (erreur: unknown) => this._erreurAction.set(messageErreur(erreur)),
      }),
      map((rapport) => rapport),
      finalize(() => this._enCours.set(false)),
    );
  }

  /** Recharge la liste avec les derniers filtres (après import). */
  recharger(): void {
    this.chargerListe(this.derniersFiltres);
  }

  /** Réinitialise les messages d'action et le rapport d'import. */
  effacerMessages(): void {
    this._message.set('');
    this._erreurAction.set('');
    this._rapport.set(null);
  }
}
