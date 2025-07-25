"use client";
import type { ForwardedRef } from "react";
import {
  MDXEditor,
  type MDXEditorProps,
  type MDXEditorMethods,
  // Plugins de base
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  UndoRedo,
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
  DiffSourceToggleWrapper,
} from "@mdxeditor/editor";

/**
 * Ce composant encapsule MDXEditor et lui ajoute directement des plugins.
 * On n'exporte pas directement ce composant, mais on l'utilise dans un import dynamique
 * (pour désactiver le SSR).
 */
export default function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <MDXEditor
      {...props}
      ref={editorRef}
      plugins={[
        headingsPlugin({
          allowedHeadingLevels: [1, 2, 3, 4, 5, 6]
        }),
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
      contentEditableClassName="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none"
    />
  );
}
