window.loginWithCookies = async function (url, jsonData) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonData,
            credentials: 'include'

        });
        return response.ok;
    } catch (error) {
        console.error("login error:", error)
        return false;
    }
};

window.registerUser = async function (url, jsonData) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonData,
            credentials: 'include'
        });
        
        if (response.ok) {
            return "success";
        }
        
        // Try to parse error response
        try {
            const errorData = await response.json();
            return errorData.error || errorData.message || "Registration failed";
        } catch {
            return "Registration failed";
        }
    } catch (error) {
        console.error("register error:", error);
        return error.message || "An error occurred";
    }
};

window.sendRequest = async function (url, jsonData) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonData,
            credentials: 'include'
        });
        return response.ok;
    } catch (error) {
        console.error("request error:", error);
        return false;
    }
};
