// Google One Tap Configuration
window.googleConfig = {
  clientId: '7329258126-0t1m7td7lm4ltekdm3v2bne6fndke9qj.apps.googleusercontent.com'
};

let googleInitialized = false;

// Initialize Google Sign-In
window.initGoogleSignIn = () => {
  if (typeof google !== 'undefined' && google.accounts) {
    if (googleInitialized) {
      // We intentionally allow re-initialization so the latest
      // window.handleGoogleCallback (and role selection) is used.
      console.log('Google Sign-In re-initializing');
    }
    google.accounts.id.initialize({
      client_id: window.googleConfig.clientId,
      callback: window.handleGoogleCallback,
      auto_select: false,
      cancel_on_tap_outside: true
    });
    googleInitialized = true;
    console.log('Google Sign-In initialized');
  } else {
    console.error('Google SDK not loaded');
  }
};

// Prompt Google One Tap
window.promptGoogleOneTap = () => {
  if (typeof google !== 'undefined' && google.accounts) {
    google.accounts.id.prompt();
  } else {
    console.error('Google SDK not loaded. Cannot show One Tap.');
  }
};

// Render Google Sign-In button
window.renderGoogleButton = (elementId) => {
  if (typeof google !== 'undefined' && google.accounts) {
    google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left'
      }
    );
  } else {
    console.error('Google SDK not loaded. Cannot render button.');
  }
};
