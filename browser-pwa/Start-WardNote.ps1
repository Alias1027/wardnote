# SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
param([switch]$NoBrowser, [switch]$Stop, [switch]$CheckInterface, [string]$InterfacePreviewPath)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$taskRoot = $PSScriptRoot
try {
  . (Join-Path $taskRoot 'scripts\windows-launcher.ps1')
  if ($NoBrowser) {
    if ($Stop) { throw 'Stopping requires the saved-work confirmation in the control window.' }
    Start-WardNoteLauncherService -Root $taskRoot
    exit 0
  }
  Add-Type -AssemblyName System.Windows.Forms
  Add-Type -AssemblyName System.Drawing
  [Windows.Forms.Application]::EnableVisualStyles()
  $taskForm = New-Object Windows.Forms.Form
  $taskForm.Text = 'WardNote | 启动与停止 / Start and stop'
  $taskForm.ClientSize = New-Object Drawing.Size(720, 490)
  $taskForm.MinimumSize = New-Object Drawing.Size(736, 529)
  $taskForm.StartPosition = 'CenterScreen'
  $taskForm.Font = New-Object Drawing.Font('Microsoft YaHei UI', 10)
  $taskForm.AutoScaleMode = 'Dpi'

  $taskHeading = New-Object Windows.Forms.Label
  $taskHeading.SetBounds(24, 18, 672, 32)
  $taskHeading.Font = New-Object Drawing.Font('Microsoft YaHei UI', 16, [Drawing.FontStyle]::Bold)
  $taskHeading.Text = 'WardNote'
  $taskForm.Controls.Add($taskHeading)

  $taskStatus = New-Object Windows.Forms.Label
  $taskStatus.SetBounds(24, 58, 672, 48)
  $taskStatus.Text = '准备启动 / Preparing to start...'
  $taskStatus.Anchor = 'Top,Left,Right'
  $taskForm.Controls.Add($taskStatus)

  $taskAddress = New-Object Windows.Forms.TextBox
  $taskAddress.SetBounds(24, 110, 672, 28)
  $taskAddress.ReadOnly = $true
  $taskAddress.AccessibleName = '访问地址 / Browser address'
  $taskAddress.Anchor = 'Top,Left,Right'
  $taskForm.Controls.Add($taskAddress)

  $taskStartButton = New-Object Windows.Forms.Button
  $taskStartButton.SetBounds(24, 154, 326, 48)
  $taskStartButton.Text = '启动 / 打开浏览器  |  Start / Open'
  $taskStartButton.AccessibleName = $taskStartButton.Text
  $taskForm.Controls.Add($taskStartButton)

  $taskStopButton = New-Object Windows.Forms.Button
  $taskStopButton.SetBounds(370, 154, 326, 48)
  $taskStopButton.Text = '停止服务…  |  Stop service...'
  $taskStopButton.AccessibleName = $taskStopButton.Text
  $taskForm.Controls.Add($taskStopButton)

  $taskShortcutButton = New-Object Windows.Forms.Button
  $taskShortcutButton.SetBounds(24, 214, 326, 38)
  $taskShortcutButton.Text = '创建桌面快捷方式 / Desktop shortcut'
  $taskShortcutButton.AccessibleName = $taskShortcutButton.Text
  $taskForm.Controls.Add($taskShortcutButton)

  $taskHelpButton = New-Object Windows.Forms.Button
  $taskHelpButton.SetBounds(370, 214, 326, 38)
  $taskHelpButton.Text = '使用说明 / Getting started'
  $taskHelpButton.AccessibleName = $taskHelpButton.Text
  $taskForm.Controls.Add($taskHelpButton)

  $taskDetails = New-Object Windows.Forms.TextBox
  $taskDetails.SetBounds(24, 266, 672, 148)
  $taskDetails.Multiline = $true
  $taskDetails.ReadOnly = $true
  $taskDetails.ScrollBars = 'Vertical'
  $taskDetails.Anchor = 'Top,Bottom,Left,Right'
  $taskDetails.AccessibleName = '状态与下一步 / Status and next steps'
  $taskDetails.Text = '首次使用：在浏览器中创建账号，妥善保存密码并定期导出加密备份。请保持整个应用文件夹的位置不变。' + "`r`n" + 'First use: create an account in your browser. Keep your password safe and export encrypted backups regularly. Keep the complete application folder in place.'
  $taskForm.Controls.Add($taskDetails)

  $taskFooter = New-Object Windows.Forms.Label
  $taskFooter.SetBounds(24, 426, 672, 52)
  $taskFooter.Anchor = 'Bottom,Left,Right'
  $taskFooter.Text = '关闭本窗口不会停止服务。停用前请先保存文字和录音。' + "`r`n" + 'Closing this window keeps WardNote running. Save text and recordings before stopping.'
  $taskForm.Controls.Add($taskFooter)
  $taskForm.AcceptButton = $taskStartButton

  $script:taskOperation = $null
  $script:taskOutputPath = $null
  $script:taskErrorPath = $null
  $taskTimer = New-Object Windows.Forms.Timer
  $taskTimer.Interval = 250

  function Show-WardNoteLauncherError {
    param([string]$Details)
    $taskStatus.Text = '未完成，请按下方说明处理 / Could not complete; see the next steps below.'
    $taskDetails.Text = (Get-WardNoteLauncherAdvice -Details $Details) + "`r`n`r`n" + $Details
  }

  function Start-WardNoteWindowOperation {
    if ($script:taskOperation) { return }
    try {
      $settings = Get-WardNoteLauncherSettings -Root $taskRoot
      $taskAddress.Text = $settings.Address
      $taskStatus.Text = '正在启动并验证服务，请稍候… / Starting and checking the service...'
      $taskStartButton.Enabled = $false
      $taskStopButton.Enabled = $false
      $operationFolder = Join-Path $taskRoot 'work'
      New-Item -ItemType Directory -Path $operationFolder -Force | Out-Null
      $operationId = [Guid]::NewGuid().ToString('N')
      $script:taskOutputPath = Join-Path $operationFolder ('launcher-' + $operationId + '.out')
      $script:taskErrorPath = Join-Path $operationFolder ('launcher-' + $operationId + '.err')
      $shellPath = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
      $script:taskOperation = Start-Process -FilePath $shellPath -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ('"' + (Join-Path $taskRoot 'Start-WardNote.ps1') + '"'), '-NoBrowser') -WorkingDirectory $taskRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput $script:taskOutputPath -RedirectStandardError $script:taskErrorPath
      $taskTimer.Start()
    } catch {
      Show-WardNoteLauncherError -Details $_.Exception.Message
      $taskStartButton.Enabled = $true
      $taskStopButton.Enabled = $true
    }
  }

  $taskTimer.Add_Tick({
    if (-not $script:taskOperation -or -not $script:taskOperation.HasExited) { return }
    $taskTimer.Stop()
    try {
      $script:taskOperation.WaitForExit()
      $result = Get-Content -LiteralPath $script:taskOutputPath -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
      $failure = Get-Content -LiteralPath $script:taskErrorPath -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
      if ($script:taskOperation.ExitCode -ne 0) { throw $failure }
      $settings = Get-WardNoteLauncherSettings -Root $taskRoot
      $taskAddress.Text = $settings.Address
      $taskStatus.Text = '运行中，已打开浏览器 / Running; browser opened.'
      $taskDetails.Text = '数据文件夹 / Data folder: ' + $settings.DataDirectory + "`r`n`r`n" + '若浏览器未出现，请复制上方地址到浏览器。 / If no browser appears, copy the address above into your browser.' + "`r`n`r`n" + $result
      Start-Process $settings.Address
    } catch { Show-WardNoteLauncherError -Details $_.Exception.Message }
    finally {
      $script:taskOperation.Dispose()
      $script:taskOperation = $null
      foreach ($operationPath in @($script:taskOutputPath, $script:taskErrorPath)) {
        if ($operationPath -and (Test-Path -LiteralPath $operationPath)) { Remove-Item -LiteralPath $operationPath -ErrorAction SilentlyContinue }
      }
      $taskStartButton.Enabled = $true
      $taskStopButton.Enabled = $true
    }
  })

  $taskStartButton.Add_Click({ Start-WardNoteWindowOperation })
  $taskStopButton.Add_Click({
    try {
      $settings = Get-WardNoteLauncherSettings -Root $taskRoot
      if (-not (Test-Path -LiteralPath $settings.ProcessFile)) {
        $taskStatus.Text = '本文件夹没有可停止的服务 / No service managed by this folder.'
        $taskDetails.Text = '若浏览器仍可访问，请从启动该服务的原文件夹停止。 / If WardNote is still available, stop it from the folder that started it.'
        return
      }
      $answer = [Windows.Forms.MessageBox]::Show($taskForm, '请先确认：所有文字已保存，录音已结束并保存。停止后，其他连接到此服务的窗口也将断开。' + "`r`n`r`n" + 'Confirm that all text and recordings are saved. Stopping also disconnects other windows using this service.' + "`r`n`r`n" + '已保存并停止？ / Saved everything and ready to stop?', 'WardNote | 确认停止 / Confirm stop', [Windows.Forms.MessageBoxButtons]::YesNo, [Windows.Forms.MessageBoxIcon]::Warning, [Windows.Forms.MessageBoxDefaultButton]::Button2)
      if ($answer -ne [Windows.Forms.DialogResult]::Yes) { return }
      $result = Stop-WardNoteLauncherService -Root $taskRoot -SavedWorkConfirmed | Out-String
      $taskStatus.Text = '服务已停止，已保存的数据保留 / Stopped; saved data is preserved.'
      $taskDetails.Text = $result + "`r`n" + '需要使用时，点击“启动 / 打开浏览器”。 / Click Start / Open when you need WardNote again.'
    } catch { Show-WardNoteLauncherError -Details $_.Exception.Message }
  })
  $taskShortcutButton.Add_Click({
    try {
      $shortcutPath = New-WardNoteDesktopShortcut -Root $taskRoot
      $taskDetails.Text = '已创建桌面快捷方式 / Desktop shortcut created: ' + $shortcutPath + "`r`n`r`n" + '请保留整个应用文件夹；快捷方式需要此文件夹。 / Keep the complete application folder; the shortcut needs it.'
    } catch { Show-WardNoteLauncherError -Details $_.Exception.Message }
  })
  $taskHelpButton.Add_Click({
    try { Start-Process (Join-Path $taskRoot '开始使用.html') }
    catch { Show-WardNoteLauncherError -Details $_.Exception.Message }
  })
  $taskForm.Add_FormClosing({
    if ($script:taskOperation) {
      $_.Cancel = $true
      $taskStatus.Text = '请等待启动检查结束，再关闭窗口 / Please wait for the start check before closing.'
    }
  })
  $taskForm.Add_Shown({
    if ($Stop) { $taskStopButton.PerformClick() } else { Start-WardNoteWindowOperation }
  })

  # Constructs the actual Windows Forms controls without showing a window or taking actions.
  if ($CheckInterface) {
    if ($InterfacePreviewPath) {
      $taskForm.CreateControl()
      $taskPreview = New-Object Drawing.Bitmap($taskForm.Width, $taskForm.Height)
      try {
        $taskForm.DrawToBitmap($taskPreview, (New-Object Drawing.Rectangle(0, 0, $taskForm.Width, $taskForm.Height)))
        # A hidden form omits its children in DrawToBitmap; render each actual control separately.
        $taskGraphics = [Drawing.Graphics]::FromImage($taskPreview)
        try {
          $taskBorderX = [int](($taskForm.Width - $taskForm.ClientSize.Width) / 2)
          $taskBorderY = $taskForm.Height - $taskForm.ClientSize.Height - $taskBorderX
          foreach ($taskControl in $taskForm.Controls) {
            $taskControlPreview = New-Object Drawing.Bitmap($taskControl.Width, $taskControl.Height)
            try {
              $taskControl.DrawToBitmap($taskControlPreview, (New-Object Drawing.Rectangle(0, 0, $taskControl.Width, $taskControl.Height)))
              $taskGraphics.DrawImageUnscaled($taskControlPreview, ($taskControl.Left + $taskBorderX), ($taskControl.Top + $taskBorderY))
            } finally { $taskControlPreview.Dispose() }
          }
        } finally { $taskGraphics.Dispose() }
        $taskPreview.Save($InterfacePreviewPath, [Drawing.Imaging.ImageFormat]::Png)
      } finally { $taskPreview.Dispose() }
    }
    [pscustomobject]@{ Powershell = $PSVersionTable.PSVersion.ToString(); Title = $taskForm.Text; Buttons = @($taskStartButton.Text, $taskStopButton.Text, $taskShortcutButton.Text, $taskHelpButton.Text); Footer = $taskFooter.Text; Visible = $taskForm.Visible } | ConvertTo-Json -Depth 3
  } else { [void]$taskForm.ShowDialog() }
  $taskTimer.Dispose()
  $taskForm.Dispose()
} catch {
  $details = $_.Exception.Message
  if ($NoBrowser -or $CheckInterface) { [Console]::Error.WriteLine($details); exit 1 }
  try {
    Add-Type -AssemblyName System.Windows.Forms
    [void][Windows.Forms.MessageBox]::Show('无法打开 WardNote 启动窗口。请完整解压便携包，并保留原 data 文件夹。 / Could not open the WardNote window. Extract the complete portable package and preserve the original data folder.' + "`r`n`r`n" + $details, 'WardNote', 'OK', 'Error')
  } catch { [Console]::Error.WriteLine($details) }
  exit 1
}
