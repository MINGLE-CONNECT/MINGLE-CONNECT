'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'

type Report = {
  id: string
  reporter_id: string
  reported_user_id: string
  reason: string
  details: string | null
  status: string
  created_at: string
}

type Stats = {
  users: number
  messages: number
  activeBoosts: number
  calls: number
  reports: number
}

export default function Admin() {
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<Stats>({
    users: 0,
    messages: 0,
    activeBoosts: 0,
    calls: 0,
    reports: 0,
  })

  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const c = createClient()

    const {
      data: { user },
    } = await c.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    // CHECK ADMIN ACCESS
    const { data: admin } = await c
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!admin) {
      setAllowed(false)
      setLoading(false)
      return
    }

    setAllowed(true)

    const now = new Date().toISOString()

    // LOAD DASHBOARD STATISTICS
    const [
      usersResult,
      messagesResult,
      boostsResult,
      callsResult,
      reportsCountResult,
      reportsResult,
    ] = await Promise.all([
      c
        .from('profiles')
        .select('id', { count: 'exact', head: true }),

      c
        .from('direct_messages')
        .select('id', { count: 'exact', head: true }),

      c
        .from('boosts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .gt('expires_at', now),

      c
        .from('calls')
        .select('id', { count: 'exact', head: true }),

      c
        .from('reports')
        .select('id', { count: 'exact', head: true }),

      c
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    if (reportsResult.error) {
      setMsg(reportsResult.error.message)
    }

    setStats({
      users: usersResult.count || 0,
      messages: messagesResult.count || 0,
      activeBoosts: boostsResult.count || 0,
      calls: callsResult.count || 0,
      reports: reportsCountResult.count || 0,
    })

    setReports((reportsResult.data || []) as Report[])

    setLoading(false)
  }

  // UPDATE REPORT
  async function updateReport(id: string, status: string) {
    const { error } = await createClient()
      .from('reports')
      .update({ status })
      .eq('id', id)

    if (error) {
      setMsg(error.message)
      return
    }

    setReports((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, status }
          : item
      )
    )
  }

  // LOADING
  if (loading || allowed === null) {
    return (
      <main className="admin-page">
        <div className="admin-loading">
          <h2>Checking admin access...</h2>
          <p>Please wait.</p>
        </div>
      </main>
    )
  }

  // ACCESS DENIED
  if (!allowed) {
    return (
      <main className="admin-page">
        <div className="admin-denied">
          <h1>Access denied</h1>

          <p>
            This area is restricted to Mingle-Connect administrators.
          </p>

          <a href="/dashboard">
            Back to dashboard
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="admin-page">

      <style>{`
        .admin-page {
          min-height: 100vh;
          color: #fff;

          background:
            radial-gradient(
              circle at 15% 10%,
              rgba(255, 0, 110, .18),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 35%,
              rgba(255, 0, 110, .12),
              transparent 30%
            ),
            #080307;

          padding-bottom: 60px;
        }

        .admin-page * {
          box-sizing: border-box;
        }

        .admin-header {
          min-height: 76px;

          padding: 14px 5%;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;

          background: rgba(8, 3, 7, .97);

          border-bottom:
            1px solid rgba(255, 35, 130, .45);

          position: sticky;
          top: 0;

          z-index: 20;
        }

        .admin-brand {
          font-size: 24px;
          font-weight: 800;
        }

        .admin-brand span {
          color: #ff1985;
        }

        .admin-header-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .admin-link {
          color: #fff;
          text-decoration: none;

          border:
            1px solid rgba(255, 80, 160, .55);

          border-radius: 20px;

          padding: 8px 14px;

          font-size: 13px;

          background: transparent;
        }

        .admin-link:hover {
          border-color: #ff1985;
        }

        .admin-main {
          max-width: 1200px;

          margin: auto;

          padding: 30px 18px;
        }

        .admin-title h1 {
          margin: 0;

          font-size: 38px;
        }

        .admin-title p {
          color: #cdbfc7;

          margin-top: 8px;
        }

        /* STATISTICS */

        .admin-stats {
          display: grid;

          grid-template-columns:
            repeat(5, 1fr);

          gap: 14px;

          margin:
            25px 0 35px;
        }

        .admin-stat {
          border:
            1px solid rgba(255, 65, 150, .45);

          border-radius: 20px;

          padding: 20px;

          background:
            rgba(30, 7, 20, .72);

          box-shadow:
            0 10px 30px
            rgba(0, 0, 0, .2);
        }

        .admin-stat-icon {
          font-size: 28px;
        }

        .admin-stat strong {
          display: block;

          font-size: 30px;

          margin-top: 8px;
        }

        .admin-stat span {
          color: #cdbfc7;

          font-size: 13px;
        }

        /* NOTICE */

        .admin-notice {
          padding: 13px 15px;

          border:
            1px solid
            rgba(255, 80, 160, .5);

          border-radius: 12px;

          margin-bottom: 18px;

          color: #ffb4d5;
        }

        /* SECTION */

        .admin-section-title {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 10px;

          margin-bottom: 15px;
        }

        .admin-section-title h2 {
          margin: 0;
        }

        .admin-refresh {
          border:
            1px solid #ff1985;

          background: transparent;

          color: white;

          border-radius: 20px;

          padding: 8px 15px;

          cursor: pointer;
        }

        /* REPORTS */

        .report-grid {
          display: grid;

          gap: 12px;
        }

        .report-card {
          border:
            1px solid
            rgba(255, 65, 150, .35);

          border-radius: 18px;

          padding: 18px;

          background:
            rgba(255, 255, 255, .035);
        }

        .report-top {
          display: flex;

          justify-content: space-between;

          gap: 12px;

          align-items: flex-start;
        }

        .report-reason {
          font-weight: 800;
        }

        .report-date {
          color: #a99da5;

          font-size: 12px;

          display: block;

          margin-top: 5px;
        }

        .report-status {
          padding:
            5px 10px;

          border-radius: 15px;

          background:
            rgba(255, 25, 133, .15);

          color: #ff8fbd;

          font-size: 12px;
        }

        .report-details {
          color: #ddd;

          line-height: 1.5;
        }

        .report-user {
          color: #aaa;

          font-size: 12px;
        }

        .admin-btns {
          display: flex;

          gap: 8px;

          margin-top: 12px;

          flex-wrap: wrap;
        }

        .admin-btns button {
          border:
            1px solid
            rgba(255, 65, 150, .55);

          background: #180812;

          color: white;

          border-radius: 18px;

          padding: 8px 13px;

          cursor: pointer;
        }

        .admin-btns button:hover {
          border-color: #ff1985;
        }

        /* LOADING / DENIED */

        .admin-loading,
        .admin-denied {
          max-width: 500px;

          margin: 120px auto;

          padding: 30px;

          text-align: center;

          border:
            1px solid
            rgba(255, 65, 150, .45);

          border-radius: 22px;

          background: #12050d;
        }

        .admin-denied a {
          color: #ff72ad;
        }

        /* MOBILE */

        @media (max-width: 850px) {

          .admin-stats {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .admin-stat:last-child {
            grid-column:
              span 2;
          }
        }

        @media (max-width: 520px) {

          .admin-header {
            align-items: flex-start;

            flex-direction: column;
          }

          .admin-title h1 {
            font-size: 31px;
          }

          .admin-stats {
            grid-template-columns:
              1fr 1fr;
          }

          .admin-stat:last-child {
            grid-column:
              span 1;
          }

          .admin-stat {
            padding: 15px;
          }

          .admin-stat strong {
            font-size: 25px;
          }

          .report-top {
            flex-direction: column;
          }
        }
      `}</style>

      {/* HEADER */}

      <header className="admin-header">

        <div className="admin-brand">
          Mingle-<span>Connect</span> Admin
        </div>

        <div className="admin-header-actions">

          <a
            className="admin-link"
            href="/dashboard"
          >
            ← Dashboard
          </a>

          <button
            className="admin-link"
            onClick={load}
          >
            Refresh
          </button>

        </div>

      </header>

      {/* MAIN */}

      <div className="admin-main">

        <section className="admin-title">

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Monitor users, boosts, calls,
            messages and safety reports.
          </p>

        </section>

        {msg && (
          <div className="admin-notice">
            {msg}
          </div>
        )}

        {/* STATISTICS */}

        <section className="admin-stats">

          <div className="admin-stat">
            <div className="admin-stat-icon">
              👥
            </div>

            <strong>
              {stats.users}
            </strong>

            <span>
              Registered users
            </span>
          </div>

          <div className="admin-stat">
            <div className="admin-stat-icon">
              💬
            </div>

            <strong>
              {stats.messages}
            </strong>

            <span>
              Direct messages
            </span>
          </div>

          <div className="admin-stat">
            <div className="admin-stat-icon">
              🚀
            </div>

            <strong>
              {stats.activeBoosts}
            </strong>

            <span>
              Active boosts
            </span>
          </div>

          <div className="admin-stat">
            <div className="admin-stat-icon">
              📞
            </div>

            <strong>
              {stats.calls}
            </strong>

            <span>
              Total calls
            </span>
          </div>

          <div className="admin-stat">
            <div className="admin-stat-icon">
              🚩
            </div>

            <strong>
              {stats.reports}
            </strong>

            <span>
              Total reports
            </span>
          </div>

        </section>

        {/* REPORTS */}

        <section>

          <div className="admin-section-title">

            <h2>
              Safety Reports
            </h2>

            <button
              className="admin-refresh"
              onClick={load}
            >
              ↻ Refresh data
            </button>

          </div>

          {!reports.length ? (

            <div className="report-card">
              No reports yet.
            </div>

          ) : (

            <div className="report-grid">

              {reports.map((report) => (

                <article
                  className="report-card"
                  key={report.id}
                >

                  <div className="report-top">

                    <div>

                      <div className="report-reason">
                        {report.reason}
                      </div>

                      <span className="report-date">
                        {new Date(
                          report.created_at
                        ).toLocaleString()}
                      </span>

                    </div>

                    <span className="report-status">
                      {report.status}
                    </span>

                  </div>

                  <p className="report-details">
                    {report.details ||
                      'No additional details.'}
                  </p>

                  <div className="report-user">
                    Reported user:{' '}
                    {report.reported_user_id}
                  </div>

                  <div className="admin-btns">

                    <button
                      onClick={() =>
                        updateReport(
                          report.id,
                          'reviewed'
                        )
                      }
                    >
                      Mark reviewed
                    </button>

                    <button
                      onClick={() =>
                        updateReport(
                          report.id,
                          'resolved'
                        )
                      }
                    >
                      Resolve
                    </button>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </div>

    </main>
  )
}