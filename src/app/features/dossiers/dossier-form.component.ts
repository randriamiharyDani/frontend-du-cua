import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ARRONDISSEMENTS, DossierFormValue, ETAPE_LABEL, ETAPES, EtapeDossier, NATURE_LABEL, NATURES, NatureDossier,
  PRIORITE_LABEL, PRIORITES, PrioriteDossier, SERVICE_LABEL, SERVICES, ServiceDossier,
  STATUT_LABEL, STATUTS, StatutDossier, TYPE_LABEL, TYPES, TypeInfraction,
} from '../../core/models/dossier.model';
import { DossierApiStore } from '../../core/state/dossier-api.store';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

/** Aujourd’hui au format ISO `yyyy-MM-dd` (valeur par défaut des champs date). */
const aujourdHui = () => new Date().toISOString().slice(0, 10);

/** Champ facultatif : n’accepte que des chiffres, espaces, signes + / - et point décimal. */
function coordonneeValide(control: AbstractControl): ValidationErrors | null {
  const valeur = (control.value ?? '').toString().trim();
  if (!valeur) return null;
  return /^[+-]?\d+(\.\d+)?$/.test(valeur) ? null : { coordonnee: true };
}

@Component({
  selector: 'du-dossier-form',
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dossier-form.component.html',
  styles: `
    .form-sections { display: grid; gap: 1rem; }
    .api-note {
      display: flex; align-items: center; gap: 0.5rem; margin: 0 0 1rem; padding: 0.6rem 0.85rem;
      border-radius: var(--du-radius); background: #eef4fc; border: 1px solid #cfe0f5;
      color: #2b5b8a; font-size: 0.85rem;
    }
    .hint { color: var(--du-muted); font-size: 0.78rem; }
    .hint--absent { font-style: italic; }
    .checkbox { display: flex; align-items: center; gap: 0.5rem; font-weight: 500; cursor: pointer; }
    .checkbox input { width: 1rem; height: 1rem; }
    .form-message { margin: 0 0 1rem; padding: 0.5rem 0.75rem; border-radius: var(--du-radius); font-size: 0.85rem; }
    .form-message--erreur { background: var(--du-danger-soft); color: var(--du-danger); }
  `,
})
export class DossierFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(DossierApiStore);
  private readonly router = inject(Router);

  protected readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
  /** Mode édition si un identifiant de dossier est présent dans l’URL. */
  protected readonly edition = !!this.id;

  /** Indicateurs exposés par le store (chargement / erreurs / action en cours). */
  protected readonly chargementDetail = this.store.chargementDetail;
  protected readonly erreurDetail = this.store.erreurDetail;
  protected readonly erreurAction = this.store.erreurAction;
  protected readonly enCours = this.store.enCours;

  protected readonly types = TYPES;
  protected readonly statuts = STATUTS;
  protected readonly priorites = PRIORITES;
  protected readonly arrondissements = ARRONDISSEMENTS;
  protected readonly services = SERVICES;
  protected readonly natures = NATURES;
  protected readonly etapes = ETAPES;
  protected readonly typeLabel = TYPE_LABEL;
  protected readonly statutLabel = STATUT_LABEL;
  protected readonly prioriteLabel = PRIORITE_LABEL;
  protected readonly serviceLabel = SERVICE_LABEL;
  protected readonly natureLabel = NATURE_LABEL;
  protected readonly etapeLabel = ETAPE_LABEL;

  /** Empêche de patcher plusieurs fois le formulaire en mode édition. */
  private patchApplique = false;

  /**
   * Formulaire réparti par sections.
   * Les champs sans équivalent API (type, priorité, agent, prénom, quartier…)
   * restent affichés mais ne sont ni requis ni envoyés au serveur.
   */
  protected readonly form = this.fb.group({
    // Suivi du traitement (service envoyé à la création ; étape/statut pilotés serveur).
    type: ['construction_sans_permis' as TypeInfraction],
    service: ['DU' as ServiceDossier, Validators.required],
    etape: ['constat' as EtapeDossier],
    statut: ['signale' as StatutDossier],
    priorite: ['moyenne' as PrioriteDossier],
    agent: [''],
    attentionRequise: [false],
    motifAttention: [''],

    // 1. Informations du dossier.
    infos: this.fb.group({
      numero: ['', [Validators.required, Validators.maxLength(40)]],
      dateEntree: [aujourdHui(), Validators.required],
      referenceEtude: [''],
      idemEtude: [''],
      dateEtude: [''],
      referenceArrivee: [''],
      provenance: [''],
      nature: ['plainte' as NatureDossier, Validators.required],
    }),

    // 2. Contrevenant.
    contrevenant: this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: [''],
      telephone: ['', Validators.pattern(/^(\+224|0)[\d\s]{8,13}$/)],
      adresse: [''],
      observations: [''],
    }),

    // 3. Localisation.
    localisation: this.fb.group({
      adresse: ['', Validators.required],
      localisation: [''],
      quartier: [''],
      arrondissement: [''],
      coordX: ['', coordonneeValide],
      coordY: ['', coordonneeValide],
      latitude: ['', coordonneeValide],
      longitude: ['', coordonneeValide],
      description: [''],
    }),

    // 4. Informations complémentaires.
    complements: this.fb.group({
      objet: ['', [Validators.required, Validators.minLength(5)]],
      emplacement: [''],
      dossierRelatif: [''],
      observationsGenerales: [''],
    }),

    // 5. Arrêté d’interruption et suites (scellage, démolition / enlèvement).
    arretes: this.fb.group({
      refArrete: [''],
      dateArrete: [''],
      objetArrete: [''],
      dateScellage: [''],
      dateDemolOuEnlevement: [''],
    }),
  });

  /** Messages d’erreur en français, indexés par chemin de contrôle puis type d’erreur. */
  private static readonly MESSAGES: Record<string, Record<string, string>> = {
    'infos.numero': {
      required: 'Le numéro du dossier est obligatoire.',
      maxlength: 'Le numéro ne doit pas dépasser 40 caractères.',
    },
    'infos.dateEntree': { required: 'La date d’entrée est obligatoire.' },
    'infos.nature': { required: 'Sélectionnez la nature du dossier.' },
    'contrevenant.nom': { required: 'Le nom est obligatoire.', minlength: 'Au moins 2 caractères.' },
    'contrevenant.telephone': { pattern: 'Numéro invalide (ex. 034 00 000 00).' },
    'localisation.adresse': { required: 'L’adresse est obligatoire.' },
    'localisation.coordX': { coordonnee: 'Coordonnée X numérique attendue.' },
    'localisation.coordY': { coordonnee: 'Coordonnée Y numérique attendue.' },
    'localisation.latitude': { coordonnee: 'Latitude invalide (ex. 9.5370).' },
    'localisation.longitude': { coordonnee: 'Longitude invalide (ex. -13.6773).' },
    'complements.objet': { required: 'L’objet est obligatoire.', minlength: 'Au moins 5 caractères.' },
  };

  constructor() {
    if (!this.id) return;
    this.store.chargerDetail(this.id);
    effect(() => {
      const dossier = this.store.dossier();
      if (this.patchApplique || !dossier || dossier.id !== this.id) return;
      this.patchApplique = true;
      this.form.patchValue(dossier);
    });
  }

  /** Contrôle invalide et déjà touché / modifié → affiche l’état d’erreur. */
  protected invalide(chemin: string): boolean {
    const controle = this.form.get(chemin);
    return !!controle && controle.invalid && (controle.touched || controle.dirty);
  }

  /** Premier message d’erreur français associé au champ. */
  protected message(chemin: string): string {
    const controle = this.form.get(chemin);
    if (!controle || !controle.errors) return '';
    const type = Object.keys(controle.errors)[0];
    return DossierFormComponent.MESSAGES[chemin]?.[type] ?? 'Champ invalide.';
  }

  /** Crée (POST) ou met à jour (PUT) le dossier via l’API puis redirige vers le détail. */
  protected enregistrer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valeur: DossierFormValue = this.form.getRawValue();

    if (this.id) {
      this.store.modifier(this.id, valeur).subscribe({
        next: () => this.router.navigate(['/admin/dossiers', this.id]),
        error: () => undefined,
      });
      return;
    }

    this.store.creer(valeur).subscribe({
      next: (dossier) => this.router.navigate(['/admin/dossiers', dossier.id]),
      error: () => undefined,
    });
  }
}
