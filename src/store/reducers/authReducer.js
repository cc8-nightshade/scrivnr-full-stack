const intitialState = {
  authError: null,
  userName: '',
  email: '',
  password: '',

}


const authReducer = (state = intitialState, action) => {
  switch(action.type){
    case "LOGIN_ERROR":
      return {
        ...state, 
        authError: 'Login Failed'
      }
    case "LOGIN_SUCCESS":
      console.log('login success')
      return {
        ...state, 
        authError: null
      }
    case "SIGN_OUT_SUCCESS":
      return state
    case "SIGNUP_SUCCESS":
      return {
        ...state, 
        authError: null
      }
    case "SIGNUP_ERROR":
      console.log('Signup failed')
      return {
        ...state, 
        authError: action.err.message
      }
    default:
      return state
  }
}

export default authReducer