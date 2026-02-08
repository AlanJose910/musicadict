"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Home } from 'lucide-react'
import ArtistBubbleView from './ArtistBubbleView'
import NetworkGraph from './NetworkGraph'
import SidebarArtistList from './SidebarArtistList'

interface ExperienceContainerProps {
    tracks: any[]
    artists: any[]
}

export default function ExperienceContainer({ tracks, artists }: ExperienceContainerProps) {
    const [view, setView] = useState<'bubbles' | 'graph'>('bubbles')
    const [exploredArtistIds, setExploredArtistIds] = useState<string[]>([])
    const [lastSelectedId, setLastSelectedId] = useState<string | null>(null)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const router = useRouter()

    const handleArtistClick = (artistId: string) => {
        setIsTransitioning(true)
        setTimeout(() => {
            setExploredArtistIds([artistId])
            setLastSelectedId(artistId)
            setView('graph')
            setIsTransitioning(false)
        }, 400)
    }

    const handleSidebarSelect = (artistId: string) => {
        // When selecting from sidebar, we reset the journey to that artist
        setExploredArtistIds([artistId])
        setLastSelectedId(artistId)
    }

    const handleGraphExpand = (artistId: string) => {
        // Additive expansion
        setExploredArtistIds(prev => prev.includes(artistId) ? prev : [...prev, artistId])
        setLastSelectedId(artistId)
    }

    const handleGoHome = () => {
        router.push('/')
    }

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--background)' }}>
            <div style={{
                width: '100%',
                height: '100%',
                opacity: isTransitioning ? 0 : 1,
                transition: 'opacity 0.4s ease-in-out',
                display: view === 'bubbles' ? 'block' : 'none'
            }}>
                <ArtistBubbleView
                    tracks={tracks}
                    artists={artists}
                    onArtistClick={handleArtistClick}
                />
            </div>

            <div style={{
                width: '100%',
                height: '100%',
                opacity: (view === 'graph' && !isTransitioning) ? 1 : 0,
                transition: 'opacity 0.4s ease-in-out',
                display: view === 'graph' ? 'grid' : 'none',
                gridTemplateColumns: 'minmax(0, 1fr) 300px',
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(20px)'
            }}>
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <NetworkGraph
                        tracks={tracks}
                        artists={artists}
                        exploredArtistIds={exploredArtistIds}
                        lastSelectedId={lastSelectedId}
                        onArtistSelect={handleGraphExpand}
                    />
                    <button
                        onClick={() => setView('bubbles')}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            left: '20px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-full)',
                            cursor: 'pointer',
                            zIndex: 100,
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                        }}
                    >
                        ← Back to Universe
                    </button>
                    <button
                        onClick={handleGoHome}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '340px',
                            background: 'rgba(29, 185, 84, 0.2)',
                            border: '1px solid var(--primary)',
                            color: 'var(--primary)',
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-full)',
                            cursor: 'pointer',
                            zIndex: 100,
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 600,
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--primary)'
                            e.currentTarget.style.color = 'black'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(29, 185, 84, 0.2)'
                            e.currentTarget.style.color = 'var(--primary)'
                        }}
                    >
                        <Home size={16} />
                        New Playlist
                    </button>
                </div>
                <SidebarArtistList
                    artists={artists}
                    selectedId={lastSelectedId}
                    onSelect={handleSidebarSelect}
                />
            </div>
        </div>
    )
}
