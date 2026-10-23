[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$project = [IO.Path]::GetFullPath((Split-Path $PSScriptRoot -Parent))
$fixtures = Join-Path $project 'tests\fixtures'
$output = Join-Path $project '.test-baseline'
function Assert-PlainDirectory([string]$Path) {
  if (Test-Path -LiteralPath $Path) {
    $item = Get-Item -LiteralPath $Path -Force
    if (!$item.PSIsContainer -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw "Unsafe fixture directory: $Path" }
  }
}
Assert-PlainDirectory $project
Assert-PlainDirectory $output
New-Item -ItemType Directory -Path $output -Force | Out-Null
$manifest = Get-Content -LiteralPath (Join-Path $fixtures 'manifest.json') -Raw | ConvertFrom-Json
if ($manifest.format -ne 'wardnote-regression-fixtures-v1') { throw 'Unknown baseline format.' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$total = 0
foreach ($item in $manifest.archives) {
  if ($item.archive -notmatch '^[a-z0-9.-]+\.zip$' -or $item.destination -notin @('browser','android-0.1.1')) { throw 'Unexpected fixture archive or destination.' }
  $archivePath = Join-Path $fixtures $item.archive
  if ((Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $item.sha256 -or (Get-Item -LiteralPath $archivePath).Length -ne $item.bytes) { throw 'Baseline archive checksum mismatch.' }
  $destination = Join-Path $output $item.destination
  Assert-PlainDirectory $destination
  New-Item -ItemType Directory -Path $destination -Force | Out-Null
  $expected = @{}
  foreach ($property in $item.files.PSObject.Properties) { $expected[$property.Name] = $property.Value }
  $archive = [IO.Compression.ZipFile]::OpenRead($archivePath)
  try {
    if ($archive.Entries.Count -ne $expected.Count) { throw 'Unexpected number of archive entries.' }
    $seen = @{}
    foreach ($entry in $archive.Entries) {
      $name = $entry.FullName
      if ($name -match '(^/|\\|:|(^|/)\.\.?(/|$)|//$)' -or $name.EndsWith('/') -or !$expected.ContainsKey($name) -or $seen.ContainsKey($name) -or (($entry.ExternalAttributes -shr 16) -band 0xF000) -eq 0xA000) { throw "Unsafe or unexpected ZIP entry: $name" }
      $seen[$name] = $true
      $target = [IO.Path]::GetFullPath((Join-Path $destination $name.Replace('/','\')))
      if (!$target.StartsWith($destination + '\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Fixture path escaped its destination.' }
      $parent = Split-Path $target -Parent
      for ($check = $parent; $check.Length -ge $destination.Length; $check = Split-Path $check -Parent) { Assert-PlainDirectory $check }
      New-Item -ItemType Directory -Path $parent -Force | Out-Null
      $record = $expected[$name]
      if ($entry.Length -ne $record.bytes) { throw 'Fixture size mismatch.' }
      $stream = $entry.Open(); $sha = [Security.Cryptography.SHA256]::Create()
      try { $hash = [BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-','').ToLowerInvariant() }
      finally { $sha.Dispose(); $stream.Dispose() }
      if ($hash -ne $record.sha256) { throw 'Fixture content checksum mismatch.' }
      if (Test-Path -LiteralPath $target) {
        $existing = Get-Item -LiteralPath $target -Force
        if ($existing.PSIsContainer -or ($existing.Attributes -band [IO.FileAttributes]::ReparsePoint) -or (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLowerInvariant() -ne $record.sha256) { throw "Existing test baseline differs; refusing overwrite: $target" }
      } else { [IO.Compression.ZipFileExtensions]::ExtractToFile($entry,$target,$false) }
      if ((Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLowerInvariant() -ne $record.sha256) { throw 'Extracted fixture checksum mismatch.' }
      $total++
    }
    foreach ($file in Get-ChildItem -LiteralPath $destination -Recurse -Force) {
      if ($file.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Linked fixture path is not allowed.' }
      if (!$file.PSIsContainer -and !$expected.ContainsKey($file.FullName.Substring($destination.Length + 1).Replace('\','/'))) { throw 'Unexpected file already exists in test baseline.' }
    }
  } finally { $archive.Dispose() }
}
Write-Output "Verified and prepared $total historical web assets; original deliveries were not read or modified."
