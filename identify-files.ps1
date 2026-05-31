# Analyze recovered files and try to identify them
$recoveredFiles = Get-ChildItem "recovered-files" -Filter "*.txt"

Write-Host "Analyzing $($recoveredFiles.Count) files..."
Write-Host ""

$identified = @()

foreach ($file in $recoveredFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Try to identify file type and name from content
    $fileName = "unknown"
    $fileType = "unknown"
    
    # Check for component names in imports/exports
    if ($content -match "export default function (\w+)") {
        $fileName = $matches[1] + ".tsx"
        $fileType = "React Component"
    }
    elseif ($content -match "export function (\w+)") {
        $fileName = $matches[1] + ".tsx"
        $fileType = "React Component"
    }
    elseif ($content -match "\.(\w+)\s*\{" -and $content -match "^/\*") {
        $fileName = "styles.css"
        $fileType = "CSS"
    }
    elseif ($content -match "namespace NexApply\.Api\.(\w+)") {
        $fileName = $matches[1] + ".cs"
        $fileType = "C# File"
    }
    
    # Look for specific file indicators
    if ($content -match "CompanySidebar") { $fileName = "CompanySidebar-related" }
    if ($content -match "CompanyDashboard") { $fileName = "CompanyDashboard-related" }
    if ($content -match "StudentSettings") { $fileName = "StudentSettings-related" }
    if ($content -match "CompanyApplicants") { $fileName = "CompanyApplicants-related" }
    if ($content -match "@media.*max-width") { $fileName += "-responsive" }
    
    $identified += [PSCustomObject]@{
        Number = $file.BaseName.Split('-')[0]
        OriginalHash = $file.BaseName.Split('-')[1]
        IdentifiedAs = $fileName
        Type = $fileType
        Size = $content.Length
        FirstLine = ($content -split "`n")[0].Substring(0, [Math]::Min(60, ($content -split "`n")[0].Length))
    }
}

# Show results
$identified | Sort-Object IdentifiedAs | Format-Table -AutoSize Number, IdentifiedAs, Type, Size, FirstLine

Write-Host ""
Write-Host "Files are in recovered-files/ folder"
Write-Host "To restore a specific file, copy from recovered-files/NUMBER-HASH.txt to your project"
