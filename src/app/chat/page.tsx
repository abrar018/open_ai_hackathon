'use client';

import { Chat } from "../components/chat";

export const runtime = 'edge';

export default function Page() {

  const ratings = {
    Extraversion: 5,
    Openness: 5,
    Conscientiousness: 5,
    Agreeableness: 5,
    Neuroticism: 3,
  };

  return (
    <div>
      <Chat />
        <button onClick={() => window.location.href = '/another-page'}>
            Go to Another Page
        </button>
    </div>
    
  );
}