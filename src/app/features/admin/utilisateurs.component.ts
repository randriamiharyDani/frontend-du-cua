import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SERVICES, ServiceDossier } from '../../core/models/dossier.model';
import {
  ETAT_COMPTE_LABEL,
  ETATS_COMPTE,
  EtatCompte,
  ROLE_UTILISATEUR_LABEL,
  ROLES_UTILISATEUR,
  RoleUtilisateur,
  Utilisateur,
  UtilisateurFormValue,
  nomComplet,
} from '../../core/models/utilisateur.model';
import { DossierStore } from '../../core/state/dossier-store';
import { IconComponent } from '../../shared/ui/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

const normaliser = (s: string) =>
  (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Page « Utilisateurs » : comptes, services, rôles et états (données fictives). */
@Component({
  selector: 'du-page-utilisateurs',
  imports: [ReactiveFormsModule, IconComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './utilisateurs.component.html',
  styleUrl: './utilisateurs.component.scss',
  host: { '(document:keydown.escape)': 'fermerFormulaire()' },
})
export class UtilisateursComponent {
  private readonly store = inject(DossierStore);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly services = SERVICES;
  protected readonly roles = ROLES_UTILISATEUR;
  protected readonly roleLabel = ROLE_UTILISATEUR_LABEL;
  protected readonly etats = ETATS_COMPTE;
  protected readonly etatLabel = ETAT_COMPTE_LABEL;
  protected readonly nomComplet = nomComplet;

  // --- Filtres ---
  protected readonly recherche = signal('');
  protected readonly service = signal<ServiceDossier | ''>('');
  protected readonly role = signal<RoleUtilisateur | ''>('');
  protected readonly etat = signal<EtatCompte | ''>('');
  private readonly page = signal(1);
  protected readonly taillePage = 8;

  protected readonly messageSucces = signal('');
  /** Message d’erreur de doublon d’e-mail (validé côté frontend). */
  protected readonly erreurEmail = signal('');

  protected readonly filtres = computed(() => {
    const q = normaliser(this.recherche().trim());
    const service = this.service();
    const role = this.role();
    const etat = this.etat();
    return this.store
      .utilisateurs()
      .filter((u) => {
        if (service && u.service !== service) return false;
        if (role && u.role !== role) return false;
        if (etat && u.etat !== etat) return false;
        if (!q) return true;
        return normaliser([u.nom, u.prenom, u.email].join(' ')).includes(q);
      })
      .sort((a, b) => a.nom.localeCompare(b.nom) || a.prenom.localeCompare(b.prenom));
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
    () => !!(this.recherche() || this.service() || this.role() || this.etat()),
  );

  // --- Formulaire ---
  protected readonly formulaireOuvert = signal(false);
  protected readonly editionId = signal<string | null>(null);

  protected readonly form = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    prenom: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    service: ['DU' as ServiceDossier, Validators.required],
    role: ['agent' as RoleUtilisateur, Validators.required],
    etat: ['actif' as EtatCompte, Validators.required],
  });

  private static readonly MESSAGES: Record<string, Record<string, string>> = {
    nom: { required: 'Le nom est obligatoire.', minlength: 'Au moins 2 caractères.' },
    prenom: { required: 'Le prénom est obligatoire.', minlength: 'Au moins 2 caractères.' },
    email: { required: 'L’adresse e-mail est obligatoire.', email: 'Adresse e-mail invalide.' },
    service: { required: 'Sélectionnez un service.' },
    role: { required: 'Sélectionnez un rôle.' },
    etat: { required: 'Sélectionnez un état de compte.' },
  };

  protected ouvrirAjout(): void {
    this.editionId.set(null);
    this.erreurEmail.set('');
    this.form.reset({
      nom: '',
      prenom: '',
      email: '',
      service: 'DU' as ServiceDossier,
      role: 'agent' as RoleUtilisateur,
      etat: 'actif' as EtatCompte,
    });
    this.formulaireOuvert.set(true);
  }

  protected ouvrirEdition(u: Utilisateur): void {
    this.editionId.set(u.id);
    this.erreurEmail.set('');
    this.form.reset({
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      service: u.service,
      role: u.role,
      etat: u.etat,
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
    return UtilisateursComponent.MESSAGES[champ]?.[type] ?? 'Champ invalide.';
  }

  /** Enregistre localement (démonstration) après vérification du doublon d’e-mail. */
  protected enregistrer(): void {
    this.erreurEmail.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valeur: UtilisateurFormValue = this.form.getRawValue();
    const email = valeur.email.trim().toLowerCase();
    const id = this.editionId();
    const doublon = this.store
      .utilisateurs()
      .some((u) => u.email.toLowerCase() === email && u.id !== id);
    if (doublon) {
      this.erreurEmail.set('Cette adresse e-mail est déjà utilisée par un autre compte.');
      this.form.controls.email.markAsTouched();
      return;
    }

    valeur.email = valeur.email.trim();
    if (id) {
      this.store.updateUtilisateur(id, valeur);
    } else {
      this.store.addUtilisateur(valeur);
    }
    this.fermerFormulaire();
    this.messageSucces.set(
      id
        ? 'Utilisateur modifié localement (simulation) — non enregistré de façon permanente.'
        : 'Utilisateur ajouté localement (simulation) — non enregistré de façon permanente.',
    );
    window.setTimeout(() => this.messageSucces.set(''), 6000);
  }

  protected supprimer(u: Utilisateur): void {
    const ok =
      typeof window === 'undefined' ||
      window.confirm(`Supprimer le compte « ${nomComplet(u)} » ? (démonstration)`);
    if (!ok) return;
    this.store.supprimerUtilisateur(u.id);
  }

  private resetPage(): void {
    this.page.set(1);
  }
  protected setRecherche(v: string): void { this.recherche.set(v); this.resetPage(); }
  protected setService(v: string): void { this.service.set(v as ServiceDossier | ''); this.resetPage(); }
  protected setRole(v: string): void { this.role.set(v as RoleUtilisateur | ''); this.resetPage(); }
  protected setEtat(v: string): void { this.etat.set(v as EtatCompte | ''); this.resetPage(); }
  protected allerA(p: number): void { this.page.set(Math.min(Math.max(1, p), this.totalPages())); }

  protected reinitialiser(): void {
    this.recherche.set('');
    this.service.set('');
    this.role.set('');
    this.etat.set('');
    this.page.set(1);
  }
}
