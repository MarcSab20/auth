import { NextRequest, NextResponse } from 'next/server';
import { useContractStore } from '@/src/store/contractStore';
import demoTemplate from '@/src/templates/contracts/demo.json';
import { ContractSection } from '@/src/types/contract';

interface Contract {
  id: string;
  title: string;
  sections: ContractSection[];
  client: {
    name: string;
    email: string;
    address: string;
  };
  provider: {
    name: string;
    email: string;
    address: string;
  };
  createdAt: string;
  validUntil: string;
  status: string;
  variables?: Record<string, string>;
}

// Fonction pour remplacer les variables dans un texte
function replaceVariables(text: string, variables: Record<string, string> = {}) {
  return text.replace(/\{\{(.*?)\}\}/g, (_, key) => variables[key.trim()] || '');
}

// Fonction pour parser le contenu JSON TipTap et générer du HTML
function renderTipTapContent(content: any, variables: Record<string, string> = {}): string {
  if (!content || !content.content) return '';
  const renderNode = (node: any): string => {
    switch (node.type) {
      case 'paragraph':
        return `<p>${(node.content || []).map(renderNode).join('')}</p>`;
      case 'heading':
        const level = node.attrs?.level || 1;
        return `<h${level}>${(node.content || []).map(renderNode).join('')}</h${level}>`;
      case 'bulletList':
        return `<ul>${(node.content || []).map(renderNode).join('')}</ul>`;
      case 'listItem':
        return `<li>${(node.content || []).map(renderNode).join('')}</li>`;
      case 'text':
        let text = node.text || '';
        text = replaceVariables(text, variables);
        if (node.marks) {
          node.marks.forEach((mark: any) => {
            switch (mark.type) {
              case 'bold':
                text = `<strong>${text}</strong>`;
                break;
              case 'italic':
                text = `<em>${text}</em>`;
                break;
            }
          });
        }
        return text;
      default:
        return (node.content || []).map(renderNode).join('');
    }
  };
  return content.content.map(renderNode).join('');
}

// Fonction pour convertir le template en sections
function convertTemplateToSections(template: any): ContractSection[] {
  if (!template.sections) return [];
  
  return template.sections.map((section: any) => ({
    id: section.id,
    title: section.title,
    content: section.content,
    level: section.level || 1,
    children: section.children || []
  }));
}

export async function GET(
  request: NextRequest,
  { params }: { params: { contractID: string } }
) {
  try {
    const contractId = params.contractID;
    
    // Pour le moment, on ne gère que le contrat demo
    if (contractId === 'demo') {
      const contract: Contract = {
        id: 'demo',
        title: 'Contrat de Prestation de Services - DEMO',
        sections: convertTemplateToSections(demoTemplate),
        client: {
          name: 'ACME Corporation',
          email: 'contact@acme.com',
          address: '123 Rue de la Paix, 75001 Paris, France'
        },
        provider: {
          name: 'Sylorion Consulting',
          email: 'contact@sylorion.com',
          address: '456 Avenue des Champs, 75008 Paris, France'
        },
        createdAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'draft',
        variables: demoTemplate.variables || {}
      };
      
      return NextResponse.json(contract);
    }
    
    // Pour les autres contrats, retourner 404
    return NextResponse.json(
      { error: 'Contrat non trouvé' },
      { status: 404 }
    );
    
  } catch (error) {
    console.error('Erreur lors de la récupération du contrat:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { contractID: string } }
) {
  try {
    const data = await request.json();
    const store = useContractStore.getState();
    
    // Mettre à jour le store avec les nouvelles données
    store.updateMetadata({
      title: data.title,
      clientName: data.client.name,
      status: data.status
    });

    return NextResponse.json({
      id: params.contractID,
      title: data.title,
      sections: store.docTree,
      client: data.client,
      provider: data.provider,
      createdAt: data.createdAt,
      validUntil: data.validUntil,
      status: data.status
    });
  } catch (error) {
    console.error('Error updating contract:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 