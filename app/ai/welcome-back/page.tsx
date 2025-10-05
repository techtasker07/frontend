"use client"

import { WelcomeBackPage } from "@/components/ai/welcome-back-page"

export default function AIWelcomeBackPage() {
  return (
    <WelcomeBackPage
      userName="Guest"
      onSkip={() => {/* handle skip */}}
      onClose={() => {/* handle close */}}
    />
  );
}
