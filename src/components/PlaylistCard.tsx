import Link from "next/link"
import { Music2 } from "lucide-react"
import styles from "./PlaylistCard.module.css"

interface PlaylistCardProps {
    id: string
    name: string
    image?: string
    trackCount: number
    owner: string
}

export default function PlaylistCard({ id, name, image, trackCount, owner }: PlaylistCardProps) {
    return (
        <Link href={`/playlist/${id}`} className={styles.card}>
            <div className={styles.imageContainer}>
                {image ? (
                    <img src={image} alt={name} className={styles.image} />
                ) : (
                    <div className={styles.placeholder}>
                        <Music2 size={48} />
                    </div>
                )}
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{name}</h3>
                <p className={styles.subtitle}>
                    by {owner} • {trackCount} tracks
                </p>
            </div>
        </Link>
    )
}
