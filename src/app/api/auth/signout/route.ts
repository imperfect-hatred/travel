import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Удаляем cookie с токеном
  const response = NextResponse.redirect(new URL('/', request.url))
  
  response.cookies.delete('next-auth.session-token')
  response.cookies.delete('__Secure-next-auth.session-token')
  response.cookies.delete('auth-token')
  
  // Также очищаем все возможные варианты cookie
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  }
  
  response.cookies.set('next-auth.session-token', '', { ...cookieOptions, maxAge: 0 })
  response.cookies.set('__Secure-next-auth.session-token', '', { ...cookieOptions, maxAge: 0 })
  
  return response
}