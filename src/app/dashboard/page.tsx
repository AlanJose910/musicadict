import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { getSpotifyClient } from "@/lib/spotify"
import PlaylistCard from "@/components/PlaylistCard"

export default async function DashboardPage() {
    const session = await auth()

    if (!session) {
        redirect("/")
    }

    const spotify = await getSpotifyClient()
    let playlists: any[] = []

    try {
        if (spotify) {
            const data = await spotify.getUserPlaylists()
            playlists = data.body.items
        }
    } catch (error) {
        console.error("Failed to fetch playlists", error)
        // Handle token expiration or other specific API errors here
    }

    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-2xl)' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-2xl)'
            }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xs)' }}>Library</h1>
                    <p style={{ color: 'var(--foreground-muted)' }}>Found {playlists.length} playlists</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        {session.user?.image && (
                            <img
                                src={session.user.image}
                                alt="Profile"
                                style={{ width: 32, height: 32, borderRadius: '50%' }}
                            />
                        )}
                        <span style={{ fontWeight: 600 }}>{session.user?.name}</span>
                    </div>

                    <form
                        action={async () => {
                            "use server"
                            await signOut({ redirectTo: "/" })
                        }}
                    >
                        <button className="btn-outline" style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem' }}>
                            Sign Out
                        </button>
                    </form>
                </div>
            </header>

            <main>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 'var(--spacing-lg)'
                }}>
                    {playlists.map((playlist: any) => (
                        <PlaylistCard
                            key={playlist.id}
                            id={playlist.id}
                            name={playlist.name}
                            image={playlist.images?.[0]?.url}
                            trackCount={playlist.tracks.total}
                            owner={playlist.owner.display_name}
                        />
                    ))}
                </div>
                {playlists.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--foreground-muted)' }}>
                        No playlists found.
                    </div>
                )}
            </main>
        </div>
    )
}
