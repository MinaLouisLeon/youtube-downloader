//add new video to the new video reducer to be processed in the download promet
export const actionNewVideoReceived = (args) => {
    return{
        type : 'newVideoReceived',
        payload : args
    }
}
//add video to the videos reducer to be dispalyed in the downloader status
export const actionAddVideo = (index,args) => {
    return{
        type : 'addVideo',
        payload : args,
        index : index,
    }
}

//set the downloading progress of video received from main
export const actionSetProgress = (args) => {
    return{
        type : 'setProgress',
        payload : args
    }
}