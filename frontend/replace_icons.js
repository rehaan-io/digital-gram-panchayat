const fs = require('fs');
const path = require('path');

const resDir = path.join(__dirname, 'android/app/src/main/res');
const logoPath = path.join(__dirname, 'assets/ggp_logo.jpg');

const mipmaps = [
  'mipmap-mdpi',
  'mipmap-hdpi',
  'mipmap-xhdpi',
  'mipmap-xxhdpi',
  'mipmap-xxxhdpi',
];

if (!fs.existsSync(logoPath)) {
  console.error('Logo not found at', logoPath);
  process.exit(1);
}

const logoBuffer = fs.readFileSync(logoPath);

mipmaps.forEach(dirName => {
  const dirPath = path.join(resDir, dirName);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Delete existing .webp and .png launcher icons
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    if (file.startsWith('ic_launcher') && (file.endsWith('.webp') || file.endsWith('.png'))) {
      fs.unlinkSync(path.join(dirPath, file));
      console.log(`Deleted ${path.join(dirName, file)}`);
    }
  });

  // Write new .jpg icons
  fs.writeFileSync(path.join(dirPath, 'ic_launcher.jpg'), logoBuffer);
  fs.writeFileSync(path.join(dirPath, 'ic_launcher_round.jpg'), logoBuffer);
  fs.writeFileSync(path.join(dirPath, 'ic_launcher_foreground.jpg'), logoBuffer);
  
  console.log(`Updated icons in ${dirName}`);
});

console.log('Icon replacement complete.');
