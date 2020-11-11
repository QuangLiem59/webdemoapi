const express = require('express');
const router = express.Router();

const checkAuth = require('../Middleware/check-auth');

// const storage = multer.diskStorage({
//     // destination: function (req, file, cb) {
//     //     cb(null, './uploads/');
//     // },
//     // filename: function (req, file, cb) {
//     //     cb(null, new Date().toISOString() + file.originalname);
//     // }
// });

// const fileFilter = (req, file, cb) => {
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/svg') {
//         cb(null, true);
//         return
//     }
//     else {
//         cb(new Error('File is not supported'), false);
//         return
//     }
// }

// const upload = multer({
//     storage: storage,
//     limits: {
//         fileSize: 1024 * 1024 * 10
//     },
//     fileFilter: fileFilter
// });

const productController = require('../Controller/product');

router.get('/', productController.product_get_all);

router.get('/:productId', productController.product_get_by_id);

router.post('/', productController.product_add_product);

router.delete('/:productId', productController.product_delete_product);

router.patch('/:productId', checkAuth, productController.product_patch_product);



module.exports = router;