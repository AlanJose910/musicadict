"use client"

import { Search, Music2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const [input, setInput] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input) return

    let playlistId = input
    if (input.includes('spotify.com/playlist/')) {
      const parts = input.split('playlist/')
      if (parts[1]) {
        playlistId = parts[1].split('?')[0]
      }
    }

    if (playlistId) {
      setIsTransitioning(true)
      setTimeout(() => {
        router.push(`/playlist/${playlistId}`)
      }, 800)
    }
  }

  return (
    <main style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--spacing-xl)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div className="animate-entrance" style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
        <div className="animate-logo" style={{
          display: 'inline-flex',
          background: 'rgba(29, 185, 84, 0.1)',
          padding: '20px',
          borderRadius: '50%',
          marginBottom: 'var(--spacing-md)',
          border: '1px solid rgba(29, 185, 84, 0.3)'
        }}>
          <Music2 size={48} color="#1DB954" />
        </div>

        <h1 className="animate-text" style={{
          fontSize: '4rem',
          fontWeight: 900,
          textTransform: 'uppercase',
          margin: 0,
          background: 'linear-gradient(to bottom, #fff, #666)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Musicadict
        </h1>
        <p className="animate-fade" style={{ color: 'var(--foreground-muted)', fontSize: '1.2rem', marginTop: 'var(--spacing-sm)' }}>
          Your music universe, visualized.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="animate-input" style={{
        width: '100%',
        maxWidth: '600px',
        position: 'relative'
      }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Paste a Spotify playlist link..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              width: '100%',
              padding: '20px 30px',
              paddingRight: '70px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius-full)',
              color: 'white',
              fontSize: '1.2rem',
              outline: 'none',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
          />
          <button
            type="submit"
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'var(--primary)',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(29, 185, 84, 0.4)'
            }}
          >
            <Search size={24} color="black" />
          </button>
        </div>
      </form>

      <div className="animate-footer" style={{ marginTop: 'var(--spacing-2xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <div style={{ height: '1px', width: '40px', background: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Or</span>
          <div style={{ height: '1px', width: '40px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <button
          onClick={() => signIn("spotify", { redirectTo: "/dashboard" })}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '12px 24px',
            borderRadius: 'var(--radius-full)',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(5px)'
          }}
        >
          Login with Spotify
        </button>
      </div>

      <div className={`transition-page ${isTransitioning ? 'active' : ''}`} />

      <div style={{
        position: 'fixed',
        bottom: '20px',
        color: '#ef4444',
        fontSize: '0.8rem',
        opacity: 0.4,
        pointerEvents: 'none'
      }}>
        Use 127.0.0.1:3000 for Spotify Login
      </div>
    </main>
  )
}
