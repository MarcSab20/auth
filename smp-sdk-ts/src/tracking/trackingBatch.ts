
import { CapturedEvent } from "./types/SMPServicesEventType.js";

interface TrackingEvent {
  eventType: string;
  timestamp: number;
  details: any;
}

const eventQueue: TrackingEvent[] = [];

// Fonction pour ajouter un événement à la file d'attente
function trackEvent(eventType: string, details: any) {
  eventQueue.push({
    eventType,
    timestamp: Date.now(),
    details
  });
}

// Exemple d'événements capturés
trackEvent('click', { elementId: 'button1' });
trackEvent('page_view', { url: window.location.href });
trackEvent('purchase', { productId: '12345', price: 29.99 });

export function transmitEvent(event: CapturedEvent) {
  fetch('https://api.example.com/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  })
    .then(response => response.json())
    .then(data => console.log('Event successfully transmitted:', data))
    .catch(error => console.error('Error transmitting event:', error));
}

// Fonction pour envoyer les événements par lot
function sendEventsBatch() {
  if (eventQueue.length > 0) {
    const eventsToSend = [...eventQueue];
    eventQueue.length = 0; // Vider la file après copie

    fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventsToSend)
    })
      .then(response => {
        if (!response.ok) {
          // Remettre les événements en queue en cas d'échec
          eventQueue.push(...eventsToSend);
        }
      })
      .catch(() => {
        // En cas d'erreur réseau, remettre les événements dans la file
        eventQueue.push(...eventsToSend);
      });
  }
}

// Envoi des événements toutes les 10 minutes
setInterval(sendEventsBatch, 10 * 60 * 1000);

// Envoyer les événements avant de quitter la page
window.addEventListener('beforeunload', sendEventsBatch);
