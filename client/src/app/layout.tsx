import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SpendWise — Know where it goes",
  description: "Track income and expenses, manage budgets, and understand your money — grounded in your own data.",
};

// Runs before React hydrates so the correct theme class is on <html>
// from the very first paint — no flash of the wrong theme.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("spendwise_theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
