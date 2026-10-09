import { Injectable, signal } from '@angular/core';
import { Dossier, DossierFormValue, MouvementDossier, StatutDossier } from '../models/dossier.model';
import { DOSSIERS_MOCK, MOUVEMENTS_MOCK } from '../data/dossiers.mock';

@Injectable({ providedIn: 'root' })
export class DossierStore {
  private readonly _dossiers = signal<Dossier[]>([...DOSSIERS_MOCK]);
  private readonly _mouvements = signal<MouvementDossier[]>([...MOUVEMENTS_MOCK]);

  readonly dossiers = this._dossiers.asReadonly();
  /** Derniers mouvements entre services (données de démonstration). */
  readonly mouvements = this._mouvements.asReadonly();

  getById(id: string): Dossier | undefined {
    return this._dossiers().find((d) => d.id === id);
  }

  add(valeur: DossierFormValue): Dossier {
    const count = this._dossiers().length + 1;
    const dossier: Dossier = {
      ...valeur,
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()),
      reference: `DU-2026-${String(count).padStart(4, '0')}`,
      historique: [{ date: new Date().toISOString().slice(0, 10), libelle: 'Dossier créé' }],
    };
    this._dossiers.update((list) => [dossier, ...list]);
    return dossier;
  }

  update(id: string, valeur: DossierFormValue): void {
    this._dossiers.update((list) =>
      list.map((d) => (d.id === id ? { ...d, ...valeur } : d)),
    );
  }

  changeStatut(id: string, statut: StatutDossier): void {
    this._dossiers.update((list) =>
      list.map((d) =>
        d.id === id
          ? {
              ...d,
              statut,
              historique: [
                ...d.historique,
                { date: new Date().toISOString().slice(0, 10), libelle: `Statut → ${statut}` },
              ],
            }
          : d,
      ),
    );
  }
}
