"use client"

interface SidebarArtistListProps {
    artists: any[]
    selectedId: string | null
    onSelect: (id: string) => void
}

export default function SidebarArtistList({ artists, selectedId, onSelect }: SidebarArtistListProps) {
    return (
        <aside style={{
            background: 'rgba(0,0,0,0.5)',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            overflowY: 'auto',
            padding: 'var(--spacing-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-xs)'
        }}>
            <h3 style={{
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: 'var(--foreground-muted)',
                marginBottom: 'var(--spacing-md)'
            }}>
                Explore Artists
            </h3>
            {artists.map((artist, index) => (
                <button
                    key={artist.id}
                    onClick={() => onSelect(artist.id)}
                    style={{
                        background: selectedId === artist.id ? 'var(--primary)' : 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        color: selectedId === artist.id ? 'black' : 'white',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    {artist.images?.[2]?.url && (
                        <img
                            src={artist.images[2].url}
                            style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                            alt=""
                        />
                    )}
                    <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: selectedId === artist.id ? '700' : '400'
                    }}>
                        {artist.name}
                    </span>
                </button>
            ))}
        </aside>
    )
}
