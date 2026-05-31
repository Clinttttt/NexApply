# Create recovery directory
$recoveryDir = "recovered-files"
New-Item -ItemType Directory -Force -Path $recoveryDir | Out-Null

# Get all blob files
$blobs = Get-ChildItem ".git/lost-found/other" -File

Write-Host "Found $($blobs.Count) blobs. Extracting..."

$counter = 0
foreach ($blob in $blobs) {
    $hash = $blob.Name
    $content = git show $hash 2>$null
    
    if ($content) {
        # Save to file with counter
        $outputFile = "$recoveryDir/$counter-$hash.txt"
        $content | Out-File -FilePath $outputFile -Encoding UTF8
        
        # Show first line to help identify
        $firstLine = ($content | Select-Object -First 1).Trim()
        if ($firstLine.Length -gt 80) {
            $firstLine = $firstLine.Substring(0, 80) + "..."
        }
        Write-Host "$counter : $firstLine"
        
        $counter++
    }
}

Write-Host "`nRecovered $counter files to $recoveryDir/"
Write-Host "Search for your code in these files!"
