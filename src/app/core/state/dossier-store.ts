import { Injectable, signal } from '@angular/core';
import {
  DocumentDossier,
  DocumentFormValue,
  Dossier,
  DossierFormValue,
  Localisation,
  LocalisationFormValue,
  MouvementDossier,
  MouvementFormValue,
  NUMERO_TEMPORAIRE,
  StatutDossier,
} from '../models/dossier.model';
import { DOCUMENTS_MOCK, DOSSIERS_MOCK, LOCALISATIONS_MOCK, MOUVEMENTS_MOCK } from '../data/dossiers.mock';
import { UTILISATEURS_MOCK } from '../data/utilisateurs.mock';
import { Utilisateur, UtilisateurFormValue } from '../models/utilisateur.model';

@Injectable({ providedIn: 'root' })
export class DossierStore {
  private readonly _dossiers = signal<Dossier[]>([...DOSSIERS_MOCK]);
  private readonly _mouvements = signal<MouvementDossier[]>([...MOUVEMENTS_MOCK]);
  private readonly _documents = signal<DocumentDossier[]>([...DOCUMENTS_MOCK]);
  private readonly _localisations = signal<Localisation[]>([...LOCALISATIONS_MOCK]);
  private readonly _utilisateurs = signal<Utilisateur[]>([...UTILISATEURS_MOCK]);

  readonly dossiers = this._dossiers.asReadonly();
  /** Derniers mouvements entre services (données de démonstration). */
  readonly mouvements = this._mouvements.asReadonly();
  /** Pièces jointes (données de démonstration). */
  readonly documents = this._documents.asReadonly();
  /** Référentiel des localisations (données de démonstration). */
  readonly localisations = this._localisations.asReadonly();
  /** Comptes utilisateurs (données de démonstration). */
  readonly utilisateurs = this._utilisateurs.asReadonly();

  getById(id: string): Dossier | undefined {
    return this._dossiers().find((d) => d.id === id);
  }

  /** Mouvements d’un dossier, du plus ancien au plus récent. */
  mouvementsDuDossier(id: string): MouvementDossier[] {
    return this._mouvements()
      .filter((m) => m.dossierId === id)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /** Documents associés à un dossier. */
  documentsDuDossier(id: string): DocumentDossier[] {
    return this._documents().filter((doc) => doc.dossierId === id);
  }

  add(valeur: DossierFormValue): Dossier {
    const count = this._dossiers().length + 1;
    const reference = `DU-2026-${String(count).padStart(4, '0')}`;
    /** Numéro temporaire remplacé par la référence définitive à l’enregistrement. */
    const numeroSaisi = valeur.infos.numero.trim();
    const numero = !numeroSaisi || numeroSaisi === NUMERO_TEMPORAIRE ? reference : numeroSaisi;
    const dossier: Dossier = {
      ...valeur,
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()),
      reference,
      infos: { ...valeur.infos, numero },
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

  /**
   * Enregistre un mouvement local (démonstration) et met à jour le dossier concerné :
   * service actuel = service d’arrivée, étape, et une entrée d’historique.
   */
  addMouvement(valeur: MouvementFormValue): MouvementDossier {
    const dossier = this.getById(valeur.dossierId);
    const mouvement: MouvementDossier = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()),
      date: valeur.date,
      dossierId: valeur.dossierId,
      reference: dossier?.reference ?? '',
      titre: dossier?.complements.objet ?? '',
      de: valeur.de,
      vers: valeur.vers,
      etape: valeur.etape,
      action: valeur.action,
      referenceDocument: valeur.referenceDocument,
      motif: valeur.observations,
      auteur: valeur.auteur,
    };
    this._mouvements.update((list) => [mouvement, ...list]);

    if (dossier) {
      this._dossiers.update((list) =>
        list.map((d) =>
          d.id === valeur.dossierId
            ? {
                ...d,
                service: valeur.vers,
                etape: valeur.etape,
                historique: [
                  ...d.historique,
                  { date: valeur.date, libelle: `${valeur.action} (${valeur.de} → ${valeur.vers})` },
                ],
              }
            : d,
        ),
      );
    }
    return mouvement;
  }

  /** Ajoute une localisation locale (démonstration). */
  addLocalisation(valeur: LocalisationFormValue): Localisation {
    const localisation: Localisation = {
      ...valeur,
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()),
    };
    this._localisations.update((list) => [localisation, ...list]);
    return localisation;
  }

  /** Modifie une localisation existante (démonstration). */
  updateLocalisation(id: string, valeur: LocalisationFormValue): void {
    this._localisations.update((list) =>
      list.map((l) => (l.id === id ? { ...l, ...valeur } : l)),
    );
  }

  /** Supprime une localisation (démonstration). */
  supprimerLocalisation(id: string): void {
    this._localisations.update((list) => list.filter((l) => l.id !== id));
  }

  /** Ajoute un document local (démonstration). */
  addDocument(valeur: DocumentFormValue): DocumentDossier {
    const document: DocumentDossier = {
      ...valeur,
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()),
    };
    this._documents.update((list) => [document, ...list]);
    return document;
  }

  /** Ajoute un utilisateur local (démonstration). */
  addUtilisateur(valeur: UtilisateurFormValue): Utilisateur {
    const utilisateur: Utilisateur = {
      ...valeur,
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()),
      dateCreation: new Date().toISOString().slice(0, 10),
    };
    this._utilisateurs.update((list) => [utilisateur, ...list]);
    return utilisateur;
  }

  /** Modifie un utilisateur existant (démonstration). */
  updateUtilisateur(id: string, valeur: UtilisateurFormValue): void {
    this._utilisateurs.update((list) =>
      list.map((u) => (u.id === id ? { ...u, ...valeur } : u)),
    );
  }

  /** Supprime un utilisateur (démonstration). */
  supprimerUtilisateur(id: string): void {
    this._utilisateurs.update((list) => list.filter((u) => u.id !== id));
  }
}
