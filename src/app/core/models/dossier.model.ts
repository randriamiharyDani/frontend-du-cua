export type StatutDossier =
  | 'signale'
  | 'en_verification'
  | 'mise_en_demeure'
  | 'en_regularisation'
  | 'regularise'
  | 'cloture';

export type PrioriteDossier = 'basse' | 'moyenne' | 'haute';

export type TypeInfraction =
  | 'construction_sans_permis'
  | 'non_conformite_permis'
  | 'occupation_illegale'
  | 'extension_illegale'
  | 'changement_usage'
  | 'autre';

export interface HistoriqueItem {
  date: string;
  libelle: string;
}

export interface Dossier {
  id: string;
  reference: string;
  titre: string;
  type: TypeInfraction;
  description: string;
  adresse: string;
  quartier: string;
  arrondissement: string;
  proprietaire: string;
  telephone: string;
  dateSignalement: string;
  statut: StatutDossier;
  priorite: PrioriteDossier;
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
