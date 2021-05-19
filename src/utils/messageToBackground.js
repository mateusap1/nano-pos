const electron = require('electron');
const { ipcRenderer } = electron;

const message2Background = (command, payload) => {
  ipcRenderer.send('message-from-main', {
    command: command, payload: payload
  });
}

module.exports = { message2Background };