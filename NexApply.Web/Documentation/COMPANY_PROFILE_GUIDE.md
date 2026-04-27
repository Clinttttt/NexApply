# Company Profile - React Port Guide

## ✅ What's Ready

### API Service Created
- `src/services/companyProfileService.ts`
- GET `/companyprofile` - Fetch profile
- PUT `/companyprofile` - Update profile

## 📋 Component Structure (Blazor → React)

### Blazor Original
- **File:** `RecruiterCompanyProfile.razor` (1000+ lines)
- **Features:**
  - Left sidebar: Preview card (sticky)
  - Right side: 5 editable sections
  - Edit/View mode toggle
  - Logo upload (base64)
  - Perks/Culture tags
  - Social links
  - Hiring manager info

### React Port Strategy

**Option 1: Single Large Component** (like Blazor)
```
CompanyProfile.tsx (1000+ lines)
CompanyProfile.css
```

**Option 2: Split into Sub-Components** (recommended)
```
pages/
  CompanyProfile.tsx          ← Main page
components/
  company-profile/
    ProfilePreview.tsx        ← Left sidebar preview
    BasicInfoSection.tsx      ← Section 1
    AboutSection.tsx          ← Section 2
    CultureSection.tsx        ← Section 3
    ContactSection.tsx        ← Section 4
    HiringManagerSection.tsx  ← Section 5
```

## 🎯 Key Features to Port

### 1. State Management
```typescript
const [profile, setProfile] = useState<CompanyProfileDto | null>(null);
const [isEditing, setIsEditing] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [showSavedBanner, setShowSavedBanner] = useState(false);
```

### 2. Edit/View Toggle
```typescript
const startEdit = () => {
  setBackup(profile); // Save backup
  setIsEditing(true);
};

const cancelEdit = () => {
  setProfile(backup); // Restore backup
  setIsEditing(false);
};

const saveProfile = async () => {
  setIsSaving(true);
  const result = await companyProfileService.updateProfile(profile);
  if (result.isSuccess) {
    setIsEditing(false);
    setShowSavedBanner(true);
    setTimeout(() => setShowSavedBanner(false), 3500);
  }
  setIsSaving(false);
};
```

### 3. Logo Upload
```typescript
const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    alert('File too large');
    return;
  }

  // Convert to base64
  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result as string;
    setProfile({ ...profile, logoUrl: base64 });
  };
  reader.readAsDataURL(file);
};
```

### 4. Perks Management
```typescript
const [perkInput, setPerkInput] = useState('');
const [perks, setPerks] = useState<string[]>([]);

const addPerk = () => {
  if (perkInput.trim() && !perks.includes(perkInput.trim())) {
    setPerks([...perks, perkInput.trim()]);
    setPerkInput('');
  }
};

const removePerk = (perk: string) => {
  setPerks(perks.filter(p => p !== perk));
};
```

### 5. Culture Tags Toggle
```typescript
const cultureOptions = [
  'Collaborative', 'Fast-paced', 'Innovative', 'Data-driven',
  'Customer-obsessed', 'Remote-first', 'Inclusive', 'Results-oriented',
  'Mission-driven', 'Flat hierarchy'
];

const [cultureTags, setCultureTags] = useState<string[]>([]);

const toggleCultureTag = (tag: string) => {
  if (cultureTags.includes(tag)) {
    setCultureTags(cultureTags.filter(t => t !== tag));
  } else {
    setCultureTags([...cultureTags, tag]);
  }
};
```

## 📦 Data Mapping

### Perks & Culture (String ↔ Array)
```typescript
// API returns comma-separated string
const perksArray = profile.perksAndBenefits?.split(',').map(p => p.trim()) || [];
const cultureArray = profile.workCulture?.split(',').map(c => c.trim()) || [];

// Convert back to string for API
const command = {
  ...profile,
  perksAndBenefits: perks.join(', '),
  workCulture: cultureTags.join(', ')
};
```

## 🎨 CSS Strategy

**Option 1:** Port Blazor CSS directly
- Copy `RecruiterCompanyProfile.razor.css`
- Rename to `CompanyProfile.css`
- Update class names (kebab-case → camelCase if using CSS modules)

**Option 2:** Use Tailwind (already in project)
- Faster development
- Smaller bundle
- Consistent with other pages

## 🚀 Quick Start (Minimal Version)

Want me to create a simplified version with:
- ✅ Basic info editing
- ✅ Logo upload
- ✅ Perks management
- ✅ Save/Cancel
- ❌ Skip: Culture tags, social links, hiring manager (add later)

This would be ~300 lines instead of 1000+.

## 📝 Full Port Checklist

- [ ] Create main CompanyProfile.tsx page
- [ ] Add routing `/company-profile`
- [ ] Create ProfilePreview component (left sidebar)
- [ ] Create BasicInfoSection (name, industry, location, etc.)
- [ ] Create AboutSection (description, mission)
- [ ] Create CultureSection (perks, culture tags)
- [ ] Create ContactSection (email, phone, social links)
- [ ] Create HiringManagerSection (name, title, email)
- [ ] Add logo upload functionality
- [ ] Add edit/view mode toggle
- [ ] Add save/cancel/discard logic
- [ ] Add success banner
- [ ] Port CSS styles
- [ ] Add loading/error states
- [ ] Test with API

## 🔌 API Endpoints

Already configured in service:
- `GET /api/companyprofile` - Get profile
- `PUT /api/companyprofile` - Update profile

## 💡 Recommendation

**Start with simplified version** (300 lines):
1. Basic info + logo + perks
2. Test it works end-to-end
3. Add remaining sections incrementally

This approach:
- ✅ Faster to implement
- ✅ Easier to test
- ✅ Can iterate based on feedback
- ✅ Less overwhelming

Want me to create the simplified version now? Or the full 1:1 port?
