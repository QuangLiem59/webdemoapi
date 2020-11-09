require('dotenv').config();
const express = require('express');
// const jwt = require('jsonwebtoken');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const PORT = process.env.PORT || 5000;


app.set('view engine', 'ejs');
app.set('views', './views');
mongoose.connect('mongodb+srv://' + process.env.MONGOO_ATLAS_DB_NAME + ':' + process.env.MONGOO_ATLAS_PW + '@cluster0.3u6wx.mongodb.net/webdemoapi?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})


app.use('/uploads', express.static('uploads'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true
}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
})

const productRouters = require('./api/routes/products');
const orderRouters = require('./api/routes/order');
const userRouters = require('./api/routes/user');
const adminRouters = require('./api/routes/admin');
const uploadRouters = require('./api/routes/upload');


// const Product = require('./api/Models/Product');


// app.post('/api/dangnhap', function (req, res) {
//     if (req.body.username == 'liem' && req.body.password == 'liem123') {
//         const token = jwt.sign({ ten: 'liem' }, 'liem123', { algorithm: 'HS256', expiresIn: '2h' });
//         res.send('Xin Chào ' + req.body.username);
//         res.json({ access__token: token });
//     }
//     else {
//         res.send('Đăng Nhập Thất Bại!');
//     }
// })

// app.use(function (req, res, next) {
//     if (req.headers && req.headers.authorization && String(req.headers.authorization.split(' ')[0]).toLowerCase == 'beaber') {
//         const token = req.headers.authorization.split(' ')[1];
//         jwt.verify(token, 'liem123', function (err, decode) {
//             if (err) {
//                 return res.status(403).send({
//                     massages: 'Token Invalid'
//                 });
//             }
//             else {
//                 return next();
//             }
//         })
//     }
//     else {
//         return res.status(403).send({
//             massages: 'Unauthorized'
//         })
//     }
// })

app.get('/api/test', function (req, res) {
    // res.cookie('cookie', 'monster');
    res.json({ message: 'Testtt !', cookie: req.cookies });

})
app.use('/product', productRouters);
app.use('/order', orderRouters);
app.use('/user', userRouters);
app.use('/admin', adminRouters);
app.use('/admin', uploadRouters);

app.get('/', function (req, res) {
    res.status(200).json({
        waring: 'API này của bố mầy'
    })
})

app.use((req, res, next) => {
    const error = new Error('Error...');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})

app.listen(PORT, function () {
    console.log('ok');
});
