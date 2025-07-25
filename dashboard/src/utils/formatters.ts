export function formatId(id: string, type: 'estimate' | 'order' | 'invoice'): string {
  const prefix = {
    estimate: 'qte-',
    order: 'ord-',
    invoice: 'inv-'
  }[type];

  return `${prefix}${id.substring(0, 8)}`;
}

export function getFullId(id: string, type: 'estimate' | 'order' | 'invoice'): string {
  const prefix = {
    estimate: 'qte-',
    order: 'ord-',
    invoice: 'inv-'
  }[type];

  return `${prefix}${id}`;
} 