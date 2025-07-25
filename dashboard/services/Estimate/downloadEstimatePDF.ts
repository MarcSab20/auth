'use client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Définition du type EstimateItem (harmonisé avec les autres composants)
interface EstimateItem {
  id: string; // Utiliser un string ou un number selon vos besoins
  title: string;
  description: string;
  quantity: string;
  unitPrice: string;
  total: string; // Prix formaté comme "100€"
}

// Données complètes du devis
interface EstimateData {
  id: string;
  uniqRef: string;
  clientName: string;
  subTotal: number;
  tax: number;
  total: number;
  items: EstimateItem[]; // Tableau d'objets EstimateItem[]
  negotiable: boolean;
  stage: string; // Statut du devis (e.g. "Pending", "Approved")
  dueDate: string; // Date d'échéance
  from: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  to: {
    name: string;
    address: string;
  };
  estimateNumber: string;
  issueDate: string;
  validUntil: string;
}

/**
 * Génère un PDF basé sur les données de l'estimate.
 */
export async function downloadEstimatePdf(estimate: EstimateData) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const marginX = 40;
  let positionY = 40;

  // Titre principal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Détails du devis', marginX, positionY);
  positionY += 30;

  // Numéro de devis
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Devis # ${estimate.estimateNumber}`, marginX, positionY);
  positionY += 20;

  // Informations émetteur (from)
  doc.setFont('helvetica', 'bold');
  doc.text(`${estimate.from.name}`, marginX, positionY);
  positionY += 14;
  doc.setFont('helvetica', 'normal');
  doc.text(`${estimate.from.address}`, marginX, positionY);
  positionY += 14;
  doc.text(`Email : ${estimate.from.email}`, marginX, positionY);
  positionY += 14;
  doc.text(`Téléphone : ${estimate.from.phone}`, marginX, positionY);

  // Informations client (to)
  const clientX = 300;
  positionY = 80;
  doc.setFont('helvetica', 'bold');
  doc.text('Facturé à', clientX, positionY);
  positionY += 14;
  doc.setFont('helvetica', 'normal');
  doc.text(`${estimate.to.name}`, clientX, positionY);
  positionY += 14;
  doc.text(`${estimate.to.address}`, clientX, positionY);

  // Dates
  positionY += 20;
  doc.text(`Émis le : ${estimate.issueDate}`, clientX, positionY);
  positionY += 14;
  doc.text(`Valide jusqu'au : ${estimate.validUntil}`, clientX, positionY);

  // Tableau des items
  positionY += 30;
  const tableColumns = [
    { header: 'Description', dataKey: 'description' },
    { header: 'Quantité', dataKey: 'quantity' },
    { header: 'Prix unitaire (€)', dataKey: 'unitPrice' },
    { header: 'Total (€)', dataKey: 'total' },
  ];

  const tableRows = estimate.items.map((item) => ({
    description: `${item.title}\n${item.description}`,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.total,
  }));

  autoTable(doc, {
    startY: positionY,
    theme: 'plain',
    head: [tableColumns.map((col) => col.header)],
    body: tableRows.map((row) => [row.description, row.quantity, row.unitPrice, row.total]),
    styles: {
      font: 'helvetica',
      fontSize: 10,
      cellPadding: 8,
      lineColor: [220, 220, 220],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;

  // Sous-total, Taxe et Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Sous-total :', marginX, finalY);
  doc.text(`${estimate.subTotal.toFixed(2)} €`, 500, finalY, { align: 'right' });
  positionY = finalY + 14;

  doc.text('Taxe :', marginX, positionY);
  doc.text(`${estimate.tax.toFixed(2)} €`, 500, positionY, { align: 'right' });
  positionY += 14;

  doc.setFontSize(14);
  doc.text('Total :', marginX, positionY);
  doc.text(`${estimate.total.toFixed(2)} €`, 500, positionY, { align: 'right' });
  positionY += 30;

  // Termes et conditions
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Termes et conditions : Les paiements doivent être effectués dans les délais spécifiés. Les paiements tardifs peuvent entraîner des frais supplémentaires, conformément à notre politique.`,
    marginX,
    positionY,
    { maxWidth: 500 },
  );

  // Sauvegarder le PDF
  doc.save(`Devis-${estimate.estimateNumber}.pdf`);
}