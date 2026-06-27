import { setError,setLoading,setUser,setIsChecking } from "../state/auth.slice.js";
import { register,login,logout,checkAuth } from "../service/auth.services.js";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleRegister = async ({ username, email, password }) => {
        try {
            dispatch(setLoading(true));
            const res = await register({ username, email, password });
            dispatch(setUser(res.data?.user || res.user));
            return res.data.success;
        } catch (err) {
            dispatch(setError(err.response?.data?.message || err.message || "An error occurred"));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleLogin = async ({ email, password }) => {
        try {
            dispatch(setLoading(true));
            const res = await login({ email, password });
            dispatch(setUser(res.data?.user || res.user));
            return res.data.success;
        } catch (err) {
            dispatch(setError(err.response?.data?.message || err.message || "An error occurred"));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleLogout = async () => {
        try {
            dispatch(setLoading(true));
            await logout();
            dispatch(setUser(null));
            navigate('/login');
        } catch (err) {
            dispatch(setError(err.response?.data?.message || err.message || "An error occurred"));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const checkAuthUser = async () => {
        try {
            dispatch(setIsChecking(true))
            const res = await checkAuth();
            dispatch(setUser(res.data?.user || res.user));
        } catch (err) {
            dispatch(setUser(null));
        }
        finally{
            dispatch(setIsChecking(false))
        }
    };

    return { handleRegister, handleLogin, handleLogout, checkAuthUser };
};
