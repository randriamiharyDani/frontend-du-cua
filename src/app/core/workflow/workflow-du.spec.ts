import { describe, expect, it } from 'vitest';
import {
  ETAPES_CIRCUIT,
  CODES_ENDPOINT,
  EtatCircuit,
  ciblesTransfert,
  etatApres,
  etatInitial,
  etapeCourante,
  etapeParCode,
  estTransition,
  exigences,
  progression,
  transitionSuivante,
  transitionsDisponibles,
  validerTransition,
} from './workflow-du';

const etat = (partial: Partial<EtatCircuit> = {}): EtatCircuit => ({
  ordre: 1,
  suite: '',
  montant: '',
  avisPaiement: '',
  natureIntervention: '',
  refArreteOuverture: '',
  ...partial,
});

describe('workflow-du — table des 10 étapes', () => {
  it('contient exactement 10 étapes ordonnées 1→10', () => {
    expect(ETAPES_CIRCUIT).toHaveLength(10);
    expect(ETAPES_CIRCUIT.map((e) => e.ordre)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('expose 9 codes endpoint (étape 1 = état initial)', () => {
    expect(CODES_ENDPOINT).toHaveLength(9);
    expect(CODES_ENDPOINT[0]).toBe('descente-terrain');
    expect(CODES_ENDPOINT[8]).toBe('leve-scelles');
    expect(estTransition('reception-enregistrement')).toBe(false);
    expect(estTransition('descente-terrain')).toBe(true);
    expect(estTransition('inconnu')).toBe(false);
  });

  it('calque service / etape / statut du backend', () => {
    expect(etatInitial()).toEqual({ etape: 'constat', statut: 'en_attente' });
    expect(etapeCourante(etat({ ordre: 1 })).service).toBe('DU');
    expect(etapeParCode('scellage-demolition')).toMatchObject({
      ordre: 7,
      service: 'DIS',
      etape: 'mise_en_demeure',
      statut: 'en_cours',
      adminSeul: true,
    });
    expect(etapeParCode('leve-scelles')).toMatchObject({
      ordre: 10,
      etape: 'cloture',
      statut: 'cloture',
    });
    expect(ETAPES_CIRCUIT.filter((e) => e.adminSeul).map((e) => e.ordre)).toEqual([7]);
  });
});

describe('workflow-du — transitions disponibles', () => {
  it('ne propose que l’étape suivante (circuit strict)', () => {
    expect(transitionsDisponibles(etat({ ordre: 1 })).map((e) => e.code)).toEqual(['descente-terrain']);
    expect(transitionsDisponibles(etat({ ordre: 4 })).map((e) => e.code)).toEqual(['notification-arrete']);
  });

  it('étape 10 : plus aucune transition (circuit terminé)', () => {
    expect(transitionSuivante(etat({ ordre: 10 }))).toBeNull();
    expect(transitionsDisponibles(etat({ ordre: 10 }))).toHaveLength(0);
  });

  it('CAS A : amende à l’étape 6 saute les étapes 7 et 8 → étape 9', () => {
    const suivante = transitionSuivante(etat({ ordre: 6, suite: 'amende' }));
    expect(suivante?.code).toBe('attente-regularisation');
    expect(suivante?.ordre).toBe(9);
  });

  it('CAS B : étude à l’étape 6 → étape 7', () => {
    expect(transitionSuivante(etat({ ordre: 6, suite: 'etude' }))?.ordre).toBe(7);
    // suite encore indécise → étape 7 par défaut (comme le backend)
    expect(transitionSuivante(etat({ ordre: 6, suite: '' }))?.ordre).toBe(7);
  });
});

describe('workflow-du — progression et transferts', () => {
  it('progression 0→100 %', () => {
    expect(progression(etat({ ordre: 1 }))).toBe(0);
    expect(progression(etat({ ordre: 6 }))).toBe(56);
    expect(progression(etat({ ordre: 10 }))).toBe(100);
  });

  it('cibles de transfert = courant ∪ service de la prochaine étape', () => {
    expect(ciblesTransfert(etat({ ordre: 1 }), 'DU')).toEqual(['DU', 'DIS']);
    expect(ciblesTransfert(etat({ ordre: 3 }), 'DIS')).toEqual(['DIS', 'SCAD']);
    expect(ciblesTransfert(etat({ ordre: 4 }), 'SCAD')).toEqual(['SCAD', 'DIS']);
    // circuit terminé depuis DIS ⇒ SCAD admis (clôture)
    expect(ciblesTransfert(etat({ ordre: 10 }), 'DIS')).toEqual(['DIS', 'SCAD']);
    // circuit terminé depuis SCAD ⇒ aucune destination nouvelle
    expect(ciblesTransfert(etat({ ordre: 10 }), 'SCAD')).toEqual(['SCAD']);
  });
});

describe('workflow-du — validation avant envoi', () => {
  it('refuse une transition hors circuit (422 serveur)', () => {
    const r = validerTransition(etat({ ordre: 3 }), 'descente-terrain');
    expect(r.valide).toBe(false);
    expect(r.erreurs[0]?.code).toBe('ETAPE_INCORRECTE');
  });

  it('étape 7 : refuse un non-administrateur (403 serveur)', () => {
    const base = etat({ ordre: 6, suite: 'etude' });
    const sansRole = validerTransition(base, 'scellage-demolition', { nature_intervention: 'scellage' });
    expect(sansRole.valide).toBe(true); // rôle inconnu : pas de refus local
    const agent = validerTransition(base, 'scellage-demolition', { nature_intervention: 'scellage' }, { role: 'agent' });
    expect(agent.valide).toBe(false);
    expect(agent.erreurs.some((e) => e.code === 'ADMIN_REQUIS')).toBe(true);
    const admin = validerTransition(base, 'scellage-demolition', { nature_intervention: 'scellage' }, { role: 'admin_systeme' });
    expect(admin.valide).toBe(true);
  });

  it('exigence nature_intervention (message serveur)', () => {
    const base = etat({ ordre: 6, suite: 'etude' });
    const vide = validerTransition(base, 'scellage-demolition', {});
    expect(vide.valide).toBe(false);
    expect(vide.erreurs).toContainEqual({
      code: 'CHAMP_MANQUANT',
      message: "La nature de l'intervention (scellage ou démolition) doit être enregistrée.",
      champ: 'nature_intervention',
    });
    // valeur déjà persistée au dossier : exigence satisfaite sans payload
    expect(validerTransition(etat({ ordre: 6, suite: 'etude', natureIntervention: 'demolition' }), 'scellage-demolition', {}).valide).toBe(true);
  });

  it('exigence arrêté d’ouverture pour levée des scellés si scellage', () => {
    const base = etat({ ordre: 9, natureIntervention: 'scellage', refArreteOuverture: '' });
    const sansRef = validerTransition(base, 'leve-scelles', {});
    expect(sansRef.valide).toBe(false);
    expect(sansRef.erreurs[0]?.champ).toBe('ref_arrete_ouverture');
    // référence déjà persistée : OK sans payload
    expect(validerTransition({ ...base, refArreteOuverture: 'ARO-01' }, 'leve-scelles', {}).valide).toBe(true);
    // fournie dans le payload : OK aussi
    expect(validerTransition(base, 'leve-scelles', { ref_arrete_ouverture: 'ARO-01' }).valide).toBe(true);
    // démolition : pas d'exigence
    expect(validerTransition({ ...base, natureIntervention: 'demolition' }, 'leve-scelles', {}).valide).toBe(true);
  });

  it('étape amende : exige le choix de la suite, le montant positif et l’avis', () => {
    const base = etat({ ordre: 5 });
    const sansSuite = validerTransition(base, 'amende-ou-etude', {});
    expect(sansSuite.valide).toBe(false);
    expect(sansSuite.erreurs[0]?.champ).toBe('suite_dossier');

    const amendeSansMontant = validerTransition(base, 'amende-ou-etude', { suite_dossier: 'amende' });
    expect(amendeSansMontant.valide).toBe(false);
    expect(amendeSansMontant.erreurs[0]).toEqual({
      code: 'CHAMP_MANQUANT',
      message: "Le montant de l'amende doit être supérieur à 0.",
      champ: 'montant_amende',
    });

    const amendeSansAvis = validerTransition(base, 'amende-ou-etude', { suite_dossier: 'amende', montant_amende: '450000' });
    expect(amendeSansAvis.valide).toBe(false);
    expect(amendeSansAvis.erreurs[0]).toEqual({
      code: 'CHAMP_MANQUANT',
      message: "Le numéro de l'avis de paiement doit être renseigné.",
      champ: 'numero_avis_paiement',
    });

    expect(validerTransition(base, 'amende-ou-etude', { suite_dossier: 'amende', montant_amende: '450000', numero_avis_paiement: 'AV-2026-07' }).valide).toBe(true);
    expect(validerTransition(base, 'amende-ou-etude', { suite_dossier: 'etude' }).valide).toBe(true);
    // montant + avis déjà persistés au dossier : exigence satisfaite sans payload
    expect(validerTransition(etat({ ordre: 5, suite: 'amende', montant: '450000', avisPaiement: 'AV-2026-07' }), 'amende-ou-etude', {}).valide).toBe(true);
  });

  it('formats : liste et dates réelles', () => {
    const base = etat({ ordre: 5 });
    const suiteInvalide = validerTransition(base, 'amende-ou-etude', { suite_dossier: 'avertissement' });
    expect(suiteInvalide.erreurs.some((e) => e.champ === 'suite_dossier')).toBe(true);

    const montantNegatif = validerTransition(base, 'amende-ou-etude', { suite_dossier: 'amende', montant_amende: '-5' });
    expect(montantNegatif.erreurs.some((e) => e.champ === 'montant_amende')).toBe(true);

    const montantNul = validerTransition(base, 'amende-ou-etude', { suite_dossier: 'amende', montant_amende: '0' });
    expect(montantNul.valide).toBe(false);
    expect(montantNul.erreurs.some((e) => e.champ === 'montant_amende' && e.code === 'VALEUR_INVALIDE')).toBe(true);

    const dateImpossible = validerTransition(etat({ ordre: 4 }), 'notification-arrete', { date_notification: '2026-02-30' });
    expect(dateImpossible.erreurs.some((e) => e.champ === 'date_notification')).toBe(true);

    const dateRelative = validerTransition(etat({ ordre: 4 }), 'notification-arrete', { date_notification: 'demain' });
    expect(dateRelative.valide).toBe(false);

    const dateValide = validerTransition(etat({ ordre: 4 }), 'notification-arrete', { date_notification: '2026-10-21' });
    expect(dateValide.valide).toBe(true);
  });

  it('champs non listés : ignorés (le serveur les filtre)', () => {
    const r = validerTransition(etat({ ordre: 4 }), 'notification-arrete', { date_notification: '2026-10-21', champ_inconnu: 'x' });
    expect(r.valide).toBe(true);
  });
});

describe('workflow-du — exigences affichables', () => {
  it('messages fidèles au serveur', () => {
    expect(exigences(etat({ ordre: 6 }), 'amende-ou-etude')).toEqual([
      'La suite du dossier (amende ou étude) doit être choisie.',
    ]);
    expect(exigences(etat({ ordre: 6, suite: 'amende' }), 'amende-ou-etude')).toEqual([
      "Le montant de l'amende doit être supérieur à 0.",
    ]);
    expect(exigences(etat({ ordre: 6, suite: 'amende', montant: '450000' }), 'amende-ou-etude')).toEqual([
      "Le numéro de l'avis de paiement doit être renseigné.",
    ]);
    expect(exigences(etat({ ordre: 6, suite: 'amende', montant: '450000', avisPaiement: 'AV-2026-07' }), 'amende-ou-etude')).toEqual([]);
    expect(exigences(etat({ ordre: 6, suite: 'etude' }), 'scellage-demolition', {})).toEqual([
      "La nature de l'intervention (scellage ou démolition) doit être enregistrée.",
    ]);
    expect(exigences(etat({ ordre: 9, natureIntervention: 'scellage' }), 'leve-scelles', {})).toEqual([
      "Un arrêté d'ouverture valide est requis avant la levée des scellés.",
    ]);
    expect(exigences(etat({ ordre: 3 }), 'avertissement-rapport-descente')).toEqual([]);
  });
});

describe('workflow-du — projection après transition', () => {
  it('etape/statut/serviсe calqués sur apply()', () => {
    expect(etatApres(etat({ ordre: 1 }), 'descente-terrain')).toEqual({
      ordre: 2, etape: 'constat', statut: 'en_cours', service: 'DIS', termine: false,
    });
    expect(etatApres(etat({ ordre: 8 }), 'attente-regularisation')).toEqual({
      ordre: 9, etape: 'regularisation', statut: 'en_attente', service: 'SCAD', termine: false,
    });
    expect(etatApres(etat({ ordre: 10 }), 'leve-scelles')).toMatchObject({
      ordre: 10, etape: 'cloture', statut: 'cloture',
    });
  });

  it('CAS A : statut en_attente à l’étape 6 avec suite amende (statutFor)', () => {
    expect(etatApres(etat({ ordre: 5 }), 'amende-ou-etude', { suite_dossier: 'amende' }).statut).toBe('en_attente');
    expect(etatApres(etat({ ordre: 5 }), 'amende-ou-etude', { suite_dossier: 'etude' }).statut).toBe('en_cours');
  });
});
