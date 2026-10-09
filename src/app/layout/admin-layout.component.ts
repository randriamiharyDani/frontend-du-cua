import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs';
import { ADMIN_NAV_ITEMS } from './admin-navigation';
import { AdminSidebarComponent } from './admin-sidebar.component';
import { AdminTopbarComponent } from './admin-topbar.component';

/**
 * Coquille de l’espace admin : sidebar + topbar + zone centrale.
 * Le titre affiché suit le `title` de la route active, avec repli vers le menu.
 */
@Component({
  selector: 'du-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Sidebar repliée (écran large). */
  protected readonly sidebarRepliee = signal(false);
  /** Menu mobile ouvert (petit écran). */
  protected readonly menuMobileOuvert = signal(false);

  private readonly titreRoute = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.route),
      map((r) => {
        let active = r;
        while (active.firstChild) active = active.firstChild;
        return active;
      }),
      mergeMap((r) => r.title),
    ),
    { initialValue: undefined },
  );

  protected readonly titrePage = computed(() => {
    const titre = this.titreRoute();
    if (typeof titre === 'string' && titre.trim()) return titre.replace(/ — DU$/, '');
    const url = this.router.url.split('?')[0];
    const item = ADMIN_NAV_ITEMS.find((m) => (m.exact ? url === m.path : url.startsWith(m.path)));
    return item?.label ?? 'Administration';
  });

  protected basculerRepli(): void {
    this.sidebarRepliee.update((v) => !v);
  }

  protected basculerMenuMobile(): void {
    this.menuMobileOuvert.update((v) => !v);
  }

  protected fermerMenuMobile(): void {
    this.menuMobileOuvert.set(false);
  }
}
