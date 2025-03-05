# Real Estate Lead Scorer

A modern web application built with Next.js that allows real estate professionals to score potential leads based on various factors to determine their likelihood to convert.

## Features

- **Beautiful UI Design**: Inspired by modern, luxurious townhouses featuring wood, glass, and natural gardens with warm tones
- **Lead Scoring System**: Score leads based on key factors like credit score, down payment availability, and readiness to invest
- **Visual Classification**: Display results as Hot, Warm, or Cold leads with visual indicators and actionable next steps
- **Modern Animation**: Subtle animations using Framer Motion for a premium user experience
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Optimized for Vercel**: Configured for optimal performance on Vercel's hosting platform
- **Google Sheets Integration**: Automatically stores lead data in Google Sheets for easy tracking and follow-up

## Technology Stack

- **Frontend**: Next.js with React
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Deployment**: Vercel
- **Data Storage**: Google Sheets API

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn
- Google Cloud Platform account with Sheets API enabled (for data storage)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/real-estate-lead-scorer.git
   cd real-estate-lead-scorer
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn
   ```

3. Create a `.env.local` file with your Google Sheets credentials:
   ```
   GOOGLE_SHEETS_SHEET_ID=your_sheet_id
   GOOGLE_SHEETS_CLIENT_EMAIL=your_service_account_email
   GOOGLE_SHEETS_PRIVATE_KEY="your_private_key"
   NEXT_PUBLIC_REDIRECT_URL=your_thank_you_page_url
   ```

4. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This application is configured for easy deployment on Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Add the environment variables for Google Sheets integration
4. Vercel will automatically detect the Next.js project and apply the optimal build settings

## License

MIT

## Acknowledgements

- Designed by [The Boho Agency]
- Built with Next.js, Tailwind CSS, and Framer Motion 