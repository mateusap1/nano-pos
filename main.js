const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;
let hiddenWindow;

let mainWindowReady = false;
let hiddenWindowReady = false;

let mainQueue = [];
let hiddenQueue = [];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: "white",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.loadFile('index.html');

  hiddenWindow = new BrowserWindow({
    show: false,
    webPreferences: {
			nodeIntegration: true,
      contextIsolation: false
		}
  });

	hiddenWindow.loadFile('background.html');

  mainWindow.on('closed', function() {
    hiddenWindow.close();
	});
}

require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node-modules', '.bin', 'electron')
})

function sendWindowMessage(targetWindow, message, payload) {
  if (typeof targetWindow === 'undefined') {
    console.log('Target window does not exist');
    return;
  }

	targetWindow.webContents.send(message, payload);
  console.log(`Message sent via ${message}`);
}

app.whenReady().then(() => {
  createWindow();
}).catch(e => {
  console.error(e);
});

ipcMain.on('main-renderer-ready', () => {
  mainWindowReady = true;

  for (fun of mainQueue) {
    fun();
  }
});

ipcMain.on('hidden-renderer-ready', () => {
  hiddenWindowReady = true;

  for (fun of hiddenQueue) {
    fun();
  }
});

ipcMain.on('update-transactions', () => {
  console.log('Main Ready -> update-transactions');

  if (hiddenWindowReady) {
    console.log('Hidden Ready -> update-transactions');
    sendWindowMessage(hiddenWindow, 'update-transactions');
  } else {
    hiddenQueue.push(() => {
      console.log('Hidden Ready -> update-transactions');
      sendWindowMessage(hiddenWindow, 'update-transactions');
    });
  }
})

ipcMain.on('message-from-worker', (_, arg) => {
  if (mainWindowReady) {
    console.log('Main Ready -> message-from-worker');
    sendWindowMessage(mainWindow, 'message-from-worker', arg);
  } else {
    mainQueue.push(() => {
      console.log('Main Ready -> message-from-worker');
      sendWindowMessage(mainWindow, 'message-from-worker', arg);
    });
  }
})