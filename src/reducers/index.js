import {combineReducers} from 'redux';
import newVideoReducer from './newVideoReducer';
import videosReducer from './videosReducer';
const allReducers = combineReducers({
    newVideoReducer,
    videosReducer,
})

export default allReducers;