import {
  EtapeDossier,
  NatureIntervention,
  ServiceDossier,
  StatutDossier,
  SuiteDossier,
} from '../models/dossier.model';

/**
 * Miroir UX du circuit « backend-api-du » (10 étapes).
 *
 * Réécriture du script workflow-dossier.ts sur la machine à états réellement
 * déployée : `backend-api-du/app/Workflow/DossierWorkflow.php`. Ce module est
 * une SOURCE DE VÉRITÉ SECONDAIRE : il sert à contrôler/former l'interface
 * AVANT l'envoi (champs obligatoires, formats, ordre, rôle) — le serveur
 * Laravel reste le seul juge au moment du POST.
 *
 * Écarts assumés avec la spec 8 étapes d'origine : circuit à 10 étapes,
 * transitions agrégées, branche unique (amende ⇒ saut des étapes 7-8),
 * pas de branche LETTRE, pas de rôle INSPECTEUR (≈ agent + service DIS).
 */

export type OrdreEtape = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type CodeTransition =
  | 'reception-enregistrement'
  | 'descente-terrain'
  | 'avertissement-rapport-descente'
  | 'arrete-interruptif'
  | 'notification-arrete'
  | 'amende-ou-etude'
  | 'scellage-demolition'
  | 'execution-compte-rendu'
  | 'attente-regularisation'
  | 'leve-scelles';

/** Codes déclenchables via un endpoint (`DossierWorkflow::endpointCodes`). */
export type CodeEndpoint = Exclude<CodeTransition, 'reception-enregistrement'>;

export const CODES_ENDPOINT: readonly CodeEndpoint[] = [
  'descente-terrain',
  'avertissement-rapport-descente',
  'arrete-interruptif',
  'notification-arrete',
  'amende-ou-etude',
  'scellage-demolition',
  'execution-compte-rendu',
  'attente-regularisation',
  'leve-scelles',
];

export interface DefinitionEtape {
  ordre: OrdreEtape;
  code: CodeTransition;
  label: string;
  /** Service porteur de l'étape (indicatif côté serveur, exact pour l'affichage). */
  service: ServiceDossier;
  etape: EtapeDossier;
  statut: StatutDossier;
  /** Réservée à l'administrateur système (étape 7 uniquement). */
  adminSeul: boolean;
}

/** Circuit métier, calqué sur `DossierWorkflow::STEPS`. */
export const ETAPES_CIRCUIT: readonly DefinitionEtape[] = [
  { ordre: 1, code: 'reception-enregistrement', label: 'Réception et enregistrement', service: 'DU', etape: 'constat', statut: 'en_attente', adminSeul: false },
  { ordre: 2, code: 'descente-terrain', label: 'Descente sur le terrain', service: 'DIS', etape: 'constat', statut: 'en_cours', adminSeul: false },
  { ordre: 3, code: 'avertissement-rapport-descente', label: 'Avertissement et rapport de descente', service: 'DIS', etape: 'mise_en_demeure', statut: 'en_cours', adminSeul: false },
  { ordre: 4, code: 'arrete-interruptif', label: 'Arrêté interruptif, signature du PDS et ampliation', service: 'SCAD', etape: 'instruction', statut: 'en_cours', adminSeul: false },
  { ordre: 5, code: 'notification-arrete', label: "Notification de l'arrêté", service: 'DIS', etape: 'mise_en_demeure', statut: 'en_cours', adminSeul: false },
  { ordre: 6, code: 'amende-ou-etude', label: "Amende ou orientation vers l'étude", service: 'SCAD', etape: 'instruction', statut: 'en_cours', adminSeul: false },
  { ordre: 7, code: 'scellage-demolition', label: 'Scellage ou démolition selon décision', service: 'DIS', etape: 'mise_en_demeure', statut: 'en_cours', adminSeul: true },
  { ordre: 8, code: 'execution-compte-rendu', label: 'Exécution et compte rendu scellage/démolition', service: 'DIS', etape: 'instruction', statut: 'en_cours', adminSeul: false },
  { ordre: 9, code: 'attente-regularisation', label: 'Attente de régularisation', service: 'SCAD', etape: 'regularisation', statut: 'en_attente', adminSeul: false },
  { ordre: 10, code: 'leve-scelles', label: 'Ouverture ou levée des scellés', service: 'DIS', etape: 'cloture', statut: 'cloture', adminSeul: false },
];

const ETAPES_PAR_CODE = new Map<CodeTransition, DefinitionEtape>(
  ETAPES_CIRCUIT.map((e) => [e.code, e]),
);

/** État minimal du dossier dont le miroir a besoin. */
export interface EtatCircuit {
  /** Ordre de l'étape courante (`WorkflowState.current_step.order`). */
  ordre: OrdreEtape;
  /** `dossier.suite_dossier` persisté. */
  suite: SuiteDossier | '';
  /** `dossier.nature_intervention` persistée. */
  natureIntervention: NatureIntervention | '';
  /** `dossier.ref_arrete_ouverture` persistée. */
  refArreteOuverture: string;
}

/** Rôle de l'agent connecté (le serveur impose `admin_systeme` à l'étape 7). */
export type RoleActeur = 'admin_systeme' | 'administrateur' | 'agent';

export interface ContexteActeur {
  role?: RoleActeur;
  service?: ServiceDossier | null;
}

export type CodeErreurWorkflow =
  | 'ETAPE_INCORRECTE'
  | 'CHAMP_MANQUANT'
  | 'VALEUR_INVALIDE'
  | 'ADMIN_REQUIS';

export interface ErreurWorkflow {
  code: CodeErreurWorkflow;
  message: string;
  champ?: string;
}

export type ResultatValidation =
  | { valide: true; erreurs: [] }
  | { valide: false; erreurs: ErreurWorkflow[] };

/* ------------------------------------------------------------------ */
/* Consultation du circuit                                             */
/* ------------------------------------------------------------------ */

export function etapeCourante(etat: EtatCircuit): DefinitionEtape {
  return ETAPES_CIRCUIT[etat.ordre - 1];
}

export function etapeParCode(code: CodeTransition): DefinitionEtape {
  const def = ETAPES_PAR_CODE.get(code);
  if (!def) throw new Error(`Étape inconnue : ${code}`);
  return def;
}

/** Vrai si l'ordre désigne une vraie transition (étapes 2 à 10). */
export function estTransition(code: string): code is CodeEndpoint {
  return CODES_ENDPOINT.includes(code as CodeEndpoint);
}

/**
 * Étape atteignable depuis l'état courant.
 *
 * CAS A : à l'étape 6, une suite AMENDE saute les étapes 7 et 8
 * (aucune intervention terrain) pour aller à l'étape 9.
 * Retourne `null` lorsque le circuit est terminé (étape 10 franchie).
 */
export function transitionSuivante(etat: EtatCircuit): DefinitionEtape | null {
  if (etat.ordre >= 10) return null;
  if (etat.ordre === 6 && etat.suite === 'amende') {
    return etapeParCode('attente-regularisation');
  }
  return ETAPES_CIRCUIT[etat.ordre];
}

/** Transitions disponibles depuis l'état courant (au plus une). */
export function transitionsDisponibles(etat: EtatCircuit): DefinitionEtape[] {
  const suivante = transitionSuivante(etat);
  return suivante ? [suivante] : [];
}

/** 0-100 : avancement du circuit (étape 1 = 0 %, étape 10 atteinte = 100 %). */
export function progression(etat: EtatCircuit): number {
  return Math.round(((etat.ordre - 1) / 9) * 100);
}

/**
 * Services admis pour un transfert (`DossierWorkflow::allowedTransferTargets`) :
 * service courant ∪ service de la prochaine étape (si différent) ; circuit
 * terminé depuis DIS ⇒ SCAD reste admis (clôture).
 */
export function ciblesTransfert(etat: EtatCircuit, serviceCourant: ServiceDossier): ServiceDossier[] {
  const cibles: ServiceDossier[] = [serviceCourant];
  const suivante = transitionSuivante(etat);
  const cible = suivante ? suivante.service : serviceCourant === 'DIS' ? 'SCAD' : null;
  if (cible && !cibles.includes(cible)) cibles.push(cible);
  return cibles;
}

/* ------------------------------------------------------------------ */
/* Exigences métiers (messages serveur)                                */
/* ------------------------------------------------------------------ */

const MESSAGE_NATURE = "La nature de l'intervention (scellage ou démolition) doit être enregistrée.";
const MESSAGE_ARRETE_OUVERTURE = "Un arrêté d'ouverture valide est requis avant la levée des scellés.";
const MESSAGE_SUITE = 'La suite du dossier (amende ou étude) doit être choisie.';
const MESSAGE_ADMIN = 'Accès refusé : cette transition est réservée à l’administrateur système.';
const messageEtape = (code: string): string => `Transition « ${code} » impossible depuis l'état actuel du dossier.`;

const natureValeurs: readonly NatureIntervention[] = ['scellage', 'demolition'];
const suiteValeurs: readonly SuiteDossier[] = ['amende', 'etude'];

/**
 * Exigences métiers affichables (miroir de `transitionRequirements`) :
 * messages bloquants pour la transition demandée, données du dossier + payload.
 */
export function exigences(
  etat: EtatCircuit,
  code: string,
  payload: Record<string, unknown> = {},
): string[] {
  const nature = ((payload['nature_intervention'] ?? etat.natureIntervention) as string) || null;
  const refOuverture = ((payload['ref_arrete_ouverture'] ?? etat.refArreteOuverture) as string) || '';

  switch (code) {
    case 'amende-ou-etude':
      return ((payload['suite_dossier'] as string) || etat.suite) ? [] : [MESSAGE_SUITE];
    case 'scellage-demolition':
      return nature === null ? [MESSAGE_NATURE] : [];
    case 'leve-scelles':
      return etat.natureIntervention === 'scellage' && refOuverture === '' ? [MESSAGE_ARRETE_OUVERTURE] : [];
    default:
      return [];
  }
}

/* ------------------------------------------------------------------ */
/* Validation complète avant envoi                                     */
/* ------------------------------------------------------------------ */

const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;

function dateIsoValide(valeur: unknown): boolean {
  if (typeof valeur !== 'string' || !RE_DATE.test(valeur)) return false;
  const [a, m, j] = valeur.split('-').map(Number);
  const d = new Date(Date.UTC(a, m - 1, j));
  return d.getUTCFullYear() === a && d.getUTCMonth() === m - 1 && d.getUTCDate() === j;
}

/**
 * Contrôle local complet d'une transition : étape, rôle, exigences métiers,
 * formats des champs fournis. Reproduit les refus serveur (404/422/403)
 * afin de bloquer l'interface avant l'envoi.
 */
export function validerTransition(
  etat: EtatCircuit,
  code: string,
  payload: Record<string, unknown> = {},
  contexte: ContexteActeur = {},
): ResultatValidation {
  const erreurs: ErreurWorkflow[] = [];

  // 1. Progression stricte du circuit (422 serveur).
  const suivante = transitionSuivante(etat);
  if (code !== 'reception-enregistrement' && (!suivante || suivante.code !== code)) {
    erreurs.push({ code: 'ETAPE_INCORRECTE', message: messageEtape(code) });
    return { valide: false, erreurs };
  }

  // 2. Étape réservée à l'administrateur système (403 serveur).
  const def = ETAPES_PAR_CODE.get(code as CodeTransition);
  if (def?.adminSeul && contexte.role !== undefined && contexte.role !== 'admin_systeme') {
    erreurs.push({ code: 'ADMIN_REQUIS', message: MESSAGE_ADMIN });
  }

  // 3. Exigences métiers (422 serveur).
  for (const message of exigences(etat, code, payload)) {
    const champ =
      message === MESSAGE_SUITE
        ? 'suite_dossier'
        : message === MESSAGE_NATURE
          ? 'nature_intervention'
          : 'ref_arrete_ouverture';
    erreurs.push({ code: 'CHAMP_MANQUANT', message, champ });
  }

  // 4. Formats et listes des champs fournis (validation Laravel).
  const suite = payload['suite_dossier'];
  if (suite !== undefined && suite !== null && suite !== '' && !suiteValeurs.includes(suite as SuiteDossier)) {
    erreurs.push({ code: 'VALEUR_INVALIDE', message: `Suite du dossier invalide : « ${String(suite)} » (attendu ${suiteValeurs.join(' | ')}).`, champ: 'suite_dossier' });
  }

  const nature = payload['nature_intervention'];
  if (nature !== undefined && nature !== null && nature !== '' && !natureValeurs.includes(nature as NatureIntervention)) {
    erreurs.push({ code: 'VALEUR_INVALIDE', message: `Nature d'intervention invalide : « ${String(nature)} » (attendu ${natureValeurs.join(' | ')}).`, champ: 'nature_intervention' });
  }

  const montant = payload['montant_amende'];
  if (montant !== undefined && montant !== null && montant !== '') {
    const nombre = typeof montant === 'number' ? montant : Number(String(montant).replace(',', '.'));
    if (!Number.isFinite(nombre) || nombre < 0) {
      erreurs.push({ code: 'VALEUR_INVALIDE', message: `Montant d'amende invalide : « ${String(montant)} ».`, champ: 'montant_amende' });
    }
  }

  for (const champ of [
    'date_notification',
    'date_regularisation',
    'date_arrete_ouverture',
    'date_ouverture',
    'date_arrete',
    'date_scellage',
    'date_demol_ou_enlevement',
  ]) {
    const valeur = payload[champ];
    if (valeur !== undefined && valeur !== null && valeur !== '' && !dateIsoValide(valeur)) {
      erreurs.push({ code: 'VALEUR_INVALIDE', message: `Date invalide pour ${champ} : format AAAA-MM-JJ attendu.`, champ });
    }
  }

  const refOuverture = payload['ref_arrete_ouverture'];
  if (typeof refOuverture === 'string' && refOuverture.length > 255) {
    erreurs.push({ code: 'VALEUR_INVALIDE', message: "Référence de l'arrêté d'ouverture trop longue (255 caractères max).", champ: 'ref_arrete_ouverture' });
  }

  return erreurs.length === 0 ? { valide: true, erreurs: [] } : { valide: false, erreurs };
}

/* ------------------------------------------------------------------ */
/* Projection après transition                                         */
/* ------------------------------------------------------------------ */

export interface EtatApres {
  ordre: OrdreEtape;
  etape: EtapeDossier;
  statut: StatutDossier;
  service: ServiceDossier;
  termine: boolean;
}

/**
 * État projeté après application d'une transition valide
 * (miroir de `apply()` + `statutFor()`).
 *
 * Le CAS A (amende à l'étape 6) place le dossier `en_attente`.
 */
export function etatApres(
  etat: EtatCircuit,
  code: CodeTransition,
  payload: Record<string, unknown> = {},
): EtatApres {
  const cible = etapeParCode(code);
  const suite =
    (payload['suite_dossier'] as SuiteDossier | undefined) ?? etat.suite;
  const statut: StatutDossier = cible.ordre === 6 && suite === 'amende' ? 'en_attente' : cible.statut;
  return {
    ordre: cible.ordre,
    etape: cible.etape,
    statut,
    service: cible.service,
    termine: false,
  };
}

/** État initial à la création (`initialState()` : constat / en_attente, DU). */
export function etatInitial(): Pick<EtatApres, 'etape' | 'statut'> {
  const premiere = ETAPES_CIRCUIT[0];
  return { etape: premiere.etape, statut: premiere.statut };
}
