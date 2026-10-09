import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ARRONDISSEMENTS, DossierFormValue, PRIORITE_LABEL, PRIORITES, PrioriteDossier, SERVICE_LABEL,
  SERVICES, ServiceDossier, STATUT_LABEL, STATUTS, StatutDossier,
  TYPE_LABEL, TYPES, TypeInfraction,
} from '../../core/models/dossier.model';
import { DossierStore } from '../../core/state/dossier-store';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

@Component({
  selector: 'du-dossier-form',
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dossier-form.component.html',
})
export class DossierFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(DossierStore);
  private readonly router = inject(Router);

  protected readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
  protected readonly edition = !!this.id;

  protected readonly types = TYPES;
  protected readonly statuts = STATUTS;
  protected readonly priorites = PRIORITES;
  protected readonly arrondissements = ARRONDISSEMENTS;
  protected readonly services = SERVICES;
  protected readonly typeLabel = TYPE_LABEL;
  protected readonly statutLabel = STATUT_LABEL;
  protected readonly prioriteLabel = PRIORITE_LABEL;
  protected readonly serviceLabel = SERVICE_LABEL;

  protected readonly form = this.fb.group({
    titre: ['', [Validators.required, Validators.minLength(5)]],
    type: ['construction_sans_permis' as TypeInfraction, Validators.required],
    adresse: ['', Validators.required],
    quartier: ['', Validators.required],
    arrondissement: ['', Validators.required],
    proprietaire: ['', Validators.required],
    telephone: ['', Validators.pattern(/^(\+261|0)[\s\d]{8,13}$/)],
    dateSignalement: [new Date().toISOString().slice(0, 10), Validators.required],
    dateEnregistrement: [new Date().toISOString().slice(0, 10), Validators.required],
    service: ['DU' as ServiceDossier, Validators.required],
    priorite: ['moyenne' as PrioriteDossier, Validators.required],
    statut: ['signale' as StatutDossier, Validators.required],
    attentionRequise: [false],
    motifAttention: [''],
    agent: [''],
    description: ['', [Validators.required, Validators.minLength(10)]],
  });

  constructor() {
    if (this.id) {
      const existant = this.store.getById(this.id);
      if (!existant) {
        this.router.navigate(['/admin/dossiers']);
        return;
      }
      this.form.patchValue(existant);
    }
  }

  protected invalide(champ: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[champ];
    return c.invalid && (c.touched || c.dirty);
  }

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