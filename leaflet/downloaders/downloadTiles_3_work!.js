const axios = require("axios");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");

const GOOGLE_LANDSCAPE =
  "https:/mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}";
const GOOGLE_SATELLITE =
  "https:/mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}";
const GOOGLE_STREET = "https:/mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}";
const OPENSTREET_TILE = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

// Define the parameters
const TILE_URL = GOOGLE_SATELLITE;
const minZoom = 11;
const maxZoom = 11;
const topLeft = { lat: 43.19065790288107, lon: 27.270110568052075 };
const bottomRight = { lat: 59.19065790288107, lon: 43.270110568052075 };

// Calculate the tile coordinates
function latLonToTile(lat, lon, zoom) {
  const tileSize = Math.pow(2, zoom);
  const x = Math.floor(((lon + 180) / 360) * tileSize);
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

// Download and save a tile
async function downloadTile(z, x, y) {
  const url = TILE_URL.replace("{z}", z).replace("{x}", x).replace("{y}", y);
  const dir = path.join(__dirname, "tiles", `${z}`, `${x}`);
  mkdirp.sync(dir);
  const filePath = path.join(dir, `${y}.jpg`);

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

function getTileBounds(zoom) {
  const topLeftTile = latLonToTile(topLeft.lat, topLeft.lon, zoom);
  const bottomRightTile = latLonToTile(bottomRight.lat, bottomRight.lon, zoom);
  const minY = Math.min(topLeftTile.y, bottomRightTile.y);
  const maxY = Math.max(topLeftTile.y, bottomRightTile.y);
  const tiles = [];

  for (let x = topLeftTile.x; x <= bottomRightTile.x; x++) {
    for (let y = minY; y <= maxY; y++) {
      tiles.push({ x, y });
    }
  }
  return tiles;
}

// Download tiles for all zoom levels
for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
  console.log(`Starting download for zoom level ${zoom}`);
  const tiles = getTileBounds(zoom);
  tiles.forEach((tile) => downloadTile(zoom, tile.x, tile.y));
}
