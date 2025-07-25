'use client';
import { useState, useRef, useEffect } from 'react';
import SMPNotification from '../notification';
import { Button } from "@/src/components/landing-page/Button";


function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// Définition des interfaces
interface Person {
  name: string;
  imageUrl?: string;
}

interface Activity {
  id: number;
  type: 'opened' | 'proposed' | 'edited' | 'commented' | 'finalized';
  person: Person;
  date: string;
  dateTime: string;
  comment?: string;
  price?: string; // Prix formaté comme "100$"
}

const activityData: Activity[] = [
  { id: 1, type: 'opened', person: { name: 'Chelsea Hagon' }, date: '7d ago', dateTime: '2023-01-23T10:32' },
  { id: 2, type: 'edited', person: { name: 'Chelsea Hagon' }, date: '6d ago', dateTime: '2023-01-23T11:03' },
  { id: 3, type: 'proposed', person: { name: 'Chelsea Hagon' }, price: '200$', date: '6d ago', dateTime: '2023-01-23T11:24' },
  { id: 4, type: 'proposed', person: { name: 'Alex Curren' }, price: '300$', date: '5d ago', dateTime: '2023-01-22T09:24' },
  { id: 5, type: 'commented', person: { name: 'Chelsea Hagon' }, comment: 'Let’s negotiate further.', date: '3d ago', dateTime: '2023-01-20T15:56' },
  { id: 6, type: 'proposed', person: { name: 'Alex Curren' }, price: '250$', date: '2d ago', dateTime: '2023-01-19T10:45' },
  { id: 7, type: 'commented', person: { name: 'Chelsea Hagon' }, comment: 'This seems reasonable.', date: '1d ago', dateTime: '2023-01-18T12:30' },
  { id: 8, type: 'finalized', person: { name: 'Alex Curren' }, price: '275$', date: 'now', dateTime: '2023-01-17T14:45' },
];

export default function NegotiationFeed() {
  const [comment, setComment] = useState('');
  const [price, setPrice] = useState('');
  const [activities, setActivities] = useState(activityData);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const feedRef = useRef<HTMLDivElement>(null);

  // Scroller automatiquement tout en bas quand une nouvelle activité arrive
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [activities]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Limite de propositions
    const proposalCount = activities.filter((a) => a.type === 'proposed').length;
    if (proposalCount >= 5) {
      setNotification({
        show: true,
        message: 'Maximum of 5 proposals reached.',
        type: 'error',
      });
      return;
    }

    // Conversion explicite de price en nombre
    const numericPrice = Number(price);

    // Validation du prix
    if (price && isNaN(numericPrice)) {
      setNotification({
        show: true,
        message: 'Price must be a valid number.',
        type: 'error',
      });
      return;
    }

    // Ajouter une nouvelle activité si un prix ou un commentaire est fourni
    if (numericPrice > 0 || comment) {
      const newActivity: Activity = {
        id: activities.length + 1,
        type: numericPrice > 0 ? 'proposed' : 'commented',
        person: { name: 'You' },
        date: 'now',
        dateTime: new Date().toISOString(),
        comment: comment || undefined,
        price: numericPrice > 0 ? `${numericPrice}$` : undefined,
      };
      setActivities([...activities, newActivity]);
      setPrice('');
      setComment('');

      if (proposalCount === 4) {
        setNotification({
          show: true,
          message: 'This is your last proposal opportunity.',
          type: 'info',
        });
      }
    }
  };

  const handlePayment = () => {
    // Logique de paiement à implémenter ici
    console.log('Payment initiated with price:', price);
  };

  return (
    <div className="w-full max-w-2xl h-[600px] flex flex-col rounded-md shadow-sm bg-white">
      {/* Notification */}
      <SMPNotification
        type={notification.type as 'success' | 'error' | 'info'}
        message={notification.message}
        show={notification.show}
        onClose={() => setNotification({ show: false, message: '', type: 'info' })}
      />
      {/* Header */}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900">Negotiation Activity</h2>
        <p className="text-sm text-gray-600">Track the progress of the negotiation step by step.</p>
      </div>
      {/* Liste des activités (zone scrollable) */}
      <div ref={feedRef} className="flex-1 overflow-y-auto px-4 py-2">
        <ul role="list" className="space-y-6">
          {activities.map((item, idx) => (
            <li key={item.id} className="relative flex gap-x-4">
              <div
                className={classNames(
                  idx === activities.length - 1 ? 'h-6' : '-bottom-6',
                  'absolute left-0 top-0 flex w-6 justify-center'
                )}
              >
                <div
                  className={classNames(
                    'w-px',
                    item.type === 'proposed' ? 'bg-green-300' : 'bg-gray-200'
                  )}
                />
              </div>
              {/* Activité (texte et icône) */}
              {item.type === 'commented' ? (
                <>
                  <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-gray-100 rounded-full">
                    <div className="h-1.5 w-1.5 bg-gray-400 rounded-full" />
                  </div>
                  <p className="flex-auto text-sm text-gray-500">
                    <span className="font-medium text-gray-900">{item.person.name}</span> commented:
                    <span className="ml-2 text-gray-700">{item.comment}</span>
                  </p>
                  <time dateTime={item.dateTime} className="flex-none text-xs text-gray-500">
                    {item.date}
                  </time>
                </>
              ) : item.type === 'proposed' ? (
                <>
                  <div
                    className={classNames(
                      'relative flex h-6 w-6 flex-none items-center justify-center border-2 border-green-500 rounded-full',
                      idx === activities.length - 1 ? 'bg-green-500' : 'bg-green-300'
                    )}
                  >
                    <div className="h-1.5 w-1.5 bg-white rounded-full" />
                  </div>
                  <p className="flex-auto text-sm text-gray-500">
                    <span className="font-medium text-gray-900">{item.person.name}</span> proposed
                    <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full bg-black text-white text-xs font-medium">
                      {item.price}
                    </span>
                  </p>
                  <time dateTime={item.dateTime} className="flex-none text-xs text-gray-500">
                    {item.date}
                  </time>
                </>
              ) : (
                <>
                  <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-gray-100 rounded-full">
                    <div className="h-1.5 w-1.5 bg-gray-400 rounded-full" />
                  </div>
                  <p className="flex-auto text-sm text-gray-500">
                    <span className="font-medium text-gray-900">{item.person.name}</span> {item.type} the negotiation.
                  </p>
                  <time dateTime={item.dateTime} className="flex-none text-xs text-gray-500">
                    {item.date}
                  </time>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* Footer (inputs fixes + bouton payer) */}
      <div className="sticky bottom-0 bg-white px-4 py-4 flex flex-col gap-2">
        {/* Formulaire pour le prix/commentaire */}
        <form onSubmit={handleSubmit} className="flex gap-x-2">
          <div className="flex-1">
            <label htmlFor="price" className="sr-only">
              Propose a price
            </label>
            <input
              type="text"
              id="price"
              name="price"
              placeholder="Propose a price..."
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="block w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="comment" className="sr-only">
              Add a comment
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={1}
              placeholder="Add a comment (optional)..."
              className="block w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Submit
          </Button>
        </form>
        {/* Bouton Payer */}
        <Button
          onClick={handlePayment}
          className="w-full mt-2 bg-black text-white py-2 px-4 rounded-md text-sm font-semibold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
        >
          Pay {price ? `${price}$` : ''}
        </Button>
      </div>
    </div>
  );
}