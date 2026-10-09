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

/** Contrevenant : personne physique ou morale mise en cause. */
export interface Contrevenant {
  /** Nom de famille (ou raison sociale). */
  nom: string;
  /** Prénom(s). */
  prenom: string;
  /** Téléphone (optionnel, format +224 / 0). */
  telephone: string;
  /** Adresse du contrevenant (domicile / siège). */
  adresse: string;
  /** Observations sur le contrevenant. */
  observations: string;
}

/** Localisation du lieu de l’infraction. */
export interface LocalisationDossier {
  /** Adresse du lieu de l’infraction. */
  adresse: string;
  /**
   * Colonne « Localisation » du canevas : champ textuel libre.
   * Saisir « OK » lorsque le lieu est validé (jamais remplacé par une carte).
   */
  localisation: string;
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

/** Informations complémentaires au dossier. */
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

/** Informations administratives d’enregistrement du dossier. */
export interface InfosDossier {
  /** Numéro affiché (temporaire en création, ex. « À attribuer »). */
  numero: string;
  /** Date d’entrée = date d’enregistrement administratif. */
  dateEntree: string;
  referenceArrivee: string;
  referenceEtude: string;
  /**
   * Colonne « idem_ETUDE » : référence à un signalement antérieur lorsqu’il existe.
   * Champ facultatif.
   */
  idemEtude: string;
  dateEtude: string;
  provenance: string;
  nature: NatureDossier;
}

/**
 * Arrêté d’interruption et suites administratives (colonnes REF_ARRETE,
 * DATE_ARRETE, OBJET_ARRETE, DATE_SCELLAGE, DATE DEMOL OU ENLEVEMENT).
 * Tous les champs restent vides tant que l’information n’est pas disponible.
 */
export interface ArretesDossier {
  /** Référence de l’arrêté. */
  refArrete: string;
  /** Date de l’arrêté (ISO `yyyy-MM-dd`). */
  dateArrete: string;
  /** Objet de l’arrêté. */
  objetArrete: string;
  /** Date de scellage (ISO `yyyy-MM-dd`). */
  dateScellage: string;
  /** Date de démolition ou d’enlèvement (ISO `yyyy-MM-dd`). */
  dateDemolOuEnlevement: string;
}

/** Mouvement d’un dossier entre deux services. */
export interface MouvementDossier {
  id: string;
  date: string;
  dossierId: string;
  reference: string;
  titre: string;
  de: ServiceDossier;
  vers: ServiceDossier;
  /** Étape du dossier au moment du mouvement. */
  etape: EtapeDossier;
  /** Libellé court de l’action réalisée. */
  action: string;
  /** Référence du document justificatif (facultatif). */
  referenceDocument: string;
  /** Observations / motif du mouvement. */
  motif: string;
  auteur: string;
}

/** Valeur du formulaire de saisie d’un nouveau mouvement. */
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

/** Entrée de l’historique / journal d’un dossier. */
export interface HistoriqueItem {
  /** Date de l’événement (format ISO `yyyy-MM-dd`). */
  date: string;
  /** Libellé de l’action consignée. */
  libelle: string;
}

/** Nature d’une pièce jointe rattachée à un dossier. */
export type TypeDocument =
  | 'plainte_signalement'
  | 'avertissement'
  | 'rapport_descente'
  | 'arrete_interruptif'
  | 'lettre_notification'
  | 'document_etude'
  | 'pv_scellage'
  | 'document_demolition'
  | 'document_regularisation'
  | 'arrete_scelles'
  | 'autre';

export const TYPE_DOCUMENT_LABEL: Record<TypeDocument, string> = {
  plainte_signalement: 'Plainte ou signalement',
  avertissement: 'Avertissement',
  rapport_descente: 'Rapport de descente',
  arrete_interruptif: 'Arrêté interruptif',
  lettre_notification: 'Lettre de notification',
  document_etude: 'Document d’étude',
  pv_scellage: 'Procès-verbal de scellage',
  document_demolition: 'Document de démolition',
  document_regularisation: 'Document de régularisation',
  arrete_scelles: 'Arrêté d’ouverture ou de levée des scellés',
  autre: 'Autre document',
};

/** Ordre officiel des types de documents (formulaires et filtres). */
export const DOCUMENT_TYPES: readonly TypeDocument[] = [
  'plainte_signalement',
  'avertissement',
  'rapport_descente',
  'arrete_interruptif',
  'lettre_notification',
  'document_etude',
  'pv_scellage',
  'document_demolition',
  'document_regularisation',
  'arrete_scelles',
  'autre',
];

/** Pièce jointe associée à un dossier (données locales de démonstration). */
export interface DocumentDossier {
  id: string;
  dossierId: string;
  nom: string;
  type: TypeDocument;
  reference: string;
  dateDepot: string;
  observations?: string;
  taille?: string;
  deposePar?: string;
}

/** Valeur du formulaire d’ajout d’un document. */
export type DocumentFormValue = Omit<DocumentDossier, 'id'>;

/** Localisation référencée dans l’espace administrateur (coordonnées textuelles). */
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

/** Valeur du formulaire d’ajout / modification d’une localisation. */
export type LocalisationFormValue = Omit<Localisation, 'id'>;

/**
 * Dossier de construction illicite.
 * Les données métier sont regroupées par section du formulaire :
 * { infos, contrevenant, localisation, complements } puis les champs de suivi.
 */
export interface Dossier {
  id: string;
  reference: string;
  /** Section 1 — Informations du dossier. */
  infos: InfosDossier;
  /** Section 2 — Contrevenant. */
  contrevenant: Contrevenant;
  /** Section 3 — Localisation. */
  localisation: LocalisationDossier;
  /** Section 4 — Informations complémentaires. */
  complements: InfosComplementaires;
  /** Section 5 — Arrêté d’interruption et suites (scellage, démolition). */
  arretes: ArretesDossier;
  /** Suivi — qualification et traitement. */
  type: TypeInfraction;
  service: ServiceDossier;
  etape: EtapeDossier;
  statut: StatutDossier;
  priorite: PrioriteDossier;
  /** Dossier à traiter en priorité (mise en demeure proche, pièce manquante…). */
  attentionRequise: boolean;
  /** Motif affiché dans « Attention particulière ». */
  motifAttention?: string;
  agent: string;
  historique: HistoriqueItem[];
}

/** Valeur du formulaire de création / modification (champs gérés par l’utilisateur). */
export type DossierFormValue = Omit<Dossier, 'id' | 'reference' | 'historique'>;

/** Numéro indicatif affiché lors de la création, remplacé à l’enregistrement. */
export const NUMERO_TEMPORAIRE = 'À attribuer';

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

/** Nom complet affiché d’un contrevenant (« Prénom Nom »). */
export function nomContrevenant(c: Contrevenant): string {
  return [c.prenom, c.nom].filter((v) => !!v && v.trim().length > 0).join(' ').trim();
}
