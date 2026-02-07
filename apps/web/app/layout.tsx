import './globals.css'

export const metadata = {
  title: 'Bio-Link Depot Inventory',
  description: 'Inventory management system for Bio-Link Depot',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
