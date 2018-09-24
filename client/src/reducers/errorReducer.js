import { GET_ERRORS, CLEAR_ERRORS } from '../actions/types';

const initialstate = {};

export default function(state = initialstate, action){
  switch (action.type){
    case GET_ERRORS:
    return action.payload
    case CLEAR_ERRORS:
    return {}
    default:
       return state;
  }
}