import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceDossier } from '../../core/models/dossier.model';
import {
  ApplicationParametres,
  PreferencesParametres,
  ProfilParametres,
  ReferentielItem,
} from '../../core/models/parametres.model';
import { AuthService } from '../../core/services/auth.service';
import { ParametresStore } from '../../core/state/parametres-store';
import { IconComponent } from '../../shared/ui/icon.component';
import { LoaderComponent } from '../../shared/ui/loader.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

/** Motif accepté pour les numéros de téléphone (chiffres et séparateurs). */
const MOTIF_TELEPHONE = /^[0-9 +().-]{6,50}$/;

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
  protected readonly sectionEnCours = this.store.sectionEnCours;
  protected readonly messageSucces = this.store.message;
  protected readonly erreurAction = this.store.erreurAction;
  protected readonly erreursServeur = this.store.erreursChamps;

  /** Sections « Application » et « Services » réservées aux rôles privilégiés. */
  protected readonly estPrivilegie = computed(() => {
    const role = this.auth.utilisateur()?.role;
    return role === 'admin_systeme' || role === 'administrateur';
  });

  /** Référentiels du domaine fournis par l'API Laravel. */
  protected readonly referentiels = computed(() => this.parametres().referentiels);

  /** Services proposés (liste globale renvoyée par l'API). */
  protected readonly services = computed(() => this.parametres().services);

  /** Codes des services, pour l'en-tête de la section « Services ». */
  protected readonly codesServices = computed(() =>
    this.services()
      .map((service) => service.code)
      .join(', '),
  );

  // --- Formulaires ---
  protected readonly formProfil = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    service: this.fb.control<ServiceDossier>('DU', [Validators.required]),
    fonction: ['', [Validators.maxLength(255)]],
    telephone: ['', [Validators.pattern(MOTIF_TELEPHONE), Validators.maxLength(50)]],
  });

  protected readonly formPreferences = this.fb.group({
    langue: ['fr', [Validators.required]],
    formatDate: ['dd/MM/yyyy', [Validators.required]],
    elementsParPage: this.fb.control(8, [
      Validators.required,
      Validators.pattern(/^[0-9]+$/),
      Validators.min(5),
      Validators.max(50),
    ]),
    afficherPriorites: this.fb.control(true),
    notificationsEmail: this.fb.control(false),
  });

  protected readonly formApplication = this.fb.group({
    nomApplication: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    entite: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    sigle: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
    emailContact: ['', [Validators.email, Validators.maxLength(255)]],
    telephoneContact: ['', [Validators.pattern(MOTIF_TELEPHONE), Validators.maxLength(50)]],
    adresse: ['', [Validators.maxLength(255)]],
  });

  private static readonly MESSAGES: Record<string, Record<string, string>> = {
    nom: {
      required: 'Le nom complet est obligatoire.',
      minlength: 'Au moins 2 caractères.',
      maxlength: '255 caractères maximum.',
    },
    email: {
      required: 'L’adresse e-mail est obligatoire.',
      email: 'Adresse e-mail invalide.',
      maxlength: '255 caractères maximum.',
    },
    service: { required: 'Sélectionnez un service.' },
    fonction: { maxlength: '255 caractères maximum.' },
    telephone: {
      pattern: 'Numéro invalide : chiffres, espaces et + - ( ) . uniquement.',
      maxlength: '50 caractères maximum.',
    },
    elementsParPage: {
      required: 'Indiquez un nombre.',
      pattern: 'Le nombre d’éléments par page doit être un entier.',
      min: 'Minimum 5 éléments par page.',
      max: 'Maximum 50 éléments par page.',
    },
    nomApplication: {
      required: 'Le nom de l’application est obligatoire.',
      minlength: 'Au moins 2 caractères.',
      maxlength: '255 caractères maximum.',
    },
    entite: {
      required: 'L’entité est obligatoire.',
      minlength: 'Au moins 2 caractères.',
      maxlength: '255 caractères maximum.',
    },
    sigle: {
      required: 'Le sigle est obligatoire.',
      minlength: 'Au moins 1 caractère.',
      maxlength: '50 caractères maximum.',
    },
    emailContact: {
      email: 'Adresse e-mail invalide.',
      maxlength: '255 caractères maximum.',
    },
    telephoneContact: {
      pattern: 'Numéro invalide : chiffres, espaces et + - ( ) . uniquement.',
      maxlength: '50 caractères maximum.',
    },
    adresse: { maxlength: '255 caractères maximum.' },
  };

  constructor() {
    // Reflète les valeurs chargées depuis l'API sans écraser une saisie en cours.
    effect(() => {
      const p = this.parametres();
      if (this.formProfil.pristine) {
        this.formProfil.reset(
          { ...p.profil, service: p.profil.service ?? 'DU' },
          { emitEvent: false },
        );
      }
      if (this.formPreferences.pristine) {
        this.formPreferences.reset(p.preferences, { emitEvent: false });
      }
      if (this.formApplication.pristine) {
        this.formApplication.reset(p.application, { emitEvent: false });
      }
    });

    // Le service de l'utilisateur n'est modifiable que par un rôle privilégié.
    effect(() => {
      const controle = this.formProfil.controls.service;
      if (this.estPrivilegie() && controle.disabled) {
        controle.enable({ emitEvent: false });
      } else if (!this.estPrivilegie() && controle.enabled) {
        controle.disable({ emitEvent: false });
      }
    });

    // Toute modification de la part de l'utilisateur masque les messages
    // de la sauvegarde précédente.
    this.formProfil.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.store.effacerMessages());
    this.formPreferences
      .valueChanges.pipe(takeUntilDestroyed())
      .subscribe(() => this.store.effacerMessages());
    this.formApplication
      .valueChanges.pipe(takeUntilDestroyed())
      .subscribe(() => this.store.effacerMessages());
  }

  ngOnInit(): void {
    this.store.charger();
  }

  /** Recharge les paramètres depuis l'API (bouton « Réessayer »). */
  protected chargerPage(): void {
    this.store.effacerMessages();
    this.store.charger();
  }

  // --- Profil ---
  protected enregistrerProfil(): void {
    if (this.formProfil.invalid) {
      this.formProfil.markAllAsTouched();
      return;
    }

    const valeur = this.formProfil.getRawValue();
    // Le service n'est transmis que par un rôle privilégié : le serveur
    // refuse toute modification de service par un agent.
    const charge = { ...(valeur as ProfilParametres) };
    if (!this.estPrivilegie() || !charge.service) {
      delete (charge as Partial<ProfilParametres>).service;
    }

    this.store.enregistrerProfil(charge).subscribe({
      next: () => this.formProfil.markAsPristine(),
      error: () => undefined,
    });
  }

  protected annulerProfil(): void {
    const p = this.parametres().profil;
    this.formProfil.reset({ ...p, service: p.service ?? 'DU' }, { emitEvent: false });
    this.formProfil.markAsPristine();
    this.store.effacerMessages();
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
    this.formPreferences.reset(this.parametres().preferences, { emitEvent: false });
    this.formPreferences.markAsPristine();
    this.store.effacerMessages();
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
    this.formApplication.reset(this.parametres().application, { emitEvent: false });
    this.formApplication.markAsPristine();
    this.store.effacerMessages();
  }

  // --- Services ---
  protected basculerService(code: ServiceDossier): void {
    this.store.basculerService(code).subscribe({ error: () => undefined });
  }

  // --- Aides ---
  protected invalide(form: 'profil' | 'preferences' | 'application', champ: string): boolean {
    if (this.erreursServeur()[champ]) {
      return true;
    }
    const c = this.control(form, champ);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  protected message(form: 'profil' | 'preferences' | 'application', champ: string): string {
    const erreurServeur = this.erreursServeur()[champ];
    if (erreurServeur) {
      return erreurServeur;
    }
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

  /** Libellé d'un service, résolu à partir de la liste renvoyée par l'API. */
  protected libelleService(code: string | null | undefined): string {
    return this.services().find((service) => service.code === code)?.libelle ?? '—';
  }

  /** Texte affiché pour une entrée de référentiel (exemple si disponible). */
  protected libelleReferentiel(item: ReferentielItem): string {
    return item.exemple ?? item.libelle;
  }
}
