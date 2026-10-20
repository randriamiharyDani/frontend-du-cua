import { Component, Input, Output, EventEmitter, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../shared/ui/icon.component';
import { ADMIN_NAV_ITEMS, AdminNavItem } from './admin-navigation';
import { AuthService } from '../core/services/auth.service';

/** Barre latérale de l’espace admin : logo DU + menus + bouton de repli. */
@Component({
  selector: 'du-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss',
})
export class AdminSidebarComponent {
  /** Mode replié (icônes seules) sur écran large. */
  @Input() replie = false;
  /** Tiroir ouvert sur petit écran. */
  @Input() menuMobileOuvert = false;
  /** Émission du repli / dépli depuis le bouton dédié. */
  @Output() replierChange = new EventEmitter<void>();
  /** Émission d’un clic sur un lien (fermeture du menu mobile). */
  @Output() naviguer = new EventEmitter<void>();

  protected readonly menus: AdminNavItem[] = ADMIN_NAV_ITEMS;
  private readonly auth = inject(AuthService);

  /** Menus visibles selon le rôle : « Utilisateurs » réservé à l'admin système. */
  protected readonly menusVisibles = computed(() => {
    const estAdminSysteme = this.auth.utilisateur()?.role === 'admin_systeme';
    return this.menus.filter((m) => !m.adminSystemeUniquement || estAdminSysteme);
  });
}
