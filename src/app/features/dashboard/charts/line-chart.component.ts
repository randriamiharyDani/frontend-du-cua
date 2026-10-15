import { ChangeDetectionStrategy, Component, Input, computed } from '@angular/core';

export interface LinePoint {
  label: string; // ex. "YYYY-MM"
  court: string; // ex. "MM/AA"
  value: number;
}

/**
 * Courbe d'évolution (SVG pur, sans dépendance).
 * Données réelles uniquement — aucun mock. Points avec infobulles natives.
 */
@Component({
  selector: 'du-line-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!points.length || max() === 0) {
      <p class="chart-vide">Pas encore de données sur la période.</p>
    } @else {
      <svg
        class="chart-svg"
        viewBox="0 0 560 280"
        role="img"
        [attr.aria-label]="ariaLabel || 'Courbe d’évolution'"
        preserveAspectRatio="xMidYMid meet"
      >
        @for (g of grilles(); track g.pct) {
          <line x1="44" x2="540" [attr.y1]="g.y" [attr.y2]="g.y" class="grid" />
          <text x="40" [attr.y]="g.y + 4" text-anchor="end" class="grid-label">{{ g.valeur }}</text>
        }
        <polygon [attr.points]="aire()" class="aire" />
        <polyline [attr.points]="courbe()" class="courbe" />
        @for (p of positions(); track p.label) {
          <g>
            <title>{{ p.label }} : {{ p.valeur }} dossier(s)</title>
            <circle [attr.cx]="p.x" [attr.cy]="p.y" r="5" class="point" />
            <text [attr.x]="p.x" y="266" text-anchor="middle" class="point-label">{{ p.court }}</text>
          </g>
        }
        <line x1="44" x2="540" y1="250" y2="250" class="axe" />
      </svg>
      <p class="resume">
        <strong>{{ total() }}</strong> dossier(s) sur la période · pic de
        <strong>{{ max() }}</strong> en {{ pic() }}.
      </p>
    }
  `,
  styles: [
    `
      :host { display: block; }
      .chart-svg { width: 100%; height: auto; display: block; }
      .grid { stroke: #e5eaf2; stroke-width: 1; }
      .grid-label { font-size: 10px; fill: #64748b; }
      .axe { stroke: #d3dcea; stroke-width: 1.5; }
      .courbe { fill: none; stroke: #143a6b; stroke-width: 2.5; stroke-linejoin: round; stroke-linecap: round; }
      .aire { fill: rgba(20, 58, 107, 0.1); stroke: none; }
      .point { fill: #c08a2e; stroke: #fff; stroke-width: 2; }
      .point-label { font-size: 9px; fill: #64748b; }
      .resume { font-size: 0.84rem; color: var(--du-text-soft); margin: 0.6rem 0 0; }
      .chart-vide { color: var(--du-muted); font-size: 0.88rem; margin: 0; padding: 0.5rem 0; }
    `,
  ],
})
export class LineChartComponent {
  @Input() points: LinePoint[] = [];
  @Input() ariaLabel = '';

  protected readonly max = computed(() => Math.max(0, ...this.points.map((p) => p.value)));
  protected readonly total = computed(() => this.points.reduce((s, p) => s + p.value, 0));
  protected readonly pic = computed(() => {
    const pts = this.points;
    if (!pts.length) return '—';
    const m = pts.reduce((a, b) => (b.value > a.value ? b : a), pts[0]);
    return `${m.label} (${m.value})`;
  });

  protected readonly grilles = computed(() => {
    const max = Math.max(1, this.max());
    return [0.25, 0.5, 0.75, 1].map((f) => ({
      pct: f,
      valeur: Math.round(max * f),
      y: 250 - f * 210,
    }));
  });

  protected readonly positions = computed(() => {
    const max = Math.max(1, this.max());
    const n = this.points.length;
    const x0 = 44;
    const x1 = 540;
    const pas = n > 1 ? (x1 - x0) / (n - 1) : 0;
    return this.points.map((p, i) => ({
      ...p,
      valeur: p.value,
      x: Math.round((x0 + pas * i) * 10) / 10,
      y: Math.round((250 - (p.value / max) * 210) * 10) / 10,
    }));
  });

  protected readonly courbe = computed(() =>
    this.positions()
      .map((p) => `${p.x},${p.y}`)
      .join(' '),
  );

  protected readonly aire = computed(() => {
    const pos = this.positions();
    if (!pos.length) return '';
    return `44,250 ${this.courbe()} 540,250`;
  });
}
