import { LocalisationDto, PayloadLocalisation } from '../models/localisation-api.model';

/** Ligne d'affichage d'une localisation dans la page « Localisations ». */
export interface LocalisationLigne {
  id: number;
  adresse: string;
  quartier: string;
  arrondissement: string;
  coordX: string;
  coordY: string;
  latitude: string;
  longitude: string;
  /** Nombre de dossiers rattachés (correspondance adresse / quartier). */
  nombre: number;
}

/**
 * Convertit une localisation de l'API (`LocalisationResource`) vers le modèle
 * d'affichage : les champs facultatifs nuls deviennent des chaînes vides pour
 * un rendu uniforme dans le tableau.
 */
export function localisationDepuisApi(dto: LocalisationDto): LocalisationLigne {
  return {
    id: dto.id,
    adresse: dto.adresse,
    quartier: dto.quartier,
    arrondissement: dto.arrondissement ?? '',
    coordX: dto.coord_x ?? '',
    coordY: dto.coord_y ?? '',
    latitude: dto.latitude ?? '',
    longitude: dto.longitude ?? '',
    nombre: dto.dossiers_count ?? 0,
  };
}

/** Valeurs de formulaire vers le corps d'écriture de l'API (vides → null). */
export function donneesLocalisationPourApi(valeur: {
  adresse: string;
  quartier: string;
  arrondissement: string;
  coordX: string;
  coordY: string;
  latitude: string;
  longitude: string;
}): PayloadLocalisation {
  const nettoyer = (v: string): string | null => {
    const t = (v ?? '').trim();
    return t === '' ? null : t;
  };

  return {
    adresse: valeur.adresse.trim(),
    quartier: valeur.quartier.trim(),
    arrondissement: valeur.arrondissement,
    coord_x: nettoyer(valeur.coordX),
    coord_y: nettoyer(valeur.coordY),
    latitude: nettoyer(valeur.latitude),
    longitude: nettoyer(valeur.longitude),
  };
}
