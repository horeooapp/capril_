const sharp = require('sharp');
const fs = require('fs');

async function processSplash() {
  const width = 1200;
  const height = 1200;
  
  // Create an SVG with a rounded white rectangle
  const roundedRectSvg = `
    <svg width="${width}" height="${height}">
      <rect x="0" y="0" width="${width}" height="${height}" rx="300" ry="300" fill="#FFFFFF"/>
    </svg>
  `;

  try {
    // Read the original transparent logo, resize it to fit well within the 1200 box (e.g. 700x700 max)
    const logoBuffer = await sharp('assets/logo-qapril.png')
      .resize(800, 800, { fit: 'inside' })
      .toBuffer();

    // Composite the logo over the white rounded rectangle
    await sharp(Buffer.from(roundedRectSvg))
      .composite([{ input: logoBuffer, gravity: 'center' }])
      .png()
      .toFile('assets/splash_v3.png');
      
    console.log("Successfully created splash_v3.png");
  } catch (err) {
    console.error("Error creating splash:", err);
  }
}

processSplash();
