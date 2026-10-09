import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ETAPE_LABEL, ETAPES, EtapeDossier, ETAT_LABEL, NATURE_LABEL, NATURES, NatureDossier,
  SERVICES, ServiceDossier, STATUT_LABEL, STATUTS, StatutDossier, etatDossier,
} from '../../core/models/dossier.model';
import { DossierStore } from '../../core/state/dossier-store';
import { IconComponent } from '../../shared/ui/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

const normaliser = (s: string) =>
  (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Page « Gestion des dossiers » : recherche, filtres, pagination, actions. */
@Component({
  selector: 'du-dossier-list',
  imports: [RouterLink, DatePipe, IconComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dossier-list.component.html',
  styleUrl: './dossier-list.component.scss',
})
export class DossierListComponent {
  private readonly store = inject(DossierStore);

  protected readonly natures = NATURES;
  protected readonly services = SERVICES;
  protected readonly statuts = STATUTS;
  protected readonly etapes = ETAPES;
  protected readonly natureLabel = NATURE_LABEL;
  protected readonly statutLabel = STATUT_LABEL;
  protected readonly etapeLabel = ETAPE_LABEL;
  protected readonly etatLabel = ETAT_LABEL;
  protected readonly etatDe = etatDossier;

  protected readonly recherche = signal('');
  protected readonly nature = signal<NatureDossier | ''>('');
  protected readonly service = signal<ServiceDossier | ''>('');
  protected readonly statut = signal<StatutDossier | ''>('');
  protected readonly etape = signal<EtapeDossier | ''>('');
  protected readonly du = signal('');
  protected readonly au = signal('');
  private readonly page = signal(1);
  protected readonly taillePage = 8;

  protected readonly filtres = computed(() => {
    const q = normaliser(this.recherche().trim());
    const du = this.du();
    const au = this.au();
    return this.store.dossiers().filter((d) => {
      if (this.nature() && d.nature !== this.nature()) return false;
      if (this.service() && d.service !== this.service()) return false;
      if (this.statut() && d.statut !== this.statut()) return false;
      if (this.etape() && d.etape !== this.etape()) return false;
      if (du && d.dateEnregistrement < du) return false;
      if (au && d.dateEnregistrement > au) return false;
      if (!q) return true;
      const hay = normaliser(
        [d.reference, d.titre, d.proprietaire, d.quartier, d.arrondissement, d.adresse].join(' '),
      );
      return hay.includes(q);
    });
  });

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtres().length / this.taillePage)));
  protected readonly pageCourante = computed(() => Math.min(this.page(), this.totalPages()));
  protected readonly affiches = computed(() => {
    const debut = (this.pageCourante() - 1) * this.taillePage;
    return this.filtres().slice(debut, debut + this.taillePage);
  });
  protected readonly filtresActifs = computed(
    () => !!(this.recherche() || this.nature() || this.service() || this.statut() || this.etape() || this.du() || this.au()),
  );

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
  protected allerA(p: number): void { this.page.set(Math.min(Math.max(1, p), this.totalPages())); }

  protected reinitialiser(): void {
    this.recherche.set('');
    this.nature.set('');
    this.service.set('');
    this.statut.set('');
    this.etape.set('');
    this.du.set('');
    this.au.set('');
    this.page.set(1);
  }
}
