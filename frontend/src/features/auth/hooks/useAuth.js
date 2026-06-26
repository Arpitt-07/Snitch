import { setError,setLoading,setUser } from "../state/auth.slice.js";
import { register,login,logout } from "../service/auth.services.js";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export const useAuth = ()=>{
    const dispatch = useDispatch()
    const handleRegister = async({username,email,password,phone,isSeller=false})=>{
        try{
            dispatch(setLoading(true))
            const res = await register({username,email,password,phone,isSeller})
            dispatch(setUser(res.user))

        }catch(err){
            dispatch(setError(err.response.data.message))
        }finally{
            dispatch(setLoading(false))
        }
    }
    
}
