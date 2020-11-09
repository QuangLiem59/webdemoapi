const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary');
const fs = require('fs');
const checkAuth = require('../Middleware/check-auth');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

router.post('/upload', (req, res, next) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: "No files were uploaded" })
        }

        const file = req.files.image
        if (file.size > 1024 * 1024 * 10) {
            removeTmp(file.tempFilePath)
            return res.status(400).json({ message: "File too large" })
        }

        if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/png' && file.mimetype !== 'image/svg') {
            removeTmp(file.tempFilePath)
            return res.status(400).json({ message: "File format is incorret" })
        }
        cloudinary.v2.uploader.upload(file.tempFilePath, { folder: "webdemoimage" }, async (err, result) => {
            if (err) throw err;

            removeTmp(file.tempFilePath)
            return res.status(200).json({ message: "Uploaded", public_id: result.public_id, url: result.secure_url });
        })
    } catch (err) {
        return res.status(500).json({ error: err });
    }
})

router.post('/delete', (req, res, next) => {
    const { public_id } = req.body;
    try {
        if (!public_id) {
            return res.status(400).json({ message: "No Image Selected" })
        }
        cloudinary.v2.uploader.destroy(public_id, (err, result) => {
            if (err) throw err;

            return res.status(200).json({ message: "Image Deleted!" });
        })

    } catch (err) {
        return res.status(500).json({
            error: err
        })
    }

})

const removeTmp = (path) => {
    fs.unlink(path, err => {
        if (err) throw err;
    })
}

module.exports = router

