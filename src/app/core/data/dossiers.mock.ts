import {
  DocumentDossier,
  Dossier,
  EtapeDossier,
  Localisation,
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
  { id: 'mv-1', date: '2026-10-08', dossierId: '1', reference: 'DU-2026-0001', titre: 'Construction R+1 sans permis à Kipe', de: 'SCAD', vers: 'DU', etape: 'constat', action: 'Retour pour constat', referenceDocument: 'BOR-2026-014', motif: 'Bornage joint, retour pour constat', auteur: 'Agent S. Camara' },
  { id: 'mv-2', date: '2026-10-07', dossierId: '10', reference: 'DU-2026-0010', titre: 'Réhabilitation école sans avis technique', de: 'DU', vers: 'DIS', etape: 'instruction', action: 'Demande d’avis technique', referenceDocument: 'DU-2026-0010/AV', motif: 'Avis technique demandé', auteur: 'Agent K. Diallo' },
  { id: 'mv-3', date: '2026-10-06', dossierId: '9', reference: 'DU-2026-0009', titre: 'Fondation sans implantation bornée', de: 'DU', vers: 'SCAD', etape: 'constat', action: 'Demande de bornage', referenceDocument: 'BOR-2026-019', motif: 'Bornage contradictoire à organiser', auteur: 'Agent K. Diallo' },
  { id: 'mv-4', date: '2026-10-04', dossierId: '7', reference: 'DU-2026-0007', titre: 'Étage supplémentaire sans permis', de: 'DU', vers: 'DIS', etape: 'instruction', action: 'Contrôle technique', referenceDocument: '', motif: 'Vérification de la structure', auteur: 'Agent M. Sow' },
  { id: 'mv-5', date: '2026-10-02', dossierId: '3', reference: 'DU-2026-0003', titre: 'Occupation du domaine public au marché', de: 'DIS', vers: 'DU', etape: 'mise_en_demeure', action: 'Retour après avis', referenceDocument: 'AV-DIS-2026-07', motif: 'Retour après avis', auteur: 'Agent M. Sow' },
  { id: 'mv-6', date: '2026-09-30', dossierId: '2', reference: 'DU-2026-0002', titre: 'Extension non déclarée à Nongo', de: 'DU', vers: 'SCAD', etape: 'instruction', action: 'Bornage cadastral', referenceDocument: '', motif: 'Étude du bornage cadastral', auteur: 'Agent S. Camara' },
  { id: 'mv-7', date: '2026-09-25', dossierId: '4', reference: 'DU-2026-0004', titre: 'Dalle non conforme au plan approuvé', de: 'DIS', vers: 'DU', etape: 'regularisation', action: 'Retour après avis technique', referenceDocument: 'AV-DIS-2026-11', motif: 'Retour après avis technique', auteur: 'Agent M. Sow' },
  { id: 'mv-8', date: '2026-09-18', dossierId: '4', reference: 'DU-2026-0004', titre: 'Dalle non conforme au plan approuvé', de: 'DU', vers: 'DIS', etape: 'regularisation', action: 'Demande d’avis technique', referenceDocument: '', motif: 'Transmission pour avis technique', auteur: 'Agent K. Diallo' },
  { id: 'mv-9', date: '2026-09-20', dossierId: '5', reference: 'DU-2026-0005', titre: 'Garage transformé en boutique', de: 'SCAD', vers: 'DU', etape: 'cloture', action: 'Clôture', referenceDocument: '', motif: 'Dossier régularisé, clôture', auteur: 'Agent S. Camara' },
  { id: 'mv-10', date: '2026-09-12', dossierId: '5', reference: 'DU-2026-0005', titre: 'Garage transformé en boutique', de: 'DU', vers: 'SCAD', etape: 'regularisation', action: 'Vérification cadastrale', referenceDocument: '', motif: 'Vérification cadastrale', auteur: 'Agent K. Diallo' },
  { id: 'mv-11', date: '2026-09-08', dossierId: '6', reference: 'DU-2026-0006', titre: 'Mur de clôture sur alignement', de: 'DU', vers: 'SCAD', etape: 'instruction', action: 'Contrôle d’alignement', referenceDocument: '', motif: 'Contrôle d’alignement', auteur: 'Agent S. Camara' },
  { id: 'mv-12', date: '2026-09-24', dossierId: '8', reference: 'DU-2026-0008', titre: 'Hangar métallique en zone habitation', de: 'SCAD', vers: 'DU', etape: 'constat', action: 'Retour après constat', referenceDocument: '', motif: 'Retour après constat sur site', auteur: 'Agent K. Diallo' },
  { id: 'mv-13', date: '2026-08-30', dossierId: '11', reference: 'DU-2026-0011', titre: 'Taxe de régularisation soldée', de: 'DIS', vers: 'DU', etape: 'cloture', action: 'Retour après régularisation', referenceDocument: '', motif: 'Dossier régularisé, retour au DU', auteur: 'Agent K. Diallo' },
  { id: 'mv-14', date: '2026-08-22', dossierId: '12', reference: 'DU-2026-0012', titre: 'Clôture provisoire non démontée', de: 'DU', vers: 'DIS', etape: 'cloture', action: 'Clôture administrative', referenceDocument: '', motif: 'Clôture administrative', auteur: 'Agent M. Sow' },
];

export const DOCUMENTS_MOCK: DocumentDossier[] = [
  { id: 'doc-1', dossierId: '1', nom: 'Rapport de constat.pdf', type: 'rapport', dateDepot: '2026-10-02', taille: '820 Ko', deposePar: 'Agent K. Diallo' },
  { id: 'doc-2', dossierId: '1', nom: 'Photos du site.zip', type: 'photo', dateDepot: '2026-10-02', taille: '3,4 Mo', deposePar: 'Agent K. Diallo' },
  { id: 'doc-3', dossierId: '1', nom: 'Courrier de plainte.pdf', type: 'courrier', dateDepot: '2026-10-01', taille: '210 Ko', deposePar: 'Bureau d’ordre' },
  { id: 'doc-4', dossierId: '2', nom: 'Plan cadastral.pdf', type: 'plan', dateDepot: '2026-09-30', taille: '1,1 Mo', deposePar: 'Service du Cadastre' },
  { id: 'doc-5', dossierId: '3', nom: 'Avis de mise en demeure.pdf', type: 'decision', dateDepot: '2026-09-22', taille: '180 Ko', deposePar: 'Agent K. Diallo' },
  { id: 'doc-6', dossierId: '3', nom: 'Photos occupation.jpg', type: 'photo', dateDepot: '2026-09-21', taille: '540 Ko', deposePar: 'Agent S. Camara' },
  { id: 'doc-7', dossierId: '4', nom: 'Rapport technique DIS.pdf', type: 'rapport', dateDepot: '2026-09-25', taille: '960 Ko', deposePar: 'Agent M. Sow' },
  { id: 'doc-8', dossierId: '7', nom: 'Plan de structure (à réclamer).pdf', type: 'plan', dateDepot: '2026-10-04', taille: '—', deposePar: 'Agent K. Diallo' },
  { id: 'doc-9', dossierId: '9', nom: 'Procès-verbal de bornage.pdf', type: 'rapport', dateDepot: '2026-10-06', taille: '640 Ko', deposePar: 'Service du Cadastre' },
  { id: 'doc-10', dossierId: '10', nom: 'Demande d’avis technique.pdf', type: 'courrier', dateDepot: '2026-10-07', taille: '230 Ko', deposePar: 'Agent K. Diallo' },
];

/**
 * Référentiel de localisations (zones) — données locales de démonstration.
 * Le nombre de dossiers associés est calculé à partir du quartier des dossiers.
 */
export const LOCALISATIONS_MOCK: Localisation[] = [
  { id: 'loc-1', adresse: 'Rue KA-012, Carrefour Kipe', quartier: 'Kipe', arrondissement: 'Arrondissement 1', coordX: '742 118', coordY: '1 058 340', latitude: '9.5654', longitude: '-13.6352' },
  { id: 'loc-2', adresse: 'Rue TA-077, Taouyah Centre', quartier: 'Taouyah', arrondissement: 'Arrondissement 1', coordX: '744 902', coordY: '1 061 220', latitude: '9.5731', longitude: '-13.6290' },
  { id: 'loc-3', adresse: 'Rue NO-214, Nongo Marché', quartier: 'Nongo', arrondissement: 'Arrondissement 2', coordX: '751 340', coordY: '1 070 118', latitude: '9.6012', longitude: '-13.6128' },
  { id: 'loc-4', adresse: 'Rue SO-009, Sonfonia Gare', quartier: 'Sonfonia', arrondissement: 'Arrondissement 2', coordX: '753 002', coordY: '1 083 447', latitude: '9.6380', longitude: '-13.5841' },
  { id: 'loc-5', adresse: 'Avenue du marché, Madina', quartier: 'Madina', arrondissement: 'Arrondissement 3', coordX: '738 660', coordY: '1 063 990', latitude: '9.5820', longitude: '-13.6480' },
  { id: 'loc-6', adresse: 'Rue MA-055, Matam Centre', quartier: 'Matam', arrondissement: 'Arrondissement 3', coordX: '740 015', coordY: '1 061 002', latitude: '9.5740', longitude: '-13.6421' },
  { id: 'loc-7', adresse: 'Rue CO-087, Coleah Carrière', quartier: 'Coleah', arrondissement: 'Arrondissement 4', coordX: '734 512', coordY: '1 060 887', latitude: '9.5690', longitude: '-13.6602' },
  { id: 'loc-8', adresse: 'Rue SI-118, Simbaya 2', quartier: 'Simbaya', arrondissement: 'Arrondissement 4', coordX: '731 240', coordY: '1 058 130', latitude: '9.5598', longitude: '-13.6674' },
  { id: 'loc-9', adresse: 'Rue HE-033, Heremakono', quartier: 'Heremakono', arrondissement: 'Arrondissement 5', coordX: '745 889', coordY: '1 050 776', latitude: '9.5390', longitude: '-13.6250' },
  { id: 'loc-10', adresse: 'Rue ECO-02, Ratoma Village', quartier: 'Ratoma', arrondissement: 'Arrondissement 5', coordX: '748 220', coordY: '1 047 331', latitude: '9.5290', longitude: '-13.6180' },
  { id: 'loc-11', adresse: 'Zone de recensement, Lambanyi', quartier: 'Lambanyi', arrondissement: 'Arrondissement 2', coordX: '749 870', coordY: '1 076 512', latitude: '9.6150', longitude: '-13.6055' },
];
