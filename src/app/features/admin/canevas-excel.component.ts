import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  DocumentDossier,
  Dossier,
  ETAPE_LABEL,
  ETAPES,
  EtapeDossier,
  NATURE_LABEL,
  NATURES,
  NatureDossier,
  SERVICES,
  ServiceDossier,
  nomContrevenant,
} from '../../core/models/dossier.model';
import { DossierStore } from '../../core/state/dossier-store';
import { IconComponent } from '../../shared/ui/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

const normaliser = (s: string) =>
  (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Formate une date ISO `yyyy-MM-dd` en `jj/mm/aaaa` (sans décalage de fuseau). */
function formatDate(iso: string): string {
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
 * Page « Canevas Excel » : tableau de synthèse des dossiers, inspiré du canevas
 * de suivi des constructions illicites. Données temporaires du frontend uniquement.
 */
@Component({
  selector: 'du-page-canevas-excel',
  imports: [IconComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './canevas-excel.component.html',
  styleUrl: './canevas-excel.component.scss',
})
export class CanevasExcelComponent {
  private readonly store = inject(DossierStore);

  protected readonly natures = NATURES;
  protected readonly natureLabel = NATURE_LABEL;
  protected readonly services = SERVICES;
  protected readonly etapes = ETAPES;
  protected readonly etapeLabel = ETAPE_LABEL;

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

  // --- Filtres ---
  protected readonly recherche = signal('');
  protected readonly nature = signal<NatureDossier | ''>('');
  protected readonly service = signal<ServiceDossier | ''>('');
  protected readonly etape = signal<EtapeDossier | ''>('');
  private readonly page = signal(1);
  protected readonly taillePage = 6;

  protected readonly messageExport = signal('');

  /** Dossiers filtrés, du plus récent au plus ancien. */
  private readonly dossiersFiltres = computed(() => {
    const q = normaliser(this.recherche().trim());
    const nature = this.nature();
    const service = this.service();
    const etape = this.etape();
    return this.store
      .dossiers()
      .filter((d) => {
        if (nature && d.infos.nature !== nature) return false;
        if (service && d.service !== service) return false;
        if (etape && d.etape !== etape) return false;
        if (!q) return true;
        const hay = normaliser(
          [
            d.infos.numero,
            d.reference,
            d.complements.objet,
            nomContrevenant(d.contrevenant),
            d.localisation.adresse,
            d.localisation.quartier,
          ].join(' '),
        );
        return hay.includes(q);
      })
      .sort((a, b) => (b.infos.dateEntree || '').localeCompare(a.infos.dateEntree || ''));
  });

  /** Lignes du canevas issues des dossiers temporaires (aucune donnée ajoutée). */
  protected readonly lignes = computed<LigneCanevas[]>(() => {
    const docs = this.store.documents();
    return this.dossiersFiltres().map((d) => this.versLigne(d, docs));
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.lignes().length / this.taillePage)),
  );
  protected readonly pageCourante = computed(() => Math.min(this.page(), this.totalPages()));
  protected readonly affiches = computed(() => {
    const debut = (this.pageCourante() - 1) * this.taillePage;
    return this.lignes().slice(debut, debut + this.taillePage);
  });
  protected readonly filtresActifs = computed(
    () => !!(this.recherche() || this.nature() || this.service() || this.etape()),
  );

  private documentDeType(id: string, docs: DocumentDossier[], type: DocumentDossier['type']) {
    return docs
      .filter((doc) => doc.dossierId === id && doc.type === type)
      .sort((a, b) => b.dateDepot.localeCompare(a.dateDepot))[0];
  }

  /** Projette un dossier sur une ligne du canevas (20 colonnes, ordre Excel). */
  private versLigne(d: Dossier, docs: DocumentDossier[]): LigneCanevas {
    const arrete =
      this.documentDeType(d.id, docs, 'arrete_interruptif') ??
      this.documentDeType(d.id, docs, 'arrete_scelles');
    const scellage = this.documentDeType(d.id, docs, 'pv_scellage');
    const demolition = this.documentDeType(d.id, docs, 'document_demolition');
    const etude = this.documentDeType(d.id, docs, 'document_etude');
    const loc = d.localisation;
    const a = d.arretes;

    return {
      numero: d.infos.numero || d.reference,
      dateEntree: formatDate(d.infos.dateEntree),
      referenceEtude: d.infos.referenceEtude || etude?.reference || '',
      idemEtude: d.infos.idemEtude || '',
      dateEtude: formatDate(d.infos.dateEtude || etude?.dateDepot || ''),
      referenceArrivee: d.infos.referenceArrivee || '',
      provenance: d.infos.provenance || '',
      nature: NATURE_LABEL[d.infos.nature],
      coordonnees: [loc.coordX, loc.coordY].filter(Boolean).join(' / '),
      localisation: loc.localisation || [loc.adresse, loc.quartier].filter(Boolean).join(', '),
      contrevenant: nomContrevenant(d.contrevenant),
      objet: d.complements.objet,
      emplacement: d.complements.emplacement || '',
      dossierRelatif: d.complements.dossierRelatif || '',
      observations: d.complements.observationsGenerales || d.motifAttention || '',
      refArrete: a.refArrete || arrete?.reference || '',
      dateArrete: formatDate(a.dateArrete || arrete?.dateDepot || ''),
      objetArrete: a.objetArrete || '',
      dateScellage: formatDate(a.dateScellage || scellage?.dateDepot || ''),
      dateDemolition: formatDate(a.dateDemolOuEnlevement || demolition?.dateDepot || ''),
    };
  }

  /** Exporte la vue filtrée en CSV compatible Excel (sans dépendance externe). */
  protected exporterExcel(): void {
    const entetes = this.colonnes.map((c) => c.libelle);
    const lignes = this.lignes();
    const echapper = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`;
    const contenu = [
      entetes.map(echapper).join(';'),
      ...lignes.map((l) => this.colonnes.map((c) => echapper(l[c.cle])).join(';')),
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + contenu], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canevas-dossiers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.messageExport.set(
      `Export de ${lignes.length} ligne(s) généré côté navigateur (fichier CSV ouvert par Excel).`,
    );
    window.setTimeout(() => this.messageExport.set(''), 6000);
  }

  /** Ouvre une fenêtre d’impression contenant uniquement le tableau. */
  protected imprimer(): void {
    const entetes = this.colonnes.map((c) => c.libelle);
    const lignes = this.lignes();
    const echapperHtml = (v: string) =>
      (v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const thead = `<tr>${entetes.map((h) => `<th>${echapperHtml(h)}</th>`).join('')}</tr>`;
    const tbody = lignes
      .map(
        (l) =>
          `<tr>${this.colonnes.map((c) => `<td>${echapperHtml(l[c.cle])}</td>`).join('')}</tr>`,
      )
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
      <p>Démonstration · ${lignes.length} ligne(s) · généré le ${formatDate(new Date().toISOString().slice(0, 10))}</p>
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
  protected setRecherche(v: string): void { this.recherche.set(v); this.resetPage(); }
  protected setNature(v: string): void { this.nature.set(v as NatureDossier | ''); this.resetPage(); }
  protected setService(v: string): void { this.service.set(v as ServiceDossier | ''); this.resetPage(); }
  protected setEtape(v: string): void { this.etape.set(v as EtapeDossier | ''); this.resetPage(); }
  protected allerA(p: number): void { this.page.set(Math.min(Math.max(1, p), this.totalPages())); }

  protected reinitialiser(): void {
    this.recherche.set('');
    this.nature.set('');
    this.service.set('');
    this.etape.set('');
    this.page.set(1);
  }
}
