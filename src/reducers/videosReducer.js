const initialState = {
    currentVideoIndex : 0,
    videosData : null,
    videosProgress : null,
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
                },
                videosProgress : {
                    ...state.videosProgress,
                    [action.index] : 0
                }
            }
        case "setProgress" :
            return{
                ...state,
                videosProgress : action.payload
            }
        default :
            return state
    }
}

export default videosReducer;