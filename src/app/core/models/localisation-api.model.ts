/**
 * Contrats JSON de l'API localisations du backend Laravel
 * (`LocalisationResource`). Les noms de champs reproduisent ceux de la
 * ressource ; le nombre de dossiers est calculé côté serveur par
 * correspondance de libellé (adresse ou quartier).
 */

/** Localisation renvoyée par `LocalisationResource`. */
export interface LocalisationDto {
  id: number;
  adresse: string;
  quartier: string;
  arrondissement: string | null;
  coord_x: string | null;
  coord_y: string | null;
  latitude: string | null;
  longitude: string | null;
  dossiers_count: number;
  created_by: number | null;
  created_at: string | null;
  updated_at: string | null;
}

/** Filtres acceptés par `GET /localisations` (IndexLocalisationRequest). */
export interface FiltresLocalisations {
  search?: string;
  arrondissement?: string;
  association?: 'avec' | 'sans' | '';
  per_page?: number;
  page?: number;
}

/** Corps d'écriture d'une localisation (`StoreLocalisationRequest` / `UpdateLocalisationRequest`). */
export interface PayloadLocalisation {
  adresse: string;
  quartier: string;
  arrondissement: string;
  coord_x: string | null;
  coord_y: string | null;
  latitude: string | null;
  longitude: string | null;
}
