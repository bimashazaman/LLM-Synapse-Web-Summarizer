'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { FiLink, FiSearch, FiCpu, FiZap, FiClipboard } from 'react-icons/fi'

// Brand logo SVG component
const BrandLogo = () => (
  <svg
    width='80'
    height='80'
    viewBox='0 0 80 80'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <circle cx='40' cy='40' r='30' fill='url(#paint0_linear)' />
    <path
      d='M25 32L40 24L55 32L55 48L40 56L25 48L25 32Z'
      stroke='white'
      strokeWidth='2'
    />
    <path d='M40 24V56' stroke='white' strokeWidth='2' />
    <path d='M25 32L55 48' stroke='white' strokeWidth='2' />
    <path d='M55 32L25 48' stroke='white' strokeWidth='2' />
    <defs>
      <linearGradient
        id='paint0_linear'
        x1='10'
        y1='10'
        x2='70'
        y2='70'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#7E22CE' />
        <stop offset='1' stopColor='#6366F1' />
      </linearGradient>
    </defs>
  </svg>
)

export default function Home() {
  const [url, setUrl] = useState('')
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url) {
      setError('Please enter a URL')
      return
    }

    let formattedUrl = url
    if (!(url.startsWith('http://') || url.startsWith('https://'))) {
      formattedUrl = 'https://' + url
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/summarize', { url: formattedUrl })
      setSummary(response.data.summary)
    } catch (err: unknown) {
      console.error('Error:', err)
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError('Failed to summarize website')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen'>
      {/* Decorative background elements */}
      <div className='fixed inset-0 -z-10 overflow-hidden'>
        <div className='absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(ellipse_at_center,_rgba(124,58,237,0.15)_0%,rgba(17,24,39,0)_70%)]'></div>
        <div className='absolute -top-40 -left-40 w-80 h-80 bg-purple-900 rounded-full filter blur-3xl opacity-10'></div>
        <div className='absolute top-2/3 -right-20 w-80 h-80 bg-indigo-700 rounded-full filter blur-3xl opacity-10'></div>
      </div>

      {/* Hero Section */}
      <header className='container'>
        <div className='text-center my-8 fade-in'>
          <div className='inline-flex justify-center items-center mb-6'>
            <BrandLogo />
          </div>
          <h1>Synapse</h1>
          <p className='text-center mb-8 max-w-2xl mx-auto'>
            Extract the essence of any website through our advanced AI-powered
            summarization engine. Save time. Gain insight. Stay informed.
          </p>

          {/* Feature badges */}
          <div className='flex flex-wrap justify-center gap-3 my-10'>
            <div className='badge badge-primary'>
              <FiZap className='mr-2' />
              <span>Instant Summaries</span>
            </div>
            <div className='badge badge-secondary'>
              <FiCpu className='mr-2' />
              <span>AI Technology</span>
            </div>
            <div className='badge badge-accent'>
              <FiClipboard className='mr-2' />
              <span>Any Content</span>
            </div>
          </div>
        </div>
      </header>

      <main className='container'>
        {/* Input Card */}
        <div className='card glass fade-in' style={{ animationDelay: '0.2s' }}>
          <form onSubmit={handleSubmit} className='relative z-10'>
            <div className='flex flex-col space-y-4'>
              <label className='font-medium text-lg mb-2'>
                Enter website URL to summarize
              </label>
              <div className='relative'>
                <div className='absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400'>
                  <FiLink size={20} />
                </div>
                <input
                  type='text'
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder='Enter website URL (e.g., bbc.com)'
                  className='pl-12'
                  disabled={isLoading}
                />
              </div>
              <button type='submit' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className='loading-spinner'></span>
                    <span>Processing Website...</span>
                  </>
                ) : (
                  <>
                    <FiSearch className='mr-2' size={18} />
                    <span>Generate Summary</span>
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className='mt-6 p-4 bg-red-900/20 border border-red-800/30 rounded-lg text-red-300'>
                <p className='flex items-start'>
                  <svg
                    className='w-5 h-5 mr-2 flex-shrink-0 mt-0.5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                    ></path>
                  </svg>
                  <span>{error}</span>
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Results Section */}
        {summary && (
          <div className='card fade-in' style={{ animationDelay: '0.3s' }}>
            <div
              className='summary-content'
              dangerouslySetInnerHTML={{ __html: summary }}
            />
          </div>
        )}

        {/* Empty State */}
        {!summary && !isLoading && (
          <div
            className='card fade-in text-center'
            style={{ animationDelay: '0.3s' }}
          >
            <div className='w-20 h-20 mx-auto mb-6 rounded-full bg-surface-light/20 flex items-center justify-center'>
              <FiSearch className='text-4xl text-gray-500' />
            </div>
            <h3>Ready to Analyze</h3>
            <p>
              Enter a URL above and click &quot;Generate Summary&quot; to
              extract the key information
            </p>
          </div>
        )}

        {/* How it works section */}
        <div className='my-12 fade-in' style={{ animationDelay: '0.4s' }}>
          <h2 className='text-center mb-8'>How It Works</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='card p-6 text-center'>
              <div className='w-12 h-12 rounded-full bg-purple-800/30 flex items-center justify-center mx-auto mb-4'>
                <FiLink size={20} className='text-purple-400' />
              </div>
              <h3 className='text-xl mb-2'>1. Enter URL</h3>
              <p className='text-sm'>
                Paste any website URL you want to summarize
              </p>
            </div>
            <div className='card p-6 text-center'>
              <div className='w-12 h-12 rounded-full bg-emerald-800/30 flex items-center justify-center mx-auto mb-4'>
                <FiCpu size={20} className='text-emerald-400' />
              </div>
              <h3 className='text-xl mb-2'>2. AI Processing</h3>
              <p className='text-sm'>
                Our advanced AI analyzes and extracts key information
              </p>
            </div>
            <div className='card p-6 text-center'>
              <div className='w-12 h-12 rounded-full bg-amber-800/30 flex items-center justify-center mx-auto mb-4'>
                <FiClipboard size={20} className='text-amber-400' />
              </div>
              <h3 className='text-xl mb-2'>3. Get Summary</h3>
              <p className='text-sm'>
                Receive a concise, well-structured summary in seconds
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='py-10 border-t border-gray-800'>
        <div className='container'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <div className='flex items-center mb-6 md:mb-0'>
              <BrandLogo />
              <div className='ml-3'>
                <div className='text-xl font-bold'>Synapse</div>
                <div className='text-sm text-gray-400'>
                  AI-Powered Web Summarizer
                </div>
              </div>
            </div>
            <div className='text-sm text-gray-400'>
              &copy; {new Date().getFullYear()} Synapse AI Technologies. All
              rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
