import React, { useState, useEffect, useRef } from "react";
import { 
  type MDXEditorMethods, 
  toolbarPlugin, 
  UndoRedo, 
  BoldItalicUnderlineToggles, 
  headingsPlugin, 
  listsPlugin, 
  quotePlugin, 
  thematicBreakPlugin, 
  markdownShortcutPlugin, 
  linkPlugin, 
  linkDialogPlugin, 
  imagePlugin, 
  tablePlugin, 
  codeBlockPlugin, 
  codeMirrorPlugin,
  diffSourcePlugin,
  BlockTypeSelect,
  ListsToggle,
  InsertTable,
  CodeToggle,
  DiffSourceToggleWrapper
} from "@mdxeditor/editor";
import { ForwardRefEditor } from "@/src/components/editor/forwardRefEditor"; 
import MarkdownRenderer from "@/src/components/markdownRenderer";
import "@mdxeditor/editor/style.css";

interface MarkdownMdxEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: string;
  placeholder?: string;
  className?: string;
}

const MarkdownMdxEditor: React.FC<MarkdownMdxEditorProps> = ({
  initialValue = "",
  onChange,
  readOnly = false,
  height = "20rem",
  placeholder = "Écrivez votre contenu MDX/Markdown ici...",
  className = "",
}) => {
  const [content, setContent] = useState(initialValue);
  const editorRef = useRef<MDXEditorMethods>(null);

  useEffect(() => {
    if (initialValue !== content) {
      setContent(initialValue);
      if (editorRef.current) {
        try {
          editorRef.current.setMarkdown(initialValue);
        } catch (error) {
          console.warn("Erreur lors de la mise à jour de l'éditeur:", error);
        }
      }
    }
  }, [initialValue, content]);

  const handleEditorChange = () => {
    if (editorRef.current) {
      const newValue = editorRef.current.getMarkdown();
      setContent(newValue);
      onChange?.(newValue);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border border-gray-300 rounded-md p-4" style={{ minHeight: height }}>
        <ForwardRefEditor
          ref={editorRef}
          markdown={content}
          onChange={handleEditorChange}
          readOnly={readOnly}
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            imagePlugin(),
            tablePlugin(),
            codeBlockPlugin(),
            codeMirrorPlugin(),
            diffSourcePlugin(),
            toolbarPlugin({
              toolbarContents: () => (
                <DiffSourceToggleWrapper>
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                  <BlockTypeSelect />
                  <ListsToggle />
                  <InsertTable />
                  <CodeToggle />
                </DiffSourceToggleWrapper>
              ),
            }),
          ]}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default MarkdownMdxEditor;
