window.googleConfig = {
    clientId: '7329258126-0t1m7td7lm4ltekdm3v2bne6fndke9qj.apps.googleusercontent.com'
};

let googleInitialized = false;

window.initGoogleSignIn = () => {
    if (googleInitialized) {
        console.log('Google Sign-In already initialized');
        return;
    }
    
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.initialize({
            client_id: window.googleConfig.clientId,
            callback: handleGoogleCallback,
            auto_select: false,
            cancel_on_tap_outside: true
        });
        googleInitialized = true;
        console.log('Google Sign-In initialized');
    } else {
        console.error('Google SDK not loaded');
    }
};

window.promptGoogleOneTap = () => {
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.prompt();
    } else {
        console.error('Google SDK not loaded. Cannot show One Tap.');
        alert('Google Sign-In is not available. Please try again.');
    }
};

async function handleGoogleCallback(response) {
    const idToken = response.credential;
    
    try {
        const result = await fetch('/api/authproxy/login-google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ IdToken: idToken }),
            credentials: 'include'
        });

        if (result.ok) {
            window.location.href = '/menu';
        } else {
            console.error('Google login failed');
        }
    } catch (error) {
        console.error('Error during Google login:', error);
    }
}
