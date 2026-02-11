import { LOGIN_SUCCESS, LOGOUT, UPDATE_LAST_ACTIVITY } from '../actions/authActions'

const token = localStorage.getItem("token");   
const storedUser = localStorage.getItem("user");
// console.log(token,storedUser);

let user = null;
try {
    user = storedUser && storedUser !== "undefined"
        ? JSON.parse(storedUser)
        : null;
} catch {
    user = null;
}

const initialState = {
    isAuthenticated: !!token,
    user,
    lastActivity: Number(localStorage.getItem("lastActivity")) || Date.now(),
};
// console.log(initialState);


const authReducer = (state = initialState, action) => {
    switch (action.type) {

        case LOGIN_SUCCESS:
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                lastActivity: Date.now(),
            };

        case UPDATE_LAST_ACTIVITY:
            return {
                ...state,
                lastActivity: action.payload,
            };

        case LOGOUT:
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                lastActivity: null,
            };

        default:
            return state;
    }
};

export default authReducer;