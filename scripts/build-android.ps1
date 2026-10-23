[CmdletBinding()]
param(
  [string]$ToolsDirectory = (Join-Path (Split-Path $PSScriptRoot -Parent) '..\wardnote-android-buildtools'),
  [string]$JavaHome = '',
  [string]$AndroidSdk = '',
  [string]$SigningKey = '',
  [string]$SigningPasswordFile = '',
  [switch]$CreatePreviewKey
)
$ErrorActionPreference = 'Stop'
$project = [IO.Path]::GetFullPath((Split-Path $PSScriptRoot -Parent))
$tools = [IO.Path]::GetFullPath($ToolsDirectory)
$release = Get-Content -LiteralPath (Join-Path $project 'package.json') -Raw | ConvertFrom-Json
if ($release.version -notmatch '^\d+\.\d+\.\d+-preview$' -or $release.androidVersionCode -lt 2) { throw 'Invalid release version or Android versionCode.' }
if (!$JavaHome) { $JavaHome = Join-Path $tools 'jdk\jdk-17.0.20.1+1' }
if (!$AndroidSdk) { $AndroidSdk = Join-Path $tools 'sdk' }
if (!$SigningKey) { $SigningKey = Join-Path $tools 'private-signing\wardnote-android-preview.p12' }
if (!$SigningPasswordFile) { $SigningPasswordFile = Join-Path $tools 'private-signing\password.txt' }
$java = Join-Path $JavaHome 'bin\java.exe'
$javac = Join-Path $JavaHome 'bin\javac.exe'
$jar = Join-Path $JavaHome 'bin\jar.exe'
$keytool = Join-Path $JavaHome 'bin\keytool.exe'
$sdkTools = Join-Path $AndroidSdk 'build-tools\35.0.0'
$androidJar = Join-Path $AndroidSdk 'platforms\android-35\android.jar'
$aapt = Join-Path $sdkTools 'aapt2.exe'
$align = Join-Path $sdkTools 'zipalign.exe'
$d8 = Join-Path $sdkTools 'lib\d8.jar'
$signer = Join-Path $sdkTools 'lib\apksigner.jar'
foreach ($file in @($java,$javac,$jar,$keytool,$androidJar,$aapt,$align,$d8,$signer)) {
  if (!(Test-Path -LiteralPath $file -PathType Leaf)) { throw "Required build tool missing: $file" }
}
function Invoke-Checked([string]$Program, [string[]]$Arguments) {
  & $Program @Arguments
  if ($LASTEXITCODE -ne 0) { throw "Build command failed ($LASTEXITCODE): $Program" }
}
$source = Join-Path $project 'android\app\src\main'
$web = Join-Path $project 'web'
$build = Join-Path $project 'build\android'
$dist = Join-Path $project 'artifacts'
if (!(Test-Path -LiteralPath (Join-Path $web 'index.html'))) { throw 'Bundled web/index.html is missing.' }
# Delete only this script's generated build directory. Never touch a workspace/database.
if (Test-Path -LiteralPath $build) {
  $resolved = (Resolve-Path -LiteralPath $build).Path
  if (!$resolved.StartsWith($project + '\build\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Build path outside project.' }
  if ((Get-Item -LiteralPath $resolved).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Refusing linked build directory.' }
  Remove-Item -LiteralPath $resolved -Recurse -Force
}
foreach ($dir in @($build,$dist,(Join-Path $build 'assets'),(Join-Path $build 'gen'),(Join-Path $build 'classes'),(Join-Path $build 'dex'),(Join-Path $tools 'tmp'))) {
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
}
$env:TEMP = Join-Path $tools 'tmp'
$env:TMP = $env:TEMP
$javaOptions = @('-Djava.io.tmpdir=' + $env:TEMP)
Copy-Item -LiteralPath $web -Destination (Join-Path $build 'assets\web') -Recurse
Invoke-Checked $aapt @('compile','--dir',(Join-Path $source 'res'),'-o',(Join-Path $build 'resources.zip'))
Invoke-Checked $aapt @('link','-o',(Join-Path $build 'unsigned.apk'),'-I',$androidJar,'--manifest',(Join-Path $source 'AndroidManifest.xml'),'--min-sdk-version','26','--target-sdk-version','35','--version-code',([string]$release.androidVersionCode),'--version-name',$release.version,'--java',(Join-Path $build 'gen'),(Join-Path $build 'resources.zip'))
# Java's ZIP writer uses Android-compatible '/' asset names on Windows.
Invoke-Checked $jar @('uf',(Join-Path $build 'unsigned.apk'),'-C',$build,'assets')
$sources = @(Get-ChildItem -LiteralPath (Join-Path $source 'java') -Recurse -Filter '*.java' -File) + @(Get-ChildItem -LiteralPath (Join-Path $build 'gen') -Recurse -Filter '*.java' -File)
$sourceList = Join-Path $build 'sources.txt'
[IO.File]::WriteAllLines($sourceList, @($sources | ForEach-Object { '"' + $_.FullName.Replace('\','/') + '"' }), [Text.UTF8Encoding]::new($false))
Invoke-Checked $javac @(('-J-Djava.io.tmpdir=' + $env:TEMP),'-J-Duser.language=en','-J-Duser.country=US','-encoding','UTF-8','--release','8','-classpath',$androidJar,'-d',(Join-Path $build 'classes'),('@' + $sourceList))
Invoke-Checked $jar @('cf',(Join-Path $build 'classes.jar'),'-C',(Join-Path $build 'classes'),'.')
Invoke-Checked $java ($javaOptions + @('-cp',$d8,'com.android.tools.r8.D8','--lib',$androidJar,'--min-api','26','--output',(Join-Path $build 'dex'),(Join-Path $build 'classes.jar')))
Invoke-Checked $jar @('uf',(Join-Path $build 'unsigned.apk'),'-C',(Join-Path $build 'dex'),'classes.dex')
Invoke-Checked $align @('-f','-p','4',(Join-Path $build 'unsigned.apk'),(Join-Path $build 'aligned.apk'))
if (!(Test-Path -LiteralPath $SigningKey)) {
  if (!$CreatePreviewKey) { throw 'Signing key missing. Supply a preserved signing key, or explicitly use -CreatePreviewKey for a new evaluation identity.' }
  $keyParent = Split-Path ([IO.Path]::GetFullPath($SigningKey)) -Parent
  if ($keyParent.StartsWith($project + '\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Signing keys must remain outside the public project/source package.' }
  New-Item -ItemType Directory -Force -Path $keyParent | Out-Null
  if (Test-Path -LiteralPath $SigningPasswordFile) { throw 'Existing password file without signing key; resolve manually to avoid changing update identity.' }
  $secret = [byte[]]::new(32)
  $random = [Security.Cryptography.RandomNumberGenerator]::Create()
  $random.GetBytes($secret)
  $random.Dispose()
  [IO.File]::WriteAllText($SigningPasswordFile,[Convert]::ToBase64String($secret),[Text.UTF8Encoding]::new($false))
  Invoke-Checked $keytool @('-genkeypair','-keystore',$SigningKey,'-storetype','PKCS12','-storepass:file',$SigningPasswordFile,'-alias','wardnote-preview','-keyalg','RSA','-keysize','3072','-validity','3650','-dname','CN=WardNote Android Preview, OU=Evaluation only, O=WardNote','-noprompt')
  # The first locally generated evaluation identity is private to its owner/admins.
  foreach ($secretFile in @($SigningKey,$SigningPasswordFile)) {
    $acl = [Security.AccessControl.FileSecurity]::new()
    $acl.SetAccessRuleProtection($true,$false)
    foreach ($sid in @([Security.Principal.WindowsIdentity]::GetCurrent().User,[Security.Principal.SecurityIdentifier]::new('S-1-5-18'),[Security.Principal.SecurityIdentifier]::new('S-1-5-32-544'))) {
      $acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new($sid,'FullControl','Allow'))
    }
    Set-Acl -LiteralPath $secretFile -AclObject $acl
  }
}
if (!(Test-Path -LiteralPath $SigningPasswordFile)) { throw 'Signing password file missing.' }
$apk = Join-Path $dist ('wardnote-android-' + $release.version + '.apk')
Invoke-Checked $java ($javaOptions + @('-jar',$signer,'sign','--v4-signing-enabled','false','--ks',$SigningKey,'--ks-pass',('file:' + $SigningPasswordFile),'--ks-key-alias','wardnote-preview','--out',$apk,(Join-Path $build 'aligned.apk')))
if (Test-Path -LiteralPath ($apk + '.idsig')) { Remove-Item -LiteralPath ($apk + '.idsig') }
Invoke-Checked $java ($javaOptions + @('-jar',$signer,'verify','--verbose','--print-certs',$apk))
Invoke-Checked $align @('-c','-p','4',$apk)
Invoke-Checked $aapt @('dump','badging',$apk)
$digest = (Get-FileHash -Algorithm SHA256 -LiteralPath $apk).Hash.ToLowerInvariant()
[IO.File]::WriteAllText($apk + '.sha256',$digest + '  ' + [IO.Path]::GetFileName($apk) + "`n",[Text.UTF8Encoding]::new($false))
Write-Output "Created evaluation APK: $apk"
Write-Output "SHA256: $digest"
Write-Output 'Keep the private signing key/password outside the delivery package. Physical-device validation remains required.'
