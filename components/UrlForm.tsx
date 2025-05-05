'use client'

import React, { useState } from 'react'
import { FiLink, FiSearch } from 'react-icons/fi'

interface UrlFormProps {
  onSubmit: (url: string) => void
  isLoading: boolean
}

const UrlForm: React.FC<UrlFormProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic URL validation
    if (!url) {
      setError('Please enter a URL')
      return
    }

    if (!(url.startsWith('http://') || url.startsWith('https://'))) {
      setError('Please enter a valid URL starting with http:// or https://')
      return
    }

    setError('')
    onSubmit(url)
  }

  return (
    <div className='w-full max-w-3xl mx-auto mb-8'>
      <form onSubmit={handleSubmit} className='w-full'>
        <div className='flex flex-col sm:flex-row gap-2 w-full'>
          <div className='relative flex-grow'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400'>
              <FiLink />
            </div>
            <input
              type='text'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder='Enter website URL (e.g., https://example.com)'
              className={`block w-full p-4 pl-10 text-sm text-gray-900 border ${
                error ? 'border-red-500' : 'border-gray-300'
              } rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500`}
              disabled={isLoading}
            />
          </div>
          <button
            type='submit'
            className='text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-6 py-4 flex items-center justify-center disabled:bg-blue-400 disabled:cursor-not-allowed'
            disabled={isLoading}
          >
            {isLoading ? (
              <div className='flex items-center'>
                <div className='animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full'></div>
                <span>Summarizing...</span>
              </div>
            ) : (
              <div className='flex items-center'>
                <FiSearch className='mr-2' />
                <span>Summarize</span>
              </div>
            )}
          </button>
        </div>
        {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
      </form>
    </div>
  )
}

export default UrlForm
