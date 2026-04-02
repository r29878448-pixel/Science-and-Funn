// 🔒 DevTools Protection - ULTRA TAGADA Level
// Instant activation - No delay
// Blocks inspect element, console, and data theft attempts
// Admin email is whitelisted

const ADMIN_EMAIL = 'adityaghoghari01@gmail.com';

// Immediate check on script load
let isDevToolsOpen = false;
let checkInterval = null;

// Check if user is admin - Multiple methods
const isAdmin = () => {
  try {
    // Method 1: Check localStorage currentUser
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user.email === ADMIN_EMAIL) return true;
    
    // Method 2: Check if on admin page
    if (window.location.pathname.includes('admin')) return true;
    
    // Method 3: Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') return true;
    
    // Method 4: Check sessionStorage
    if (sessionStorage.getItem('isAdmin') === 'true') return true;
    
    return false;
  } catch {
    return false;
  }
};

// INSTANT DevTools detection - runs immediately
const instantDevToolsCheck = () => {
  if (isAdmin()) return;
  
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;
  const devtoolsOpen = widthThreshold || heightThreshold;
  
  if (devtoolsOpen && !isDevToolsOpen) {
    isDevToolsOpen = true;
    showWarning();
  }
};

// Run check immediately on load
if (typeof window !== 'undefined') {
  instantDevToolsCheck();
  
  // Check every 100ms for ultra-fast detection
  setInterval(instantDevToolsCheck, 100);
}

// Detect DevTools
const detectDevTools = () => {
  if (isAdmin()) return false; // Admin ko allow karo
  
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;
  
  return widthThreshold || heightThreshold;
};

// Block right click
export const blockRightClick = () => {
  if (isAdmin()) return; // Admin ko allow karo
  
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showWarning();
    return false;
  });
};

// Block keyboard shortcuts
export const blockKeyboardShortcuts = () => {
  if (isAdmin()) return; // Admin ko allow karo
  
  document.addEventListener('keydown', (e) => {
    // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && e.key === 'I') ||
      (e.ctrlKey && e.shiftKey && e.key === 'J') ||
      (e.ctrlKey && e.shiftKey && e.key === 'C') ||
      (e.ctrlKey && e.key === 'u')
    ) {
      e.preventDefault();
      showWarning();
      return false;
    }
  });
};

// Detect console open
export const detectConsole = () => {
  if (isAdmin()) return; // Admin ko allow karo
  
  const element = new Image();
  Object.defineProperty(element, 'id', {
    get: function() {
      showWarning();
      throw new Error('Console detected');
    }
  });
  
  setInterval(() => {
    console.log(element);
    console.clear();
  }, 1000);
};

// Monitor DevTools - Ultra aggressive
export const monitorDevTools = () => {
  if (isAdmin()) return;
  
  // Check every 100ms instead of 1 second
  checkInterval = setInterval(() => {
    instantDevToolsCheck();
  }, 100);
};

// Show warning and block page
const showWarning = () => {
  if (isAdmin()) return; // Admin ko allow karo
  
  // Clear page content
  document.body.innerHTML = '';
  
  // Create warning screen
  const warningDiv = document.createElement('div');
  warningDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  warningDiv.innerHTML = `
    <div style="text-align: center; color: white; max-width: 600px; padding: 40px;">
      <div style="font-size: 120px; margin-bottom: 20px; animation: shake 0.5s infinite;">⚠️</div>
      <h1 style="font-size: 48px; margin-bottom: 20px; font-weight: bold;">
        चालाकी मत कर! 😤
      </h1>
      <h2 style="font-size: 36px; margin-bottom: 30px; font-weight: bold;">
        तेरा बाप हूं मैं! 👊
      </h2>
      <p style="font-size: 24px; margin-bottom: 20px; line-height: 1.6;">
        DevTools खोलने की कोशिश की?<br/>
        Inspect Element चलाने की सोची?<br/>
        Data चुराने का plan था?
      </p>
      <p style="font-size: 28px; margin-top: 30px; font-weight: bold; color: #FFD700;">
        ❌ ACCESS DENIED ❌
      </p>
      <p style="font-size: 18px; margin-top: 30px; opacity: 0.9;">
        Page refresh karo aur seedhe padhai karo! 📚
      </p>
      <button onclick="location.reload()" style="
        margin-top: 40px;
        padding: 15px 40px;
        font-size: 20px;
        background: white;
        color: #667eea;
        border: none;
        border-radius: 50px;
        cursor: pointer;
        font-weight: bold;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        transition: transform 0.2s;
      " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        🔄 Refresh Page
      </button>
    </div>
    <style>
      @keyframes shake {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-10deg); }
        75% { transform: rotate(10deg); }
      }
    </style>
  `;
  
  document.body.appendChild(warningDiv);
  
  // Disable all interactions
  document.body.style.pointerEvents = 'none';
  warningDiv.style.pointerEvents = 'auto';
  
  // Clear console
  console.clear();
  
  // Prevent further console usage
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
};

// Disable console methods
export const disableConsole = () => {
  if (isAdmin()) return; // Admin ko allow karo
  
  const noop = () => {};
  
  // Override console methods
  window.console = {
    log: noop,
    warn: noop,
    error: noop,
    info: noop,
    debug: noop,
    trace: noop,
    dir: noop,
    dirxml: noop,
    group: noop,
    groupCollapsed: noop,
    groupEnd: noop,
    time: noop,
    timeEnd: noop,
    timeStamp: noop,
    table: noop,
    assert: noop,
    clear: noop,
    count: noop,
    countReset: noop,
    profile: noop,
    profileEnd: noop
  };
};

// Prevent text selection and copy
export const preventCopy = () => {
  if (isAdmin()) return; // Admin ko allow karo
  
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
  });
  
  document.addEventListener('copy', (e) => {
    e.preventDefault();
    showWarning();
    return false;
  });
};

// Detect debugger - More aggressive
export const detectDebugger = () => {
  if (isAdmin()) return;
  
  // Check every 100ms
  setInterval(() => {
    const start = performance.now();
    debugger;
    const end = performance.now();
    
    if (end - start > 100) {
      showWarning();
    }
  }, 100);
};

// Initialize all protections - INSTANT
export const initDevToolsProtection = () => {
  if (isAdmin()) {
    console.log('🔓 Admin detected - DevTools protection disabled');
    return;
  }
  
  console.log('🔒 ULTRA DevTools protection enabled');
  
  // Immediate check
  instantDevToolsCheck();
  
  // Enable all protections
  blockRightClick();
  blockKeyboardShortcuts();
  detectConsole();
  monitorDevTools();
  disableConsole();
  preventCopy();
  detectDebugger();
  
  // Clear console every 50ms (more aggressive)
  setInterval(() => {
    if (!isAdmin()) {
      console.clear();
    }
  }, 50);
  
  // Show warning message in console
  console.log('%c⚠️ WARNING ⚠️', 'color: red; font-size: 50px; font-weight: bold;');
  console.log('%cचालाकी मत कर! तेरा बाप हूं मैं! 👊', 'color: red; font-size: 30px; font-weight: bold;');
  console.log('%cDevTools use करने की कोशिश की तो page block हो जाएगा!', 'color: orange; font-size: 20px;');
};

// Store current user for admin check
export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
};

// Enable admin mode manually (for debugging)
export const enableAdminMode = () => {
  sessionStorage.setItem('isAdmin', 'true');
  console.log('✅ Admin mode enabled! Refresh page to disable DevTools protection.');
  location.reload();
};

// Disable admin mode
export const disableAdminMode = () => {
  sessionStorage.removeItem('isAdmin');
  console.log('❌ Admin mode disabled! DevTools protection will be enabled.');
  location.reload();
};

// Make functions available globally for easy access
if (typeof window !== 'undefined') {
  window.enableAdminMode = enableAdminMode;
  window.disableAdminMode = disableAdminMode;
}
