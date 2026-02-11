import { useSelector } from "react-redux"
import { Navigate, Outlet } from "react-router-dom";


const ProtectedRoutes = () => {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    return isAuthenticated ? <Outlet /> : <Navigate to='/login' replace />
}
export default ProtectedRoutes