import axios from 'axios'
import * as cheerio from 'cheerio'

export interface WebsiteData {
  url: string
  title: string
  text: string
  success: boolean
  error?: string
}

export async function scrapeWebsite(url: string): Promise<WebsiteData> {
  try {
    // User-Agent to mimic a browser
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    }

    // Fetch the website content
    const response = await axios.get(url, { headers, timeout: 10000 })

    // Load the HTML content into cheerio
    const $ = cheerio.load(response.data)

    // Get the page title
    const title = $('title').text() || 'No title found'

    // Remove unnecessary elements
    $('script, style, img, input, iframe, noscript').remove()

    // Extract the text content
    const text = $('body').text().replace(/\s+/g, ' ').trim()

    return {
      url,
      title,
      text,
      success: true,
    }
  } catch (error) {
    console.error(`Error scraping ${url}:`, error)
    return {
      url,
      title: 'Error',
      text: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
