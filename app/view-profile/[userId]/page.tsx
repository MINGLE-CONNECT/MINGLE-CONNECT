'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

type Profile = {
  id: string
  display_name: string
  date_of_birth: string | null
  gender: string | null
  interested_in: string | null
  location: string | null
  bio: string | null
}

type Photo = {
  id: string
  storage_path: string
  sort_order: number
}

export default function ViewProfile() {
  const params = useParams()
  const userId = String(params.userId)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [userId])

  async function loadProfile() {
    const c = createClient()

      const { error: viewError } = await c.rpc(
  'record_profile_view',
  {
    p_viewed_user_id: userId,
  }
)

if (viewError) {
  console.error('Profile view error:', viewError)
}
    const { data: profileData } = await c
      .from('profiles')
      .select(
        'id, display_name, date_of_birth, gender, interested_in, location, bio'
      )
      .eq('id', userId)
      .maybeSingle()

    if (!profileData) {
      setLoading(false)
      return
    }

    setProfile(profileData)

    const { data: photoData } = await c
      .from('profile_photos')
      .select('id, storage_path, sort_order')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true })

    
      const photoUrls =
  (photoData as Photo[] | null)?.map(photo => {
    const { data } = c
      .storage
      .from('profile-photos')
      .getPublicUrl(photo.storage_path, {
        transform: {
          width: 600,
          resize: 'contain',
          quality: 70,
        },
      })

    return data.publicUrl
  }) || []

    setPhotos(photoUrls)
    setLoading(false)
  }

  function calculateAge(dateOfBirth: string | null) {
    if (!dateOfBirth) return ''

    const today = new Date()
    const birth = new Date(dateOfBirth)

    let age = today.getFullYear() - birth.getFullYear()

    const monthDifference =
      today.getMonth() - birth.getMonth()

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birth.getDate())
    ) {
      age--
    }

    return age
  }

  if (loading) {
    return (
      <main className="view-profile-page">
        <div className="view-profile-loading">
          Opening profile... ❤️
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="view-profile-page">
        <div className="view-profile-not-found">
          <div>😕</div>
          <h2>Profile not found</h2>

          <Link href="/messages">
            ← Back to Messages
          </Link>
        </div>
      </main>
    )
  }

  const age = calculateAge(profile.date_of_birth)

  return (
    <main className="view-profile-page">

      <header className="view-profile-header">

        <Link
          href={`/messages/${userId}`}
          className="view-profile-back"
        >
          ←
        </Link>

        <div>
          <strong>{profile.display_name}</strong>
          <small>Profile</small>
        </div>

        <span>❤️</span>

      </header>

      <section className="view-profile-content">

        <div className="view-profile-photos">

          {photos.length > 0 ? (

            photos.map((photo, index) => (

              <div
                key={photo}
                className={
                  index === 0
                    ? 'view-profile-photo main-photo'
                    : 'view-profile-photo'
                }
              >

                <img
                  src={photo}
                  alt={`${profile.display_name} photo`}
                />

              </div>

            ))

          ) : (

            <div className="view-profile-no-photo">
              👤
            </div>

          )}

        </div>

        <div className="view-profile-info">

          <h1>
            {profile.display_name}
            {age ? `, ${age}` : ''}
          </h1>

          {profile.location && (
            <p className="view-profile-location">
              📍 {profile.location}
            </p>
          )}

          <div className="view-profile-details">

            {profile.gender && (
              <div className="profile-detail">
                <span>👤</span>
                <div>
                  <small>Gender</small>
                  <strong>{profile.gender}</strong>
                </div>
              </div>
            )}

            {profile.interested_in && (
              <div className="profile-detail">
                <span>❤️</span>
                <div>
                  <small>Interested in</small>
                  <strong>{profile.interested_in}</strong>
                </div>
              </div>
            )}

          </div>

          <div className="view-profile-bio">

            <h2>About {profile.display_name}</h2>

            <p>
              {profile.bio ||
                'This person has not added a bio yet.'}
            </p>

          </div>

        </div>

      </section>

    </main>
  )
}
