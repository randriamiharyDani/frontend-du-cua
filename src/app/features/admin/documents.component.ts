import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  DOCUMENT_TYPES,
  DocumentFormValue,
  TYPE_DOCUMENT_LABEL,
  TypeDocument,
} from '../../core/models/dossier.model';
import { DossierStore } from '../../core/state/dossier-store';
import { ADMIN_CURRENT_USER } from '../../layout/admin-navigation';
import { IconComponent } from '../../shared/ui/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

const aujourdHui = () => new Date().toISOString().slice(0, 10);

const normaliser = (s: string) =>
  (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Formate une taille de fichier en unité lisible. */
function formaterTaille(octets: number): string {
  if (!octets) return '—';
  const unites = ['o', 'Ko', 'Mo', 'Go'];
  const i = Math.min(unites.length - 1, Math.floor(Math.log(octets) / Math.log(1024)));
  const valeur = octets / Math.pow(1024, i);
  return `${valeur.toFixed(i === 0 ? 0 : 1).replace('.', ',')} ${unites[i]}`;
}

/** Page « Documents » : consultation des pièces fictives associées aux dossiers. */
@Component({
  selector: 'du-page-documents',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, IconComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss',
  host: { '(document:keydown.escape)': 'fermerFormulaire()' },
})
export class DocumentsComponent {
  private readonly store = inject(DossierStore);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly types = DOCUMENT_TYPES;
  protected readonly typeLabel = TYPE_DOCUMENT_LABEL;
  protected readonly dossiers = this.store.dossiers;
  protected readonly utilisateur = ADMIN_CURRENT_USER;

  // --- Filtres ---
  protected readonly recherche = signal('');
  protected readonly type = signal<TypeDocument | ''>('');
  protected readonly dossierId = signal('');
  private readonly page = signal(1);
  protected readonly taillePage = 8;

  protected readonly messageSucces = signal('');
  /** Document dont le panneau de détails est déplié (interaction locale). */
  protected readonly documentOuvert = signal<string | null>(null);

  /** Documents enrichis du numéro de dossier associé. */
  protected readonly lignes = computed(() => {
    const dossiers = this.store.dossiers();
    return this.store.documents().map((doc) => {
      const dossier = dossiers.find((d) => d.id === doc.dossierId);
      return {
        ...doc,
        numeroDossier: dossier?.reference ?? '—',
        objetDossier: dossier?.complements.objet ?? '',
      };
    });
  });

  /** Documents filtrés, du plus récent au plus ancien. */
  protected readonly filtres = computed(() => {
    const q = normaliser(this.recherche().trim());
    const type = this.type();
    const dossierId = this.dossierId();
    return this.lignes()
      .filter((d) => {
        if (type && d.type !== type) return false;
        if (dossierId && d.dossierId !== dossierId) return false;
        if (!q) return true;
        const hay = normaliser(
          [d.nom, this.typeLabel[d.type], d.reference, d.numeroDossier, d.observations ?? ''].join(' '),
        );
        return hay.includes(q);
      })
      .sort((a, b) => b.dateDepot.localeCompare(a.dateDepot));
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtres().length / this.taillePage)),
  );
  protected readonly pageCourante = computed(() => Math.min(this.page(), this.totalPages()));
  protected readonly affiches = computed(() => {
    const debut = (this.pageCourante() - 1) * this.taillePage;
    return this.filtres().slice(debut, debut + this.taillePage);
  });
  protected readonly filtresActifs = computed(
    () => !!(this.recherche() || this.type() || this.dossierId()),
  );

  // --- Formulaire de saisie ---
  protected readonly formulaireOuvert = signal(false);
  /** Fichier choisi localement (démonstration : aucun envoi réel). */
  protected readonly fichier = signal<{ nom: string; taille: string } | null>(null);

  protected readonly form = this.fb.group({
    dossierId: ['', Validators.required],
    nom: ['', [Validators.required, Validators.minLength(2)]],
    type: ['' as TypeDocument, Validators.required],
    reference: [''],
    dateDepot: [aujourdHui(), Validators.required],
    observations: [''],
  });

  private static readonly MESSAGES: Record<string, Record<string, string>> = {
    dossierId: { required: 'Sélectionnez le dossier concerné.' },
    nom: { required: 'Le nom du document est obligatoire.', minlength: 'Au moins 2 caractères.' },
    type: { required: 'Sélectionnez un type de document.' },
    dateDepot: { required: 'La date est obligatoire.' },
  };

  protected ouvrirFormulaire(): void {
    this.form.reset({
      dossierId: '',
      nom: '',
      type: '' as TypeDocument,
      reference: '',
      dateDepot: aujourdHui(),
      observations: '',
    });
    this.fichier.set(null);
    this.formulaireOuvert.set(true);
  }

  protected fermerFormulaire(): void {
    this.formulaireOuvert.set(false);
  }

  /** Mémorise le fichier choisi (démonstration) et pré-remplit le nom si nécessaire. */
  protected onFichier(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fichier = input.files?.[0];
    if (!fichier) {
      this.fichier.set(null);
      return;
    }
    this.fichier.set({ nom: fichier.name, taille: formaterTaille(fichier.size) });
    if (!this.form.controls.nom.value.trim()) {
      this.form.controls.nom.setValue(fichier.name.replace(/\.[^.]+$/, ''));
    }
  }

  protected invalide(champ: string): boolean {
    const c = this.form.get(champ);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  protected message(champ: string): string {
    const c = this.form.get(champ);
    if (!c || !c.errors) return '';
    const type = Object.keys(c.errors)[0];
    return DocumentsComponent.MESSAGES[champ]?.[type] ?? 'Champ invalide.';
  }

  /** Enregistre localement (démonstration) puis ferme la fenêtre. */
  protected enregistrer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const valeur: DocumentFormValue = {
      dossierId: v.dossierId,
      nom: v.nom.trim(),
      type: v.type,
      reference: v.reference.trim(),
      dateDepot: v.dateDepot,
      observations: v.observations.trim(),
      taille: this.fichier()?.taille ?? '—',
      deposePar: this.utilisateur.nom,
    };
    this.store.addDocument(valeur);
    this.fermerFormulaire();
    this.messageSucces.set(
      'Document ajouté localement (simulation) — fichier non téléversé, aucune donnée enregistrée de façon permanente.',
    );
    window.setTimeout(() => this.messageSucces.set(''), 7000);
  }

  protected basculerDetails(id: string): void {
    this.documentOuvert.update((courant) => (courant === id ? null : id));
  }

  private resetPage(): void {
    this.page.set(1);
  }
  protected setRecherche(v: string): void { this.recherche.set(v); this.resetPage(); }
  protected setType(v: string): void { this.type.set(v as TypeDocument | ''); this.resetPage(); }
  protected setDossier(v: string): void { this.dossierId.set(v); this.resetPage(); }
  protected allerA(p: number): void { this.page.set(Math.min(Math.max(1, p), this.totalPages())); }

  protected reinitialiser(): void {
    this.recherche.set('');
    this.type.set('');
    this.dossierId.set('');
    this.page.set(1);
  }
}
