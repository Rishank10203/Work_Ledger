import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout, updateLastActivity } from "./actions/authActions";

const SESSION_LIMIT = 10 * 60 * 1000;

const SessionTimeout = () => {
    const dispatch = useDispatch(); 
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) return;

        const events = ["mousemove", "keydown", "click"];

        const handleActivity = () => {
            dispatch(updateLastActivity());
        };

        events.forEach(event =>
            window.addEventListener(event, handleActivity)
        );

        const interval = setInterval(() => {
            const lastActivity = Number(localStorage.getItem("lastActivity"));

            if (!lastActivity) return;

            if (Date.now() - lastActivity > SESSION_LIMIT) {
                dispatch(logout());
            }

        }, 100000);

        return () => {
            events.forEach(event =>
                window.removeEventListener(event, handleActivity)
            );
            clearInterval(interval);
        };
    }, [dispatch, isAuthenticated]);

    return null;
};

export default SessionTimeout;