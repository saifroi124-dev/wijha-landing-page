# Run this after: 1) messaging your bot (/start), 2) getting your chat ID from getUpdates.
# Usage: .\setup-telegram.ps1
# You'll be prompted for TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.

$ErrorActionPreference = "Stop"
$projectRef = "ojbmsklrksicujieiprl"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root

Write-Host "Wijha Telegram notify setup" -ForegroundColor Cyan
Write-Host ""

$token = Read-Host "Paste your Telegram bot token (from @BotFather)"
$chatId = Read-Host "Paste your Telegram chat ID (from getUpdates after messaging the bot)"

if ([string]::IsNullOrWhiteSpace($token) -or [string]::IsNullOrWhiteSpace($chatId)) {
    Write-Host "Token and chat ID are required." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Linking project and setting secrets..." -ForegroundColor Yellow
npx supabase link --project-ref $projectRef
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npx supabase secrets set "TELEGRAM_BOT_TOKEN=$token" "TELEGRAM_CHAT_ID=$chatId"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Deploying notify-telegram function..." -ForegroundColor Yellow
npx supabase functions deploy notify-telegram
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Done. Next: add the Database Webhook in Supabase." -ForegroundColor Green
Write-Host "  URL: https://$projectRef.supabase.co/functions/v1/notify-telegram" -ForegroundColor White
Write-Host "  See docs/TELEGRAM_SETUP.md step 3 (Quick setup) for the webhook / SQL." -ForegroundColor White
