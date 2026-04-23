# Resume Date Parsing - Test Scenarios

## Current Implementation

### User Input Formats

**Education Period:**
- Format: `2021-2025` (years only)
- Example: "2024-2025"

**Work Experience Period:**
- Format: `2023-2024` (years only)
- Format: `2023-Present` (current job)
- Format: `Jan 2023 - Dec 2024` (full dates)

### Parsing Logic

**ParseYear (for Education):**
```csharp
"2024-2025" → StartYear: 2024, EndYear: 2025
```

**ParseDate (for Work Experience):**
```csharp
"2023-2024" → StartDate: Jan 1, 2023, EndDate: Dec 31, 2024
"2023-Present" → StartDate: Jan 1, 2023, EndDate: null
"Jan 2023 - Dec 2024" → StartDate: Jan 1, 2023, EndDate: Dec 1, 2024
```

## Expected API Response

### Education
```json
{
  "institution": "North Eastern Mindanao State University",
  "degree": "Bachelor of Science in Information Technology",
  "startYear": 2024,
  "endYear": 2025,
  "description": "cute"
}
```

### Work Experience
```json
{
  "company": "Aitechs",
  "position": "Software Developer",
  "startDate": "2023-01-01T00:00:00Z",
  "endDate": "2024-12-31T00:00:00Z",
  "description": "..."
}
```

## Properties Removed from Response

- ❌ `field` (Education) - Always null, not used
- ❌ `location` (WorkExperience) - Not captured in UI
- ❌ `isCurrent` (WorkExperience) - Can be inferred from Period containing "Present"

## Test Steps

1. **Add Education:**
   - Organization: "North Eastern Mindanao State University"
   - Period: "2024-2025"
   - Title: "Bachelor of Science in Information Technology"
   - Description: "Dean's List"

2. **Add Work Experience:**
   - Organization: "Aitechs"
   - Period: "2023-2024"
   - Title: "Software Developer"
   - Description: "Built features"

3. **Click Lock** to save

4. **Check Swagger GET /api/profile/resume:**
   - Education should have `startYear: 2024, endYear: 2025`
   - Work Experience should have `startDate: "2023-01-01T00:00:00Z", endDate: "2024-12-31T00:00:00Z"`
   - No `field`, `location`, or `isCurrent` properties in response

5. **Refresh page** - data should persist and display correctly

## Current Issue

When user enters "2023-2024" in Work Experience Period field:
- ✅ Saves correctly to database as JSON: `{"Period": "2023-2024"}`
- ✅ ParseDate should convert to: `StartDate: 2023-01-01, EndDate: 2024-12-31`
- ❌ Currently returning `null` for dates

## Fix Applied

Updated `ParseDate` method to:
1. Split by `-` or `–` (en-dash)
2. Trim whitespace
3. Try parsing as full date first (e.g., "Jan 2023")
4. Fall back to year-only parsing (e.g., "2023")
5. Return DateTime with Jan 1 for start, Dec 31 for end

## Expected Result After Fix

```json
{
  "company": "Aitechs",
  "position": "Software Developer",
  "startDate": "2023-01-01T00:00:00Z",
  "endDate": "2024-12-31T00:00:00Z",
  "description": "..."
}
```

No more null dates! ✅
