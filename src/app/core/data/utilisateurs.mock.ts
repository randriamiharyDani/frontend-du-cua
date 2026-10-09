import { Utilisateur } from '../models/utilisateur.model';

/** Utilisateurs fictifs de l’espace administrateur (démonstration). */
export const UTILISATEURS_MOCK: Utilisateur[] = [
  { id: 'usr-1', nom: 'Diallo', prenom: 'Aminata', email: 'aminata.diallo@du.gouv', service: 'DU', role: 'admin_systeme', etat: 'actif', dateCreation: '2024-02-11' },
  { id: 'usr-2', nom: 'Camara', prenom: 'Sékou', email: 'sekou.camara@du.gouv', service: 'DU', role: 'administrateur', etat: 'actif', dateCreation: '2024-03-04' },
  { id: 'usr-3', nom: 'Sow', prenom: 'Mariama', email: 'mariama.sow@du.gouv', service: 'DU', role: 'agent', etat: 'actif', dateCreation: '2024-05-19' },
  { id: 'usr-4', nom: 'Bah', prenom: 'Ibrahima', email: 'ibrahima.bah@dis.gouv', service: 'DIS', role: 'administrateur', etat: 'actif', dateCreation: '2024-04-22' },
  { id: 'usr-5', nom: 'Condé', prenom: 'Fatoumata', email: 'fatoumata.conde@dis.gouv', service: 'DIS', role: 'agent', etat: 'inactif', dateCreation: '2024-06-08' },
  { id: 'usr-6', nom: 'Keita', prenom: 'Alpha', email: 'alpha.keita@scad.gouv', service: 'SCAD', role: 'administrateur', etat: 'actif', dateCreation: '2024-03-27' },
  { id: 'usr-7', nom: 'Traoré', prenom: 'Kadiatou', email: 'kadiatou.traore@scad.gouv', service: 'SCAD', role: 'agent', etat: 'suspendu', dateCreation: '2024-07-15' },
  { id: 'usr-8', nom: 'Sylla', prenom: 'Mohamed', email: 'mohamed.sylla@du.gouv', service: 'DU', role: 'agent', etat: 'actif', dateCreation: '2024-08-02' },
  { id: 'usr-9', nom: 'Barry', prenom: 'Aïssatou', email: 'aissatou.barry@dis.gouv', service: 'DIS', role: 'agent', etat: 'actif', dateCreation: '2024-09-12' },
  { id: 'usr-10', nom: 'Diallo', prenom: 'Ousmane', email: 'ousmane.diallo@scad.gouv', service: 'SCAD', role: 'agent', etat: 'inactif', dateCreation: '2025-01-20' },
];
