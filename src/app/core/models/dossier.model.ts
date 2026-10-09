export type StatutDossier =
  | 'signale'
  | 'en_verification'
  | 'mise_en_demeure'
  | 'en_regularisation'
  | 'regularise'
  | 'cloture';

export type PrioriteDossier = 'basse' | 'moyenne' | 'haute';

/** Origine du dossier : plainte d’un tiers, signalement interne ou ratissage. */
export type NatureDossier = 'plainte' | 'signalement' | 'ratissage';

/** Étape de traitement dans le circuit administratif. */
export type EtapeDossier =
  | 'constat'
  | 'instruction'
  | 'mise_en_demeure'
  | 'regularisation'
  | 'cloture';

/** État d’avancement affiché en badge : ouvert, en cours ou clôturé. */
export type EtatDossier = 'ouvert' | 'en_cours' | 'cloture';

export type TypeInfraction =
  | 'construction_sans_permis'
  | 'non_conformite_permis'
  | 'occupation_illegale'
  | 'extension_illegale'
  | 'changement_usage'
  | 'autre';

export type ServiceDossier = 'DU' | 'DIS' | 'SCAD';

export interface Contrevenant {
  /** Nom de famille. */
  nom: string;
  /** Prénom(s). */
  prenom: string;
  /** Téléphone (optionnel, format +261 / 0). */
  telephone: string;
  /** Adresse du contrevenant (domicile / siège). */
  adresse: string;
  /** Observations sur le contrevenant. */
  observations: string;
}

export interface LocalisationDossier {
  /** Adresse du lieu de l’infraction. */
  adresse: string;
  quartier: string;
  arrondissement: string;
  /** Coordonnées plan (X / Y) — texte libre pour la démo, pas de carte. */
  coordX: string;
  coordY: string;
  latitude: string;
  longitude: string;
  /** Description du lieu (accès, repères…). */
  description: string;
}

export interface InfosComplementaires {
  /** Objet du dossier (titre). */
  objet: string;
  /** Précision d’emplacement (parcelle, repère…). */
  emplacement: string;
  /** Référence d’un dossier lié. */
  dossierRelatif: string;
  /** Observations générales. */
  observationsGenerales: string;
}

export interface InfosDossier {
  /** Numéro affiché (temporaire en création, ex. « À attribuer »). */
  numero: string;
  /** Date d’entrée = date d’enregistrement administratif. */
  dateEntree: string;
  referenceArrivee: string;
  referenceEtude: string;
  dateEtude: string;
  provenance: string;
  nature: NatureDossier;
}

export interface MouvementDossier {
  id: string;
  date: string;
  dossierId: string;
  reference: string;
  titre: string;
  de: ServiceDossier;
  vers: ServiceDossier;
  motif: string;
  auteur: string;
}

export interface Dossier {
  id: string;
  reference: string;
  titre: string;
  type: TypeInfraction;
  /** Origine : plainte, signalement ou ratissage. */
  nature: NatureDossier;
  /** Étape de traitement dans le circuit. */
  etape: EtapeDossier;
  description: string;
  adresse: string;
  quartier: string;
  arrondissement: string;
  proprietaire: string;
  telephone: string;
  dateSignalement: string;
  /** Date d'enregistrement administratif (souvent = signalement, décalée pour la démo). */
  dateEnregistrement: string;
  service: ServiceDossier;
  statut: StatutDossier;
  priorite: PrioriteDossier;
  /** Dossier à traiter en priorité (mise en demeure proche, pièce manquante…). */
  attentionRequise: boolean;
  /** Motif affiché dans « Attention particulière ». */
  motifAttention?: string;
  agent: string;
  historique: HistoriqueItem[];
}

export type DossierFormValue = Omit<Dossier, 'id' | 'reference' | 'historique'>;

export const STATUTS: readonly StatutDossier[] = [
  'signale',
  'en_verification',
  'mise_en_demeure',
  'en_regularisation',
  'regularise',
  'cloture',
];

export const STATUT_LABEL: Record<StatutDossier, string> = {
  signale: 'Signalé',
  en_verification: 'En vérification',
  mise_en_demeure: 'Mise en demeure',
  en_regularisation: 'En régularisation',
  regularise: 'Régularisé',
  cloture: 'Clôturé',
};

export const PRIORITES: readonly PrioriteDossier[] = ['basse', 'moyenne', 'haute'];

export const PRIORITE_LABEL: Record<PrioriteDossier, string> = {
  basse: 'Basse',
  moyenne: 'Moyenne',
  haute: 'Haute',
};

export const TYPES: readonly TypeInfraction[] = [
  'construction_sans_permis',
  'non_conformite_permis',
  'occupation_illegale',
  'extension_illegale',
  'changement_usage',
  'autre',
];

export const TYPE_LABEL: Record<TypeInfraction, string> = {
  construction_sans_permis: 'Construction sans permis',
  non_conformite_permis: 'Non-conformité au permis',
  occupation_illegale: 'Occupation illégale',
  extension_illegale: 'Extension illégale',
  changement_usage: "Changement d'usage",
  autre: 'Autre',
};

export const ARRONDISSEMENTS: readonly string[] = [
  'Arrondissement 1',
  'Arrondissement 2',
  'Arrondissement 3',
  'Arrondissement 4',
  'Arrondissement 5',
];

export const SERVICES: readonly ServiceDossier[] = ['DU', 'DIS', 'SCAD'];

export const NATURES: readonly NatureDossier[] = ['plainte', 'signalement', 'ratissage'];

export const NATURE_LABEL: Record<NatureDossier, string> = {
  plainte: 'Plainte',
  signalement: 'Signalement',
  ratissage: 'Ratissage',
};

export const ETAPES: readonly EtapeDossier[] = [
  'constat',
  'instruction',
  'mise_en_demeure',
  'regularisation',
  'cloture',
];

export const ETAPE_LABEL: Record<EtapeDossier, string> = {
  constat: 'Constat',
  instruction: 'Instruction',
  mise_en_demeure: 'Mise en demeure',
  regularisation: 'Régularisation',
  cloture: 'Clôture',
};

/** Dérive l’état badge depuis le statut métier. */
export function etatDossier(statut: StatutDossier): EtatDossier {
  if (statut === 'regularise' || statut === 'cloture') return 'cloture';
  if (statut === 'signale') return 'ouvert';
  return 'en_cours';
}

export const ETAT_LABEL: Record<EtatDossier, string> = {
  ouvert: 'Ouvert',
  en_cours: 'En cours',
  cloture: 'Clôturé',
};

export const SERVICE_LABEL: Record<ServiceDossier, string> = {
  DU: 'Direction de l’Urbanisme',
  DIS: 'Direction des Infrastructures Sociales',
  SCAD: 'Service du Cadastre',
};
