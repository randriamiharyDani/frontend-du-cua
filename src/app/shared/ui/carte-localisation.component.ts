import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type * as LeafletTypes from 'leaflet';

type Leaflet = typeof LeafletTypes;

export interface PointCarte {
  id: string;
  label: string;
  detail: string;
  lat: number;
  lng: number;
}

/** Centre par défaut : Antananarivo. */
const CENTRE_DEFAUT: [number, number] = [-18.9137, 47.5361];

@Component({
  selector: 'du-carte-localisation',
  template: `<div #conteneur class="carte"></div>`,
  styles: [
    `
      :host { display: block; }
      .carte { height: 100%; min-height: 360px; border-radius: 0.5rem; z-index: 0; }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarteLocalisationComponent implements AfterViewInit, OnDestroy {
  /** Points à afficher (ici : uniquement le dossier sélectionné). */
  readonly points = input<PointCarte[]>([]);

  private readonly platformId = inject(PLATFORM_ID);
  private readonly conteneur = viewChild.required<ElementRef<HTMLDivElement>>('conteneur');
  private readonly pret = signal(false);

  private L?: Leaflet;
  private carte?: LeafletTypes.Map;
  private couche?: LeafletTypes.LayerGroup;
  private minuteur?: ReturnType<typeof setTimeout>;
  private detruit = false;

  constructor() {
    effect(() => {
      const points = this.points();
      if (!this.pret()) return;
      this.dessiner(points);
    });
  }

  ngAfterViewInit(): void {
    // Leaflet a besoin de `window` : jamais chargé côté serveur (SSR).
    if (!isPlatformBrowser(this.platformId)) return;
    void this.initialiser();
  }

  ngOnDestroy(): void {
    this.detruit = true;
    if (this.minuteur) clearTimeout(this.minuteur);
    this.carte?.remove();
    this.carte = undefined;
  }

  private async initialiser(): Promise<void> {
    const module = await import('leaflet');
    if (this.detruit) return;

    const L = ((module as unknown as { default?: Leaflet }).default ?? module) as Leaflet;
    this.L = L;

    this.carte = L.map(this.conteneur().nativeElement, { zoomControl: true }).setView(CENTRE_DEFAUT, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; contributeurs <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.carte);
    this.couche = L.layerGroup().addTo(this.carte);

    // On dessine seulement une fois la taille du conteneur stabilisée,
    // sinon le centrage est décalé.
    this.minuteur = setTimeout(() => {
      this.carte?.invalidateSize();
      this.pret.set(true);
    });
  }

  private dessiner(points: PointCarte[]): void {
    const L = this.L;
    const carte = this.carte;
    const couche = this.couche;
    if (!L || !carte || !couche) return;

    couche.clearLayers();

    if (!points.length) {
      carte.setView(CENTRE_DEFAUT, 12);
      return;
    }

    for (const p of points) {
      const marqueur = L.circleMarker([p.lat, p.lng], {
        radius: 11,
        color: '#b91c1c',
        weight: 3,
        fillColor: '#ef4444',
        fillOpacity: 0.85,
      });
      marqueur.bindPopup(`<strong>${this.echapper(p.label)}</strong><br>${this.echapper(p.detail)}`);
      marqueur.addTo(couche);
    }

    const premier = points[0];
    carte.setView([premier.lat, premier.lng], 17);

    // Ouvre la bulle du marqueur sélectionné.
    couche.eachLayer((l) => (l as LeafletTypes.CircleMarker).openPopup());
  }

  private echapper(v: string): string {
    return v.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  }
}