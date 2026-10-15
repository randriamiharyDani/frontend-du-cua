import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  DOCUMENT_TYPES,
  TYPE_DOCUMENT_LABEL,
  TypeDocument,
} from '../../core/models/dossier.model';
import { DocumentLigne } from '../../core/mappers/document.mapper';
import { DocumentsApiStore } from '../../core/state/documents-api.store';
import { IconComponent } from '../../shared/ui/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

/** Formate une taille de fichier en unité lisible. */
function formaterTaille(octets: number): string {
  if (!octets) return '—';
  const unites = ['o', 'Ko', 'Mo', 'Go'];
  const i = Math.min(unites.length - 1, Math.floor(Math.log(octets) / Math.log(1024)));
  const valeur = octets / Math.pow(1024, i);
  return `${valeur.toFixed(i === 0 ? 0 : 1).replace('.', ',')} ${unites[i]}`;
}

/** Fichier choisi localement avant envoi. */
interface FichierChoisi {
  fichier: File;
  nom: string;
  taille: string;
}

/** Page « Documents » : pièces jointes des dossiers (API réelle). */
@Component({
  selector: 'du-page-documents',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, IconComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss',
  host: { '(document:keydown.escape)': 'fermerFormulaire()' },
})
export class DocumentsComponent {
  private readonly store = inject(DocumentsApiStore);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly types = DOCUMENT_TYPES;
  protected readonly typeLabel = TYPE_DOCUMENT_LABEL;

  protected readonly documents = this.store.documents;
  protected readonly chargement = this.store.chargement;
  protected readonly erreur = this.store.erreur;
  protected readonly pagination = this.store.pagination;
  protected readonly dossiers = this.store.dossiers;
  protected readonly enCours = this.store.enCours;
  protected readonly messageSucces = this.store.message;
  protected readonly erreurAction = this.store.erreurAction;

  // --- Filtres ---
  protected readonly recherche = signal('');
  protected readonly type = signal<TypeDocument | ''>('');
  protected readonly dossierId = signal<number | ''>('');
  private readonly page = signal(1);
  protected readonly taillePage = 8;

  protected readonly filtresActifs = computed(
    () => !!(this.recherche() || this.type() || this.dossierId()),
  );

  // --- Formulaire de dépôt ---
  protected readonly formulaireOuvert = signal(false);
  protected readonly fichier = signal<FichierChoisi | null>(null);
  protected readonly erreurFichier = signal('');

  protected readonly form = this.fb.group({
    dossierId: ['', Validators.required],
    type: ['' as TypeDocument, Validators.required],
    libelle: [''],
  });

  private static readonly MESSAGES: Record<string, Record<string, string>> = {
    dossierId: { required: 'Sélectionnez le dossier concerné.' },
    type: { required: 'Sélectionnez un type de document.' },
  };

  constructor() {
    this.store.chargerDossiers();
    this.charger();
  }

  /** Interroge l'API avec les filtres courants. */
  private charger(): void {
    this.store.chargerListe({
      search: this.recherche().trim(),
      type: this.type(),
      dossier_id: this.dossierId(),
      per_page: this.taillePage,
      page: this.page(),
    });
  }

  protected ouvrirFormulaire(): void {
    this.store.effacerMessages();
    this.form.reset({
      dossierId: '',
      type: '' as TypeDocument,
      libelle: '',
    });
    this.fichier.set(null);
    this.erreurFichier.set('');
    this.formulaireOuvert.set(true);
  }

  protected fermerFormulaire(): void {
    this.formulaireOuvert.set(false);
  }

  /** Mémorise le fichier choisi localement. */
  protected onFichier(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fichier = input.files?.[0];
    if (!fichier) {
      this.fichier.set(null);
      return;
    }
    this.fichier.set({ fichier, nom: fichier.name, taille: formaterTaille(fichier.size) });
    this.erreurFichier.set('');
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

  /** Téléverse le document vers l'API puis ferme la fenêtre. */
  protected enregistrer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const choisi = this.fichier();
    if (!choisi) {
      this.erreurFichier.set('Sélectionnez un fichier à téléverser.');
      return;
    }

    const v = this.form.getRawValue();
    const donnees = new FormData();
    donnees.append('file', choisi.fichier);
    donnees.append('type', v.type);
    if (v.libelle.trim()) {
      donnees.append('libelle', v.libelle.trim());
    }

    this.store.deposer(v.dossierId, donnees).subscribe({
      next: () => this.fermerFormulaire(),
    });
  }

  /** Télécharge le fichier via l'endpoint authentifié. */
  protected telecharger(ligne: DocumentLigne): void {
    this.store.telecharger(ligne);
  }

  private resetPage(): void {
    this.page.set(1);
  }
  protected setRecherche(v: string): void { this.recherche.set(v); this.resetPage(); }
  protected setType(v: string): void { this.type.set(v as TypeDocument | ''); this.resetPage(); }
  protected setDossier(v: string): void { this.dossierId.set(v === '' ? '' : Number(v)); this.resetPage(); }

  protected allerA(p: number): void {
    this.page.set(Math.min(Math.max(1, p), this.pagination().dernierPage));
    this.charger();
  }

  /** Applique les filtres en revenant à la première page. */
  protected rechercher(): void {
    this.resetPage();
    this.charger();
  }

  protected reinitialiser(): void {
    this.recherche.set('');
    this.type.set('');
    this.dossierId.set('');
    this.page.set(1);
    this.charger();
  }
}
