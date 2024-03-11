const cloudinary = require('cloudinary').v2;
const {CloudinaryStorage} = require('multer-storage-cloudinary')
cloudinary.config({
    cloud_name: "dazvw40nj",
    api_key: "793567532522551",
    api_secret:"twCEyZaJos37qIbzh9MiRRBTivs"
    // cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    // api_key: process.env.CLOUDINARY_KEY,
    // api_secret: process.env.CLOUDINARY_SECRET
})
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'Sponzify',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
})
module.exports = {
    cloudinary,
    storage
}