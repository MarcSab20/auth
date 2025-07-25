import React from 'react'
import NotificationCard from './notificationCard'

interface Notification {
  title: string
  content: string
  date: string
}

const notifications: Notification[] = [
  {
    title: 'Devis négocié',
    content: 'Un devis a été négocié avec succès. Consultez les détails.',
    date: 'Aujourd\'hui, 10:00',
  },
  {
    title: 'Facture disponible',
    content: 'Une nouvelle facture est maintenant disponible pour téléchargement.',
    date: 'Hier, 15:30',
  },
  {
    title: 'Nouvelle tâche assignée',
    content: 'Vous avez été assigné à une nouvelle tâche dans le projet.',
    date: 'Lundi, 09:45',
  },
]

const NotificationsList: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg " style={{ maxHeight: 'auto', overflowY: 'auto' }}>
      {notifications.map((notification, index) => (
        <NotificationCard
          key={index}
          title={notification.title}
          content={notification.content}
          date={notification.date}
        />
      ))}
    </div>
  )
}

export default NotificationsList
