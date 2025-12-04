import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Авторизация - TravelGuide',
  description: 'Вход и регистрация в TravelGuide',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}