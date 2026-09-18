'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'

type Viewer = {
  id: string
  display_name: string
  photo: string | null
  viewed_at: string
}

export default function ProfileViewsPage() {
  const [viewers, setViewers] = useState<Viewer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfileViews()
  }, [])

  async function loadProfileViews() {
    const c = createClient()

    const {
      data: { user },
    } = await c.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    const { data: views } = await c
      .from('profile_views')
      .select('id, viewer_id, viewed_at')
      .eq('viewed_user_id', user.id)
      .order('viewed_at', { ascending: false })

    if (!views || views.length === 0) {
      setViewers([])
      setLoading(false)
      return
    }

    const results = await Promise.all(
      views.map(async (view) => {
        const { data: profile } = await c
          .from('profiles')
          .select('id, display_name')
          .eq('id', view.viewer_id)
          .maybeSingle()

        const { data: photoData } = await c
          .from('profile_photos')
          .select('storage_path')
          .eq('user_id', view.viewer_id)
          .order('sort_order', { ascending: true })
          .limit(1)

        let photo: string | null = null

        if (photoData && photoData.length > 0) {
          const { data } = c.storage
            .from('profile-photos')
            .getPublicUrl(photoData[0].storage_path)

          photo = data.publicUrl
        }

        return {
          id: view.viewer_id,
          display_name: profile?.display_name || 'Mingle member',
          photo,
          viewed_at: view.viewed_at,
        }
      })
    )

    setViewers(results)
    setLoading(false)
  }

  function formatViewedAt(date: string) {
    return new Date(date).toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  return (
    <main className="profile-views-page">

      <header className="profile-views-header">
        <Link href="/" className="profile-views-back">
          ←
        </Link>

        <div>
          <h1>Profile Views</h1>
          <p>See who has been checking you out 👀</p>
        </div>
      </header>

      <section className="profile-views-count">
        <div className="profile-views-count-icon">
          👁️
        </div>

        <div>
          <strong>{viewers.length}</strong>
          <span>
            {viewers.length === 1
              ? 'person viewed your profile'
              : 'people viewed your profile'}
          </span>
        </div>
      </section>

      {loading ? (
        <div className="profile-views-empty">
          <div className="profile-views-empty-icon">⏳</div>
          <h2>Loading views...</h2>
          <p>Checking who has viewed your profile.</p>
        </div>
      ) : viewers.length === 0 ? (
        <div className="profile-views-empty">
          <div className="profile-views-empty-icon">
            👀
          </div>

          <h2>No profile views yet</h2>

          <p>
            When someone checks out your profile,
            they will appear here.
          </p>

          <Link href="/discover" className="profile-views-discover">
            Discover People
          </Link>
        </div>
      ) : (
        <section className="profile-views-list">

          <h2>People who viewed you</h2>

          {viewers.map((viewer) => (
            <Link
              key={viewer.id}
              href={`/view-profile/${viewer.id}`}
              className="profile-view-card"
            >

              <div className="profile-view-avatar">
                {viewer.photo ? (
                  <img
                    src={viewer.photo}
                    alt={viewer.display_name}
                  />
                ) : (
                  <span>👤</span>
                )}
              </div>

              <div className="profile-view-info">
                <strong>{viewer.display_name}</strong>

                <small>
                  Viewed {formatViewedAt(viewer.viewed_at)}
                </small>
              </div>

              <span className="profile-view-arrow">
                ›
              </span>

            </Link>
          ))}

        </section>
      )}

    </main>
  )
}
