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

type CallSignal = {
  id: string
  call_id: string
  sender_id: string
  receiver_id: string
  signal_type: 'offer' | 'answer' | 'ice-candidate'
  signal_data: any
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

  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([])
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null)

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

  const [incomingCall, setIncomingCall] = useState<any>(null)

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

  /*
   * =========================================================
   * WEBRTC CONNECTION
   * =========================================================
   */

  async function createPeerConnection(
    currentCallId: string,
    currentCallType: 'voice' | 'video',
    remoteUserId: string
  ) {
    if (!user?.id) return null

    const peer = new RTCPeerConnection(iceServers)

    peerConnectionRef.current = peer

    peer.onicecandidate = async (event) => {
      if (!event.candidate) return

      try {
        await c.from('call_signals').insert({
          call_id: currentCallId,
          sender_id: user.id,
          receiver_id: remoteUserId,
          signal_type: 'ice-candidate',
          signal_data: event.candidate.toJSON(),
        })
      } catch (err) {
        console.error('ICE candidate error:', err)
      }
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

    if (
      localVideoRef.current &&
      currentCallType === 'video'
    ) {
      localVideoRef.current.srcObject = stream
    }

    return peer
  }

  /*
   * =========================================================
   * START CALL
   * =========================================================
   */

  async function startCall(type: 'voice' | 'video') {
    if (!user?.id || !userId) return

    try {
      setError('')
      setCallType(type)
      setCallStatus('calling')

      const roomId = crypto.randomUUID()

      const { data: call, error: callError } = await c
        .from('calls')
        .insert({
          caller_id: user.id,
          receiver_id: userId,
          call_type: type,
          status: 'ringing',
          room_id: roomId,
        })
        .select()
        .single()

      if (callError || !call) {
        setError(
          callError?.message || 'Unable to start call.'
        )
        setCallStatus('idle')
        return
      }

      setCallId(call.id)

      const peer = await createPeerConnection(
        call.id,
        type,
        userId
      )

      if (!peer) {
        setError('Unable to create call connection.')
        setCallStatus('idle')
        return
      }

      const offer = await peer.createOffer()

      await peer.setLocalDescription(offer)

      const { error: signalError } = await c
        .from('call_signals')
        .insert({
          call_id: call.id,
          sender_id: user.id,
          receiver_id: userId,
          signal_type: 'offer',
          signal_data: offer,
        })

      if (signalError) {
        console.error(
          'Call signal error:',
          signalError
        )

        setError('Unable to send call invitation.')
        setCallStatus('idle')
      }
    } catch (err: any) {
      console.error('Start call error:', err)

      setError(
        err?.message || 'Unable to start the call.'
      )

      setCallStatus('idle')
    }
  }

  /*
   * =========================================================
   * ACCEPT INCOMING CALL
   * =========================================================
   */

  async function acceptCall() {
    if (!user?.id || !incomingCall) return

    try {
      setError('')

      const currentCallId = incomingCall.callId
      const currentCallType = incomingCall.callType
      const callerId = incomingCall.callerId

      setCallId(currentCallId)
      setCallType(currentCallType)
      setCallStatus('calling')
      setIncomingCall(null)

      const peer = await createPeerConnection(
        currentCallId,
        currentCallType,
        callerId
      )

      if (!peer) {
        setError('Unable to create call connection.')
        setCallStatus('idle')
        return
      }

      if (pendingOfferRef.current) {
        await peer.setRemoteDescription(
          new RTCSessionDescription(
            pendingOfferRef.current
          )
        )

        pendingOfferRef.current = null
      }

      for (const candidate of pendingIceCandidatesRef.current) {
        try {
          await peer.addIceCandidate(
            new RTCIceCandidate(candidate)
          )
        } catch (err) {
          console.error(
            'Pending ICE candidate error:',
            err
          )
        }
      }

      pendingIceCandidatesRef.current = []

      const answer = await peer.createAnswer()

      await peer.setLocalDescription(answer)

      const { error: signalError } = await c
        .from('call_signals')
        .insert({
          call_id: currentCallId,
          sender_id: user.id,
          receiver_id: callerId,
          signal_type: 'answer',
          signal_data: answer,
        })

      if (signalError) {
        setError(
          signalError.message ||
            'Unable to answer the call.'
        )

        setCallStatus('idle')
        return
      }

      await c
        .from('calls')
        .update({
          status: 'connected',
        })
        .eq('id', currentCallId)

      setCallStatus('connected')
    } catch (err: any) {
      console.error('Accept call error:', err)

      setError(
        err?.message || 'Unable to accept the call.'
      )

      setCallStatus('idle')
    }
  }

  /*
   * =========================================================
   * DECLINE CALL
   * =========================================================
   */

  async function declineCall() {
    try {
      if (incomingCall?.callId) {
        await c
          .from('calls')
          .update({
            status: 'ended',
          })
          .eq('id', incomingCall.callId)
      }
    } catch (err) {
      console.error('Decline call error:', err)
    }

    pendingOfferRef.current = null
    pendingIceCandidatesRef.current = []

    setIncomingCall(null)
    setCallId(null)
    setCallType(null)
    setCallStatus('idle')
  }

  /*
   * =========================================================
   * END CALL
   * =========================================================
   */

  async function endCall() {
    try {
      if (callId) {
        await c
          .from('calls')
          .update({
            status: 'ended',
          })
          .eq('id', callId)
      }
    } catch (err) {
      console.error('End call error:', err)
    }

    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => track.stop())

      localStreamRef.current = null
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }

    setCallStatus('ended')
    setCallId(null)
    setCallType(null)
    setIncomingCall(null)

    setTimeout(() => {
      setCallStatus('idle')
    }, 500)
  }

  /*
   * =========================================================
   * MUTE MICROPHONE
   * =========================================================
   */

  function toggleMute() {
    if (!localStreamRef.current) return

    const audioTracks =
      localStreamRef.current.getAudioTracks()

    audioTracks.forEach((track) => {
      track.enabled = muted
    })

    setMuted(!muted)
  }

  /*
   * =========================================================
   * CAMERA
   * =========================================================
   */

  function toggleCamera() {
    if (!localStreamRef.current) return

    const videoTracks =
      localStreamRef.current.getVideoTracks()

    videoTracks.forEach((track) => {
      track.enabled = cameraOff
    })

    setCameraOff(!cameraOff)
  }

  /*
   * =========================================================
   * INCOMING CALL SIGNALS
   * =========================================================
   */

  useEffect(() => {
    if (!user?.id) return

    const signalChannel = c
      .channel(`incoming-calls-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_signals',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          const signal =
            payload.new as CallSignal

          try {
            /*
             * INCOMING OFFER
             */

            if (signal.signal_type === 'offer') {
              const {
                data: call,
                error: callError,
              } = await c
                .from('calls')
                .select(
                  'id,caller_id,receiver_id,call_type,status,room_id'
                )
                .eq('id', signal.call_id)
                .maybeSingle()

              if (callError || !call) return

              pendingOfferRef.current =
                signal.signal_data

              setCallId(call.id)
              setCallType(call.call_type)

              setCallStatus('ringing')

              setIncomingCall({
                callId: call.id,
                callerId: call.caller_id,
                callType: call.call_type,
              })
            }

            /*
             * ANSWER
             */

            if (
              signal.signal_type === 'answer'
            ) {
              const peer =
                peerConnectionRef.current

              if (!peer) return

              await peer.setRemoteDescription(
                new RTCSessionDescription(
                  signal.signal_data
                )
              )

              for (const candidate of pendingIceCandidatesRef.current) {
                try {
                  await peer.addIceCandidate(
                    new RTCIceCandidate(candidate)
                  )
                } catch (err) {
                  console.error(
                    'ICE candidate error:',
                    err
                  )
                }
              }

              pendingIceCandidatesRef.current = []

              setCallStatus('connected')
            }

            /*
             * ICE CANDIDATE
             */

            if (
              signal.signal_type ===
              'ice-candidate'
            ) {
              const candidate =
                signal.signal_data as RTCIceCandidateInit

              const peer =
                peerConnectionRef.current

              if (
                peer &&
                peer.remoteDescription
              ) {
                await peer.addIceCandidate(
                  new RTCIceCandidate(candidate)
                )
              } else {
                pendingIceCandidatesRef.current.push(
                  candidate
                )
              }
            }
          } catch (err) {
            console.error(
              'Incoming call signal error:',
              err
            )
          }
        }
      )
      .subscribe()

    return () => {
      c.removeChannel(signalChannel)
    }
  }, [user?.id])

  /*
   * =========================================================
   * LOAD USER + PROFILE + MESSAGES
   * =========================================================
   */

  useEffect(() => {
    let channel: any

    async function start() {
      const { data: auth } =
        await c.auth.getUser()

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

      /*
       * REAL-TIME DIRECT MESSAGES
       */

      channel = c
        .channel(
          `direct-${auth.user.id}-${userId}`
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'direct_messages',
          },
          (payload) => {
            const message =
              payload.new as Message

            if (
              (
                message.sender_id ===
                  auth.user.id &&
                message.recipient_id ===
                  userId
              ) ||
              (
                message.sender_id === userId &&
                message.recipient_id ===
                  auth.user.id
              )
            ) {
              setMessages((prev) => {
                if (
                  prev.some(
                    (m) => m.id === message.id
                  )
                ) {
                  return prev
                }

                return [...prev, message]
              })
            }
          }
        )
        .subscribe((status) => {
  console.log('DIRECT MESSAGE REALTIME STATUS:', status)
})

      setLoading(false)
    }

    start()

    return () => {
      if (channel) {
        c.removeChannel(channel)
      }
    }
  }, [userId])

  /*
   * =========================================================
   * SCROLL TO NEW MESSAGE
   * =========================================================
   */

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])

  /*
   * =========================================================
   * LOAD MESSAGES
   * =========================================================
   */

  async function loadMessages(
    currentUserId: string
  ) {
    const { data, error } = await c
      .from('direct_messages')
      .select(
        'id,sender_id,recipient_id,message,created_at'
      )
      .or(
        `and(sender_id.eq.${currentUserId},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${currentUserId})`
      )
      .order('created_at', {
        ascending: true,
      })

    if (error) {
      setError(error.message)
      return
    }

    setMessages(data || [])
  }

  /*
   * =========================================================
   * SEND MESSAGE
   * =========================================================
   */

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
        message: body,
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

  /*
   * =========================================================
   * CLEANUP ON PAGE EXIT
   * =========================================================
   */

  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => track.stop())
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
    }
  }, [])

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <main className="direct-chat-page">
        <p>Opening chat... ❤️</p>
      </main>
    )
  }

  /*
   * =========================================================
   * MAIN PAGE
   * =========================================================
   */

  return (
    <main className="direct-chat-page">

      {/* =====================================================
          INCOMING CALL
          ===================================================== */}

      {incomingCall && (
        <div className="incoming-call-overlay">
          <div className="incoming-call-box">

            <div className="incoming-call-icon">
              {incomingCall.callType === 'video'
                ? '📹'
                : '📞'}
            </div>

            <h2>
              Incoming{' '}
              {incomingCall.callType === 'video'
                ? 'Video'
                : 'Voice'}{' '}
              Call
            </h2>

            <p>
              {person?.display_name ||
                'Mingle Member'}{' '}
              is calling you.
            </p>

            <div className="incoming-call-actions">

              <button
                type="button"
                onClick={acceptCall}
              >
                Accept ❤️
              </button>

              <button
                type="button"
                onClick={declineCall}
              >
                Decline
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          CALL AREA
          ===================================================== */}

      {callStatus !== 'idle' &&
        callStatus !== 'ended' && (
          <section className="direct-call-panel">

            {callType === 'video' && (
              <div className="direct-call-videos">

                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="remote-video"
                />

                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="local-video"
                />

              </div>
            )}

            {callType === 'voice' && (
              <div className="voice-call-display">
                📞
                <strong>
                  {person?.display_name ||
                    'Mingle Member'}
                </strong>

                <span>
                  {callStatus === 'calling'
                    ? 'Calling...'
                    : callStatus === 'ringing'
                    ? 'Ringing...'
                    : 'Connected'}
                </span>
              </div>
            )}

            <div className="call-status">
              {callStatus === 'calling' &&
                'Calling...'}

              {callStatus === 'ringing' &&
                'Incoming call...'}

              {callStatus === 'connected' &&
                'Connected'}
            </div>

            <div className="call-controls">

              <button
                type="button"
                onClick={toggleMute}
              >
                {muted ? '🔇 Unmute' : '🎤 Mute'}
              </button>

              {callType === 'video' && (
                <button
                  type="button"
                  onClick={toggleCamera}
                >
                  {cameraOff
                    ? '📷 Camera On'
                    : '📷 Camera Off'}
                </button>
              )}

              <button
                type="button"
                onClick={endCall}
              >
                🔴 End Call
              </button>

            </div>

          </section>
        )}

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header
  className="direct-chat-header"
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    background: '#ffffff',
    borderBottom: '1px solid #f0dce8',
  }}
>
  <a
    href="/discover"
    className="direct-chat-back"
    style={{
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff0f7',
      color: '#c92b91',
      textDecoration: 'none',
      fontSize: '26px',
      fontWeight: 'bold',
    }}
  >
    ←
  </a>

  <div
    style={{
      flex: 1,
      marginLeft: '12px',
    }}
  >
    <strong
      style={{
        display: 'block',
        fontSize: '20px',
        color: '#281522',
      }}
    >
      {person?.display_name || 'Mingle Member'}
    </strong>

    <small
      style={{
        display: 'block',
        color: '#888',
        marginTop: '3px',
      }}
    >
      Private conversation
    </small>
  </div>

  <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
    marginLeft: '4px',
  }}
>
    <button
  type="button"
  onClick={() => startCall('voice')}
  disabled={callStatus !== 'idle'}
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    visibility: 'visible',
    opacity: 1,
    width: '44px',
    height: '44px',
    minWidth: '44px',
    borderRadius: '50%',
    border: 'none',
    background: '#f7c4e6',
    color: '#9b1670',
    fontSize: '21px',
    cursor: callStatus === 'idle' ? 'pointer' : 'not-allowed',
    flexShrink: 0,
  }}
  aria-label="Voice call"
>
  📞
</button>

<button
  type="button"
  onClick={() => startCall('video')}
  disabled={callStatus !== 'idle'}
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    visibility: 'visible',
    opacity: 1,
    width: '44px',
    height: '44px',
    minWidth: '44px',
    borderRadius: '50%',
    border: 'none',
    background: '#f7c4e6',
    color: '#9b1670',
    fontSize: '21px',
    cursor: callStatus === 'idle' ? 'pointer' : 'not-allowed',
    flexShrink: 0,
  }}
  aria-label="Video call"
>
  📹
</button>

<span
  style={{
    fontSize: '28px',
    marginLeft: '4px',
    flexShrink: 0,
  }}
>
  ❤️
</span>
  </div>
</header>
      {/* =====================================================
          MESSAGES
          ===================================================== */}

      <section className="direct-chat-messages">

        {messages.length === 0 && (
          <div className="direct-chat-empty">

            <div>❤️</div>

            <h2>
              Say hello! ❤️
            </h2>

            <p>
              Start a conversation and see
              where it goes.
            </p>

          </div>
        )}

        {messages.map((m) => {
          const mine =
            m.sender_id === user?.id

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
                {new Date(
                  m.created_at
                ).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </small>

            </div>
          )
        })}

        <div ref={endRef} />

      </section>

      {/* =====================================================
          ERROR / BOOST
          ===================================================== */}

      {error && (
        <div className="direct-chat-error">

          <div>{error}</div>

          <a href="/boost">
            Get a Boost ❤️
          </a>

        </div>
      )}

      {/* =====================================================
          MESSAGE INPUT
          ===================================================== */}

      <div className="direct-chat-input">

        <input
          type="text"
          value={text}
          maxLength={2000}
          placeholder="Write a sweet message..."
          onChange={(e) =>
            setText(e.target.value)
          }
          onKeyDown={(e) => {
            if (
              e.key === 'Enter' &&
              !e.shiftKey
            ) {
              e.preventDefault()
              sendMessage()
            }
          }}
        />

        <button
          type="button"
          onClick={sendMessage}
          disabled={
            !text.trim() || sending
          }
        >
          {sending ? '...' : '💌'}
        </button>

      </div>

    </main>
  )
}
