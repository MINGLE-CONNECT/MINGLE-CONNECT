import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    const serviceKey =
      process.env.SUPABASE_SECRET_KEY

    if (!url || !anonKey || !serviceKey) {
      return NextResponse.json(
        { error: 'Server configuration is incomplete.' },
        { status: 500 }
      )
    }

    const userClient = createClient(
      url,
      anonKey
    )

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid session.' },
        { status: 401 }
      )
    }

    const adminClient = createClient(
      url,
      serviceKey
    )

    const {
      data: admin,
      error: adminError,
    } = await adminClient
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (adminError) {
      return NextResponse.json(
        { error: adminError.message },
        { status: 500 }
      )
    }

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin access denied.' },
        { status: 403 }
      )
    }

    const {
      data: authUsers,
      error: authUsersError,
    } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })

    if (authUsersError) {
      return NextResponse.json(
        { error: authUsersError.message },
        { status: 500 }
      )
    }

    const {
      data: profiles,
      error: profilesError,
    } = await adminClient
      .from('profiles')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (profilesError) {
      return NextResponse.json(
        { error: profilesError.message },
        { status: 500 }
      )
    }

    const profileMap: Record<string, any> = {}

    for (const profile of profiles || []) {
      profileMap[profile.id] = profile
    }

    const users = (authUsers.users || []).map(
      (authUser) => ({
        id: authUser.id,
        email: authUser.email || '',
        emailConfirmed:
          !!authUser.email_confirmed_at,
        createdAt: authUser.created_at,
        lastSignIn:
          authUser.last_sign_in_at || null,
        profile:
          profileMap[authUser.id] || null,
      })
    )

    const {
      data: boosts,
      error: boostsError,
    } = await adminClient
      .from('boosts')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (boostsError) {
      return NextResponse.json(
        { error: boostsError.message },
        { status: 500 }
      )
    }

    const {
      data: products,
      error: productsError,
    } = await adminClient
      .from('boost_products')
      .select('*')

    if (productsError) {
      return NextResponse.json(
        { error: productsError.message },
        { status: 500 }
      )
    }

    const productMap: Record<string, any> = {}

    for (const product of products || []) {
      productMap[product.id] = product
    }

    const boostRecords = (boosts || []).map(
      (boost: any) => ({
        ...boost,
        product:
          productMap[boost.product_id] || null,
      })
    )

    const {
      data: messages,
      error: messagesError,
    } = await adminClient
      .from('direct_messages')
      .select('*')
      .order('created_at', {
        ascending: false,
      })
      .limit(5000)

    if (messagesError) {
      return NextResponse.json(
        { error: messagesError.message },
        { status: 500 }
      )
    }

    const {
      data: calls,
      error: callsError,
    } = await adminClient
      .from('calls')
      .select('*')
      .order('created_at', {
        ascending: false,
      })
      .limit(5000)

    if (callsError) {
      return NextResponse.json(
        { error: callsError.message },
        { status: 500 }
      )
    }

    const {
      data: reports,
      error: reportsError,
    } = await adminClient
      .from('reports')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (reportsError) {
      return NextResponse.json(
        { error: reportsError.message },
        { status: 500 }
      )
    }

    const {
      data: blocks,
      error: blocksError,
    } = await adminClient
      .from('blocks')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (blocksError) {
      return NextResponse.json(
        { error: blocksError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,

      generatedAt:
        new Date().toISOString(),

      stats: {
        users: users.length,
        messages: messages?.length || 0,
        boosts: boostRecords.length,

        activeBoosts:
          boostRecords.filter(
            (boost: any) =>
              boost.status === 'active' &&
              boost.expires_at &&
              new Date(boost.expires_at) > new Date()
          ).length,

        calls: calls?.length || 0,
        reports: reports?.length || 0,
        blocks: blocks?.length || 0,
      },

      users,
      boosts: boostRecords,
      messages: messages || [],
      calls: calls || [],
      reports: reports || [],
      blocks: blocks || [],
    })

  } catch (error: any) {
    console.error(
      'Admin data error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Unable to load admin data.',
      },
      { status: 500 }
    )
  }
}