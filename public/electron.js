const {
  default: installExtention,
  REDUX_DEVTOOLS,
} = require("electron-devtools-installer");
const { app, BrowserWindow, protocol, Menu,dialog } = require("electron");
const url = require("url");
const path = require("path");
const ytdl = require("ytdl-core");
let videoFormats;
let youtubeBrowserWindow;
let downloaderWindow;
let isDownloadVideoWindowOpened = false;
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
  },{
      label : 'Help',
      submenu : [
          {
              label : "About",
              click(){
                  dialog.showMessageBox({title:"About",message:"Youtube Dowloader currently only support meduim quality"})
              }
          }
      ]
  }
];
//downloader webapp window
const getVideoInfo = async () => {
  const videoUrl = youtubeBrowserWindow.webContents.getURL();
  console.log(videoUrl);
  if(videoUrl === "https://www.youtube.com/"){
    dialog.showErrorBox("invalid video","No opened video to be downloaded please open a video and try again");
  }else{
      const videoInfo = await ytdl.getInfo(videoUrl);
      const videoInfoObj = {
          title : videoInfo.videoDetails.title,
          lengthSeconds : videoInfo.videoDetails.lengthSeconds,
          thumbnail : videoInfo.videoDetails.thumbnails[0],
          formats : videoInfo.formats,
      }
    console.log(videoInfoObj);
    // downloaderWindow.show();
    downloaderWindow.webContents.send("fromMain",videoInfoObj);
  }
}
const createDownloaderWindow = () => {
    downloaderWindow = new BrowserWindow({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload : path.join(__dirname,"preload.js")
    },
  });
  const downloaderUrl = app.isPackaged
    ? url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file",
        slashes: true,
      })
    : "http://localhost:3000";
  downloaderWindow.removeMenu();
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
}

//adjust menu for osx
if (process.platform === "darwin") {
  menuYoutubeBrowserWindow.unshift({});
}

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
