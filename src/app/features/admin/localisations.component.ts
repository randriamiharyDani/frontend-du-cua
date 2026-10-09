import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import {
  ARRONDISSEMENTS,
  Localisation,
  LocalisationFormValue,
} from '../../core/models/dossier.model';
import { DossierStore } from '../../core/state/dossier-store';
import { IconComponent } from '../../shared/ui/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

const normaliser = (s: string) =>
  (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Champ facultatif : n’accepte que des chiffres, signes + / - et point décimal. */
function coordonneeValide(control: AbstractControl): ValidationErrors | null {
  const valeur = (control.value ?? '').toString().trim();
  if (!valeur) return null;
  return /^[+-]?\d+([.,]\d+)?$/.test(valeur.replace(/\s/g, '')) ? null : { coordonnee: true };
}

type FiltreAssociation = '' | 'avec' | 'sans';

/** Page « Localisations » : référentiel des zones et de leurs coordonnées. */
@Component({
  selector: 'du-page-localisations',
  imports: [ReactiveFormsModule, IconComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './localisations.component.html',
  styleUrl: './localisations.component.scss',
  host: { '(document:keydown.escape)': 'fermerFormulaire()' },
})
export class LocalisationsComponent {
  private readonly store = inject(DossierStore);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly arrondissements = ARRONDISSEMENTS;

  // --- Filtres ---
  protected readonly recherche = signal('');
  protected readonly arrondissement = signal('');
  protected readonly association = signal<FiltreAssociation>('');
  private readonly page = signal(1);
  protected readonly taillePage = 8;

  protected readonly messageSucces = signal('');

  /** Localisations enrichies du nombre de dossiers associés (par quartier ou adresse). */
  protected readonly lignes = computed(() => {
    const dossiers = this.store.dossiers();
    return this.store.localisations().map((loc: Localisation) => {
      const q = normaliser(loc.quartier);
      const a = normaliser(loc.adresse);
      const nombre = dossiers.filter((d) => {
        const lq = normaliser(d.localisation.quartier);
        const la = normaliser(d.localisation.adresse);
        return (!!q && lq === q) || (!!a && la === a);
      }).length;
      return { ...loc, nombre };
    });
  });

  protected readonly filtres = computed(() => {
    const q = normaliser(this.recherche().trim());
    const arr = this.arrondissement();
    const assoc = this.association();
    return this.lignes()
      .filter((l) => {
        if (arr && l.arrondissement !== arr) return false;
        if (assoc === 'avec' && l.nombre === 0) return false;
        if (assoc === 'sans' && l.nombre > 0) return false;
        if (!q) return true;
        return normaliser([l.adresse, l.quartier, l.arrondissement].join(' ')).includes(q);
      })
      .sort(
        (a, b) =>
          a.arrondissement.localeCompare(b.arrondissement) || a.quartier.localeCompare(b.quartier),
      );
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
    () => !!(this.recherche() || this.arrondissement() || this.association()),
  );

  // --- Formulaire ---
  protected readonly formulaireOuvert = signal(false);
  protected readonly editionId = signal<string | null>(null);

  protected readonly form = this.fb.group({
    adresse: ['', [Validators.required, Validators.minLength(3)]],
    quartier: ['', [Validators.required, Validators.minLength(2)]],
    arrondissement: ['', Validators.required],
    coordX: ['', coordonneeValide],
    coordY: ['', coordonneeValide],
    latitude: ['', coordonneeValide],
    longitude: ['', coordonneeValide],
  });

  private static readonly MESSAGES: Record<string, Record<string, string>> = {
    adresse: { required: 'L’adresse est obligatoire.', minlength: 'Au moins 3 caractères.' },
    quartier: { required: 'Le quartier est obligatoire.', minlength: 'Au moins 2 caractères.' },
    arrondissement: { required: 'Sélectionnez un arrondissement.' },
    coordX: { coordonnee: 'Coordonnée X invalide (chiffres uniquement).' },
    coordY: { coordonnee: 'Coordonnée Y invalide (chiffres uniquement).' },
    latitude: { coordonnee: 'Latitude invalide (ex. 9.5370).' },
    longitude: { coordonnee: 'Longitude invalide (ex. -13.6773).' },
  };

  protected ouvrirAjout(): void {
    this.editionId.set(null);
    this.form.reset({
      adresse: '',
      quartier: '',
      arrondissement: '',
      coordX: '',
      coordY: '',
      latitude: '',
      longitude: '',
    });
    this.formulaireOuvert.set(true);
  }

  protected ouvrirEdition(loc: Localisation): void {
    this.editionId.set(loc.id);
    this.form.reset({
      adresse: loc.adresse,
      quartier: loc.quartier,
      arrondissement: loc.arrondissement,
      coordX: loc.coordX,
      coordY: loc.coordY,
      latitude: loc.latitude,
      longitude: loc.longitude,
    });
    this.formulaireOuvert.set(true);
  }

  protected fermerFormulaire(): void {
    this.formulaireOuvert.set(false);
  }

  protected invalide(champ: string): boolean {
    const c = this.form.get(champ);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  protected message(champ: string): string {
    const c = this.form.get(champ);
    if (!c || !c.errors) return '';
    const type = Object.keys(c.errors)[0];
    return LocalisationsComponent.MESSAGES[champ]?.[type] ?? 'Champ invalide.';
  }

  /** Enregistre localement (démonstration) puis ferme la fenêtre. */
  protected enregistrer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valeur: LocalisationFormValue = this.form.getRawValue();
    const id = this.editionId();
    if (id) {
      this.store.updateLocalisation(id, valeur);
    } else {
      this.store.addLocalisation(valeur);
    }
    this.fermerFormulaire();
    this.messageSucces.set(
      id
        ? 'Localisation modifiée localement (simulation) — non enregistré de façon permanente.'
        : 'Localisation ajoutée localement (simulation) — non enregistré de façon permanente.',
    );
    window.setTimeout(() => this.messageSucces.set(''), 6000);
  }

  protected supprimer(loc: Localisation): void {
    const ok =
      typeof window === 'undefined' ||
      window.confirm(`Supprimer la localisation « ${loc.adresse} » ? (démonstration)`);
    if (!ok) return;
    this.store.supprimerLocalisation(loc.id);
  }

  private resetPage(): void {
    this.page.set(1);
  }
  protected setRecherche(v: string): void { this.recherche.set(v); this.resetPage(); }
  protected setArrondissement(v: string): void { this.arrondissement.set(v); this.resetPage(); }
  protected setAssociation(v: string): void { this.association.set(v as FiltreAssociation); this.resetPage(); }
  protected allerA(p: number): void { this.page.set(Math.min(Math.max(1, p), this.totalPages())); }

  protected reinitialiser(): void {
    this.recherche.set('');
    this.arrondissement.set('');
    this.association.set('');
    this.page.set(1);
  }
}
