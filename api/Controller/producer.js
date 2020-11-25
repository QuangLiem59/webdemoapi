const mongoose = require('mongoose');
const Producer = require('../Models/Producer');
const cloudinary = require('../../cloudinary');
const fs = require('fs');

// exports.producer_get_all = (req, res, next) => {
//     Producer.find()
//         .select('-__v')
//         .exec()
//         .then(result => {
//             const response = {
//                 count: result.length,
//                 producer: result.map(docs => {
//                     return {
//                         docs,
//                         request: {
//                             type: 'GET',
//                             url: 'http://localhost:2228/producer/' + docs._id,
//                         }
//                     }
//                 })
//             }
//             if (result.length > 0) {
//                 res.status(200).json(response);
//             } else {
//                 res.status(404).json({
//                     message: "Nothing"
//                 })
//             }
//         })
//         .catch(err => {
//             console.log(err);
//             res.status(500).json({ error: err });
//         })
// };

class APIfeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filtering() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit'];

        excludedFields.forEach(i => delete (queryObj[i]))
        let queryStr = JSON.stringify(queryObj);

        queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g, match => '$' + match);
        this.query.find(JSON.parse(queryStr));

        return this
    }

    sorting() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy)
        } else {
            this.query = this.query.sort("-cratedAt")
        }
        return this
    }

    paginating() {
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 20
        const skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit(limit)

        return this
    }
}

exports.producer_get_all = async (req, res, next) => {
    try {
        const features = new APIfeatures(Producer.find(), req.query).filtering().sorting().paginating();
        const producer = await features.query;

        return res.status(200).json({
            status: 'Success',
            count: producer.length,
            producer: producer
        });
    } catch (err) {
        return res.status(500).json({ error: err });
    }
}

exports.producer_add_producer = async (req, res, next) => {
    const uploader = async (path, f1) => await cloudinary.uploads(path, 'webdemoimage/' + 'Producer' + '/' + f1);
    const urls = [];

    if (!req.files || req.files === null) {
        return res.status(400).json({ message: "No Image Uploaded" });
    }
    else {
        const images = req.files.ProducerIcon;
        if (!images.mimetype.match(/jpe|jpeg|png|gif$i/)) {
            return res.status(400).json({ message: "File format is incorret" })
        }

        if (images.size > 1024 * 1024 * 5) {
            return res.status(400).json({ message: "File too large" });
        }
        const { ProducerName } = req.body;
        const { tempFilePath } = images;
        const newPath = await uploader(tempFilePath, ProducerName);
        urls.push(newPath);
        fs.unlinkSync(tempFilePath, err => {
            if (err) throw err;
        })
        console.log(newPath.url)
    }

    const producer = new Producer({
        _id: new mongoose.Types.ObjectId(),
        ProducerName: req.body.ProducerName,
        ProducerIcon: urls[0].url
    });
    console.log(producer, urls);
    if (!producer.ProducerIcon) return res.status(400).json({ message: 'No image uploaded' });
    producer.save().then(result => {
        res.status(201).json({
            message: "Add Producer Complete !",
            createProducer: {
                Producer: result,
                request: {
                    type: 'GET',
                    url: 'http://localhost:2228/producer/' + result._id,
                }
            }
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    })
}