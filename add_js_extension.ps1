param (
    [string]$directory
)

if (-not $directory) {
    $directory = "C:\Users\Dell\OneDrive\Documentos\RedecellRJ\backend\src"
}

$files = Get-ChildItem -Path $directory -Recurse -Include "*.ts", "*.tsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Regex to find relative imports/exports without a file extension
    # It looks for patterns like: from './component' or from '../utils/helpers'
    # It avoids matching paths that already have an extension like .js, .css, .json, etc.
    # It also avoids matching package imports like 'react' or '@mui/material'
    $regex = "((?:import|export)\s+(?:.+?\s+from\s+)?['""])(\.\.?\/[^'"]+?)(?<!\.(?:js|ts|tsx|json|css|scss|svg))(['""])"
    
    $newContent = $content -replace $regex, ('$1$2.js$3')
    
    if ($newContent -ne $content) {
        # Use Write-Host for logging, and create a temporary file for changes
        Write-Host "Updating file: $($file.FullName)"
        [System.IO.File]::WriteAllText($file.FullName, $newContent)
    }
}

Write-Host "Script finished."