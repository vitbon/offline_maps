const axios = require("axios");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");

// Define the parameters
const TILE_SERVER_URL = "https://khms0.google.com/kh/v=984?x={x}&y={y}&z={z}";
const GOOGLE_TILES_DIR = "google";
const LATITUDE = 50.596029488641676; // Latitude of the center
const LONGITUDE = 36.58744783620455; // Longitude of the center
// 36.58744783620455, lat: 50.596029488641676    // Bilgorod
// 51.19065790288107, 35.270110568052075  // Sudzha
const TILE_SIZE = 256; // Tile size

// Calculate the tile coordinates
function latLngToTile(lat, lng, zoom) {
  const tileSize = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * tileSize);
  const y = Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      tileSize
  );
  return { x, y };
}

// Download a single tile
async function downloadTile(z, x, y) {
  const url = TILE_SERVER_URL.replace("{z}", z)
    .replace("{x}", x)
    .replace("{y}", y);
  const dir = path.join(__dirname, GOOGLE_TILES_DIR, `${z}`, `${x}`);
  mkdirp.sync(dir);
  const filePath = path.join(dir, `${y}.jpg`);

  // if (fs.existsSync(filePath)) {
  //   console.log(`Tile ${z}/${x}/${y} already exists.`);
  //   return;
  // }

  console.log("filePath ---->>>>: ", filePath);

  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    response.data.pipe(fs.createWriteStream(filePath));
    console.log(`Downloaded tile ${z}/${x}/${y}`);
  } catch (error) {
    console.error(`Error downloading tile ${z}/${x}/${y}:`, error.message);
  }
}

// Determine the bounds of the tiles to be downloaded
function getTileBounds(lat, lng, zoom) {
  const tileCenter = latLngToTile(lat, lng, zoom);
  // Define a range around the center tile
  const range = 1;
  const tiles = [];
  for (let x = tileCenter.x - range; x <= tileCenter.x + range; x++) {
    for (let y = tileCenter.y - range; y <= tileCenter.y + range; y++) {
      tiles.push({ x, y });
    }
  }
  return tiles;
}

// Download tiles within the specified bounds
for (let zoom = 5; zoom <= 6; zoom++) {
  if (zoom >= 19) continue;
  const tiles = getTileBounds(LATITUDE, LONGITUDE, zoom);
  console.log("tiles: ", tiles);
  tiles.forEach((tile) => downloadTile(zoom, tile.x, tile.y));
}
