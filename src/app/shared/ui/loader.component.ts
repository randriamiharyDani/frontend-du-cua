import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Indicateur de chargement partagé : trois points rebondissants aux
 * couleurs du thème. Remplaçable via `<du-loader />` dans tous les états
 * d'attente de l'application.
 */
@Component({
  selector: 'du-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="du-loader" [class.du-loader--inline]="inline" role="status" aria-live="polite">
      <span class="sr-only">{{ label }}</span>
      <span class="du-loader__dot" aria-hidden="true"></span>
      <span class="du-loader__dot" aria-hidden="true"></span>
      <span class="du-loader__dot" aria-hidden="true"></span>
    </div>
    @if (label && !inline) {
      <p class="du-loader__label">{{ label }}</p>
    }
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.85rem;
        padding: 1.75rem 1rem;
      }
      :host(.du-loader--plein) {
        min-height: 12rem;
      }

      .du-loader {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }
      .du-loader--inline {
        display: inline-flex;
        gap: 0.3rem;
        padding: 0;
      }

      .du-loader__dot {
        display: block;
        width: 0.7rem;
        height: 0.7rem;
        border-radius: 50%;
        background: var(--du-primary);
        box-shadow: 0 0 0 1px var(--du-primary-soft);
        animation: du-bounce 1s infinite ease-in-out both;
      }
      .du-loader--inline .du-loader__dot {
        width: 0.5rem;
        height: 0.5rem;
      }
      .du-loader__dot:nth-child(2) {
        background: var(--du-primary-dark);
        animation-delay: -0.15s;
      }
      .du-loader__dot:nth-child(3) {
        background: var(--du-accent);
        animation-delay: -0.3s;
      }

      .du-loader__label {
        margin: 0;
        color: var(--du-muted);
        font-size: 0.88rem;
        font-weight: 500;
      }

      @keyframes du-bounce {
        0%,
        80%,
        100% {
          transform: translateY(0);
          opacity: 0.55;
        }
        40% {
          transform: translateY(-0.5rem);
          opacity: 1;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .du-loader__dot {
          animation-duration: 0.01ms;
          animation-iteration-count: 1;
          opacity: 1;
        }
      }
    `,
  ],
  host: {
    '[class.du-loader--plein]': 'plein',
  },
})
export class LoaderComponent {
  /** Message accessible et, hors mode `inline`, affiché sous les points. */
  @Input() label = 'Chargement…';
  /** Version compacte, alignée dans un bouton ou une ligne. */
  @Input() inline = false;
  /** Réserve une hauteur minimale (états de page entière). */
  @Input() plein = false;
}
