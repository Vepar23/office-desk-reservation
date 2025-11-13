param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('supabase', 'local')]
    [string]$mode
)

$usersPath = "app\api\users"
$currentPath = Get-Location

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Storage Mode Switcher v1.0" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if files exist
$routeExists = Test-Path "$usersPath\route.ts"
$localExists = Test-Path "$usersPath\route.local.ts"
$supabaseExists = Test-Path "$usersPath\route.supabase.ts"

if ($mode -eq "local") {
    Write-Host "🔄 Switching to IN-MEMORY storage..." -ForegroundColor Yellow
    Write-Host ""
    
    if ($routeExists) {
        Rename-Item "$usersPath\route.ts" "route.supabase.ts" -Force
        Write-Host "  ✓ Backed up route.ts → route.supabase.ts" -ForegroundColor Green
    }
    
    if ($localExists) {
        Rename-Item "$usersPath\route.local.ts" "route.ts" -Force
        Write-Host "  ✓ Activated route.local.ts → route.ts" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Error: route.local.ts not found!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ Successfully switched to IN-MEMORY storage!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Features:" -ForegroundColor Cyan
    Write-Host "  • No database required" -ForegroundColor White
    Write-Host "  • Instant startup" -ForegroundColor White
    Write-Host "  • Data resets on server restart" -ForegroundColor Yellow
    Write-Host ""
    
} else {
    Write-Host "🔄 Switching to SUPABASE storage..." -ForegroundColor Yellow
    Write-Host ""
    
    if ($routeExists) {
        Rename-Item "$usersPath\route.ts" "route.local.ts" -Force
        Write-Host "  ✓ Backed up route.ts → route.local.ts" -ForegroundColor Green
    }
    
    if ($supabaseExists) {
        Rename-Item "$usersPath\route.supabase.ts" "route.ts" -Force
        Write-Host "  ✓ Activated route.supabase.ts → route.ts" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Error: route.supabase.ts not found!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ Successfully switched to SUPABASE storage!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Requirements:" -ForegroundColor Cyan
    Write-Host "  • .env.local with Supabase credentials" -ForegroundColor White
    Write-Host "  • Supabase database tables created" -ForegroundColor White
    Write-Host "  • Data persists between restarts" -ForegroundColor Green
    Write-Host ""
    
    # Check if .env.local exists
    if (Test-Path ".env.local") {
        Write-Host "  ✓ .env.local found" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Warning: .env.local not found!" -ForegroundColor Yellow
        Write-Host "    Create it with your Supabase credentials" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "⚡ Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Restart your dev server:" -ForegroundColor White
Write-Host "     npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Test the application:" -ForegroundColor White
Write-Host "     http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

