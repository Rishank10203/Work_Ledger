
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT = 'LOGOUT';
export const UPDATE_LAST_ACTIVITY = 'UPDATE_LAST_ACTIVITY';

export const loginSuccess = (user,token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("lastActivity", Date.now());
    return {
        type: LOGIN_SUCCESS,
        payload: { user },
    };
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    return { type: LOGOUT };
};

export const updateLastActivity = () => {
    const now = Date.now();
    localStorage.setItem('lastActivity', now);
    return {
        type: UPDATE_LAST_ACTIVITY,
        payload: now,
    };
};