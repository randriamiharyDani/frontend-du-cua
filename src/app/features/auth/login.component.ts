import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon.component';

/**
 * Page de connexion de l'espace administrateur DU.
 *
 * Étape locale uniquement : validation côté client + navigation temporaire.
 * Aucune authentification réelle, aucun appel API / backend.
 *
 * TODO (branchement futur) :
 * - Remplacer `simulerConnexion()` par un `AuthService.login(email, password)`.
 * - Stocker le token/sessions via un service dédié, gérer les erreurs HTTP (401/422/500).
 * - Protéger `/admin` avec un guard `authGuard` + redirection vers `/connexion`.
 */
@Component({
  selector: 'du-login',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);

  /** Masquage / affichage du mot de passe. */
  protected readonly motDePasseVisible = signal(false);
  /** État de chargement visuel pendant la « connexion » simulée. */
  protected readonly chargement = signal(false);
  /** Message d'erreur générique (ex. identifiants de démo refusés). */
  protected readonly erreurConnexion = signal('');

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.minLength(6)]],
    memoriser: [false],
  });

  protected basculerVisibiliteMotDePasse(): void {
    this.motDePasseVisible.update((v) => !v);
  }

  protected champInvalide(champ: 'email' | 'motDePasse'): boolean {
    const controle = this.form.controls[champ];
    return controle.invalid && (controle.touched || controle.dirty);
  }

  /** Soumission locale : valide, simule un délai, puis navigue vers l'espace admin. */
  protected seConnecter(): void {
    this.erreurConnexion.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.chargement()) return;
    this.chargement.set(true);

    // Simulation temporaire — à remplacer par AuthService.login().
    const { email } = this.form.getRawValue();
    window.setTimeout(() => {
      this.chargement.set(false);
      if (email.trim().toLowerCase() === 'refuse@du.gouv') {
        this.erreurConnexion.set('Adresse e-mail ou mot de passe incorrect.');
        return;
      }
      this.router.navigate(['/admin/dashboard']);
    }, 900);
  }
}
