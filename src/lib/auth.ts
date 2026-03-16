import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { triggerOnboardingWebhook } from "@/lib/webhook-notify"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'fake-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey)

// Separate client specifically configured to securely use the powerful Service Role Key for Admin APIs
const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'fake-service-key'
)

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || 'mock',
      clientSecret: process.env.GOOGLE_SECRET || 'mock',
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })
        
        if (error || !data.user) {
          throw new Error(error?.message || 'Invalid login credentials')
        }
        
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || '',
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && user.email) {
        const { error } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          email_confirm: true,
          user_metadata: {
            full_name: user.name || '',
            avatar_url: user.image || '',
            provider: account.provider,
          }
        })

        if (error && !error.message.includes('already registered')) {
          console.error("Failed to sync NextAuth user to Supabase Auth:", error.message)
        } else if (!error) {
          // User was successfully created for the first time
          await triggerOnboardingWebhook(user.email, user.name || '')
        }
      }
      return true
    },

    async jwt({ token, account, user }) {
      // On first sign-in, look up or create the real Supabase UUID by email
      if (account && user?.email) {
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
        // Try to find existing
        let supabaseUser = users.find((u: any) => u.email === user.email)
        
        if (!supabaseUser) {
          // If sign-in is successful but user not in Supabase yet (rare race condition)
          // we don't create here to avoid conflicts with the signIn callback, 
          // but we should at least check again or use token.sub as a last resort IF it's a UUID.
        }

        if (supabaseUser) {
          token.supabaseId = supabaseUser.id
        }
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        // Use the real Supabase UUID, fall back to token.sub for credentials login
        ;(session.user as any).id = (token.supabaseId as string) || token.sub
      }
      return session
    }
  },
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-super-secret-1234',
}
