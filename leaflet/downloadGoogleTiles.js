const axios = require("axios");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");

const GOOGLE = [
  {
    param: "satellite",
    server: "https:/mt0.google.com/vt/lyrs=s&hl=uk&x={x}&y={y}&z={z}",
  },
  {
    param: "landscape",
    server: "https:/mt0.google.com/vt/lyrs=p&hl=uk&x={x}&y={y}&z={z}",
  },
  {
    param: "street",
    server: "https:/mt0.google.com/vt/lyrs=m&hl=uk&x={x}&y={y}&z={z}",
  },
];

// Define the parameters
const args = process.argv.slice(2, 9); // Вибираємо перші 7 значень командного рядка
console.log("args: ", args);
const TILE_URL = GOOGLE.find((p) => p.param === args[0]).server ?? "";
const minZoom = parseInt(args[1]) ?? 0;
const maxZoom = parseInt(args[2]) ?? 1;
const topLeft = { lat: parseFloat(args[3]), lon: parseFloat(args[4]) };
const bottomRight = { lat: parseFloat(args[5]), lon: parseFloat(args[6]) };

console.log("TILE_URL: ", TILE_URL);
console.log("minZoom, maxZoom: ", minZoom, maxZoom);
console.log("topLeft: ", topLeft);
console.log("bottomRight: ", bottomRight, "\n");

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

  for (let x = topLeftTile.x; x <= bottomRightTile.x; x++) {
    for (let y = minY; y <= maxY; y++) {
      downloadTile(zoom, x, y);
    }
  }
}

// Download tiles for all zoom levels
for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
  console.log(`Starting download for zoom level ${zoom}`);
  getTileBounds(zoom);
}
