import React from 'react'

interface NotificationCardProps {
  title: string
  content: string
  date: string
}

const NotificationCard: React.FC<NotificationCardProps> = ({ title, content, date }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{content}</p>
      <span className="text-xs text-gray-400">{date}</span>
    </div>
  )
}

export default NotificationCard
