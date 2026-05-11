import React, { useState, useEffect, useRef } from 'react';
import './CompanyMessages.css';
import {CompanySidebar} from '../../components/CompanySidebar';
import {CompanyHeader} from '../../components/CompanyHeader';
import {ScheduleInterviewModal} from '../../components/modal/ScheduleInterviewModal';
import { companyInterviewsService } from '../../services/companyInterviewsService';
import { messageService, type ConversationDto } from '../../services/messageService';


interface InterviewInviteDetails {
  position: string;
  dateDisplay: string;
  timeDisplay: string;
  format: string;
}

interface MessageItem {
  id: string;
  senderId: string;
  content: string;
  sentAt: string;
  type: string;
  inviteDetails?: InterviewInviteDetails;
}

interface ConversationItem extends ConversationDto {
  messages: MessageItem[];
  get initials(): string;
}

interface MessageTemplate {
  name: string;
  body: string;
}

interface InterviewData {
  candidateName: string;
  jobTitle: string;
  scheduledAt: string;
  durationMins: number;
  format: string;
  location: string;
  notes: string;
}

interface ScheduleResult {
  interview: InterviewData;
  interviewTime: string;
  interviewerName: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => (w.length > 0 ? w[0] : ''))
    .join('');
}

function getAvatarColor(id: number): string {
  return ['blue', 'green', 'amber', 'slate', 'purple'][id % 5];
}

function getMatchClass(score: number): string {
  return score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low';
}

function formatTime(dt: string): string {
  const date = new Date(dt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dtDay = new Date(date);
  dtDay.setHours(0, 0, 0, 0);

  if (dtDay.getTime() === today.getTime()) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  if (dtDay.getTime() === yesterday.getTime()) return 'Yesterday';
  const diffDays = (today.getTime() - dtDay.getTime()) / 86400000;
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDateLabel(date: string): string {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dateDay = new Date(d);
  dateDay.setHours(0, 0, 0, 0);

  if (dateDay.getTime() === today.getTime()) return 'Today';
  if (dateDay.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function groupByDate(messages: MessageItem[]): { date: string; msgs: MessageItem[] }[] {
  const map = new Map<number, MessageItem[]>();
  for (const msg of messages) {
    const day = new Date(msg.sentAt);
    day.setHours(0, 0, 0, 0);
    const key = day.getTime();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(msg);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([key, msgs]) => ({
      date: new Date(key).toISOString(),
      msgs: [...msgs].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()),
    }));
}

const MESSAGE_TEMPLATES: MessageTemplate[] = [
  { name: 'Interview Invitation', body: "Hi {name}, we'd like to invite you to an interview for the {position} role. Please let us know your availability." },
  { name: 'Shortlist Notification', body: "Hi {name}, congratulations! You've been shortlisted for the {position} position. We'll be in touch with next steps." },
  { name: 'Application Received', body: "Hi {name}, thank you for applying to {position}. We've received your application and will review it shortly." },
  { name: 'Status Update', body: "Hi {name}, we wanted to give you an update on your application for {position}. We're still reviewing candidates and will be in touch soon." },
  { name: 'Request for Documents', body: 'Hi {name}, as part of the application process for {position}, we\'d like to request the following documents: [list documents here].' },
];

const CompanyMessages: React.FC = () => {

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [convSearch, setConvSearch] = useState('');
  const [convTab, setConvTab] = useState('All');
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [composeText, setComposeText] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [isTypingVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);

  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [modalInterview, setModalInterview] = useState<InterviewData>({
    candidateName: '', jobTitle: '',
    scheduledAt: new Date().toISOString().split('T')[0],
    durationMins: 60, format: '', location: '', notes: '',
  });
  const [modalInterviewTime] = useState('10:00');
  const [modalInterviewerName] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derived
  const unreadCount = conversations.filter((c) => !c.isRead).length;
  const activeConversation = conversations.find((c) => c.userId === activeConvId) ?? null;

  const filteredConversations = conversations
    .filter((c) => {
      const q = convSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.jobTitle.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q);
      const matchesTab =
        convTab === 'Unread' ? !c.isRead :
        convTab === 'Candidates' ? c.role === 'Candidate' :
        true;
      return matchesSearch && matchesTab;
    })
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true);
      setError(null);
      const result = await messageService.getConversations();
      
      if (result.isSuccess && result.value) {
        const conversationsWithMessages = result.value.map((c: ConversationDto) => ({
          ...c,
          messages: [] as MessageItem[],
          get initials() { return getInitials((this as ConversationItem).name); }
        })) as ConversationItem[];
        setConversations(conversationsWithMessages);
      } else {
        setError(result.error || 'Failed to load conversations');
      }
      
      setIsLoading(false);
    };
    
    loadConversations();
  }, []);

  // Load messages when conversation selected
  useEffect(() => {
    if (!activeConvId) return;
    
    const loadMessages = async () => {
      const result = await messageService.getMessages(activeConvId);
      if (result.isSuccess && result.value) {
        setMessages(result.value);
      }
    };
    
    loadMessages();
  }, [activeConvId]);

  // Auto-open first on mount
  useEffect(() => {
    if (filteredConversations.length > 0 && activeConvId === null && !isLoading) {
      selectConversation(filteredConversations[0].userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvId, messages.length]);

  function selectConversation(userId: string) {
    setActiveConvId(userId);
    setShowTemplates(false);
    setConversations((prev) =>
      prev.map((c) => (c.userId === userId ? { ...c, isRead: true } : c))
    );
  }

  async function sendMessage() {
    if (!composeText.trim() || !activeConvId) return;
    const text = composeText.trim();
    
    const result = await messageService.sendMessage({
      receiverId: activeConvId,
      content: text
    });
    
    if (result.isSuccess && result.value) {
      setMessages([...messages, result.value]);
      setComposeText('');
      setShowTemplates(false);
      
      // Update conversation last message
      setConversations((prev) =>
        prev.map((c) => {
          if (c.userId !== activeConvId) return c;
          return {
            ...c,
            lastMessage: text,
            lastMessageAt: new Date().toISOString(),
            lastSenderIsMe: true,
          };
        })
      );
    }
  }

  function handleComposeKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function useTemplate(tmpl: MessageTemplate) {
    if (!activeConversation) return;
    setComposeText(
      tmpl.body
        .replace('{name}', activeConversation.name.split(' ')[0])
        .replace('{position}', activeConversation.jobTitle)
    );
    setShowTemplates(false);
  }

  function useShortlistTemplate() {
    const tmpl = MESSAGE_TEMPLATES.find((t) => t.name === 'Shortlist Notification');
    if (tmpl) useTemplate(tmpl);
  }

  function openScheduleModal(conv: ConversationItem | null) {
    setModalInterview({
      candidateName: conv?.name ?? '',
      jobTitle: conv?.jobTitle ?? '',
      scheduledAt: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      durationMins: 60,
      format: '',
      location: '',
      notes: '',
    });
    setShowScheduleModal(true);
  }

  async function handleScheduleConfirm(result: ScheduleResult) {
    setShowScheduleModal(false);
    if (!activeConvId || !activeConversation?.applicantId) return;

    const iv = result.interview;
    const [h, m] = result.interviewTime.split(':').map(Number);
    const scheduledAt = new Date(iv.scheduledAt);
    scheduledAt.setHours(h, m);
    const endTime = new Date(scheduledAt.getTime() + iv.durationMins * 60000);

    const fmt = (d: Date) =>
      d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const scheduledResult = await companyInterviewsService.scheduleInterview({
      applicationId: activeConversation.applicantId,
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes: iv.durationMins,
      format: iv.format,
      location: iv.format === 'Video Call' ? undefined : iv.location || undefined,
      meetingLink: iv.format === 'Video Call' ? iv.location || undefined : undefined,
      notes: iv.notes || undefined,
      interviewerNames: result.interviewerName ? [result.interviewerName.trim()] : []
    });

    if (!scheduledResult.isSuccess) {
      setError(scheduledResult.error || 'Failed to schedule interview');
      return;
    }

    const inviteMsg: MessageItem = {
      id: '0',
      senderId: 'me',
      type: 'interview-invite',
      content: `Please find your interview details below. The session will be ${iv.durationMins} minutes${iv.location ? ` via ${iv.format}.` : '.'}`,
      sentAt: new Date().toISOString(),
      inviteDetails: {
        position: iv.jobTitle,
        dateDisplay: scheduledAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        timeDisplay: `${fmt(scheduledAt)} – ${fmt(endTime)}`,
        format: iv.location ? `${iv.format} · ${iv.location}` : iv.format,
      },
    };

    setMessages(prev => [...prev, inviteMsg]);

    setConversations((prev) =>
      prev.map((c) => {
        if (c.userId !== activeConvId) return c;
        return {
          ...c,
          lastMessage: '📅 Interview Invitation sent',
          lastMessageAt: new Date().toISOString(),
          lastSenderIsMe: true,
          isRead: true,
        };
      })
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="app-shell">
      <CompanySidebar />

      <div className="main-content">
        <CompanyHeader title="Messages" subtitle="Communicate with candidates and your team" />

        <div className="messages-shell">

          {/* ══ LEFT PANEL — Conversation List ══ */}
          <aside className="conv-panel">
            <div className="conv-panel-header">
              <div className="conv-panel-title-row">
                <h1 className="conv-panel-title">Messages</h1>
                <button className="compose-btn" title="New message" aria-label="Compose new message"
                  onClick={() => { /* TODO: open new message modal */ }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </button>
              </div>

              <div className="conv-search-wrap">
                <svg className="conv-search-icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input className="conv-search-input" type="search"
                  placeholder="Search conversations..."
                  value={convSearch}
                  onChange={(e) => setConvSearch(e.target.value)} />
              </div>

              <div className="conv-tabs">
                {(['All', 'Unread', 'Candidates'] as const).map((tab) => (
                  <button key={tab} className={`conv-tab ${convTab === tab ? 'active' : ''}`}
                    onClick={() => setConvTab(tab)}>
                    {tab}
                    {tab === 'Unread' && unreadCount > 0 && (
                      <span className="conv-tab-badge">{unreadCount}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="conv-list">
              {error ? (
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
                filteredConversations.map((conv: ConversationItem) => (
                  <button key={conv.userId}
                    className={`conv-item ${activeConvId === conv.userId ? 'active' : ''} ${!conv.isRead ? 'unread' : ''}`}
                    onClick={() => selectConversation(conv.userId)}
                    aria-label={`Open conversation with ${conv.name}`}
                    aria-pressed={activeConvId === conv.userId}>
                    <div className={`conv-avatar conv-avatar--${getAvatarColor(parseInt(conv.userId.substring(0, 8), 16) % 5)}`}>
                      {getInitials(conv.name)}
                      {conv.isOnline && <span className="online-dot" />}
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
                        <span className="conv-item-role">{conv.role}</span>
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

          {/* ══ CENTER PANEL — Chat View ══ */}
          <div className="chat-panel">
            {activeConversation == null ? (
              <div className="chat-empty-state">
                <div className="chat-empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="chat-empty-title">Select a conversation</p>
                <p className="chat-empty-sub">Choose a conversation from the list to start messaging.</p>
                <button className="chat-empty-btn" onClick={() => { /* TODO */ }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  New Message
                </button>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="chat-header">
                  <div className="chat-header-left">
                    <div className={`chat-avatar chat-avatar--${getAvatarColor(parseInt(activeConversation.userId.substring(0, 8), 16) % 5)}`}>
                      {getInitials(activeConversation.name)}
                      {activeConversation.isOnline && <span className="online-dot online-dot--lg" />}
                    </div>
                    <div className="chat-header-info">
                      <span className="chat-header-name">{activeConversation.name}</span>
                      <span className="chat-header-meta">
                        {activeConversation.role}
                        {activeConversation.jobTitle && ` · ${activeConversation.jobTitle}`}
                        {activeConversation.isOnline && <span className="online-label"> · Online</span>}
                      </span>
                    </div>
                  </div>
                  <div className="chat-header-actions">
                    {activeConversation.role === 'Candidate' && activeConversation.applicantId && (
                      <a href={`/company-applicants/${activeConversation.applicantId}`}
                        className="chat-hdr-btn chat-hdr-btn--profile" title="View applicant profile">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        View Profile
                      </a>
                    )}
                    <button className="chat-hdr-btn chat-hdr-btn--schedule"
                      title="Schedule interview"
                      onClick={() => openScheduleModal(activeConversation)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Schedule Interview
                    </button>
                    <button className="chat-hdr-icon-btn" title="More options" aria-label="More options">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="chat-messages" id="chat-messages-area">
                  {groupByDate(messages).map(({ date, msgs }) => (
                    <React.Fragment key={date}>
                      <div className="msg-date-sep">
                        <div className="msg-date-line" />
                        <span className="msg-date-label">{getDateLabel(date)}</span>
                        <div className="msg-date-line" />
                      </div>

                      {msgs.map((msg) => {
                        const isMe = msg.senderId !== activeConvId;
                        return (
                          <div key={msg.id} className={`msg-row ${isMe ? 'msg-row--me' : 'msg-row--them'}`}>
                            {!isMe && (
                              <div className={`msg-avatar msg-avatar--${getAvatarColor(parseInt(activeConversation.userId.substring(0, 8), 16) % 5)}`}>
                                {getInitials(activeConversation.name)}
                              </div>
                            )}
                            <div className="msg-bubble-wrap">
                              {msg.type === 'interview-invite' ? (
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
                                      <p className="mic-sub">{msg.inviteDetails?.position}</p>
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
                                      {msg.inviteDetails?.dateDisplay}
                                    </div>
                                    <div className="mic-detail-row">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                      </svg>
                                      {msg.inviteDetails?.timeDisplay}
                                    </div>
                                    <div className="mic-detail-row">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                      </svg>
                                      {msg.inviteDetails?.format}
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
                                {isMe && (
                                  <svg className="msg-read-check" xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                    strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}

                  {/* Typing indicator */}
                  {isTypingVisible && (
                    <div className="msg-row msg-row--them">
                      <div className={`msg-avatar msg-avatar--${getAvatarColor(parseInt(activeConversation.userId.substring(0, 8), 16) % 5)}`}>
                        {getInitials(activeConversation.name)}
                      </div>
                      <div className="msg-bubble-wrap">
                        <div className="msg-bubble msg-bubble--them msg-typing">
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Compose Bar */}
                <div className="compose-bar">
                  <div className="compose-tools">
                    <button className="compose-tool-btn" title="Attach file" aria-label="Attach file">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                      </svg>
                    </button>
                    <button className={`compose-tool-btn compose-tool-btn--template ${showTemplates ? 'active' : ''}`}
                      title="Use template" aria-label="Message templates"
                      onClick={() => setShowTemplates((v) => !v)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      Templates
                    </button>
                  </div>

                  {/* Template Picker */}
                  {showTemplates && (
                    <div className="template-picker">
                      <div className="template-picker-header">
                        <span className="template-picker-title">Message Templates</span>
                        <button className="template-picker-close"
                          onClick={() => setShowTemplates(false)} aria-label="Close templates">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                      {MESSAGE_TEMPLATES.map((tmpl) => (
                        <button key={tmpl.name} className="template-item" onClick={() => useTemplate(tmpl)}>
                          <span className="template-name">{tmpl.name}</span>
                          <span className="template-preview">{tmpl.body}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="compose-input-row">
                    <textarea className="compose-input"
                      placeholder="Type your message…"
                      rows={1}
                      value={composeText}
                      onChange={(e) => setComposeText(e.target.value)}
                      onKeyDown={handleComposeKey}
                      aria-label="Message input" />
                    <button className={`send-btn ${composeText.trim() ? 'active' : ''}`}
                      onClick={sendMessage}
                      disabled={!composeText.trim()}
                      aria-label="Send message">
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
          </div>

          {/* ══ RIGHT PANEL — Candidate Context ══ */}
          {activeConversation != null && activeConversation.role === 'Candidate' && (
            <aside className="context-panel">
              <div className="context-header">
                <span className="context-title">Candidate Info</span>
              </div>

              <div className="context-profile">
                <div className={`context-avatar context-avatar--${getAvatarColor(parseInt(activeConversation.userId.substring(0, 8), 16) % 5)}`}>
                  {getInitials(activeConversation.name)}
                </div>
                <span className="context-name">{activeConversation.name}</span>
                <span className="context-role-label">{activeConversation.role}</span>
                {activeConversation.jobTitle && (
                  <span className="context-job-badge">{activeConversation.jobTitle}</span>
                )}
              </div>

              <div className="context-divider" />

              {/* Application details */}
              <div className="context-section">
                <span className="context-section-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Application
                </span>
                <div className="context-info-grid">
                  <span className="cig-key">Stage</span>
                  <span className={`cig-val cig-val--stage stage-${(activeConversation.applicationStage ?? '').toLowerCase().replace(/\s/g, '')}`}>
                    {activeConversation.applicationStage}
                  </span>
                  <span className="cig-key">Match</span>
                  <span className={`cig-val cig-val--match match-${getMatchClass(activeConversation.matchScore)}`}>
                    {activeConversation.matchScore}%
                  </span>
                  <span className="cig-key">Applied</span>
                  <span className="cig-val">
                    {activeConversation.appliedDate ? new Date(activeConversation.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="context-divider" />

              {/* Skills */}
              <div className="context-section">
                <span className="context-section-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  Key Skills
                </span>
                <div className="context-skills">
                  {(activeConversation.skills ?? []).map((skill) => (
                    <span key={skill} className="context-skill">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="context-divider" />

              {/* Quick Actions */}
              <div className="context-section">
                <span className="context-section-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Quick Actions
                </span>
                <div className="context-actions">
                  {activeConversation.applicantId && (
                    <a href={`/company-applicants/${activeConversation.applicantId}`}
                      className="ctx-action-btn ctx-action-btn--profile">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      View Full Profile
                    </a>
                  )}
                  <button className="ctx-action-btn ctx-action-btn--schedule"
                    onClick={() => openScheduleModal(activeConversation)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Schedule Interview
                  </button>
                  <button className="ctx-action-btn ctx-action-btn--shortlist"
                    onClick={useShortlistTemplate}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Send Shortlist Notice
                  </button>
                </div>
              </div>
            </aside>
          )}

        </div>
      </div>

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        isVisible={showScheduleModal}
        isRescheduleMode={false}
        interview={modalInterview}
        interviewTime={modalInterviewTime}
        interviewerName={modalInterviewerName}
        onClose={() => setShowScheduleModal(false)}
        onConfirm={handleScheduleConfirm}
      />
    </div>
  );
};

export default CompanyMessages;
