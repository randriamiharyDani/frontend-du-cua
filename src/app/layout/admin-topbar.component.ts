import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../shared/ui/icon.component';
import { ADMIN_CURRENT_USER, AdminUser } from './admin-navigation';

/** Barre supérieure : bouton menu, titre de page, profil utilisateur fictif. */
@Component({
  selector: 'du-admin-topbar',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './admin-topbar.component.html',
  styleUrl: './admin-topbar.component.scss',
})
export class AdminTopbarComponent {
  /** Titre de la page courante, fourni par le layout. */
  @Input() titrePage = 'Tableau de bord';
  /** Libellé du bouton menu sur mobile (accessibilité). */
  @Input() menuOuvert = false;
  /** Utilisateur fictif affiché dans le menu de profil. */
  @Input() utilisateur: AdminUser = ADMIN_CURRENT_USER;

  /** Ouverture / fermeture du menu mobile. */
  @Output() basculerMenu = new EventEmitter<void>();
  /** Repli / dépli de la sidebar sur écran large. */
  @Output() basculerRepli = new EventEmitter<void>();

  protected readonly profilOuvert = signal(false);

  constructor(private readonly router: Router) {}

  protected basculerProfil(): void {
    this.profilOuvert.update((v) => !v);
  }

  protected fermerProfil(): void {
    this.profilOuvert.set(false);
  }

  /** Déconnexion fictive : retour temporaire vers la page de connexion. */
  protected seDeconnecter(): void {
    this.profilOuvert.set(false);
    this.router.navigate(['/connexion']);
  }
}
