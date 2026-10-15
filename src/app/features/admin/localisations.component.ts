import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ARRONDISSEMENTS } from '../../core/models/dossier.model';
import { LocalisationLigne } from '../../core/mappers/localisation.mapper';
import { AuthService } from '../../core/services/auth.service';
import { LocalisationsApiStore } from '../../core/state/localisations-api.store';
import { IconComponent } from '../../shared/ui/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

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
export class LocalisationsComponent implements OnInit {
  private readonly store = inject(LocalisationsApiStore);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly arrondissements = ARRONDISSEMENTS;

  // --- État serveur ---
  protected readonly lignes = this.store.localisations;
  protected readonly chargement = this.store.chargement;
  protected readonly erreur = this.store.erreur;
  protected readonly enCours = this.store.enCours;
  protected readonly pagination = this.store.pagination;
  protected readonly messageSucces = this.store.message;
  protected readonly erreurAction = this.store.erreurAction;

  /** Ajout / modification / suppression réservés aux rôles privilégiés. */
  protected readonly estPrivilegie = computed(() => {
    const role = this.auth.utilisateur()?.role;
    return role === 'admin_systeme' || role === 'administrateur';
  });

  // --- Filtres ---
  protected readonly recherche = signal('');
  protected readonly arrondissement = signal('');
  protected readonly association = signal<FiltreAssociation>('');
  protected readonly filtresActifs = computed(
    () => !!(this.recherche() || this.arrondissement() || this.association()),
  );

  // --- Formulaire ---
  protected readonly formulaireOuvert = signal(false);
  protected readonly editionId = signal<number | null>(null);

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

  ngOnInit(): void {
    this.charger(1);
  }

  private charger(page: number): void {
    this.store.chargerListe({
      search: this.recherche().trim() || undefined,
      arrondissement: this.arrondissement() || undefined,
      association: this.association() || undefined,
      page,
    });
  }

  protected ouvrirAjout(): void {
    this.store.effacerMessages();
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

  protected ouvrirEdition(loc: LocalisationLigne): void {
    this.store.effacerMessages();
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

  /** Enregistre (création ou modification) via l'API enregistre puis ferme la fenêtre. */
  protected enregistrer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valeur = this.form.getRawValue();
    const id = this.editionId();
    const operation = id !== null ? this.store.modifier(id, valeur) : this.store.creer(valeur);
    operation.subscribe({
      next: () => this.fermerFormulaire(),
      error: () => undefined,
    });
  }

  protected supprimer(loc: LocalisationLigne): void {
    const message =
      loc.nombre > 0
        ? `Cette localisation est associée à ${loc.nombre} dossier(s). La supprimer quand même ?`
        : `Supprimer la localisation « ${loc.adresse} » ?`;
    const ok = typeof window === 'undefined' || window.confirm(message);
    if (!ok) return;
    this.store.supprimer(loc.id).subscribe({ error: () => undefined });
  }

  // --- Filtres et pagination ---
  protected setRecherche(v: string): void { this.recherche.set(v); }
  protected setArrondissement(v: string): void { this.arrondissement.set(v); }
  protected setAssociation(v: string): void { this.association.set(v as FiltreAssociation); }

  protected rechercher(): void {
    this.charger(1);
  }

  protected reinitialiser(): void {
    this.recherche.set('');
    this.arrondissement.set('');
    this.association.set('');
    this.charger(1);
  }

  protected allerA(page: number): void {
    const total = this.pagination().dernierPage;
    this.charger(Math.min(Math.max(1, page), total));
  }
}
