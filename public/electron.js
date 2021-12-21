const {
  default: installExtention,
  REDUX_DEVTOOLS,
} = require("electron-devtools-installer");
const {
  app,
  BrowserWindow,
  protocol,
  Menu,
  dialog,
  ipcMain,
} = require("electron");
const url = require("url");
const path = require("path");
const ytdl = require("ytdl-core");
const fs = require("fs");
let videoFormats;
let youtubeBrowserWindow;
let downloaderWindow;
let isDownloadVideoWindowOpened = false;
let videoList = [];
let videosProgressArr = [];

let output;
//youtube browser window
function createYoutubeBrowserWindow() {
  youtubeBrowserWindow = new BrowserWindow();
  youtubeBrowserWindow.loadURL("https://www.youtube.com/");
  // youtubeBrowserWindow.removeMenu();
  const MainMenu = Menu.buildFromTemplate(menuYoutubeBrowserWindow);
  youtubeBrowserWindow.setMenu(MainMenu);
}
const menuYoutubeBrowserWindow = [
  {
    label: "File",
    submenu: [
      {
        label: "Exit",
        accelerator: process.platform === "darwin" ? "Command+Q" : "Ctrl+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
  {
    label: "Download",
    submenu: [
      {
        label: "Download Video",
        accelerator: process.platform === "darwin" ? "Command+D" : "Ctrl+D",
        click() {
          getVideoInfo();
        },
      },
    ],
  },
  {
    label: "Help",
    submenu: [
      {
        label: "About",
        click() {
          dialog.showMessageBox({
            title: "About",
            message: "Youtube Dowloader currently only support meduim quality",
          });
        },
      },
    ],
  },
];
//downloader webapp window
const getVideoInfo = async () => {
  const videoUrl = youtubeBrowserWindow.webContents.getURL();
  if (videoUrl === "https://www.youtube.com/") {
    dialog.showErrorBox(
      "invalid video",
      "No opened video to be downloaded please open a video and try again"
    );
  } else {
    const videoInfo = await ytdl.getInfo(videoUrl);
    const videoInfoObj = {
      videoId: videoInfo.videoDetails.videoId,
      title: videoInfo.videoDetails.title,
      lengthSeconds: videoInfo.videoDetails.lengthSeconds,
      thumbnail: videoInfo.videoDetails.thumbnails[0],
      formats: videoInfo.formats,
      videoUrl: videoUrl,
    };
    // console.log(videoInfo);
    // downloaderWindow.show();
    downloaderWindow.webContents.send("video:newInfo", videoInfoObj);
  }
};
const createDownloaderWindow = () => {
  downloaderWindow = new BrowserWindow({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  const downloaderUrl = app.isPackaged
    ? url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file",
        slashes: true,
      })
    : "http://localhost:3000";
  // downloaderWindow.removeMenu();
  downloaderWindow.loadURL(downloaderUrl);
  isDownloadVideoWindowOpened = true;
  downloaderWindow.on("close", () => {
    isDownloadVideoWindowOpened = false;
  });
  if (!app.isPackaged) {
    installExtention(REDUX_DEVTOOLS)
      .then((name) => {
        console.log("done add extention : ", name);
      })
      .catch((err) => {
        console.log("failed to add extention with error : ", err);
      });
    downloaderWindow.webContents.openDevTools();
  }
  //   downloaderWindow.hide();
};

//adjust menu for osx
if (process.platform === "darwin") {
  menuYoutubeBrowserWindow.unshift({});
}

//start video download
if (process.platform === "win32") {
  output = process.env.USERPROFILE + "\\Downloads\\";
}

setInterval(() => {
  let allDone = false;
  if(videosProgressArr.length !== 0){
    videosProgressArr.every((value) => {
      if(value !== 100){
        allDone = false;
        return false;
      }else{
        allDone = true;
        return true;
      }
    })
    // add ipcMain to send progress
    if(!allDone){
      downloaderWindow.webContents.send("video:progress",videosProgressArr);
    }
  }
},3000)

ipcMain.on("video:startDownload", (event, args) => {
  videoList.push({
    video: ytdl(args.videoUrl, { quality: args.itag }),
    saveLocation: output,
    prgress: 0,
    downloadStarted: false,
    downloadFinished: false,
  });
  videoList.forEach((value, index) => {
    if (!value.downloadStarted) {
      videoList[index] = {
        ...videoList[index],
        downloadStarted: true,
      };
      let savePath = path.resolve(value.saveLocation, args.title.replace(/[&\/\\#,| +()$~%.'":*?<>{}]/g, "_")  +".mp4");
      value.video.pipe(fs.createWriteStream(savePath));
      value.video.on("progress", (_, downloaded, total) => {
        let progress = (downloaded / total) * 100;
        videoList[index] = {
          ...videoList[index],
          progress: progress,
        };
        videosProgressArr[index] = progress;
        if (progress === 100) {
          videoList[index] = {
            ...videoList[index],
            downloadFinished: true,
          };
          downloaderWindow.webContents.send("video:progress",videosProgressArr);
        }
      });
    }
  });
});


// ipcMain.on("video:startDownload",(event,args) => {
//   let video = ytdl(args.videoUrl,{quality : args.itag})
//   if(process.platform === "win32"){
//     let saveLocation = process.env.USERPROFILE + "\\Downloads\\";
//     let output = path.resolve(saveLocation, args.title.replace(/\s\*\.\"\\\'/g, "_")  +".mp4");
//     video.pipe(fs.createWriteStream(output))
//     video.on('progress',(_,downloaded,total) => {
//       console.log(downloaded ," of " , total)
//     })
//   }
// })

app.on("ready", () => {
  protocol.interceptFileProtocol(
    "file",
    (request, callback) => {
      const url = request.url.substr(7);
      callback({ path: path.normalize(`${__dirname}/${url}`) });
    },
    (err) => {
      if (err) {
        console.log("failed to register protocol");
      }
    }
  );
  createYoutubeBrowserWindow();
  createDownloaderWindow();
});

app.whenReady().then(() => {
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0)
      createYoutubeBrowserWindow();
    createDownloaderWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
