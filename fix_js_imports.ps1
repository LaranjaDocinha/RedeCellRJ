$files = Get-ChildItem -Path "backend/src" -Recurse -Filter "*.ts"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    # Regex to find and replace .js in relative import/export paths
    $newContent = $content -replace "((import|export).*from\s+['"]\..*)\.js(['"])", '$1$3'
    if ($newContent -ne $content) {
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Updated: $($file.FullName)"
    }
}
