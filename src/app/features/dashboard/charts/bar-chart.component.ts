import { ChangeDetectionStrategy, Component, Input, computed } from '@angular/core';

export interface BarDatum {
  label: string;
  value: number;
  color: string;
  tooltip?: string;
}

/**
 * Diagramme en barres verticales (SVG pur, sans dépendance).
 * Données réelles uniquement — aucun mock. Infobulles natives via `<title>`.
 */
@Component({
  selector: 'du-bar-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!donnees.length || max() === 0) {
      <p class="chart-vide">Aucune donnée à représenter.</p>
    } @else {
      <svg
        class="chart-svg"
        viewBox="0 0 560 280"
        role="img"
        [attr.aria-label]="ariaLabel || 'Diagramme en barres'"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- Grille horizontale -->
        @for (g of grilles(); track g.pct) {
          <line x1="44" [attr.x2]="540" [attr.y1]="g.y" [attr.y2]="g.y" class="grid" />
          <text x="40" [attr.y]="g.y + 4" text-anchor="end" class="grid-label">{{ g.valeur }}</text>
        }
        <!-- Barres -->
        @for (b of barres(); track b.label) {
          <g>
            <title>{{ b.tooltip }}</title>
            <rect
              [attr.x]="b.x"
              [attr.y]="b.y"
              [attr.width]="b.largeur"
              [attr.height]="b.hauteur"
              rx="6"
              [attr.fill]="b.couleur"
            />
            <text [attr.x]="b.x + b.largeur / 2" [attr.y]="b.y - 6" text-anchor="middle" class="bar-valeur">
              {{ b.valeur }}
            </text>
            <text
              [attr.x]="b.x + b.largeur / 2"
              y="268"
              text-anchor="middle"
              class="bar-label"
            >
              {{ b.court }}
            </text>
          </g>
        }
        <line x1="44" x2="540" y1="250" y2="250" class="axe" />
      </svg>
      <ul class="legende">
        @for (b of barres(); track b.label) {
          <li [title]="b.tooltip">
            <span class="pastille" [style.background]="b.couleur"></span>
            <span class="legende-label">{{ b.label }}</span>
            <strong>{{ b.valeur }}</strong>
            <span class="muted">({{ b.pct }}&nbsp;%)</span>
          </li>
        }
      </ul>
    }
  `,
  styles: [
    `
      :host { display: block; }
      .chart-svg { width: 100%; height: auto; display: block; }
      .grid { stroke: #e5eaf2; stroke-width: 1; }
      .grid-label { font-size: 10px; fill: #64748b; }
      .axe { stroke: #d3dcea; stroke-width: 1.5; }
      .bar-valeur { font-size: 12px; font-weight: 700; fill: #0d294d; }
      .bar-label { font-size: 10px; fill: #64748b; }
      .legende {
        list-style: none; margin: 0.75rem 0 0; padding: 0;
        display: flex; flex-wrap: wrap; gap: 0.4rem 1rem; font-size: 0.82rem;
      }
      .legende li { display: flex; align-items: center; gap: 0.4rem; }
      .pastille { width: 12px; height: 12px; border-radius: 4px; display: inline-block; }
      .muted { color: var(--du-muted); }
      .chart-vide { color: var(--du-muted); font-size: 0.88rem; margin: 0; padding: 0.5rem 0; }
    `,
  ],
})
export class BarChartComponent {
  @Input() donnees: BarDatum[] = [];
  @Input() ariaLabel = '';

  protected readonly max = computed(() => Math.max(0, ...this.donnees.map((d) => d.value)));

  protected readonly grilles = computed(() => {
    const max = Math.max(1, this.max());
    return [0.25, 0.5, 0.75, 1].map((f) => ({
      pct: f,
      valeur: Math.round(max * f),
      y: 250 - f * 210,
    }));
  });

  protected readonly barres = computed(() => {
    const max = Math.max(1, this.max());
    const n = Math.max(1, this.donnees.length);
    const zone = 496; // 540 - 44
    const largeur = Math.min(64, (zone / n) * 0.55);
    const total = this.donnees.reduce((s, d) => s + d.value, 0);
    return this.donnees.map((d, i) => {
      const hauteur = Math.max(d.value > 0 ? 4 : 0, (d.value / max) * 210);
      const x = 44 + (zone / n) * i + (zone / n - largeur) / 2;
      return {
        label: d.label,
        court: d.label.length > 14 ? d.label.slice(0, 13) + '…' : d.label,
        valeur: d.value,
        couleur: d.color,
        x: Math.round(x * 10) / 10,
        y: Math.round((250 - hauteur) * 10) / 10,
        largeur: Math.round(largeur * 10) / 10,
        hauteur: Math.round(hauteur * 10) / 10,
        pct: total ? Math.round((d.value / total) * 100) : 0,
        tooltip: d.tooltip ?? `${d.label} : ${d.value} dossier(s)`,
      };
    });
  });
}
