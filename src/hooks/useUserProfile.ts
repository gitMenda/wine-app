import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

type UserProfile = {
  id: string
  email: string
  name: string
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setError(null)

      // Get the current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        setError(userError.message)
        setLoading(false)
        return
      }

      if (!user) {
        setError("No user logged in")
        setLoading(false)
        return
      }

      // Query your profiles table for this user's info
      console.log("Fetching profile for user:", user.id)
      const { data, error: profileError } = await supabase
        .from("users")
        .select("id, email, name, onboarding_completed")
        .eq("id", user.id)
        .single()

      if (profileError) {
        setError(profileError.message)
        setProfile(null)
      } else {
        console.log("Fetched profile:", data)
        setProfile(data)
      }

      setLoading(false)
    }

    fetchProfile()
  }, [])

  return { profile, loading, error }
}
