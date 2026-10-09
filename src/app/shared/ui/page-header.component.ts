import { Component, Input } from '@angular/core';

@Component({
  selector: 'du-page-header',
  standalone: true,
  template: `
    <div class="page-header">
      <div>
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
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 1.25rem;
        flex-wrap: wrap;
      }
      h1 {
        font-size: 1.5rem;
        margin: 0;
      }
      p {
        margin: 0.25rem 0 0;
      }
      .page-header__actions {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
      }
    `,
  ],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
