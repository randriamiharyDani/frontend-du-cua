import { Injectable } from '@angular/core';
import {
  ETAPE_LABEL,
  NATURE_LABEL,
  nomContrevenant,
  STATUT_LABEL,
} from '../models/dossier.model';
import { Dossier } from '../models/dossier.model';
import {
  adjectifPeriode,
  BornesPeriode,
  dateAujourdhui,
  formatDateFr,
  GranularitePeriode,
  libellePeriode,
} from '../utils/periode.util';

/** Options d'un export PDF de dossiers. */
export interface OptionsPdf {
  granularite: GranularitePeriode;
  bornes: BornesPeriode;
}

/**
 * Génère le rapport PDF des dossiers d'une période.
 * `jspdf` et `jspdf-autotable` sont importés dynamiquement afin de ne pas
 * alourdir le bundle initial.
 */
@Injectable({ providedIn: 'root' })
export class DossierPdfService {
  /** Produit et télécharge le PDF (A4 paysage) des dossiers fournis. */
  async generer(dossiers: Dossier[], options: OptionsPdf): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const { autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const largeurPage = doc.internal.pageSize.getWidth();
    const hauteurPage = doc.internal.pageSize.getHeight();
    const marge = 12;

    const titre = `Rapport ${adjectifPeriode(options.granularite)} — Constructions illicites`;
    const periode = `Période : ${libellePeriode(options.bornes)}`;
    const nombre = `${dossiers.length} dossier(s)`;
    const edition = `Édité le ${formatDateFr(dateAujourdhui())}`;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(18, 48, 46);
    doc.text(titre, marge, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 100, 98);
    doc.text(periode, marge, 24);
    doc.text(nombre, marge, 30);
    doc.text(edition, marge, 36);

    autoTable(doc, {
      startY: 42,
      head: [[
        'N° dossier',
        'Date d’entrée',
        'Nature',
        'Contrevenant',
        'Objet',
        'Localisation',
        'Service',
        'Étape',
        'Statut',
      ]],
      body: dossiers.map((d) => [
        d.reference || '—',
        d.infos.dateEntree ? formatDateFr(d.infos.dateEntree) : '—',
        NATURE_LABEL[d.infos.nature] ?? '—',
        nomContrevenant(d.contrevenant) || '—',
        d.complements.objet || '—',
        d.localisation.adresse || '—',
        d.service,
        ETAPE_LABEL[d.etape] ?? '—',
        STATUT_LABEL[d.statut] ?? '—',
      ]),
      styles: {
        font: 'helvetica',
        fontSize: 7.5,
        cellPadding: 1.6,
        overflow: 'linebreak',
        valign: 'top',
        textColor: [31, 45, 44],
        lineColor: [211, 224, 223],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [13, 128, 116],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      alternateRowStyles: {
        fillColor: [244, 248, 247],
      },
      columnStyles: {
        0: { cellWidth: 26 },
        1: { cellWidth: 22 },
        2: { cellWidth: 22 },
        3: { cellWidth: 36 },
        4: { cellWidth: 42 },
        5: { cellWidth: 42 },
        6: { cellWidth: 18 },
        7: { cellWidth: 26 },
        8: { cellWidth: 22 },
      },
      margin: { left: marge, right: marge, top: 12, bottom: 16 },
    });

    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 119, 117);
      doc.text(`Page ${page} / ${totalPages}`, largeurPage - marge, hauteurPage - 6, {
        align: 'right',
      });
    }

    doc.save(`rapport-dossiers-${adjectifPeriode(options.granularite)}-${options.bornes.du}.pdf`);
  }
}
