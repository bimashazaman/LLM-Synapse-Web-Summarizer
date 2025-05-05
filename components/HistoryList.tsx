'use client'

import React from 'react'
import { Summary } from '../types'
import { FiClock } from 'react-icons/fi'

interface HistoryListProps {
  summaries: Summary[]
  onSelect: (summary: Summary) => void
}

const HistoryList: React.FC<HistoryListProps> = ({ summaries, onSelect }) => {
  // No history to display
  if (summaries.length === 0) {
    return (
      <div className='text-center p-6 bg-gray-50 rounded-lg border border-gray-200'>
        <p className='text-gray-500'>No summary history yet</p>
        <p className='text-sm text-gray-400 mt-2'>
          Enter a URL above to get started
        </p>
      </div>
    )
  }

  // Format relative time
  const getRelativeTime = (dateString: string) => {
    const now = new Date()
    const past = new Date(dateString)
    const diffMs = now.getTime() - past.getTime()
    const diffSecs = Math.round(diffMs / 1000)
    const diffMins = Math.round(diffSecs / 60)
    const diffHours = Math.round(diffMins / 60)
    const diffDays = Math.round(diffHours / 24)

    if (diffSecs < 60) {
      return `${diffSecs} second${diffSecs !== 1 ? 's' : ''} ago`
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    }
  }

  return (
    <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
      <h3 className='text-lg font-medium p-4 border-b border-gray-200 bg-gray-50'>
        History
      </h3>
      <ul className='divide-y divide-gray-200'>
        {summaries.map((summary, index) => (
          <li key={summary.id || index} className='hover:bg-gray-50'>
            <button
              onClick={() => onSelect(summary)}
              className='w-full text-left p-4 flex flex-col'
            >
              <div className='font-medium text-gray-900 truncate'>
                {summary.title}
              </div>
              <div className='text-sm text-gray-500 mt-1 truncate'>
                {summary.url}
              </div>
              <div className='flex items-center text-xs text-gray-400 mt-2'>
                <FiClock className='mr-1' />
                <span>{getRelativeTime(summary.timestamp)}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HistoryList
