
window.googleConfig = {
  clientId: '7329258126-0t1m7td7lm4ltekdm3v2bne6fndke9qj.apps.googleusercontent.com'
};

let googleInitialized = false;

const getGoogleIdentity = () => window.google?.accounts?.id;

window.initGoogleSignIn = () => {
  const googleIdentity = getGoogleIdentity();

  if (googleIdentity) {
    if (googleInitialized) {
      console.log('Google Sign-In re-initializing');
    }

    googleIdentity.initialize({
      client_id: window.googleConfig.clientId,
      callback: window.handleGoogleCallback,
      auto_select: false,
      cancel_on_tap_outside: true
    });
    googleInitialized = true;
    console.log('Google Sign-In initialized');
    return true;
  } else {
    console.error('Google SDK not loaded');
    return false;
  }
};

window.promptGoogleOneTap = () => {
  const googleIdentity = getGoogleIdentity();

  if (googleIdentity) {
    googleIdentity.prompt();
  } else {
    console.error('Google SDK not loaded. Cannot show One Tap.');
  }
};

window.renderGoogleButton = (elementId) => {
  const googleIdentity = getGoogleIdentity();
  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`Google button target #${elementId} was not found.`);
    return false;
  }

  if (googleIdentity) {
    element.replaceChildren();

    const width = Math.max(240, Math.floor(element.getBoundingClientRect().width || element.parentElement?.clientWidth || 360));

    googleIdentity.renderButton(
      element,
      {
        theme: 'outline',
        size: 'large',
        width,
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left'
      }
    );
    return true;
  } else {
    console.error('Google SDK not loaded. Cannot render button.');
    return false;
  }
};
