import { UtilisateurDto } from '../models/utilisateur-api.model';
import { Utilisateur } from '../models/utilisateur.model';

/**
 * Convertit un utilisateur de l'API (`UserResource`) vers le modèle d'affichage.
 * `statut` (API) devient `etat` (UI) ; les valeurs manquantes sont sécurisées.
 */
export function utilisateurDepuisApi(dto: UtilisateurDto): Utilisateur {
  return {
    id: String(dto.id),
    prenom: dto.prenom ?? '',
    nom: dto.nom ?? '',
    email: dto.email,
    service: dto.service ?? 'DU',
    role: dto.role ?? 'agent',
    etat: dto.statut ?? 'actif',
    dateCreation: (dto.date_creation ?? dto.created_at ?? '').slice(0, 10),
  };
}
