import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div
      className={`${geistSans.className} ${geistMono.className} font-sans min-h-screen flex flex-col bg-gray-300`}
    >
      <main className="pt-24 flex justify-center items-center text-center text-2xl text-gray-600">
        Hoş geldiniz! Lütfen giriş yapın veya kayıt olun.
      </main>
    </div>
  );
}
