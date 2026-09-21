'use client'

import {
  useEffect,
  useState,
} from 'react'

import { createClient } from '../../lib/supabase'

type Section =
  | 'users'
  | 'boosts'
  | 'messages'
  | 'calls'
  | 'reports'

type AdminData = {
  generatedAt: string

  stats: {
 
    users: number
    messages: number
    boosts: number
    activeBoosts: number
    calls: number
    reports: number
    blocks: number
  }

  users: any[]
  boosts: any[]
  messages: any[]
  calls: any[]
  reports: any[]
  blocks: any[]
}

export default function Admin() {

  const [allowed, setAllowed] =
    useState<boolean | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [data, setData] =
    useState<AdminData | null>(null)

  const [activeSection, setActiveSection] =
    useState<Section>('users')

  const [error, setError] =
    useState('')

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {

    const c = createClient()

    const {
      data: {
        user,
      },
    } = await c.auth.getUser()

    if (!user) {
      window.location.href =
        '/login'
      return
    }

    const {
      data: admin,
      error: adminError,
    } = await c
      .from('admin_users')
      .select('user_id')
      .eq(
        'user_id',
        user.id
      )
      .maybeSingle()

    if (adminError) {
      setError(
        adminError.message
      )

      setAllowed(false)
      setLoading(false)

      return
    }

    if (!admin) {
      setAllowed(false)
      setLoading(false)

      return
    }

    setAllowed(true)

    await loadAdminData(
      user.id
    )
  }

  async function loadAdminData(
    userId?: string
  ) {

    try {

      setLoading(true)
      setError('')

      const c = createClient()

      let currentUserId =
        userId

      if (!currentUserId) {

        const {
          data: {
            user,
          },
        } =
          await c.auth.getUser()

        if (!user) {
          window.location.href =
            '/login'

          return
        }

        currentUserId =
          user.id
      }

      const {
        data: {
          session,
        },
      } =
        await c.auth.getSession()

      if (!session?.access_token) {
        setError(
          'Your session has expired. Please log in again.'
        )

        return
      }

      const response =
        await fetch(
          '/api/admin/data',
          {
            method: 'GET',

            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },

            cache: 'no-store',
          }
        )

      const result =
        await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error ||
          'Unable to load admin data.'
        )
      }

      setData(result)

    } catch (err: any) {

      console.error(
        'Admin dashboard error:',
        err
      )

      setError(
        err?.message ||
        'Unable to load admin data.'
      )

    } finally {

      setLoading(false)
    }
  }

  function openSection(
    section: Section
  ) {

    setActiveSection(
      section
    )

    setTimeout(() => {

      document
        .getElementById(
          'admin-data-section'
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })

    }, 50)
  }

  async function refresh() {

    await loadAdminData()
  }

  function userName(
    id: string
  ) {

    const user =
      data?.users.find(
        (item) =>
          item.id === id
      )

    return (
      user?.profile
        ?.display_name ||
      user?.email ||
      id
    )
  }

  function formatDate(
    value: string | null
  ) {

    if (!value)
      return '—'

    return new Date(
      value
    ).toLocaleString()
  }

  if (
    loading &&
    allowed === null
  ) {

    return (
      <main className="admin-page">

        <div className="admin-loading">

          <div className="loading-icon">
            ⚙️
          </div>

          <h2>
            Checking admin access...
          </h2>

          <p>
            Please wait.
          </p>

        </div>

        <AdminStyles />

      </main>
    )
  }

  if (!allowed) {

    return (
      <main className="admin-page">

        <div className="admin-denied">

          <div className="denied-icon">
            🔒
          </div>

          <h1>
            Access denied
          </h1>

          <p>
            This area is restricted
            to Mingle-Connect
            administrators.
          </p>

          <a href="/dashboard">
            Back to dashboard
          </a>

        </div>

        <AdminStyles />

      </main>
    )
  }

  const stats =
    data?.stats || {
      users: 0,
      messages: 0,
      boosts: 0,
      activeBoosts: 0,
      calls: 0,
      reports: 0,
      blocks: 0,
    }

  return (
    <main className="admin-page">

      <AdminStyles />

      {/* HEADER */}

      <header className="admin-header">

        <div>

          <div className="admin-brand">
            Mingle-
            <span>Connect</span>
          </div>

          <small>
            Administrator Control Panel
          </small>

        </div>

        <div className="admin-header-actions">

          <a
            href="/dashboard"
            className="admin-link"
          >
            ← Dashboard
          </a>

          <button
            className="admin-link"
            onClick={refresh}
            type="button"
          >
            ↻ Refresh
          </button>

        </div>

      </header>

      <div className="admin-main">

        {/* TITLE */}

        <section className="admin-title">

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Complete Mingle-Connect
            activity and records.
          </p>

          {data?.generatedAt && (
            <small>
              Last updated:{' '}
              {formatDate(
                data.generatedAt
              )}
            </small>
          )}

        </section>

        {error && (

          <div className="admin-error">
            ⚠️ {error}
          </div>

        )}

        {/* STAT CARDS */}

        <section className="admin-stats">

          <button
            type="button"
            onClick={() =>
              openSection(
                'users'
              )
            }
            className={
              `admin-stat ${
                activeSection ===
                'users'
                  ? 'active'
                  : ''
              }`
            }
          >

            <span className="stat-icon">
              👥
            </span>

            <strong>
              {stats.users}
            </strong>

            <span>
              Registered Users
            </span>

          </button>

          <button
            type="button"
            onClick={() =>
              openSection(
                'messages'
              )
            }
            className={
              `admin-stat ${
                activeSection ===
                'messages'
                  ? 'active'
                  : ''
              }`
            }
          >

            <span className="stat-icon">
              💬
            </span>

            <strong>
              {stats.messages}
            </strong>

            <span>
              Messages
            </span>

          </button>

          <button
            type="button"
            onClick={() =>
              openSection(
                'boosts'
              )
            }
            className={
              `admin-stat ${
                activeSection ===
                'boosts'
                  ? 'active'
                  : ''
              }`
            }
          >

            <span className="stat-icon">
              🚀
            </span>

            <strong>
              {stats.boosts}
            </strong>

            <span>
              All Boosts
            </span>

          </button>

          <button
            type="button"
            onClick={() =>
              openSection(
                'calls'
              )
            }
            className={
              `admin-stat ${
                activeSection ===
                'calls'
                  ? 'active'
                  : ''
              }`
            }
          >

            <span className="stat-icon">
              📞
            </span>

            <strong>
              {stats.calls}
            </strong>

            <span>
              Calls
            </span>

          </button>

          <button
            type="button"
            onClick={() =>
              openSection(
                'reports'
              )
            }
            className={
              `admin-stat ${
                activeSection ===
                'reports'
                  ? 'active'
                  : ''
              }`
            }
          >

            <span className="stat-icon">
              🚩
            </span>

            <strong>
              {stats.reports}
            </strong>

            <span>
              Reports
            </span>

          </button>

        </section>

        {/* ACTIVE BOOST MINI STAT */}

        <div className="active-boost-box">

          🚀 Active boosts:

          <strong>
            {stats.activeBoosts}
          </strong>

          <span>
            &nbsp; | &nbsp;
          </span>

          🚫 Blocks:

          <strong>
            {stats.blocks}
          </strong>

        </div>

        {/* DATA */}

        <section
          id="admin-data-section"
          className="admin-data-section"
        >

          {/* USERS */}

          {activeSection ===
            'users' && (

            <>

              <div className="section-heading">

                <div>

                  <h2>
                    👥 Registered Users
                  </h2>

                  <p>
                    All registered
                    Mingle-Connect
                    accounts.
                  </p>

                </div>

                <button
                  onClick={refresh}
                  type="button"
                >
                  ↻ Refresh
                </button>

              </div>

              {!data?.users.length ? (

                <div className="empty">
                  No registered users found.
                </div>

              ) : (

                <div className="table-wrap">

                  <table>

                    <thead>

                      <tr>
                        <th>
                          User
                        </th>

                        <th>
                          Email
                        </th>

                        <th>
                          Verified
                        </th>

                        <th>
                          Registered
                        </th>

                        <th>
                          Last Sign-in
                        </th>
                      </tr>

                    </thead>

                    <tbody>

                      {data.users.map(
                        (user) => (

                        <tr key={user.id}>

                          <td>

                            <strong>
                              {
                                user
                                  .profile
                                  ?.display_name ||
                                'No name'
                              }
                            </strong>

                            <small>
                              {user.id}
                            </small>

                          </td>

                          <td>
                            {user.email ||
                              '—'}
                          </td>

                          <td>

                            {user.emailConfirmed
                              ? (
                                <span className="verified">
                                  ✓ Verified
                                </span>
                              )
                              : (
                                <span className="not-verified">
                                  Not verified
                                </span>
                              )}

                          </td>

                          <td>
                            {formatDate(
                              user.createdAt
                            )}
                          </td>

                          <td>
                            {formatDate(
                              user.lastSignIn
                            )}
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

            </>

          )}

          {/* BOOSTS */}

          {activeSection ===
            'boosts' && (

            <>

              <div className="section-heading">

                <div>

                  <h2>
                    🚀 Boost Records
                  </h2>

                  <p>
                    Complete boost
                    history, including
                    expired and pending
                    boosts.
                  </p>

                </div>

                <button
                  onClick={refresh}
                  type="button"
                >
                  ↻ Refresh
                </button>

              </div>

              {!data?.boosts.length ? (

                <div className="empty">
                  No boost records found.
                </div>

              ) : (

                <div className="table-wrap">

                  <table>

                    <thead>

                      <tr>

                        <th>
                          User
                        </th>

                        <th>
                          Product
                        </th>

                        <th>
                          Amount
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Started
                        </th>

                        <th>
                          Expires
                        </th>

                        <th>
                          Payment
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {data.boosts.map(
                        (boost) => (

                        <tr
                          key={boost.id}
                        >

                          <td>
                            {userName(
                              boost.user_id
                            )}
                          </td>

                          <td>

                            {boost.product
                              ?.name ||
                              boost.product_id ||
                              '—'}

                          </td>

                          <td>

                            {boost.amount_kobo !=
                            null
                              ? `₦${(
                                  Number(
                                    boost.amount_kobo
                                  ) / 100
                                ).toLocaleString()}`
                              : '—'}

                          </td>

                          <td>

                            <span
                              className={
                                `status ${
                                  boost.status
                                }`
                              }
                            >
                              {boost.status}
                            </span>

                          </td>

                          <td>
                            {formatDate(
                              boost.starts_at
                            )}
                          </td>

                          <td>
                            {formatDate(
                              boost.expires_at
                            )}
                          </td>

                          <td>

                            {boost.payment_reference ||
                              '—'}

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

            </>

          )}

          {/* MESSAGES */}

          {activeSection ===
            'messages' && (

            <>

              <div className="section-heading">

                <div>

                  <h2>
                    💬 Direct Messages
                  </h2>

                  <p>
                    Message activity
                    recorded by the
                    application.
                  </p>

                </div>

                <button
                  onClick={refresh}
                  type="button"
                >
                  ↻ Refresh
                </button>

              </div>

              {!data?.messages.length ? (

                <div className="empty">
                  No messages found.
                </div>

              ) : (

                <div className="table-wrap">

                  <table>

                    <thead>

                      <tr>
                        <th>
                          Sender
                        </th>

                        <th>
                          Recipient
                        </th>

                        <th>
                          Message
                        </th>

                        <th>
                          Date
                        </th>
                      </tr>

                    </thead>

                    <tbody>

                      {data.messages.map(
                        (message) => (

                        <tr
                          key={message.id}
                        >

                          <td>
                            {userName(
                              message.sender_id
                            )}
                          </td>

                          <td>
                            {userName(
                              message.recipient_id
                            )}
                          </td>

                          <td className="message-cell">
                            {message.message}
                          </td>

                          <td>
                            {formatDate(
                              message.created_at
                            )}
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

            </>

          )}

          {/* CALLS */}

          {activeSection ===
            'calls' && (

            <>

              <div className="section-heading">

                <div>

                  <h2>
                    📞 Call Records
                  </h2>

                  <p>
                    Voice and video call
                    records.
                  </p>

                </div>

                <button
                  onClick={refresh}
                  type="button"
                >
                  ↻ Refresh
                </button>

              </div>

              {!data?.calls.length ? (

                <div className="empty">
                  No call records found.
                </div>

              ) : (

                <div className="table-wrap">

                  <table>

                    <thead>

                      <tr>

                        <th>
                          Caller
                        </th>

                        <th>
                          Receiver
                        </th>

                        <th>
                          Type
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Date
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {data.calls.map(
                        (call) => (

                        <tr
                          key={call.id}
                        >

                          <td>
                            {userName(
                              call.caller_id
                            )}
                          </td>

                          <td>
                            {userName(
                              call.receiver_id
                            )}
                          </td>

                          <td>
                            {call.call_type ||
                              '—'}
                          </td>

                          <td>

                            <span
                              className={
                                `status ${
                                  call.status
                                }`
                              }
                            >
                              {call.status}
                            </span>

                          </td>

                          <td>
                            {formatDate(
                              call.created_at
                            )}
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

            </>

          )}

          {/* REPORTS */}

          {activeSection ===
            'reports' && (

            <>

              <div className="section-heading">

                <div>

                  <h2>
                    🚩 Safety Reports
                  </h2>

                  <p>
                    Reports submitted
                    by Mingle-Connect
                    users.
                  </p>

                </div>

                <button
                  onClick={refresh}
                  type="button"
                >
                  ↻ Refresh
                </button>

              </div>

              {!data?.reports.length ? (

                <div className="empty">
                  No reports found.
                </div>

              ) : (

                <div className="report-list">

                  {data.reports.map(
                    (report) => (

                    <article
                      className="report-card"
                      key={report.id}
                    >

                      <div className="report-top">

                        <div>

                          <h3>
                            {report.reason}
                          </h3>

                          <small>
                            {formatDate(
                              report.created_at
                            )}
                          </small>

                        </div>

                        <span
                          className={
                            `status ${
                              report.status
                            }`
                          }
                        >
                          {report.status}
                        </span>

                      </div>

                      <p>
                        {report.details ||
                          'No additional details.'}
                      </p>

                      <div className="report-users">

                        <span>
                          Reporter:{' '}
                          {userName(
                            report.reporter_id
                          )}
                        </span>

                        <span>
                          Reported:{' '}
                          {userName(
                            report.reported_user_id
                          )}
                        </span>

                      </div>

                    </article>

                  ))}

                </div>

              )}

            </>

          )}

        </section>

      </div>

    </main>
  )
}

function AdminStyles() {

  return (
    <style>{`

      * {
        box-sizing: border-box;
      }

      .admin-page {
        min-height: 100vh;
        color: white;

        background:
          radial-gradient(
            circle at 10% 5%,
            rgba(255,0,110,.18),
            transparent 30%
          ),
          radial-gradient(
            circle at 90% 30%,
            rgba(255,0,110,.12),
            transparent 30%
          ),
          #080307;

        padding-bottom: 70px;
      }

      .admin-header {
        position: sticky;
        top: 0;
        z-index: 50;

        min-height: 76px;

        padding: 14px 5%;

        display: flex;
        align-items: center;
        justify-content: space-between;

        gap: 15px;

        background:
          rgba(8,3,7,.97);

        border-bottom:
          1px solid
          rgba(255,35,130,.45);
      }

      .admin-brand {
        font-size: 24px;
        font-weight: 800;
      }

      .admin-brand span {
        color: #ff1985;
      }

      .admin-header small {
        color: #bcaeb7;
      }

      .admin-header-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .admin-link {
        color: white;
        text-decoration: none;

        border:
          1px solid
          rgba(255,80,160,.55);

        border-radius: 20px;

        padding:
          8px 14px;

        background: transparent;

        cursor: pointer;
      }

      .admin-main {
        max-width: 1250px;
        margin: auto;

        padding:
          30px 18px;
      }

      .admin-title h1 {
        margin: 0;
        font-size: 38px;
      }

      .admin-title p {
        color: #cdbfc7;
        margin: 8px 0;
      }

      .admin-title small {
        color: #8f818b;
      }

      .admin-error {
        margin:
          20px 0;

        padding: 14px;

        border:
          1px solid
          rgba(255,80,80,.5);

        border-radius: 12px;

        color: #ffb0b0;

        background:
          rgba(100,0,0,.15);
      }

      .admin-stats {
        display: grid;

        grid-template-columns:
          repeat(5, 1fr);

        gap: 14px;

        margin:
          25px 0 18px;
      }

      .admin-stat {
        appearance: none;

        border:
          1px solid
          rgba(255,65,150,.45);

        border-radius: 20px;

        padding: 20px;

        color: white;

        text-align: left;

        background:
          rgba(30,7,20,.72);

        cursor: pointer;

        transition:
          transform .15s ease,
          border-color .15s ease;
      }

      .admin-stat:hover,
      .admin-stat.active {
        transform:
          translateY(-2px);

        border-color:
          #ff1985;

        background:
          rgba(255,25,133,.12);
      }

      .stat-icon {
        display: block;
        font-size: 28px;
      }

      .admin-stat strong {
        display: block;

        font-size: 30px;

        margin-top: 8px;
      }

      .admin-stat > span:last-child {
        color: #cdbfc7;

        font-size: 13px;
      }

      .active-boost-box {
        margin:
          0 0 30px;

        padding:
          14px 17px;

        border:
          1px solid
          rgba(255,65,150,.3);

        border-radius: 14px;

        color: #cdbfc7;
      }

      .active-boost-box strong {
        color: #ff72ad;
      }

      .admin-data-section {
        scroll-margin-top: 100px;
      }

      .section-heading {
        display: flex;

        align-items: center;

        justify-content: space-between;

        gap: 15px;

        margin-bottom: 18px;
      }

      .section-heading h2 {
        margin: 0;
      }

      .section-heading p {
        color: #bcaeb7;
      }

      .section-heading button {
        color: white;

        border:
          1px solid #ff1985;

        background:
          transparent;

        border-radius: 20px;

        padding:
          8px 15px;

        cursor: pointer;
      }

      .table-wrap {
        width: 100%;

        overflow-x: auto;

        border:
          1px solid
          rgba(255,65,150,.3);

        border-radius: 18px;

        background:
          rgba(20,5,14,.72);
      }

      table {
        width: 100%;

        min-width: 750px;

        border-collapse:
          collapse;
      }

      th,
      td {
        padding:
          14px;

        text-align: left;

        border-bottom:
          1px solid
          rgba(255,255,255,.06);

        vertical-align: top;
      }

      th {
        color: #ff8fbd;

        font-size: 13px;

        white-space: nowrap;

        background:
          rgba(255,25,133,.08);
      }

      td {
        color: #e8e0e5;

        font-size: 13px;
      }

      td strong {
        display: block;
      }

      td small {
        display: block;

        color: #777;

        margin-top: 4px;

        max-width: 170px;

        overflow:
          hidden;

        text-overflow:
          ellipsis;
      }

      .message-cell {
        max-width: 350px;

        white-space:
          normal;

        word-break:
          break-word;
      }

      .verified {
        color: #76e6a2;
      }

      .not-verified {
        color: #ffb36b;
      }

      .status {
        display: inline-block;

        padding:
          5px 10px;

        border-radius: 14px;

        font-size: 12px;

        background:
          rgba(255,255,255,.08);
      }

      .status.active,
      .status.resolved {
        color: #79e5a2;
      }

      .status.pending,
      .status.ringing {
        color: #ffd16b;
      }

      .status.reviewed {
        color: #78cfff;
      }

      .status.expired,
      .status.ended,
      .status.cancelled {
        color: #aaa;
      }

      .empty {
        padding: 40px 20px;

        text-align: center;

        border:
          1px solid
          rgba(255,65,150,.3);

        border-radius: 18px;

        color: #bcaeb7;
      }

      .report-list {
        display: grid;
        gap: 13px;
      }

      .report-card {
        padding: 18px;

        border:
          1px solid
          rgba(255,65,150,.3);

        border-radius: 18px;

        background:
          rgba(255,255,255,.035);
      }

      .report-top {
        display: flex;

        align-items: flex-start;

        justify-content: space-between;

        gap: 15px;
      }

      .report-top h3 {
        margin:
          0 0 5px;
      }

      .report-top small {
        color: #8f818b;
      }

      .report-card p {
        color: #ddd;

        line-height: 1.5;
      }

      .report-users {
        display: flex;

        flex-direction: column;

        gap: 5px;

        color: #aaa;

        font-size: 12px;
      }

      .admin-loading,
      .admin-denied {
        max-width: 500px;

        margin: 120px auto;

        padding: 35px;

        text-align: center;

        border:
          1px solid
          rgba(255,65,150,.45);

        border-radius: 22px;

        background:
          #12050d;
      }

      .loading-icon,
      .denied-icon {
        font-size: 40px;
      }

      .admin-denied a {
        color: #ff72ad;
      }

      @media (max-width: 900px) {

        .admin-stats {
          grid-template-columns:
            repeat(2,1fr);
        }

      }

      @media (max-width: 550px) {

        .admin-header {
          align-items:
            flex-start;

          flex-direction:
            column;
        }

        .admin-title h1 {
          font-size: 30px;
        }

        .admin-stats {
          grid-template-columns:
            1fr 1fr;
        }

        .admin-stat {
          padding: 15px;
        }

        .admin-stat strong {
          font-size: 25px;
        }

        .section-heading {
          align-items:
            flex-start;

          flex-direction:
            column;
        }

      }

    `}</style>
  )
}