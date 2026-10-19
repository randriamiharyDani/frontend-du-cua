import {
  Dossier,
  DossierFormValue,
  PRIORITES,
  PrioriteDossier,
  TYPES,
  TypeInfraction,
  nomContrevenant,
} from '../models/dossier.model';
import { DossierDto } from '../models/dossier-api.model';

/** `null` si la chaîne est vide après nettoyage, sinon la chaîne nettoyée. */
function nullOu(valeur: string | null | undefined): string | null {
  const propre = (valeur ?? '').trim();
  return propre === '' ? null : propre;
}

/** Valeur de type d'infraction reconnue, sinon valeur neutre. */
function typeOu(valeur: unknown): TypeInfraction {
  return (TYPES as readonly unknown[]).includes(valeur) ? (valeur as TypeInfraction) : 'construction_sans_permis';
}

/** Valeur de priorité reconnue, sinon valeur neutre. */
function prioriteOu(valeur: unknown): PrioriteDossier {
  return (PRIORITES as readonly unknown[]).includes(valeur) ? (valeur as PrioriteDossier) : 'moyenne';
}

/** Concatène les coordonnées renseignées (X, Y, latitude, longitude). */
function composerCoordonnees(valeur: DossierFormValue): string | null {
  const parties = [
    valeur.localisation.coordX,
    valeur.localisation.coordY,
    valeur.localisation.latitude,
    valeur.localisation.longitude,
  ]
    .map((c) => (c ?? '').trim())
    .filter((c) => c !== '');

  if (parties.length > 0) {
    return parties.join(', ');
  }
  return nullOu(valeur.localisation.description);
}

/** Formate une taille en octets en libellé lisible (ex. « 1,2 Mo »). */
export function formatTaille(octets: number | null | undefined): string {
  if (octets === null || octets === undefined || octets <= 0) return '—';
  const unites = ['o', 'Ko', 'Mo', 'Go'];
  let valeur = octets;
  let index = 0;
  while (valeur >= 1024 && index < unites.length - 1) {
    valeur /= 1024;
    index += 1;
  }
  const arrondi = index === 0 ? String(valeur) : valeur.toFixed(1).replace('.', ',');
  return `${arrondi} ${unites[index]}`;
}

/**
 * Convertit un dossier de l'API (champs métier + colonnes du formulaire +
 * colonnes techniques) vers le modèle frontend imbriqué. Tous les champs
 * du formulaire sont relus depuis l'API : ajout et modification restent
 * parfaitement symétriques.
 */
export function dossierDepuisApi(dto: DossierDto): Dossier {
  const coordX = dto.coord_x ?? '';
  const coordY = dto.coord_y ?? '';
  const latitude = dto.latitude ?? '';
  const longitude = dto.longitude ?? '';
  const coordonnees = (dto.coordonnees ?? '').trim();
  const coords = coordonnees
    .split(',')
    .map((c) => c.trim())
    .filter((c) => c !== '');

  return {
    id: String(dto.id),
    reference: dto.num_bd ?? '',
    infos: {
      numero: dto.num_bd ?? '',
      dateEntree: dto.date_entree ?? '',
      referenceArrivee: dto.ref_arrivee ?? '',
      referenceEtude: dto.ref_etude ?? '',
      idemEtude: dto.idem_etude ?? '',
      dateEtude: dto.date_etude ?? '',
      provenance: dto.provenance ?? '',
      nature: dto.nature ?? 'plainte',
    },
    contrevenant: {
      nom: dto.nom_contrevenant ?? '',
      prenom: dto.prenom_contrevenant ?? '',
      telephone: dto.telephone_contrevenant ?? '',
      adresse: dto.adresse_contrevenant ?? '',
      observations: dto.observations_contrevenant ?? '',
    },
    localisation: {
      adresse: dto.localisation ?? '',
      localisation: dto.localisation_detail ?? dto.localisation ?? '',
      quartier: dto.quartier ?? '',
      arrondissement: dto.arrondissement ?? '',
      coordX: coordX || coords[0] || '',
      coordY: coordY || coords[1] || '',
      latitude: latitude || coords[2] || '',
      longitude: longitude || coords[3] || '',
      description: dto.description_localisation ?? dto.coordonnees ?? '',
    },
    complements: {
      objet: dto.objet ?? '',
      emplacement: dto.emplacement ?? '',
      dossierRelatif: dto.dossier_relatif ?? '',
      observationsGenerales: dto.obs ?? '',
    },
    arretes: {
      refArrete: dto.ref_arrete ?? '',
      dateArrete: dto.date_arrete ?? '',
      objetArrete: dto.objet_arrete ?? '',
      dateScellage: dto.date_scellage ?? '',
      dateDemolOuEnlevement: dto.date_demol_ou_enlevement ?? '',
    },
    type: typeOu(dto.type_infraction),
    service: dto.service ?? 'DU',
    etape: dto.etape ?? 'constat',
    statut: dto.statut ?? 'en_attente',
    priorite: prioriteOu(dto.priorite),
    attentionRequise: !!dto.attention_requise,
    motifAttention: dto.motif_attention ?? '',
    agent: dto.agent_responsable ?? (dto.agent_id === null ? '' : `#${dto.agent_id}`),
    historique: [],
  };
}

/**
 * Convertit les valeurs du formulaire frontend en corps JSON attendu par
 * l'API : tous les champs du formulaire sont transmis et persistés par
 * Laravel (canevas 20 colonnes + colonnes du formulaire + statut).
 * L'étape reste pilotée par le serveur (workflow) et n'est jamais envoyée.
 */
export function donneesMetierPourApi(valeur: DossierFormValue): Record<string, unknown> {
  const corps: Record<string, unknown> = {
    num_bd: nullOu(valeur.infos.numero),
    date_entree: nullOu(valeur.infos.dateEntree),
    ref_etude: nullOu(valeur.infos.referenceEtude),
    idem_etude: nullOu(valeur.infos.idemEtude),
    date_etude: nullOu(valeur.infos.dateEtude),
    ref_arrivee: nullOu(valeur.infos.referenceArrivee),
    provenance: nullOu(valeur.infos.provenance),
    nature: valeur.infos.nature,
    coordonnees: composerCoordonnees(valeur),
    localisation: nullOu(valeur.localisation.adresse) ?? nullOu(valeur.localisation.localisation),
    nom_contrevenant: nullOu(nomContrevenant(valeur.contrevenant)) ?? nullOu(valeur.contrevenant.nom),
    objet: nullOu(valeur.complements.objet),
    emplacement: nullOu(valeur.complements.emplacement),
    dossier_relatif: nullOu(valeur.complements.dossierRelatif),
    obs: nullOu(valeur.complements.observationsGenerales) ?? nullOu(valeur.contrevenant.observations),
    ref_arrete: nullOu(valeur.arretes.refArrete),
    date_arrete: nullOu(valeur.arretes.dateArrete),
    objet_arrete: nullOu(valeur.arretes.objetArrete),
    date_scellage: nullOu(valeur.arretes.dateScellage),
    date_demol_ou_enlevement: nullOu(valeur.arretes.dateDemolOuEnlevement),
    statut: valeur.statut,
    // Contrevenant (persisté tel quel).
    prenom_contrevenant: nullOu(valeur.contrevenant.prenom),
    telephone_contrevenant: nullOu(valeur.contrevenant.telephone),
    adresse_contrevenant: nullOu(valeur.contrevenant.adresse),
    observations_contrevenant: nullOu(valeur.contrevenant.observations),
    // Localisation détaillée.
    quartier: nullOu(valeur.localisation.quartier),
    arrondissement: nullOu(valeur.localisation.arrondissement),
    localisation_detail: nullOu(valeur.localisation.localisation),
    coord_x: nullOu(valeur.localisation.coordX),
    coord_y: nullOu(valeur.localisation.coordY),
    latitude: nullOu(valeur.localisation.latitude),
    longitude: nullOu(valeur.localisation.longitude),
    description_localisation: nullOu(valeur.localisation.description),
    // Suivi du dossier.
    type_infraction: valeur.type,
    priorite: valeur.priorite,
    agent_responsable: nullOu(valeur.agent),
    attention_requise: !!valeur.attentionRequise,
    motif_attention: nullOu(valeur.motifAttention),
  };

  // Service transmis uniquement si renseigné (admin système à la création).
  // Pour les autres rôles, le contrôle est désactivé : getRawValue() renvoie
  // le service du compte, mais le serveur l'ignore et impose son périmètre.
  if (typeof (valeur as { service?: unknown }).service === 'string') {
    corps['service'] = (valeur as { service: string }).service;
  }

  return corps;
}
