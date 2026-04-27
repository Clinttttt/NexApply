import { useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {CompanySidebar} from '../../components/CompanySidebar';
import {CompanyHeader} from '../../components/CompanyHeader';
import { jobListingService, type CreateJobListingCommand } from '../../services/jobListingService';
import './CompanyPostJob.css';

// ── Types ─────────────────────────────────────────────────

interface FormState {
  // Step 1
  jobTitle: string;
  jobType: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  deadline: string;
  selectedWorkSetup: string;

  // Step 2
  roleSummary: string;
  responsibilities: string;
  benefits: string;

  // Step 3
  qualifications: string;
  experienceLevel: string;
  openings: number;
}

// ── Helpers ───────────────────────────────────────────────

const WORK_SETUP_OPTIONS = ['On-site', 'Remote', 'Hybrid'] as const;

// Enum mappings to match backend
const JOB_TYPE_MAP: Record<string, number> = {
  'FullTime': 0,
  'PartTime': 1,
  'Internship': 2,
  'Freelance': 3,
  'Remote': 4,
};

const WORK_SETUP_MAP: Record<string, number> = {
  'On-site': 0,
  'Remote': 1,
  'Hybrid': 2,
};

/** Checkmark SVG used in stepper and completeness list */
const IconCheck = ({ size = 13 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/** Chevron right — Continue button */
const IconChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/** Chevron left — Back button */
const IconChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

/** Briefcase icon — Step 1 */
const IconBriefcase = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

/** File text icon — Step 2 */
const IconFileText = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

/** Clipboard icon — Step 3 */
const IconClipboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

/** Clock icon — Step 4 */
const IconClock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 8 12 12 14 14" />
  </svg>
);

/** Info icon — writing tips & review notice */
const IconInfo = ({ size = 15 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

/** Floppy disk icon — Save Draft */
const IconSave = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

/** Send icon — Publish */
const IconSend = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

/** X icon — remove skill tag */
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── Stepper ───────────────────────────────────────────────

interface StepperProps {
  currentStep: number;
}

const STEPS = ['Basic Info', 'Description', 'Requirements', 'Review & Publish'];

const Stepper: React.FC<StepperProps> = ({ currentStep }) => (
  <div className="stepper">
    {STEPS.map((label, idx) => {
      const stepNum = idx + 1;
      const isActive = currentStep >= stepNum;
      const isDone   = currentStep > stepNum;
      const isLast   = stepNum === STEPS.length;

      return (
        <div key={label} style={{ display: 'contents' }}>
          <div className={`stepper-step${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}>
            <div className="step-indicator">
              {isDone ? <IconCheck size={13} /> : <span>{stepNum}</span>}
            </div>
            <span className="step-label">{label}</span>
          </div>
          {!isLast && (
            <div className={`stepper-connector${isDone ? ' done' : ''}`} />
          )}
        </div>
      );
    })}
  </div>
);

// ── Main Component ────────────────────────────────────────

const CompanyPostJob: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    jobTitle: '',
    jobType: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    deadline: '',
    selectedWorkSetup: '',
    roleSummary: '',
    responsibilities: '',
    benefits: '',
    qualifications: '',
    experienceLevel: '',
    openings: 1,
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState<string>('');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [benefitInput, setBenefitInput] = useState<string>('');
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [responsibilityInput, setResponsibilityInput] = useState<string>('');

  // ── Derived ─────────────────────────────────────────────

  const completenessPercent = (() => {
    let filled = 0;
    const total = 6;
    if (form.jobTitle.trim())        filled++;
    if (form.jobType.trim())         filled++;
    if (form.location.trim())        filled++;
    if (form.roleSummary.trim())     filled++;
    if (form.responsibilities.trim()) filled++;
    if (skills.length > 0)           filled++;
    return Math.round((filled / total) * 100);
  })();

  // ── Handlers ─────────────────────────────────────────────

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const nextStep = () => setCurrentStep(s => Math.min(s + 1, 4));
  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) =>
    setSkills(prev => prev.filter(s => s !== skill));

  const handleSkillKeydown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const addBenefit = () => {
    const trimmed = benefitInput.trim();
    if (trimmed && !benefits.includes(trimmed)) {
      setBenefits(prev => [...prev, trimmed]);
      setBenefitInput('');
    }
  };

  const removeBenefit = (benefit: string) =>
    setBenefits(prev => prev.filter(b => b !== benefit));

  const handleBenefitKeydown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBenefit();
    }
  };

  const addResponsibility = () => {
    const trimmed = responsibilityInput.trim();
    if (trimmed && !responsibilities.includes(trimmed)) {
      setResponsibilities(prev => [...prev, trimmed]);
      setResponsibilityInput('');
    }
  };

  const removeResponsibility = (responsibility: string) =>
    setResponsibilities(prev => prev.filter(r => r !== responsibility));

  const handleResponsibilityKeydown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addResponsibility();
    }
  };

  const saveDraft = () => {
    // TODO: save draft logic (optional feature)
    console.log('Save draft not implemented yet');
  };

  const publishJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const command: CreateJobListingCommand = {
      title: form.jobTitle.trim(),
      description: form.roleSummary.trim(),
      responsibilities: responsibilities.join('\n• ').trim() ? `• ${responsibilities.join('\n• ')}` : '',
      qualifications: form.qualifications.trim(),
      requiredSkills: skills.join(', '),
      benefits: benefits.join('\n• ').trim() ? `• ${benefits.join('\n• ')}` : undefined,
      location: form.location.trim(),
      jobType: JOB_TYPE_MAP[form.jobType] ?? 0,
      workSetup: WORK_SETUP_MAP[form.selectedWorkSetup] ?? 0,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      experienceLevel: form.experienceLevel || undefined,
      openings: form.openings > 0 ? form.openings : 1,
      deadline: form.deadline || undefined,
    };

    console.log('Submitting job listing:', command);

    const result = await jobListingService.createJobListing(command);

    console.log('Job listing result:', result);

    if (result.isSuccess) {
      // Redirect to Manage Jobs page
      navigate('/company/manage-jobs');
    } else {
      setSubmitError(result.error || 'Failed to publish job listing');
      setIsSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="app-shell">
      <CompanySidebar />

      <div className="main-content">
        <CompanyHeader
          title="Post a Job"
          subtitle="Create a new listing for candidates to discover"
        />

        <div className="page-body">

          {/* ── Progress Stepper ── */}
          <Stepper currentStep={currentStep} />

          {/* ── Form Area ── */}
          <form onSubmit={publishJob}>
            <div className="form-layout">

              {/* LEFT: Main Form */}
              <div className="form-main">

                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="form-card">
                    <div className="form-card-header">
                      <div className="form-card-icon"><IconBriefcase /></div>
                      <div>
                        <h2 className="form-card-title">Basic Information</h2>
                        <p className="form-card-subtitle">Core details about the position</p>
                      </div>
                    </div>

                    <div className="form-body">
                      <div className="field-group">
                        <label className="field-label" htmlFor="job-title">
                          Job Title <span className="required">*</span>
                        </label>
                        <input
                          id="job-title"
                          className="field-input"
                          type="text"
                          placeholder="e.g. Full-Stack Developer Intern"
                          value={form.jobTitle}
                          onChange={e => setField('jobTitle', e.target.value)}
                        />
                        <span className="field-hint">Be specific — candidates search by job title.</span>
                      </div>

                      <div className="field-row">
                        <div className="field-group">
                          <label className="field-label" htmlFor="job-type">
                            Job Type <span className="required">*</span>
                          </label>
                          <select
                            id="job-type"
                            className="field-select"
                            value={form.jobType}
                            onChange={e => setField('jobType', e.target.value)}
                          >
                            <option value="">Select type</option>
                            <option value="FullTime">Full-Time</option>
                            <option value="PartTime">Part-Time</option>
                            <option value="Internship">Internship</option>
                            <option value="Freelance">Freelance</option>
                            <option value="Remote">Remote</option>
                          </select>
                        </div>

                        <div className="field-group">
                          <label className="field-label" htmlFor="location">
                            Location <span className="required">*</span>
                          </label>
                          <input
                            id="location"
                            className="field-input"
                            type="text"
                            placeholder="e.g. Manila, Philippines or Remote"
                            value={form.location}
                            onChange={e => setField('location', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="field-row">
                        <div className="field-group">
                          <label className="field-label" htmlFor="salary-min">Salary Range (optional)</label>
                          <div className="salary-range">
                            <div className="salary-input-wrap">
                              <span className="salary-currency">₱</span>
                              <input
                                id="salary-min"
                                className="field-input salary-input"
                                type="number"
                                placeholder="Min"
                                value={form.salaryMin}
                                onChange={e => setField('salaryMin', e.target.value)}
                              />
                            </div>
                            <span className="salary-divider">–</span>
                            <div className="salary-input-wrap">
                              <span className="salary-currency">₱</span>
                              <input
                                id="salary-max"
                                className="field-input salary-input"
                                type="number"
                                placeholder="Max"
                                value={form.salaryMax}
                                onChange={e => setField('salaryMax', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="field-group">
                          <label className="field-label" htmlFor="deadline">Application Deadline</label>
                          <input
                            id="deadline"
                            className="field-input"
                            type="date"
                            value={form.deadline}
                            onChange={e => setField('deadline', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="field-group">
                        <label className="field-label">Work Setup</label>
                        <div className="toggle-group">
                          {WORK_SETUP_OPTIONS.map(setup => (
                            <button
                              key={setup}
                              type="button"
                              className={`toggle-btn${form.selectedWorkSetup === setup ? ' selected' : ''}`}
                              onClick={() => setField('selectedWorkSetup', setup)}
                            >
                              {setup}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Step Navigation */}
                    <div className="step-nav">
                      <span />
                      <button className="btn-primary" type="button" onClick={nextStep}>
                        Continue <IconChevronRight />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Description */}
                {currentStep === 2 && (
                  <div className="form-card">
                    <div className="form-card-header">
                      <div className="form-card-icon"><IconFileText /></div>
                      <div>
                        <h2 className="form-card-title">Job Description</h2>
                        <p className="form-card-subtitle">Tell candidates what this role is about</p>
                      </div>
                    </div>

                    <div className="form-body">
                      <div className="field-group">
                        <label className="field-label" htmlFor="summary">
                          Role Summary <span className="required">*</span>
                        </label>
                        <textarea
                          id="summary"
                          className="field-textarea"
                          rows={4}
                          placeholder="A brief overview of the role and what the candidate will be doing..."
                          value={form.roleSummary}
                          onChange={e => setField('roleSummary', e.target.value)}
                        />
                        <span className="field-hint">Aim for 2–4 sentences. This appears in search results.</span>
                      </div>

                      <div className="field-group">
                        <label className="field-label">
                          Key Responsibilities <span className="required">*</span>
                        </label>
                        <div className="skill-input-row">
                          <input
                            className="field-input skill-input"
                            type="text"
                            placeholder="e.g. Lead development of backend APIs..."
                            value={responsibilityInput}
                            onChange={e => setResponsibilityInput(e.target.value)}
                            onKeyDown={handleResponsibilityKeydown}
                          />
                          <button className="btn-add-skill" type="button" onClick={addResponsibility}>Add</button>
                        </div>
                        {responsibilities.length > 0 && (
                          <div className="skill-tags">
                            {responsibilities.map(resp => (
                              <div key={resp} className="skill-tag">
                                <span>{resp}</span>
                                <button
                                  type="button"
                                  className="skill-remove"
                                  aria-label={`Remove ${resp}`}
                                  onClick={() => removeResponsibility(resp)}
                                >
                                  <IconX />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <span className="field-hint">Press Enter or click Add. These will be displayed as bullet points.</span>
                      </div>

                      <div className="field-group">
                        <label className="field-label">Perks &amp; Benefits</label>
                        <div className="skill-input-row">
                          <input
                            className="field-input skill-input"
                            type="text"
                            placeholder="e.g. Flexible working hours, Health insurance..."
                            value={benefitInput}
                            onChange={e => setBenefitInput(e.target.value)}
                            onKeyDown={handleBenefitKeydown}
                          />
                          <button className="btn-add-skill" type="button" onClick={addBenefit}>Add</button>
                        </div>
                        {benefits.length > 0 && (
                          <div className="skill-tags">
                            {benefits.map(benefit => (
                              <div key={benefit} className="skill-tag">
                                <span>{benefit}</span>
                                <button
                                  type="button"
                                  className="skill-remove"
                                  aria-label={`Remove ${benefit}`}
                                  onClick={() => removeBenefit(benefit)}
                                >
                                  <IconX />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <span className="field-hint">Press Enter or click Add. These will be displayed as bullet points.</span>
                      </div>
                    </div>

                    {/* Step Navigation */}
                    <div className="step-nav">
                      <button className="btn-secondary" type="button" onClick={prevStep}>
                        <IconChevronLeft /> Back
                      </button>
                      <button className="btn-primary" type="button" onClick={nextStep}>
                        Continue <IconChevronRight />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Requirements */}
                {currentStep === 3 && (
                  <div className="form-card">
                    <div className="form-card-header">
                      <div className="form-card-icon"><IconClipboard /></div>
                      <div>
                        <h2 className="form-card-title">Requirements</h2>
                        <p className="form-card-subtitle">What qualifications are you looking for?</p>
                      </div>
                    </div>

                    <div className="form-body">
                      <div className="field-group">
                        <label className="field-label" htmlFor="qualifications">
                          Qualifications <span className="required">*</span>
                        </label>
                        <textarea
                          id="qualifications"
                          className="field-textarea"
                          rows={5}
                          placeholder={"• Bachelor's degree in Computer Science or related field\n• 1+ year of relevant experience\n• Strong communication skills..."}
                          value={form.qualifications}
                          onChange={e => setField('qualifications', e.target.value)}
                        />
                      </div>

                      <div className="field-group">
                        <label className="field-label">Required Skills</label>
                        <div className="skill-input-row">
                          <input
                            className="field-input skill-input"
                            type="text"
                            placeholder="e.g. React, Node.js, SQL..."
                            value={skillInput}
                            onChange={e => setSkillInput(e.target.value)}
                            onKeyDown={handleSkillKeydown}
                          />
                          <button className="btn-add-skill" type="button" onClick={addSkill}>Add</button>
                        </div>
                        {skills.length > 0 && (
                          <div className="skill-tags">
                            {skills.map(skill => (
                              <div key={skill} className="skill-tag">
                                <span>{skill}</span>
                                <button
                                  type="button"
                                  className="skill-remove"
                                  aria-label={`Remove ${skill}`}
                                  onClick={() => removeSkill(skill)}
                                >
                                  <IconX />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <span className="field-hint">Press Enter or click Add to add a skill. These are used for resume matching.</span>
                      </div>

                      <div className="field-row">
                        <div className="field-group">
                          <label className="field-label" htmlFor="experience-level">Experience Level</label>
                          <select
                            id="experience-level"
                            className="field-select"
                            value={form.experienceLevel}
                            onChange={e => setField('experienceLevel', e.target.value)}
                          >
                            <option value="">Any level</option>
                            <option value="Entry">Entry Level</option>
                            <option value="Mid">Mid Level</option>
                            <option value="Senior">Senior Level</option>
                          </select>
                        </div>

                        <div className="field-group">
                          <label className="field-label" htmlFor="openings">Number of Openings</label>
                          <input
                            id="openings"
                            className="field-input"
                            type="number"
                            min={1}
                            placeholder="1"
                            value={form.openings}
                            onChange={e => setField('openings', Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Step Navigation */}
                    <div className="step-nav">
                      <button className="btn-secondary" type="button" onClick={prevStep}>
                        <IconChevronLeft /> Back
                      </button>
                      <button className="btn-primary" type="button" onClick={nextStep}>
                        Continue <IconChevronRight />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <div className="form-card">
                    <div className="form-card-header">
                      <div className="form-card-icon success-icon"><IconClock /></div>
                      <div>
                        <h2 className="form-card-title">Review Listing</h2>
                        <p className="form-card-subtitle">Double-check everything before publishing</p>
                      </div>
                    </div>

                    <div className="review-section">
                      <div className="review-group">
                        <span className="review-label">Job Title</span>
                        <span className="review-value">{form.jobTitle.trim() || '—'}</span>
                      </div>
                      <div className="review-group">
                        <span className="review-label">Type</span>
                        <span className="review-value">{form.jobType.trim() || '—'}</span>
                      </div>
                      <div className="review-group">
                        <span className="review-label">Location</span>
                        <span className="review-value">{form.location.trim() || '—'}</span>
                      </div>
                      <div className="review-group">
                        <span className="review-label">Work Setup</span>
                        <span className="review-value">{form.selectedWorkSetup.trim() || '—'}</span>
                      </div>
                      <div className="review-group">
                        <span className="review-label">Experience Level</span>
                        <span className="review-value">{form.experienceLevel.trim() || 'Any'}</span>
                      </div>
                      <div className="review-group">
                        <span className="review-label">Openings</span>
                        <span className="review-value">{form.openings > 0 ? form.openings : 1}</span>
                      </div>
                      {(form.salaryMin || form.salaryMax) && (
                        <div className="review-group">
                          <span className="review-label">Salary Range</span>
                          <span className="review-value">
                            ₱{form.salaryMin ? Number(form.salaryMin).toLocaleString() : '—'} – ₱{form.salaryMax ? Number(form.salaryMax).toLocaleString() : '—'}
                          </span>
                        </div>
                      )}
                      {skills.length > 0 && (
                        <div className="review-group review-group--skills">
                          <span className="review-label">Required Skills</span>
                          <div className="review-skill-tags">
                            {skills.map(s => (
                              <span key={s} className="review-skill-tag">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {submitError && (
                      <div className="error-notice">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{submitError}</span>
                      </div>
                    )}

                    <div className="review-notice">
                      <IconInfo size={14} />
                      <span>Your listing will go live immediately after publishing. You can edit or close it anytime from Manage Jobs.</span>
                    </div>

                    {/* Step Navigation */}
                    <div className="step-nav">
                      <button className="btn-secondary" type="button" onClick={prevStep}>
                        <IconChevronLeft /> Back
                      </button>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-secondary" type="button" onClick={saveDraft} disabled={isSubmitting}>
                          <IconSave /> Save Draft
                        </button>
                        <button className="btn-publish" type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <svg style={{ animation: 'spin 0.7s linear infinite' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12a9 9 0 11-6.219-8.56" />
                              </svg>
                              Publishing...
                            </>
                          ) : (
                            <>
                              <IconSend /> Publish Listing
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* RIGHT: Sidebar Tips */}
              <aside className="form-aside">
                <div className="completeness-card">
                  <div className="completeness-header">
                    <span className="completeness-title">Listing Completeness</span>
                    <span className="completeness-pct">{completenessPercent}%</span>
                  </div>
                  <div className="completeness-bar-track">
                    <div className="completeness-bar-fill" style={{ width: `${completenessPercent}%` }} />
                  </div>
                  <ul className="completeness-checklist">
                    {[
                      { label: 'Job Title',        done: !!form.jobTitle.trim() },
                      { label: 'Job Type',         done: !!form.jobType.trim() },
                      { label: 'Location',         done: !!form.location.trim() },
                      { label: 'Role Summary',     done: !!form.roleSummary.trim() },
                      { label: 'Responsibilities', done: responsibilities.length > 0 },
                      { label: 'Required Skills',  done: skills.length > 0 },
                    ].map(({ label, done }) => (
                      <li key={label} className={done ? 'done' : ''}>
                        <IconCheck size={12} />
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="tips-card">
                  <div className="tips-header">
                    <IconInfo size={15} />
                    <span>Writing Tips</span>
                  </div>
                  <ul className="tips-list">
                    <li>Use clear, specific job titles.</li>
                    <li>Keep summary under 100 words.</li>
                    <li>List 5–8 key responsibilities.</li>
                    <li>Add skills for better matching.</li>
                  </ul>
                </div>
              </aside>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyPostJob;
