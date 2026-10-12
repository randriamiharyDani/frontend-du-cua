import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { SERVICE_LABEL } from '../core/models/dossier.model';
import { IconComponent } from '../shared/ui/icon.component';
import { ADMIN_CURRENT_USER, AdminUser } from './admin-navigation';

/** Initiales à partir d'un nom complet (ex. « Aminata Diallo » → « AD »). */
function initiales(nom: string): string {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot.charAt(0).toUpperCase())
    .join('');
}

/** Barre supérieure : bouton menu, titre de page, profil utilisateur connecté. */
@Component({
  selector: 'du-admin-topbar',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './admin-topbar.component.html',
  styleUrl: './admin-topbar.component.scss',
})
export class AdminTopbarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Titre de la page courante, fourni par le layout. */
  @Input() titrePage = 'Tableau de bord';
  /** Libellé du bouton menu sur mobile (accessibilité). */
  @Input() menuOuvert = false;

  /** Ouverture / fermeture du menu mobile. */
  @Output() basculerMenu = new EventEmitter<void>();
  /** Repli / dépli de la sidebar sur écran large. */
  @Output() basculerRepli = new EventEmitter<void>();

  protected readonly profilOuvert = signal(false);

  /** Utilisateur connecté (repli neutre si la session n'est pas chargée). */
  protected readonly utilisateur = computed<AdminUser>(() => {
    const connecte = this.auth.utilisateur();
    if (!connecte) return ADMIN_CURRENT_USER;
    return {
      nom: connecte.name,
      service: connecte.service ? SERVICE_LABEL[connecte.service] : '—',
      role: connecte.role_label ?? connecte.role ?? '',
      initiales: initiales(connecte.name),
    };
  });

  protected basculerProfil(): void {
    this.profilOuvert.update((v) => !v);
  }

  protected fermerProfil(): void {
    this.profilOuvert.set(false);
  }

  /** Déconnexion : révoque le jeton côté serveur puis retourne à la connexion. */
  protected seDeconnecter(): void {
    this.profilOuvert.set(false);
    this.auth.deconnexion().subscribe({
      next: () => void this.router.navigate(['/connexion']),
      error: () => {
        this.auth.purger();
        void this.router.navigate(['/connexion']);
      },
    });
  }
}
