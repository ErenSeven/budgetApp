import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Header from "../components/Header";
import { AuthProvider } from "@/context/AuthContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-300">
        <Header />
        <main className="p-4">
          <Component {...pageProps} />
        </main>
      </div>
    </AuthProvider>
  );
}