"use client";
import dynamic from "next/dynamic";
import { forwardRef, useState, useEffect } from "react";
import { type MDXEditorMethods, type MDXEditorProps } from "@mdxeditor/editor";

/**
 * Import dynamique de InitializedMDXEditor.
 * On désactive le SSR pour éviter les erreurs, car MDXEditor ne supporte pas le SSR.
 */
const Editor = dynamic(() => import("./initializedMDXEditor"), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-300 rounded-md p-4 h-64 flex items-center justify-center">
      <div className="text-gray-500">Chargement de l'éditeur...</div>
    </div>
  ),
});

/**
 * Composant exporté, prêt à l'emploi,
 * qui accepte un `ref` si vous souhaitez appeler des méthodes (getMarkdown, setMarkdown, etc.).
 */
export const ForwardRefEditor = forwardRef<MDXEditorMethods, MDXEditorProps>(
  (props, ref) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    // Attendre que le composant soit monté côté client avant de rendre l'éditeur
    if (!isMounted) {
      return (
        <div className="border border-gray-300 rounded-md p-4 h-64 flex items-center justify-center">
          <div className="text-gray-500">Initialisation...</div>
        </div>
      );
    }

    return <Editor {...props} editorRef={ref} />;
  }
);

// Pour éviter un warning avec React devtools
ForwardRefEditor.displayName = "ForwardRefEditor";
