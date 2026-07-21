import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://sogoapps.com"),
  title: "SogoApp",
  description: "SogoApp — private messaging, calls, live streams and trainings.",
  openGraph: {
    siteName: "SogoApp",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
