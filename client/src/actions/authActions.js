import axios from 'axios';
import setAuthToken from '../utils/setAuthToken'
import jwt_decode from 'jwt-decode'; 


    
    import { GET_ERRORS, SET_CURRENT_USER  } from './types';


//Resgister user
export const registerUser = (userData, history) => dispatch =>{

   axios
   .post('/api/users/register', userData)
   .then(res => history.push('/login'))
   .catch(err => {
     dispatch({
       type: GET_ERRORS,
       payload: err.response.data
     })
   });
  
};

//Login - Get user Token

export const loginUser = userData => dispatch =>{

  axios
  .post('/api/users/login', userData)
  .then(res => {
    // Save to localStorage
    const { token } = res.data;
    //set token to 1s
    localStorage.setItem('jwtToken', token);
    //set token to Auth header
    setAuthToken(token);
    //Decode token to get user data
    const decoded = jwt_decode(token);
    //set current user
    dispatch(setCurrentUser(decoded));
  })
  .catch(err => {
    dispatch({
      type: GET_ERRORS,
      payload: err.response.data
    })
  });
 
};

//set logged in user
export const setCurrentUser = (decoded) => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };

};

//Log user out
export const logoutUser = () => dispatch => {
  
  //Remove token from localStorage
  localStorage.removeItem('jwtToken');

  // Remove auth header for future requests
  setAuthToken(false);

  //Set current user to {} wich will set isAuthenticated to false
  dispatch(setCurrentUser({}))
};

