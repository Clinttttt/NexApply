# NexApply Enum Reference

All enums are now stored as **integers** in the database for easier API input/output.

---

## JobType (JobListings)
```
0 = FullTime
1 = PartTime
2 = Internship
3 = Freelance
4 = Remote
```

**Example:**
```json
{
  "jobType": 2  // Internship
}
```

---

## WorkSetup (JobListings)
```
0 = OnSite
1 = Remote
2 = Hybrid
```

**Example:**
```json
{
  "workSetup": 2  // Hybrid
}
```

---

## JobListingStatus (JobListings)
```
0 = Active
1 = Paused
2 = Closed
```

**Example:**
```json
{
  "status": 0  // Active
}
```

---

## ApplicationStatus (Applications)
```
0 = Submitted
1 = UnderReview
2 = Shortlisted
3 = ForInterview
4 = Declined
```

**Example:**
```json
{
  "status": 1  // UnderReview
}
```

---

## UserRole (Users)
```
0 = Student
1 = Company
```

**Example:**
```json
{
  "role": 0  // Student
}
```

---

## API Usage

### Create Job Listing
```json
POST /api/jobs
{
  "title": "Full-Stack Developer",
  "jobType": 0,        // FullTime
  "workSetup": 2,      // Hybrid
  "location": "Manila",
  ...
}
```

### Response
```json
{
  "id": "guid",
  "title": "Full-Stack Developer",
  "jobType": 0,        // Returns as integer
  "workSetup": 2,      // Returns as integer
  "status": 0,         // Active
  ...
}
```

---

## Benefits of Integer Enums

✅ Easier to input (just type 0, 1, 2 instead of "FullTime", "PartTime")  
✅ Smaller payload size  
✅ Faster database queries  
✅ Type-safe in C# code  
✅ No typo errors  
✅ Consistent with standard enum behavior  

---

## Migration Applied

**Migration:** `ConvertEnumsToIntegers`

Converted all enum columns from `character varying` (string) to `integer`:
- JobListings: JobType, WorkSetup, Status
- Applications: Status

All existing data was preserved and converted correctly.
