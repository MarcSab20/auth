import React from 'react'
import NotificationsList from './notificationList'

const Notifications: React.FC = () => {
  return (
    <div className="bg-white " style={{ height: 'auto' }}>
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      <div className="mt-4">
        <NotificationsList />
      </div>
    </div>
  )
}

export default Notifications
