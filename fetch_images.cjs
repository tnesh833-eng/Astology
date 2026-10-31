const https = require('https');
const fs = require('fs');
const path = require('path');

const targets = [
  {
    name: 'prod-shankh.jpg',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Shankha_with_rosette.jpg/800px-Shankha_with_rosette.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Samkh.jpg/800px-Samkh.jpg'
    ]
  },
  {
    name: 'prod-sriyantra.jpg',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Sri_Yantra_copper.jpg/800px-Sri_Yantra_copper.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Shri_Yantra.jpg/800px-Shri_Yantra.jpg'
    ]
  },
  {
    name: 'prod-akhand-diya.jpg',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Diya_Lamp.jpg/800px-Diya_Lamp.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Lamp-brass_-Tamil_Nadu.JPG/800px-Lamp-brass_-Tamil_Nadu.JPG'
    ]
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Status ' + res.statusCode));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  const dir = path.join(__dirname, 'images');
  for (const item of targets) {
    let success = false;
    for (const url of item.urls) {
      try {
        console.log(`Trying ${url}...`);
        await download(url, path.join(dir, item.name));
        console.log(`Successfully saved ${item.name}`);
        success = true;
        break;
      } catch (err) {
        console.log(`Failed ${url}: ${err.message}`);
      }
    }
    if (!success) {
      console.log(`Could not download ${item.name}`);
    }
  }
}

run();
