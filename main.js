const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

// Create a new browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // Allow Node.js integration in the window
      preload: path.join(__dirname, 'preload.js') // Optional: for additional security
    }
  });

  // Load your HTML file (which would be your front-end)
  mainWindow.loadFile(path.join(__dirname, 'views', 'main.html'));

  // Open DevTools for debugging (optional)
  mainWindow.webContents.openDevTools();

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Run when Electron is ready
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
