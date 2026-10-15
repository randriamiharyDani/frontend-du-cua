import { DocumentDto } from '../models/dossier-api.model';
import { TypeDocument, TYPE_DOCUMENT_LABEL } from '../models/dossier.model';
import { formatTaille } from './dossier.mapper';

/** Ligne d'affichage d'un document dans la page « Documents ». */
export interface DocumentLigne {
  id: number;
  dossierId: number | null;
  numeroDossier: string;
  service: string;
  nom: string;
  type: string | null;
  typeLabel: string;
  libelle: string;
  taille: string;
  mime: string | null;
  deposePar: string;
  dateDepot: string;
}

/** Libellé lisible d'un type de document (repli sur la valeur brute). */
export function libelleTypeDocument(type: string | null): string {
  if (!type) return '—';
  return TYPE_DOCUMENT_LABEL[type as TypeDocument] ?? type;
}

/**
 * Convertit un document de l'API (`DocumentResource`) vers le modèle
 * d'affichage. Le numéro de dossier provient du résumé `dossier` (liste
 * globale) ; la taille est formatée en unité lisible.
 */
export function documentDepuisApi(dto: DocumentDto): DocumentLigne {
  const numero = dto.dossier?.num_bd ?? dto.dossier?.ref_arrivee ?? '';

  return {
    id: dto.id,
    dossierId: dto.dossier_id ?? dto.dossier?.id ?? null,
    numeroDossier: numero || (dto.dossier_id === null ? '—' : `#${dto.dossier_id}`),
    service: dto.dossier?.service ?? '',
    nom: dto.nom ?? '—',
    type: dto.type,
    typeLabel: libelleTypeDocument(dto.type),
    libelle: dto.libelle ?? '',
    taille: formatTaille(dto.taille),
    mime: dto.mime,
    deposePar: dto.user?.name ?? '—',
    dateDepot: (dto.created_at ?? '').slice(0, 10),
  };
}
