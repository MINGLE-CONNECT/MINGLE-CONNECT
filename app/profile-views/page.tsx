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

    const { data: views, error } = await c
      .from('profile_views')
      .select('id, viewer_id, viewed_at')
      .eq('viewed_user_id', user.id)
      .order('viewed_at', { ascending: false })

    if (error) {
      console.error('Profile views error:', error)
      setLoading(false)
      return
    }

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
          display_name: profile?.display_name || 'Mingle Member',
          photo,
          viewed_at: view.viewed_at,
        }
      })
    )

    setViewers(results)
    setLoading(false)
  }

  function formatViewedAt(date: string) {
    const viewedDate = new Date(date)
    const now = new Date()

    const difference = now.getTime() - viewedDate.getTime()
    const minutes = Math.floor(difference / 60000)

    if (minutes < 1) {
      return 'Just now'
    }

    if (minutes < 60) {
      return `${minutes} min${minutes === 1 ? '' : 's'} ago`
    }

    const hours = Math.floor(minutes / 60)

    if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`
    }

    const days = Math.floor(hours / 24)

    if (days < 7) {
      return `${days} day${days === 1 ? '' : 's'} ago`
    }

    return viewedDate.toLocaleDateString([], {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <main className="profile-views-page">

      <header className="profile-views-header">

        <Link
          href="/dashboard"
          className="profile-views-back"
          aria-label="Back"
        >
          ←
        </Link>

        <div className="profile-views-title-area">
          <div className="profile-views-title">
            <span>👁️</span>
            <h1>Profile Views</h1>
          </div>

          <p>
            People who viewed your profile
          </p>
        </div>

      </header>

      <section className="profile-views-summary">

        <div className="profile-views-summary-icon">
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

      <section className="profile-views-info">
        <span>💗</span>

        <p>
          When someone checks out your profile,
          they'll appear here.
        </p>
      </section>

      {loading ? (

        <div className="profile-views-empty">
          <div>⏳</div>
          <h2>Loading views...</h2>
        </div>

      ) : viewers.length === 0 ? (

        <div className="profile-views-empty">

          <div className="profile-views-empty-icon">
            👀
          </div>

          <h2>No profile views yet</h2>

          <p>
            When someone views your profile,
            their visit will appear here.
          </p>

          <Link
            href="/discover"
            className="profile-views-discover"
          >
            Discover People
          </Link>

        </div>

      ) : (

        <section className="profile-views-list">

          <div className="profile-views-list-heading">
            <h2>Recent viewers</h2>
            <span>{viewers.length}</span>
          </div>

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

                <strong>
                  {viewer.display_name}
                </strong>

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
