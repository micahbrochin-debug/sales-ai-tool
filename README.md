# Sales Intelligence App

A Next.js application for processing prospects with AI-powered research and analysis.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   # Required: OpenAI API Key
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Optional: Tavily API Key for web search (get free key at https://app.tavily.com/)
   TAVILY_API_KEY=your_tavily_api_key_here
   ```

3. **Run the development server:**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **Prospect Processing**: Process prospects using custom GPT configurations
- **Web Search Integration**: Uses Tavily API for current market intelligence (when API key is configured)
- **LinkedIn Integration**: Upload LinkedIn screenshots/PDFs for OCR processing
- **Collapsible Results**: GPT outputs appear minimized with expand functionality
- **Chat Interface**: Follow-up questions and refinements

## Web Search Enhancement

The app now includes ChatGPT-style web search integration using the Tavily API. This provides:
- Current market intelligence about prospects and companies
- Recent industry news and trends
- Up-to-date information for more accurate GPT outputs

**To enable web search:** Sign up for a free Tavily API key at https://app.tavily.com/ and add it to your `.env.local` file.

Without a Tavily API key, the app will still work but won't have access to current web information.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
