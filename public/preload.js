const {contextBridge,ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld("downloaderApi",{
    send : (channel,data) => {
        let validChannels = ["video:startDownload"];
        if(validChannels.includes(channel)){
            ipcRenderer.send(channel,data);
        }
    },
    receive : (channel,func) => {
        let validChannels = ["video:newInfo"];
        if(validChannels.includes(channel)){
            ipcRenderer.on(channel,(event,...args) => {
                func(...args)
            })
        }
    }
});