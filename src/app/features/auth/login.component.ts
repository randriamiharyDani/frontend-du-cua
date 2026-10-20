import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { messageErreur } from '../../core/state/dossier-api.store';
import { IconComponent } from '../../shared/ui/icon.component';

/**
 * Page de connexion de l'espace administrateur DU.
 *
 * Authentification réelle via `AuthService` (token Sanctum). En cas de
 * succès, redirection vers l'URL demandée ou le tableau de bord.
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
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);

  /** Masquage / affichage du mot de passe. */
  protected readonly motDePasseVisible = signal(false);
  /** État de chargement visuel pendant la requête d'authentification. */
  protected readonly chargement = signal(false);
  /** Message d'erreur affiché sous le formulaire. */
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

  /** Soumission : authentifie auprès de l'API puis navigue vers l'espace admin. */
  protected seConnecter(): void {
    this.erreurConnexion.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.chargement()) return;

    const { email, motDePasse, memoriser } = this.form.getRawValue();
    this.chargement.set(true);

    this.auth
      .connexion(email.trim(), motDePasse, memoriser)
      .pipe(finalize(() => this.chargement.set(false)))
      .subscribe({
        next: () => {
          const retour = this.route.snapshot.queryParamMap.get('returnUrl');
          void this.router.navigateByUrl(retour || '/admin/dashboard');
        },
        error: (erreur: unknown) => {
          const status = (erreur as { status?: number })?.status;
          this.erreurConnexion.set(
            status === 401
              ? 'Adresse e-mail ou mot de passe incorrect.'
              : status === 403
                ? (messageErreur(erreur) || 'Ce compte ne peut pas se connecter. Contactez un administrateur.')
                : status === 429
                  ? 'Trop de tentatives. Patientez une minute puis réessayez.'
                  : messageErreur(erreur),
          );
        },
      });
  }
}
