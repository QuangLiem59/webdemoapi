require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const PORT = process.env.PORT || 5000;


app.set('view engine', 'ejs');
app.set('views', './views');
mongoose.connect('mongodb+srv://'
    + process.env.MONGOO_ATLAS_DB_NAME + ':' + process.env.MONGOO_ATLAS_PW +
    '@cluster0.3u6wx.mongodb.net/webdemoapi?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    }).then(
        console.log("Mongoose connected!")
    ).catch(err => {
        console.log("Mongoose connection failed!", err)
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
const producerRouters = require('./api/routes/producer');

app.listen(PORT, function () {
    console.log('Ready!');
});

app.use('/product', productRouters);
app.use('/order', orderRouters);
app.use('/user', userRouters);
app.use('/admin', adminRouters);
app.use('/admin', uploadRouters);
app.use('/producer', producerRouters);

app.get('/', function (req, res) {
    return res.status(200).json({
        message: 'Ok'
    })
})

app.get('/api/cookie', function (req, res) {
    res.status(200).json({ message: 'Cookie', cookie: req.cookies });
})

// app.use((req, res, next) => {
//     const error = new Error('Error...');
//     error.status = 404;
//     next(error);
// })

// app.use((error, req, res, next) => {
//     res.status(error.status || 500);
//     res.json({
//         error: {
//             message: error.message
//         }
//     })
// })


