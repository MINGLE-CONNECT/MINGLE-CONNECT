import './globals.css'
import PresenceTracker from './components/PresenceTracker'
export const metadata = {
  title: 'Mingle-Connect',
  description: 'Meet people. Make connections. Find your match.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
  <PresenceTracker />
  {children}
</body>
    </html>
  )
}
