const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;
let hiddenWindow;


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
  electron: path.join(__dirname, 'node-modules', '.bin', 'electron'),
  ignored: /db|[\/\\]\./
});

app.allowRendererProcessReuse = false;
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function sendWindowMessage(targetWindow, message, payload) {
  if (typeof targetWindow === 'undefined') {
    console.log('Target window does not exist');
    return;
  }

	targetWindow.webContents.send(message, payload);
}

ipcMain.handle('update-transactions', () => {
  ipcMain.handle('hidden-renderer-ready', () => {
    sendWindowMessage(hiddenWindow, 'update-transactions');
  });
});

ipcMain.handle('message-from-main', (_, arg) => {
  sendWindowMessage(hiddenWindow, 'message-from-main', arg);
});

ipcMain.handle('message-from-worker', (_, arg) => {
  sendWindowMessage(mainWindow, 'message-from-worker', arg);
});

ipcMain.handle('background-error', (_, arg) => {
  const { message } = arg;

  dialog.showMessageBox(mainWindow, { 
    message,
    type: 'error',
    buttons: ['Ok']
  });
});

ipcMain.handle('show-files', (_, arg) => {
  const { options } = arg;

  const csvPath = dialog.showOpenDialogSync(mainWindow, options)[0];

  sendWindowMessage(hiddenWindow, 'message-from-main', {
    command: 'import-csv',
    payload: { csvPath }
  });
  sendWindowMessage(hiddenWindow, 'message-from-main', {
    command: 'update-info',
    payload: {}
  });
});