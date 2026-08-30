import { Link, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { authService } from '@/shared/api/authService';
import { notificationsService } from '@/shared/api/notificationsService';
import { studentDashboardService } from '@/shared/api/studentDashboardService';
import { lockBodyScroll } from '@/shared/lib/bodyScrollLock';
import './Sidebar.css';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface StudentSidebarData {
  studentName: string;
  profilePictureUrl: string | null;
  newMatchesCount: number;
  applicationsCount: number;
  newListingsTodayCount: number;
  unreadNotificationsCount: number;
}

const defaultSidebarData: StudentSidebarData = {
  studentName: 'Student',
  profilePictureUrl: null,
  newMatchesCount: 0,
  applicationsCount: 0,
  newListingsTodayCount: 0,
  unreadNotificationsCount: 0,
};

let cachedSidebarData: StudentSidebarData | null = null;
let sidebarDataPromise: Promise<StudentSidebarData> | null = null;

const loadStudentSidebarData = async (): Promise<StudentSidebarData> => {
  if (sidebarDataPromise) return sidebarDataPromise;

  sidebarDataPromise = Promise.all([
    studentDashboardService.getDashboard(),
    notificationsService.getNotifications()
  ])
    .then(([dashboardResult, notificationsResult]) => {
      const nextData = { ...(cachedSidebarData ?? defaultSidebarData) };

      if (dashboardResult.isSuccess && dashboardResult.value) {
        nextData.studentName = dashboardResult.value.studentName || 'Student';
        nextData.profilePictureUrl = dashboardResult.value.profilePictureUrl ?? null;
        nextData.newMatchesCount = dashboardResult.value.newMatchesCount;
        nextData.applicationsCount = dashboardResult.value.appliedCount;
        nextData.newListingsTodayCount = dashboardResult.value.newListingsTodayCount;
      }

      if (notificationsResult.isSuccess && notificationsResult.value) {
        nextData.unreadNotificationsCount = notificationsResult.value.filter(
          notification => !notification.isRead
        ).length;
      }

      cachedSidebarData = nextData;
      return nextData;
    })
    .finally(() => {
      sidebarDataPromise = null;
    });

  return sidebarDataPromise;
};

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const prevPathnameRef = useRef(location.pathname);
  const [sidebarData, setSidebarData] = useState<StudentSidebarData>(
    cachedSidebarData ?? defaultSidebarData
  );

  useEffect(() => {
    let isMounted = true;

    loadStudentSidebarData().then((nextData) => {
      if (isMounted) setSidebarData(nextData);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ profilePictureUrl?: string | null }>;
      const nextUrl = customEvent.detail?.profilePictureUrl;
      if (typeof nextUrl === 'string' && nextUrl.trim()) {
        cachedSidebarData = {
          ...(cachedSidebarData ?? defaultSidebarData),
          profilePictureUrl: nextUrl,
        };
        setSidebarData(prev => ({ ...prev, profilePictureUrl: nextUrl }));
      }
    };

    window.addEventListener('nexapply:profilePictureUpdated', handler as EventListener);
    return () => {
      window.removeEventListener('nexapply:profilePictureUpdated', handler as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    return lockBodyScroll();
  }, [isOpen]);

  useEffect(() => {
    if (prevPathnameRef.current !== location.pathname) {
      if (isOpen) onClose?.();
      prevPathnameRef.current = location.pathname;
    }
  }, [location.pathname, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleNavClick = () => {
    if (isOpen) onClose?.();
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const studentInitials = useMemo(() => {
    const initials = sidebarData.studentName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('');

    return initials || 'S';
  }, [sidebarData.studentName]);

  return (
    <>
      <button
        type="button"
        className={`sidebar-overlay ${isOpen ? 'is-visible' : ''}`}
        onClick={onClose}
        aria-label="Close navigation menu"
      />
      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`} aria-label="Student navigation">

      <div className="brand-wrap">
        <div className="brand-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" fill="#1D4ED8"/>
            <path d="M10 10V18M10 10L18 18M18 18V10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="brand-name">NexApply</span>
      </div>

      <div className="sidebar-profile-card">
        <div className="avatar-ring">
          {sidebarData.profilePictureUrl ? (
            <img className="avatar-image" src={sidebarData.profilePictureUrl} alt={`${sidebarData.studentName} profile`} />
          ) : (
            <span className="avatar-initials">{studentInitials}</span>
          )}
        </div>
        <div className="profile-meta">
          <span className="profile-name">{sidebarData.studentName}</span>
          <span className="profile-badge">
            <span className="badge-dot" aria-hidden="true"></span>Student
          </span>
        </div>
        <Link to="/student-profile" className="profile-chevron" title="Edit profile" aria-label="Edit profile" onClick={handleNavClick}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Link>
      </div>

      <nav className="nav-section">
        <p className="nav-group-label">Overview</p>

        <Link
          to="/dashboard"
          className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          aria-current={isActive('/dashboard') ? 'page' : undefined}
          onClick={handleNavClick}
        >
          <span className="nav-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          Dashboard
        </Link>

        <Link
          to="/browse-jobs"
          className={`nav-item ${isActive('/browse-jobs') ? 'active' : ''}`}
          aria-current={isActive('/browse-jobs') ? 'page' : undefined}
          onClick={handleNavClick}
        >
          <span className="nav-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          For You
          {sidebarData.newMatchesCount > 0 && <span className="nav-badge">{sidebarData.newMatchesCount}</span>}
        </Link>

        <Link
          to="/my-applications"
          className={`nav-item ${isActive('/my-applications') ? 'active' : ''}`}
          aria-current={isActive('/my-applications') ? 'page' : undefined}
          onClick={handleNavClick}
        >
          <span className="nav-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          My Applications
          {sidebarData.applicationsCount > 0 && <span className="nav-badge-neutral">{sidebarData.applicationsCount}</span>}
        </Link>

        <Link
          to="/student-profile"
          className={`nav-item ${isActive('/student-profile') ? 'active' : ''}`}
          aria-current={isActive('/student-profile') ? 'page' : undefined}
          onClick={handleNavClick}
        >
          <span className="nav-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="13,2 13,9 20,9" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Resume & Profile
        </Link>

        <p className="nav-group-label nav-group-label--spaced">Discover</p>

        <Link
          to="/job-board"
          className={`nav-item ${isActive('/job-board') ? 'active' : ''}`}
          aria-current={isActive('/job-board') ? 'page' : undefined}
          onClick={handleNavClick}
        >
          <span className="nav-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          Job Board
          {sidebarData.newListingsTodayCount > 0 && <span className="nav-badge-green">New</span>}
        </Link>

        <Link
          to="/notifications"
          className={`nav-item ${isActive('/notifications') ? 'active' : ''}`}
          aria-current={isActive('/notifications') ? 'page' : undefined}
          onClick={handleNavClick}
        >
          <span className="nav-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Notifications
          {sidebarData.unreadNotificationsCount > 0 && <span className="nav-dot"></span>}
        </Link>

        <Link
          to="/messages"
          className={`nav-item ${isActive('/messages') ? 'active' : ''}`}
          aria-current={isActive('/messages') ? 'page' : undefined}
          onClick={handleNavClick}
        >
          <span className="nav-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Messages
        </Link>

        <Link
          to="/saved-jobs"
          className={`nav-item ${isActive('/saved-jobs') ? 'active' : ''}`}
          aria-current={isActive('/saved-jobs') ? 'page' : undefined}
          onClick={handleNavClick}
        >
          <span className="nav-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Saved
        </Link>
      </nav>

      <div className="sidebar-footer">
        <Link
          to="/settings"
          className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
          aria-current={isActive('/settings') ? 'page' : undefined}
          onClick={handleNavClick}
        >
          <span className="nav-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
                    stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          Settings
        </Link>

        <button
          type="button"
          className="nav-item nav-item--logout"
          onClick={() => authService.logout()}
        >
          <span className="nav-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          Log out
        </button>
      </div>
    </aside>
    </>
  );
}
