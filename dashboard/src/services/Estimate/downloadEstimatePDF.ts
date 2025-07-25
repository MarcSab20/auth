import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface EstimateItem {
  id: string;
  title: string;
  description: string;
  quantity: string;
  unitPrice: string;
  total: string;
}

interface EstimateData {
  id: string;
  uniqRef: string;
  clientName: string;
  subTotal: number;
  tax: number;
  total: number;
  items: EstimateItem[];
  from: {
    name?: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  to: {
    name?: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  estimateNumber: string;
  issueDate: string;
  validUntil: string;
  negotiable?: boolean;
  stage?: string;
  dueDate?: string;
  page?: number;
}

export async function downloadEstimatePdf(data: EstimateData): Promise<void> {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const marginX = 40;
  let positionY = 40;

  // En-tête avec numéro de devis
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Devis #${data.estimateNumber}`, marginX, positionY);
  positionY += 20;

  // Dates
  doc.text(`Émis le : ${data.issueDate}`, marginX, positionY);
  positionY += 14;
  doc.text(`Valide jusqu'au : ${data.validUntil}`, marginX, positionY);
  positionY += 20;

  // Coordonnées
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.from.name}`, marginX, positionY);
  positionY += 14;
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.from.address}`, marginX, positionY);
  positionY += 14;
  doc.text(`${data.from.email}`, marginX, positionY);
  positionY += 14;
  doc.text(`${data.from.phone}`, marginX, positionY);
  positionY += 20;

  // Client
  const clientX = 300;
  positionY = 80;
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.to.name}`, clientX, positionY);
  positionY += 14;
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.to.address}`, clientX, positionY);
  positionY += 30;

  // Tableau des items
  const tableColumns = [
    { header: 'Description', dataKey: 'description' },
    { header: 'Qté', dataKey: 'quantity' },
    { header: 'PU (€)', dataKey: 'unitPrice' },
    { header: 'Total (€)', dataKey: 'total' },
  ];

  const tableRows = data.items.map((item) => ({
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

  // Totaux uniquement sur la dernière page
  if (data.page === Math.ceil(data.items.length / 5)) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Sous-total :', marginX, finalY);
    doc.text(`${data.subTotal.toFixed(2)} €`, 500, finalY, { align: 'right' });
    positionY = finalY + 14;

    doc.text('Taxe :', marginX, positionY);
    doc.text(`${data.tax.toFixed(2)} €`, 500, positionY, { align: 'right' });
    positionY += 14;

    doc.setFontSize(14);
    doc.text('Total :', marginX, positionY);
    doc.text(`${data.total.toFixed(2)} €`, 500, positionY, { align: 'right' });
    positionY += 30;

    // Termes et conditions
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Termes et conditions : Les paiements doivent être effectués dans les délais spécifiés. Les paiements tardifs peuvent entraîner des frais supplémentaires.',
      marginX,
      positionY,
      { maxWidth: 500 },
    );
  }

  // Sauvegarder le PDF
  doc.save(`Devis-${data.estimateNumber}.pdf`);
} 