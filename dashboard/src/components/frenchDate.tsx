// components/formatDate.tsx
interface FrenchDateProps {
    date: string | Date | undefined | null;
  }
  
  export function FrenchDate({ date }: FrenchDateProps) {
    if (!date) return null; // Gère les cas undefined/null
    
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return null; // Date invalide
  
    const formattedDate = parsedDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  
    return (
      <span>
        {formattedDate.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')}
      </span>
    );
  }