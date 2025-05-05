import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'

// Define the return type for scrapeWebsite
interface WebsiteData {
  title: string
  text: string
  success: boolean
  proxied?: boolean
  error?: string
  limited?: boolean
}

// Add a proxy handler for sites that block direct scraping
async function proxyFetch(url: string) {
  // Try multiple proxy services in case one fails
  const proxyServices = [
    // AllOrigins proxy
    async () => {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
        url
      )}`
      const response = await axios.get(proxyUrl, { timeout: 20000 })
      return response.data
    },
    // Cors Anywhere proxy (if you have your own instance or a public one)
    async () => {
      const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`
      const response = await axios.get(proxyUrl, {
        timeout: 20000,
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      })
      return response.data
    },
    // Try accessing with different headers
    async () => {
      const response = await axios.get(url, {
        timeout: 20000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          Referer: 'https://www.google.com/',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      })
      return response.data
    },
  ]

  // Try each proxy service until one works
  for (const proxyMethod of proxyServices) {
    try {
      const data = await proxyMethod()
      if (data) {
        return {
          data,
          success: true,
        }
      }
    } catch (error) {
      console.error(`Proxy method failed:`, error)
      // Continue to the next proxy method
    }
  }

  // All methods failed
  return {
    data: null,
    success: false,
    error: 'All proxy methods failed to retrieve content',
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { url } = (await request.json()) as { url: string }

    // Validate URL
    if (!url || !(url.startsWith('http://') || url.startsWith('https://'))) {
      return NextResponse.json(
        {
          error:
            'Invalid URL. Please provide a URL starting with http:// or https://',
        },
        { status: 400 }
      )
    }

    // Try regular scraping first
    let websiteData = await scrapeWebsite(url)

    // If direct scraping fails due to common blocking issues, try using a proxy
    if (
      !websiteData.success &&
      (websiteData.error?.includes('blocks web scraping') ||
        websiteData.error?.includes('401') ||
        websiteData.error?.includes('403'))
    ) {
      console.log(
        `Direct scraping failed for ${url}, attempting proxy method...`
      )

      // Try the proxy method
      const proxyResult = await proxyFetch(url)

      if (proxyResult.success && proxyResult.data) {
        // Process the proxy result
        const $ = cheerio.load(proxyResult.data)

        // Get the page title
        const title = $('title').text().trim() || 'No title found'

        // Same content extraction logic as in scrapeWebsite
        $(
          'script, style, noscript, iframe, nav, footer, header, aside, [role="navigation"], [role="banner"], [role="complementary"], .nav, .navbar, .menu, .footer, .header, .sidebar, #nav, #menu, #footer, #header, #sidebar'
        ).remove()

        // Try to extract main content using the same selectors
        let mainContent = ''
        let foundContent = false

        // First, try to get all paragraph text
        const paragraphText = $('p')
          .map((i, el) => $(el).text().trim())
          .get()
          .join(' ')
        if (paragraphText.length > 100) {
          mainContent = paragraphText
          foundContent = true
        } else {
          // If not enough paragraph content, try content selectors
          const contentSelectors = [
            'main',
            'article',
            '[role="main"]',
            '.main-content',
            '.content',
            '#content',
            '#main',
            '.post',
            '.entry',
            '.article',
            '[class*="content"]',
            '[class*="article"]',
            '[class*="post"]',
            'div > div > div', // Sometimes content is nested in divs
          ]

          for (const selector of contentSelectors) {
            const elements = $(selector)
            if (elements.length > 0) {
              const text = elements.first().text().trim()
              if (text.length > 100) {
                mainContent = text
                foundContent = true
                break
              }
            }
          }

          if (!foundContent) {
            // Try the <p> tags in the body
            const paragraphs = $('body p')
            if (paragraphs.length > 0) {
              mainContent = paragraphs
                .map((i, el) => $(el).text().trim())
                .get()
                .join(' ')
            } else {
              // Last resort: just use the body text
              mainContent = $('body').text()
            }
          }
        }

        // Clean up the text
        const text = mainContent
          .replace(/\s+/g, ' ')
          .replace(/\n+/g, ' ')
          .trim()

        // Failsafe for empty content
        if (!text || text.length < 50) {
          // Try to get any visible text
          const bodyText = $('body')
            .text()
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, ' ')
            .trim()

          // If we have a substantial body text, use it
          if (bodyText.length > 100) {
            websiteData = {
              title,
              text: bodyText.substring(0, 2000), // Limit to 2000 chars to avoid too much noise
              success: true,
              proxied: true,
              limited: true,
            }
          } else {
            // Still no good content, provide a helpful error
            websiteData = {
              title,
              text: `Unable to extract meaningful content from ${url}. The website may use JavaScript to load content or have unusual HTML structure.`,
              success: true, // Mark as success but indicate the issue in the content
              proxied: true,
              limited: true,
            }
          }
        } else {
          // We have good content, use it
          websiteData = {
            title,
            text,
            success: true,
            proxied: true,
          }
        }
      }
    }

    if (!websiteData.success) {
      return NextResponse.json(
        { error: websiteData.error || 'Failed to scrape website' },
        { status: 500 }
      )
    }

    // Summarize content using a simple algorithm
    // In a real app, this would use OpenAI or another AI service
    const summary = await generateSimpleSummary(
      websiteData.text,
      websiteData.title,
      websiteData.proxied, // Pass the proxy flag to modify the summary note
      websiteData.limited // Pass the limited flag to modify the summary display
    )

    // Return the summary
    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error in summarize API:', error)
    return NextResponse.json(
      { error: 'Failed to summarize website' },
      { status: 500 }
    )
  }
}

// Simple web scraper
async function scrapeWebsite(url: string): Promise<WebsiteData> {
  try {
    // Add a more comprehensive user agent and referrer to mimic a real browser
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        Referer: 'https://www.google.com/',
        'sec-ch-ua': '"Google Chrome";v="123", "Not:A-Brand";v="8"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
      },
      timeout: 15000,
      maxRedirects: 5,
    })

    const $ = cheerio.load(response.data)

    // Get the page title
    const title = $('title').text().trim() || 'No title found'

    // Remove elements that usually don't contain main content
    $(
      'script, style, noscript, iframe, nav, footer, header, aside, [role="navigation"], [role="banner"], [role="complementary"], .nav, .navbar, .menu, .footer, .header, .sidebar, #nav, #menu, #footer, #header, #sidebar'
    ).remove()

    // Try to find main content containers
    let mainContent = ''

    // Look for common content containers
    const contentSelectors = [
      'main',
      'article',
      '[role="main"]',
      '.main-content',
      '.content',
      '#content',
      '#main',
      '.post',
      '.entry',
      '.article',
      '[class*="content"]',
      '[class*="article"]',
      '[class*="post"]',
    ]

    // Try each content selector
    let foundContent = false
    for (const selector of contentSelectors) {
      const elements = $(selector)
      if (elements.length > 0) {
        // Get text from the first substantial content container found
        const text = elements.first().text().trim()
        if (text.length > 200) {
          // Only use if it has substantial content
          mainContent = text
          foundContent = true
          break
        }
      }
    }

    // If no main content containers found, fallback to body content
    if (!foundContent) {
      // Try the <p> tags in the body
      const paragraphs = $('body p')
      if (paragraphs.length > 0) {
        mainContent = paragraphs
          .map((i, el) => $(el).text().trim())
          .get()
          .join(' ')
      } else {
        // Last resort: just use the body text
        mainContent = $('body').text()
      }
    }

    // Clean up the text
    const text = mainContent.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim()

    return {
      title,
      text,
      success: true,
    }
  } catch (error) {
    console.error(`Error scraping ${url}:`, error)

    // Provide more specific error messages for common issues
    let errorMessage = 'Unknown error occurred'

    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const status = error.response.status

        if (status === 401 || status === 403) {
          errorMessage = `This website (${url}) blocks web scraping or requires authentication. Try a different website.`
        } else if (status === 404) {
          errorMessage = `Website not found (${url}). Please check the URL and try again.`
        } else if (status === 429) {
          errorMessage = `Too many requests to ${url}. Please try again later.`
        } else if (status >= 500) {
          errorMessage = `Server error on ${url}. The website might be experiencing issues.`
        } else {
          errorMessage = `Error accessing website: ${status} ${error.response.statusText}`
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = `No response from website. The site might be down or blocking requests.`
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = `Error preparing request: ${error.message}`
      }
    } else if (error instanceof Error) {
      errorMessage = error.message
    }

    return {
      title: 'Error',
      text: '',
      success: false,
      error: errorMessage,
    }
  }
}

// A simple summarization algorithm
// This is a placeholder for a more sophisticated AI-based approach
async function generateSimpleSummary(
  text: string,
  title: string,
  proxied = false,
  limited = false
): Promise<string> {
  // Check if this is limited content notification
  if (text.startsWith('Unable to extract meaningful content')) {
    return `
      <h2>${title || 'Website Summary'}</h2>
      <div class="error-message" style="padding: 1rem; border-radius: 0.5rem; background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); margin-bottom: 1rem;">
        <p>${text}</p>
        <p>Try a different website or check if the URL is correct.</p>
      </div>
      
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
        <h4 style="color: rgba(255,255,255,0.6); font-size: 0.9rem;">Note</h4>
        <p style="color: rgba(255,255,255,0.6); font-size: 0.8rem;">
          This website requires JavaScript or uses techniques that prevent automatic content extraction.
          ${
            proxied
              ? ' Multiple proxy services were attempted without success.'
              : ''
          }
        </p>
      </div>
    `
  }

  // Clean and prepare text
  const cleanText = text
    .replace(/\s+/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\t/g, ' ')
    .trim()

  // Extract the main content (first 2000 chars for better context)
  const contentSample = cleanText.slice(0, 2000)

  // Split into sentences and filter out menus, navigation, etc.
  const allSentences = contentSample
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15 && s.length < 200) // Avoid menu items and very long text
    .filter(
      (s) =>
        !s.includes('cookie') &&
        !s.includes('login') &&
        !s.includes('sign up') &&
        !s.includes('password')
    )
    .filter(
      (s) =>
        !s.toLowerCase().includes('navigation') &&
        !s.toLowerCase().includes('menu')
    )

  // Select a reasonable number of sentences for the summary
  const summaryLength = Math.min(5, allSentences.length)
  const selectedSentences = allSentences.slice(0, summaryLength)

  // Identify what type of content it appears to be
  let contentType = 'website'
  if (
    title.toLowerCase().includes('reddit') ||
    text.toLowerCase().includes('subreddit')
  ) {
    contentType = 'Reddit post'
  } else if (
    title.toLowerCase().includes('news') ||
    text.toLowerCase().includes('breaking')
  ) {
    contentType = 'news article'
  } else if (
    text.toLowerCase().includes('product') &&
    text.toLowerCase().includes('price')
  ) {
    contentType = 'product page'
  } else if (text.toLowerCase().includes('blog')) {
    contentType = 'blog post'
  }

  // Add a warning message for limited content
  const limitedContentWarning = limited
    ? `<div style="padding: 0.75rem; margin-bottom: 1rem; border-radius: 0.5rem; background-color: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.2);">
         <p style="margin: 0; color: rgb(161, 98, 7);">Note: Limited content was extracted from this website. The summary may be incomplete.</p>
       </div>`
    : ''

  // Create a properly formatted summary
  return `
    <h2>${title}</h2>
    ${limitedContentWarning}
    <p>${
      selectedSentences.length > 0
        ? selectedSentences.join('. ') + '.'
        : 'No meaningful content could be extracted from this webpage.'
    }</p>
    
    <h3>Website Type</h3>
    <p>This appears to be a ${contentType}.</p>
    
  `
}
