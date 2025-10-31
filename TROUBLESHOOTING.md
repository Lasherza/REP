# Troubleshooting Guide

## Start Mission Button Not Working

If the "Start Mission" button is not responding, follow these steps:

### Step 1: Check Console for Errors

1. Open your browser (Chrome, Firefox, Safari, Edge)
2. Press **F12** to open Developer Tools
3. Click on the **Console** tab
4. Look for any error messages (usually in red)

**Expected Console Output** (if working correctly):
```
Initializing ITIL 4 Change Enablement Agent...
? UI elements initialized successfully
Setting up event listeners...
? Mission input listeners set up
? All event listeners set up successfully
Application initialized successfully
```

**Common Errors and Solutions:**

#### Error: "Failed to load module script"
- **Cause**: Not using a web server, opening file:// directly
- **Solution**: Use a local web server:
  ```bash
  python -m http.server 8000
  ```
  Then open: http://localhost:8000

#### Error: "Cannot find module"
- **Cause**: Missing JavaScript files
- **Solution**: Ensure all files are in the same directory:
  - app.js
  - tavily-client.js
  - state-manager.js
  - document-parser.js
  - mission-planner.js
  - step-executor.js
  - results-renderer.js

#### Error: "getElementById returned null"
- **Cause**: HTML element IDs don't match JavaScript
- **Solution**: Re-download the complete index.html file

### Step 2: Test with Simple Test Page

1. Open http://localhost:8000/test-button.html
2. Type at least 20 characters in the textarea
3. Click the button

If the test button works but the main app doesn't, there's a JavaScript initialization error.

### Step 3: Check Button is Enabled

The button requires **at least 20 characters** to be enabled.

1. Click in the mission textarea
2. Type a mission description (at least 20 characters)
3. Check that the character count updates
4. The button should become blue (enabled)

**Test Mission** (copy/paste this):
```
Analyze the risks of migrating our customer database to cloud infrastructure
```

### Step 4: Verify Module Loading

1. Open http://localhost:8000/debug.html
2. Check console for module loading messages
3. Should see: "All modules loaded successfully!"

### Step 5: Clear Browser Cache

Sometimes old files get cached:

1. Press **Ctrl+Shift+Delete** (Windows/Linux) or **Cmd+Shift+Delete** (Mac)
2. Select "Cached images and files"
3. Click "Clear data"
4. Reload the page with **Ctrl+F5** (Windows/Linux) or **Cmd+Shift+R** (Mac)

### Step 6: Check API Key (Not Required for Button)

While you don't need an API key for the button to work, you DO need one to execute missions:

1. Click the settings icon (??) in top right
2. Enter your Tavily API key
3. Click "Save Settings"

### Step 7: Try Different Browser

Test in a different browser:
- Chrome: Best compatibility
- Firefox: Good alternative
- Safari: May have module issues
- Edge: Should work well

### Detailed Debugging Steps

If still not working, check these in console:

```javascript
// In browser console, type these one by one:

// Check if App loaded
console.log(window);

// Check if elements exist
document.getElementById('mission-input')
document.getElementById('start-mission')

// Check button state
document.getElementById('start-mission').disabled

// Manually test button
document.getElementById('start-mission').click()
```

### Common Scenarios

#### Scenario 1: Button is Gray and Won't Click
- **Reason**: Button is disabled (requires 20+ characters)
- **Solution**: Type more text in the mission field

#### Scenario 2: Button is Blue but Nothing Happens
- **Reason**: No Tavily API key configured
- **Solution**: The button should still work and show an alert asking for API key
- **If no alert**: JavaScript error - check console

#### Scenario 3: Button Click Shows Alert
- **"Please configure your Tavily API key"** - This is CORRECT behavior! 
- Go to settings and add your API key
- **"Mission description is too short"** - Add more detail to your mission

#### Scenario 4: Console Shows Errors
- Copy the error message
- Check if it mentions missing files
- Verify all .js files are present
- Make sure you're using a web server (not file://)

### Quick Fixes Checklist

- [ ] Using a web server (http://localhost:8000)
- [ ] All JavaScript files present in directory
- [ ] Browser console shows no errors
- [ ] Typed at least 20 characters in textarea
- [ ] Button is blue (not gray)
- [ ] Cleared browser cache
- [ ] Using a modern browser (Chrome, Firefox, Edge)
- [ ] JavaScript enabled in browser

### Still Not Working?

1. **Start Fresh**:
   ```bash
   # Stop any running servers
   # Re-download all files
   # Start server again
   python -m http.server 8000
   ```

2. **Test with curl**:
   ```bash
   curl http://localhost:8000/app.js
   # Should show JavaScript code, not an error
   ```

3. **Check File Permissions**:
   ```bash
   ls -la /workspace/*.js
   # All files should be readable (r--)
   ```

4. **Verify ES6 Module Support**:
   - Modern browsers (2020+) required
   - Update browser if very old

### Getting Help

If still stuck, provide this information:
1. Browser name and version
2. Operating system
3. Console error messages (screenshot)
4. Output from http://localhost:8000/debug.html
5. Whether test-button.html works

### Expected Behavior

**Correct workflow:**
1. Open http://localhost:8000
2. See "ITIL 4 Change Enablement Agent" page
3. Console shows initialization messages
4. Type 20+ characters
5. Button turns blue
6. Click button
7. Either:
   - Alert asks for API key (if not configured) ?
   - Or shows mission breakdown (if API key configured) ?

---

**Most Common Issue**: Opening index.html directly instead of using a web server. ES6 modules REQUIRE a web server!

**Second Most Common**: Not typing enough characters (needs 20+).

**Third Most Common**: Browser cache showing old files.
