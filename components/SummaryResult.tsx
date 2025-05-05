'use client'

import React from 'react'
import { Summary } from '../types'
import { FiExternalLink, FiClock } from 'react-icons/fi'

interface SummaryResultProps {
  summary: Summary
}

const SummaryResult: React.FC<SummaryResultProps> = ({ summary }) => {
  // Format the timestamp for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className='bg-white border border-gray-200 rounded-lg shadow-md p-6 mb-8'>
      <div className='flex justify-between items-start mb-4'>
        <h2 className='text-xl font-bold text-gray-800'>{summary.title}</h2>
        <a
          href={summary.url}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-600 hover:text-blue-800 flex items-center text-sm'
        >
          Visit Website <FiExternalLink className='ml-1' />
        </a>
      </div>

      <div className='text-gray-500 text-sm mb-4 flex items-center'>
        <FiClock className='mr-1' />
        <span>Summarized at {formatDate(summary.timestamp)}</span>
      </div>

      <div className='prose max-w-none'>
        <div
          dangerouslySetInnerHTML={{ __html: markdownToHtml(summary.summary) }}
        />
      </div>
    </div>
  )
}

// Simple markdown to HTML converter
// For a production app, use a proper markdown library like remark or marked
function markdownToHtml(markdown: string): string {
  return (
    markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Lists
      .replace(/^\s*- (.*$)/gim, '<ul><li>$1</li></ul>')
      .replace(/<\/ul>\s*<ul>/gim, '')
      // Line breaks
      .replace(/\n/gim, '<br>')
  )
}

export default SummaryResult
