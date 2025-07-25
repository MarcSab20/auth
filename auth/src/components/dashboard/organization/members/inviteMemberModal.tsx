'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/src/components/landing-page/Button';
import { Heading, Subheading } from '@/src/components/catalyst/components/heading';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationID: string;
  className?: string;
  onSend?: (data: { 
    email: string; 
    message: string;
    firstName?: string;
    lastName?: string;
  }) => void;
  existingEmails: string[]; // Liste des emails déjà présents dans l'organisation
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  organizationID,
  className,
  onSend,
  existingEmails = [],
}) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isInvitationSent, setIsInvitationSent] = useState(false);
  const [emailError, setEmailError] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction de validation de l'email avec normalisation
  const validateEmail = (value: string): string => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value)) {
      return "Format d'email invalide.";
    }
    const normalizedEmail = value.trim().toLowerCase();
    const normalizedExisting = existingEmails.map(email => email.trim().toLowerCase());
    if (normalizedExisting.includes(normalizedEmail)) {
      return "Une invitation est déjà en cours ou un membre possède déjà cet email.";
    }
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    const errorMsg = validateEmail(value);
    setEmailError(errorMsg);
  };

  // Réinitialise les états lors de la fermeture
  const handleClose = () => {
    setIsInvitationSent(false);
    setEmail('');
    setMessage('');
    setEmailError('');
    setFirstName('');
    setLastName('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errorMsg = validateEmail(email);
    if (errorMsg) {
      setEmailError(errorMsg);
      return;
    }

    try {
      const response = await fetch(`/api/organization/${organizationID}/members/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, message, firstName, lastName }),
      });

      if (response.ok) {
        setIsInvitationSent(true);
        onSend && onSend({ email, message, firstName, lastName });
      } else {
        const data = await response.json();
        console.error("Échec de l'envoi de l'invitation:", data.error);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'invitation:", error);
    }
  };

  // Ferme la modal si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Gestion auto-close si la souris quitte la modal
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      handleClose();
    }, 1000);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  if (!isOpen) return null;

  // Le bouton ne sera cliquable que si l'email est non vide et sans erreur
  const isEmailValid = email.trim() !== '' && emailError === '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        ref={modalRef}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        className={`w-full max-w-md rounded-lg p-6 shadow-lg bg-white dark:bg-gray-800 ${className}`}
      >
        {isInvitationSent ? (
          <div className="text-center">
            <Heading>Invitation envoyée</Heading>
            <Subheading className="mt-2">
              L'invitation a bien été envoyée à {email}.
            </Subheading>
            <Button
              onClick={handleClose}
            >
              Fermer
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Heading>Inviter un membre</Heading>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Prénom
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nom
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-700"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email*
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={handleEmailChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-700"
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Message (optionnel)
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-700"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleClose}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={!isEmailValid}
                className={`px-2 py-2 rounded-lg shadow text-white text-lg transition duration-200 ${
                  isEmailValid ? 'bg-black hover:bg-gray-800' : 'bg-gray-500 cursor-not-allowed'
                }`}
              >
                Envoyer l'invitation
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InviteMemberModal;
