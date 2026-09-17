'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'

type Photo = {
  id: string
  storage_path: string
  sort_order: number
}

export default function Profile() {
  const [uid, setUid] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')

  const [photos, setPhotos] = useState<Photo[]>([])

  const [f, setF] = useState({
    display_name: '',
    date_of_birth: '',
    gender: '',
    interested_in: '',
    location: '',
    bio: '',
latitude: null as number | null,
longitude: null as number | null

  })
const profileCompletion = [
  f.display_name.trim(),
  f.date_of_birth,
  f.gender,
  f.interested_in,
  f.location.trim(),
  f.bio.trim(),
  photos.length >= 2 ? 'photos' : ''
].filter(Boolean).length

const completionPercent = Math.round(
  (profileCompletion / 7) * 100
)
  useEffect(() => {
    ;(async () => {
      const c = createClient()
      const { data: { user } } = await c.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      setUid(user.id)

      const { data } = await c
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (data) {
        setF({
          display_name: data.display_name || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          interested_in: data.interested_in || '',
          location: data.location || '',
          bio: data.bio || ''
        })
      }

      await loadPhotos(user.id)
      setLoading(false)
    })()
  }, [])

  async function loadPhotos(id: string) {
    const c = createClient()

    const { data } = await c
      .from('profile_photos')
      .select('*')
      .eq('user_id', id)
      .order('sort_order')

    if (data) setPhotos(data)
  }

  function setField(key: string, value: string) {
    setF(x => ({ ...x, [key]: value }))
  }

  async function save(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg('')

    const age = Math.floor(
      (Date.now() - new Date(f.date_of_birth).getTime()) /
      31557600000
    )

    if (age < 18) {
      setMsg('You must be 18 or older to use Mingle-Connect.')
      setSaving(false)
      return
    }

    const { error } = await createClient()
      .from('profiles')
      .update({
        ...f,
        updated_at: new Date().toISOString()
      })
      .eq('id', uid)

    setMsg(
      error
        ? 'Could not save: ' + error.message
        : 'Profile saved successfully! ❤️'
    )

    setSaving(false)
  } 
  async function getMyLocation() {
  if (!navigator.geolocation) {
    setMsg('Location is not supported on this device.')
    return
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      setF(x => ({
        ...x,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }))

      setMsg('📍 Location captured. Tap Save Profile to save it.')
    },
    error => {
      if (error.code === 1) {
        setMsg('Please allow location access in your browser.')
      } else {
        setMsg('Could not get your location. Please try again.')
      }
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000,
    }
  )
}
async function upload(e: ChangeEvent<HTMLInputElement>) {
  const files = Array.from(e.target.files || [])

  if (!files.length) return

  if (photos.length + files.length > 6) {
    setMsg('You can have a maximum of 6 photos.')
    return
  }

  setUploading(true)
  setMsg('Uploading your photo... ❤️')

  try {
    const c = createClient()

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setMsg('Only image files are allowed.')
        break
      }

      if (file.size > 5 * 1024 * 1024) {
        setMsg('Each photo must be 5MB or smaller.')
        break
      }

      const safeName = file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        '_'
      )

      const path =
        `${uid}/${Date.now()}-${safeName}`

      const { error } = await c
        .storage
        .from('profile-photos')
        .upload(path, file, {
          upsert: false
        })

      if (error) {
        setMsg('Upload failed: ' + error.message)
        break
      }

      const { error: dbError } = await c
        .from('profile_photos')
        .insert({
          user_id: uid,
          storage_path: path,
          sort_order: photos.length
        })

      if (dbError) {
        await c.storage
          .from('profile-photos')
          .remove([path])

        setMsg(
          'Photo uploaded but could not be saved: ' +
          dbError.message
        )
        break
      }

      await loadPhotos(uid)
      setMsg('Photo added successfully! ❤️')
    }
  } catch (error) {
    setMsg(
      'Something went wrong: ' +
      (error instanceof Error ? error.message : String(error))
    )
  } finally {
    setUploading(false)
    e.target.value = ''
  }
  }

  
      

  async function removePhoto(photo: Photo) {
    const c = createClient()

    await c.storage
      .from('profile-photos')
      .remove([photo.storage_path])

    await c
      .from('profile_photos')
      .delete()
      .eq('id', photo.id)

    await loadPhotos(uid)
  }

  function photoUrl(path: string) {
    return createClient()
      .storage
      .from('profile-photos')
      .getPublicUrl(path)
      .data.publicUrl
  }

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">
          Loading your profile... ❤️
        </div>
      </main>
    )
  }

  return (
    <main className="profile-page">

      <header className="profile-header">
        <a href="/dashboard" className="profile-back">
          ←
        </a>

        <div>
          <strong>Mingle-Connect</strong>
          <small>Your Dating Profile</small>
        </div>

        <span>♡</span>
      </header>

      <section className="profile-card">

        <div className="profile-title">
          <div className="profile-heart">♡</div>

          <h1>Create Your Profile</h1>

          <p>
            Let people know the real you. ❤️
          </p>
        </div>
        <div className="profile-completion">
  <div className="completion-header">
    <strong>Your profile is {completionPercent}% complete ❤️</strong>
    <span>{profileCompletion}/7</span>
  </div>

  <div className="completion-bar">
    <div
      className="completion-fill"
      style={{ width: `${completionPercent}%` }}
    />
  </div>

  <p>
    {completionPercent === 100
      ? 'Your profile is complete! You are ready to connect. 💕'
      : 'Complete your profile to help people get to know you better.'}
  </p>
</div>

        <form onSubmit={save}>

          <section className="profile-section">

            <h2>📸 Your Photos</h2>

            <p className="section-help">
              Add clear photos so people can see who you are.
            </p>

            <div className="profile-photo-grid">

              {photos.map(photo => (
                <div className="profile-photo" key={photo.id}>

                  <img
                    src={photoUrl(photo.storage_path)}
                    alt="Your profile"
                  />

                  <button
                    type="button"
                    onClick={() => removePhoto(photo)}
                    className="remove-photo"
                  >
                    ×
                  </button>

                </div>
              ))}

              {photos.length < 6 && (
                <label className="add-photo">

                  <span>＋</span>
                  <strong>Add Photo</strong>
                  <small>
                    {photos.length}/6
                  </small>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={upload}
                    disabled={uploading}
                  />

                </label>
              )}

            </div>

            <small className="photo-note">
              Maximum 6 photos • 5MB each
            </small>

          </section>

          <section className="profile-section">

            <h2>💕 About You</h2>

            <div className="profile-form">

              <label>
                Your name
                <input
                  value={f.display_name}
                  onChange={e =>
                    setField('display_name', e.target.value)
                  }
                  placeholder="What should people call you?"
                  required
                />
              </label>

              <label>
                Date of birth
                <input
                  type="date"
                  value={f.date_of_birth}
                  onChange={e =>
                    setField('date_of_birth', e.target.value)
                  }
                  required
                />
              </label>

              <label>
                Gender
                <select
                  value={f.gender}
                  onChange={e =>
                    setField('gender', e.target.value)
                  }
                  required
                >
                  <option value="">Choose your gender</option>
                  <option>Man</option>
                  <option>Woman</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </select>
              </label>

              <label>
                Interested in
                <select
                  value={f.interested_in}
                  onChange={e =>
                    setField('interested_in', e.target.value)
                  }
                  required
                >
                  <option value="">Who are you interested in?</option>
                  <option>Men</option>
                  <option>Women</option>
                  <option>Everyone</option>
                </select>
              </label>

              <label>
                Location
                <input
                  value={f.location}
                  onChange={e =>
                    setField('location', e.target.value)
                  }
                  placeholder="City or area"
                />
                <button
  type="button"
  onClick={getMyLocation}
>
  📍 Use My Location
</button>
              </label>

              <label>
                About me
                <textarea
                  value={f.bio}
                  onChange={e =>
                    setField('bio', e.target.value)
                  }
                  placeholder="Tell people something interesting about you..."
                  maxLength={500}
                  rows={5}
                />

                <small>
                  {f.bio.length}/500
                </small>
              </label>

            </div>

          </section>

          <button
            className="save-profile-button"
            disabled={saving || uploading}
          >
            {saving
              ? 'Saving your profile...'
              : 'Save My Profile  ❤️'}
          </button>

          {msg && (
            <div className="profile-message">
              {msg}
            </div>
          )}

        </form>

      </section>

      <nav className="bottom-nav">
        <a href="/dashboard">
          <span>🏠</span>
          <small>Home</small>
        </a>

        <a href="/discover">
          <span>🔍</span>
          <small>Discover</small>
        </a>

        <a href="/matches">
          <span>💬</span>
          <small>Messages</small>
        </a>

        <a href="/matches">
          <span>❤️</span>
          <small>Matches</small>
        </a>

        <a href="/profile" className="active">
          <span>👤</span>
          <small>Profile</small>
        </a>
      </nav>

    </main>
  )
}
