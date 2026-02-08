"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'

interface ArtistBubble extends d3.SimulationNodeDatum {
    id: string
    name: string
    trackCount: number
    image?: string
    radius: number
    x?: number
    y?: number
    fx?: number | null
    fy?: number | null
}

interface ArtistBubbleViewProps {
    tracks: any[]
    artists: any[]
    onArtistClick: (artistId: string) => void
}

export default function ArtistBubbleView({ tracks, artists, onArtistClick }: ArtistBubbleViewProps) {
    const svgRef = useRef<SVGSVGElement>(null)
    const [bubbleData, setBubbleData] = useState<ArtistBubble[]>([])
    const onArtistClickRef = useRef(onArtistClick)

    // Keep the callback ref updated
    useEffect(() => {
        onArtistClickRef.current = onArtistClick
    }, [onArtistClick])

    useEffect(() => {
        const artistCounts = new Map<string, number>()
        tracks.forEach(track => {
            track.artists.forEach((a: any) => {
                artistCounts.set(a.id, (artistCounts.get(a.id) || 0) + 1)
            })
        })

        const isMobile = window.innerWidth < 768
        const data: ArtistBubble[] = artists.map(artist => {
            const count = artistCounts.get(artist.id) || 0
            const baseRadius = Math.min(150, Math.max(50, count * 15 + 35))
            const radius = isMobile ? baseRadius * 0.6 : baseRadius
            return {
                id: artist.id,
                name: artist.name,
                trackCount: count,
                image: artist.images?.[0]?.url,
                radius
            }
        })

        setBubbleData(data)
    }, [tracks, artists])

    useEffect(() => {
        if (!svgRef.current || bubbleData.length === 0) return

        const width = window.innerWidth
        const height = window.innerHeight

        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove()

        const g = svg.append("g")

        const isMobile = width < 768

        // Stronger centering forces to prevent left-side clustering
        const simulation = d3.forceSimulation<ArtistBubble>(bubbleData)
            .force("x", d3.forceX(width / 2).strength(isMobile ? 0.15 : 0.08))
            .force("y", d3.forceY(height / 2).strength(isMobile ? 0.15 : 0.08))
            .force("collide", d3.forceCollide<ArtistBubble>(d => d.radius + (isMobile ? 5 : 15)).strength(0.7))
            .force("charge", d3.forceManyBody().strength(isMobile ? 5 : 10))
            .alphaDecay(0.02) // Slower decay for smoother settling

        const defs = svg.append("defs")
        bubbleData.forEach(d => {
            if (d.image) {
                defs.append("pattern")
                    .attr("id", `pattern-bubble-${d.id}`)
                    .attr("width", 1)
                    .attr("height", 1)
                    .attr("patternContentUnits", "objectBoundingBox")
                    .append("image")
                    .attr("xlink:href", d.image)
                    .attr("width", 1)
                    .attr("height", 1)
                    .attr("preserveAspectRatio", "xMidYMid slice")
            }
        })

        const bubbles = g.selectAll(".bubble-group")
            .data(bubbleData)
            .join("g")
            .attr("class", "bubble-group")
            .style("cursor", "pointer")
            .on("click", function (event, d) {
                console.log("Bubble clicked:", d.name, d.id)
                event.stopPropagation()
                onArtistClickRef.current(d.id)
            })

        bubbles.append("circle")
            .attr("r", d => d.radius)
            .attr("fill", d => d.image ? `url(#pattern-bubble-${d.id})` : "var(--primary)")
            .attr("stroke", "rgba(255,255,255,0.1)")
            .attr("stroke-width", 2)
            .style("transition", "all 0.3s ease")
            .style("pointer-events", "all") // Ensure circle receives pointer events
            .on("mouseenter", function () {
                d3.select(this).attr("stroke", "var(--primary)").attr("stroke-width", 4)
            })
            .on("mouseleave", function () {
                d3.select(this).attr("stroke", "rgba(255,255,255,0.1)").attr("stroke-width", 2)
            })

        bubbles.append("text")
            .text(d => d.name)
            .attr("text-anchor", "middle")
            .attr("dy", d => d.radius + (isMobile ? 18 : 25))
            .attr("fill", "white")
            .style("font-size", isMobile ? "10px" : "14px")
            .style("font-weight", "600")
            .style("text-shadow", "0 2px 4px rgba(0,0,0,0.8)")
            .style("pointer-events", "none")

        // Add zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 5])
            .on("zoom", (event) => {
                g.attr("transform", event.transform)
            })
        svg.call(zoom)

        // Add drag behavior
        const drag = d3.drag<SVGGElement, ArtistBubble>()
            .on("start", (event, d) => {
                if (!event.active) simulation.alphaTarget(0.3).restart()
                d.fx = d.x
                d.fy = d.y
            })
            .on("drag", (event, d) => {
                d.fx = event.x
                d.fy = event.y
            })
            .on("end", (event, d) => {
                if (!event.active) simulation.alphaTarget(0)
                d.fx = null
                d.fy = null
            })

        bubbles.call(drag as any)

        simulation.on("tick", () => {
            bubbles.attr("transform", d => `translate(${d.x},${d.y})`)
        })

        return () => {
            simulation.stop()
        }
    }, [bubbleData])

    return (
        <section style={{
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                style={{ overflow: 'visible', cursor: 'grab' }}
            />

            {/* Navigation Hint */}
            <div style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)',
                padding: '10px 20px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                color: 'var(--foreground-muted)',
                pointerEvents: 'none',
                zIndex: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                gap: '15px',
                whiteSpace: 'nowrap'
            }}>
                <span>🖱️ Drag to Move </span>
                <span>🔍 Scroll to Zoom</span>
                <span>🖐️ Pan for More</span>
            </div>
        </section>
    )
}
