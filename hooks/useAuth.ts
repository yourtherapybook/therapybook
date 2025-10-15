import { useSession, signIn, signOut } from 'next-auth/react'

interface User {
  id: string
  email: string
  name?: string
  firstName: string
  lastName: string
  role: string
  image?: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
}

export const useAuth = () => {
  const { data: session, status } = useSession()

  const authState: AuthState = {
    isAuthenticated: !!session,
    user: session?.user ? {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name || `${session.user.firstName} ${session.user.lastName}`,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      role: session.user.role,
      image: session.user.image || undefined
    } : null,
    isLoading: status === 'loading'
  }

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      
      if (result?.error) {
        throw new Error(result.error)
      }
      
      return result
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut({ redirect: false })
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const register = async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Registration failed')
      }

      const result = await response.json()
      
      // Auto-login after successful registration
      await login(userData.email, userData.password)
      
      return result
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  return {
    ...authState,
    login,
    logout,
    register,
    session
  }
}