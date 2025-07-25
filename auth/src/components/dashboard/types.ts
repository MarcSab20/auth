export interface DropdownChild {
    name: string;
    href: string;
    icon?: React.ElementType; // Rendre l'icône optionnelle
    children?: DropdownChild[]; // Sous-enfants (pour une gestion récursive)
  }
  
  export interface DropdownItem extends DropdownChild {
    icon: React.ElementType; // L'icône reste obligatoire au niveau supérieur
  }
  