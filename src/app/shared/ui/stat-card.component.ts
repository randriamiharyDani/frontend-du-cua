import { Component, Input } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'du-stat-card',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="card stat-card">
      <div class="stat">
        <span class="stat__icon"><du-icon [name]="icon" [size]="22" /></span>
        <div class="stat__corps">
          <div class="stat__value">{{ value }}</div>
          <div class="stat__label">{{ label }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .stat-card {
        transition: box-shadow 0.17s ease, transform 0.17s ease;
      }
      .stat-card:hover {
        box-shadow: var(--du-shadow-md);
        transform: translateY(-2px);
      }
      .stat {
        display: flex;
        gap: 1rem;
        align-items: center;
        padding: 1.25rem 1.35rem;
      }
      .stat__icon {
        display: grid;
        place-items: center;
        width: 48px;
        height: 48px;
        border-radius: 13px;
        background: linear-gradient(145deg, var(--du-primary), var(--du-primary-dark));
        color: #fff;
        flex-shrink: 0;
        box-shadow: 0 3px 10px rgba(13, 41, 77, 0.25);
      }
      .stat__corps {
        min-width: 0;
      }
      .stat__value {
        font-size: 1.7rem;
        font-weight: 700;
        line-height: 1.05;
        letter-spacing: -0.02em;
        color: var(--du-primary-dark);
      }
      .stat__label {
        color: var(--du-muted);
        font-size: 0.84rem;
        margin-top: 0.15rem;
      }
    `,
  ],
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: number | string = 0;
  @Input() icon = 'folder';
}
