/**
 * Calcul des bornes d'une période d'export (jour, semaine, mois, année).
 * Les dates sont manipulées en composants locaux (`getFullYear`, `getMonth`,
 * `getDate`) puis formatées en `yyyy-MM-dd` : aucun passage par UTC n'est
 * effectué, ce qui évite tout décalage d'un jour selon le fuseau horaire.
 */

/** Granularité d'une période d'export. */
export type GranularitePeriode = 'jour' | 'semaine' | 'mois' | 'annee';

/** Bornes inclusives d'une période, au format ISO `yyyy-MM-dd`. */
export interface BornesPeriode {
  du: string;
  au: string;
}

/** Libellés affichés dans le menu d'export. */
export const PERIODES: readonly { valeur: GranularitePeriode; libelle: string }[] = [
  { valeur: 'jour', libelle: 'Par jour' },
  { valeur: 'semaine', libelle: 'Par semaine' },
  { valeur: 'mois', libelle: 'Par mois' },
  { valeur: 'annee', libelle: 'Par année' },
];

const ADJECTIF: Record<GranularitePeriode, string> = {
  jour: 'journalier',
  semaine: 'hebdomadaire',
  mois: 'mensuel',
  annee: 'annuel',
};

/** Formate une date locale en `yyyy-MM-dd` (sans conversion UTC). */
function formater(date: Date): string {
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const jour = String(date.getDate()).padStart(2, '0');
  return `${annee}-${mois}-${jour}`;
}

/** Date du jour au format `yyyy-MM-dd`, selon le fuseau local. */
export function dateAujourdhui(): string {
  return formater(new Date());
}

/**
 * Analyse une date `yyyy-MM-dd` (ou ISO) en date locale. Une valeur vide ou
 * invalide retombe sur la date du jour.
 */
function analyser(dateReference: string): Date {
  const correspondance = /^(\d{4})-(\d{2})-(\d{2})/.exec((dateReference ?? '').trim());
  if (!correspondance) return new Date();

  const [, annee, mois, jour] = correspondance;
  const date = new Date(Number(annee), Number(mois) - 1, Number(jour));
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

/** Calcule les bornes inclusives de la période contenant `dateReference`. */
export function bornesPeriode(
  granularite: GranularitePeriode,
  dateReference: string,
): BornesPeriode {
  const reference = analyser(dateReference);
  const annee = reference.getFullYear();
  const mois = reference.getMonth();
  const jour = reference.getDate();

  switch (granularite) {
    case 'semaine': {
      const jourSemaine = reference.getDay();
      const decalageLundi = jourSemaine === 0 ? -6 : 1 - jourSemaine;
      const lundi = new Date(annee, mois, jour + decalageLundi);
      const dimanche = new Date(annee, mois, jour + decalageLundi + 6);
      return { du: formater(lundi), au: formater(dimanche) };
    }
    case 'mois': {
      const premier = new Date(annee, mois, 1);
      const dernier = new Date(annee, mois + 1, 0);
      return { du: formater(premier), au: formater(dernier) };
    }
    case 'annee':
      return {
        du: formater(new Date(annee, 0, 1)),
        au: formater(new Date(annee, 11, 31)),
      };
    case 'jour':
    default:
      return {
        du: formater(new Date(annee, mois, jour)),
        au: formater(new Date(annee, mois, jour)),
      };
  }
}

/** Formate une date ISO `yyyy-MM-dd` en `jj/mm/aaaa` (sans décalage UTC). */
export function formatDateFr(dateIso: string): string {
  const correspondance = /^(\d{4})-(\d{2})-(\d{2})/.exec((dateIso ?? '').trim());
  return correspondance
    ? `${correspondance[3]}/${correspondance[2]}/${correspondance[1]}`
    : (dateIso ?? '');
}

/** Adjectif de la granularité (« journalier », « hebdomadaire »…). */
export function adjectifPeriode(granularite: GranularitePeriode): string {
  return ADJECTIF[granularite];
}

/** Libellé lisible d'une période, ex. « du 26/10/2026 au 01/11/2026 ». */
export function libellePeriode(bornes: BornesPeriode): string {
  return bornes.du === bornes.au
    ? `le ${formatDateFr(bornes.du)}`
    : `du ${formatDateFr(bornes.du)} au ${formatDateFr(bornes.au)}`;
}
