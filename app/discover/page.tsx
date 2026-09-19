'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'

type Person = {
  id: string
  display_name: string
  date_of_birth: string
  gender: string
  interested_in: string
  location: string
  country: string
  languages: string[]
  bio: string
  latitude?: number | null
  longitude?: number | null
  boosted?: boolean
  distanceKm?: number | null
  last_seen?: string | null
}

type Photo = {
  storage_path: string
  sort_order: number
}

export default function Discover() {
  const [people, setPeople] = useState<Person[]>([])
  const [photos, setPhotos] = useState<Record<string, Photo[]>>({})
  const [photoIndex, setPhotoIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
   const [canDirectMessage, setCanDirectMessage] = useState(false)
  const [countryFilter, setCountryFilter] = useState('')
const [languageFilter, setLanguageFilter] = useState('')
  const c = createClient()

  useEffect(() => {
    loadPeople()
  }, [countryFilter, languageFilter])

  async function loadPeople() {
    setLoading(true)
    try { 
    setMsg('')
    setPhotoIndex(0)

    const {
      data: { user }
    } = await c.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    const { data: likes } = await c
      .from('likes')
      .select('liked_id')
      .eq('liker_id', user.id)

    const liked = new Set(
      (likes || []).map((x: any) => x.liked_id)
    )

    const { data: profiles, error } = await c
  .from('profiles')
  .select('id,display_name,date_of_birth,gender,interested_in,location,country,languages,bio,latitude,longitude,last_seen')
      

    if (error) {
      setMsg(error.message)
      setLoading(false)
      return
    }

    const { data: boosts } = await c
      .from('boosts')
      .select('user_id,expires_at')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())

    const boostedUsers = new Set(
      (boosts || []).map((x: any) => x.user_id)
     );
    setCanDirectMessage(
  (boosts || []).some((x: any) => x.user_id === user.id)
);
     
    const { data: myProfile } = await c
  .from('profiles')
  .select('latitude,longitude')
  .eq('id', user.id)
  .maybeSingle()

const myLat = myProfile?.latitude
const myLng = myProfile?.longitude

function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const candidates: Person[] = (profiles || [])
  .filter((p: Person) => !liked.has(p.id))
.map((p: Person) => ({
  ...p,
  boosted: boostedUsers.has(p.id),
  distanceKm:
    myLat != null &&
    myLng != null &&
    p.latitude != null &&
    p.longitude != null
      ? distanceKm(
          myLat,
          myLng,
          p.latitude,
          p.longitude
        )
      : undefined
}))
  .filter((p: Person) =>
  (!countryFilter || p.country === countryFilter) &&
  (!languageFilter || p.languages?.includes(languageFilter))
)
  .sort((a: Person, b: Person) => {
    const boostedDifference =
      Number(Boolean(b.boosted)) -
      Number(Boolean(a.boosted))

    if (boostedDifference !== 0) {
      return boostedDifference
    }

    if (
      myLat == null ||
      myLng == null ||
      a.latitude == null ||
      a.longitude == null ||
      b.latitude == null ||
      b.longitude == null
    ) {
      return 0
    }

    const distanceA = distanceKm(
      myLat,
      myLng,
      a.latitude,
      a.longitude
    )

    const distanceB = distanceKm(
      myLat,
      myLng,
      b.latitude,
      b.longitude
    )

    return distanceA - distanceB
  })

    
const userIds = candidates.map((person) => person.id)

const { data: photosData } = await c
  .from('profile_photos')
  .select('user_id,storage_path,sort_order')
  .in('user_id', userIds)
  .order('sort_order')

const photoMap: Record<string, Photo[]> = {}

for (const photo of photosData || []) {
  if (!photoMap[photo.user_id]) {
    photoMap[photo.user_id] = []
  }

  photoMap[photo.user_id].push({
    storage_path: photo.storage_path,
    sort_order: photo.sort_order,
  })
}

setPhotos(photoMap)
setPeople(candidates)
} catch (error) {
  console.error("Discover load error:", error)
  setMsg(error instanceof Error ? error.message : "Failed to load people")
} finally {
  setLoading(false)
}
}
  

  function age(date: string) {
    if (!date) return ''

    const dob = new Date(date)

    let years =
      new Date().getFullYear() -
      dob.getFullYear()

    const month =
      new Date().getMonth() -
      dob.getMonth()

    if (
      month < 0 ||
      (month === 0 &&
        new Date().getDate() < dob.getDate())
    ) {
      years--
    }

    return years
  }
function isOnline(lastSeen?: string | null) {
  if (!lastSeen) return false

  const difference = Date.now() - new Date(lastSeen).getTime()

  return difference < 90000
}

function lastSeenText(lastSeen?: string | null) {
  if (!lastSeen) return 'Last seen unavailable'

  const seconds = Math.floor(
    (Date.now() - new Date(lastSeen).getTime()) / 1000
  )

  if (seconds < 90) return 'Online'

  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `Last seen ${minutes} min ago`
  }

  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600)
    return `Last seen ${hours} hr ago`
  }

  const days = Math.floor(seconds / 86400)
  return `Last seen ${days} day${days === 1 ? '' : 's'} ago`
}
  function photoUrl(path: string) {
  return c
    .storage
    .from('profile-photos')
    .getPublicUrl(path, {
      transform: {
        width: 600,
        resize: 'contain',
        quality: 70,
      },
    })
    .data.publicUrl
}

  async function like(target: Person) {
    const {
      data: { user }
    } = await c.auth.getUser()

    if (!user) return

    setMsg('')

    const { error } = await c
      .from('likes')
      .insert({
        liker_id: user.id,
        liked_id: target.id
      })

    if (error) {
      setMsg(error.message)
      return
    }
const { data: mutualLike } = await c
  .from('likes')
  .select('id')
  .eq('liker_id', target.id)
  .eq('liked_id', user.id)
  .maybeSingle()

if (mutualLike) {
  const { error: matchError } = await c
    .from('matches')
    .upsert(
      {
        user_id: user.id,
        other_id: target.id,
      },
      {
        onConflict: 'user_id,other_id',
      }
    )

  if (matchError) {
    setMsg(matchError.message)
    return
  }

  const { error: reverseMatchError } = await c
    .from('matches')
    .upsert(
      {
        user_id: target.id,
        other_id: user.id,
      },
      {
        onConflict: 'user_id,other_id',
      }
    )
if (reverseMatchError) {
  setMsg(reverseMatchError.message)
  return
}

setPeople(prev =>
  prev.filter(x => x.id !== target.id)
)

setPhotoIndex(0)
}


  function pass(target: Person) {
    setPeople(prev =>
      prev.filter(x => x.id !== target.id)
    )

    setPhotoIndex(0)
  }

  function nextPhoto() {
    const person = people[0]

    if (!person) return

    const list = photos[person.id] || []

    if (list.length > 1) {
      setPhotoIndex(
        index => (index + 1) % list.length
      )
    }
  }

  function previousPhoto() {
    const person = people[0]

    if (!person) return

    const list = photos[person.id] || []

    if (list.length > 1) {
      setPhotoIndex(
        index =>
          (index - 1 + list.length) %
          list.length
      )
    }
  }
 function handleTouchStart(e: React.TouchEvent) {
  setTouchStartX(e.touches[0].clientX)
}

function handleTouchEnd(e: React.TouchEvent) {
  if (touchStartX === null) return

  const touchEndX = e.changedTouches[0].clientX
  const distance = touchStartX - touchEndX

  if (Math.abs(distance) > 50) {
    if (distance > 0) {
      nextPhoto()
    } else {
      previousPhoto()
    }
  }

  setTouchStartX(null)

  if (loading) {
    return (
      <main className="discover-page">
        <div className="discover-loading">
          Finding people for you... ❤️
        </div>
      </main>
    )
  }

  const person = people[0]
  const personPhotos = person
    ? photos[person.id] || []
    : []

  const currentPhoto =
    personPhotos[photoIndex]

  return (
    <main className="discover-page">

      <header className="discover-header">

        <a
          href="/dashboard"
          className="discover-back"
        >
          ←
        </a>

        <div>
          <strong>Mingle-Connect</strong>
          <small>Discover People</small>
        </div>

        <span>♡</span>

      </header>

      <section className="discover-content">

        <div className="discover-heading">

          <h1>
            Find Your Connection ❤️
          </h1>

          <p>
            Someone special could be one swipe away.
          </p>

        </div>
<div className="discover-filters">
  <select
    value={countryFilter}
    onChange={e => setCountryFilter(e.target.value)}
  >
    <option value="">🌍 All Countries</option>
    <option value="Nigeria">Nigeria</option>
    <option value="Ghana">Ghana</option>
    <option value="Kenya">Kenya</option>
    <option value="South Africa">South Africa</option>
    <option value="United States">United States</option>
    <option value="Canada">Canada</option>
    <option value="United Kingdom">United Kingdom</option>
    <option value="Australia">Australia</option>
    <option value="New Zealand">New Zealand</option>
    <option value="France">France</option>
    <option value="Germany">Germany</option>
    <option value="Italy">Italy</option>
    <option value="Spain">Spain</option>
    <option value="Portugal">Portugal</option>
    <option value="Netherlands">Netherlands</option>
    <option value="Belgium">Belgium</option>
    <option value="Switzerland">Switzerland</option>
    <option value="Austria">Austria</option>
    <option value="Sweden">Sweden</option>
    <option value="Norway">Norway</option>
    <option value="Denmark">Denmark</option>
    <option value="Finland">Finland</option>
    <option value="Ireland">Ireland</option>
    <option value="Poland">Poland</option>
    <option value="Greece">Greece</option>
    <option value="Turkey">Turkey</option>
    <option value="Russia">Russia</option>
    <option value="Ukraine">Ukraine</option>
    <option value="United Arab Emirates">United Arab Emirates</option>
    <option value="Saudi Arabia">Saudi Arabia</option>
    <option value="Qatar">Qatar</option>
    <option value="Kuwait">Kuwait</option>
    <option value="India">India</option>
    <option value="Pakistan">Pakistan</option>
    <option value="Bangladesh">Bangladesh</option>
    <option value="China">China</option>
    <option value="Japan">Japan</option>
    <option value="South Korea">South Korea</option>
    <option value="Singapore">Singapore</option>
    <option value="Malaysia">Malaysia</option>
    <option value="Indonesia">Indonesia</option>
    <option value="Philippines">Philippines</option>
    <option value="Thailand">Thailand</option>
    <option value="Vietnam">Vietnam</option>
    <option value="Brazil">Brazil</option>
    <option value="Argentina">Argentina</option>
    <option value="Mexico">Mexico</option>
    <option value="Colombia">Colombia</option>
    <option value="Chile">Chile</option>
    <option value="Peru">Peru</option>
    <option value="Egypt">Egypt</option>
    <option value="Morocco">Morocco</option>
    <option value="Algeria">Algeria</option>
    <option value="Tunisia">Tunisia</option>
    <option value="Ethiopia">Ethiopia</option>
    <option value="Uganda">Uganda</option>
    <option value="Tanzania">Tanzania</option>
    <option value="Rwanda">Rwanda</option>
    <option value="Zimbabwe">Zimbabwe</option>
    <option value="Zambia">Zambia</option>
    <option value="Cameroon">Cameroon</option>
    <option value="Ivory Coast">Ivory Coast</option>
    <option value="Senegal">Senegal</option>
    <option value="Sierra Leone">Sierra Leone</option>
    <option value="Liberia">Liberia</option>
    <option value="Benin">Benin</option>
    <option value="Togo">Togo</option>
    <option value="Mali">Mali</option>
    <option value="Niger">Niger</option>
  </select>

  <select
    value={languageFilter}
    onChange={e => setLanguageFilter(e.target.value)}
  >
    <option value="">🗣️ All Languages</option>
    <option value="English">English</option>
    <option value="French">French</option>
    <option value="Spanish">Spanish</option>
    <option value="Portuguese">Portuguese</option>
    <option value="German">German</option>
    <option value="Italian">Italian</option>
    <option value="Arabic">Arabic</option>
    <option value="Chinese">Chinese</option>
    <option value="Japanese">Japanese</option>
    <option value="Korean">Korean</option>
    <option value="Hindi">Hindi</option>
    <option value="Russian">Russian</option>
    <option value="Igbo">Igbo</option>
    <option value="Yoruba">Yoruba</option>
    <option value="Hausa">Hausa</option>
    <option value="Swahili">Swahili</option>
    <option value="Dutch">Dutch</option>
    <option value="Turkish">Turkish</option>
    <option value="Polish">Polish</option>
    <option value="Greek">Greek</option>
    <option value="Hebrew">Hebrew</option>
    <option value="Thai">Thai</option>
    <option value="Vietnamese">Vietnamese</option>
    <option value="Malay">Malay</option>
  </select>
</div>
        {msg && (
          <div className="discover-message">
            {msg}
          </div>
        )}

        {!person ? (

          <div className="empty-discover">

            <div className="empty-heart">
              ♡
            </div>

            <h2>
              No more people right now
            </h2>

            <p>
              Check back later for new people
              joining Mingle-Connect.
            </p>

            <button
              onClick={loadPeople}
              className="discover-refresh"
            >
              Find More People ❤️
            </button>

          </div>

        ) : (

          <article className="person-card">

            {person.boosted && (
              <div className="boosted-badge">
                ⭐ Boosted Profile
              </div>
            )}

            <div className="photo-counter">
              {personPhotos.length > 0
                ? `${photoIndex + 1}/${personPhotos.length}`
                : '♡'}
            </div>

            <div
  className="person-photo"
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
>

              {currentPhoto ? (

                <>

                  <Link href={`/view-profile/${person.id}`}>
  <img
  src={photoUrl(
    currentPhoto.storage_path
  )}
  alt={person.display_name}
  loading="lazy"
  decoding="async"
/>
</Link>

                  {personPhotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="photo-arrow photo-left"
                        onClick={previousPhoto}
                        aria-label="Previous photo"
                      >
                        ‹
                      </button>

                      <button
                        type="button"
                        className="photo-arrow photo-right"
                        onClick={nextPhoto}
                        aria-label="Next photo"
                      >
                        ›
                      </button>

                      <div className="photo-dots">
                        {personPhotos.map(
                          (_, index) => (
                            <span
                              key={index}
                              className={
                                index === photoIndex
                                  ? 'photo-dot active'
                                  : 'photo-dot'
                              }
                            />
                          )
                        )}
                      </div>
                    </>
                  )}

                </>

              ) : (

                <div className="no-photo">

                  <span>♡</span>

                  <strong>
                    No photo yet
                  </strong>

                  <small>
                    Maybe they're just getting started.
                  </small>

                </div>

              )}

            </div>

            <div className="person-info">

              <div className="person-name-row">

                <div>

                  <Link
  href={`/view-profile/${person.id}`}
  className="person-name-link"
>
  <h2>
    {person.display_name ||
      'Mingle Member'}

    {person.date_of_birth && (
      <span>
        {age(
          person.date_of_birth
        )}
      </span>
    )}
  </h2>
</Link>
<div className="person-presence">
  <span
    className={
      isOnline(person.last_seen)
        ? 'presence-dot online'
        : 'presence-dot offline'
    }
  ></span>

  <span>
    {lastSeenText(person.last_seen)}
  </span>
</div>
                  <p className="person-location">
  📍 {' '}
  {person.location || 'Location not set'}
  {person.distanceKm != null && (
    <span className="distance-away">
      {' • '}
      {person.distanceKm < 1
        ? `${Math.round(person.distanceKm * 1000)} m away`
        : `${person.distanceKm.toFixed(1)} km away`}
    </span>
  )}
</p>

                </div>

                <div className="profile-heart-small">
                  ♡
                </div>

              </div>

              {person.bio ? (

                <p className="person-bio">
                  “{person.bio}”
                </p>

              ) : (

                <p className="person-bio empty-bio">
                  No bio yet. ❤️
                </p>

              )}

              <div className="discover-actions">

                <button
                  className="pass-button"
                  onClick={() =>
                    pass(person)
                  }
                >
                  <span>✕</span>
                  Pass
                </button>
               <button
  type="button"
  className="message-button"
  onClick={() => {
    if (canDirectMessage) {
      window.location.href = `/messages/${person.id}`
    } else {
      window.location.href = '/boost'
    }
  }}
>
  <span>💬</span>
  {canDirectMessage ? 'Message' : 'Boost to Message'}
</button>
                <button
                  className="like-button"
                  onClick={() =>
                    like(person)
                  }
                >
                  <span>♥</span>
                  Like
                </button>

              </div>

              <p className="swipe-hint">
                Choose your feeling ❤️
              </p>

              <div className="safety-actions">

                <a
                  href={`/report?user=${person.id}`}
                  className="report-link"
                >
                  🚩 Report
                </a>

                <button
                  className="block-link"
                  onClick={async () => {

                    const {
                      data: { user }
                    } = await c.auth.getUser()

                    if (!user) return

                    await c
                      .from('blocks')
                      .insert({
                        blocker_id: user.id,
                        blocked_id: person.id
                      })

                    setPeople(prev =>
                      prev.filter(
                        x =>
                          x.id !== person.id
                      )
                    )

                    setPhotoIndex(0)
                  }}
                >
                  🚫 Block
                </button>

              </div>

            </div>

          </article>

        )}

      </section>

      <nav className="bottom-nav">

        <a href="/dashboard">
          <span>🏠</span>
          <small>Home</small>
        </a>

        <a
          href="/discover"
          className="active"
        >
          <span>🔍</span>
          <small>Discover</small>
        </a>

        

        <a href="/matches">
          <span>❤️</span>
          <small>Matches</small>
        </a>

        <a href="/profile">
          <span>👤</span>
          <small>Profile</small>
        </a>

      </nav>

    </main>
  )
}
}  
} 
