"use client";

import React, { useCallback, useEffect, useMemo } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useContractStore } from '@/src/store/contractStore';
import { VariableMark } from './editor/VariableMark';
import { ContractSection } from '@/src/types/contract';

export default function EditorPane() {
  const {
    docTree,
    activeSectionId,
    variables,
    updateSection,
    toggleVariableDrawer,
  } = useContractStore();

  // Trouver la section active (recherche récursive)
  const selectedSectionMemo = useMemo(() => {
    if (!activeSectionId) return null;
    
    const findSectionById = (sections: ContractSection[], id: string): ContractSection | null => {
      for (const section of sections) {
        if (section.id === id) return section;
        const found = findSectionById(section.children, id);
        if (found) return found;
      }
      return null;
    };
    
    return findSectionById(docTree, activeSectionId);
  }, [activeSectionId, docTree]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Commencez à écrire le contenu de cette section...',
      }),
      VariableMark.configure({
        onVariableClick: (key: string) => {
          console.log('Variable clicked:', key);
          toggleVariableDrawer();
        },
      }),
    ],
    content: selectedSectionMemo?.content,
    editorProps: {
      attributes: {
        class: 'focus:outline-none w-full',
      },
    },
    onUpdate: useCallback(({ editor }: { editor: Editor }) => {
      if (selectedSectionMemo) {
        updateSection(selectedSectionMemo.id, {
          ...selectedSectionMemo,
          content: editor.getJSON(),
        });
      }
    }, [selectedSectionMemo, updateSection]),
    immediatelyRender: false,
  });

  // Mettre à jour le contenu quand la section sélectionnée change ou quand les variables changent
  useEffect(() => {
    if (editor && selectedSectionMemo) {
      const currentContent = editor.getJSON();
      const newContent = selectedSectionMemo.content;
      
      // Convertir le contenu en texte pour remplacer les variables
      const contentText = JSON.stringify(newContent);
      const updatedContentText = contentText.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key] !== undefined ? variables[key] : match;
      });
      
      // Convertir le texte mis à jour en JSON
      const updatedContent = JSON.parse(updatedContentText);
      
      // Ne mettre à jour que si le contenu a changé
      if (JSON.stringify(currentContent) !== JSON.stringify(updatedContent)) {
        editor.commands.setContent(updatedContent);
      }
    }
  }, [editor, selectedSectionMemo, variables]);

  // Helper function to insert variable
  const insertVariable = (key: string) => {
    if (editor) {
      const value = `{{${key}}}`;
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: value,
          marks: [{ type: 'variableMark', attrs: { key } }],
        })
        .run();
    }
  };

  // Expose insertVariable function globally for other components
  React.useEffect(() => {
    (window as any).insertVariable = insertVariable;
    return () => {
      delete (window as any).insertVariable;
    };
  }, [insertVariable]);

  // Mémoiser le rendu pour éviter les re-renders inutiles
  const content = useMemo(() => {
    if (!selectedSectionMemo) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">Sélectionnez une section</h3>
            <p className="text-sm">
              Choisissez une section dans la barre latérale pour commencer à éditer son contenu.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col bg-white w-full" style={{ minWidth: 0 }}>
        {/* Section header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedSectionMemo.title}
              </h2>
              <p className="text-sm text-gray-500">
                Section niveau {selectedSectionMemo.level}
              </p>
            </div>
          </div>
        </div>

        {/* Editor toolbar */}
        <div className="border-b border-gray-200 px-6 py-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`px-3 py-1 text-sm rounded ${
                editor?.isActive('bold')
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Gras
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`px-3 py-1 text-sm rounded ${
                editor?.isActive('italic')
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Italique
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`px-3 py-1 text-sm rounded ${
                editor?.isActive('bulletList')
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Liste
            </button>
            
            <div className="h-4 w-px bg-gray-300 mx-2" />
            
            <button
              onClick={() => insertVariable('client_name')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              + Nom client
            </button>
            <button
              onClick={() => insertVariable('contract_date')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              + Date contrat
            </button>
            <button
              onClick={() => insertVariable('provider_name')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              + Prestataire
            </button>
          </div>
        </div>

        {/* Editor content */}
        <div className="flex-1 overflow-y-auto w-full" style={{ minWidth: 0 }}>
          <EditorContent 
            editor={editor}
            className="h-full w-full"
          />
        </div>

        {/* Status bar */}
        <div className="border-t border-gray-200 px-6 py-2 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>
              {editor?.storage.characterCount?.characters() || 0} caractères
            </div>
            <div>
              Section: {selectedSectionMemo.id}
            </div>
          </div>
        </div>
      </div>
    );
  }, [selectedSectionMemo, editor, insertVariable]);

  return content;
}

const updateSectionInTree = (
  sections: ContractSection[] | undefined | null, 
  id: string, 
  patch: Partial<ContractSection>
): ContractSection[] => {
  if (!Array.isArray(sections)) return [];
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