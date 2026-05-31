import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { Sidebar } from '../../components/Sidebar';
import { PageHeader } from '../../components/PageHeader';
import { studentProfileService, type UpdateStudentProfileCommand } from '../../services/studentProfileService';
import { ProfileSkeleton } from './ProfileSkeleton';
import './StudentProfile.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

interface ResumeEntry {
  id: string;
  organization: string;
  period: string;
  title: string;
  description: string;
}

interface SkillItem {
  name: string;
}

const getFileTypeFromName = (fileName: string) => {
  const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  if (extension === '.pdf') return 'pdf';
  if (extension === '.jpg' || extension === '.jpeg' || extension === '.png') return 'image';
  if (extension === '.docx') return 'docx';
  return '';
};

const bytesToBase64 = (bytes: Uint8Array) => {
  const chunkSize = 0x8000;
  let binary = '';

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
};

const formatDateRange = (start?: string, end?: string, isCurrent?: boolean): string => {
  if (!start) return '';
  const startDate = new Date(start);
  const startStr = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  if (isCurrent) return `${startStr} - Present`;
  if (!end) return startStr;
  const endDate = new Date(end);
  const endStr = endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return `${startStr} - ${endStr}`;
};

function PdfResumePreview({ fileUrl }: { fileUrl: string }) {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [isRendering, setIsRendering] = useState(true);
  const [renderError, setRenderError] = useState('');

  useEffect(() => {
    let isCancelled = false;

    const renderPdf = async () => {
      const host = canvasHostRef.current;
      if (!host) return;

      setIsRendering(true);
      setRenderError('');
      host.replaceChildren();

      try {
        const pdf = await pdfjsLib.getDocument(fileUrl).promise;
        if (isCancelled) return;

        setPageCount(pdf.numPages);

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          if (isCancelled) return;

          const baseViewport = page.getViewport({ scale: 1 });
          const targetWidth = Math.min(820, Math.max(320, host.clientWidth - 24));
          const scale = targetWidth / baseViewport.width;
          const viewport = page.getViewport({ scale });
          const pixelRatio = window.devicePixelRatio || 1;
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!context) continue;

          canvas.width = Math.floor(viewport.width * pixelRatio);
          canvas.height = Math.floor(viewport.height * pixelRatio);
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;
          canvas.className = 'resume-pdf-canvas';
          context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

          await page.render({ canvas, canvasContext: context, viewport }).promise;

          if (!isCancelled) {
            host.appendChild(canvas);
          }
        }
      } catch {
        if (!isCancelled) {
          setRenderError('We could not preview this PDF here. You can still open or download it.');
        }
      } finally {
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    };

    renderPdf();

    return () => {
      isCancelled = true;
    };
  }, [fileUrl]);

  return (
    <div className="resume-pdf-preview">
      <div className="resume-pdf-status">
        <span>PDF preview</span>
        {pageCount > 0 && <span>{pageCount} page{pageCount > 1 ? 's' : ''}</span>}
      </div>
      {isRendering && (
        <div className="resume-pdf-loading">
          <svg className="spin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
          Rendering preview...
        </div>
      )}
      {renderError && <div className="resume-pdf-error">{renderError}</div>}
      <div ref={canvasHostRef} className="resume-pdf-pages" />
    </div>
  );
}

export function StudentProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Profile state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('user@example.com');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [gitHub, setGitHub] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  
  // Snapshot for cancel
  const [snapshot, setSnapshot] = useState({
    fullName: '', phone: '', location: '', linkedIn: '', gitHub: ''
  });
  
  // Resume state
  const [resumeMode, setResumeMode] = useState<'upload' | 'build'>('build');
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeUploadPercent, setResumeUploadPercent] = useState<number | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFileDataUrl, setUploadedFileDataUrl] = useState('');
  const [uploadedFileType, setUploadedFileType] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  
  // Resume builder state
  const [resumeName, setResumeName] = useState('');
  const [resumeHeadline, setResumeHeadline] = useState('');
  const [resumePhone, setResumePhone] = useState('');
  const [resumeEmail, setResumeEmail] = useState('');
  const [resumeLocation, setResumeLocation] = useState('');
  const [resumeAbout, setResumeAbout] = useState('');
  const [education, setEducation] = useState<ResumeEntry[]>([]);
  const [experience, setExperience] = useState<ResumeEntry[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  const loadProfileData = async () => {
    setIsLoading(true);
    setLoadError(null);
    
    const result = await studentProfileService.getProfile();
    if (result.isSuccess && result.value) {
      const profile = result.value;
      setFullName(profile.fullName);
      setPhone(profile.phone || '');
      setLocation(profile.location || '');
      setLinkedIn(profile.linkedIn || '');
      setGitHub(profile.gitHub || '');
      setProfilePictureUrl(profile.profilePictureUrl || '');
      
      if (profile.resumeFilePath) {
        setResumeMode('upload');
        setUploadedFileName(profile.resumeFilePath);
        setUploadedFileType(getFileTypeFromName(profile.resumeFilePath));
        await loadUploadedResumePreview(profile.resumeFilePath);
      }
    } else {
      setLoadError(result.error || 'Failed to load profile');
    }
    
    // Load resume content (includes email)
    const resumeResult = await studentProfileService.getResumeContent();
    if (resumeResult.isSuccess && resumeResult.value) {
      const resume = resumeResult.value;
      setEmail(resume.email || '');
      setResumeName(resume.fullName || '');
      setResumeHeadline(resume.headline || '');
      setResumePhone(resume.phone || '');
      setResumeEmail(resume.email || '');
      setResumeLocation(resume.location || '');
      setResumeAbout(resume.aboutMe || '');
      
      setEducation(resume.education.map(e => ({
        id: e.id,
        organization: e.institution,
        period: `${e.startYear || ''}-${e.endYear || ''}`,
        title: e.degree + (e.field ? ` in ${e.field}` : ''),
        description: e.description || ''
      })));
      
      setExperience(resume.workExperience.map(w => ({
        id: w.id,
        organization: w.company,
        period: formatDateRange(w.startDate, w.endDate, w.isCurrent),
        title: w.position,
        description: w.description || ''
      })));
      
      setSkills(resume.skills.map(s => ({ name: s })));
    } else {
      console.error('Failed to load resume:', resumeResult.error);
    }
    
    setIsLoading(false);
  };

  const loadUploadedResumePreview = async (fileName: string) => {
    const fileType = getFileTypeFromName(fileName);
    if (fileType !== 'pdf' && fileType !== 'image') return;

    const result = await studentProfileService.getUploadedResumeFile();
    if (result.isSuccess && result.value) {
      setUploadedFileDataUrl(URL.createObjectURL(result.value));
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEditProfile = () => {
    setSnapshot({ fullName, phone, location, linkedIn, gitHub });
    setIsEditingProfile(true);
  };

  const cancelEditProfile = () => {
    setFullName(snapshot.fullName);
    setPhone(snapshot.phone);
    setLocation(snapshot.location);
    setLinkedIn(snapshot.linkedIn);
    setGitHub(snapshot.gitHub);
    setIsEditingProfile(false);
  };

  const saveProfile = async () => {
    const command: UpdateStudentProfileCommand = {
      fullName,
      phone: phone || undefined,
      location: location || undefined,
      linkedIn: linkedIn || undefined,
      gitHub: gitHub || undefined,
      profilePictureUrl: profilePictureUrl || undefined,
    };
    
    const result = await studentProfileService.updateProfile(command);
    if (result.isSuccess) {
      setIsEditingProfile(false);
    } else {
      alert(result.error || 'Failed to save profile');
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerProfilePhotoUpload = () => {
    profilePhotoInputRef.current?.click();
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Only image files are accepted.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Profile photo must be under 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) return;
      const previousUrl = profilePictureUrl;
      setProfilePictureUrl(dataUrl);

      const result = await studentProfileService.updateProfile({
        fullName,
        phone: phone || undefined,
        location: location || undefined,
        linkedIn: linkedIn || undefined,
        gitHub: gitHub || undefined,
        profilePictureUrl: dataUrl,
      });

      if (result.isSuccess) {
        window.dispatchEvent(
          new CustomEvent('nexapply:profilePictureUpdated', {
            detail: { profilePictureUrl: dataUrl }
          })
        );
      } else {
        setProfilePictureUrl(previousUrl);
        alert(result.error || 'Failed to save profile photo');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const allowedExtensions = ['.pdf', '.docx', '.jpg', '.jpeg', '.png'];

    if (!allowedExtensions.includes(ext)) {
      setUploadMessage('Only PDF, DOCX, JPG, or PNG files are accepted.');
      setUploadSuccess(false);
      setTimeout(() => setUploadMessage(''), 4000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage('File size must be under 5 MB.');
      setUploadSuccess(false);
      setTimeout(() => setUploadMessage(''), 4000);
      return;
    }

    setIsUploadingResume(true);
    setResumeUploadPercent(0);
    setUploadMessage('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const fileBytes = new Uint8Array(arrayBuffer);

      let mimeType: string;
      let fileType: string;
      
      if (ext === '.pdf') {
        mimeType = 'application/pdf';
        fileType = 'pdf';
      } else if (ext === '.jpg' || ext === '.jpeg') {
        mimeType = 'image/jpeg';
        fileType = 'image';
      } else if (ext === '.png') {
        mimeType = 'image/png';
        fileType = 'image';
      } else {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        fileType = 'docx';
      }

      const result = await studentProfileService.uploadResume(file, setResumeUploadPercent);

      if (result.isSuccess) {
        const base64 = bytesToBase64(fileBytes);
        setUploadedFileDataUrl(`data:${mimeType};base64,${base64}`);
        setUploadedFileName(result.value?.filePath || file.name);
        setUploadedFileType(fileType);
        setResumeMode('upload');
        setUploadSuccess(true);
        setUploadMessage(`'${file.name}' uploaded successfully!`);
      } else {
        setUploadSuccess(false);
        setUploadMessage(result.error || 'Failed to upload resume');
      }
    } catch {
      setUploadSuccess(false);
      setUploadMessage('An error occurred while uploading the file.');
    } finally {
      setIsUploadingResume(false);
      setResumeUploadPercent(null);
      setTimeout(() => setUploadMessage(''), 5000);
    }
  };

  const toggleResumeEdit = async () => {
    if (isEditingResume) {
      // Save profile data (name, phone, location) if changed in resume builder
      if (resumeName !== fullName || resumePhone !== phone || resumeLocation !== location) {
        const profileResult = await studentProfileService.updateProfile({
          fullName: resumeName || fullName,
          phone: resumePhone || phone || undefined,
          location: resumeLocation || location || undefined,
          linkedIn: linkedIn || undefined,
          gitHub: gitHub || undefined,
        });

        if (profileResult.isSuccess) {
          setFullName(resumeName || fullName);
          setPhone(resumePhone || phone);
          setLocation(resumeLocation || location);
        } else {
          console.error('Failed to save profile:', profileResult.error);
        }
      }

      // Save resume data
      const educationJson = JSON.stringify(
        education
          .filter(e => e.organization || e.title)
          .map(e => ({
            Organization: e.organization,
            Period: e.period,
            Title: e.title,
            Description: e.description
          }))
      );

      const experienceJson = JSON.stringify(
        experience
          .filter(e => e.organization || e.title)
          .map(e => ({
            Organization: e.organization,
            Period: e.period,
            Title: e.title,
            Description: e.description
          }))
      );

      const skillsJson = JSON.stringify(
        skills.filter(s => s.name.trim()).map(s => s.name)
      );

      console.log('Saving resume:', {
        headline: resumeHeadline,
        aboutMe: resumeAbout,
        educationJson,
        experienceJson,
        skillsJson
      });

      const result = await studentProfileService.updateResume({
        headline: resumeHeadline || undefined,
        aboutMe: resumeAbout || undefined,
        educationJson,
        workExperienceJson: experienceJson,
        skillsJson
      });

      if (!result.isSuccess) {
        console.error('Failed to save resume:', result.error);
        alert(result.error || 'Failed to save resume');
        return;
      }

      setUploadedFileDataUrl('');
      setUploadedFileName('');
      setUploadedFileType('');
      
      console.log('Resume saved successfully');
    }
    setIsEditingResume(!isEditingResume);
  };

  const addEducation = () => {
    setEducation([...education, { id: crypto.randomUUID(), organization: '', period: '', title: '', description: '' }]);
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter(e => e.id !== id));
  };

  const updateEducation = (id: string, field: keyof ResumeEntry, value: string) => {
    setEducation(education.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const addExperience = () => {
    setExperience([...experience, { id: crypto.randomUUID(), organization: '', period: '', title: '', description: '' }]);
  };

  const removeExperience = (id: string) => {
    setExperience(experience.filter(e => e.id !== id));
  };

  const updateExperience = (id: string, field: keyof ResumeEntry, value: string) => {
    setExperience(experience.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const addSkill = () => {
    setSkills([...skills, { name: '' }]);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index: number, value: string) => {
    setSkills(skills.map((s, i) => i === index ? { name: value } : s));
  };

  // Profile strength calculation
  const hasBasicInfo = fullName && email && phone && location;
  const hasResume = uploadedFileDataUrl || uploadedFileName;
  const hasEducation = education.some(e => e.organization && e.title);
  const hasEnoughSkills = skills.filter(s => s.name.trim()).length >= 3;
  const hasAbout = resumeAbout.trim().length > 0;
  
  const profileStrength = 
    (hasBasicInfo ? 20 : 0) + 
    (hasResume ? 20 : 0) + 
    (hasEducation ? 20 : 0) + 
    (hasEnoughSkills ? 20 : 0) + 
    (hasAbout ? 20 : 0);

  const uploadedFileDisplayName = uploadedFileName.split(/[\\/]/).pop() || uploadedFileName;
  const profileInitials = fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'CV';

  if (isLoading) {
    return (
      <div className="app-shell">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="main-content">
          <PageHeader
            title="Resume & Profile"
            subtitle="Loading..."
            onMenuToggle={() => setIsSidebarOpen((value) => !value)}
          />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: '#64748B' }}>
            <div style={{ textAlign: 'center' }}>
              <svg className="spin-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              <div>Loading profile...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="app-shell">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="main-content">
          <PageHeader
            title="Resume & Profile"
            subtitle="We couldn't load your profile"
            onMenuToggle={() => setIsSidebarOpen((value) => !value)}
          />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: '#DC2626' }}>
            <div style={{ textAlign: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>{loadError}</div>
              <button className="btn-primary" style={{ marginTop: '16px' }} onClick={loadProfileData}>Retry</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.jpg,.jpeg,.png"
        style={{ display: 'none' }}
        onChange={handleResumeUpload}
      />
      <input
        ref={profilePhotoInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleProfilePhotoUpload}
      />

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="main-content">
        <PageHeader
          title="Resume & Profile"
          subtitle="Manage your professional information and resume"
          onMenuToggle={() => setIsSidebarOpen((value) => !value)}
        >
          {!isEditingProfile ? (
            <Link to="/browse-jobs" className="btn-browse">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Browse More Jobs
            </Link>
          ) : (
            <div className="header-actions">
              <button className="btn-outline" onClick={cancelEditProfile}>Cancel</button>
              <button className="btn-primary" onClick={saveProfile}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save Changes
              </button>
            </div>
          )}
        </PageHeader>

        {isLoading ? (
          <ProfileSkeleton />
        ) : (
        <div className="profile-body">
          <div className="profile-grid">
            {/* LEFT COLUMN */}
            <div className="left-col">
              {/* Profile Card */}
              <div className="card profile-card">
                <div className="avatar-section">
                  <div className="avatar-wrap">
                    <div className="avatar-circle">
                      {profilePictureUrl ? (
                        <img className="avatar-photo" src={profilePictureUrl} alt={`${fullName} profile`} />
                      ) : (
                        profileInitials
                      )}
                    </div>
                  </div>
                  <div className="identity-meta">
                    <div className="identity-name">{fullName || 'Your Name'}</div>
                    <span className="identity-role-badge">Student</span>
                  </div>
                  {!isEditingProfile && (
                    <div className="profile-actions">
                      <button className="photo-upload-btn" onClick={triggerProfilePhotoUpload}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                        Photo
                      </button>
                      <button className="edit-profile-btn" onClick={startEditProfile}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                <div className="divider"></div>

                {!isEditingProfile ? (
                  <div className="profile-info-list">
                    <div className="info-row">
                      <span className="info-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </span>
                      <div>
                        <div className="info-label">Email</div>
                        <div className="info-value">{email}</div>
                      </div>
                    </div>
                    <div className="info-row">
                      <span className="info-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                        </svg>
                      </span>
                      <div>
                        <div className="info-label">Phone</div>
                        <div className={`info-value ${!phone ? 'info-empty' : ''}`}>
                          {phone || 'Add phone number'}
                        </div>
                      </div>
                    </div>
                    <div className="info-row">
                      <span className="info-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </span>
                      <div>
                        <div className="info-label">Location</div>
                        <div className={`info-value ${!location ? 'info-empty' : ''}`}>
                          {location || 'Add your location'}
                        </div>
                      </div>
                    </div>
                    <div className="info-row">
                      <span className="info-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                          <rect x="2" y="9" width="4" height="12" />
                          <circle cx="4" cy="4" r="2" />
                        </svg>
                      </span>
                      <div>
                        <div className="info-label">LinkedIn</div>
                        {linkedIn ? (
                          <a className="info-link" href={`https://linkedin.com/in/${linkedIn}`} target="_blank" rel="noreferrer">
                            linkedin.com/in/{linkedIn}
                          </a>
                        ) : (
                          <div className="info-value info-empty">Add LinkedIn profile</div>
                        )}
                      </div>
                    </div>
                    <div className="info-row">
                      <span className="info-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                        </svg>
                      </span>
                      <div>
                        <div className="info-label">GitHub</div>
                        {gitHub ? (
                          <a className="info-link" href={`https://github.com/${gitHub}`} target="_blank" rel="noreferrer">
                            github.com/{gitHub}
                          </a>
                        ) : (
                          <div className="info-value info-empty">Add GitHub profile</div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" type="email" value={email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                      <small style={{ color: '#64748B', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                        Email is linked to your account and cannot be changed here
                      </small>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+63 912 345 6789" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input className="form-input" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Province" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">LinkedIn</label>
                      <div className="input-prefix-wrap">
                        <span className="input-prefix">linkedin.com/in/</span>
                        <input className="form-input prefix-input" type="text" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} placeholder="yourprofile" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">GitHub</label>
                      <div className="input-prefix-wrap">
                        <span className="input-prefix">github.com/</span>
                        <input className="form-input prefix-input" type="text" value={gitHub} onChange={(e) => setGitHub(e.target.value)} placeholder="yourusername" />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profile Strength */}
              <div className="card profile-strength-card">
                <div className="card-label">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Profile Strength
                </div>
                <div className="strength-bar-wrap">
                  <div className="strength-bar">
                    <div className="strength-fill" style={{ width: `${profileStrength}%` }}></div>
                  </div>
                  <span className="strength-pct">{profileStrength}%</span>
                </div>
                <div className="strength-checklist">
                  <div className={`strength-item ${hasBasicInfo ? 'done' : ''}`}>
                    {hasBasicInfo ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    )}
                    Basic info completed
                  </div>
                  <div className={`strength-item ${hasResume ? 'done' : ''}`}>
                    {hasResume ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    )}
                    Resume uploaded
                  </div>
                  <div className={`strength-item ${hasEducation ? 'done' : ''}`}>
                    {hasEducation ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    )}
                    Add education
                  </div>
                  <div className={`strength-item ${hasEnoughSkills ? 'done' : ''}`}>
                    {hasEnoughSkills ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    )}
                    Add skills (3+ recommended)
                  </div>
                  <div className={`strength-item ${hasAbout ? 'done' : ''}`}>
                    {hasAbout ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    )}
                    Write about me
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Resume */}
            <div className="right-col">
              <div className="card resume-builder-card">
                <div className="resume-builder-header">
                  <div className="card-label">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    Resume
                  </div>
                  <div className="resume-header-actions">
                    <div className="resume-mode-tabs">
                      <button className={`resume-mode-tab ${resumeMode === 'upload' ? 'active' : ''}`} onClick={() => setResumeMode('upload')}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload
                      </button>
                      <button className={`resume-mode-tab ${resumeMode === 'build' ? 'active' : ''}`} onClick={() => setResumeMode('build')}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Build
                      </button>
                    </div>

                    {resumeMode === 'upload' && (
                      <>
                        {isUploadingResume && (
                          <span className="status-badge status-blue">
                            <svg className="spin-icon" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 12a9 9 0 11-6.219-8.56" />
                            </svg>
                            Uploading{resumeUploadPercent === null ? '...' : ` ${resumeUploadPercent}%`}
                          </span>
                        )}
                        {!isUploadingResume && uploadedFileName && (
                          <button className="btn-ghost-sm" onClick={triggerFileUpload} title="Replace file">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            Replace
                          </button>
                        )}
                      </>
                    )}

                    {resumeMode === 'build' && (
                      <button 
                        className={`btn-ghost-sm resume-edit-toggle ${isEditingResume ? 'active' : ''}`}
                        onClick={toggleResumeEdit}
                        title={isEditingResume ? 'Lock resume' : 'Edit resume'}
                      >
                        {isEditingResume ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                            Lock
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {uploadMessage && (
                  <div className={`upload-toast ${uploadSuccess ? 'toast-success' : 'toast-error'}`}>
                    {uploadSuccess ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    )}
                    {uploadMessage}
                  </div>
                )}

                {isUploadingResume && resumeUploadPercent !== null && (
                  <div
                    className="resume-upload-progress"
                    role="progressbar"
                    aria-label="Resume upload progress"
                    aria-valuenow={resumeUploadPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="resume-upload-progress-bar" style={{ width: `${resumeUploadPercent}%` }} />
                  </div>
                )}

                <div style={{ display: resumeMode === 'upload' ? 'block' : 'none' }}>
                  {!uploadedFileName ? (
                    <div className="resume-upload-zone" onClick={triggerFileUpload}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="upload-zone-icon">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <div className="upload-zone-title">Upload your resume</div>
                      <div className="upload-zone-sub">PDF, DOCX, JPG, or PNG · Max 5 MB</div>
                      <div className="upload-zone-note">
                        Want to build one from scratch? Switch to the <strong>Build</strong> tab.
                      </div>
                    </div>
                  ) : (
                    <div className="resume-file-preview">
                      <div className="resume-preview-topbar">
                        <div className="resume-file-chip">
                          <span className="resume-file-icon">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                          </span>
                          <span>
                            <span className="resume-file-kicker">Active resume</span>
                            <span className="resume-file-name">{uploadedFileDisplayName}</span>
                          </span>
                        </div>

                        <div className="resume-preview-actions">
                          {uploadedFileDataUrl && (
                            <>
                              <a className="resume-preview-action" href={uploadedFileDataUrl} target="_blank" rel="noreferrer" title="Open resume">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                                  <polyline points="15 3 21 3 21 9" />
                                  <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                                Open
                              </a>
                              <a className="resume-preview-action primary" href={uploadedFileDataUrl} download={uploadedFileDisplayName} title="Download resume">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                Download
                              </a>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="resume-preview-stage">
                        {uploadedFileDataUrl && uploadedFileType === 'image' && (
                          <img src={uploadedFileDataUrl} alt="Uploaded Resume" className="resume-preview-img" />
                        )}
                        {uploadedFileDataUrl && uploadedFileType === 'pdf' && (
                          <PdfResumePreview fileUrl={uploadedFileDataUrl} />
                        )}
                        {(!uploadedFileDataUrl || uploadedFileType === 'docx') && (
                          <div className="resume-docx-card">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <div className="resume-docx-name">{uploadedFileDisplayName}</div>
                            <div className="resume-docx-sub">Uploaded resume is active for job matching.</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: resumeMode === 'build' ? 'block' : 'none' }}>
                  <div className={`resume-doc ${isEditingResume ? 'resume-editable' : 'resume-locked'}`}>
                    {/* Header */}
                    <div className="rdoc-header">
                      <input 
                        className="rdoc-name" 
                        type="text" 
                        value={resumeName} 
                        onChange={(e) => setResumeName(e.target.value)}
                        placeholder="YOUR FULL NAME" 
                        disabled={!isEditingResume} 
                      />
                      <input 
                        className="rdoc-headline" 
                        type="text" 
                        value={resumeHeadline} 
                        onChange={(e) => setResumeHeadline(e.target.value)}
                        placeholder="Professional Title or Headline" 
                        disabled={!isEditingResume} 
                      />
                      <div className="rdoc-contacts">
                        <div className="rdoc-contact-item">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                          </svg>
                          <input 
                            className="rdoc-contact-input" 
                            type="text" 
                            value={resumePhone} 
                            onChange={(e) => setResumePhone(e.target.value)}
                            placeholder="+63 912 345 6789" 
                            disabled={!isEditingResume} 
                          />
                        </div>
                        <span className="rdoc-sep">·</span>
                        <div className="rdoc-contact-item">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                          <input 
                            className="rdoc-contact-input" 
                            type="text" 
                            value={resumeEmail} 
                            onChange={(e) => setResumeEmail(e.target.value)}
                            placeholder="email@example.com" 
                            disabled={!isEditingResume} 
                          />
                        </div>
                        <span className="rdoc-sep">·</span>
                        <div className="rdoc-contact-item">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <input 
                            className="rdoc-contact-input" 
                            type="text" 
                            value={resumeLocation} 
                            onChange={(e) => setResumeLocation(e.target.value)}
                            placeholder="City, Country" 
                            disabled={!isEditingResume} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rdoc-divider"></div>

                    {/* About Me */}
                    <div className="rdoc-section">
                      <div className="rdoc-section-title">ABOUT ME</div>
                      <textarea 
                        className="rdoc-textarea" 
                        rows={2} 
                        value={resumeAbout} 
                        onChange={(e) => setResumeAbout(e.target.value)}
                        placeholder="Write a short professional summary..." 
                        disabled={!isEditingResume}
                      />
                    </div>

                    <div className="rdoc-divider"></div>

                    {/* Education */}
                    <div className="rdoc-section">
                      <div className="rdoc-section-header">
                        <div className="rdoc-section-title">EDUCATION</div>
                        {isEditingResume && (
                          <button className="rdoc-add-btn" onClick={addEducation}>+ Add</button>
                        )}
                      </div>
                      {education.map((edu) => (
                        <div key={edu.id} className="rdoc-entry">
                          <div className="rdoc-entry-top">
                            <div className="rdoc-entry-left">
                              {isEditingResume ? (
                                <input
                                  className="rdoc-entry-org"
                                  type="text"
                                  value={edu.organization}
                                  onChange={(e) => updateEducation(edu.id, 'organization', e.target.value)}
                                  placeholder="University or School"
                                  disabled={!isEditingResume}
                                />
                              ) : (
                                <div className="rdoc-entry-org-text">{edu.organization}</div>
                              )}
                              <span className="rdoc-entry-sep">|</span>
                              {isEditingResume ? (
                                <input
                                  className="rdoc-entry-period"
                                  type="text"
                                  value={edu.period}
                                  onChange={(e) => updateEducation(edu.id, 'period', e.target.value)}
                                  placeholder="2021-2025"
                                  disabled={!isEditingResume}
                                />
                              ) : (
                                <div className="rdoc-entry-period-text">{edu.period}</div>
                              )}
                            </div>
                            {isEditingResume && (
                              <button className="rdoc-remove-btn" onClick={() => removeEducation(edu.id)}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            )}
                          </div>
                          {isEditingResume ? (
                            <input
                              className="rdoc-entry-title"
                              type="text"
                              value={edu.title}
                              onChange={(e) => updateEducation(edu.id, 'title', e.target.value)}
                              placeholder="Degree or Program"
                              disabled={!isEditingResume}
                            />
                          ) : (
                            <div className="rdoc-entry-title-text">{edu.title}</div>
                          )}
                          {isEditingResume ? (
                            <textarea
                              className="rdoc-entry-desc"
                              rows={1}
                              value={edu.description}
                              onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                              placeholder="Relevant coursework, honors, or achievements..."
                              disabled={!isEditingResume}
                            />
                          ) : (
                            <div className="rdoc-entry-desc-text">{edu.description}</div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="rdoc-divider"></div>

                    {/* Work Experience */}
                    <div className="rdoc-section">
                      <div className="rdoc-section-header">
                        <div className="rdoc-section-title">WORK EXPERIENCE</div>
                        {isEditingResume && (
                          <button className="rdoc-add-btn" onClick={addExperience}>+ Add</button>
                        )}
                      </div>
                      {experience.length === 0 ? (
                        <p className="rdoc-empty">{isEditingResume ? 'No experience added yet. Click + Add to get started.' : 'No experience added yet.'}</p>
                      ) : (
                        experience.map((exp) => (
                          <div key={exp.id} className="rdoc-entry">
                            <div className="rdoc-entry-top">
                              <div className="rdoc-entry-left">
                                {isEditingResume ? (
                                  <input
                                    className="rdoc-entry-org"
                                    type="text"
                                    value={exp.organization}
                                    onChange={(e) => updateExperience(exp.id, 'organization', e.target.value)}
                                    placeholder="Company or Organization"
                                    disabled={!isEditingResume}
                                  />
                                ) : (
                                  <div className="rdoc-entry-org-text">{exp.organization}</div>
                                )}
                                <span className="rdoc-entry-sep">|</span>
                                {isEditingResume ? (
                                  <input
                                    className="rdoc-entry-period"
                                    type="text"
                                    value={exp.period}
                                    onChange={(e) => updateExperience(exp.id, 'period', e.target.value)}
                                    placeholder="2023-2024"
                                    disabled={!isEditingResume}
                                  />
                                ) : (
                                  <div className="rdoc-entry-period-text">{exp.period}</div>
                                )}
                              </div>
                              {isEditingResume && (
                                <button className="rdoc-remove-btn" onClick={() => removeExperience(exp.id)}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </button>
                              )}
                            </div>
                            {isEditingResume ? (
                              <input
                                className="rdoc-entry-title"
                                type="text"
                                value={exp.title}
                                onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                                placeholder="Job Title"
                                disabled={!isEditingResume}
                              />
                            ) : (
                              <div className="rdoc-entry-title-text">{exp.title}</div>
                            )}
                            {isEditingResume ? (
                              <textarea
                                className="rdoc-entry-desc"
                                rows={1}
                                value={exp.description}
                                onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                placeholder="Key responsibilities and achievements..."
                                disabled={!isEditingResume}
                              />
                            ) : (
                              <div className="rdoc-entry-desc-text">{exp.description}</div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="rdoc-divider"></div>

                    {/* Skills */}
                    <div className="rdoc-section">
                      <div className="rdoc-section-header">
                        <div className="rdoc-section-title">SKILLS</div>
                        {isEditingResume && (
                          <button className="rdoc-add-btn" onClick={addSkill}>+ Add</button>
                        )}
                      </div>
                      <div className="rdoc-skills-grid">
                        {skills.map((skill, index) => (
                          <div key={index} className="rdoc-skill-item">
                            <span className="rdoc-bullet">•</span>
                            <input 
                              className="rdoc-skill-input" 
                              type="text" 
                              value={skill.name} 
                              onChange={(e) => updateSkill(index, e.target.value)}
                              placeholder="Skill" 
                              disabled={!isEditingResume} 
                            />
                            {isEditingResume && (
                              <button className="rdoc-skill-remove" onClick={() => removeSkill(index)}>
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}
