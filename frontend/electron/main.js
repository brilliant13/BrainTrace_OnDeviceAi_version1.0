import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, '..', 'public', 'brain.png'),
        webPreferences: {
            
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    // ✅ 개발 모드 확인 (강제 설정)
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

    if (isDev) {
        console.log("✅ 개발 모드: Vite 서버 로드 (http://localhost:5173)");
        mainWindow.loadURL('http://localhost:5173'); // Vite 개발 서버 로드
    } else {
        console.log("🚀 배포 모드: 빌드된 파일 로드");
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html')); // 빌드된 HTML 로드
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
