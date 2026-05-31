import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {Sidebar} from "../../components/Sidebar";
import {PageHeader} from "../../components/PageHeader";
import "./Notifications.css";
import { notificationsService, type NotificationDto } from "../../services/notificationsService";
import { NotificationsSkeleton } from "./NotificationsSkeleton";

// ── Models ───────────────────────────────────────────────────────────────────

interface NotificationItem {
  id: string;
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
const IconCatAll = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/></svg>`;

// ── Date group ordering for stable display ────────────────────────────────────
const DATE_GROUP_ORDER = ["Today", "Yesterday", "This Week"];
const APPLICATION_STATUS_LABELS: Record<string, string> = {
  "0": "Submitted",
  "1": "Under Review",
  "2": "Shortlisted",
  "3": "For Interview",
  "4": "Declined",
  "5": "Decided",
  Submitted: "Submitted",
  UnderReview: "Under Review",
  Shortlisted: "Shortlisted",
  ForInterview: "For Interview",
  Declined: "Declined",
  Decided: "Decided",
};
const APPLICATION_STAGE_LABELS: Record<string, string> = {
  "0": "Submitted",
  "1": "Submitted",
  "2": "Under Review",
  "3": "Shortlisted",
  "4": "For Interview",
  "5": "Decided",
};

function formatApplicationStatus(value: string): string {
  return APPLICATION_STATUS_LABELS[value] || value;
}

function formatApplicationStage(value: string): string {
  return APPLICATION_STAGE_LABELS[value] || formatApplicationStatus(value);
}

function getDateGroup(date: Date): string {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfThatDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((startOfToday.getTime() - startOfThatDay.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return "This Week";
}

function getTimeAgo(createdAt: string): string {
  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 60) return `${Math.max(diffMin, 1)}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const group = getDateGroup(date);
  if (group === "Yesterday") {
    return `Yesterday, ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
  }

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getIconFor(dto: NotificationDto): { iconSvg: string; iconBg: string; badgeCss: string; actionTagCss: string } {
  const actionLabel = formatApplicationStatus(dto.actionLabel);

  if (dto.category === "Saved") {
    return { iconSvg: IconSaved, iconBg: "notif-icon--red", badgeCss: "badge--red", actionTagCss: "tag--danger" };
  }
  if (dto.category === "Match") {
    return { iconSvg: IconMatch, iconBg: "notif-icon--blue", badgeCss: "badge--blue", actionTagCss: "tag--match" };
  }
  if (dto.category === "System") {
    return { iconSvg: IconSystem, iconBg: "notif-icon--slate", badgeCss: "badge--slate", actionTagCss: "tag--match" };
  }

  // Application
  if (actionLabel === "Shortlisted") {
    return { iconSvg: IconCheck, iconBg: "notif-icon--green", badgeCss: "badge--green", actionTagCss: "tag--shortlisted" };
  }
  if (actionLabel === "Under Review") {
    return { iconSvg: IconApplication, iconBg: "notif-icon--amber", badgeCss: "badge--amber", actionTagCss: "tag--review" };
  }
  if (actionLabel === "For Interview") {
    return { iconSvg: IconInterview, iconBg: "notif-icon--green", badgeCss: "badge--green", actionTagCss: "tag--interview" };
  }
  if (actionLabel === "Submitted") {
    return { iconSvg: IconApplication, iconBg: "notif-icon--slate", badgeCss: "badge--slate", actionTagCss: "tag--submitted" };
  }
  if (actionLabel === "Declined") {
    return { iconSvg: IconApplication, iconBg: "notif-icon--red", badgeCss: "badge--red", actionTagCss: "tag--danger" };
  }
  if (actionLabel === "Decided") {
    return { iconSvg: IconCheck, iconBg: "notif-icon--green", badgeCss: "badge--green", actionTagCss: "tag--decided" };
  }

  return { iconSvg: IconApplication, iconBg: "notif-icon--blue", badgeCss: "badge--blue", actionTagCss: "tag--match" };
}

function mapNotification(dto: NotificationDto): NotificationItem {
  const createdAt = dto.createdAt;
  const date = new Date(createdAt);
  const { iconSvg, iconBg, badgeCss, actionTagCss } = getIconFor(dto);
  const actionLabel = formatApplicationStatus(dto.actionLabel);

  return {
    id: dto.id,
    title: dto.title,
    body: dto.body,
    detailBody: dto.detailBody,
    category: dto.category,
    timeAgo: getTimeAgo(createdAt),
    dateGroup: getDateGroup(date),
    isRead: dto.isRead,
    iconSvg,
    iconBg,
    badgeCss,
    actionLabel,
    actionTagCss: actionLabel ? actionTagCss : "",
    primaryAction: dto.primaryAction,
    secondaryAction: dto.secondaryAction,
    metaItems: dto.metaItems || {},
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
export function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [readFilter, setReadFilter] = useState("all");
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);

      const result = await notificationsService.getNotifications();
      if (result.isSuccess && result.value) {
        const items = result.value.map(mapNotification);
        setNotifications(items);
        setSelectedNotif(items[0] ?? null);
      } else {
        setNotifications([]);
        setSelectedNotif(null);
        setLoadError(result.error || "Failed to load notifications");
      }

      setIsLoading(false);
    };

    load();
  }, []);

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
    const s = searchQuery.trim().toLowerCase();
    if (s) {
      q = q.filter((n) => {
        const haystack = `${n.title} ${n.body} ${n.detailBody}`.toLowerCase();
        return haystack.includes(s);
      });
    }
    return q;
  }, [notifications, activeCategory, readFilter, searchQuery]);

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
    if (!n.isRead) {
      void markRead(n.id);
    }
  }

  async function markRead(id: string) {
    // optimistic
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    if (selectedNotif?.id === id) setSelectedNotif((prev) => (prev ? { ...prev, isRead: true } : prev));

    const result = await notificationsService.markRead(id);
    if (!result.isSuccess) {
      // revert on failure
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
      if (selectedNotif?.id === id) setSelectedNotif((prev) => (prev ? { ...prev, isRead: false } : prev));
    }
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (selectedNotif) setSelectedNotif((prev) => (prev ? { ...prev, isRead: true } : prev));

    const result = await notificationsService.markAllRead();
    if (!result.isSuccess) {
      // fallback: refresh from server state
      const refreshed = await notificationsService.getNotifications();
      if (refreshed.isSuccess && refreshed.value) {
        const items = refreshed.value.map(mapNotification);
        setNotifications(items);
        setSelectedNotif(items.find(x => x.id === selectedNotif?.id) ?? items[0] ?? null);
      } else {
        setLoadError(result.error || "Failed to mark all as read");
      }
    }
  }

  async function dismissNotif(id: string) {
    // optimistic
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (selectedNotif?.id === id) setSelectedNotif(null);

    const result = await notificationsService.dismiss(id);
    if (!result.isSuccess) {
      // fallback: refresh
      const refreshed = await notificationsService.getNotifications();
      if (refreshed.isSuccess && refreshed.value) {
        const items = refreshed.value.map(mapNotification);
        setNotifications(items);
        setSelectedNotif(items[0] ?? null);
      } else {
        setLoadError(result.error || "Failed to dismiss notification");
      }
    }
  }

  async function clearAll() {
    // optimistic remove read
    setNotifications((prev) => prev.filter((n) => !n.isRead));
    if (selectedNotif?.isRead) setSelectedNotif(null);

    const result = await notificationsService.clearRead();
    if (!result.isSuccess) {
      const refreshed = await notificationsService.getNotifications();
      if (refreshed.isSuccess && refreshed.value) {
        const items = refreshed.value.map(mapNotification);
        setNotifications(items);
        setSelectedNotif(items[0] ?? null);
      } else {
        setLoadError(result.error || "Failed to clear read notifications");
      }
    }
  }

  const STATUS_FILTERS = [
    { label: "All", value: "all" },
    { label: "Unread", value: "unread" },
    { label: "Read", value: "read" },
  ] as const;

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="main-content">
        <PageHeader
          title="Notifications"
          subtitle={`${unreadCount} unread — stay on top of your job hunt`}
          onMenuToggle={() => setIsSidebarOpen((value) => !value)}
        >
          <div className="search-wrap">
            <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link to="/notifications" className="notif-btn" aria-label="Notifications">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {unreadCount > 0 && <span className="notif-indicator" />}
          </Link>
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

            {isLoading ? (
              <NotificationsSkeleton />
            ) : loadError ? (
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
                <p className="notif-empty-title">Failed to load notifications</p>
                <p className="notif-empty-sub">{loadError}</p>
              </div>
            ) : displayedNotifications.length === 0 ? (
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
                    {Object.entries(selectedNotif.metaItems)
                      .filter(([k]) => !['JobId', 'ApplicationId'].includes(k))
                      .map(([k, v]) => {
                        const displayValue = k === 'Stage'
                          ? formatApplicationStage(v)
                          : k === 'Status'
                            ? formatApplicationStatus(v)
                            : v;
                        return (
                          <div key={k} className="nd-meta-item">
                            <span className="nd-meta-label">{k}</span>
                            <span className="nd-meta-value">{displayValue}</span>
                          </div>
                        );
                      })}
                  </div>
                )}

                {selectedNotif.primaryAction && (
                  <div className="nd-actions">
                    <Link to={selectedNotif.metaItems.JobId ? `/job/${selectedNotif.metaItems.JobId}` : '#'} className="nd-btn-primary">
                      {selectedNotif.primaryAction}
                    </Link>
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
