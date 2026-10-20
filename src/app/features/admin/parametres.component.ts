import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ETAPE_LABEL,
  ETAPES,
  NATURE_LABEL,
  NATURES,
  PRIORITE_LABEL,
  PRIORITES,
  SERVICES,
  SERVICE_LABEL,
  STATUT_LABEL,
  STATUTS,
  ServiceDossier,
  TYPE_LABEL,
  TYPES,
} from '../../core/models/dossier.model';
import {
  ApplicationParametres,
  FormatDate,
  PreferencesParametres,
  ProfilParametres,
} from '../../core/models/parametres.model';
import { AuthService } from '../../core/services/auth.service';
import { ParametresStore } from '../../core/state/parametres-store';
import { IconComponent } from '../../shared/ui/icon.component';
import { LoaderComponent } from '../../shared/ui/loader.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

/** Page « Paramètres » : configuration de l'espace administrateur (API Laravel). */
@Component({
  selector: 'du-page-parametres',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent, LoaderComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './parametres.component.html',
  styleUrl: './parametres.component.scss',
})
export class ParametresComponent implements OnInit {
  private readonly store = inject(ParametresStore);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly parametres = this.store.parametres;
  protected readonly chargement = this.store.chargement;
  protected readonly erreur = this.store.erreur;
  protected readonly enCours = this.store.enCours;
  protected readonly messageSucces = this.store.message;
  protected readonly erreurAction = this.store.erreurAction;

  /** Sections « Application » et « Services » réservées aux rôles privilégiés. */
  protected readonly estPrivilegie = computed(() => {
    const role = this.auth.utilisateur()?.role;
    return role === 'admin_systeme' || role === 'administrateur';
  });

  // Référentiels affichés en lecture seule (types, statuts, priorité…).
  protected readonly servicesDisponibles = SERVICES;
  protected readonly serviceLabel = SERVICE_LABEL;
  protected readonly types = TYPES;
  protected readonly typeLabel = TYPE_LABEL;
  protected readonly statuts = STATUTS;
  protected readonly statutLabel = STATUT_LABEL;
  protected readonly priorites = PRIORITES;
  protected readonly prioriteLabel = PRIORITE_LABEL;
  protected readonly etapes = ETAPES;
  protected readonly etapeLabel = ETAPE_LABEL;
  protected readonly natures = NATURES;
  protected readonly natureLabel = NATURE_LABEL;

  protected readonly formatsDate: readonly FormatDate[] = ['dd/MM/yyyy', 'dd-MM-yyyy', 'yyyy-MM-dd'];

  // --- Formulaires ---
  protected readonly formProfil = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    service: ['DU' as ServiceDossier, Validators.required],
    fonction: [''],
    telephone: [''],
  });

  protected readonly formPreferences = this.fb.group({
    langue: ['fr' as 'fr'],
    formatDate: ['dd/MM/yyyy' as FormatDate, Validators.required],
    elementsParPage: this.fb.control(8, [Validators.required, Validators.min(5), Validators.max(50)]),
    afficherPriorites: this.fb.control(true),
    notificationsEmail: this.fb.control(false),
  });

  protected readonly formApplication = this.fb.group({
    nomApplication: ['', [Validators.required, Validators.minLength(2)]],
    entite: ['', Validators.required],
    sigle: ['', Validators.required],
    emailContact: ['', Validators.email],
    telephoneContact: [''],
    adresse: [''],
  });

  private static readonly MESSAGES: Record<string, Record<string, string>> = {
    nom: { required: 'Le nom est obligatoire.', minlength: 'Au moins 2 caractères.' },
    email: { required: 'L’adresse e-mail est obligatoire.', email: 'Adresse e-mail invalide.' },
    service: { required: 'Sélectionnez un service.' },
    elementsParPage: {
      required: 'Indiquez un nombre.',
      min: 'Minimum 5 éléments par page.',
      max: 'Maximum 50 éléments par page.',
    },
    nomApplication: {
      required: 'Le nom de l’application est obligatoire.',
      minlength: 'Au moins 2 caractères.',
    },
    entite: { required: 'L’entité est obligatoire.' },
    sigle: { required: 'Le sigle est obligatoire.' },
    emailContact: { email: 'Adresse e-mail invalide.' },
  };

  constructor() {
    // Reflète les valeurs chargées depuis l'API sans écraser une saisie en cours.
    effect(() => {
      const p = this.parametres();
      if (this.formProfil.pristine) this.formProfil.reset(p.profil);
      if (this.formPreferences.pristine) this.formPreferences.reset(p.preferences);
      if (this.formApplication.pristine) this.formApplication.reset(p.application);
    });
  }

  ngOnInit(): void {
    if (!this.estPrivilegie()) {
      this.formProfil.controls.service.disable();
    }
    this.store.charger();
  }

  /** Recharge les paramètres depuis l'API (bouton « Réessayer »). */
  protected chargerPage(): void {
    this.store.charger();
  }

  // --- Profil ---
  protected enregistrerProfil(): void {
    if (this.formProfil.invalid) {
      this.formProfil.markAllAsTouched();
      return;
    }
    const valeur = this.formProfil.getRawValue() as ProfilParametres;
    this.store.enregistrerProfil(valeur).subscribe({
      next: () => this.formProfil.markAsPristine(),
      error: () => undefined,
    });
  }

  protected annulerProfil(): void {
    this.formProfil.reset(this.parametres().profil);
    if (!this.estPrivilegie()) this.formProfil.controls.service.disable();
  }

  // --- Préférences ---
  protected enregistrerPreferences(): void {
    if (this.formPreferences.invalid) {
      this.formPreferences.markAllAsTouched();
      return;
    }
    const valeur = this.formPreferences.getRawValue() as PreferencesParametres;
    this.store.enregistrerPreferences(valeur).subscribe({
      next: () => this.formPreferences.markAsPristine(),
      error: () => undefined,
    });
  }

  protected annulerPreferences(): void {
    this.formPreferences.reset(this.parametres().preferences);
  }

  // --- Informations de l'application ---
  protected enregistrerApplication(): void {
    if (this.formApplication.invalid) {
      this.formApplication.markAllAsTouched();
      return;
    }
    const valeur = this.formApplication.getRawValue() as ApplicationParametres;
    this.store.enregistrerApplication(valeur).subscribe({
      next: () => this.formApplication.markAsPristine(),
      error: () => undefined,
    });
  }

  protected annulerApplication(): void {
    this.formApplication.reset(this.parametres().application);
  }

  // --- Services ---
  protected basculerService(code: ServiceDossier): void {
    this.store.basculerService(code).subscribe({ error: () => undefined });
  }

  // --- Aides ---
  protected invalide(form: 'profil' | 'preferences' | 'application', champ: string): boolean {
    const c = this.control(form, champ);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  protected message(form: 'profil' | 'preferences' | 'application', champ: string): string {
    const c = this.control(form, champ);
    if (!c || !c.errors) return '';
    const type = Object.keys(c.errors)[0];
    return ParametresComponent.MESSAGES[champ]?.[type] ?? 'Champ invalide.';
  }

  private control(form: 'profil' | 'preferences' | 'application', champ: string) {
    if (form === 'profil') return this.formProfil.get(champ);
    if (form === 'preferences') return this.formPreferences.get(champ);
    return this.formApplication.get(champ);
  }

  protected formatDateExemple(format: FormatDate): string {
    const jour = '28';
    const mois = '02';
    const annee = '2026';
    if (format === 'dd-MM-yyyy') return `${jour}-${mois}-${annee}`;
    if (format === 'yyyy-MM-dd') return `${annee}-${mois}-${jour}`;
    return `${jour}/${mois}/${annee}`;
  }
}
