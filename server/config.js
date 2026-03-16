require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

module.exports = {
  PORT: process.env.PORT || 3001,
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  PROPERTY_DATA_PATH: process.env.PROPERTY_DATA_PATH,
  IMAGES_DIR: process.env.IMAGES_DIR,
};
