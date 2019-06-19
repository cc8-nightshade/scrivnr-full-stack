export const updateCallingStatus = (status) => {
  return (dispatch, getState) => {
      dispatch({ type: "CALLING_SUCCESS", status }
      )
    //   .catch((err) => {
    //   dispatch({ type: "CALLING_ERROR", err})
    // })
  };
};

export const getCallingStatus = () => {
  console.log('hello from caller action')
  return ({ type: "STATUS_SUCCESS" })
};

// export const getCallingStatus = () => {
//   return (dispatch, getState) => {
//     const nothing = 'g'
//     console.log(nothing)
//     console.log('hello from caller action')
//     dispatch({ type: "STATUS_SUCCESS", nothing }
//     )
//     //   .catch((err) => {
//     //   dispatch({ type: "STATUS_ERROR", err})
//     // })
//   };
// };


