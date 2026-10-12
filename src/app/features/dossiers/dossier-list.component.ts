import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ETAPE_LABEL, ETAPES, EtapeDossier, ETAT_LABEL, NATURE_LABEL, NATURES, NatureDossier,
  nomContrevenant, SERVICES, ServiceDossier, STATUT_LABEL, STATUTS, StatutDossier, etatDossier,
} from '../../core/models/dossier.model';
import { DossierApiStore } from '../../core/state/dossier-api.store';
import { IconComponent } from '../../shared/ui/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

/** Page « Gestion des dossiers » : recherche, filtres, pagination (API). */
@Component({
  selector: 'du-dossier-list',
  imports: [RouterLink, DatePipe, IconComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dossier-list.component.html',
  styleUrl: './dossier-list.component.scss',
})
export class DossierListComponent {
  private readonly store = inject(DossierApiStore);

  protected readonly dossiers = this.store.dossiers;
  protected readonly chargement = this.store.chargementListe;
  protected readonly erreur = this.store.erreurListe;
  protected readonly pagination = this.store.pagination;

  protected readonly natures = NATURES;
  protected readonly services = SERVICES;
  protected readonly statuts = STATUTS;
  protected readonly etapes = ETAPES;
  protected readonly natureLabel = NATURE_LABEL;
  protected readonly statutLabel = STATUT_LABEL;
  protected readonly etapeLabel = ETAPE_LABEL;
  protected readonly etatLabel = ETAT_LABEL;
  protected readonly etatDe = etatDossier;
  protected readonly nomContrevenant = nomContrevenant;

  protected readonly recherche = signal('');
  protected readonly nature = signal<NatureDossier | ''>('');
  protected readonly service = signal<ServiceDossier | ''>('');
  protected readonly statut = signal<StatutDossier | ''>('');
  protected readonly etape = signal<EtapeDossier | ''>('');
  protected readonly du = signal('');
  protected readonly au = signal('');
  private readonly page = signal(1);
  protected readonly taillePage = 8;

  protected readonly filtresActifs = computed(
    () => !!(this.recherche() || this.nature() || this.service() || this.statut() || this.etape() || this.du() || this.au()),
  );

  constructor() {
    this.charger();
  }

  /** Interroge l'API avec les filtres courants. */
  private charger(): void {
    this.store.chargerListe({
      search: this.recherche().trim(),
      nature: this.nature(),
      service: this.service(),
      statut: this.statut(),
      etape: this.etape(),
      date_entree: this.du() || this.au(),
      per_page: this.taillePage,
      page: this.page(),
    });
  }

  private resetPage(): void {
    this.page.set(1);
  }

  protected setRecherche(v: string): void { this.recherche.set(v); this.resetPage(); }
  protected setNature(v: string): void { this.nature.set(v as NatureDossier | ''); this.resetPage(); }
  protected setService(v: string): void { this.service.set(v as ServiceDossier | ''); this.resetPage(); }
  protected setStatut(v: string): void { this.statut.set(v as StatutDossier | ''); this.resetPage(); }
  protected setEtape(v: string): void { this.etape.set(v as EtapeDossier | ''); this.resetPage(); }
  protected setDu(v: string): void { this.du.set(v); this.resetPage(); }
  protected setAu(v: string): void { this.au.set(v); this.resetPage(); }

  protected allerA(p: number): void {
    const cible = Math.min(Math.max(1, p), this.pagination().dernierPage);
    this.page.set(cible);
    this.charger();
  }

  /** Relance la recherche depuis la première page. */
  protected rechercher(): void {
    this.resetPage();
    this.charger();
  }

  protected reinitialiser(): void {
    this.recherche.set('');
    this.nature.set('');
    this.service.set('');
    this.statut.set('');
    this.etape.set('');
    this.du.set('');
    this.au.set('');
    this.page.set(1);
    this.charger();
  }
}
