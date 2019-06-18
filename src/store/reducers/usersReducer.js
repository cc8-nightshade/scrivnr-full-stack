const intitialState = {
  users: '',
  userInfo: '',
  searchedEmail: null,
  onlineNow: []
}


const usersReducer = (state = intitialState, action) => {
  switch(action.type){
    case 'CREATE_CONTACT':
      return state
    case 'GET_USERS':
      state.users = action.userArray
      return state
    case 'GET_USERINFO':
      state.userInfo = action.userInfo
      return state
    case 'GET_USERINFO_ERROR':
      return state
    case 'SEARCH_USERS':
      state.searchedEmail = action.searchedEmail
      return state
    case 'SEARCH_USERS_ERROR':
      return state
    case 'ONLINE_USERS':
      state.onlineNow = action.onlineNow
      return state
    case 'SEARCH_USERS_ERROR':
      return state
    default:
      return state
  }
}

export default usersReducer
