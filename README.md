# Synapse: AI-Powered Web Summarizer

Synapse is a powerful web application that extracts and summarizes the key content from any website URL. Built with Next.js and Tailwind CSS, it provides instant, readable summaries to help users quickly understand website content without having to read through everything.

## ✨ Features

- **Instant Website Summarization**: Enter any URL and get a concise summary within seconds
- **Proxy Support**: Advanced techniques to access websites that typically block web scraping
- **Elegant UI**: Modern, responsive interface with subtle animations
- **Content Type Detection**: Automatically identifies if content is a news article, blog post, product page, etc.
- **Error Handling**: Robust fallbacks when sites can't be accessed or content extraction fails

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository

   ```bash
   https://github.com/bimashazaman/LLM-Synapse-Web-Summarizer.git
   cd LLM-Synapse-Web-Summarizer
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 How It Works

Synapse extracts website content using the following approach:

1. **Fetching**: Uses axios to retrieve webpage HTML content
2. **Parsing**: Employs cheerio to parse HTML and extract meaningful content
3. **Proxy Support**: Implements multiple proxy methods for websites that block direct scraping
4. **Summarization**: Applies a content extraction algorithm to identify the most important information
5. **Response**: Returns a formatted HTML summary with website type detection

## 📚 API Usage

The project offers a simple API endpoint for summarization:

```
POST /api/summarize
```

**Request Body:**

```json
{
  "url": "https://example.com"
}
```

**Response:**

```json
{
  "summary": "<h2>Page Title</h2><p>Summary content...</p>..."
}
```

## 🛠️ Tech Stack

- **Frontend**: React 19, Next.js 15, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Web Scraping**: Axios, Cheerio
- **Icons**: React Icons

## 📝 Future Improvements

- Integration with OpenAI or other AI services for more sophisticated summarization
- Browser extension for one-click summarization
- User accounts to save favorite summaries
- Support for additional content types (PDFs, academic papers, etc.)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Next.js team for the excellent framework
- Vercel for hosting and deployment
- Contributors and users who provide feedback

---

<div align="center">
  <p>Made with ❤️ using Next.js and Tailwind CSS by Bimasha Zaman</p>
</div>
