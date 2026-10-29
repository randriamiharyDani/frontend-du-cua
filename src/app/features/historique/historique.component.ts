import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { dossierDepuisApi } from '../../core/mappers/dossier.mapper';
import {
  Dossier,
  NATURE_LABEL,
  nomContrevenant,
  SERVICE_LABEL,
  SERVICES,
  ServiceDossier,
} from '../../core/models/dossier.model';
import { DossierApiService } from '../../core/services/dossier-api.service';
import { IconComponent } from '../../shared/ui/icon.component';
import { LoaderComponent } from '../../shared/ui/loader.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

/** Ligne d'historique : dossier clôturé + date de sa dernière mise à jour. */
interface LigneHistorique {
  dossier: Dossier;
  miseAJour: string;
}

/**
 * Page « Historique » : dossiers clôturés issus de la base réelle.
 * La liste est toujours filtrée côté serveur sur `statut = cloture`, avec
 * recherche, service, période et pagination (`GET /api/dossiers`).
 */
@Component({
  selector: 'du-page-historique',
  imports: [RouterLink, DatePipe, IconComponent, LoaderComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './historique.component.html',
  styleUrl: './historique.component.scss',
})
export class HistoriqueComponent {
  private readonly api = inject(DossierApiService);

  protected readonly services = SERVICES;
  protected readonly natureLabel = NATURE_LABEL;
  protected readonly serviceLabel = SERVICE_LABEL;
  protected readonly nomContrevenant = nomContrevenant;

  protected readonly recherche = signal('');
  protected readonly service = signal<ServiceDossier | ''>('');
  protected readonly du = signal('');
  protected readonly au = signal('');
  protected readonly taillePage = 8;

  protected readonly lignes = signal<LigneHistorique[]>([]);
  protected readonly chargement = signal(false);
  protected readonly erreur = signal('');
  protected readonly page = signal(1);
  protected readonly dernierPage = signal(1);
  protected readonly total = signal(0);

  protected readonly filtresActifs = computed(
    () => !!(this.recherche() || this.service() || this.du() || this.au()),
  );

  protected readonly plageInvalide = computed(
    () => !!(this.du() && this.au() && this.du() > this.au()),
  );

  private requeteId = 0;

  constructor() {
    this.charger();
  }

  /** Interroge l'API : le statut clôturé n'est jamais retiré des filtres. */
  private charger(): void {
    if (this.plageInvalide()) return;

    const requeteId = ++this.requeteId;
    this.chargement.set(true);
    this.erreur.set('');

    this.api
      .lister({
        search: this.recherche().trim(),
        service: this.service(),
        statut: 'cloture',
        du: this.du(),
        au: this.au(),
        per_page: this.taillePage,
        page: this.page(),
      })
      .subscribe({
        next: (reponse) => {
          if (requeteId !== this.requeteId) return;
          this.lignes.set(
            (reponse.data ?? [])
              .filter((dto) => !!dto)
              .map((dto) => ({
                dossier: dossierDepuisApi(dto),
                miseAJour: dto.updated_at ?? '',
              })),
          );
          this.page.set(reponse.meta.current_page);
          this.dernierPage.set(reponse.meta.last_page);
          this.total.set(reponse.meta.total);
          this.chargement.set(false);
        },
        error: (erreur: unknown) => {
          if (requeteId !== this.requeteId) return;
          this.erreur.set(this.lireErreur(erreur));
          this.lignes.set([]);
          this.total.set(0);
          this.chargement.set(false);
        },
      });
  }

  private resetPage(): void {
    this.page.set(1);
  }

  protected setRecherche(valeur: string): void {
    this.recherche.set(valeur);
    this.resetPage();
  }

  protected setService(valeur: string): void {
    this.service.set(valeur as ServiceDossier | '');
    this.resetPage();
  }

  protected setDu(valeur: string): void {
    this.du.set(valeur);
    this.resetPage();
  }

  protected setAu(valeur: string): void {
    this.au.set(valeur);
    this.resetPage();
  }

  protected allerA(page: number): void {
    const cible = Math.min(Math.max(1, page), this.dernierPage());
    this.page.set(cible);
    this.charger();
  }

  protected rechercher(): void {
    this.resetPage();
    this.charger();
  }

  protected reinitialiser(): void {
    this.recherche.set('');
    this.service.set('');
    this.du.set('');
    this.au.set('');
    this.page.set(1);
    this.charger();
  }

  protected reference(dossier: Dossier): string {
    return dossier.reference || dossier.infos.numero || `#${dossier.id}`;
  }

  private lireErreur(erreur: unknown): string {
    if (erreur instanceof HttpErrorResponse) {
      const corps: unknown = erreur.error;
      if (corps && typeof corps === 'object') {
        const objet = corps as Record<string, unknown>;
        const erreurs = objet['errors'];
        if (erreurs && typeof erreurs === 'object') {
          const premier = Object.values(erreurs as Record<string, string[]>)
            .map((messages) => (Array.isArray(messages) ? messages[0] : null))
            .find((message): message is string => typeof message === 'string' && !!message.trim());
          if (premier) return premier;
        }
        if (typeof objet['message'] === 'string' && objet['message'].trim()) {
          return objet['message'];
        }
      }
      if (erreur.status === 0)
        return 'Serveur injoignable. Vérifiez que l’API Laravel est démarrée.';
      if (erreur.status === 401) return 'Session expirée. Reconnectez-vous.';
      if (erreur.status === 403)
        return 'Accès refusé : ce filtre sort de votre périmètre de service.';
      if (erreur.status === 404) return 'Ressource introuvable.';
      if (erreur.status === 429) return 'Trop de tentatives. Patientez une minute puis réessayez.';
      if (erreur.status >= 500) return 'Erreur serveur. Réessayez plus tard.';
      return `Erreur ${erreur.status}.`;
    }
    return 'Une erreur inattendue est survenue.';
  }
}
