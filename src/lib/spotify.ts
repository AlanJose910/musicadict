import SpotifyWebApi from "spotify-web-api-node"
import { auth } from "@/auth"

export async function getSpotifyClient() {
    const session = await auth()

    if (!session || !session.accessToken) {
        return null
    }

    const spotifyApi = new SpotifyWebApi({
        clientId: process.env.AUTH_SPOTIFY_ID,
        clientSecret: process.env.AUTH_SPOTIFY_SECRET,
    })

    spotifyApi.setAccessToken(session.accessToken as string)

    return spotifyApi

}

export async function getGuestSpotifyClient() {
    const spotifyApi = new SpotifyWebApi({
        clientId: process.env.AUTH_SPOTIFY_ID,
        clientSecret: process.env.AUTH_SPOTIFY_SECRET,
    })

    try {
        const data = await spotifyApi.clientCredentialsGrant()
        spotifyApi.setAccessToken(data.body['access_token'])
        return spotifyApi
    } catch (error) {
        console.error("Error getting guest client credentials", error)
        return null
    }
}
