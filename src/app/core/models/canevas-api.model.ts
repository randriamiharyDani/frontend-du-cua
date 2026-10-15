/**
 * Contrats JSON de l'API canevas (backend-api-du).
 */

/** Erreur de validation d'une cellule lors de l'import. */
export interface ErreurImportCanevas {
  /** Numéro de ligne dans le fichier (1 = en-tête). */
  ligne: number;
  /** Libellé de la colonne concernée. */
  colonne: string;
  /** Message d'erreur lisible. */
  message: string;
}

/** Rapport renvoyé par `POST /canevas/import`. */
export interface RapportImportCanevas {
  message: string;
  total_lignes: number;
  crees: number;
  doublons: number;
  ignorees: number;
  erreurs: number;
  erreurs_details: ErreurImportCanevas[];
}
