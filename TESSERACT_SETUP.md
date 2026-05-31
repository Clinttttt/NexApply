# Tesseract OCR Setup for Resume Image Processing

## Overview
NexApply uses Tesseract OCR to extract text from resume images (JPG, PNG, etc.) for skill matching.

## Setup Instructions

### 1. Download Tesseract Language Data
Download the English language data file from the official Tesseract repository:
- **File**: `eng.traineddata`
- **URL**: https://github.com/tesseract-ocr/tessdata/raw/main/eng.traineddata

### 2. Create tessdata Directory
Create a `tessdata` folder in the API project root:
```
NexApply.Api/
├── tessdata/
│   └── eng.traineddata
├── Features/
├── Program.cs
└── ...
```

### 3. Configure Build Action
Add the following to `NexApply.Api.csproj` to ensure the tessdata folder is copied to the output directory:

```xml
<ItemGroup>
  <None Include="tessdata\**\*">
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
  </None>
</ItemGroup>
```

### 4. Verify Setup
After setup, the tessdata folder should be available at runtime in:
- Development: `NexApply.Api/bin/Debug/net9.0/tessdata/`
- Production: `[deployment-path]/tessdata/`

## How It Works

When a student uploads a resume image:
1. The `UploadResumeHandler` detects image content types (image/jpeg, image/png, etc.)
2. It calls `ExtractImageTextWithOcr()` which uses Tesseract to extract text
3. The extracted text is stored in `StudentProfile.ParsedResumeText`
4. The skill matching algorithm uses this text to calculate match percentages

## Fallback Behavior

If Tesseract data is not available:
- The system will return: `"Uploaded resume image: [filename] (OCR data not available)"`
- Match percentage will be 0% unless the student has a template resume filled out

## Supported Image Formats
- JPG/JPEG
- PNG
- Other formats supported by Tesseract's Pix.LoadFromMemory()

## Troubleshooting

### OCR Not Working
1. Verify `tessdata` folder exists in the output directory
2. Check that `eng.traineddata` file is present
3. Ensure file permissions allow reading the tessdata folder

### Low Quality Text Extraction
- Tesseract works best with high-resolution, clear images
- Scanned documents should be at least 300 DPI
- Images should have good contrast and minimal noise

## Additional Languages (Optional)

To support other languages, download additional `.traineddata` files:
- Spanish: `spa.traineddata`
- French: `fra.traineddata`
- etc.

Place them in the `tessdata` folder and modify the engine initialization in `UploadResumeHandler.cs`:
```csharp
using var engine = new TesseractEngine(tessDataPath, "eng+spa", EngineMode.Default);
```
