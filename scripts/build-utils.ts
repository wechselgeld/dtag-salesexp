import * as fs from 'fs';
import * as path from 'path';

function buildUtils() {
  const rootDir = process.cwd();

  const publicSrc = path.join(rootDir, 'public');
  const publicDest = path.join(rootDir, '.next', 'standalone', 'public');

  const staticSrc = path.join(rootDir, '.next', 'static');
  const staticDest = path.join(rootDir, '.next', 'standalone', '.next', 'static');

  console.log('--- Cross-Platform Build Post-Processing ---');

  // Copy public folder to .next/standalone/public
  if (fs.existsSync(publicSrc)) {
    console.log(`Copying 'public' folder to '${publicDest}'...`);
    fs.mkdirSync(path.dirname(publicDest), {
 recursive: true,
});
    fs.cpSync(publicSrc, publicDest, {
 recursive: true,
});
  }
 else {
    console.warn(`Warning: 'public' folder not found at '${publicSrc}'`);
  }

  // Copy .next/static folder to .next/standalone/.next/static
  if (fs.existsSync(staticSrc)) {
    console.log(`Copying '.next/static' folder to '${staticDest}'...`);
    fs.mkdirSync(path.dirname(staticDest), {
 recursive: true,
});
    fs.cpSync(staticSrc, staticDest, {
 recursive: true,
});
  }
 else {
    console.warn(`Warning: '.next/static' folder not found at '${staticSrc}'`);
  }

  console.log('Build post-processing completed successfully!');
}

try {
  buildUtils();
}
 catch (error) {
  console.error('Error in build post-processing script:', error);
  process.exit(1);
}
