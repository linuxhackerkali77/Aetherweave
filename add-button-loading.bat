@echo off
echo Adding loading animations to all buttons...

REM Create CSS for loading animation
(
echo /* Button Loading Animation Styles */
echo .btn-loading {
echo   position: relative;
echo   pointer-events: none;
echo   opacity: 0.7;
echo }
echo.
echo .btn-loading::after {
echo   content: "";
echo   position: absolute;
echo   width: 16px;
echo   height: 16px;
echo   top: 50%%;
echo   left: 50%%;
echo   margin-left: -8px;
echo   margin-top: -8px;
echo   border: 2px solid transparent;
echo   border-top: 2px solid currentColor;
echo   border-radius: 50%%;
echo   animation: btn-spin 1s linear infinite;
echo }
echo.
echo @keyframes btn-spin {
echo   0%% { transform: rotate(0deg^); }
echo   100%% { transform: rotate(360deg^); }
echo }
echo.
echo .btn-loading .btn-text {
echo   opacity: 0;
echo }
) > src\styles\button-loading.css

REM Create JavaScript for button loading functionality
(
echo // Button Loading Animation Script
echo function addLoadingToButtons(^) {
echo   // Get all buttons, inputs with type submit/button, and elements with button role
echo   const buttons = document.querySelectorAll('button, input[type="submit"], input[type="button"], [role="button"], .btn'^);
echo   
echo   buttons.forEach(button =^> {
echo     // Skip if already has loading functionality
echo     if (button.hasAttribute('data-loading-enabled'^)^) return;
echo     
echo     // Mark as processed
echo     button.setAttribute('data-loading-enabled', 'true'^);
echo     
echo     // Wrap button text
echo     if (!button.querySelector('.btn-text'^)^) {
echo       const text = button.innerHTML;
echo       button.innerHTML = `^<span class="btn-text"^>${text}^</span^>`;
echo     }
echo     
echo     // Add click handler for loading state
echo     button.addEventListener('click', function(e^) {
echo       // Skip if already loading
echo       if (this.classList.contains('btn-loading'^)^) {
echo         e.preventDefault(^);
echo         return false;
echo       }
echo       
echo       // Add loading class
echo       this.classList.add('btn-loading'^);
echo       
echo       // Remove loading after 3 seconds (adjust as needed^)
echo       setTimeout((^) =^> {
echo         this.classList.remove('btn-loading'^);
echo       }.bind(this^), 3000^);
echo     }^);
echo   }^);
echo }
echo.
echo // Initialize when DOM is ready
echo if (document.readyState === 'loading'^) {
echo   document.addEventListener('DOMContentLoaded', addLoadingToButtons^);
echo } else {
echo   addLoadingToButtons(^);
echo }
echo.
echo // Re-run for dynamically added buttons
echo const observer = new MutationObserver(addLoadingToButtons^);
echo observer.observe(document.body, { childList: true, subtree: true }^);
) > src\scripts\button-loading.js

REM Add CSS link to all HTML files
echo Adding CSS to HTML files...
for /r %%f in (*.html) do (
    findstr /c:"button-loading.css" "%%f" >nul || (
        powershell -Command "(Get-Content '%%f') -replace '</head>', '  <link rel=\"stylesheet\" href=\"/src/styles/button-loading.css\">`n</head>' | Set-Content '%%f'"
    )
)

REM Add JavaScript to all HTML files
echo Adding JavaScript to HTML files...
for /r %%f in (*.html) do (
    findstr /c:"button-loading.js" "%%f" >nul || (
        powershell -Command "(Get-Content '%%f') -replace '</body>', '  <script src=\"/src/scripts/button-loading.js\"></script>`n</body>' | Set-Content '%%f'"
    )
)

REM For Next.js projects, add to layout or _app files
if exist "src\app\layout.tsx" (
    echo Adding to Next.js layout...
    powershell -Command "if (!(Select-String -Path 'src\app\layout.tsx' -Pattern 'button-loading.css')) { (Get-Content 'src\app\layout.tsx') -replace 'import.*globals.css.*', '$0`nimport ''../styles/button-loading.css''' | Set-Content 'src\app\layout.tsx' }"
)

if exist "src\pages\_app.tsx" (
    echo Adding to Next.js _app...
    powershell -Command "if (!(Select-String -Path 'src\pages\_app.tsx' -Pattern 'button-loading.css')) { (Get-Content 'src\pages\_app.tsx') -replace 'import.*globals.css.*', '$0`nimport ''../styles/button-loading.css''' | Set-Content 'src\pages\_app.tsx' }"
)

echo.
echo ✅ Loading animations added to all buttons!
echo.
echo Features added:
echo - Spinning loader animation
echo - Disabled state during loading
echo - Auto-applies to all button elements
echo - Works with dynamically added buttons
echo - 3-second loading duration (customizable)
echo.
echo To customize loading duration, edit the setTimeout value in button-loading.js
pause