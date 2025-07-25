import { ContractSection, ContractVariable } from '@/src/types/contract';

// Convert old template format to new TipTap format
export function convertTemplateToTipTap(templateData: any): ContractSection[] {
  if (!templateData || !templateData.sections) {
    return [];
  }

  return templateData.sections.map((section: any) => convertSectionToTipTap(section));
}

function convertSectionToTipTap(section: any): ContractSection {
  // Si le content est déjà un objet (TipTap), on le garde tel quel
  let content;
  if (typeof section.content === 'object' && section.content !== null) {
    content = section.content;
  } else {
    content = textToTipTapJSON(section.content || '');
  }
  // Convert children recursively (changed from subsections to children)
  const children = section.children 
    ? section.children.map((sub: any) => convertSectionToTipTap(sub))
    : [];

  return {
    id: section.id || generateId(),
    title: section.title || '',
    level: section.level || 1,
    content: content,
    variables: section.variables || [],
    children: children,
  };
}

function textToTipTapJSON(text: string): any {
  if (!text) {
    return { type: 'doc', content: [] };
  }

  // Split text into paragraphs
  const paragraphs = text.split('\n').filter(p => p.trim());
  
  const content = paragraphs.map(paragraph => {
    const trimmed = paragraph.trim();
    
    // Check if it's a heading (starts with #)
    if (trimmed.startsWith('#')) {
      const level = (trimmed.match(/^#+/) || [''])[0].length;
      const title = trimmed.replace(/^#+\s*/, '');
      
      return {
        type: 'heading',
        attrs: { level: Math.min(level, 6) },
        content: [{ type: 'text', text: title }]
      };
    }
    
    // Check if it's a bullet point
    if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      const text = trimmed.replace(/^[•-]\s*/, '');
      return {
        type: 'bulletList',
        content: [{
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: parseInlineContent(text)
          }]
        }]
      };
    }
    
    // Regular paragraph
    return {
      type: 'paragraph',
      content: parseInlineContent(trimmed)
    };
  });

  return {
    type: 'doc',
    content: content
  };
}

function parseInlineContent(text: string): any[] {
  const content: any[] = [];
  
  // Split by variables {{variable}} pattern
  const parts = text.split(/(\{\{[^}]+\}\})/);
  
  parts.forEach(part => {
    if (part.match(/^\{\{[^}]+\}\}$/)) {
      // This is a variable
      const key = part.slice(2, -2);
      content.push({
        type: 'text',
        text: `{{${key}}}`,
        marks: [{ type: 'variableMark', attrs: { key } }]
      });
    } else if (part) {
      // Regular text - check for formatting
      content.push(...parseFormattedText(part));
    }
  });
  
  return content;
}

function parseFormattedText(text: string): any[] {
  // Simple parser for basic formatting
  const content: any[] = [];
  
  // For now, just return plain text
  // TODO: Add support for **bold**, *italic*, etc.
  if (text) {
    content.push({ type: 'text', text: text });
  }
  
  return content;
}

function generateId(): string {
  return `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to extract all variables from a template
export function extractTemplateVariables(templateData: any): ContractVariable[] {
  const variables: ContractVariable[] = [];
  const variableMap = new Map<string, ContractVariable>();
  
  function processSection(section: any) {
    // Add section-defined variables
    if (section.variables && Array.isArray(section.variables)) {
      section.variables.forEach((variable: ContractVariable) => {
        variableMap.set(variable.key, variable);
      });
    }
    
    // Extract variables from content
    const content = section.content || '';
    const matches = content.match(/\{\{(\w+)\}\}/g) || [];
    
    matches.forEach((match: string) => {
      const key = match.slice(2, -2);
      if (!variableMap.has(key)) {
        // Create default variable definition
        variableMap.set(key, {
          key,
          label: key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          type: inferVariableType(key),
          required: true,
        });
      }
    });
    
    // Process children (changed from subsections to children)
    if (section.children && Array.isArray(section.children)) {
      section.children.forEach(processSection);
    }
  }
  
  if (templateData.sections && Array.isArray(templateData.sections)) {
    templateData.sections.forEach(processSection);
  }
  
  return Array.from(variableMap.values());
}

function inferVariableType(key: string): ContractVariable['type'] {
  if (key.includes('date') || key.includes('_date')) return 'date';
  if (key.includes('amount') || key.includes('price') || key.includes('capital')) return 'number';
  if (key.includes('description') || key.includes('content') || key.includes('block')) return 'textarea';
  if (key.includes('legal_form') || key.includes('jurisdiction') || key.includes('rate_unit')) return 'select';
  return 'text';
}

// Get default options for select variables
export function getDefaultOptions(key: string): string[] {
  switch (key) {
    case 'provider_legal_form':
    case 'client_legal_form':
      return ['SAS', 'SARL', 'SA', 'EURL'];
    case 'jurisdiction':
      return ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille'];
    case 'rate_unit':
      return ['demi-journée', 'journée', 'heure'];
    default:
      return [];
  }
}

// Update template format to include options for select variables
export function enhanceTemplateVariables(variables: ContractVariable[]): ContractVariable[] {
  return variables.map(variable => {
    if (variable.type === 'select' && !variable.options) {
      return {
        ...variable,
        options: getDefaultOptions(variable.key),
      };
    }
    return variable;
  });
} 