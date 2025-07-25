// types.ts
export interface EstimateItem {
    id: number; // ID en tant que nombre (ou string si nécessaire)
    title: string;
    description: string;
    quantity: string;
    unitPrice: string;
    total: string; // Prix formaté comme "100€"
  }
  
  export interface Estimate {
    id: string; // ID sous forme de chaîne
    uniqRef: string;
    estimateNumber: string; // Ajouté ici (correspond probablement à `uniqRef`)
    clientName: string;
    subTotal: number;
    tax: number;
    total: number;
    items: EstimateItem[];
    negotiable: boolean;
    stage: string; // Statut du devis (e.g. "Pending", "Approved")
    dueDate: string; // Date d'échéance
    issueDate: string; // Ajouté ici
    validUntil: string; // Ajouté ici
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
  }