import styles from "./TrackList.module.css"

interface Track {
    id: string
    name: string
    artists: { name: string }[]
    album: { name: string; images: { url: string }[] }
    duration_ms: number
    popularity: number
}

interface TrackListProps {
    tracks: Track[]
}

export default function TrackList({ tracks }: TrackListProps) {
    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000)
        const seconds = ((ms % 60000) / 1000).toFixed(0)
        return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`
    }

    return (
        <div className={styles.container}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.th}>#</th>
                        <th className={styles.th}>Title</th>
                        <th className={styles.th}>Album</th>
                        <th className={styles.th}>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    {tracks.map((track, index) => (
                        <tr key={track.id + index} className={styles.tr}>
                            <td className={styles.tdIndex}>{index + 1}</td>
                            <td className={styles.tdTitle}>
                                <div className={styles.titleContainer}>
                                    {track.album.images[2] && (
                                        <img
                                            src={track.album.images[2].url}
                                            alt=""
                                            className={styles.albumArt}
                                        />
                                    )}
                                    <div className={styles.textStack}>
                                        <span className={styles.trackName}>{track.name}</span>
                                        <span className={styles.artistName}>
                                            {track.artists.map(a => a.name).join(", ")}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td className={styles.tdAlbum}>{track.album.name}</td>
                            <td className={styles.tdDuration}>{formatDuration(track.duration_ms)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
