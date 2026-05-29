import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'dist');
const destDir = path.join(__dirname, 'android-project', 'app', 'src', 'main', 'assets');

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  fs.readdirSync(from).forEach(element => {
    const srcElement = path.join(from, element);
    const destElement = path.join(to, element);
    if (fs.lstatSync(srcElement).isDirectory()) {
      copyFolderSync(srcElement, destElement);
    } else {
      fs.copyFileSync(srcElement, destElement);
    }
  });
}

try {
  if (fs.existsSync(srcDir)) {
    console.log('Copying assets from dist to android-project assets...');
    copyFolderSync(srcDir, destDir);
    console.log('Assets copied successfully!');
  } else {
    console.error('Error: dist directory does not exist. Please run npm run build first.');
  }
} catch (error) {
  console.error('Error copying assets:', error);
}
