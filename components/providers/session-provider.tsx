
"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect, useState } from "react";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="bg-gray-950 min-h-screen" />;
  }

  return <SessionProvider>{children}</SessionProvider>;
}
