//import { Inter } from "next/font/google";
import "./globals.css";

//const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BML Playground",
  description: "nothing fun here, just suffer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
