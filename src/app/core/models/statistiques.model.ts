import { MouvementState } from './dossier-api.model';
import { EtapeDossier, NatureDossier, ServiceDossier, StatutDossier } from './dossier.model';

/**
 * Contrats JSON de l'endpoint `GET /api/statistiques` (tableau de bord).
 * Les noms de champs reproduisent exactement la réponse de
 * `App\Statistics\DossierStatistics`.
 */

/** Portée des données selon le rôle connecté. */
export interface StatistiquesPortee {
  global: boolean;
  service: ServiceDossier | null;
}

/** Agrégats des dossiers actifs (hors dossiers supprimés logiquement). */
export interface StatistiquesDossiers {
  total_actifs: number;
  en_attente: number;
  en_cours: number;
  clotures: number;
  recemment_crees: number;
  periode_recente_jours: number;
  par_nature: Record<NatureDossier, number>;
  par_statut: Record<StatutDossier, number>;
  par_etape: Record<EtapeDossier, number>;
  par_service: Record<ServiceDossier, number>;
}

/** Point d'évolution mensuelle (format `YYYY-MM`). */
export interface StatistiquesPeriode {
  periode: string;
  total: number;
}

/** Mouvement récent renvoyé par les statistiques. */
export interface StatistiquesMouvement {
  id: number;
  dossier_id: number;
  dossier_reference: string | null;
  service_depart: ServiceDossier | null;
  service_arrivee: ServiceDossier | null;
  state: MouvementState | null;
  motif: string | null;
  date: string | null;
}

/** Transferts : en attente + derniers mouvements. */
export interface StatistiquesTransferts {
  en_attente: number;
  recents: StatistiquesMouvement[];
}

/** Dossier récemment créé (résumé). */
export interface StatistiquesDernierDossier {
  id: number;
  reference: string | null;
  objet: string | null;
  service: ServiceDossier | null;
  statut: StatutDossier | null;
  etape: EtapeDossier | null;
  nature: NatureDossier | null;
  date_entree: string | null;
}

/** Réponse complète de `GET /api/statistiques`. */
export interface Statistiques {
  portee: StatistiquesPortee;
  dossiers: StatistiquesDossiers;
  evolution: StatistiquesPeriode[];
  transferts: StatistiquesTransferts;
  derniers_dossiers: StatistiquesDernierDossier[];
}
