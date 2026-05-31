import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../Company/CompanyMessages.css'
import './StudentMessages.css'
import { Sidebar } from '../../components/Sidebar'
import { PageHeader } from '../../components/PageHeader'
import { messageService, type ConversationDto, type MessageDto } from '../../services/messageService'
import { notificationsService } from '../../services/notificationsService'

type MessageItem = MessageDto

interface ConversationItem extends ConversationDto {
  messages: MessageItem[]
  get initials(): string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => (w.length > 0 ? w[0] : ''))
    .join('')
}

function getAvatarColor(id: number): string {
  return ['blue', 'green', 'amber', 'slate', 'purple'][id % 5]
}

function formatTime(dt: string): string {
  const date = new Date(dt)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const dtDay = new Date(date)
  dtDay.setHours(0, 0, 0, 0)

  if (dtDay.getTime() === today.getTime()) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }
  if (dtDay.getTime() === yesterday.getTime()) return 'Yesterday'
  const diffDays = (today.getTime() - dtDay.getTime()) / 86400000
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' })
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getDateLabel(date: string): string {
  const d = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const dateDay = new Date(d)
  dateDay.setHours(0, 0, 0, 0)

  if (dateDay.getTime() === today.getTime()) return 'Today'
  if (dateDay.getTime() === yesterday.getTime()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function groupByDate(messages: MessageItem[]): { date: string; msgs: MessageItem[] }[] {
  const map = new Map<number, MessageItem[]>()
  for (const msg of messages) {
    const day = new Date(msg.sentAt)
    day.setHours(0, 0, 0, 0)
    const key = day.getTime()
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(msg)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([key, msgs]) => ({
      date: new Date(key).toISOString(),
      msgs: [...msgs].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()),
    }))
}

export default function StudentMessages() {
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [convSearch, setConvSearch] = useState('')
  const [convTab, setConvTab] = useState<'All' | 'Unread'>('All')
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [composeText, setComposeText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [notifUnreadCount, setNotifUnreadCount] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const unreadCount = conversations.filter(c => !c.isRead).length
  const activeConversation = conversations.find(c => c.userId === activeConvId) ?? null

  const filteredConversations = useMemo(() => {
    return conversations
      .filter(c => {
        const q = convSearch.trim().toLowerCase()
        const matchesSearch =
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.jobTitle.toLowerCase().includes(q) ||
          c.lastMessage.toLowerCase().includes(q)

        const matchesTab = convTab === 'Unread' ? !c.isRead : true
        return matchesSearch && matchesTab
      })
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
  }, [conversations, convSearch, convTab])

  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true)
      setError(null)
      const result = await messageService.getConversations()

      if (result.isSuccess && result.value) {
        const convs = result.value.map((c: ConversationDto) => ({
          ...c,
          messages: [] as MessageItem[],
          get initials() { return getInitials((this as ConversationItem).name) }
        })) as ConversationItem[]
        setConversations(convs)
      } else {
        setError(result.error || 'Failed to load conversations')
      }

      setIsLoading(false)
    }

    loadConversations()
  }, [])

  useEffect(() => {
    const loadUnreadNotifications = async () => {
      const result = await notificationsService.getNotifications()
      if (result.isSuccess && result.value) {
        setNotifUnreadCount(result.value.filter(n => !n.isRead).length)
      }
    }
    void loadUnreadNotifications()
  }, [])

  useEffect(() => {
    if (filteredConversations.length > 0 && activeConvId === null && !isLoading) {
      const saved = window.localStorage.getItem('studentMessages.activeConvId')
      const preferred = saved && filteredConversations.some(c => c.userId === saved)
        ? saved
        : filteredConversations[0].userId
      selectConversation(preferred)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, filteredConversations.length])

  useEffect(() => {
    if (!activeConvId) return
    const loadMessages = async () => {
      const result = await messageService.getMessages(activeConvId)
      if (result.isSuccess && result.value) setMessages(result.value)
      else setMessages([])
    }
    loadMessages()
  }, [activeConvId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConvId, messages.length])

  function selectConversation(userId: string) {
    setActiveConvId(userId)
    window.localStorage.setItem('studentMessages.activeConvId', userId)
    setConversations(prev => prev.map(c => (c.userId === userId ? { ...c, isRead: true } : c)))
  }

  async function sendMessage() {
    if (!composeText.trim() || !activeConvId) return
    const text = composeText.trim()

    const result = await messageService.sendMessage({ receiverId: activeConvId, content: text })
    if (result.isSuccess && result.value) {
      const sent = result.value
      setMessages(prev => [...prev, sent])
      setComposeText('')

      setConversations(prev =>
        prev.map(c => c.userId !== activeConvId
          ? c
          : { ...c, lastMessage: text, lastMessageAt: new Date().toISOString(), lastSenderIsMe: true, isRead: true }
        )
      )
    }
  }

  function handleComposeKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  return (
    <div className="app-shell student-messages-page">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="main-content">
        <PageHeader
          title="Messages"
          subtitle="Chat with companies"
          onMenuToggle={() => setIsSidebarOpen(v => !v)}
        >
          <div className="search-wrap">
            <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search messages, companies..."
              value={convSearch}
              onChange={e => setConvSearch(e.target.value)}
            />
          </div>
          <Link to="/notifications" className="notif-btn" aria-label="Notifications">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {notifUnreadCount > 0 && <span className="notif-indicator" />}
          </Link>
        </PageHeader>

        <div className="messages-shell">
          {/* LEFT: conversations */}
          <aside className="conv-panel">
            <div className="conv-panel-header">
              <div className="conv-panel-title-row">
                <h1 className="conv-panel-title">Messages</h1>
              </div>

              <div className="conv-tabs">
                {(['All', 'Unread'] as const).map(tab => (
                  <button
                    key={tab}
                    className={`conv-tab ${convTab === tab ? 'active' : ''}`}
                    onClick={() => setConvTab(tab)}
                    type="button"
                  >
                    {tab}
                    {tab === 'Unread' && unreadCount > 0 && (
                      <span className="conv-tab-badge">{unreadCount}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="conv-list">
              {isLoading ? (
                <div className="conv-empty">Loading...</div>
              ) : error ? (
                <div className="conv-empty">
                  <p>{error}</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="conv-empty">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <p>No conversations found</p>
                </div>
              ) : (
                filteredConversations.map(conv => (
                  <button
                    key={conv.userId}
                    type="button"
                    className={`conv-item ${activeConvId === conv.userId ? 'active' : ''} ${!conv.isRead ? 'unread' : ''}`}
                    onClick={() => selectConversation(conv.userId)}
                  >
                    <div className={`conv-avatar conv-avatar--${getAvatarColor(parseInt(conv.userId.substring(0, 8), 16) % 5)}`}>
                      {getInitials(conv.name)}
                    </div>
                    <div className="conv-item-info">
                      <div className="conv-item-top">
                        <span className="conv-item-name">{conv.name}</span>
                        <span className="conv-item-time">{formatTime(conv.lastMessageAt)}</span>
                      </div>
                      <div className="conv-item-preview">
                        <span className="conv-item-snippet">
                          {conv.lastSenderIsMe && <span className="snippet-you">You: </span>}
                          {conv.lastMessage}
                        </span>
                        {!conv.isRead && <span className="unread-dot" />}
                      </div>
                      <div className="conv-item-meta">
                        <span className="conv-item-role">{conv.role ?? 'Company'}</span>
                        {conv.jobTitle && (
                          <>
                            <span className="conv-item-dot">·</span>
                            <span className="conv-item-job">{conv.jobTitle}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          {/* CENTER: chat */}
          <section className="chat-panel">
            {!activeConversation ? (
              <div className="chat-empty-state">
                <div className="chat-empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="chat-empty-title">Select a conversation</p>
                <p className="chat-empty-sub">Choose a company from the list to start messaging.</p>
              </div>
            ) : (
              <>
                <div className="chat-header">
                  <div className="chat-header-left">
                    <div className={`chat-avatar chat-avatar--${getAvatarColor(parseInt(activeConversation.userId.substring(0, 8), 16) % 5)}`}>
                      {getInitials(activeConversation.name)}
                    </div>
                    <div className="chat-header-info">
                      <span className="chat-header-name">{activeConversation.name}</span>
                      <span className="chat-header-meta">
                        {activeConversation.role ?? 'Company'}
                        {activeConversation.jobTitle && ` · ${activeConversation.jobTitle}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="chat-messages" id="chat-messages-area">
                  {groupByDate(messages).map(({ date, msgs }) => (
                    <React.Fragment key={date}>
                      <div className="msg-date-sep">
                        <div className="msg-date-line" />
                        <span className="msg-date-label">{getDateLabel(date)}</span>
                        <div className="msg-date-line" />
                      </div>

                      {msgs.map(msg => {
                        const isMe = msg.senderId !== activeConvId
                        return (
                          <div key={msg.id} className={`msg-row ${isMe ? 'msg-row--me' : 'msg-row--them'}`}>
                            {!isMe && (
                              <div className={`msg-avatar msg-avatar--${getAvatarColor(parseInt(activeConversation.userId.substring(0, 8), 16) % 5)}`}>
                                {getInitials(activeConversation.name)}
                              </div>
                            )}
                            <div className="msg-bubble-wrap">
                              {msg.type === 'interview-invite' && msg.inviteDetails ? (
                                <div className="msg-invite-card">
                                  <div className="mic-header">
                                    <div className="mic-icon">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                      </svg>
                                    </div>
                                    <div>
                                      <p className="mic-title">Interview Invitation</p>
                                      <p className="mic-sub">{msg.inviteDetails.position}</p>
                                    </div>
                                  </div>
                                  <div className="mic-details">
                                    <div className="mic-detail-row">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                      </svg>
                                      {msg.inviteDetails.dateDisplay}
                                    </div>
                                    <div className="mic-detail-row">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                      </svg>
                                      {msg.inviteDetails.timeDisplay}
                                    </div>
                                    <div className="mic-detail-row">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                      </svg>
                                      {msg.inviteDetails.format}
                                    </div>
                                  </div>
                                  <p className="mic-body">{msg.content}</p>
                                </div>
                              ) : (
                                <div className={`msg-bubble ${isMe ? 'msg-bubble--me' : 'msg-bubble--them'}`}>
                                  {msg.content}
                                </div>
                              )}
                              <span className={`msg-time ${isMe ? 'msg-time--me' : ''}`}>
                                {new Date(msg.sentAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </React.Fragment>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="compose-bar">
                  <div className="compose-input-row">
                    <textarea
                      className="compose-input"
                      placeholder="Type your message…"
                      rows={1}
                      value={composeText}
                      onChange={e => setComposeText(e.target.value)}
                      onKeyDown={handleComposeKey}
                      aria-label="Message input"
                    />
                    <button
                      className={`send-btn ${composeText.trim() ? 'active' : ''}`}
                      onClick={() => void sendMessage()}
                      disabled={!composeText.trim()}
                      aria-label="Send message"
                      type="button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                  <p className="compose-hint">Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line</p>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
