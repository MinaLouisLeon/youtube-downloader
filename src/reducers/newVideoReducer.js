const initialState = {
    newVideoData : null,
}

const newVideoReducer = (state=initialState,action) => {
   switch(action.type){
       case 'newVideoReceived':
           return{
               ...state,
               newVideoData : action.payload,
           }
        default :
           return state
   }
}

export default newVideoReducer;