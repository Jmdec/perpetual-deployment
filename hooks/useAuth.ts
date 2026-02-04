import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth"
import { useRouter } from "next/navigation"

export function useAuth(requireAuth = true) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        console.log('useAuth: Starting auth check...')
        const currentUser = await authClient.getCurrentUser()
        console.log('useAuth: Got user:', currentUser)
        
        if (!currentUser && requireAuth) {
          console.log('useAuth: No user and auth required, redirecting to login')
          router.push("/login")
        } else {
          console.log('useAuth: Setting user')
          setUser(currentUser)
        }
      } catch (err) {
        console.error('useAuth: Error during auth check:', err)
        setError(err instanceof Error ? err.message : 'Authentication failed')
        if (requireAuth) {
          router.push("/login")
        }
      } finally {
        console.log('useAuth: Setting loading to false')
        setLoading(false)
      }
    }

    checkAuth()
  }, [requireAuth, router])

  return { user, loading, error }
}