import { ServiceDossier } from './dossier.model';

/** Format d’affichage des dates proposé dans les préférences. */
export type FormatDate = 'dd/MM/yyyy' | 'dd-MM-yyyy' | 'yyyy-MM-dd';

/** Profil de l’utilisateur connecté (table `users`). */
export interface ProfilParametres {
  nom: string;
  email: string;
  service: ServiceDossier;
  fonction: string;
  telephone: string;
}

/** Préférences d’affichage personnelles de l’espace administrateur. */
export interface PreferencesParametres {
  langue: string;
  formatDate: FormatDate;
  elementsParPage: number;
  afficherPriorites: boolean;
  notificationsEmail: boolean;
}

/** Informations générales de l’application (paramètre global). */
export interface ApplicationParametres {
  nomApplication: string;
  entite: string;
  sigle: string;
  emailContact: string;
  telephoneContact: string;
  adresse: string;
}

/** Service disponible dans l’application (DU, DIS, SCAD). */
export interface ServiceParametre {
  code: ServiceDossier;
  libelle: string;
  description: string;
  actif: boolean;
}

/** Entrée de référentiel fournie par l’API Laravel. */
export interface ReferentielItem {
  code: string;
  libelle: string;
  /** Exemple rendu sur une date réelle (formats de date uniquement). */
  exemple?: string;
}

/**
 * Référentiels applicatifs fournis par l’API Laravel (types d’infraction,
 * statuts, natures, priorités, étapes, formats de date, langues).
 */
export interface ReferentielsParametres {
  types: ReferentielItem[];
  statuts: ReferentielItem[];
  natures: ReferentielItem[];
  priorites: ReferentielItem[];
  etapes: ReferentielItem[];
  interventions: ReferentielItem[];
  formatsDate: ReferentielItem[];
  langues: ReferentielItem[];
}

/** État complet des paramètres renvoyé par l’API. */
export interface Parametres {
  profil: ProfilParametres;
  preferences: PreferencesParametres;
  application: ApplicationParametres;
  services: ServiceParametre[];
  referentiels: ReferentielsParametres;
}

/**
 * Valeurs par défaut — état neutre avant la réponse de l’API.
 *
 * Elles reprennent les valeurs par défaut du serveur (`ParametresDefaut`)
 * et ne contiennent aucune donnée de démonstration : le profil et les
 * informations de l’application restent vides tant que l’API n’a pas
 * répondu.
 */
export const PARAMETRES_DEFAUT: Parametres = {
  profil: {
    nom: '',
    email: '',
    service: 'DU',
    fonction: '',
    telephone: '',
  },
  preferences: {
    langue: 'fr',
    formatDate: 'dd/MM/yyyy',
    elementsParPage: 8,
    afficherPriorites: true,
    notificationsEmail: false,
  },
  application: {
    nomApplication: '',
    entite: '',
    sigle: '',
    emailContact: '',
    telephoneContact: '',
    adresse: '',
  },
  services: [],
  referentiels: {
    types: [],
    statuts: [],
    natures: [],
    priorites: [],
    etapes: [],
    interventions: [],
    formatsDate: [],
    langues: [],
  },
};

/** Copie indépendante des paramètres par défaut. */
export function parametresParDefaut(): Parametres {
  return JSON.parse(JSON.stringify(PARAMETRES_DEFAUT)) as Parametres;
}
