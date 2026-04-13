const fs = require('fs');

let c = fs.readFileSync('src/components/landing-v2/QaprilLandingV2.tsx', 'utf8');
c = c.replace(
  /<Link href="\/" className="nav-logo">\s*<div className="nav-logo-sq">Q<\/div>\s*QAPRIL\s*<\/Link>/s,
  `<Link href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          <img src="/logo.png" alt="QAPRIL Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
        </Link>`
);
fs.writeFileSync('src/components/landing-v2/QaprilLandingV2.tsx', c);
console.log("Done");
