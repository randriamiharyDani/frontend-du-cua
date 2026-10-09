import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ARRONDISSEMENTS, DossierFormValue, ETAPE_LABEL, ETAPES, EtapeDossier, NATURE_LABEL, NATURES, NatureDossier,
  NUMERO_TEMPORAIRE, PRIORITE_LABEL, PRIORITES, PrioriteDossier, SERVICE_LABEL, SERVICES, ServiceDossier,
  STATUT_LABEL, STATUTS, StatutDossier, TYPE_LABEL, TYPES, TypeInfraction,
} from '../../core/models/dossier.model';
import { DossierStore } from '../../core/state/dossier-store';
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
    .demo-note {
      display: flex; align-items: center; gap: 0.5rem; margin: 0 0 1rem; padding: 0.6rem 0.85rem;
      border-radius: var(--du-radius); background: #fbf1de; border: 1px solid #f0dcb4;
      color: #8a5a12; font-size: 0.85rem;
    }
    .hint { color: var(--du-muted); font-size: 0.78rem; }
    .checkbox { display: flex; align-items: center; gap: 0.5rem; font-weight: 500; cursor: pointer; }
    .checkbox input { width: 1rem; height: 1rem; }
  `,
})
export class DossierFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(DossierStore);
  private readonly router = inject(Router);

  protected readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
  /** Mode édition si un identifiant de dossier est présent dans l’URL. */
  protected readonly edition = !!this.id;

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

  /**
   * Formulaire réparti par sections.
   * Les champs de suivi (type, service, étape, statut, priorité…) restent à la racine
   * afin que `getRawValue()` corresponde exactement à `DossierFormValue`.
   */
  protected readonly form = this.fb.group({
    // Suivi du traitement.
    type: ['construction_sans_permis' as TypeInfraction, Validators.required],
    service: ['DU' as ServiceDossier, Validators.required],
    etape: ['constat' as EtapeDossier, Validators.required],
    statut: ['signale' as StatutDossier, Validators.required],
    priorite: ['moyenne' as PrioriteDossier, Validators.required],
    agent: [''],
    attentionRequise: [false],
    motifAttention: [''],

    // 1. Informations du dossier.
    infos: this.fb.group({
      numero: [NUMERO_TEMPORAIRE, [Validators.required, Validators.maxLength(40)]],
      dateEntree: [aujourdHui(), Validators.required],
      referenceArrivee: [''],
      referenceEtude: [''],
      dateEtude: [''],
      provenance: [''],
      nature: ['plainte' as NatureDossier, Validators.required],
    }),

    // 2. Contrevenant.
    contrevenant: this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      telephone: ['', Validators.pattern(/^(\+224|0)[\d\s]{8,13}$/)],
      adresse: [''],
      observations: [''],
    }),

    // 3. Localisation.
    localisation: this.fb.group({
      adresse: ['', Validators.required],
      quartier: ['', Validators.required],
      arrondissement: ['', Validators.required],
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
    'contrevenant.prenom': { required: 'Le prénom est obligatoire.', minlength: 'Au moins 2 caractères.' },
    'contrevenant.telephone': { pattern: 'Numéro invalide (ex. 034 00 000 00).' },
    'localisation.adresse': { required: 'L’adresse est obligatoire.' },
    'localisation.quartier': { required: 'Le quartier est obligatoire.' },
    'localisation.arrondissement': { required: 'Sélectionnez un arrondissement.' },
    'localisation.coordX': { coordonnee: 'Coordonnée X numérique attendue.' },
    'localisation.coordY': { coordonnee: 'Coordonnée Y numérique attendue.' },
    'localisation.latitude': { coordonnee: 'Latitude invalide (ex. 9.5370).' },
    'localisation.longitude': { coordonnee: 'Longitude invalide (ex. -13.6773).' },
    'complements.objet': { required: 'L’objet est obligatoire.', minlength: 'Au moins 5 caractères.' },
  };

  constructor() {
    if (!this.id) return;
    const existant = this.store.getById(this.id);
    if (!existant) {
      this.router.navigate(['/admin/dossiers']);
      return;
    }
    this.form.patchValue(existant);
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

  /** Enregistre localement (démonstration) puis redirige vers le détail du dossier. */
  protected enregistrer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valeur: DossierFormValue = this.form.getRawValue();
    if (this.id) {
      this.store.update(this.id, valeur);
      this.router.navigate(['/admin/dossiers', this.id]);
    } else {
      const cree = this.store.add(valeur);
      this.router.navigate(['/admin/dossiers', cree.id]);
    }
  }
}
