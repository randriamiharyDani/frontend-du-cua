import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { FiltresDossiers } from '../../core/models/dossier-api.model';
import {
  ETAPE_LABEL, ETAPES, EtapeDossier,
  NATURE_LABEL, NATURES, NatureDossier,
  nomContrevenant, SERVICES, ServiceDossier, STATUT_LABEL, STATUTS, StatutDossier,
} from '../../core/models/dossier.model';
import { DossierPdfService } from '../../core/services/dossier-pdf.service';
import { DossierApiStore } from '../../core/state/dossier-api.store';
import {
  GranularitePeriode,
  PERIODES,
  bornesPeriode,
  dateAujourdhui,
} from '../../core/utils/periode.util';
import { IconComponent } from '../../shared/ui/icon.component';
import { LoaderComponent } from '../../shared/ui/loader.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

/** Page « Gestion des dossiers » : recherche, filtres, pagination (API). */
@Component({
  selector: 'du-dossier-list',
  imports: [RouterLink, DatePipe, IconComponent, LoaderComponent, PageHeaderComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dossier-list.component.html',
  styleUrl: './dossier-list.component.scss',
})
export class DossierListComponent {
  private readonly store = inject(DossierApiStore);
  private readonly pdf = inject(DossierPdfService);

  @ViewChild('exportPdf') private exportPdf?: ElementRef<HTMLElement>;

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

  // --- Export PDF ---
  protected readonly periodes = PERIODES;
  protected readonly menuExportOuvert = signal(false);
  protected readonly exportEnCours = signal(false);
  protected readonly erreurExport = signal('');
  protected readonly dateReference = signal(dateAujourdhui());

  constructor() {
    this.charger();
  }

  /** Ouvre / ferme le menu d'export (ignoré pendant un export). */
  protected basculerMenuExport(): void {
    if (this.exportEnCours()) return;
    this.menuExportOuvert.update((ouvert) => !ouvert);
  }

  protected setDateReference(valeur: string): void {
    this.dateReference.set(valeur);
  }

  /**
   * Exporte en PDF tous les dossiers de la période choisie, en conservant
   * les filtres actifs (recherche, nature, service, statut, étape).
   * Seules les bornes Du/Au sont remplacées par la période calculée.
   */
  protected async exporter(granularite: GranularitePeriode): Promise<void> {
    if (this.exportEnCours()) return;

    this.menuExportOuvert.set(false);
    this.erreurExport.set('');
    this.exportEnCours.set(true);

    const bornes = bornesPeriode(granularite, this.dateReference());
    const filtres: FiltresDossiers = {
      search: this.recherche().trim(),
      nature: this.nature(),
      service: this.service(),
      statut: this.statut(),
      etape: this.etape(),
      du: bornes.du,
      au: bornes.au,
      per_page: 100,
    };

    try {
      const dossiers = await firstValueFrom(this.store.chargerTout(filtres));
      await this.pdf.generer(dossiers, { granularite, bornes });
    } catch {
      this.erreurExport.set('Export PDF impossible. Veuillez réessayer.');
    } finally {
      this.exportEnCours.set(false);
    }
  }

  /** Ferme le menu d'export lorsqu'on clique en dehors. */
  @HostListener('document:click', ['$event'])
  protected fermerMenuExterieur(evenement: Event): void {
    if (!this.menuExportOuvert()) return;
    const conteneur = this.exportPdf?.nativeElement;
    const cible = evenement.target as Node | null;
    if (conteneur && cible && !conteneur.contains(cible)) {
      this.menuExportOuvert.set(false);
    }
  }

  /** Ferme le menu d'export avec la touche Échap. */
  @HostListener('document:keydown.escape')
  protected fermerMenuEchap(): void {
    this.menuExportOuvert.set(false);
  }

  /** Interroge l'API avec les filtres courants. */
  private charger(): void {
    this.store.chargerListe({
      search: this.recherche().trim(),
      nature: this.nature(),
      service: this.service(),
      statut: this.statut(),
      etape: this.etape(),
      du: this.du(),
      au: this.au(),
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
