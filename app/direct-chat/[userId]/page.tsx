'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

type Message = {
  id: string
  sender_id: string
  recipient_id: string
  message: string
  created_at: string
}

export default function DirectChat() {
  const params = useParams()
  const userId = String(params.userId)

  const c = createClient()
  
const endRef = useRef<HTMLDivElement>(null)

const localVideoRef = useRef<HTMLVideoElement>(null)
const remoteVideoRef = useRef<HTMLVideoElement>(null)
const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
const localStreamRef = useRef<MediaStream | null>(null)

const [user, setUser] = useState<any>(null)
const [person, setPerson] = useState<any>(null)
const [messages, setMessages] = useState<Message[]>([])
const [text, setText] = useState('')
const [loading, setLoading] = useState(true)
const [sending, setSending] = useState(false)
const [error, setError] = useState('')

const [callId, setCallId] = useState<string | null>(null)
const [callType, setCallType] = useState<'voice' | 'video' | null>(null)
const [callStatus, setCallStatus] = useState<
  'idle' | 'calling' | 'ringing' | 'connected' | 'ended'
>('idle')

const [muted, setMuted] = useState(false)
const [cameraOff, setCameraOff] = useState(false)
const iceServers: RTCConfiguration = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    },
    {
      urls: 'stun:stun1.l.google.com:19302',
    },
  ],
}

async function createPeerConnection(
  currentCallId: string,
  currentCallType: 'voice' | 'video'
) {
  if (!user?.id) return null

  const peer = new RTCPeerConnection(iceServers)

  peerConnectionRef.current = peer

  peer.onicecandidate = async (event) => {
    if (!event.candidate) return

    await c.from('call_signals').insert({
      call_id: currentCallId,
      sender_id: user.id,
      receiver_id: userId,
      signal_type: 'ice-candidate',
      signal_data: event.candidate.toJSON(),
    })
  }

  peer.ontrack = (event) => {
    const stream = event.streams[0]

    if (remoteVideoRef.current && stream) {
      remoteVideoRef.current.srcObject = stream
    }
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: currentCallType === 'video',
  })

  localStreamRef.current = stream

  stream.getTracks().forEach((track) => {
    peer.addTrack(track, stream)
  })

  if (localVideoRef.current && currentCallType === 'video') {
    localVideoRef.current.srcObject = stream
  }

  return peer
}
  useEffect(() => {
    let channel: any

    async function start() {
      const { data: auth } = await c.auth.getUser()

      if (!auth.user) {
        window.location.href = '/login'
        return
      }

      setUser(auth.user)

      const { data: profile } = await c
        .from('profiles')
        .select('display_name')
        .eq('id', userId)
        .maybeSingle()

      setPerson(profile)

      await loadMessages(auth.user.id)

      channel = c
        .channel(`direct-${auth.user.id}-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'direct_messages'
          },
          (payload) => {
            const message = payload.new as Message

            if (
              (message.sender_id === auth.user.id &&
                message.recipient_id === userId) ||
              (message.sender_id === userId &&
                message.recipient_id === auth.user.id)
            ) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === message.id)) {
                  return prev
                }

                return [...prev, message]
              })
            }
          }
        )
        .subscribe()

      setLoading(false)
    }

    start()

    return () => {
      if (channel) {
        c.removeChannel(channel)
      }
    }
  }, [userId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadMessages(currentUserId: string) {
    const { data, error } = await c
      .from('direct_messages')
      .select('id,sender_id,recipient_id,message,created_at')
      .or(
        `and(sender_id.eq.${currentUserId},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${currentUserId})`
      )
      .order('created_at', { ascending: true })

    if (error) {
      setError(error.message)
      return
    }

    setMessages(data || [])
  }

  async function sendMessage() {
    const body = text.trim()

    if (!body || sending || !user) return

    setSending(true)
    setError('')

    const { error } = await c
      .from('direct_messages')
      .insert({
        sender_id: user.id,
        recipient_id: userId,
        message: body
      })

    if (error) {
      setError(
        'You need an active Boost to start messaging new people.'
      )
    } else {
      setText('')
    }

    setSending(false)
  }

  if (loading) {
    return (
      <main className="direct-chat-page">
        <p>Opening chat... ❤️</p>
      </main>
    )
  }

  return (
    <main className="direct-chat-page">

      <header className="direct-chat-header">
        <a href="/discover" className="direct-chat-back">
          ←
        </a>

        <div>
          <strong>
            {person?.display_name || 'Mingle Member'}
          </strong>

          <small>
            Direct Message
          </small>
        </div>

        <span>♡</span>
      </header>

      <section className="direct-chat-messages">

        {messages.length === 0 && (
          <div className="direct-chat-empty">
            <div>💗</div>

            <h2>
              Say hello! ❤️
            </h2>

            <p>
              Start a conversation and see where it goes.
            </p>
          </div>
        )}

        {messages.map((m) => {
          const mine = m.sender_id === user?.id

          return (
            <div
              key={m.id}
              className={
                mine
                  ? 'direct-message mine'
                  : 'direct-message theirs'
              }
            >
              <div className="direct-message-bubble">
                {m.message}
              </div>

              <small>
                {new Date(m.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </small>
            </div>
          )
        })}

        <div ref={endRef} />

      </section>

      {error && (
        <div className="direct-chat-error">
          {error}

          <a href="/boost">
            Get a Boost ❤️
          </a>
        </div>
      )}

      <div className="direct-chat-input">

        <input
          type="text"
          value={text}
          maxLength={2000}
          placeholder="Write a sweet message..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage()
            }
          }}
        />

        <button
          type="button"
          onClick={sendMessage}
          disabled={!text.trim() || sending}
        >
          {sending ? '...' : '💌'}
        </button>

      </div>

    </main>
  )
}
