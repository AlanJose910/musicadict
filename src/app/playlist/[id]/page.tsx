import { auth } from "@/auth"
import { getSpotifyClient, getGuestSpotifyClient } from "@/lib/spotify"
import ExperienceContainer from "@/components/ExperienceContainer"
import { AlertCircle } from "lucide-react"

export default async function PlaylistPage({ params }: { params: { id: string } }) {
    const { id } = await params
    const session = await auth()

    let tracks: any[] = []
    let artists: any[] = []
    let error: string | null = null

    try {
        let spotifyApi = await getSpotifyClient()

        if (!spotifyApi) {
            spotifyApi = await getGuestSpotifyClient()
        }

        if (!spotifyApi) {
            throw new Error("Could not initialize Spotify API")
        }

        const response = await spotifyApi.getPlaylist(id)
        const playlistTracks = response.body.tracks.items
        tracks = playlistTracks.map(item => item.track).filter(t => t !== null)

        // Fetch enriched artist data (images, genres) in batches of 50
        const artistIds = Array.from(new Set(tracks.flatMap(t => t.artists.map((a: any) => a.id))))
        for (let i = 0; i < artistIds.length; i += 50) {
            const batch = artistIds.slice(i, i + 50)
            const artistsResponse = await spotifyApi.getArtists(batch)
            artists = [...artists, ...artistsResponse.body.artists]
        }
    } catch (err: any) {
        console.error("Error fetching playlist data", err)
        error = "Could not load playlist. Ensure it's public if not logged in."
    }

    if (error) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                background: 'var(--background)',
                padding: 'var(--spacing-xl)'
            }}>
                <AlertCircle size={64} color="#ef4444" style={{ marginBottom: 'var(--spacing-md)' }} />
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)' }}>Error</h2>
                <p style={{ color: 'var(--foreground-muted)', maxWidth: '400px' }}>{error}</p>
                <a href="/" className="btn" style={{ marginTop: 'var(--spacing-lg)' }}>Go Back</a>
            </div>
        )
    }

    return (
        <main style={{ minHeight: '100vh', background: 'transparent' }}>
            <ExperienceContainer
                tracks={tracks}
                artists={artists}
            />

            <div style={{
                position: 'fixed',
                bottom: '10px',
                right: '10px',
                fontSize: '0.7rem',
                opacity: 0.3,
                zIndex: 100,
                pointerEvents: 'none'
            }}>
                Access via 127.0.0.1:3000
            </div>
        </main>
    )
}
