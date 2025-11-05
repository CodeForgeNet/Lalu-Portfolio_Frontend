# Lalu Portfolio - Frontend

This is the frontend for the AI-powered portfolio, built with Next.js, React, and TypeScript. It provides an interactive and visually engaging user interface for visitors to learn about Lalu Kumar and chat with his AI twin.

## Features

- **Interactive 3D Avatar**: A Ready Player Me avatar, animated using React Three Fiber, that lip-syncs to the AI's spoken responses.
- **AI Chat Interface**: A familiar chat UI where users can type questions and receive answers from the AI.
- **Verbal Questions**: Users can click a button to ask questions verbally using their microphone, powered by the browser's Speech Recognition API.
- **Text-to-Speech (TTS)**: The AI's responses are converted to audio and played back, creating a conversational experience.
- **Dynamic Suggestions**: The UI provides conversation-starting questions and relevant follow-ups.
- **Responsive Design**: A modern and responsive layout styled with Tailwind CSS.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **3D Graphics**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction) & [Drei](https://github.com/pmndrs/drei)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **API Communication**: [Axios](https://axios-http.com/)

## Project Structure

```
apps/frontend/
├── src/
│   ├── app/                # Next.js App Router: main page and layout
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/         # Reusable React components
│   │   ├── Avatar.tsx      # 3D avatar model, animation, and lip-sync logic
│   │   ├── AvatarScene.tsx # Canvas setup for the 3D avatar
│   │   └── Chat.tsx        # The main chat interface component
│   ├── data/
│   │   └── resume.json     # Local copy of resume data for display
│   └── utils/
│       ├── avatarStore.ts  # Zustand store for global state management
│       └── useSpeechRecognition.ts # Hook for browser-based speech recognition
├── public/
│   ├── models/avatar.glb   # The 3D model for the avatar
│   └── ...                 # Other static assets like images and SVGs
├── .env.local.example      # Example for local environment variables
├── next.config.ts          # Next.js configuration
├── package.json            # Project dependencies and scripts
└── tailwind.config.ts      # Tailwind CSS configuration
```

## Getting Started

### Prerequisites

- Node.js (v18.x or later)
- The [backend service](../backend) must be running, either locally or deployed.

### 1. Installation

Navigate to the `apps/frontend` directory and install the dependencies:

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the `apps/frontend` directory. This file is used to point to your backend API.

```bash
cp .env.local.example .env.local
```

If your backend is running locally on port 8080, the file should contain:

```
NEXT_PUBLIC_API_BASE=http://localhost:8080
```

If your backend is deployed, replace the URL with your production API endpoint.

## Development

To run the frontend development server:

```bash
npm run dev
```

This will start the application, typically on `http://localhost:3000`.

## Deployment

This Next.js application is optimized for deployment on [Vercel](https://vercel.com/). Simply connect your Git repository to a Vercel project. 

Remember to set the `NEXT_PUBLIC_API_BASE` environment variable in your Vercel project settings to point to your deployed backend API URL.
