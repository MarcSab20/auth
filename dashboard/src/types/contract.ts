export type ContractStatus = 'draft' | 'review' | 'signed' | 'active' | 'expired';
export type ContractType = 'consulting' | 'subcontracting' | 'employment' | 'nda';

export interface ContractVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  default?: string;
  options?: string[];
}

export interface ContractSection {
  id: string;
  title: string;
  level: number;
  content: any; // TipTap JSON content
  variables?: ContractVariable[];
  children: ContractSection[];
  order?: number;
  isCollapsed?: boolean;
}

export interface ContractTemplate {
  id: string;
  title: string;
  version: string;
  sections: ContractSection[];
}

export interface ContractState {
  // Document structure
  docTree: ContractSection[];
  activeSectionId: string | null;
  
  // Variables and their values
  variables: Record<string, any>;
  
  // Contract metadata
  contractId: string;
  contractType: ContractType;
  status: ContractStatus;
  title: string;
  clientName: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  
  // UI state
  isVariableDrawerOpen: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
}

export interface ContractActions {
  // Document tree operations
  setDocTree: (tree: ContractSection[]) => void;
  updateSection: (id: string, patch: Partial<ContractSection>) => void;
  addSection: (parentId?: string, level?: number) => void;
  deleteSection: (id: string) => void;
  moveSection: (id: string, newParentId?: string, newIndex?: number) => void;
  
  // Navigation
  setActiveSection: (id: string | null) => void;
  
  // Variables
  updateVariable: (key: string, value: any) => void;
  setVariables: (variables: Record<string, any>) => void;
  
  // Contract metadata
  updateMetadata: (patch: Partial<Pick<ContractState, 'title' | 'clientName' | 'status'>>) => void;
  
  // UI
  toggleVariableDrawer: () => void;
  setSaving: (saving: boolean) => void;
  setLastSaved: (date: Date) => void;
  
  // Load/Save
  loadContract: (contractId: string) => Promise<void>;
  saveContract: () => Promise<void>;
  loadTemplate: (templateId: string) => Promise<void>;
}

export type ContractStore = ContractState & ContractActions; 