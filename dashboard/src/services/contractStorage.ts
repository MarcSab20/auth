interface StoredContract {
  id: string;
  contractType: string;
  clientName: string;
  status: 'draft' | 'review' | 'signed' | 'active' | 'expired';
  createdAt: string;
  updatedAt: string;
  variableValues: Record<string, any>;
  content: any;
  version: string;
  notes?: string;
}

class ContractStorageService {
  private readonly STORAGE_KEY = 'smp_contracts';
  private readonly CURRENT_CONTRACT_KEY = 'smp_current_contract';

  // Sauvegarder un contrat
  saveContract(contract: StoredContract): void {
    const contracts = this.getAllContracts();
    const existingIndex = contracts.findIndex(c => c.id === contract.id);
    
    if (existingIndex >= 0) {
      contracts[existingIndex] = {
        ...contract,
        updatedAt: new Date().toISOString()
      };
    } else {
      contracts.push({
        ...contract,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(contracts));
    this.setCurrentContract(contract.id);
  }

  // Récupérer tous les contrats
  getAllContracts(): StoredContract[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Récupérer un contrat par ID
  getContract(id: string): StoredContract | null {
    const contracts = this.getAllContracts();
    return contracts.find(c => c.id === id) || null;
  }

  // Supprimer un contrat
  deleteContract(id: string): void {
    const contracts = this.getAllContracts();
    const filtered = contracts.filter(c => c.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  // Définir le contrat actuel
  setCurrentContract(id: string): void {
    localStorage.setItem(this.CURRENT_CONTRACT_KEY, id);
  }

  // Récupérer le contrat actuel
  getCurrentContractId(): string | null {
    return localStorage.getItem(this.CURRENT_CONTRACT_KEY);
  }

  // Exporter les contrats en CSV
  exportToCSV(): string {
    const contracts = this.getAllContracts();
    const headers = [
      'ID',
      'Type',
      'Client',
      'Statut',
      'Date création',
      'Date modification',
      'Version',
      'Notes'
    ];

    const rows = contracts.map(contract => [
      contract.id,
      contract.contractType,
      contract.clientName,
      contract.status,
      new Date(contract.createdAt).toLocaleDateString('fr-FR'),
      new Date(contract.updatedAt).toLocaleDateString('fr-FR'),
      contract.version,
      contract.notes || ''
    ]);

    const csv = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    return csv;
  }

  // Télécharger le CSV
  downloadCSV(): void {
    const csv = this.exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `contrats_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Rechercher des contrats
  searchContracts(query: string): StoredContract[] {
    const contracts = this.getAllContracts();
    const lowerQuery = query.toLowerCase();
    
    return contracts.filter(contract => 
      contract.clientName.toLowerCase().includes(lowerQuery) ||
      contract.contractType.toLowerCase().includes(lowerQuery) ||
      contract.id.toLowerCase().includes(lowerQuery) ||
      contract.notes?.toLowerCase().includes(lowerQuery)
    );
  }

  // Filtrer par statut
  getContractsByStatus(status: StoredContract['status']): StoredContract[] {
    const contracts = this.getAllContracts();
    return contracts.filter(c => c.status === status);
  }

  // Nettoyer les contrats expirés
  cleanupExpiredContracts(daysToKeep: number = 365): number {
    const contracts = this.getAllContracts();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const activeContracts = contracts.filter(contract => {
      if (contract.status !== 'expired') return true;
      const updatedDate = new Date(contract.updatedAt);
      return updatedDate > cutoffDate;
    });
    
    const deletedCount = contracts.length - activeContracts.length;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(activeContracts));
    
    return deletedCount;
  }

  // Sauvegarder automatiquement (debounced)
  private autoSaveTimeout: NodeJS.Timeout | null = null;
  
  autoSave(contract: StoredContract, delay: number = 2000): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    
    this.autoSaveTimeout = setTimeout(() => {
      this.saveContract(contract);
      console.log('Contract auto-saved');
    }, delay);
  }

  // Statistiques
  getStatistics(): {
    total: number;
    byStatus: Record<StoredContract['status'], number>;
    byType: Record<string, number>;
  } {
    const contracts = this.getAllContracts();
    
    const byStatus: Record<StoredContract['status'], number> = {
      draft: 0,
      review: 0,
      signed: 0,
      active: 0,
      expired: 0
    };
    
    const byType: Record<string, number> = {};
    
    contracts.forEach(contract => {
      byStatus[contract.status]++;
      byType[contract.contractType] = (byType[contract.contractType] || 0) + 1;
    });
    
    return {
      total: contracts.length,
      byStatus,
      byType
    };
  }
}

export const contractStorage = new ContractStorageService();
export type { StoredContract }; 