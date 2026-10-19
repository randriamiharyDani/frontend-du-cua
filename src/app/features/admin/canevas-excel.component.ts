import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  NATURE_LABEL,
  NATURES,
  NatureDossier,
  SERVICES,
  ServiceDossier,
} from '../../core/models/dossier.model';
import { DossierDto } from '../../core/models/dossier-api.model';
import { FichierCanevas, formaterTaille, CanevasApiStore } from '../../core/state/canevas-api.store';
import { IconComponent } from '../../shared/ui/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

/** Formate une date ISO `yyyy-MM-dd` en `jj/mm/aaaa` (sans décalage de fuseau). */
function formatDate(iso: string | null): string {
  if (!iso) return '';
  const [a, m, j] = iso.split('-');
  return a && m && j ? `${j}/${m}/${a}` : iso;
}

type CleColonne =
  | 'numero'
  | 'dateEntree'
  | 'referenceEtude'
  | 'idemEtude'
  | 'dateEtude'
  | 'referenceArrivee'
  | 'provenance'
  | 'nature'
  | 'coordonnees'
  | 'localisation'
  | 'contrevenant'
  | 'objet'
  | 'emplacement'
  | 'dossierRelatif'
  | 'observations'
  | 'refArrete'
  | 'dateArrete'
  | 'objetArrete'
  | 'dateScellage'
  | 'dateDemolition';

interface ColonneCanevas {
  cle: CleColonne;
  libelle: string;
}

/** Une ligne du canevas : valeurs déjà formatées (texte) prêtes à afficher. */
type LigneCanevas = Record<CleColonne, string>;

/**
 * Page « Canevas Excel » : tableau de synthèse des dossiers relié à l'API
 * réelle. Permet de télécharger le canevas (.xlsx) et d'importer un canevas
 * rempli (`.xlsx`/`.csv`) avec validation et rapport détaillé.
 */
@Component({
  selector: 'du-page-canevas-excel',
  imports: [IconComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './canevas-excel.component.html',
  styleUrl: './canevas-excel.component.scss',
})
export class CanevasExcelComponent {
  private readonly store = inject(CanevasApiStore);

  protected readonly natures = NATURES;
  protected readonly natureLabel = NATURE_LABEL;
  protected readonly services = SERVICES;

  protected readonly chargement = this.store.chargement;
  protected readonly erreur = this.store.erreur;
  protected readonly pagination = this.store.pagination;
  protected readonly enCours = this.store.enCours;
  protected readonly message = this.store.message;
  protected readonly erreurAction = this.store.erreurAction;
  protected readonly rapport = this.store.rapport;

  /** Les 20 colonnes officielles du canevas, dans l’ordre exact du fichier Excel. */
  protected readonly colonnes: readonly ColonneCanevas[] = [
    { cle: 'numero', libelle: 'NUM_BD' },
    { cle: 'dateEntree', libelle: 'DATE_ENTREE' },
    { cle: 'referenceEtude', libelle: 'Ref_ETUDE' },
    { cle: 'idemEtude', libelle: 'idem_ETUDE' },
    { cle: 'dateEtude', libelle: 'DATE_ETUDE' },
    { cle: 'referenceArrivee', libelle: 'REF ARRIVEE' },
    { cle: 'provenance', libelle: 'PROVENANCE' },
    { cle: 'nature', libelle: 'NATURE' },
    { cle: 'coordonnees', libelle: 'COORDONNEES (X/Y)' },
    { cle: 'localisation', libelle: 'Localisation' },
    { cle: 'contrevenant', libelle: 'Nom contrevenant' },
    { cle: 'objet', libelle: 'OBJET' },
    { cle: 'emplacement', libelle: 'Emplacement' },
    { cle: 'dossierRelatif', libelle: 'DOSSIER RELATIF' },
    { cle: 'observations', libelle: 'OBS' },
    { cle: 'refArrete', libelle: 'REF_ARRETE' },
    { cle: 'dateArrete', libelle: 'DATE_ARRETE' },
    { cle: 'objetArrete', libelle: 'OBJET_ARRETE' },
    { cle: 'dateScellage', libelle: 'DATE_SCELLAGE' },
    { cle: 'dateDemolition', libelle: 'DATE DEMOL OU ENLEVEMENT' },
  ];

  // --- Filtres (appliqués côté serveur) ---
  protected readonly recherche = signal('');
  protected readonly nature = signal<NatureDossier | ''>('');
  protected readonly service = signal<ServiceDossier | ''>('');
  private readonly page = signal(1);
  protected readonly taillePage = 10;

  // --- Import ---
  protected readonly fichierImport = signal<FichierCanevas | null>(null);
  protected readonly erreurFichier = signal('');

  /** Lignes du canevas issues des dossiers réels de la page courante. */
  protected readonly lignes = computed<LigneCanevas[]>(() =>
    this.store.dossiers().map((d) => this.versLigne(d)),
  );

  protected readonly filtresActifs = computed(
    () => !!(this.recherche() || this.nature() || this.service()),
  );

  constructor() {
    this.charger();
  }

  /** Interroge l'API avec les filtres courants et la page courante. */
  private charger(): void {
    this.store.chargerListe({
      search: this.recherche().trim(),
      nature: this.nature(),
      service: this.service(),
      per_page: this.taillePage,
      page: this.page(),
    });
  }

  /** Projette un dossier réel sur une ligne du canevas (20 colonnes, ordre Excel). */
  private versLigne(d: DossierDto): LigneCanevas {
    return {
      numero: d.num_bd ?? '',
      dateEntree: formatDate(d.date_entree),
      referenceEtude: d.ref_etude ?? '',
      idemEtude: d.idem_etude ?? '',
      dateEtude: formatDate(d.date_etude),
      referenceArrivee: d.ref_arrivee ?? '',
      provenance: d.provenance ?? '',
      nature: d.nature ? NATURE_LABEL[d.nature] : '',
      coordonnees: d.coordonnees ?? '',
      localisation: d.localisation ?? '',
      contrevenant: d.nom_contrevenant ?? '',
      objet: d.objet ?? '',
      emplacement: d.emplacement ?? '',
      dossierRelatif: d.dossier_relatif ?? '',
      observations: d.obs ?? '',
      refArrete: d.ref_arrete ?? '',
      dateArrete: formatDate(d.date_arrete),
      objetArrete: d.objet_arrete ?? '',
      dateScellage: formatDate(d.date_scellage),
      dateDemolition: formatDate(d.date_demol_ou_enlevement),
    };
  }

  /** Télécharge le canevas Excel (filtres courants) généré côté serveur. */
  protected exporterExcel(): void {
    this.store.exporter({
      search: this.recherche().trim(),
      nature: this.nature(),
      service: this.service(),
    });
  }

  /** Mémorise le fichier choisi puis lance l'import. */
  protected onFichierImport(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fichier = input.files?.[0];
    input.value = '';
    this.erreurFichier.set('');

    if (!fichier) {
      this.fichierImport.set(null);
      return;
    }

    const extension = (fichier.name.split('.').pop() ?? '').toLowerCase();
    if (extension !== 'xlsx' && extension !== 'csv') {
      this.fichierImport.set(null);
      this.erreurFichier.set('Format non supporté. Choisissez un fichier .xlsx ou .csv.');
      return;
    }

    this.fichierImport.set({ fichier, nom: fichier.name, taille: formaterTaille(fichier.size) });
    this.store.effacerMessages();
    this.store.importer(fichier).subscribe({
      next: () => {
        this.fichierImport.set(null);
        this.charger();
      },
      error: () => undefined,
    });
  }

  /** Ouvre le sélecteur de fichier pour l'import. */
  protected importer(): void {
    this.store.effacerMessages();
    this.erreurFichier.set('');
    this.fichierImport.set(null);
    this.inputFichier()?.click();
  }

  private inputFichier(): HTMLInputElement | null {
    return window.document.getElementById('fichier-canevas') as HTMLInputElement | null;
  }

  /** Ouvre une fenêtre d’impression contenant uniquement le tableau affiché. */
  protected imprimer(): void {
    const entetes = this.colonnes.map((c) => c.libelle);
    const lignes = this.lignes();
    const echapperHtml = (v: string) =>
      (v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const thead = `<tr>${entetes.map((h) => `<th>${echapperHtml(h)}</th>`).join('')}</tr>`;
    const tbody = lignes
      .map((l) => `<tr>${this.colonnes.map((c) => `<td>${echapperHtml(l[c.cle])}</td>`).join('')}</tr>`)
      .join('');

    const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8" />
      <title>Canevas de suivi des dossiers</title>
      <style>
        body { font-family: system-ui, Arial, sans-serif; margin: 12px; color: #1b2a3b; }
        h1 { font-size: 16px; margin: 0 0 4px; }
        p { font-size: 11px; color: #647387; margin: 0 0 10px; }
        table { border-collapse: collapse; width: 100%; font-size: 9px; }
        th, td { border: 1px solid #b9c2d0; padding: 4px 6px; text-align: left; vertical-align: top; }
        th { background: #eef2f8; text-transform: uppercase; letter-spacing: .03em; }
        tr:nth-child(even) td { background: #f7f9fc; }
        @page { size: landscape; margin: 8mm; }
      </style></head><body>
      <h1>Canevas de suivi des dossiers — constructions illicites</h1>
      <p>${lignes.length} ligne(s) · page ${this.pagination().page} / ${this.pagination().dernierPage} · généré le ${formatDate(new Date().toISOString().slice(0, 10))}</p>
      <table><thead>${thead}</thead><tbody>${tbody}</tbody></table>
      </body></html>`;

    const fenetre = window.open('', '_blank', 'width=1200,height=800');
    if (!fenetre) {
      window.print();
      return;
    }
    fenetre.document.write(html);
    fenetre.document.close();
    fenetre.focus();
    window.setTimeout(() => fenetre.print(), 300);
  }

  private resetPage(): void {
    this.page.set(1);
  }
  protected setRecherche(v: string): void { this.recherche.set(v); }
  protected setNature(v: string): void { this.nature.set(v as NatureDossier | ''); }
  protected setService(v: string): void { this.service.set(v as ServiceDossier | ''); }

  /** Applique les filtres en revenant à la première page. */
  protected rechercher(): void {
    this.resetPage();
    this.charger();
  }

  protected reinitialiser(): void {
    this.recherche.set('');
    this.nature.set('');
    this.service.set('');
    this.resetPage();
    this.charger();
  }

  protected allerA(p: number): void {
    this.page.set(Math.min(Math.max(1, p), this.pagination().dernierPage));
    this.charger();
  }
}
