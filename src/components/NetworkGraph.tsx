"use client"

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import styles from './NetworkGraph.module.css'

interface Node extends d3.SimulationNodeDatum {
    id: string
    group: 'artist' | 'track'
    name: string
    image?: string
    radius: number
    type?: string // For tooltips
}

interface Link extends d3.SimulationLinkDatum<Node> {
    source: string | Node
    target: string | Node
}

interface NetworkGraphProps {
    tracks: any[]
    artists?: any[]
    exploredArtistIds: string[]
    lastSelectedId?: string | null
    onArtistSelect?: (id: string) => void
}

export default function NetworkGraph({ tracks, artists, exploredArtistIds, lastSelectedId, onArtistSelect }: NetworkGraphProps) {
    const svgRef = useRef<SVGSVGElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
    const [tooltip, setTooltip] = useState<{ x: number, y: number, content: string, visible: boolean }>({ x: 0, y: 0, content: '', visible: false })
    const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null)
    const nodesRef = useRef<Node[]>([])
    const linksRef = useRef<Link[]>([])

    const isMobile = dimensions.width < 768

    useEffect(() => {
        if (!containerRef.current) return

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect
                if (width > 0 && height > 0) {
                    setDimensions({ width, height })
                }
            }
        })

        resizeObserver.observe(containerRef.current)

        // Initial check
        const { width, height } = containerRef.current.getBoundingClientRect()
        if (width > 0 && height > 0) {
            setDimensions({ width, height })
        }

        return () => resizeObserver.disconnect()
    }, [])

    useEffect(() => {
        if (!svgRef.current || !tracks.length || dimensions.width === 0) return

        const width = dimensions.width
        const height = dimensions.height

        // 1. Prepare Data Additively
        const newNodes: Node[] = []
        const newLinks: Link[] = []
        const artistMap = new Map<string, boolean>()
        const trackMap = new Map<string, boolean>()

        // We filter tracks that belong to ANY explored artist
        const relevantTracks = tracks.filter(t =>
            t.artists.some((a: any) => exploredArtistIds.includes(a.id))
        )

        const isMobile = width < 768
        const nodeScale = isMobile ? 0.7 : 1

        relevantTracks.forEach(track => {
            if (!track || !track.id) return;

            if (!trackMap.has(track.id)) {
                trackMap.set(track.id, true)
                newNodes.push({
                    id: track.id,
                    group: 'track',
                    name: track.name,
                    radius: 8 * nodeScale,
                    type: 'Track',
                })
            }

            track.artists.forEach((artist: any) => {
                if (!artist.id) return;
                if (!artistMap.has(artist.id)) {
                    artistMap.set(artist.id, true)
                    const enrichedArtist = artists?.find(a => a.id === artist.id)
                    newNodes.push({
                        id: artist.id,
                        group: 'artist',
                        name: artist.name,
                        image: enrichedArtist?.images?.[2]?.url || enrichedArtist?.images?.[0]?.url,
                        radius: (artist.id === lastSelectedId ? 50 : 30) * nodeScale,
                        type: 'Artist',
                    })
                }
                newLinks.push({ source: track.id, target: artist.id })
            })
        })

        // Preserve positions for existing nodes
        const nodes = newNodes.map(newNode => {
            const existingNode = nodesRef.current.find(n => n.id === newNode.id)
            if (existingNode) {
                return { ...newNode, x: existingNode.x, y: existingNode.y, vx: existingNode.vx, vy: existingNode.vy }
            }
            // If new node, start it near the center or near its parent
            return { ...newNode, x: width / 2, y: height / 2 }
        })

        nodesRef.current = nodes
        linksRef.current = newLinks as Link[]

        const svgElement = d3.select(svgRef.current)
        // Only clear if it's the first render or a full reset
        // For expansion, D3 join is better. 
        // But the previous implementation cleared everything. Let's keep it simple for now but use join correctly.

        let container = svgElement.select<SVGGElement>("g.main-container")
        if (container.empty()) {
            container = svgElement.append("g").attr("class", "main-container")

            const zoom = d3.zoom<SVGSVGElement, unknown>()
                .scaleExtent([0.1, 8])
                .on("zoom", (event) => {
                    container.attr("transform", event.transform)
                })
            svgElement.call(zoom)
        }

        const mainGroup = container

        // Add patterns to defs
        let defs = svgElement.select<SVGDefsElement>("defs")
        if (defs.empty()) defs = svgElement.append("defs")

        nodes.forEach(node => {
            if (node.group === 'artist' && node.image) {
                const patternId = `p-graph-${node.id.replace(/:/g, '-')}`
                if (defs.select(`#${patternId}`).empty()) {
                    defs.append("pattern")
                        .attr("id", patternId)
                        .attr("width", 1).attr("height", 1)
                        .attr("patternContentUnits", "objectBoundingBox")
                        .append("image")
                        .attr("xlink:href", node.image)
                        .attr("width", 1).attr("height", 1)
                        .attr("preserveAspectRatio", "xMidYMid slice")
                }
            }
        })

        const simulation = d3.forceSimulation<Node>(nodes)
            .force("link", d3.forceLink<Node, Link>(newLinks).id(d => d.id).distance(isMobile ? 60 : 100))
            .force("charge", d3.forceManyBody().strength(isMobile ? -400 : -800))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide<Node>().radius(d => d.radius + (isMobile ? 20 : 40)))

        simulationRef.current = simulation

        // LINKS
        let linkGroup = mainGroup.select<SVGGElement>("g.links")
        if (linkGroup.empty()) linkGroup = mainGroup.append("g").attr("class", "links")

        const link = linkGroup.selectAll("line")
            .data(newLinks)
            .join("line")
            .attr("stroke", "var(--primary)")
            .attr("stroke-opacity", 0.2)
            .attr("stroke-width", 2)

        // NODES
        let nodeGroup = mainGroup.select<SVGGElement>("g.nodes")
        if (nodeGroup.empty()) nodeGroup = mainGroup.append("g").attr("class", "nodes")

        const node = nodeGroup.selectAll<SVGGElement, Node>("g.node")
            .data(nodes, d => d.id)
            .join(
                enter => {
                    const g = enter.append("g").attr("class", "node")
                    g.append("circle").attr("class", "node-circle")
                    g.append("path").attr("class", "track-icon")
                    g.append("text")
                    return g
                }
            )
            .attr("class", d => `node ${d.id === lastSelectedId ? "pulse-node" : ""}`)
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                if (d.group === 'artist' && onArtistSelect) {
                    onArtistSelect(d.id)
                }
            })
            .on("mouseenter", function (event, d) {
                const isTrack = d.group === 'track'
                d3.select(this).select("circle")
                    .transition().duration(200)
                    .attr("r", isTrack ? d.radius * 1.5 : d.radius * 1.2)
                    .attr("stroke-width", isTrack ? 2 : 6)

                setTooltip({
                    x: event.clientX,
                    y: event.clientY - 40,
                    content: `${d.name} (${d.type})`,
                    visible: true
                })

                node.style("opacity", (n: any) => n.id === d.id ? 1 : 0.2)
                link.style("opacity", (l: any) => (l.source.id === d.id || l.target.id === d.id || (l.source as any).id === d.id || (l.target as any).id === d.id) ? 1 : 0.1)
            })
            .on("mousemove", (event) => {
                setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY - 40 }))
            })
            .on("mouseleave", function (event, d) {
                d3.select(this).select("circle")
                    .transition().duration(200)
                    .attr("r", d.radius)
                    .attr("stroke-width", d.id === lastSelectedId ? 4 : 2)

                setTooltip(prev => ({ ...prev, visible: false }))
                node.style("opacity", 1)
                link.style("opacity", 1)
            })
            .call(d3.drag<SVGGElement, Node>()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended) as any)

        node.select("circle")
            .attr("r", d => d.radius)
            .attr("stroke", d => d.id === lastSelectedId ? 'var(--primary)' : (d.group === 'track' ? 'rgba(255,255,255,0.2)' : '#fff'))
            .attr("stroke-width", d => d.id === lastSelectedId ? 4 : 2)
            .attr("fill", d => d.group === 'artist' && d.image ? `url(#p-graph-${d.id.replace(/:/g, '-')})` : (d.group === 'artist' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'))
            .style("display", d => d.group === 'artist' ? 'block' : 'block') // Keep circles for both but style track circles as backgrounds

        node.select("path.track-icon")
            .attr("d", "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z")
            .attr("transform", "translate(-12, -12) scale(1.2)") // Center the 24x24 path
            .attr("fill", "var(--primary)")
            .style("display", d => d.group === 'track' ? 'block' : 'none')
            .style("filter", "drop-shadow(0 0 5px var(--primary))")

        node.select("text")
            .text(d => d.name)
            .attr("font-size", d => (d.id === lastSelectedId ? (isMobile ? 12 : 16) : (isMobile ? 8 : 10)) + "px")
            .attr("fill", "white")
            .attr("text-anchor", "middle")
            .attr("dy", d => d.group === 'artist' ? d.radius + (isMobile ? 12 : 20) : (isMobile ? 18 : 25)) // Artists labels lower, track labels closer to icon
            .style("pointer-events", "none")
            .style("text-shadow", "0 2px 4px rgba(0,0,0,1)")
            .style("font-weight", d => d.group === 'artist' ? "bold" : "normal")
            .style("display", "block") // Always show labels now
            .style("opacity", d => d.group === 'artist' ? 1 : 0.7) // Make track labels slightly more subtle

        simulation.on("tick", () => {
            link.attr("x1", d => (d.source as any).x).attr("y1", d => (d.source as any).y)
                .attr("x2", d => (d.target as any).x).attr("y2", d => (d.target as any).y)
            node.attr("transform", d => `translate(${d.x},${d.y})`)
        })

        function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            event.subject.fx = event.subject.x; event.subject.fy = event.subject.y
        }
        function dragged(event: any) { event.subject.fx = event.x; event.subject.fy = event.y }
        function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0)
            event.subject.fx = null; event.subject.fy = null
        }

        return () => { simulation.stop() }
    }, [tracks, artists, exploredArtistIds, lastSelectedId, dimensions, onArtistSelect])

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', background: 'transparent' }}>
            <div style={{
                position: 'absolute', top: isMobile ? 70 : 20, right: 20, zIndex: 10,
                textAlign: 'right', pointerEvents: 'none',
                maxWidth: isMobile ? '70%' : 'none'
            }}>
                <h2 className="mobile-header-text" style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: 0, textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                    {lastSelectedId ? artists?.find(a => a.id === lastSelectedId)?.name : "Relationship Graph"}
                </h2>
                <div style={{ color: 'var(--primary)', fontSize: '0.8rem', letterSpacing: '2px', fontWeight: 700 }}>
                    {lastSelectedId ? "FOCUSED UNIVERSE" : "ECOSYSTEM OVERVIEW"}
                </div>
            </div>

            {tooltip.visible && (
                <div className="graph-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
                    {tooltip.content}
                </div>
            )}

            <svg ref={svgRef} width="100%" height="100%" style={{ cursor: 'grab' }} />

            <div style={{
                position: 'absolute', bottom: 20, left: 20,
                fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)',
                background: 'rgba(0,0,0,0.3)', padding: '5px 10px', borderRadius: '10px',
                backdropFilter: 'blur(5px)'
            }}>
                Click Artist to Explore • Drag to Rearrange • Scroll to Zoom
            </div>
        </div>
    )
}
