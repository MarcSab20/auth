import React, { ReactNode } from 'react'

interface Stat {
  name: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
}

const stats: Stat[] = [
  { name: 'Revenue', value: '$405,091.00', change: '+4.75%', changeType: 'positive' },
  { name: 'Overdue invoices', value: '$12,787.00', change: '+54.02%', changeType: 'negative' },
  { name: 'Outstanding invoices', value: '$245,988.00', change: '-1.39%', changeType: 'positive' },
  { name: 'Expenses', value: '$30,156.00', change: '+10.18%', changeType: 'negative' },
]

interface BalanceProps {
  children?: ReactNode
}

const Balance: React.FC<BalanceProps> = ({ children }) => {
  return (
    <>
      {/* Affichage des statistiques de balance en haut */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="c-card shadow rounded-lg overflow-hidden">
            <div className="c-card__body p-6 bg-white">
              <div className="text-sm font-medium text-gray-500">{stat.name}</div>
              <div className="mt-2 flex items-baseline">
                <span
                  className={`text-xs font-medium ${
                    stat.changeType === 'negative' ? 'text-rose-600' : 'text-green-600'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Rendu du contenu enfant */}
      {children}
    </>
  )
}

export default Balance
