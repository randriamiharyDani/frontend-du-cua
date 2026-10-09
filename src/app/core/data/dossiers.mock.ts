import {
  Dossier,
  EtapeDossier,
  MouvementDossier,
  NatureDossier,
  PrioriteDossier,
  ServiceDossier,
  StatutDossier,
  TypeInfraction,
} from '../models/dossier.model';

/** DONNEES DE DEMONSTRATION — usage local uniquement, aucun appel API. */

interface DossierSeed {
  id: string;
  reference: string;
  objet: string;
  type: TypeInfraction;
  service: ServiceDossier;
  nature: NatureDossier;
  etape: EtapeDossier;
  statut: StatutDossier;
  priorite: PrioriteDossier;
  attentionRequise: boolean;
  motifAttention?: string;
  agent: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  quartier: string;
  arrondissement: string;
  dateEntree: string;
}

const SEEDS: DossierSeed[] = [
  { id: '1', reference: 'DU-2026-0001', objet: 'Construction R+1 sans permis à Kipe', type: 'construction_sans_permis', service: 'DU', nature: 'plainte', etape: 'constat', statut: 'signale', priorite: 'haute', attentionRequise: true, motifAttention: 'Construction active à constater sous 48 h.', agent: 'Agent K. Diallo', nom: 'Bah', prenom: 'Mamadou', telephone: '034 00 000 01', adresse: 'Rue KA-012, Kipe', quartier: 'Kipe', arrondissement: 'Arrondissement 1', dateEntree: '2026-10-02' },
  { id: '2', reference: 'DU-2026-0002', objet: 'Extension non déclarée à Nongo', type: 'extension_illegale', service: 'SCAD', nature: 'signalement', etape: 'instruction', statut: 'en_verification', priorite: 'moyenne', attentionRequise: false, agent: 'Agent S. Camara', nom: 'Diallo', prenom: 'Awa', telephone: '034 00 000 02', adresse: 'Rue NO-214, Nongo', quartier: 'Nongo', arrondissement: 'Arrondissement 2', dateEntree: '2026-09-29' },
  { id: '3', reference: 'DU-2026-0003', objet: 'Occupation du domaine public au marché', type: 'occupation_illegale', service: 'DU', nature: 'ratissage', etape: 'mise_en_demeure', statut: 'mise_en_demeure', priorite: 'haute', attentionRequise: true, motifAttention: 'Mise en demeure : échéance le 10/10/2026.', agent: 'Agent K. Diallo', nom: 'Sy', prenom: 'Fatoumata', telephone: '034 00 000 03', adresse: 'Avenue du marché, Madina', quartier: 'Madina', arrondissement: 'Arrondissement 3', dateEntree: '2026-09-21' },
  { id: '4', reference: 'DU-2026-0004', objet: 'Dalle non conforme au plan approuvé', type: 'non_conformite_permis', service: 'DIS', nature: 'signalement', etape: 'regularisation', statut: 'en_regularisation', priorite: 'moyenne', attentionRequise: false, agent: 'Agent M. Sow', nom: 'Camara', prenom: 'Ibrahima', telephone: '034 00 000 04', adresse: 'Rue CO-087, Coleah', quartier: 'Coleah', arrondissement: 'Arrondissement 4', dateEntree: '2026-09-16' },
  { id: '5', reference: 'DU-2026-0005', objet: 'Garage transformé en boutique', type: 'changement_usage', service: 'SCAD', nature: 'plainte', etape: 'cloture', statut: 'regularise', priorite: 'basse', attentionRequise: false, agent: 'Agent S. Camara', nom: 'Condé', prenom: 'Mariam', telephone: '034 00 000 05', adresse: 'Rue HE-033, Heremakono', quartier: 'Heremakono', arrondissement: 'Arrondissement 5', dateEntree: '2026-09-11' },
  { id: '6', reference: 'DU-2026-0006', objet: 'Mur de clôture sur alignement', type: 'autre', service: 'SCAD', nature: 'ratissage', etape: 'cloture', statut: 'cloture', priorite: 'basse', attentionRequise: false, agent: '', nom: 'Sow', prenom: 'Ousmane', telephone: '034 00 000 06', adresse: 'Rue KI-101, Kipe', quartier: 'Kipe', arrondissement: 'Arrondissement 1', dateEntree: '2026-09-06' },
  { id: '7', reference: 'DU-2026-0007', objet: 'Étage supplémentaire sans permis', type: 'construction_sans_permis', service: 'DIS', nature: 'signalement', etape: 'instruction', statut: 'en_verification', priorite: 'haute', attentionRequise: true, motifAttention: 'Plan de structure à réclamer.', agent: 'Agent K. Diallo', nom: 'Barry', prenom: 'Aïcha', telephone: '034 00 000 07', adresse: 'Rue MA-055, Matam', quartier: 'Matam', arrondissement: 'Arrondissement 3', dateEntree: '2026-10-04' },
  { id: '8', reference: 'DU-2026-0008', objet: 'Hangar métallique en zone habitation', type: 'occupation_illegale', service: 'DU', nature: 'plainte', etape: 'constat', statut: 'signale', priorite: 'moyenne', attentionRequise: false, agent: '', nom: 'Touré', prenom: 'Sékou', telephone: '034 00 000 08', adresse: 'Rue SO-009, Sonfonia', quartier: 'Sonfonia', arrondissement: 'Arrondissement 2', dateEntree: '2026-09-23' },
  { id: '9', reference: 'DU-2026-0009', objet: 'Fondation sans implantation bornée', type: 'construction_sans_permis', service: 'SCAD', nature: 'ratissage', etape: 'constat', statut: 'signale', priorite: 'haute', attentionRequise: true, motifAttention: 'Bornage contradictoire à organiser.', agent: 'Agent S. Camara', nom: 'Soumah', prenom: 'Naby', telephone: '034 00 000 09', adresse: 'Rue SI-118, Simbaya', quartier: 'Simbaya', arrondissement: 'Arrondissement 4', dateEntree: '2026-10-06' },
  { id: '10', reference: 'DU-2026-0010', objet: 'Réhabilitation école sans avis technique', type: 'non_conformite_permis', service: 'DIS', nature: 'signalement', etape: 'instruction', statut: 'en_verification', priorite: 'moyenne', attentionRequise: false, agent: 'Agent M. Sow', nom: 'Commune de Ratoma', prenom: '', telephone: '034 00 000 10', adresse: 'Rue ECO-02, Ratoma', quartier: 'Ratoma', arrondissement: 'Arrondissement 5', dateEntree: '2026-10-07' },
  { id: '11', reference: 'DU-2026-0011', objet: 'Taxe de régularisation soldée', type: 'changement_usage', service: 'DU', nature: 'plainte', etape: 'cloture', statut: 'regularise', priorite: 'basse', attentionRequise: false, agent: 'Agent K. Diallo', nom: 'Koné', prenom: 'Kadiatou', telephone: '034 00 000 11', adresse: 'Rue CO-210, Coleah', quartier: 'Coleah', arrondissement: 'Arrondissement 4', dateEntree: '2026-08-29' },
  { id: '12', reference: 'DU-2026-0012', objet: 'Clôture provisoire non démontée', type: 'occupation_illegale', service: 'DIS', nature: 'signalement', etape: 'cloture', statut: 'cloture', priorite: 'basse', attentionRequise: false, agent: '', nom: 'Sanoh', prenom: 'Elhadj', telephone: '034 00 000 12', adresse: 'Rue TA-077, Taouyah', quartier: 'Taouyah', arrondissement: 'Arrondissement 1', dateEntree: '2026-08-21' },
];

export const DOSSIERS_MOCK: Dossier[] = SEEDS.map((s) => ({
  id: s.id,
  reference: s.reference,
  infos: {
    numero: s.reference,
    dateEntree: s.dateEntree,
    referenceArrivee: '',
    referenceEtude: '',
    dateEtude: '',
    provenance: '',
    nature: s.nature,
  },
  contrevenant: {
    nom: s.nom,
    prenom: s.prenom,
    telephone: s.telephone,
    adresse: s.adresse,
    observations: '',
  },
  localisation: {
    adresse: s.adresse,
    quartier: s.quartier,
    arrondissement: s.arrondissement,
    coordX: '',
    coordY: '',
    latitude: '',
    longitude: '',
    description: '',
  },
  complements: {
    objet: s.objet,
    emplacement: '',
    dossierRelatif: '',
    observationsGenerales: '',
  },
  type: s.type,
  service: s.service,
  etape: s.etape,
  statut: s.statut,
  priorite: s.priorite,
  attentionRequise: s.attentionRequise,
  motifAttention: s.motifAttention ?? '',
  agent: s.agent,
  historique: [{ date: s.dateEntree, libelle: 'Signalement enregistré' }],
}));

export const MOUVEMENTS_MOCK: MouvementDossier[] = [
  { id: 'mv-1', date: '2026-10-08', dossierId: '1', reference: 'DU-2026-0001', titre: 'Construction R+1 sans permis à Kipe', de: 'SCAD', vers: 'DU', motif: 'Bornage joint, retour pour constat', auteur: 'Agent S. Camara' },
  { id: 'mv-2', date: '2026-10-07', dossierId: '10', reference: 'DU-2026-0010', titre: 'Réhabilitation école sans avis technique', de: 'DU', vers: 'DIS', motif: 'Avis technique demandé', auteur: 'Agent K. Diallo' },
  { id: 'mv-3', date: '2026-10-06', dossierId: '9', reference: 'DU-2026-0009', titre: 'Fondation sans implantation bornée', de: 'DU', vers: 'SCAD', motif: 'Bornage contradictoire à organiser', auteur: 'Agent K. Diallo' },
  { id: 'mv-4', date: '2026-10-04', dossierId: '7', reference: 'DU-2026-0007', titre: 'Étage supplémentaire sans permis', de: 'DU', vers: 'DIS', motif: 'Vérification de la structure', auteur: 'Agent M. Sow' },
  { id: 'mv-5', date: '2026-10-02', dossierId: '3', reference: 'DU-2026-0003', titre: 'Occupation du domaine public au marché', de: 'DIS', vers: 'DU', motif: 'Retour après avis', auteur: 'Agent M. Sow' },
];
