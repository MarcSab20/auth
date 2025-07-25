import { create } from 'zustand';
import { ContractStore, ContractSection, ContractState, ContractType, ContractStatus } from '@/src/types/contract';

// Helper functions
const generateId = () => `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const findSectionById = (sections: ContractSection[] | undefined | null, id: string): ContractSection | null => {
  if (!Array.isArray(sections)) return null;
  for (const section of sections) {
    if (section.id === id) return section;
    const found = findSectionById(section.children, id);
    if (found) return found;
  }
  return null;
};

const updateSectionInTree = (
  sections: ContractSection[], 
  id: string, 
  patch: Partial<ContractSection>
): ContractSection[] => {
  return sections.map(section => {
    if (section.id === id) {
      return { ...section, ...patch };
    }
    return {
      ...section,
      children: updateSectionInTree(section.children, id, patch)
    };
  });
};

const deleteSectionFromTree = (sections: ContractSection[], id: string): ContractSection[] => {
  return sections.filter(section => section.id !== id).map(section => ({
    ...section,
    children: deleteSectionFromTree(section.children, id)
  }));
};

const addSectionToTree = (
  sections: ContractSection[], 
  newSection: ContractSection,
  parentId?: string
): ContractSection[] => {
  if (!parentId) {
    return [...sections, newSection];
  }
  
  return sections.map(section => {
    if (section.id === parentId) {
      return {
        ...section,
        children: [...section.children, newSection]
      };
    }
    return {
      ...section,
      children: addSectionToTree(section.children, newSection, parentId)
    };
  });
};

// Liste des UUIDs de contrats mockés
const MOCK_CONTRACTS = [
  'mock-uuid-1',
  'mock-uuid-2',
  'mock-uuid-3',
];

// Initial state
const initialState: ContractState = {
  docTree: [],
  activeSectionId: null,
  variables: {},
  contractId: '',
  contractType: 'consulting',
  status: 'draft',
  title: '',
  clientName: '',
  version: '1.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isVariableDrawerOpen: false,
  isSaving: false,
  lastSaved: null,
};

export const useContractStore = create<ContractStore>((set, get) => ({
  ...initialState,

  // Document tree operations
  setDocTree: (tree) => 
    set((state) => {
      if (JSON.stringify(state.docTree) === JSON.stringify(tree)) return state;
      return { docTree: tree };
    }),

  updateSection: (id, patch) => 
    set((state) => {
      const currentSection = findSectionById(state.docTree, id);
      if (!currentSection) return state;
      
      const updatedTree = updateSectionInTree(state.docTree, id, patch);
      if (JSON.stringify(state.docTree) === JSON.stringify(updatedTree)) return state;
      
      return {
        docTree: updatedTree,
        updatedAt: new Date().toISOString()
      };
    }),

  addSection: (parentId, level = 1) => {
    const newSection: ContractSection = {
      id: generateId(),
      title: 'Nouvelle section',
      level: level,
      content: { type: 'doc', content: [] },
      children: [],
      variables: []
    };

    set((state) => ({
      docTree: addSectionToTree(state.docTree, newSection, parentId),
      activeSectionId: newSection.id,
      updatedAt: new Date().toISOString()
    }));
  },

  deleteSection: (id) => 
    set((state) => {
      const updatedTree = deleteSectionFromTree(state.docTree, id);
      if (JSON.stringify(state.docTree) === JSON.stringify(updatedTree)) return state;
      
      return {
        docTree: updatedTree,
        activeSectionId: state.activeSectionId === id ? null : state.activeSectionId,
        updatedAt: new Date().toISOString()
      };
    }),

  moveSection: (id, newParentId, newIndex) => {
    // TODO: Implement drag and drop logic
    console.log('Move section:', { id, newParentId, newIndex });
  },

  // Navigation
  setActiveSection: (id) => 
    set((state) => {
      if (state.activeSectionId === id) return state;
      return { activeSectionId: id };
    }),

  // Variables
  updateVariable: (key, value) => 
    set((state) => {
      if (state.variables[key] === value) return state;
      return {
        variables: { ...state.variables, [key]: value },
        updatedAt: new Date().toISOString()
      };
    }),

  setVariables: (variables) => 
    set((state) => {
      if (JSON.stringify(state.variables) === JSON.stringify(variables)) return state;
      return { variables, updatedAt: new Date().toISOString() };
    }),

  // Contract metadata
  updateMetadata: (patch) => 
    set((state) => {
      const hasChanges = Object.entries(patch).some(([key, value]) => state[key as keyof ContractState] !== value);
      if (!hasChanges) return state;
      
      return {
        ...patch,
        updatedAt: new Date().toISOString()
      };
    }),

  // UI
  toggleVariableDrawer: () => 
    set((state) => ({ isVariableDrawerOpen: !state.isVariableDrawerOpen })),

  setSaving: (saving) => 
    set((state) => {
      if (state.isSaving === saving) return state;
      return { isSaving: saving };
    }),

  setLastSaved: (date) => 
    set((state) => {
      if (state.lastSaved === date) return state;
      return { lastSaved: date };
    }),

  // Load/Save operations
  loadContract: async (contractId) => {
    const state = get();
    console.log('[ContractStore] loadContract called with contractId:', contractId);
    if (state.contractId === contractId && state.docTree.length > 0) return;
    try {
      set({ isSaving: true });
      // Si l'ID correspond à un mock, charger le fichier unique et trouver le contrat
      if (MOCK_CONTRACTS.includes(contractId)) {
        console.log('[ContractStore] Loading mock contract:', contractId);
        const response = await fetch('/mocks/mock-contracts.json');
        const contracts = await response.json();
        console.log('[ContractStore] All mock contracts loaded:', contracts);
        const contract = contracts.find((c: any) => c.contractId === contractId);
        console.log('[ContractStore] Selected mock contract:', contract);
        if (!contract) throw new Error('Mock contract not found');
        set({
          contractId: contract.contractId,
          contractType: contract.type,
          status: contract.status,
          title: contract.title,
          clientName: contract.clientName,
          version: contract.version,
          createdAt: contract.createdAt || new Date().toISOString(),
          updatedAt: contract.updatedAt || new Date().toISOString(),
          docTree: contract.structure,
          variables: contract.variables,
          isSaving: false
        });
        return;
      }
      // Sinon, API réelle
      console.log('[ContractStore] Loading contract from API:', contractId);
      const response = await fetch(`/api/contracts/${contractId}`);
      if (!response.ok) throw new Error('Failed to load contract');
      const contract = await response.json();
      console.log('[ContractStore] Contract loaded from API:', contract);
      set({
        contractId: contract.contractId,
        contractType: contract.type,
        status: contract.status,
        title: contract.title,
        clientName: contract.clientName,
        version: contract.version,
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt || contract.createdAt,
        docTree: contract.content?.pages?.[0]?.sections || [],
        variables: contract.variables || {},
        isSaving: false
      });
    } catch (error) {
      console.error('[ContractStore] Error loading contract:', error);
      set({ isSaving: false });
    }
  },

  loadTemplate: async (templateId) => {
    const state = get();
    if (state.contractType === templateId && state.docTree.length > 0) return;
    
    try {
      set({ isSaving: true });
      // Log: début chargement
      console.log('[ContractStore] Loading template:', templateId);
      // Load template from JSON file
      const templateModule = await import(`@/src/templates/contracts/${templateId}.json`);
      const template = templateModule.default;
      console.log('[ContractStore] Template imported:', template);
      if (!template) throw new Error(`Template ${templateId} not found`);
      // Convert template using the new converter
      const { convertTemplateToTipTap } = await import('@/src/utils/templateConverter');
      const docTree = convertTemplateToTipTap(template);
      console.log('[ContractStore] docTree generated:', docTree);
      set({
        docTree,
        title: template.title,
        contractType: templateId as ContractType,
        version: template.version,
        contractId: `template_${templateId}_${Date.now()}`,
        variables: template.variables || {},
        isSaving: false
      });
    } catch (error) {
      console.error('Error loading template:', error);
      set({ isSaving: false });
    }
  },

  saveContract: async () => {
    const state = get();
    try {
      set({ isSaving: true });
      
      const contractData = {
        contractId: state.contractId,
        type: state.contractType,
        status: state.status,
        title: state.title,
        clientName: state.clientName,
        version: state.version,
        content: {
          pages: [{
            id: 'main',
            title: state.title,
            sections: state.docTree,
            order: 0
          }]
        },
        variables: state.variables,
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(`/api/contracts/${state.contractId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractData)
      });

      if (!response.ok) throw new Error('Failed to save contract');
      
      set({ 
        isSaving: false, 
        lastSaved: new Date(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving contract:', error);
      set({ isSaving: false });
    }
  }
})); 