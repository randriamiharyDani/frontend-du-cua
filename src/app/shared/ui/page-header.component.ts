import { Component, Input } from '@angular/core';

@Component({
  selector: 'du-page-header',
  standalone: true,
  template: `
    <div class="page-header">
      <div class="page-header__titre">
        <h1>{{ title }}</h1>
        @if (subtitle) {
          <p class="muted">{{ subtitle }}</p>
        }
      </div>
      <div class="page-header__actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 1rem 1.5rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        padding-bottom: 1.1rem;
        border-bottom: 1px solid var(--du-border);
      }
      .page-header__titre {
        min-width: 0;
      }
      h1 {
        font-size: 1.55rem;
        letter-spacing: -0.02em;
        margin: 0;
      }
      p {
        margin: 0.3rem 0 0;
        font-size: 0.9rem;
        max-width: 62ch;
      }
      .page-header__actions {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
      }
      @media (max-width: 600px) {
        .page-header__actions { width: 100%; }
        .page-header__actions :is(a, button) { flex: 1 1 auto; }
      }
    `,
  ],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
