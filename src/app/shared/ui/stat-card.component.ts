import { Component, Input } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'du-stat-card',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="card">
      <div class="card__body stat">
        <span class="stat__icon"><du-icon [name]="icon" [size]="20" /></span>
        <div>
          <div class="stat__value">{{ value }}</div>
          <div class="stat__label">{{ label }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .stat {
        display: flex;
        gap: 0.85rem;
        align-items: center;
      }
      .stat__icon {
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background: var(--du-primary-soft);
        color: var(--du-primary);
        flex-shrink: 0;
      }
      .stat__value {
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1.1;
      }
      .stat__label {
        color: var(--du-muted);
        font-size: 0.85rem;
      }
    `,
  ],
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: number | string = 0;
  @Input() icon = 'folder';
}
