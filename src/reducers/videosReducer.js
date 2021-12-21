const initialState = {
    currentVideoIndex : 0,
    videosData : null,
}

const videosReducer = (state=initialState,action) => {
    switch(action.type){
        case "addVideo" :
            return{
                ...state,
                currentVideoIndex : state.currentVideoIndex + 1,
                videosData : {
                    ...state.videosData,
                    [action.index] : action.payload
                }
            }
        default :
            return state
    }
}

export default videosReducer;