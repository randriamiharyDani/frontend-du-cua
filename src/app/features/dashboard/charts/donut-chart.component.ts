import { ChangeDetectionStrategy, Component, Input, computed } from '@angular/core';

export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

/**
 * Diagramme en anneau (SVG pur, sans dépendance).
 * Données réelles uniquement — aucun mock. Infobulles natives via `<title>`.
 */
@Component({
  selector: 'du-donut-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!total()) {
      <p class="chart-vide">Aucune donnée à représenter.</p>
    } @else {
      <div class="donut-wrap">
        <svg
          class="chart-svg"
          viewBox="0 0 220 220"
          role="img"
          [attr.aria-label]="ariaLabel || 'Diagramme en anneau'"
        >
          <circle cx="110" cy="110" r="80" fill="none" stroke="#e8edf4" stroke-width="36" />
          @for (s of segments(); track s.label) {
            <circle
              cx="110"
              cy="110"
              r="80"
              fill="none"
              [attr.stroke]="s.couleur"
              stroke-width="36"
              [attr.stroke-dasharray]="s.dasharray"
              [attr.stroke-dashoffset]="s.offset"
              stroke-linecap="butt"
              transform="rotate(-90 110 110)"
            >
              <title>{{ s.tooltip }}</title>
            </circle>
          }
          <text x="110" y="104" text-anchor="middle" class="donut-total">{{ total() }}</text>
          <text x="110" y="124" text-anchor="middle" class="donut-sous">dossiers</text>
        </svg>
        <ul class="legende">
          @for (s of segments(); track s.label) {
            <li [title]="s.tooltip">
              <span class="pastille" [style.background]="s.couleur"></span>
              <span class="legende-label">{{ s.label }}</span>
              <strong>{{ s.valeur }}</strong>
              <span class="muted">({{ s.pct }}&nbsp;%)</span>
            </li>
          }
        </ul>
      </div>
    }
  `,
  styles: [
    `
      :host { display: block; }
      .donut-wrap { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; }
      .chart-svg { width: 200px; height: 200px; flex-shrink: 0; }
      .donut-total { font-size: 30px; font-weight: 800; fill: #0d294d; }
      .donut-sous { font-size: 12px; fill: #64748b; }
      .legende {
        list-style: none; margin: 0; padding: 0; flex: 1; min-width: 180px;
        display: grid; gap: 0.45rem; font-size: 0.85rem;
      }
      .legende li { display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; }
      .pastille { width: 12px; height: 12px; border-radius: 4px; display: inline-block; flex-shrink: 0; }
      .muted { color: var(--du-muted); }
      .chart-vide { color: var(--du-muted); font-size: 0.88rem; margin: 0; padding: 0.5rem 0; }
      @media (max-width: 560px) {
        .donut-wrap { flex-direction: column; align-items: flex-start; }
      }
    `,
  ],
})
export class DonutChartComponent {
  @Input() donnees: DonutDatum[] = [];
  @Input() ariaLabel = '';

  protected readonly total = computed(() => this.donnees.reduce((s, d) => s + d.value, 0));

  protected readonly segments = computed(() => {
    const total = this.total();
    const circonference = 2 * Math.PI * 80;
    let cumul = 0;
    return this.donnees.map((d) => {
      const part = total ? d.value / total : 0;
      const longueur = Math.max(0, part * circonference - (d.value > 0 && part < 1 ? 2 : 0));
      const seg = {
        label: d.label,
        valeur: d.value,
        couleur: d.color,
        dasharray: `${Math.round(longueur * 100) / 100} ${Math.round(circonference * 100) / 100}`,
        offset: -Math.round(cumul * circonference * 100) / 100,
        pct: total ? Math.round(part * 100) : 0,
        tooltip: `${d.label} : ${d.value} dossier(s)${total ? ` (${Math.round(part * 100)} %)` : ''}`,
      };
      cumul += part;
      return seg;
    });
  });
}
