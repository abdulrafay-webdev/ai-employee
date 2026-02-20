import type { Metadata } from "next";
import "./globals.css";
import AuthGuard from "../components/auth-guard";

export const metadata: Metadata = {
  title: "AI Employee Dashboard",
  description: "Personal assistant control center",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}
