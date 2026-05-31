import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CompanySidebar } from '../../components/CompanySidebar';
import { CompanyHeader } from '../../components/CompanyHeader';
import { jobListingService, type UpdateJobListingCommand } from '../../services/jobListingService';
import './CompanyEditJob.css';

const JOB_TYPES = [
  { value: 0, label: 'Full-Time' },
  { value: 1, label: 'Part-Time' },
  { value: 2, label: 'Internship' },
  { value: 3, label: 'Freelance' },
  { value: 4, label: 'Remote' }
];

const WORK_SETUPS = [
  { value: 0, label: 'On-Site' },
  { value: 1, label: 'Remote' },
  { value: 2, label: 'Hybrid' }
];

export function CompanyEditJob() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    jobType: 0,
    workSetup: 0,
    salaryMin: '',
    salaryMax: '',
    experienceLevel: '',
    openings: 1,
    deadline: ''
  });

  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);

  const [newResponsibility, setNewResponsibility] = useState('');
  const [newQualification, setNewQualification] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  useEffect(() => {
    const loadJobDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      const result = await jobListingService.getJobListingDetails(id);
      if (result.isSuccess && result.value) {
        const job = result.value;
        setFormData({
          title: job.title,
          description: job.description,
          location: job.location,
          jobType: JOB_TYPES.find(t => t.label === job.jobType)?.value ?? 0,
          workSetup: WORK_SETUPS.find(w => w.label === job.workSetup)?.value ?? 0,
          salaryMin: job.salaryMin?.toString() ?? '',
          salaryMax: job.salaryMax?.toString() ?? '',
          experienceLevel: job.experienceLevel ?? '',
          openings: job.openings,
          deadline: job.deadline ? job.deadline.split('T')[0] : ''
        });
        setResponsibilities(job.responsibilities.split('\n').filter(Boolean).map(r => r.replace(/^•\s*/, '')));
        setQualifications(job.qualifications.split('\n').filter(Boolean).map(q => q.replace(/^•\s*/, '')));
        setSkills(job.requiredSkills.split(',').map(s => s.trim()).filter(Boolean));
        setBenefits(job.benefits ? job.benefits.split('\n').filter(Boolean).map(b => b.replace(/^•\s*/, '')) : []);
      } else {
        setError(result.error || 'Failed to load job details');
      }
      setIsLoading(false);
    };
    loadJobDetails();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSaving(true);
    setError(null);
    setValidationErrors({});

    const command: UpdateJobListingCommand = {
      title: formData.title,
      description: formData.description,
      responsibilities: responsibilities.map(r => `• ${r}`).join('\n'),
      qualifications: qualifications.map(q => `• ${q}`).join('\n'),
      requiredSkills: skills.join(','),
      benefits: benefits.length > 0 ? benefits.map(b => `• ${b}`).join('\n') : undefined,
      location: formData.location,
      jobType: formData.jobType,
      workSetup: formData.workSetup,
      salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : undefined,
      experienceLevel: formData.experienceLevel || undefined,
      openings: formData.openings,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined
    };

    const result = await jobListingService.updateJobListing(id, command);

    if (result.isSuccess) {
      navigate(`/company/jobs/${id}`);
    } else {
      setError(result.error || 'Failed to update job listing');
      if (result.validationErrors) {
        setValidationErrors(result.validationErrors);
      }
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="cpj-shell">
        <CompanySidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="cpj-main">
          <CompanyHeader
            title="Edit Job Listing"
            subtitle="Loading..."
            onMenuToggle={() => setIsSidebarOpen((value) => !value)}
          />
          <div className="cpj-body">
            {/* Basic Information Skeleton */}
            <div className="cpj-card">
              <div style={{ width: '40%', height: '18px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '16px' }} />
              <div style={{ marginBottom: '16px' }}>
                <div style={{ width: '20%', height: '14px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '6px' }} />
                <div style={{ width: '100%', height: '40px', background: '#F1F5F9', borderRadius: '8px' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ width: '25%', height: '14px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '6px' }} />
                <div style={{ width: '100%', height: '100px', background: '#F1F5F9', borderRadius: '8px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ width: '30%', height: '14px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '6px' }} />
                  <div style={{ width: '100%', height: '40px', background: '#F1F5F9', borderRadius: '8px' }} />
                </div>
                <div>
                  <div style={{ width: '30%', height: '14px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '6px' }} />
                  <div style={{ width: '100%', height: '40px', background: '#F1F5F9', borderRadius: '8px' }} />
                </div>
              </div>
              <div>
                <div style={{ width: '20%', height: '14px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '6px' }} />
                <div style={{ width: '100%', height: '40px', background: '#F1F5F9', borderRadius: '8px' }} />
              </div>
            </div>

            {/* Responsibilities Skeleton */}
            <div className="cpj-card">
              <div style={{ width: '40%', height: '18px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '16px' }} />
              <div style={{ width: '100%', height: '40px', background: '#F1F5F9', borderRadius: '8px', marginBottom: '12px' }} />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ width: '120px', height: '32px', background: '#F1F5F9', borderRadius: '6px' }} />
                ))}
              </div>
            </div>

            {/* Qualifications Skeleton */}
            <div className="cpj-card">
              <div style={{ width: '35%', height: '18px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '16px' }} />
              <div style={{ width: '100%', height: '40px', background: '#F1F5F9', borderRadius: '8px', marginBottom: '12px' }} />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ width: '140px', height: '32px', background: '#F1F5F9', borderRadius: '6px' }} />
                ))}
              </div>
            </div>

            {/* Skills Skeleton */}
            <div className="cpj-card">
              <div style={{ width: '30%', height: '18px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '16px' }} />
              <div style={{ width: '100%', height: '40px', background: '#F1F5F9', borderRadius: '8px', marginBottom: '12px' }} />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{ width: '80px', height: '32px', background: '#F1F5F9', borderRadius: '6px' }} />
                ))}
              </div>
            </div>

            {/* Additional Details Skeleton */}
            <div className="cpj-card">
              <div style={{ width: '35%', height: '18px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '16px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i}>
                    <div style={{ width: '40%', height: '14px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '6px' }} />
                    <div style={{ width: '100%', height: '40px', background: '#F1F5F9', borderRadius: '8px' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Skeleton */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '20px' }}>
              <div style={{ width: '100px', height: '40px', background: '#F1F5F9', borderRadius: '8px' }} />
              <div style={{ width: '120px', height: '40px', background: '#F1F5F9', borderRadius: '8px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="cpj-shell">
        <CompanySidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="cpj-main">
          <CompanyHeader
            title="Edit Job Listing"
            subtitle="Error"
            onMenuToggle={() => setIsSidebarOpen((value) => !value)}
          />
          <div className="cpj-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <div style={{ textAlign: 'center', color: '#DC2626' }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cpj-shell">
      <CompanySidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="cpj-main">
        <CompanyHeader
          title="Edit Job Listing"
          subtitle="Update job details and requirements"
          onMenuToggle={() => setIsSidebarOpen((value) => !value)}
        />

        <div className="cpj-body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ padding: '12px 16px', background: '#FEE2E2', border: '1px solid #DC2626', borderRadius: '8px', marginBottom: '20px', color: '#DC2626' }}>
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="cpj-card">
              <h3 className="cpj-section-title">Basic Information</h3>
              
              <div className="cpj-form-group">
                <label className="cpj-label">Job Title *</label>
                <input
                  type="text"
                  className="cpj-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                {validationErrors.Title && <span className="cpj-error">{validationErrors.Title[0]}</span>}
              </div>

              <div className="cpj-form-group">
                <label className="cpj-label">Job Description *</label>
                <textarea
                  className="cpj-textarea"
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
                {validationErrors.Description && <span className="cpj-error">{validationErrors.Description[0]}</span>}
              </div>

              <div className="cpj-form-row">
                <div className="cpj-form-group">
                  <label className="cpj-label">Job Type *</label>
                  <select
                    className="cpj-select"
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: parseInt(e.target.value) })}
                  >
                    {JOB_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="cpj-form-group">
                  <label className="cpj-label">Work Setup *</label>
                  <select
                    className="cpj-select"
                    value={formData.workSetup}
                    onChange={(e) => setFormData({ ...formData, workSetup: parseInt(e.target.value) })}
                  >
                    {WORK_SETUPS.map(setup => (
                      <option key={setup.value} value={setup.value}>{setup.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="cpj-form-group">
                <label className="cpj-label">Location *</label>
                <input
                  type="text"
                  className="cpj-input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Responsibilities */}
            <div className="cpj-card">
              <h3 className="cpj-section-title">Key Responsibilities *</h3>
              <div className="cpj-tag-input-group">
                <input
                  type="text"
                  className="cpj-tag-input"
                  placeholder="Add a responsibility..."
                  value={newResponsibility}
                  onChange={(e) => setNewResponsibility(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newResponsibility.trim()) {
                        setResponsibilities([...responsibilities, newResponsibility.trim()]);
                        setNewResponsibility('');
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  className="cpj-tag-add-btn"
                  onClick={() => {
                    if (newResponsibility.trim()) {
                      setResponsibilities([...responsibilities, newResponsibility.trim()]);
                      setNewResponsibility('');
                    }
                  }}
                >
                  Add
                </button>
              </div>
              <div className="cpj-tag-list">
                {responsibilities.map((resp, i) => (
                  <span key={i} className="cpj-tag">
                    {resp}
                    <button type="button" onClick={() => setResponsibilities(responsibilities.filter((_, idx) => idx !== i))}>×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Qualifications */}
            <div className="cpj-card">
              <h3 className="cpj-section-title">Qualifications *</h3>
              <div className="cpj-tag-input-group">
                <input
                  type="text"
                  className="cpj-tag-input"
                  placeholder="Add a qualification..."
                  value={newQualification}
                  onChange={(e) => setNewQualification(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newQualification.trim()) {
                        setQualifications([...qualifications, newQualification.trim()]);
                        setNewQualification('');
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  className="cpj-tag-add-btn"
                  onClick={() => {
                    if (newQualification.trim()) {
                      setQualifications([...qualifications, newQualification.trim()]);
                      setNewQualification('');
                    }
                  }}
                >
                  Add
                </button>
              </div>
              <div className="cpj-tag-list">
                {qualifications.map((qual, i) => (
                  <span key={i} className="cpj-tag">
                    {qual}
                    <button type="button" onClick={() => setQualifications(qualifications.filter((_, idx) => idx !== i))}>×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Required Skills */}
            <div className="cpj-card">
              <h3 className="cpj-section-title">Required Skills *</h3>
              <div className="cpj-tag-input-group">
                <input
                  type="text"
                  className="cpj-tag-input"
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newSkill.trim()) {
                        setSkills([...skills, newSkill.trim()]);
                        setNewSkill('');
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  className="cpj-tag-add-btn"
                  onClick={() => {
                    if (newSkill.trim()) {
                      setSkills([...skills, newSkill.trim()]);
                      setNewSkill('');
                    }
                  }}
                >
                  Add
                </button>
              </div>
              <div className="cpj-tag-list">
                {skills.map((skill, i) => (
                  <span key={i} className="cpj-tag">
                    {skill}
                    <button type="button" onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}>×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="cpj-card">
              <h3 className="cpj-section-title">Perks & Benefits</h3>
              <div className="cpj-tag-input-group">
                <input
                  type="text"
                  className="cpj-tag-input"
                  placeholder="Add a benefit..."
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newBenefit.trim()) {
                        setBenefits([...benefits, newBenefit.trim()]);
                        setNewBenefit('');
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  className="cpj-tag-add-btn"
                  onClick={() => {
                    if (newBenefit.trim()) {
                      setBenefits([...benefits, newBenefit.trim()]);
                      setNewBenefit('');
                    }
                  }}
                >
                  Add
                </button>
              </div>
              <div className="cpj-tag-list">
                {benefits.map((benefit, i) => (
                  <span key={i} className="cpj-tag">
                    {benefit}
                    <button type="button" onClick={() => setBenefits(benefits.filter((_, idx) => idx !== i))}>×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="cpj-card">
              <h3 className="cpj-section-title">Additional Details</h3>
              
              <div className="cpj-form-row">
                <div className="cpj-form-group">
                  <label className="cpj-label">Minimum Salary (₱)</label>
                  <input
                    type="number"
                    className="cpj-input"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                  />
                </div>

                <div className="cpj-form-group">
                  <label className="cpj-label">Maximum Salary (₱)</label>
                  <input
                    type="number"
                    className="cpj-input"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                  />
                </div>
              </div>

              <div className="cpj-form-row">
                <div className="cpj-form-group">
                  <label className="cpj-label">Experience Level</label>
                  <input
                    type="text"
                    className="cpj-input"
                    placeholder="e.g., Entry Level, Mid-Level, Senior"
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                  />
                </div>

                <div className="cpj-form-group">
                  <label className="cpj-label">Number of Openings *</label>
                  <input
                    type="number"
                    className="cpj-input"
                    min="1"
                    value={formData.openings}
                    onChange={(e) => setFormData({ ...formData, openings: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
              </div>

              <div className="cpj-form-group">
                <label className="cpj-label">Application Deadline</label>
                <input
                  type="date"
                  className="cpj-input"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="cpj-actions">
              <button
                type="button"
                className="cpj-btn cpj-btn--secondary"
                onClick={() => navigate(`/company/jobs/${id}`)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cpj-btn cpj-btn--primary"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CompanyEditJob;
