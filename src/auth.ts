import NextAuth from "next-auth"
import Spotify from "next-auth/providers/spotify"

const scopes = [
    "user-read-email",
    "user-read-private",
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-public",
    "playlist-modify-private",
    "user-library-read",
    "user-top-read",
].join(" ")

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Spotify({
            clientId: process.env.AUTH_SPOTIFY_ID,
            clientSecret: process.env.AUTH_SPOTIFY_SECRET,
            authorization: `https://accounts.spotify.com/authorize?scope=${scopes}`,
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token
                token.refreshToken = account.refresh_token
                token.expiresAt = account.expires_at
            }
            return token
        },
        async session({ session, token }: { session: any; token: any }) {
            session.accessToken = token.accessToken
            return session
        },
    },
})
