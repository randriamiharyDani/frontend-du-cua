import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ETAPE_LABEL,
  ETAPES,
  EtapeDossier,
  MouvementFormValue,
  SERVICES,
  ServiceDossier,
} from '../../core/models/dossier.model';
import { DossierStore } from '../../core/state/dossier-store';
import { ADMIN_CURRENT_USER } from '../../layout/admin-navigation';
import { IconComponent } from '../../shared/ui/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

const aujourdHui = () => new Date().toISOString().slice(0, 10);

const normaliser = (s: string) =>
  (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Le service d’arrivée doit être différent du service de départ. */
function servicesDifferents(groupe: AbstractControl): ValidationErrors | null {
  const de = groupe.get('de')?.value;
  const vers = groupe.get('vers')?.value;
  return de && vers && de === vers ? { memeService: true } : null;
}

/** Page « Mouvements » : circulation des dossiers entre DU, DIS et SCAD. */
@Component({
  selector: 'du-page-mouvements',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, IconComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mouvements.component.html',
  styleUrl: './mouvements.component.scss',
  host: { '(document:keydown.escape)': 'fermerFormulaire()' },
})
export class MouvementsComponent {
  private readonly store = inject(DossierStore);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly services = SERVICES;
  protected readonly etapes = ETAPES;
  protected readonly etapeLabel = ETAPE_LABEL;
  protected readonly dossiers = this.store.dossiers;
  protected readonly utilisateur = ADMIN_CURRENT_USER;

  // --- Filtres ---
  protected readonly recherche = signal('');
  protected readonly service = signal<ServiceDossier | ''>('');
  protected readonly action = signal('');
  protected readonly du = signal('');
  protected readonly au = signal('');
  private readonly page = signal(1);
  protected readonly taillePage = 8;

  /** Bandeau de confirmation temporaire (simulation). */
  protected readonly messageSucces = signal('');

  /** Actions distinctes présentes dans les données, pour le filtre. */
  protected readonly actionsDisponibles = computed(() =>
    [...new Set(this.store.mouvements().map((m) => m.action).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    ),
  );

  /** Mouvements filtrés, du plus récent au plus ancien. */
  protected readonly filtres = computed(() => {
    const q = normaliser(this.recherche().trim());
    const service = this.service();
    const action = this.action();
    const du = this.du();
    const au = this.au();
    return this.store
      .mouvements()
      .filter((m) => {
        if (service && m.de !== service && m.vers !== service) return false;
        if (action && m.action !== action) return false;
        if (du && m.date < du) return false;
        if (au && m.date > au) return false;
        if (!q) return true;
        const hay = normaliser(
          [m.reference, m.titre, m.action, m.referenceDocument, m.auteur, m.motif].join(' '),
        );
        return hay.includes(q);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
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
    () => !!(this.recherche() || this.service() || this.action() || this.du() || this.au()),
  );

  // --- Formulaire de saisie ---
  protected readonly formulaireOuvert = signal(false);
  protected readonly form = this.fb.group(
    {
      dossierId: ['', Validators.required],
      date: [aujourdHui(), Validators.required],
      de: ['DU' as ServiceDossier, Validators.required],
      vers: ['DIS' as ServiceDossier, Validators.required],
      etape: ['constat' as EtapeDossier, Validators.required],
      action: ['', [Validators.required, Validators.minLength(3)]],
      observations: [''],
    },
    { validators: servicesDifferents },
  );

  protected ouvrirFormulaire(): void {
    this.form.reset({
      dossierId: '',
      date: aujourdHui(),
      de: 'DU',
      vers: 'DIS',
      etape: 'constat',
      action: '',
      observations: '',
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

  /** Valide puis simule l’ajout local du mouvement + mise à jour du dossier. */
  protected enregistrer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const brut = this.form.getRawValue();
    const valeur: MouvementFormValue = {
      dossierId: brut.dossierId,
      date: brut.date,
      de: brut.de,
      vers: brut.vers,
      etape: brut.etape,
      action: brut.action.trim(),
      observations: brut.observations.trim(),
      auteur: this.utilisateur.nom,
      referenceDocument: '',
    };
    this.store.addMouvement(valeur);
    this.fermerFormulaire();
    this.reinitialiser();
    this.messageSucces.set(
      'Mouvement ajouté localement (simulation) — le service du dossier a été mis à jour. Non enregistré de façon permanente.',
    );
    window.setTimeout(() => this.messageSucces.set(''), 6000);
  }

  private resetPage(): void {
    this.page.set(1);
  }
  protected setRecherche(v: string): void { this.recherche.set(v); this.resetPage(); }
  protected setService(v: string): void { this.service.set(v as ServiceDossier | ''); this.resetPage(); }
  protected setAction(v: string): void { this.action.set(v); this.resetPage(); }
  protected setDu(v: string): void { this.du.set(v); this.resetPage(); }
  protected setAu(v: string): void { this.au.set(v); this.resetPage(); }
  protected allerA(p: number): void { this.page.set(Math.min(Math.max(1, p), this.totalPages())); }

  protected reinitialiser(): void {
    this.recherche.set('');
    this.service.set('');
    this.action.set('');
    this.du.set('');
    this.au.set('');
    this.page.set(1);
  }
}
