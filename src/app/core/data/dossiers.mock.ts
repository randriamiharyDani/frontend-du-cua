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

/**
 * Valeurs du canevas de suivi (fichier CANEVAS_MOUVEMENT_PL_DOL_SIGNALEMENT.xlsx)
 * rattachées à chaque dossier de démonstration. Les colonnes vides dans le
 * fichier source restent vides (idem_ETUDE, DATE_ETUDE, OBS, DATE_SCELLAGE).
 */
interface CanevasSeed {
  referenceEtude: string;
  idemEtude: string;
  dateEtude: string;
  referenceArrivee: string;
  provenance: string;
  coordX: string;
  coordY: string;
  localisation: string;
  emplacement: string;
  dossierRelatif: string;
  observationsGenerales: string;
  refArrete: string;
  dateArrete: string;
  objetArrete: string;
  dateScellage: string;
  dateDemolOuEnlevement: string;
}

const CANEVAS_VIDE: CanevasSeed = {
  referenceEtude: '',
  idemEtude: '',
  dateEtude: '',
  referenceArrivee: '',
  provenance: '',
  coordX: '',
  coordY: '',
  localisation: '',
  emplacement: '',
  dossierRelatif: '',
  observationsGenerales: '',
  refArrete: '',
  dateArrete: '',
  objetArrete: '',
  dateScellage: '',
  dateDemolOuEnlevement: '',
};

/** Correspondance dossier (id) → valeurs du canevas Excel (ordre des lignes source). */
const CANEVAS_SEED: Record<string, Partial<CanevasSeed>> = {
  '1': {
    referenceEtude: '023 SCADol/26',
    referenceArrivee: '1036-CUA/DIS.25 du 24/12/2025',
    provenance: 'DIS (N° V.S079.72)',
    coordX: '513446',
    coordY: '798110',
    localisation: 'OK',
    emplacement: 'Manarintsoa - 1er Arrdt',
    refArrete: '131-CUA/CAB.26',
    dateArrete: '2026-02-06',
    objetArrete: "Interruption des travaux d'extension illicite d'une maison",
  },
  '2': {
    referenceEtude: '021 SCADol/26',
    referenceArrivee: '006-CUA/DIS.26 du 06/01/2026',
    provenance: 'DIS (N° V.P073.19)',
    coordX: '511954',
    coordY: '795631',
    localisation: 'OK',
    emplacement: 'Anosizato Atsinanana I - 4è Arrdt',
    dossierRelatif: 'Sieur RAJAONA Chrisna Todisoa rep/par Sieur RAKOTONDRAVAO Bien Aimé',
    refArrete: '132-CUA/CAB.26',
    dateArrete: '2026-02-06',
    objetArrete:
      'Interruption des travaux de construction illicites des deux boxes sur pilotis',
  },
  '3': {
    referenceArrivee: '093-CUA/DIS.26 du 29/01/2026',
    provenance: 'DIS (N° V.P009.38)',
    coordX: '518076',
    coordY: '800291',
    localisation: 'OK',
    emplacement: 'Ankadindramamy - 5è Arrdt',
    dossierRelatif: 'AM 463-CUA/CAB.25 du 23/07/2025 (PC)',
  },
  '4': {
    referenceArrivee: '075-CUA/DIS.26 du 27/01/2026',
    provenance: 'DIS (N° V.P123.35)',
    coordX: '519470',
    coordY: '798470',
    localisation: 'OK',
    emplacement: 'Ambatomaro Antsobolo - 5e Arrdt',
  },
  '5': {
    referenceArrivee: '043-CUA/DIS.26 du 19/01/2026',
    provenance: 'DIS (N° III.S001.79)',
    coordX: '516663',
    coordY: '799091',
    localisation: 'OK',
    emplacement: 'Ambohitrakely - 3e Arrdt',
  },
  '6': {
    referenceEtude: '037 SCADol/26',
    referenceArrivee: '1023-CUA/DIS.25 du 22/12/2025',
    provenance: 'DIS (N° I.S077.72)',
    coordX: '512596',
    coordY: '799856',
    localisation: 'OK',
    emplacement: 'Ankasina - 1er Arrdt',
    refArrete: '153-CUA/CAB.26',
    dateArrete: '2026-02-06',
    objetArrete: "Interruption des travaux de construction illicite d'une maison R+1",
  },
  '7': {
    referenceArrivee: '1024-CUA/DIS.25 du 22/12/2025',
    provenance: 'DIS (N° )',
    coordX: '512725',
    coordY: '799726',
    localisation: 'OK',
    emplacement: 'Ankasina - 1er Arrdt',
  },
  '8': {
    referenceArrivee: '915-CUA/DIS.25 du 19/11/2025',
    provenance: 'DIS (N° I.P109.43)',
    coordX: '511117',
    coordY: '803320',
    localisation: 'OK',
    emplacement: 'Anosisoa Ambohimanarina - 6e Arrdt',
  },
  '9': {
    referenceEtude: '141 SCADol/26 - 042 SCADol/26',
    referenceArrivee: '057-CUA/DIS.26 du 29/01/2026',
    provenance: 'DIS (N° A.022/26)',
    coordX: '510744',
    coordY: '803384',
    localisation: 'OK',
    emplacement: 'Près Lot IVH 9 BB Ambodimita - 6e Arrdt',
    refArrete: '115-CUA/CAB.26',
    dateArrete: '2026-02-05',
    objetArrete:
      "Interruption des travaux de construction illicite d'une fouille pour fondation",
  },
  '10': {
    referenceArrivee: '1039-CUA/DIS.25 du 30/12/2025',
    provenance: 'DIS (N° I.P111.44)',
    coordX: '512785',
    coordY: '798410',
    localisation: 'OK',
    emplacement: 'Antetezanafovoany I - 1er Arrdt',
  },
  '11': {
    referenceArrivee: '087-CUA/DIS.26 du 06/02/2026',
    provenance: 'DIS (N° II.P010.30)',
    coordX: '517698',
    coordY: '797176',
    localisation: 'OK',
    emplacement: 'Ankatso-Andohanimandroseza - 2e Arrdt',
    dossierRelatif: 'DAME RAHARISON Léonique',
    refArrete: 'AM 200-CUA/CAB.26',
    dateDemolOuEnlevement: '2026-04-24',
  },
  '12': {
    referenceArrivee: '086-CUA/DIS.26 du 06/02/2026',
    provenance: 'DIS (N° IV.P004.22)',
    coordX: '514832',
    coordY: '796304',
    localisation: 'OK',
    emplacement: 'TSARAFARITZA TSIMBAZAZA- 4e Arrdt',
  },
};

const SEEDS: DossierSeed[] = [
  { id: '1', reference: 'DU-2026-0001', objet: 'Construction R+1 sans permis à Kipe', type: 'construction_sans_permis', service: 'DU', nature: 'plainte', etape: 'constat', statut: 'signale', priorite: 'haute', attentionRequise: true, motifAttention: 'Construction active à constater sous 48 h.', agent: 'Agent K. Diallo', nom: 'Bah', prenom: 'Mamadou', telephone: '034 00 000 01', adresse: 'Rue KA-012, Kipe', quartier: 'Kipe', arrondissement: 'Arrondissement 1', dateEntree: '2026-10-02' },
  { id: '2', reference: 'DU-2026-0002', objet: 'Extension non déclarée à Nongo', type: 'extension_illegale', service: 'SCAD', nature: 'signalement', etape: 'instruction', statut: 'en_verification', priorite: 'moyenne', attentionRequise: false, agent: 'Agent S. Camara', nom: 'Diallo', prenom: 'Awa', telephone: '034 00 000 02', adresse: 'Rue NO-214, Nongo', quartier: 'Nongo', arrondissement: 'Arrondissement 2', dateEntree: '2026-09-29' },
  { id: '3', reference: 'DU-2026-0003', objet: 'Occupation du domaine public au marché', type: 'occupation_illegale', service: 'DU', nature: 'ratissage', etape: 'mise_en_demeure', statut: 'mise_en_demeure', priorite: 'haute', attentionRequise: true, motifAttention: 'Mise en demeure : échéance le 10/10/2026.', agent: 'Agent K. Diallo', nom: 'Sy', prenom: 'Fatoumata', telephone: '034 00 000 03', adresse: 'Avenue du marché, Madina', quartier: 'Madina', arrondissement: 'Arrondissement 3', dateEntree: '2026-09-21' },
  { id: '4', reference: 'DU-2026-0004', objet: 'Dalle non conforme au plan approuvé', type: 'non_conformite_permis', service: 'DU', nature: 'signalement', etape: 'regularisation', statut: 'en_regularisation', priorite: 'moyenne', attentionRequise: false, agent: 'Agent M. Sow', nom: 'Camara', prenom: 'Ibrahima', telephone: '034 00 000 04', adresse: 'Rue CO-087, Coleah', quartier: 'Coleah', arrondissement: 'Arrondissement 4', dateEntree: '2026-09-16' },
  { id: '5', reference: 'DU-2026-0005', objet: 'Garage transformé en boutique', type: 'changement_usage', service: 'DU', nature: 'plainte', etape: 'cloture', statut: 'regularise', priorite: 'basse', attentionRequise: false, agent: 'Agent S. Camara', nom: 'Condé', prenom: 'Mariam', telephone: '034 00 000 05', adresse: 'Rue HE-033, Heremakono', quartier: 'Heremakono', arrondissement: 'Arrondissement 5', dateEntree: '2026-09-11' },
  { id: '6', reference: 'DU-2026-0006', objet: 'Mur de clôture sur alignement', type: 'autre', service: 'SCAD', nature: 'ratissage', etape: 'cloture', statut: 'cloture', priorite: 'basse', attentionRequise: false, agent: '', nom: 'Sow', prenom: 'Ousmane', telephone: '034 00 000 06', adresse: 'Rue KI-101, Kipe', quartier: 'Kipe', arrondissement: 'Arrondissement 1', dateEntree: '2026-09-06' },
  { id: '7', reference: 'DU-2026-0007', objet: 'Étage supplémentaire sans permis', type: 'construction_sans_permis', service: 'DIS', nature: 'signalement', etape: 'instruction', statut: 'en_verification', priorite: 'haute', attentionRequise: true, motifAttention: 'Plan de structure à réclamer.', agent: 'Agent K. Diallo', nom: 'Barry', prenom: 'Aïcha', telephone: '034 00 000 07', adresse: 'Rue MA-055, Matam', quartier: 'Matam', arrondissement: 'Arrondissement 3', dateEntree: '2026-10-04' },
  { id: '8', reference: 'DU-2026-0008', objet: 'Hangar métallique en zone habitation', type: 'occupation_illegale', service: 'DU', nature: 'plainte', etape: 'constat', statut: 'signale', priorite: 'moyenne', attentionRequise: false, agent: '', nom: 'Touré', prenom: 'Sékou', telephone: '034 00 000 08', adresse: 'Rue SO-009, Sonfonia', quartier: 'Sonfonia', arrondissement: 'Arrondissement 2', dateEntree: '2026-09-23' },
  { id: '9', reference: 'DU-2026-0009', objet: 'Fondation sans implantation bornée', type: 'construction_sans_permis', service: 'SCAD', nature: 'ratissage', etape: 'constat', statut: 'signale', priorite: 'haute', attentionRequise: true, motifAttention: 'Bornage contradictoire à organiser.', agent: 'Agent S. Camara', nom: 'Soumah', prenom: 'Naby', telephone: '034 00 000 09', adresse: 'Rue SI-118, Simbaya', quartier: 'Simbaya', arrondissement: 'Arrondissement 4', dateEntree: '2026-10-06' },
  { id: '10', reference: 'DU-2026-0010', objet: 'Réhabilitation école sans avis technique', type: 'non_conformite_permis', service: 'DIS', nature: 'signalement', etape: 'instruction', statut: 'en_verification', priorite: 'moyenne', attentionRequise: false, agent: 'Agent M. Sow', nom: 'Commune de Ratoma', prenom: '', telephone: '034 00 000 10', adresse: 'Rue ECO-02, Ratoma', quartier: 'Ratoma', arrondissement: 'Arrondissement 5', dateEntree: '2026-10-07' },
  { id: '11', reference: 'DU-2026-0011', objet: 'Taxe de régularisation soldée', type: 'changement_usage', service: 'DU', nature: 'plainte', etape: 'cloture', statut: 'regularise', priorite: 'basse', attentionRequise: false, agent: 'Agent K. Diallo', nom: 'Koné', prenom: 'Kadiatou', telephone: '034 00 000 11', adresse: 'Rue CO-210, Coleah', quartier: 'Coleah', arrondissement: 'Arrondissement 4', dateEntree: '2026-08-29' },
  { id: '12', reference: 'DU-2026-0012', objet: 'Clôture provisoire non démontée', type: 'occupation_illegale', service: 'DIS', nature: 'signalement', etape: 'cloture', statut: 'cloture', priorite: 'basse', attentionRequise: false, agent: '', nom: 'Sanoh', prenom: 'Elhadj', telephone: '034 00 000 12', adresse: 'Rue TA-077, Taouyah', quartier: 'Taouyah', arrondissement: 'Arrondissement 1', dateEntree: '2026-08-21' },
];

export const DOSSIERS_MOCK: Dossier[] = SEEDS.map((s) => {
  const c = { ...CANEVAS_VIDE, ...CANEVAS_SEED[s.id] };
  return {
    id: s.id,
    reference: s.reference,
    infos: {
      numero: s.reference,
      dateEntree: s.dateEntree,
      referenceArrivee: c.referenceArrivee,
      referenceEtude: c.referenceEtude,
      idemEtude: c.idemEtude,
      dateEtude: c.dateEtude,
      provenance: c.provenance,
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
      localisation: c.localisation,
      quartier: s.quartier,
      arrondissement: s.arrondissement,
      coordX: c.coordX,
      coordY: c.coordY,
      latitude: '',
      longitude: '',
      description: '',
    },
    complements: {
      objet: s.objet,
      emplacement: c.emplacement,
      dossierRelatif: c.dossierRelatif,
      observationsGenerales: c.observationsGenerales,
    },
    arretes: {
      refArrete: c.refArrete,
      dateArrete: c.dateArrete,
      objetArrete: c.objetArrete,
      dateScellage: c.dateScellage,
      dateDemolOuEnlevement: c.dateDemolOuEnlevement,
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
  };
});

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
  { id: 'doc-1', dossierId: '1', nom: 'Courrier de plainte.pdf', type: 'plainte_signalement', reference: 'PL-2026-0012', dateDepot: '2026-10-01', observations: 'Plainte d’un riverain pour construction sans permis.', taille: '210 Ko', deposePar: 'Bureau d’ordre' },
  { id: 'doc-2', dossierId: '1', nom: 'Rapport de constat.pdf', type: 'rapport_descente', reference: 'RD-2026-0031', dateDepot: '2026-10-02', observations: 'Descente sur site, constat de la construction R+1.', taille: '820 Ko', deposePar: 'Agent K. Diallo' },
  { id: 'doc-3', dossierId: '1', nom: 'Avertissement préalable.pdf', type: 'avertissement', reference: 'AV-2026-0058', dateDepot: '2026-10-03', observations: 'Avertissement remis au contrevenant.', taille: '190 Ko', deposePar: 'Agent K. Diallo' },
  { id: 'doc-4', dossierId: '2', nom: 'Plan cadastral.pdf', type: 'document_etude', reference: 'ET-2026-0044', dateDepot: '2026-09-30', taille: '1,1 Mo', deposePar: 'Service du Cadastre' },
  { id: 'doc-5', dossierId: '3', nom: 'Arrêté interruptif n°A-2026-07.pdf', type: 'arrete_interruptif', reference: 'AI-2026-0007', dateDepot: '2026-09-22', observations: 'Arrêt des travaux d’occupation du domaine public.', taille: '260 Ko', deposePar: 'Agent K. Diallo' },
  { id: 'doc-6', dossierId: '3', nom: 'Lettre de notification.pdf', type: 'lettre_notification', reference: 'LN-2026-0021', dateDepot: '2026-09-23', observations: 'Notification de l’arrêté à l’intéressé.', taille: '150 Ko', deposePar: 'Agent S. Camara' },
  { id: 'doc-7', dossierId: '4', nom: 'Rapport technique DIS.pdf', type: 'rapport_descente', reference: 'RD-2026-0027', dateDepot: '2026-09-25', taille: '960 Ko', deposePar: 'Agent M. Sow' },
  { id: 'doc-8', dossierId: '5', nom: 'Dossier de régularisation.pdf', type: 'document_regularisation', reference: 'RG-2026-0014', dateDepot: '2026-09-19', observations: 'Pièces de régularisation transmises.', taille: '1,3 Mo', deposePar: 'Agent S. Camara' },
  { id: 'doc-9', dossierId: '6', nom: 'Mise en demeure – alignement.pdf', type: 'avertissement', reference: 'AV-2026-0052', dateDepot: '2026-09-15', observations: 'Alignement non conforme au plan d’urbanisme.', taille: '200 Ko', deposePar: 'Agent S. Camara' },
  { id: 'doc-10', dossierId: '7', nom: 'Étude de structure (à réclamer).pdf', type: 'document_etude', reference: 'ET-2026-0039', dateDepot: '2026-10-04', observations: 'Étude technique manquante, à réclamer au pétitionnaire.', taille: '—', deposePar: 'Agent K. Diallo' },
  { id: 'doc-11', dossierId: '8', nom: 'Procès-verbal de scellage.pdf', type: 'pv_scellage', reference: 'PV-2026-0009', dateDepot: '2026-09-11', observations: 'Scellés apposés sur le hangar métallique.', taille: '540 Ko', deposePar: 'Agent S. Camara' },
  { id: 'doc-12', dossierId: '9', nom: 'Procès-verbal de bornage.pdf', type: 'rapport_descente', reference: 'RD-2026-0029', dateDepot: '2026-10-06', taille: '640 Ko', deposePar: 'Service du Cadastre' },
  { id: 'doc-13', dossierId: '10', nom: 'Demande d’avis technique.pdf', type: 'document_etude', reference: 'ET-2026-0041', dateDepot: '2026-10-07', observations: 'Avis technique demandé pour la réhabilitation de l’école.', taille: '230 Ko', deposePar: 'Agent K. Diallo' },
  { id: 'doc-14', dossierId: '11', nom: 'Quittance de régularisation.pdf', type: 'document_regularisation', reference: 'RG-2026-0018', dateDepot: '2026-08-29', observations: 'Taxe de régularisation soldée.', taille: '175 Ko', deposePar: 'Agent M. Sow' },
  { id: 'doc-15', dossierId: '12', nom: 'Constat de clôture provisoire.pdf', type: 'document_demolition', reference: 'DM-2026-0004', dateDepot: '2026-08-21', observations: 'Clôture provisoire non démontée après travaux.', taille: '480 Ko', deposePar: 'Agent M. Sow' },
  { id: 'doc-16', dossierId: '12', nom: 'Arrêté d’ouverture des scellés.pdf', type: 'arrete_scelles', reference: 'AS-2026-0003', dateDepot: '2026-08-24', observations: 'Levée des scellés autorisée.', taille: '240 Ko', deposePar: 'Agent M. Sow' },
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
