import { useState, useMemo } from "react";
import {Sidebar} from "../../components/Sidebar";
import {PageHeader} from "../../components/PageHeader";
import "./Notifications.css";

// ── Models ───────────────────────────────────────────────────────────────────

interface NotificationItem {
  id: number;
  title: string;
  body: string;
  detailBody: string;
  category: string; // "Application" | "Match" | "System" | "Saved"
  timeAgo: string;
  dateGroup: string; // "Today" | "Yesterday" | "This Week"
  isRead: boolean;
  iconSvg: string;
  iconBg: string;
  badgeCss: string;
  actionLabel: string;
  actionTagCss: string;
  primaryAction: string;
  secondaryAction: string;
  metaItems: Record<string, string>;
}

interface CategoryItem {
  key: string;
  label: string;
  iconSvg: string;
  iconCss: string;
  count: number;
  hasUnread: boolean;
}

// ── Icon SVG constants ────────────────────────────────────────────────────────

const IconApplication = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const IconMatch = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const IconSystem = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const IconSaved = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const IconInterview = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const IconCheck = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`;
const IconResume = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="13,2 13,9 20,9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const IconCatAll = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/></svg>`;

// ── Static notification data ──────────────────────────────────────────────────

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  // TODAY
  {
    id: 1,
    title: "You've been shortlisted!",
    body: "NexaTech Solutions has shortlisted you for the Backend Intern position.",
    detailBody:
      "Congratulations! NexaTech Solutions reviewed your application and moved you to the Shortlisted stage. This means they are interested in your profile and may reach out soon to schedule an interview. Keep your profile updated and prepare for a potential interview.",
    category: "Application",
    dateGroup: "Today",
    timeAgo: "2h ago",
    isRead: false,
    iconSvg: IconCheck,
    iconBg: "notif-icon--green",
    badgeCss: "badge--green",
    actionLabel: "Shortlisted",
    actionTagCss: "tag--shortlisted",
    primaryAction: "View Application",
    secondaryAction: "Browse More Jobs",
    metaItems: {
      Company: "NexaTech Solutions",
      Position: "Backend Intern",
      Status: "Shortlisted",
      Applied: "Mar 28, 2025",
    },
  },
  {
    id: 2,
    title: "New job matches found",
    body: "12 new jobs match your resume — Full-Stack Developer roles are trending this week.",
    detailBody:
      "Based on your resume skills (C#, .NET, Blazor, PostgreSQL), we found 12 new job listings that closely match your profile. The top match is 91% — Full-Stack Developer Intern at CodeBridge Co. Don't miss out!",
    category: "Match",
    dateGroup: "Today",
    timeAgo: "4h ago",
    isRead: false,
    iconSvg: IconMatch,
    iconBg: "notif-icon--blue",
    badgeCss: "badge--blue",
    actionLabel: "12 matches",
    actionTagCss: "tag--match",
    primaryAction: "View Matches",
    secondaryAction: "",
    metaItems: {
      "Top Match": "91% — CodeBridge Co.",
      "Total Matches": "12 new listings",
      "Skills Matched": "C#, .NET, Blazor",
    },
  },
  {
    id: 3,
    title: "Application under review",
    body: "SoftForge Inc. has moved your Frontend Developer Intern application to Under Review.",
    detailBody:
      "Your application to SoftForge Inc. for the Frontend Developer Intern position is now Under Review. This means the hiring team is actively evaluating your profile. You'll be notified when there's an update.",
    category: "Application",
    dateGroup: "Today",
    timeAgo: "6h ago",
    isRead: false,
    iconSvg: IconApplication,
    iconBg: "notif-icon--amber",
    badgeCss: "badge--amber",
    actionLabel: "Under Review",
    actionTagCss: "tag--review",
    primaryAction: "View Application",
    secondaryAction: "",
    metaItems: {
      Company: "SoftForge Inc.",
      Position: "Frontend Developer Intern",
      Status: "Under Review",
      Applied: "Apr 5, 2025",
    },
  },

  // YESTERDAY
  {
    id: 4,
    title: "Resume parsed successfully",
    body: "Your uploaded resume has been parsed. 6 skills detected and matched against job listings.",
    detailBody:
      "We successfully extracted text from your uploaded PDF resume using our parsing engine. 6 skills were detected: C#, .NET, Blazor, PostgreSQL, HTML/CSS, Git. These skills are now being used in your job match score calculations. You can review and edit them in Resume & Profile.",
    category: "System",
    dateGroup: "Yesterday",
    timeAgo: "Yesterday, 3:14 PM",
    isRead: true,
    iconSvg: IconResume,
    iconBg: "notif-icon--slate",
    badgeCss: "badge--slate",
    actionLabel: "",
    actionTagCss: "",
    primaryAction: "View Resume & Profile",
    secondaryAction: "",
    metaItems: {
      "Skills Detected": "6 skills",
      File: "resume_clint.pdf",
      Parser: "iTextSharp (PDF)",
    },
  },
  {
    id: 5,
    title: "Saved job expiring soon",
    body: "API Developer (.NET) at ApexCore Solutions closes in 3 days. Apply before it's gone!",
    detailBody:
      "You saved the API Developer (.NET) listing at ApexCore Solutions. This listing is set to expire in 3 days. If you're interested, now is a good time to apply. The role offers a 62% match with your resume.",
    category: "Saved",
    dateGroup: "Yesterday",
    timeAgo: "Yesterday, 11:00 AM",
    isRead: false,
    iconSvg: IconSaved,
    iconBg: "notif-icon--red",
    badgeCss: "badge--red",
    actionLabel: "Closing soon",
    actionTagCss: "tag--danger",
    primaryAction: "Apply Now",
    secondaryAction: "View Listing",
    metaItems: {
      Company: "ApexCore Solutions",
      Position: "API Developer (.NET)",
      Closes: "Apr 13, 2025",
      "Match Score": "62%",
    },
  },
  {
    id: 6,
    title: "Interview scheduled",
    body: "CodeBridge Co. has scheduled an interview for Full-Stack Developer Intern on Apr 15.",
    detailBody:
      "Congratulations! CodeBridge Co. has confirmed an interview for you for the Full-Stack Developer Intern position. The interview is scheduled for April 15, 2025 at 10:00 AM. Make sure to prepare your portfolio, review the job description, and be ready to discuss your C# and Blazor experience.",
    category: "Application",
    dateGroup: "Yesterday",
    timeAgo: "Yesterday, 9:30 AM",
    isRead: true,
    iconSvg: IconInterview,
    iconBg: "notif-icon--green",
    badgeCss: "badge--green",
    actionLabel: "For Interview",
    actionTagCss: "tag--interview",
    primaryAction: "View Interview Details",
    secondaryAction: "Add to Calendar",
    metaItems: {
      Company: "CodeBridge Co.",
      Position: "Full-Stack Developer Intern",
      "Interview Date": "Apr 15, 2025",
      Time: "10:00 AM",
    },
  },

  // THIS WEEK
  {
    id: 7,
    title: "Profile strength increased",
    body: "You added your education and skills — profile strength is now at 100%. Great job!",
    detailBody:
      "Your profile is now complete. Adding your education, skills, and about section has boosted your profile strength to 100%. A complete profile increases your chances of being shortlisted by companies browsing applicants.",
    category: "System",
    dateGroup: "This Week",
    timeAgo: "Apr 7",
    isRead: true,
    iconSvg: IconSystem,
    iconBg: "notif-icon--blue",
    badgeCss: "badge--blue",
    actionLabel: "100% complete",
    actionTagCss: "tag--match",
    primaryAction: "View Profile",
    secondaryAction: "",
    metaItems: {
      "Profile Strength": "100%",
      "Last Updated": "Apr 7, 2025",
    },
  },
  {
    id: 8,
    title: "Application submitted",
    body: "Your application to TechSpark PH for .NET Core Developer has been submitted successfully.",
    detailBody:
      "Your application has been successfully submitted to TechSpark PH for the .NET Core Developer position. The company will review your profile and update your application status. You can track this in My Applications.",
    category: "Application",
    dateGroup: "This Week",
    timeAgo: "Apr 4",
    isRead: true,
    iconSvg: IconApplication,
    iconBg: "notif-icon--slate",
    badgeCss: "badge--slate",
    actionLabel: "Submitted",
    actionTagCss: "tag--submitted",
    primaryAction: "View Application",
    secondaryAction: "",
    metaItems: {
      Company: "TechSpark PH",
      Position: ".NET Core Developer",
      Status: "Submitted",
      Date: "Apr 4, 2025",
    },
  },
  {
    id: 9,
    title: "New listings in your area",
    body: "5 new Full-time positions opened in Makati City and BGC this week.",
    detailBody:
      "Based on your location preferences and job type filters, 5 new full-time listings have been posted this week in Makati City and BGC. These include roles in .NET development, backend engineering, and API development.",
    category: "Match",
    dateGroup: "This Week",
    timeAgo: "Apr 3",
    isRead: true,
    iconSvg: IconMatch,
    iconBg: "notif-icon--blue",
    badgeCss: "badge--blue",
    actionLabel: "5 new jobs",
    actionTagCss: "tag--match",
    primaryAction: "Browse Jobs",
    secondaryAction: "",
    metaItems: {
      Locations: "Makati City, BGC",
      "Job Types": "Full-time",
      "New Listings": "5 this week",
    },
  },
];

// ── Date group ordering for stable display ────────────────────────────────────
const DATE_GROUP_ORDER = ["Today", "Yesterday", "This Week"];

// ── Component ─────────────────────────────────────────────────────────────────
export function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );
  const [activeCategory, setActiveCategory] = useState("All");
  const [readFilter, setReadFilter] = useState("all");
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem>(
    INITIAL_NOTIFICATIONS[0]
  );

  // ── Derived ──
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const categories: CategoryItem[] = useMemo(
    () => [
      {
        key: "All",
        label: "All Notifications",
        iconSvg: IconCatAll,
        iconCss: "cat-icon--slate",
        count: notifications.length,
        hasUnread: notifications.some((n) => !n.isRead),
      },
      {
        key: "Application",
        label: "Applications",
        iconSvg: IconApplication,
        iconCss: "cat-icon--blue",
        count: notifications.filter((n) => n.category === "Application").length,
        hasUnread: notifications.some(
          (n) => n.category === "Application" && !n.isRead
        ),
      },
      {
        key: "Match",
        label: "Job Matches",
        iconSvg: IconMatch,
        iconCss: "cat-icon--green",
        count: notifications.filter((n) => n.category === "Match").length,
        hasUnread: notifications.some((n) => n.category === "Match" && !n.isRead),
      },
      {
        key: "Saved",
        label: "Saved Jobs",
        iconSvg: IconSaved,
        iconCss: "cat-icon--red",
        count: notifications.filter((n) => n.category === "Saved").length,
        hasUnread: notifications.some((n) => n.category === "Saved" && !n.isRead),
      },
      {
        key: "System",
        label: "System",
        iconSvg: IconSystem,
        iconCss: "cat-icon--slate",
        count: notifications.filter((n) => n.category === "System").length,
        hasUnread: false,
      },
    ],
    [notifications]
  );

  const displayedNotifications = useMemo(() => {
    let q = notifications;
    if (activeCategory !== "All")
      q = q.filter((n) => n.category === activeCategory);
    if (readFilter === "unread") q = q.filter((n) => !n.isRead);
    else if (readFilter === "read") q = q.filter((n) => n.isRead);
    return q;
  }, [notifications, activeCategory, readFilter]);

  const groupedNotifications = useMemo(() => {
    const map: Record<string, NotificationItem[]> = {};
    for (const n of displayedNotifications) {
      if (!map[n.dateGroup]) map[n.dateGroup] = [];
      map[n.dateGroup].push(n);
    }
    // Return in stable order
    return DATE_GROUP_ORDER.filter((g) => map[g]).map((g) => ({
      key: g,
      items: map[g],
    }));
  }, [displayedNotifications]);

  // ── Handlers ──
  function selectNotif(n: NotificationItem) {
    setSelectedNotif(n);
    // auto-mark as read on open
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
    );
  }

  function markRead(id: number) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    // keep selectedNotif in sync
    if (selectedNotif?.id === id)
      setSelectedNotif((prev) => prev && { ...prev, isRead: true });
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (selectedNotif)
      setSelectedNotif((prev) => prev && { ...prev, isRead: true });
  }

  function dismissNotif(id: number) {
    setNotifications((prev) => {
      const next = prev.filter((n) => n.id !== id);
      // if we dismissed the selected one, pick the first available in the new displayed list
      if (selectedNotif?.id === id) {
        const nextDisplayed = next.filter(
          (n) =>
            (activeCategory === "All" || n.category === activeCategory) &&
            (readFilter === "all" ||
              (readFilter === "unread" && !n.isRead) ||
              (readFilter === "read" && n.isRead))
        );
        setSelectedNotif(nextDisplayed[0] ?? null!);
      }
      return next;
    });
  }

  function clearAll() {
    setNotifications((prev) => {
      const next = prev.filter((n) => !n.isRead);
      if (selectedNotif && !next.find((n) => n.id === selectedNotif.id)) {
        setSelectedNotif(next[0] ?? null!);
      }
      return next;
    });
  }

  const STATUS_FILTERS = [
    { label: "All", value: "all" },
    { label: "Unread", value: "unread" },
    { label: "Read", value: "read" },
  ] as const;

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <PageHeader
          title="Notifications"
          subtitle={`${unreadCount} unread — stay on top of your job hunt`}
        >
          {unreadCount > 0 && (
            <button className="mark-all-btn" onClick={markAllRead}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Mark all as read
            </button>
          )}
          <button className="notif-settings-btn" title="Notification settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              <path
                d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </button>
        </PageHeader>

        {/* ── Body ── */}
        <div className="notif-body">

          {/* ══ LEFT — Filter Sidebar ══ */}
          <aside className="notif-sidebar">

            {/* Category filter */}
            <div className="nsb-section">
              <p className="nsb-label">Category</p>
              <div className="nsb-options">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    className={`nsb-item${activeCategory === cat.key ? " nsb-item--active" : ""}`}
                    onClick={() => setActiveCategory(cat.key)}
                  >
                    <span
                      className={`nsb-item-icon ${cat.iconCss}`}
                      dangerouslySetInnerHTML={{ __html: cat.iconSvg }}
                    />
                    <span className="nsb-item-label">{cat.label}</span>
                    {cat.count > 0 && (
                      <span
                        className={`nsb-item-count${cat.hasUnread ? " nsb-count--unread" : ""}`}
                      >
                        {cat.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="nsb-divider" />

            {/* Read/Unread filter */}
            <div className="nsb-section">
              <p className="nsb-label">Status</p>
              <div className="nsb-options">
                {STATUS_FILTERS.map((s) => (
                  <button
                    key={s.value}
                    className={`nsb-item${readFilter === s.value ? " nsb-item--active" : ""}`}
                    onClick={() => setReadFilter(s.value)}
                  >
                    <span className="nsb-item-label">{s.label}</span>
                    {s.value === "unread" && unreadCount > 0 && (
                      <span className="nsb-item-count nsb-count--unread">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="nsb-divider" />

            {/* Quick actions */}
            <div className="nsb-section">
              <p className="nsb-label">Quick Actions</p>
              <button className="nsb-action" onClick={markAllRead}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
                Mark all read
              </button>
              <button className="nsb-action nsb-action--danger" onClick={clearAll}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <polyline
                    points="3,6 5,6 21,6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Clear all read
              </button>
            </div>

          </aside>

          {/* ══ CENTER — Notification List ══ */}
          <section className="notif-list-section">

            {displayedNotifications.length === 0 ? (
              <div className="notif-empty">
                <div className="notif-empty-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                      stroke="#CBD5E1"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <p className="notif-empty-title">All caught up!</p>
                <p className="notif-empty-sub">No notifications in this category.</p>
              </div>
            ) : (
              groupedNotifications.map(({ key: groupKey, items }) => (
                <div key={groupKey} className="notif-date-group">
                  <div className="notif-date-label">
                    <span>{groupKey}</span>
                  </div>

                  <div className="notif-items">
                    {items.map((n) => (
                      <div
                        key={n.id}
                        className={[
                          "notif-item",
                          !n.isRead ? "notif-item--unread" : "",
                          selectedNotif?.id === n.id ? "notif-item--selected" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => selectNotif(n)}
                      >
                        {/* Unread dot */}
                        <div
                          className={`notif-unread-dot${n.isRead ? " notif-unread-dot--hidden" : ""}`}
                        />

                        {/* Icon */}
                        <div
                          className={`notif-icon-wrap ${n.iconBg}`}
                          dangerouslySetInnerHTML={{ __html: n.iconSvg }}
                        />

                        {/* Content */}
                        <div className="notif-content">
                          <div className="notif-row-top">
                            <span
                              className={`notif-title${!n.isRead ? " notif-title--bold" : ""}`}
                            >
                              {n.title}
                            </span>
                            <span className="notif-time">{n.timeAgo}</span>
                          </div>
                          <p className="notif-body-text">{n.body}</p>
                          {n.actionLabel && (
                            <span className={`notif-action-tag ${n.actionTagCss}`}>
                              {n.actionLabel}
                            </span>
                          )}
                        </div>

                        {/* Row actions */}
                        <div className="notif-item-actions">
                          {!n.isRead && (
                            <button
                              className="notif-action-btn"
                              title="Mark as read"
                              onClick={(e) => {
                                e.stopPropagation();
                                markRead(n.id);
                              }}
                            >
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M20 6L9 17l-5-5"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                          )}
                          <button
                            className="notif-action-btn notif-action-btn--delete"
                            title="Dismiss"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotif(n.id);
                            }}
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M18 6L6 18M6 6l12 12"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}

          </section>

          {/* ══ RIGHT — Notification Detail ══ */}
          <aside className="notif-detail-panel">

            {!selectedNotif ? (
              <div className="nd-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="nd-empty-title">Select a notification</p>
                <p className="nd-empty-sub">
                  Click any notification to view details here.
                </p>
              </div>
            ) : (
              <div className="nd-content">

                <div className="nd-header">
                  <div
                    className={`nd-icon-wrap ${selectedNotif.iconBg}`}
                    dangerouslySetInnerHTML={{ __html: selectedNotif.iconSvg }}
                  />
                  <div className="nd-header-meta">
                    <span className={`nd-category-badge ${selectedNotif.badgeCss}`}>
                      {selectedNotif.category}
                    </span>
                    <span className="nd-time">{selectedNotif.timeAgo}</span>
                  </div>
                </div>

                <h2 className="nd-title">{selectedNotif.title}</h2>
                <p className="nd-body">{selectedNotif.body}</p>

                {selectedNotif.detailBody && (
                  <p className="nd-detail-body">{selectedNotif.detailBody}</p>
                )}

                {Object.keys(selectedNotif.metaItems).length > 0 && (
                  <div className="nd-meta-grid">
                    {Object.entries(selectedNotif.metaItems).map(([k, v]) => (
                      <div key={k} className="nd-meta-item">
                        <span className="nd-meta-label">{k}</span>
                        <span className="nd-meta-value">{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedNotif.primaryAction && (
                  <div className="nd-actions">
                    <button className="nd-btn-primary">
                      {selectedNotif.primaryAction}
                    </button>
                    {selectedNotif.secondaryAction && (
                      <button className="nd-btn-secondary">
                        {selectedNotif.secondaryAction}
                      </button>
                    )}
                  </div>
                )}

                <div className="nd-footer">
                  {!selectedNotif.isRead && (
                    <button
                      className="nd-footer-btn"
                      onClick={() => markRead(selectedNotif.id)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M20 6L9 17l-5-5"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      Mark as read
                    </button>
                  )}
                  <button
                    className="nd-footer-btn nd-footer-btn--danger"
                    onClick={() => dismissNotif(selectedNotif.id)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M18 6L6 18M6 6l12 12"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    Dismiss
                  </button>
                </div>

              </div>
            )}

          </aside>

        </div>
      </main>
    </div>
  );
}
