const Product = require('../Models/Product');
const mongoose = require('mongoose');
const cloudinary = require('../../cloudinary');
const fs = require('fs');
const { url } = require('inspector');
const { isObject, isArray } = require('util');

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

exports.product_get_all = async (req, res, next) => {
    try {
        const features = new APIfeatures(Product.find(), req.query).filtering().sorting().paginating();
        const products = await features.query;

        res.json({
            status: 'Success',
            count: products.length,
            product: products
        });
    } catch (err) {
        res.status(500).json({ error: err });
    }
    // Product.find()
    //     .exec()
    //     .then(result => {
    //         const response = {
    //             count: result.length,
    //             products: result.map(docs => {
    //                 return {
    //                     _id: docs._id,
    //                     Name: docs.Name,
    //                     Price: docs.Price,
    //                     Image: docs.Image,
    //                     Sale: docs.Sale,
    //                     Information: docs.Information,
    //                     Details: docs.Details,
    //                     Warranties: docs.Warranties,
    //                     Category: docs.Category,
    //                     Producer: docs.Producer,
    //                     Hots: docs.Hots,
    //                     News: docs.News,
    //                     request: {
    //                         type: 'GET',
    //                         url: 'http://localhost:2228/product/' + docs._id,
    //                     }
    //                 }
    //             })
    //         }
    //         if (result.length > 0) {
    //             res.status(200).json(response);
    //         } else {
    //             res.status(404).json({
    //                 message: "Nothing"
    //             })
    //         }
    //     })
    //     .catch(err => {
    //         console.log(err);
    //         res.status(500).json({ error: err });
    //     })
}

exports.product_get_by_id = (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .exec()
        .then(docs => {
            if (docs) {
                res.status(200).json({
                    product: docs,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:2228/product'
                    }
                });
            } else {
                res.status(404).json({
                    message: "No data from Id"
                })
            }

        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ error: err });
        });
}

exports.product_add_product = async (req, res, next) => {
    const uploader = async (path, f1, f2, f3) => await cloudinary.uploads(path, 'webdemoimage/' + f1 + '/' + f2 + '/' + f3);
    const urls = [];
    if (!req.files || req.files === null) {
        return res.status(400).json({ message: "No Image Uploaded" });
    }
    else {
        const images = req.files.Image;
        // return res.status(400).json(isArray(images))
        if (!isArray(images)) {
            if (!images.mimetype.match(/jpe|jpeg|png|gif$i/)) {
                return res.status(400).json({ message: "File format is incorret" })
            }
            if (images.size > 1024 * 1024 * 5) {
                return res.status(400).json({ message: "File too large" });
            }
            const { Name, Category, Producer } = req.body;
            const { tempFilePath } = images;
            const newPath = await uploader(tempFilePath, Category, Producer, Name);
            urls.push(newPath);
            fs.unlinkSync(tempFilePath, err => {
                if (err) throw err;
            })
        } else {
            for (const i of images) {
                if (!i.mimetype.match(/jpe|jpeg|png|gif$i/)) {
                    return res.status(400).json({ message: "File format is incorret" })
                }

                if (i.size > 1024 * 1024 * 5) {
                    return res.status(400).json({ message: "File too large" });
                }
                const { Name, Category, Producer } = req.body;
                const { tempFilePath } = i;
                const newPath = await uploader(tempFilePath, Category, Producer, Name);
                urls.push(newPath);
                fs.unlinkSync(tempFilePath, err => {
                    if (err) throw err;
                })
            }
        }
    }

    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        Name: req.body.Name,
        Image: urls,
        Price: req.body.Price,
        Sale: req.body.Sale,
        Information: req.body.Information,
        Details: req.body.Details,
        Category: req.body.Category,
        Producer: req.body.Producer,
        Warranties: req.body.Warranties,
        Hots: req.body.Hots,
        News: req.body.News,
    });
    if (!product.Image) return res.status(400).json({ message: 'No image uploaded' });
    product.save().then(result => {
        res.status(201).json({
            message: "Add Product Complete !",
            createProduct: {
                Product: result,
                request: {
                    type: 'GET',
                    url: 'http://localhost:2228/product/' + result._id,
                }
            }
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    })
}

exports.product_patch_product = (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.updateOne({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product Updated!',
                product: result,
                request: {
                    type: 'GET',
                    url: 'http://localhost:2228/product/' + id,
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
}

exports.product_delete_product = (req, res, next) => {
    const id = req.params.productId;
    Product.deleteOne({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Product Deleted!",
                product: result,
                request: {
                    type: 'POST',
                    url: 'http://localhost:2228/product'
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
}