"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function GuestPlaylistForm() {
    const [input, setInput] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Extract ID from URL or use raw input
        let playlistId = input
        if (input.includes('spotify.com/playlist/')) {
            const parts = input.split('playlist/')
            if (parts[1]) {
                playlistId = parts[1].split('?')[0]
            }
        }

        if (!playlistId || playlistId.length < 5) {
            setError('Invalid playlist ID or Link')
            return
        }

        router.push(`/playlist/${playlistId}`)
    }

    return (
        <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: 'var(--spacing-md)' }}>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Or paste public playlist link..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 40px 12px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        color: 'white',
                        fontSize: '0.9rem'
                    }}
                />
                <button
                    type="submit"
                    style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--foreground-muted)',
                        cursor: 'pointer'
                    }}
                >
                    <Search size={18} />
                </button>
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>{error}</p>}
        </form>
    )
}
