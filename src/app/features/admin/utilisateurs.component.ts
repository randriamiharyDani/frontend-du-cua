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
  nomComplet,
} from '../../core/models/utilisateur.model';
import { PayloadUtilisateur } from '../../core/models/utilisateur-api.model';
import { UtilisateursApiStore } from '../../core/state/utilisateurs-api.store';
import { IconComponent } from '../../shared/ui/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

/** Page « Utilisateurs » : comptes, services, rôles et états (API réelle). */
@Component({
  selector: 'du-page-utilisateurs',
  imports: [ReactiveFormsModule, IconComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './utilisateurs.component.html',
  styleUrl: './utilisateurs.component.scss',
  host: { '(document:keydown.escape)': 'fermerFormulaire()' },
})
export class UtilisateursComponent {
  private readonly store = inject(UtilisateursApiStore);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly utilisateurs = this.store.utilisateurs;
  protected readonly chargement = this.store.chargement;
  protected readonly erreur = this.store.erreur;
  protected readonly pagination = this.store.pagination;
  protected readonly enCours = this.store.enCours;
  protected readonly messageSucces = this.store.message;
  protected readonly erreurAction = this.store.erreurAction;

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

  protected readonly filtresActifs = computed(
    () => !!(this.recherche() || this.service() || this.role() || this.etat()),
  );

  // --- Formulaire ---
  protected readonly formulaireOuvert = signal(false);
  protected readonly editionId = signal<string | null>(null);

  protected readonly form = this.fb.group({
    prenom: ['', [Validators.required, Validators.minLength(2)]],
    nom: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(8)]],
    service: ['DU' as ServiceDossier, Validators.required],
    role: ['agent' as RoleUtilisateur, Validators.required],
    etat: ['actif' as EtatCompte, Validators.required],
  });

  private static readonly MESSAGES: Record<string, Record<string, string>> = {
    prenom: { required: 'Le prénom est obligatoire.', minlength: 'Au moins 2 caractères.' },
    nom: { required: 'Le nom est obligatoire.', minlength: 'Au moins 2 caractères.' },
    email: { required: 'L’adresse e-mail est obligatoire.', email: 'Adresse e-mail invalide.' },
    password: { required: 'Le mot de passe est obligatoire.', minlength: 'Au moins 8 caractères.' },
    service: { required: 'Sélectionnez un service.' },
    role: { required: 'Sélectionnez un rôle.' },
    etat: { required: 'Sélectionnez un état de compte.' },
  };

  constructor() {
    this.charger();
  }

  /** Interroge l'API avec les filtres courants. */
  private charger(): void {
    this.store.chargerListe({
      search: this.recherche().trim(),
      service: this.service(),
      role: this.role(),
      statut: this.etat(),
      per_page: this.taillePage,
      page: this.page(),
    });
  }

  protected ouvrirAjout(): void {
    this.editionId.set(null);
    this.store.effacerMessages();
    this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.reset({
      prenom: '',
      nom: '',
      email: '',
      password: '',
      service: 'DU' as ServiceDossier,
      role: 'agent' as RoleUtilisateur,
      etat: 'actif' as EtatCompte,
    });
    this.formulaireOuvert.set(true);
  }

  protected ouvrirEdition(u: Utilisateur): void {
    this.editionId.set(u.id);
    this.store.effacerMessages();
    this.form.controls.password.setValidators([Validators.minLength(8)]);
    this.form.reset({
      prenom: u.prenom,
      nom: u.nom,
      email: u.email,
      password: '',
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

  /** Enregistre via l'API (création ou modification). */
  protected enregistrer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valeur = this.form.getRawValue();
    const payload: PayloadUtilisateur = {
      prenom: valeur.prenom.trim(),
      nom: valeur.nom.trim(),
      email: valeur.email.trim(),
      service: valeur.service,
      role: valeur.role,
      statut: valeur.etat,
    };
    if (valeur.password.trim()) {
      payload.password = valeur.password.trim();
    }

    const id = this.editionId();
    const requete = id ? this.store.modifier(id, payload) : this.store.creer(payload);

    requete.subscribe({ next: () => this.fermerFormulaire() });
  }

  protected supprimer(u: Utilisateur): void {
    const ok =
      typeof window === 'undefined' ||
      window.confirm(`Supprimer le compte « ${nomComplet(u)} » ? Cette action est définitive.`);
    if (!ok) return;
    this.store.supprimer(u.id).subscribe();
  }

  private resetPage(): void {
    this.page.set(1);
  }
  protected setRecherche(v: string): void { this.recherche.set(v); this.resetPage(); }
  protected setService(v: string): void { this.service.set(v as ServiceDossier | ''); this.resetPage(); }
  protected setRole(v: string): void { this.role.set(v as RoleUtilisateur | ''); this.resetPage(); }
  protected setEtat(v: string): void { this.etat.set(v as EtatCompte | ''); this.resetPage(); }

  protected allerA(p: number): void {
    const cible = Math.min(Math.max(1, p), this.pagination().dernierPage);
    this.page.set(cible);
    this.charger();
  }

  /** Applique les filtres en revenant à la première page. */
  protected rechercher(): void {
    this.resetPage();
    this.charger();
  }

  protected reinitialiser(): void {
    this.recherche.set('');
    this.service.set('');
    this.role.set('');
    this.etat.set('');
    this.page.set(1);
    this.charger();
  }
}
