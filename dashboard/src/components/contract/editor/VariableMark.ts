import { Mark, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { TextSelection } from '@tiptap/pm/state';

export interface VariableMarkOptions {
  HTMLAttributes: Record<string, any>;
  onVariableClick?: (key: string) => void;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    variableMark: {
      setVariableMark: (key: string) => ReturnType;
      toggleVariableMark: (key: string) => ReturnType;
      unsetVariableMark: () => ReturnType;
    };
  }
}

export const VariableMark = Mark.create<VariableMarkOptions>({
  name: 'variableMark',

  addOptions() {
    return {
      HTMLAttributes: {},
      onVariableClick: undefined,
    };
  },

  addAttributes() {
    return {
      key: {
        default: null,
        parseHTML: element => element.getAttribute('data-variable-key'),
        renderHTML: attributes => {
          if (!attributes.key) {
            return {};
          }
          return {
            'data-variable-key': attributes.key,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-variable-key]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'variable-mark bg-blue-100 border border-blue-300 rounded px-2 py-1 cursor-pointer hover:bg-blue-200 transition-colors mx-1 my-0.5 inline-block align-middle whitespace-nowrap',
        'data-variable': 'true',
        'data-variable-key': HTMLAttributes['data-variable-key'],
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setVariableMark:
        (key: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { key });
        },
      toggleVariableMark:
        (key: string) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, { key });
        },
      unsetVariableMark:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('variableNavigation'),
        props: {
          handleClick: (view, pos, event) => {
            const target = event.target as HTMLElement;
            if (target.hasAttribute('data-variable-key')) {
              const key = target.getAttribute('data-variable-key');
              if (key && this.options.onVariableClick) {
                this.options.onVariableClick(key);
                return true;
              }
            }
            return false;
          },
          handleKeyDown: (view, event) => {
            const { state, dispatch } = view;
            const { selection } = state;
            
            // Améliorer la navigation avec les flèches
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              const { $from } = selection;
              const node = $from.parent;
              const pos = $from.pos;
              
              // Vérifier si on est près d'une variable
              const marks = $from.marks();
              const hasVariableMark = marks.some(mark => mark.type.name === 'variableMark');
              
              if (hasVariableMark) {
                // Si on est dans une variable, sauter à la fin/début selon la direction
                const direction = event.key === 'ArrowRight' ? 1 : -1;
                let newPos = pos;
                
                // Trouver la fin de la variable
                while (newPos >= 0 && newPos <= state.doc.content.size) {
                  const resolvedPos = state.doc.resolve(newPos);
                  const currentMarks = resolvedPos.marks();
                  const stillInVariable = currentMarks.some(mark => 
                    mark.type.name === 'variableMark' && 
                    marks.some(originalMark => 
                      originalMark.type.name === 'variableMark' && 
                      originalMark.attrs.key === mark.attrs.key
                    )
                  );
                  
                  if (!stillInVariable) {
                    break;
                  }
                  newPos += direction;
                }
                
                // Créer une nouvelle sélection
                const newSelection = TextSelection.near(
                  state.doc.resolve(Math.max(0, Math.min(newPos, state.doc.content.size)))
                );
                
                if (newSelection && !newSelection.eq(selection)) {
                  dispatch(state.tr.setSelection(newSelection));
                  return true;
                }
              }
            }
            
            return false;
          },
        },
      }),
    ];
  },
});

// Helper function to replace variables in text
export const replaceVariablesInText = (text: string, variables: Record<string, any>): string => {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
};

// Helper function to find all variables in text
export const extractVariablesFromText = (text: string): string[] => {
  const matches = text.match(/\{\{(\w+)\}\}/g) || [];
  return matches.map(match => match.slice(2, -2));
};

// Helper function to convert text with variables to TipTap JSON
export const textWithVariablesToTipTapJSON = (
  text: string,
  variables: Record<string, any>
): any => {
  const parts = text.split(/(\{\{[^}]+\}\})/);
  const content: any[] = [];

  parts.forEach(part => {
    if (part.match(/^\{\{[^}]+\}\}$/)) {
      // This is a variable
      const key = part.slice(2, -2);
      const value = variables[key] || `[${key}]`;
      content.push({
        type: 'text',
        text: value,
        marks: [{ type: 'variableMark', attrs: { key } }]
      });
    } else if (part) {
      // This is regular text
      content.push({
        type: 'text',
        text: part
      });
    }
  });

  return {
    type: 'doc',
    content: [{
      type: 'paragraph',
      content
    }]
  };
}; 