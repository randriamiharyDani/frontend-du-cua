import { EtapeDossier, NatureDossier, ServiceDossier, StatutDossier } from './dossier.model';

/**
 * Contrats JSON exacts de l'API Laravel (backend-api-du).
 * Les noms de champs reproduisent ceux renvoyés par les `Resource`.
 */

/** Dossier renvoyé par `DossierResource`. */
export interface DossierDto {
  id: number;
  num_bd: string | null;
  date_entree: string | null;
  ref_etude: string | null;
  idem_etude: string | null;
  date_etude: string | null;
  ref_arrivee: string | null;
  provenance: string | null;
  nature: NatureDossier | null;
  coordonnees: string | null;
  localisation: string | null;
  nom_contrevenant: string | null;
  objet: string | null;
  emplacement: string | null;
  dossier_relatif: string | null;
  obs: string | null;
  ref_arrete: string | null;
  date_arrete: string | null;
  objet_arrete: string | null;
  date_scellage: string | null;
  date_demol_ou_enlevement: string | null;
  service: ServiceDossier | null;
  etape: EtapeDossier | null;
  statut: StatutDossier | null;
  agent_id: number | null;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

/** État d'un transfert. */
export type MouvementState = 'envoye' | 'recu' | 'retourne';

/** Mouvement renvoyé par `MouvementResource`. */
export interface MouvementDto {
  id: number;
  dossier_id: number;
  service_depart: ServiceDossier | null;
  service_arrivee: ServiceDossier | null;
  agent_expediteur: number | null;
  agent_destinataire: number | null;
  motif: string | null;
  description: string | null;
  state: MouvementState | null;
  state_note: string | null;
  date_expedition: string | null;
  date_reception: string | null;
  date_retour: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/** Document renvoyé par `DocumentResource` (métadonnées uniquement). */
export interface DocumentDto {
  id: number;
  dossier_id: number | null;
  mouvement_id: number | null;
  type: string | null;
  libelle: string | null;
  nom: string | null;
  taille: number | null;
  mime: string | null;
  user: UtilisateurResume | null;
  created_by: number | null;
  download_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/** Résumé d'utilisateur tel qu'exposé par l'API. */
export interface UtilisateurResume {
  id: number;
  name: string;
}

/** Transition disponible (workflow). */
export interface TransitionOption {
  order: number;
  code: string;
  label: string;
  service: ServiceDossier | null;
  admin_only: boolean;
}

/** État de workflow renvoyé par `GET /dossiers/{id}/workflow`. */
export interface WorkflowState {
  dossier_id: number;
  etape: EtapeDossier | null;
  statut: StatutDossier | null;
  current_step: {
    order: number;
    code: string;
    label: string;
    service: ServiceDossier | null;
  } | null;
  available_transitions: TransitionOption[];
}

/** Mouvement embarqué dans un événement d'historique. */
export interface MouvementHistorique {
  id: number;
  service_depart: ServiceDossier | null;
  service_arrivee: ServiceDossier | null;
  agent_expediteur: number | null;
  agent_destinataire: number | null;
  motif: string | null;
  description: string | null;
  state: MouvementState | null;
  state_note: string | null;
  date_expedition: string | null;
  date_reception: string | null;
  date_retour: string | null;
}

/** Événement d'historique renvoyé par `GET /dossiers/{id}/historique`. */
export interface HistoriqueEvenementDto {
  id: string;
  source: 'dossier' | 'action' | 'mouvement';
  date: string | null;
  type: string | null;
  action: string | null;
  description: string | null;
  user: UtilisateurResume | null;
  user_id: number | null;
  service: ServiceDossier | null;
  etape: EtapeDossier | null;
  mouvement_id: number | null;
  mouvement: MouvementHistorique | null;
}

/** Réponse de l'historique. */
export interface HistoriqueResponse {
  dossier_id: number;
  total: number;
  data: HistoriqueEvenementDto[];
}

/** Métadonnées de pagination Laravel. */
export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

/** Réponse paginée Laravel (`AnonymousResourceCollection`). */
export interface ReponsePaginee<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: PaginationMeta;
}

/** Réponse d'une ressource unique (enveloppe `data`). */
export interface ReponseRessource<T> {
  data: T;
  message?: string;
  transitions_autorisees?: string[];
}

/** Filtres acceptés par `GET /dossiers` (IndexDossierRequest). */
export interface FiltresDossiers {
  search?: string;
  nature?: NatureDossier | '';
  service?: ServiceDossier | '';
  etape?: EtapeDossier | '';
  statut?: StatutDossier | '';
  date_entree?: string;
  per_page?: number;
  page?: number;
}

/** Corps d'envoi d'un transfert (`SendTransferRequest`). */
export interface PayloadTransfert {
  service_arrivee: ServiceDossier;
  motif?: string | null;
  description?: string | null;
  date_expedition?: string | null;
}

/** Corps de réception d'un transfert (`ReceiveTransferRequest`). */
export interface PayloadReception {
  note?: string | null;
  date_reception?: string | null;
}

/** Corps de retour d'un transfert (`ReturnTransferRequest`). */
export interface PayloadRetour {
  motif: string;
  date_retour?: string | null;
}
