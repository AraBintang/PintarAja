import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function GoogleAuth() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  useEffect(() => {
    const token = params.get('token')

    if (token) {
      localStorage.setItem('token', token)

      navigate('/chat', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  )
}
