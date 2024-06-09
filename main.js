const { app, BrowserWindow, ipcMain } = require("electron");
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const markdownIt = require('markdown-it')();

let apiKey = '';

function createWindow() {
    const win = new BrowserWindow({
        width: 820,
        height: 645,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile("src/index.html");
}

app.whenReady().then(() => {
    createWindow();

    // Load API key from file or app settings
    apiKey = loadApiKey();

    const todosDir = path.join(app.getPath('userData'), 'todos app');
    const todosFile = path.join(todosDir, 'todos.todoapp');

    if (!fs.existsSync(todosDir)) {
        fs.mkdirSync(todosDir);
    }

    if (!fs.existsSync(todosFile)) {
        fs.writeFileSync(todosFile, JSON.stringify([]));
    }

    ipcMain.handle('save-api-key', (event, newApiKey) => {
        apiKey = newApiKey;
        saveApiKey(apiKey);
    });

    ipcMain.handle('load-todos', () => {
        const data = fs.readFileSync(todosFile, 'utf-8');
        return JSON.parse(data);
    });

    ipcMain.handle('save-todos', (event, todos) => {
        fs.writeFileSync(todosFile, JSON.stringify(todos, null, 2));
    });
    

    ipcMain.handle('get-recommendation', async (event, todoItem) => {
        return new Promise((resolve, reject) => {
            const pythonProcess = spawn('python3', ['recommendations.py', todoItem]);

            pythonProcess.stdout.on('data', (data) => {
                console.log(`Python script output: ${data}`);
                const recommendationHTML = markdownIt.render(data.toString()); // Convert Markdown to HTML
                resolve(recommendationHTML);
            });

            pythonProcess.stderr.on('data', (data) => {
                console.error(`Error from Python script: ${data}`);
                reject(data.toString());
            });

            pythonProcess.on('close', (code) => {
                console.log(`Python script exited with code ${code}`);
            });
        });
    });
});

app.on("window-all-closed", () => {
    app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

function loadApiKey() {
    const apiKeyFile = path.join(app.getPath('userData'), 'api-key.txt');
    if (fs.existsSync(apiKeyFile)) {
        return fs.readFileSync(apiKeyFile, 'utf-8').trim();
    } else {
        return '';
    }
}

function saveApiKey(apiKey) {
    const apiKeyFile = path.join(app.getPath('userData'), 'api-key.txt');
    fs.writeFileSync(apiKeyFile, apiKey);
}
