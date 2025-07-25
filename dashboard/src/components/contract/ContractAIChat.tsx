"use client";

import React, { useState, useRef, useEffect } from "react";
import { PaperAirplaneIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { useContractStore } from '@/src/store/contractStore';

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestion?: {
    type: "section_content" | "section_title" | "add_section";
    pageId: string;
    sectionId: string;
    content?: string;
    title?: string;
  };
}

export function ContractAIChat() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Accès au contrat courant via le store Zustand
  const {
    docTree,
    variables,
    contractId,
    title,
    updateSection,
    addSection,
    activeSectionId,
  } = useContractStore();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const applySuggestion = (suggestion: Message["suggestion"]) => {
    if (!suggestion) return;
    if (suggestion.type === "section_content" && suggestion.content && suggestion.sectionId) {
      updateSection(suggestion.sectionId, { content: suggestion.content });
    } else if (suggestion.type === "section_title" && suggestion.title && suggestion.sectionId) {
      updateSection(suggestion.sectionId, { title: suggestion.title });
    } else if (suggestion.type === "add_section" && suggestion.title && suggestion.content) {
      // Ajoute une nouvelle section à la racine ou à la section active
      addSection(activeSectionId ?? undefined, 1);
      // Optionnel: tu pourrais ensuite mettre à jour la nouvelle section avec le contenu IA
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Préparer l'historique de la conversation pour l'API
      const conversationHistory = messages.map(({ role, content }) => ({
        role,
        content,
      }));

      const response = await fetch("/api/ai/contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contract: {
            title: title,
            sections: docTree,
            variables: variables,
            contractId: contractId
          },
          prompt: message,
          conversationHistory,
          activeSection: activeSectionId,
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de la génération");
      const data = await response.json();

      let suggestion: Message["suggestion"] | undefined;

      // Tenter de détecter une suggestion de modification
      if (data.suggestion) {
        suggestion = data.suggestion;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        suggestion,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Si l'IA a fait une suggestion et qu'elle contient des modifications
      if (suggestion) {
        const confirmMessage = window.confirm(
          "L'IA suggère des modifications. Voulez-vous les appliquer ?"
        );
        if (confirmMessage) {
          applySuggestion(suggestion);
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setMessage("");
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors"
      >
        <ChatBubbleLeftIcon className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-lg p-4">
      <div className="flex flex-col h-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Services Contractor - AI</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-black text-white ml-12"
                  : "bg-gray-100 text-gray-900 mr-12"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              {msg.suggestion && (
                <button
                  onClick={() => applySuggestion(msg.suggestion)}
                  className="mt-2 text-xs underline hover:no-underline"
                >
                  Appliquer la suggestion
                </button>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Posez une question sur le contrat..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
} 