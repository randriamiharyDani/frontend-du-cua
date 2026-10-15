/**
 * Contrats JSON des notifications temps réel (`GET /api/notifications`).
 * Données réelles MySQL — aucune simulation.
 */

export type TypeNotification =
  | 'nouveau_dossier'
  | 'transfert_envoye'
  | 'transfert_recu'
  | 'transfert_retour'
  | 'etape_statut'
  | 'document_ajoute'
  | 'action_requise';

/** Notification persistée côté serveur. */
export interface NotificationApp {
  id: number;
  type: TypeNotification | string;
  titre: string;
  message: string | null;
  dossier_id: number | null;
  cle: string | null;
  lue_at: string | null;
  created_at: string;
}

/** Réponse liste + compteur. */
export interface ReponseNotifications {
  non_lues: number;
  data: NotificationApp[];
}

/** Libellés FR des types (cloche + liste). */
export const TYPE_NOTIFICATION_LABEL: Record<string, string> = {
  nouveau_dossier: 'Nouveau dossier',
  transfert_envoye: 'Transfert reçu',
  transfert_recu: 'Réception confirmée',
  transfert_retour: 'Dossier retourné',
  etape_statut: 'Étape avancée',
  document_ajoute: 'Document ajouté',
  action_requise: 'Action requise',
};
