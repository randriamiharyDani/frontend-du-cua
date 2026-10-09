import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ARRONDISSEMENTS, PRIORITE_LABEL, PRIORITES, PrioriteDossier, STATUT_LABEL, STATUTS, StatutDossier,
} from '../../core/models/dossier.model';
import { DossierStore } from '../../core/state/dossier-store';
import { IconComponent } from '../../shared/ui/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PriorityBadgeComponent } from '../../shared/ui/priority-badge.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

const normaliser = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

@Component({
  selector: 'du-dossier-list',
  imports: [RouterLink, DatePipe, IconComponent, PageHeaderComponent, StatusBadgeComponent, PriorityBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dossier-list.component.html',
})
export class DossierListComponent {
  private readonly store = inject(DossierStore);

  protected readonly statuts = STATUTS;
  protected readonly priorites = PRIORITES;
  protected readonly arrondissements = ARRONDISSEMENTS;
  protected readonly statutLabel = STATUT_LABEL;
  protected readonly prioriteLabel = PRIORITE_LABEL;

  protected readonly recherche = signal('');
  protected readonly statut = signal<StatutDossier | ''>('');
  protected readonly priorite = signal<PrioriteDossier | ''>('');
  protected readonly arrondissement = signal('');
  private readonly page = signal(1);
  protected readonly taillePage = 8;

  protected readonly filtres = computed(() => {
    const q = normaliser(this.recherche().trim());
    return this.store.dossiers().filter(
      (d) =>
        (!this.statut() || d.statut === this.statut()) &&
        (!this.priorite() || d.priorite === this.priorite()) &&
        (!this.arrondissement() || d.arrondissement === this.arrondissement()) &&
        (!q || normaliser([d.reference, d.titre, d.adresse, d.quartier, d.proprietaire].join(' ')).includes(q)),
    );
  });

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtres().length / this.taillePage)));
  protected readonly pageCourante = computed(() => Math.min(this.page(), this.totalPages()));
  protected readonly affiches = computed(() => {
    const debut = (this.pageCourante() - 1) * this.taillePage;
    return this.filtres().slice(debut, debut + this.taillePage);
  });
  protected readonly filtresActifs = computed(
    () => !!(this.recherche() || this.statut() || this.priorite() || this.arrondissement()),
  );

  protected setRecherche(v: string): void { this.recherche.set(v); this.page.set(1); }
  protected setStatut(v: string): void { this.statut.set(v as StatutDossier | ''); this.page.set(1); }
  protected setPriorite(v: string): void { this.priorite.set(v as PrioriteDossier | ''); this.page.set(1); }
  protected setArrondissement(v: string): void { this.arrondissement.set(v); this.page.set(1); }
  protected allerA(p: number): void { this.page.set(Math.min(Math.max(1, p), this.totalPages())); }

  protected reinitialiser(): void {
    this.recherche.set('');
    this.statut.set('');
    this.priorite.set('');
    this.arrondissement.set('');
    this.page.set(1);
  }
}