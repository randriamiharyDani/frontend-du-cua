/**
 * Modèle central de l’application DOLEANCE DU.
 * Types des dossiers, mouvements, documents et localisations — alignés sur
 * les 20 colonnes du canevas Excel et le circuit métier DU/DIS/SCAD.
 * Données locales uniquement — aucun appel API.
 */

/* ============================ Services ============================ */

export type ServiceDossier = 'DU' | 'DIS' | 'SCAD';

export const SERVICES: readonly ServiceDossier[] = ['DU', 'DIS', 'SCAD'];

export const SERVICE_LABEL: Record<ServiceDossier, string> = {
  DU: 'Direction de l’Urbanisme',
  DIS: 'division inspection et suivi',
  SCAD: 'Service de Coordination des activités et doléances',
};

/* ============================ Statuts ============================ */

export type StatutDossier =
  | 'signale'
  | 'en_verification'
  | 'mise_en_demeure'
  | 'en_regularisation'
  | 'regularise'
  | 'cloture';

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

/** État synthétique (badge) dérivé du statut métier. */
export type EtatDossier = 'ouvert' | 'en_cours' | 'cloture';

export const ETAT_LABEL: Record<EtatDossier, string> = {
  ouvert: 'Ouvert',
  en_cours: 'En cours',
  cloture: 'Clôturé',
};

/** Déduit l’état synthétique (badge) à partir du statut métier. */
export function etatDossier(statut: StatutDossier): EtatDossier {
  if (statut === 'signale') return 'ouvert';
  if (statut === 'regularise' || statut === 'cloture') return 'cloture';
  return 'en_cours';
}

/* ============================ Étapes ============================ */

export type EtapeDossier =
  | 'constat'
  | 'instruction'
  | 'mise_en_demeure'
  | 'regularisation'
  | 'cloture';

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

/* ============================ Natures ============================ */

export type NatureDossier = 'plainte' | 'signalement' | 'ratissage';

export const NATURES: readonly NatureDossier[] = ['plainte', 'signalement', 'ratissage'];

export const NATURE_LABEL: Record<NatureDossier, string> = {
  plainte: 'Plainte',
  signalement: 'Signalement',
  ratissage: 'Ratissage',
};

/* ============================ Types d’infraction ============================ */

export type TypeInfraction =
  | 'construction_sans_permis'
  | 'extension_illegale'
  | 'occupation_illegale'
  | 'non_conformite_permis'
  | 'changement_usage'
  | 'autre';

export const TYPES: readonly TypeInfraction[] = [
  'construction_sans_permis',
  'extension_illegale',
  'occupation_illegale',
  'non_conformite_permis',
  'changement_usage',
  'autre',
];

export const TYPE_LABEL: Record<TypeInfraction, string> = {
  construction_sans_permis: 'Construction sans permis',
  extension_illegale: 'Extension illégale',
  occupation_illegale: 'Occupation illégale',
  non_conformite_permis: 'Non-conformité au permis',
  changement_usage: 'Changement d’usage',
  autre: 'Autre',
};

/* ============================ Types de documents ============================ */

export type TypeDocument =
  | 'plainte_signalement'
  | 'rapport_descente'
  | 'avertissement'
  | 'arrete_interruptif'
  | 'lettre_notification'
  | 'document_etude'
  | 'pv_scellage'
  | 'document_regularisation'
  | 'document_demolition'
  | 'arrete_scelles';

export const DOCUMENT_TYPES: readonly TypeDocument[] = [
  'plainte_signalement',
  'rapport_descente',
  'avertissement',
  'arrete_interruptif',
  'lettre_notification',
  'document_etude',
  'pv_scellage',
  'document_regularisation',
  'document_demolition',
  'arrete_scelles',
];

export const TYPE_DOCUMENT_LABEL: Record<TypeDocument, string> = {
  plainte_signalement: 'Plainte / Signalement',
  rapport_descente: 'Rapport de descente',
  avertissement: 'Avertissement',
  arrete_interruptif: 'Arrêté interruptif',
  lettre_notification: 'Lettre de notification',
  document_etude: 'Document d’étude',
  pv_scellage: 'PV de scellage',
  document_regularisation: 'Document de régularisation',
  document_demolition: 'Document de démolition / enlèvement',
  arrete_scelles: 'Arrêté de levée des scellés',
};

/* ============================ Arrondissements ============================ */

export const ARRONDISSEMENTS: readonly string[] = [
  'Arrondissement 1',
  'Arrondissement 2',
  'Arrondissement 3',
  'Arrondissement 4',
  'Arrondissement 5',
  'Arrondissement 6',
];

/* ============================ Helpers ============================ */

/** Numéro provisoire affiché avant attribution de la référence définitive. */
export const NUMERO_TEMPORAIRE = 'À attribuer';

/** Nom complet du contrevenant (prénom + nom, sans doublon d’espaces). */
export function nomContrevenant(c: { nom: string; prenom?: string }): string {
  return [c.prenom?.trim(), c.nom?.trim()].filter(Boolean).join(' ').trim();
}

/* ============================ Sous-structures du dossier ============================ */

/** Informations du dossier (canevas : NUM_BD, DATE_ENTREE, Ref_ETUDE…). */
export interface InfosDossier {
  numero: string;
  dateEntree: string;
  referenceArrivee: string;
  referenceEtude: string;
  idemEtude: string;
  dateEtude: string;
  provenance: string;
  nature: NatureDossier;
}

/** Contrevenant : nom, prénom, téléphone, adresse, observations. */
export interface Contrevenant {
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  observations: string;
}

/** Localisation du dossier : adresse, zone, coordonnées X/Y et lat/long. */
export interface LocalisationDossier {
  adresse: string;
  localisation: string;
  quartier: string;
  arrondissement: string;
  coordX: string;
  coordY: string;
  latitude: string;
  longitude: string;
  description: string;
}

/** Informations complémentaires : objet, emplacement, dossier relatif, OBS. */
export interface ComplementsDossier {
  objet: string;
  emplacement: string;
  dossierRelatif: string;
  observationsGenerales: string;
}

/** Arrêté d’interruption et suites (scellage, démolition / enlèvement). */
export interface ArretesDossier {
  refArrete: string;
  dateArrete: string;
  objetArrete: string;
  dateScellage: string;
  dateDemolOuEnlevement: string;
}

/** Entrée d’historique d’un dossier. */
export interface HistoriqueItem {
  date: string;
  libelle: string;
}

/* ============================ Dossier ============================ */

export interface Dossier {
  id: string;
  reference: string;
  infos: InfosDossier;
  contrevenant: Contrevenant;
  localisation: LocalisationDossier;
  complements: ComplementsDossier;
  arretes: ArretesDossier;
  type: TypeInfraction;
  service: ServiceDossier;
  etape: EtapeDossier;
  statut: StatutDossier;
  priorite: PrioriteDossier;
  attentionRequise: boolean;
  motifAttention: string;
  agent: string;
  historique: HistoriqueItem[];
}

/** Valeurs du formulaire de création / modification d’un dossier. */
export type DossierFormValue = Omit<Dossier, 'id' | 'reference' | 'historique'>;

/* ============================ Priorités ============================ */

export type PrioriteDossier = 'basse' | 'moyenne' | 'haute';

export const PRIORITES: readonly PrioriteDossier[] = ['basse', 'moyenne', 'haute'];

export const PRIORITE_LABEL: Record<PrioriteDossier, string> = {
  basse: 'Basse',
  moyenne: 'Moyenne',
  haute: 'Haute',
};

/* ============================ Mouvements ============================ */

/** Mouvement entre services : historique de circulation d’un dossier. */
export interface MouvementDossier {
  id: string;
  date: string;
  dossierId: string;
  reference: string;
  titre: string;
  de: ServiceDossier;
  vers: ServiceDossier;
  etape: EtapeDossier;
  action: string;
  referenceDocument: string;
  motif: string;
  auteur: string;
}

/** Valeurs du formulaire de création d’un mouvement. */
export interface MouvementFormValue {
  dossierId: string;
  date: string;
  de: ServiceDossier;
  vers: ServiceDossier;
  etape: EtapeDossier;
  action: string;
  observations: string;
  auteur: string;
  referenceDocument: string;
}

/* ============================ Documents ============================ */

/** Pièce jointe associée à un dossier. */
export interface DocumentDossier {
  id: string;
  dossierId: string;
  nom: string;
  type: TypeDocument;
  reference: string;
  dateDepot: string;
  observations?: string;
  taille: string;
  deposePar: string;
}

/** Valeurs du formulaire d’ajout d’un document. */
export type DocumentFormValue = Omit<DocumentDossier, 'id'>;

/* ============================ Localisations ============================ */

/** Référentiel des zones / localisations géographiques. */
export interface Localisation {
  id: string;
  adresse: string;
  quartier: string;
  arrondissement: string;
  coordX: string;
  coordY: string;
  latitude: string;
  longitude: string;
}

/** Valeurs du formulaire de création / modification d’une localisation. */
export type LocalisationFormValue = Omit<Localisation, 'id'>;