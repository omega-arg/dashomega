
'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect directly to login for development
    router.push("/auth/signin");
  }, [router]);
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-2xl font-bold mb-4">Omega Store Dashboard</h1>
        <p>Redirigiendo...</p>
      </div>
    </div>
  );
}
