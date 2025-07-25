import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { Button } from '@/src/components/landing-page/Button'

interface CommentOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  style?: any;
}

interface Comment {
  id: number;
  author: string;
  time: string;
  content: string;
  avatarUrl: string;
}

const mockComments: Comment[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  author: `User ${i + 1}`,
  time: `${i + 1}:00 PM`,
  content: `Ceci est un commentaire d'exemple pour l'utilisateur ${i + 1}.`,
  avatarUrl: "https://images.unsplash.com/photo-1604426633861-11b2faead63c?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80"
}));

const CommentOverlay: React.FC<CommentOverlayProps> = ({ isOpen, onClose }) => {
  const [visibleComments, setVisibleComments] = useState(10); // Affiche 10 commentaires au début

  const loadMoreComments = () => {
    setVisibleComments((prev) => Math.min(prev + 10, mockComments.length));
  };

  if (!isOpen) return null;

  return (
    <motion.div
      id="comment-overlay"
      className="absolute inset-0 bg-white z-50 p-4 overflow-auto" // Overlay couvrant l'ensemble
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Bouton de fermeture */}
      <motion.div
        className="absolute top-4 right-4 cursor-pointer text-gray-500"
        whileHover={{ rotate: 90 }}
        onClick={onClose}
      >
        <IoMdClose size={24} />
      </motion.div>

      {/* Titre principal des commentaires */}
      <div className="mt-8 text-center">
        <h2 className="text-3xl font-bold">Commentaires</h2>
        <p className="text-gray-500">Retrouvez les avis de nos utilisateurs</p>
      </div>

      {/* Liste des commentaires */}
      <div className="mt-8 space-y-6">
        {mockComments.slice(0, visibleComments).map((comment) => (
          <div key={comment.id} className="flex">
            <div className="flex-shrink-0 mr-3">
              <img
                className="mt-2 rounded-full w-8 h-8 sm:w-10 sm:h-10"
                src={comment.avatarUrl}
                alt={`${comment.author} avatar`}
              />
            </div>
            <div className="flex-1 border rounded-lg px-4 py-2 sm:px-6 sm:py-4 leading-relaxed">
              <strong>{comment.author}</strong>{" "}
              <span className="text-xs text-gray-400">{comment.time}</span>
              <p className="text-sm">{comment.content}</p>
              <div className="mt-4 flex items-center">
                <div className="text-sm text-gray-500 font-semibold">
                  {Math.floor(Math.random() * 5) + 1} Replies
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bouton "Afficher plus" pour charger davantage de commentaires */}
      {visibleComments < mockComments.length && (
        <div className="mt-8 text-center">
          <Button
            onClick={loadMoreComments}
          >
            Afficher plus
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default CommentOverlay;
