import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ARRONDISSEMENTS, Dossier, DossierFormValue, NATURE_LABEL, NatureDossier } from '../../core/models/dossier.model';
import { dossierDepuisApi } from '../../core/mappers/dossier.mapper';
import { LocalisationLigne } from '../../core/mappers/localisation.mapper';
import { AuthService } from '../../core/services/auth.service';
import { DossierApiService } from '../../core/services/dossier-api.service';
import { LocalisationsApiStore } from '../../core/state/localisations-api.store';
import { DossierApiStore, messageErreur } from '../../core/state/dossier-api.store';
import { CarteLocalisationComponent, PointCarte } from '../../shared/ui/carte-localisation.component';
import { IconComponent } from '../../shared/ui/icon.component';
import { LoaderComponent } from '../../shared/ui/loader.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

/** Champ facultatif : n’accepte que des chiffres, signes + / - et point décimal. */
function coordonneeValide(control: AbstractControl): ValidationErrors | null {
  const valeur = (control.value ?? '').toString().trim();
  if (!valeur) return null;
  return /^[+-]?\d+([.,]\d+)?$/.test(valeur.replace(/\s/g, '')) ? null : { coordonnee: true };
}

/** Convertit une valeur de la base (« -18,9137 » ou nombre) en nombre, ou null si vide / invalide. */
function versNombre(valeur: unknown): number | null {
  const v = (valeur ?? '').toString().trim().replace(/\s/g, '').replace(',', '.');
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Coordonnée obligatoire : nombre décimal (point ou virgule) dont l’amplitude
 * est comprise dans les bornes du globe (-90 / 90 pour la latitude,
 * -180 / 180 pour la longitude).
 */
function coordonneeDansBornes(amplitude: number): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const brut = (control.value ?? '').toString().trim().replace(/\s/g, '');
    if (!brut) return null; // champ vide : traité par `Validators.required`
    if (!/^[+-]?\d+([.,]\d+)?$/.test(brut)) return { coordonnee: true };
    const n = Number(brut.replace(',', '.'));
    if (!Number.isFinite(n)) return { coordonnee: true };
    return Math.abs(n) > amplitude ? { horsBornes: true } : null;
  };
}

/** Minuscules sans accents, pour la recherche. */
function normaliser(v: string): string {
  return v.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

type FiltreCoordonnees = '' | 'gps' | 'sans-gps';

/** Ligne d’affichage d’un dossier localisé (section « Dossiers localisés »). */
interface DossierLocaliseLigne {
  id: string;
  reference: string;
  natureCode: NatureDossier | null;
  arrondissement: string;
  localisation: string;
  coordonnees: string;
  /** Valeur textuelle de la latitude en base (telle qu’enregistrée). */
  latitudeBrut: string;
  /** Valeur textuelle de la longitude en base (telle qu’enregistrée). */
  longitudeBrut: string;
  lat: number | null;
  lng: number | null;
}

/** Page « Localisations » : localisation des dossiers et carte. */
@Component({
  selector: 'du-page-localisations',
  imports: [
    ReactiveFormsModule,
    IconComponent,
    LoaderComponent,
    PageHeaderComponent,
    CarteLocalisationComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './localisations.component.html',
  styleUrl: './localisations.component.scss',
  host: { '(document:keydown.escape)': 'fermerTous()' },
})
export class LocalisationsComponent implements OnInit {
  private readonly store = inject(LocalisationsApiStore);
  private readonly dossiersStore = inject(DossierApiStore);
  private readonly dossiersApi = inject(DossierApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly arrondissements = ARRONDISSEMENTS;
  protected readonly natureLabel = NATURE_LABEL;

  // --- Messages / état d’action ---
  protected readonly enCours = this.store.enCours;
  protected readonly messageSucces = this.store.message;
  protected readonly erreurAction = this.store.erreurAction;

  // --- État serveur (dossiers) ---
  protected readonly dossiers = this.dossiersStore.dossiers;
  protected readonly chargementDossiers = this.dossiersStore.chargementListe;
  protected readonly erreurDossiers = this.dossiersStore.erreurListe;

  /** Modification réservée aux rôles privilégiés. */
  protected readonly estPrivilegie = computed(() => {
    const role = this.auth.utilisateur()?.role;
    return role === 'admin_systeme' || role === 'administrateur';
  });

  // --- Filtres (appliqués aux dossiers localisés) ---
  protected readonly recherche = signal('');
  protected readonly arrondissement = signal('');
  protected readonly coordonneesFiltre = signal<FiltreCoordonnees>('');
  protected readonly filtresActifs = computed(
    () => !!(this.recherche().trim() || this.arrondissement() || this.coordonneesFiltre()),
  );

  // --- Formulaire (référentiel de zones, modification seule) ---
  protected readonly formulaireOuvert = signal(false);
  protected readonly editionId = signal<number | null>(null);

  // --- Localiser un dossier ---
  protected readonly dossierFormulaireOuvert = signal(false);
  protected readonly dossierEnCours = signal(false);
  protected readonly dossierSucces = signal('');
  protected readonly dossierErreur = signal('');

  // --- Carte plein écran (bouton « Localiser ») ---
  protected readonly carteOuverte = signal(false);
  /** Dossier relu depuis l’API (MySQL) à l’ouverture de la carte. */
  protected readonly carteDossier = signal<Dossier | null>(null);
  protected readonly carteChargement = signal(false);
  protected readonly carteErreur = signal('');

  // --- Modification des coordonnées (bouton « Modifier ») ---
  protected readonly coordonneesFormulaireOuvert = signal(false);
  protected readonly coordonneesDossierId = signal<string | null>(null);
  protected readonly coordonneesEnCours = signal(false);
  protected readonly coordonneesErreur = signal('');
  protected readonly coordonneesSucces = signal('');

  // --- Carte : dossier sélectionné (null = carte masquée) ---
  protected readonly selectionId = signal<string | null>(null);

  protected readonly dossierForm = this.fb.group({
    dossierId: ['', Validators.required],
    adresse: ['', [Validators.required, Validators.minLength(3)]],
    quartier: ['', [Validators.required, Validators.minLength(2)]],
    arrondissement: ['', Validators.required],
    coordX: ['', coordonneeValide],
    coordY: ['', coordonneeValide],
    latitude: ['', coordonneeValide],
    longitude: ['', coordonneeValide],
  });

  protected readonly form = this.fb.group({
    adresse: ['', [Validators.required, Validators.minLength(3)]],
    quartier: ['', [Validators.required, Validators.minLength(2)]],
    arrondissement: ['', Validators.required],
    coordX: ['', coordonneeValide],
    coordY: ['', coordonneeValide],
    latitude: ['', coordonneeValide],
    longitude: ['', coordonneeValide],
  });

  /** Formulaire dédié à la latitude / longitude d'un dossier. */
  protected readonly coordonneesForm = this.fb.group({
    latitude: ['', [Validators.required, coordonneeDansBornes(90)]],
    longitude: ['', [Validators.required, coordonneeDansBornes(180)]],
  });

  private static readonly MESSAGES: Record<string, Record<string, string>> = {
    adresse: { required: 'L’adresse est obligatoire.', minlength: 'Au moins 3 caractères.' },
    quartier: { required: 'Le quartier est obligatoire.', minlength: 'Au moins 2 caractères.' },
    arrondissement: { required: 'Sélectionnez un arrondissement.' },
    coordX: { coordonnee: 'Coordonnée X invalide (chiffres uniquement).' },
    coordY: { coordonnee: 'Coordonnée Y invalide (chiffres uniquement).' },
    latitude: { coordonnee: 'Latitude invalide (ex. -18.9137).' },
    longitude: { coordonnee: 'Longitude invalide (ex. 47.5361).' },
  };

  /** Messages propres au formulaire latitude / longitude. */
  private static readonly MESSAGES_COORDONNEES: Record<string, Record<string, string>> = {
    latitude: {
      required: 'La latitude est obligatoire.',
      coordonnee: 'Latitude invalide (ex. -18.9137).',
      horsBornes: 'La latitude doit être comprise entre -90 et 90.',
    },
    longitude: {
      required: 'La longitude est obligatoire.',
      coordonnee: 'Longitude invalide (ex. 47.5361).',
      horsBornes: 'La longitude doit être comprise entre -180 et 180.',
    },
  };

  /** Vrai si le dossier porte au moins une coordonnée enregistrée (X/Y ou latitude/longitude). */
  private aDesCoordonnees(d: Dossier): boolean {
    const l = d.localisation;
    return !!(l && (l.coordX || l.coordY || l.latitude || l.longitude));
  }

  /** Assemble le libellé des coordonnées d’un dossier. */
  private composerCoordonnees(l: {
    coordX: string;
    coordY: string;
    latitude: string;
    longitude: string;
  }): string {
    const couples = [
      l.coordX || l.coordY ? `X/Y : ${l.coordX || '—'} / ${l.coordY || '—'}` : '',
      l.latitude || l.longitude ? `Lat/Long : ${l.latitude || '—'} / ${l.longitude || '—'}` : '',
    ].filter((v) => v !== '');
    return couples.join(' · ');
  }

  /** Dossiers localisés (au moins une coordonnée en base), projetés pour l’affichage. */
  protected readonly dossiersLocalises = computed<DossierLocaliseLigne[]>(() =>
    this.dossiers()
      .filter((d) => this.aDesCoordonnees(d))
      .map((d) => {
        const loc = d.localisation;
        const lat = versNombre(loc.latitude);
        const lng = versNombre(loc.longitude);
        const valide =
          lat !== null &&
          lng !== null &&
          Math.abs(lat) <= 90 &&
          Math.abs(lng) <= 180 &&
          !(lat === 0 && lng === 0);
        return {
          id: d.id,
          reference: d.reference || `#${d.id}`,
          natureCode: d.infos?.nature ?? null,
          arrondissement: loc.arrondissement ?? '',
          localisation: [loc.adresse, loc.quartier, loc.arrondissement]
            .filter((v) => !!v && v.trim() !== '')
            .join(' — '),
          coordonnees: this.composerCoordonnees(loc),
          latitudeBrut: loc.latitude ?? '',
          longitudeBrut: loc.longitude ?? '',
          lat: valide ? lat : null,
          lng: valide ? lng : null,
        };
      }),
  );

  /** Dossiers localisés après application des filtres. */
  protected readonly dossiersFiltres = computed<DossierLocaliseLigne[]>(() => {
    const terme = normaliser(this.recherche().trim());
    const arr = this.arrondissement();
    const coord = this.coordonneesFiltre();

    return this.dossiersLocalises().filter((d) => {
      if (arr && d.arrondissement !== arr) return false;
      if (coord === 'gps' && d.lat === null) return false;
      if (coord === 'sans-gps' && d.lat !== null) return false;
      if (terme) {
        const nature = d.natureCode ? NATURE_LABEL[d.natureCode] : '';
        const texte = normaliser(`${d.reference} ${d.localisation} ${d.coordonnees} ${nature}`);
        if (!texte.includes(terme)) return false;
      }
      return true;
    });
  });

  /** Dossier actuellement sélectionné (clic sur une ligne). */
  protected readonly dossierSelectionne = computed(
    () => this.dossiersFiltres().find((d) => d.id === this.selectionId()) ?? null,
  );

  /** Points envoyés à la carte : uniquement le dossier sélectionné, s’il a un GPS valide. */
  protected readonly pointsCarte = computed<PointCarte[]>(() => {
    const d = this.dossierSelectionne();
    if (!d || d.lat === null || d.lng === null) return [];
    return [{ id: d.id, label: d.reference, detail: d.localisation || '—', lat: d.lat, lng: d.lng }];
  });

  /** Lien externe vers la position sélectionnée. */
  protected readonly lienOsm = computed(() => {
    const d = this.dossierSelectionne();
    if (!d || d.lat === null || d.lng === null) return '';
    return `https://www.openstreetmap.org/?mlat=${d.lat}&mlon=${d.lng}#map=18/${d.lat}/${d.lng}`;
  });

  /** Dossiers sans coordonnées (proposés dans le select « Ajouter un dossier »). */
  protected readonly dossiersNonLocalises = computed(() =>
    this.dossiers().filter((d) => !this.aDesCoordonnees(d)),
  );

  // --- Carte plein écran ---

  /**
   * Coordonnées du dossier affiché en plein écran, relues depuis l’API.
   * `lat` / `lng` ne sont renseignés que si la position est exploitable
   * (bornes du globe et couple non nul).
   */
  protected readonly cartePosition = computed<{
    lat: number | null;
    lng: number | null;
    latitudeBrut: string;
    longitudeBrut: string;
    reference: string;
    natureCode: NatureDossier | null;
    localisation: string;
  } | null>(() => {
    const d = this.carteDossier();
    if (!d) return null;
    const loc = d.localisation;
    const lat = versNombre(loc.latitude);
    const lng = versNombre(loc.longitude);
    const valide =
      lat !== null &&
      lng !== null &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180 &&
      !(lat === 0 && lng === 0);
    return {
      lat: valide ? lat : null,
      lng: valide ? lng : null,
      latitudeBrut: loc.latitude ?? '',
      longitudeBrut: loc.longitude ?? '',
      reference: d.reference || `#${d.id}`,
      natureCode: d.infos?.nature ?? null,
      localisation: [loc.adresse, loc.quartier, loc.arrondissement]
        .filter((v) => !!v && v.trim() !== '')
        .join(' — '),
    };
  });

  /** Marqueur unique affiché sur la carte plein écran. */
  protected readonly pointsCartePleinEcran = computed<PointCarte[]>(() => {
    const p = this.cartePosition();
    if (!p || p.lat === null || p.lng === null) return [];
    return [{
      id: p.reference,
      label: p.reference,
      detail: p.localisation || '—',
      lat: p.lat,
      lng: p.lng,
    }];
  });

  /** Lien externe vers la position affichée en plein écran. */
  protected readonly lienOsmPleinEcran = computed(() => {
    const p = this.cartePosition();
    if (!p || p.lat === null || p.lng === null) return '';
    return `https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=18/${p.lat}/${p.lng}`;
  });

  ngOnInit(): void {
    // Tous les dossiers pour alimenter le select et la liste des localisés.
    this.dossiersStore.chargerListe({ per_page: 100 });
  }

  // --- Carte ---
  /** Clic sur un dossier : affiche la carte. Re-clic sur le même dossier : la masque. */
  protected choisir(id: string): void {
    this.selectionId.update((actuel) => (actuel === id ? null : id));
  }

  protected deselectionner(): void {
    this.selectionId.set(null);
  }

  /**
   * Ouvre la carte en plein écran sur le dossier demandé. Le dossier est relu
   * depuis l'API (`GET /api/dossiers/{id}`) afin d'afficher la position
   * réellement enregistrée en base.
   */
  protected localiser(id: string, event?: Event): void {
    event?.stopPropagation();
    this.carteDossier.set(null);
    this.carteErreur.set('');
    this.carteChargement.set(true);
    this.carteOuverte.set(true);

    this.dossiersApi.voir(id).subscribe({
      next: (reponse) => {
        this.carteDossier.set(dossierDepuisApi(reponse.data));
        this.carteChargement.set(false);
      },
      error: (erreur: unknown) => {
        this.carteChargement.set(false);
        this.carteErreur.set(messageErreur(erreur));
      },
    });
  }

  /** Ferme la carte plein écran et revient à la liste. */
  protected fermerCarte(): void {
    this.carteOuverte.set(false);
    this.carteDossier.set(null);
    this.carteErreur.set('');
    this.carteChargement.set(false);
  }

  protected ouvrirEdition(loc: LocalisationLigne): void {
    this.store.effacerMessages();
    this.editionId.set(loc.id);
    this.form.reset({
      adresse: loc.adresse,
      quartier: loc.quartier,
      arrondissement: loc.arrondissement,
      coordX: loc.coordX,
      coordY: loc.coordY,
      latitude: loc.latitude,
      longitude: loc.longitude,
    });
    this.formulaireOuvert.set(true);
  }

  protected fermerFormulaire(): void {
    this.formulaireOuvert.set(false);
  }

  protected invalide(champ: string): boolean {
    const c = this.form.get(champ);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  protected message(champ: string): string {
    const c = this.form.get(champ);
    if (!c || !c.errors) return '';
    const type = Object.keys(c.errors)[0];
    return LocalisationsComponent.MESSAGES[champ]?.[type] ?? 'Champ invalide.';
  }

  /** Enregistre la modification via l'API puis ferme la fenêtre. */
  protected enregistrer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const id = this.editionId();
    if (id === null) return;
    this.store.modifier(id, this.form.getRawValue()).subscribe({
      next: () => this.fermerFormulaire(),
      error: () => undefined,
    });
  }

  // --- Localiser un dossier ---
  protected ouvrirDossierFormulaire(): void {
    this.dossierSucces.set('');
    this.dossierErreur.set('');
    this.dossierForm.reset({
      dossierId: '',
      adresse: '',
      quartier: '',
      arrondissement: '',
      coordX: '',
      coordY: '',
      latitude: '',
      longitude: '',
    });
    this.dossierFormulaireOuvert.set(true);
  }

  protected fermerDossierFormulaire(): void {
    this.dossierFormulaireOuvert.set(false);
  }

  protected dossierInvalide(champ: string): boolean {
    const c = this.dossierForm.get(champ);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  protected dossierMessage(champ: string): string {
    if (champ === 'dossierId') return 'Sélectionnez un dossier.';
    const c = this.dossierForm.get(champ);
    if (!c || !c.errors) return '';
    const type = Object.keys(c.errors)[0];
    return LocalisationsComponent.MESSAGES[champ]?.[type] ?? 'Champ invalide.';
  }

  /** Construit les valeurs métier attendues par l'API à partir du dossier existant. */
  private valeurEdition(dossier: Dossier, localisation: Dossier['localisation']): DossierFormValue {
    return {
      infos: dossier.infos,
      contrevenant: dossier.contrevenant,
      localisation,
      complements: dossier.complements,
      arretes: dossier.arretes,
      type: dossier.type,
      service: dossier.service,
      statut: dossier.statut,
      priorite: dossier.priorite,
      attentionRequise: dossier.attentionRequise,
      motifAttention: dossier.motifAttention,
      agent: dossier.agent,
    };
  }

  /** Localise le dossier sélectionné : met à jour ses champs de localisation. */
  protected enregistrerDossier(): void {
    if (this.dossierForm.invalid) {
      this.dossierForm.markAllAsTouched();
      return;
    }
    const valeur = this.dossierForm.getRawValue();
    const dossier = this.dossiers().find((d) => d.id === valeur.dossierId);
    if (!dossier) {
      this.dossierErreur.set('Dossier introuvable.');
      return;
    }

    this.dossierEnCours.set(true);
    this.dossierSucces.set('');
    this.dossierErreur.set('');

    const adresse = valeur.adresse.trim();
    const localisation: Dossier['localisation'] = {
      ...dossier.localisation,
      adresse,
      localisation: adresse,
      quartier: valeur.quartier.trim(),
      arrondissement: valeur.arrondissement,
      coordX: valeur.coordX.trim(),
      coordY: valeur.coordY.trim(),
      latitude: valeur.latitude.trim(),
      longitude: valeur.longitude.trim(),
    };

    this.dossiersStore.modifier(dossier.id, this.valeurEdition(dossier, localisation)).subscribe({
      next: () => {
        this.dossierEnCours.set(false);
        this.dossierSucces.set(
          `Dossier ${dossier.reference || `#${dossier.id}`} localisé avec succès.`,
        );
        this.fermerDossierFormulaire();
      },
      error: () => {
        this.dossierEnCours.set(false);
        this.dossierErreur.set(this.dossiersStore.erreurAction() || 'Échec de l’enregistrement.');
      },
    });
  }

  // --- Modification des coordonnées d'un dossier ---
  /**
   * Ouvre la fenêtre de modification de la latitude / longitude d'un dossier.
   * Les valeurs actuelles (lues en base) servent de valeur initiale.
   */
  protected ouvrirModificationCoordonnees(id: string, event?: Event): void {
    event?.stopPropagation();
    this.coordonneesSucces.set('');
    this.coordonneesErreur.set('');
    this.coordonneesDossierId.set(id);

    const dossier =
      this.dossiers().find((d) => d.id === id) ??
      (this.carteDossier()?.id === id ? this.carteDossier() : null);
    this.coordonneesForm.reset({
      latitude: dossier?.localisation.latitude ?? '',
      longitude: dossier?.localisation.longitude ?? '',
    });
    this.coordonneesFormulaireOuvert.set(true);
  }

  protected fermerModificationCoordonnees(): void {
    this.coordonneesFormulaireOuvert.set(false);
    this.coordonneesDossierId.set(null);
  }

  protected coordonneesInvalide(champ: string): boolean {
    const c = this.coordonneesForm.get(champ);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  protected coordonneesMessage(champ: string): string {
    const c = this.coordonneesForm.get(champ);
    if (!c || !c.errors) return '';
    const type = Object.keys(c.errors)[0];
    return LocalisationsComponent.MESSAGES_COORDONNEES[champ]?.[type] ?? 'Champ invalide.';
  }

  /**
   * Enregistre la latitude et la longitude via l'API Laravel
   * (`PUT /api/dossiers/{id}`) : les valeurs sont persistées en base (MySQL).
   */
  protected enregistrerCoordonnees(): void {
    if (this.coordonneesForm.invalid) {
      this.coordonneesForm.markAllAsTouched();
      return;
    }
    const id = this.coordonneesDossierId();
    if (id === null) return;

    const valeur = this.coordonneesForm.getRawValue();
    const latitude = valeur.latitude.trim().replace(',', '.');
    const longitude = valeur.longitude.trim().replace(',', '.');

    this.coordonneesEnCours.set(true);
    this.coordonneesErreur.set('');
    this.coordonneesSucces.set('');

    this.dossiersStore.modifierCoordonnees(id, latitude, longitude).subscribe({
      next: (dossier) => {
        this.coordonneesEnCours.set(false);
        this.coordonneesSucces.set(
          `Position du dossier ${dossier.reference || `#${dossier.id}`} enregistrée.`,
        );
        this.fermerModificationCoordonnees();
        // La carte plein écran est rechargée pour afficher les valeurs relues en base.
        if (this.carteOuverte()) this.localiser(id);
      },
      error: () => {
        this.coordonneesEnCours.set(false);
        this.coordonneesErreur.set(
          this.dossiersStore.erreurAction() || 'Échec de l’enregistrement.',
        );
      },
    });
  }

  // --- Filtres ---
  protected setRecherche(v: string): void {
    this.recherche.set(v);
    this.selectionId.set(null);
  }

  protected setArrondissement(v: string): void {
    this.arrondissement.set(v);
    this.selectionId.set(null);
  }

  protected setCoordonnees(v: string): void {
    this.coordonneesFiltre.set(v as FiltreCoordonnees);
    this.selectionId.set(null);
  }

  protected reinitialiser(): void {
    this.recherche.set('');
    this.arrondissement.set('');
    this.coordonneesFiltre.set('');
    this.selectionId.set(null);
  }

  /** Ferme toutes les fenêtres (touche Échap). */
  protected fermerTous(): void {
    this.formulaireOuvert.set(false);
    this.dossierFormulaireOuvert.set(false);
    this.coordonneesFormulaireOuvert.set(false);
    this.carteOuverte.set(false);
  }
}