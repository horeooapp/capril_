const fs = require('fs');
let code = fs.readFileSync('src/app/layout.tsx', 'utf8');
code = code.replace(/\r\n/g, '\n');

const target = `  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },`;

const replacement = `  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/app/layout.tsx', code, 'utf8');
    console.log("Successfully updated layout.tsx icons!");
} else {
    console.log("Target not found!");
}

