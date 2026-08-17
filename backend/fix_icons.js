const fs = require('fs');
const path = require('path');
// Run this from the backend folder so it can access sharp
const sharp = require('sharp');

const resDir = path.resolve(__dirname, '../frontend/android/app/src/main/res');
const logoPath = path.resolve(__dirname, '../frontend/assets/ggp_logo.jpg');

const mipmaps = {
  'mipmap-mdpi': { adaptive: 108, legacy: 48 },
  'mipmap-hdpi': { adaptive: 162, legacy: 72 },
  'mipmap-xhdpi': { adaptive: 216, legacy: 96 },
  'mipmap-xxhdpi': { adaptive: 324, legacy: 144 },
  'mipmap-xxxhdpi': { adaptive: 432, legacy: 192 },
};

async function generateIcons() {
  if (!fs.existsSync(logoPath)) {
    console.error('Logo not found at', logoPath);
    process.exit(1);
  }

  for (const [dirName, sizes] of Object.entries(mipmaps)) {
    const dirPath = path.join(resDir, dirName);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Clean up all existing image icons (jpg, png, webp)
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      if (file.startsWith('ic_launcher') && !file.endsWith('.xml')) {
        fs.unlinkSync(path.join(dirPath, file));
        console.log(`Deleted ${path.join(dirName, file)}`);
      }
    });

    console.log(`Generating for ${dirName}...`);

    // 1. Adaptive Foreground (Transparent padding)
    // The logo should be ~60% of the adaptive size so it doesn't get clipped.
    const logoSizeAdaptive = Math.round(sizes.adaptive * 0.60);
    const adaptiveLogo = await sharp(logoPath)
      .resize(logoSizeAdaptive, logoSizeAdaptive, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toBuffer();

    await sharp({
      create: {
        width: sizes.adaptive,
        height: sizes.adaptive,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 } // transparent background
      }
    })
    .composite([{ input: adaptiveLogo, gravity: 'center' }])
    .png()
    .toFile(path.join(dirPath, 'ic_launcher_foreground.png'));


    // 2. Legacy Round Icon (White circle background)
    // The logo is centered inside a white circle.
    const logoSizeLegacyRound = Math.round(sizes.legacy * 0.70);
    const legacyLogoRound = await sharp(logoPath)
      .resize(logoSizeLegacyRound, logoSizeLegacyRound, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toBuffer();

    // Create a white circle mask
    const circleSvg = `<svg width="${sizes.legacy}" height="${sizes.legacy}">
      <circle cx="${sizes.legacy / 2}" cy="${sizes.legacy / 2}" r="${sizes.legacy / 2}" fill="#ffffff" />
    </svg>`;

    await sharp(Buffer.from(circleSvg))
      .composite([{ input: legacyLogoRound, gravity: 'center' }])
      .png()
      .toFile(path.join(dirPath, 'ic_launcher_round.png'));


    // 3. Legacy Square Icon (White square background)
    const logoSizeLegacySquare = Math.round(sizes.legacy * 0.85);
    const legacyLogoSquare = await sharp(logoPath)
      .resize(logoSizeLegacySquare, logoSizeLegacySquare, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toBuffer();

    await sharp({
      create: {
        width: sizes.legacy,
        height: sizes.legacy,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 } // white background
      }
    })
    .composite([{ input: legacyLogoSquare, gravity: 'center' }])
    .png()
    .toFile(path.join(dirPath, 'ic_launcher.png'));

    console.log(`Updated icons in ${dirName}`);
  }

  console.log('Icon generation complete.');
}

generateIcons().catch(console.error);
