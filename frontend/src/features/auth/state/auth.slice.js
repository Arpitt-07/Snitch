import { createSlice } from "@reduxjs/toolkit";


const authSlice = createSlice({
    name:"auth",
    initialState:{
        user:null,
        loading:false,
        error:null,
        isChecking:false
    },
    reducers:{
        setUser(state,action){
            state.user = action.payload
            
        },
        setLoading(state,action){
            state.loading = action.payload
        },
        setError(state,action){
            state.error = action.payload
        },
        setIsChecking(state,action){
            state.isChecking = action.payload
        }

    }
})

export const {setUser,setLoading,setError,setIsChecking} = authSlice.actions
export default authSlice.reducer