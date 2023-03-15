var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const session = require('express-session');
const mongoose = require('mongoose');
const MongoDBSession = require('connect-mongodb-session')(session);
const helper = require('./routes/repository/customhelper');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var personelRouter = require('./routes/personel');
var locationRouter = require('./routes/locations');
var itemsRouter = require('./routes/items');
var accounttypeRouter = require('./routes/accounttype');
var positionsRouter = require('./routes/positions');
var equipmentsRouter = require('./routes/equipment');
var networksRouter = require('./routes/networks');
var cablingRouter = require('./routes/cabling');
var loginRouter = require('./routes/login');
var requestequipmentRouter = require('./routes/requestequipment');
var transferRouter = require('./routes/transfer');
var clientstoresRouter = require('./routes/clientstores');
var locationtypeRouter = require('./routes/locationtype');
var clientnameRouter = require('./routes/clientname');
var cablingrequestRouter = require('./routes/cablingrequest');
var cablingreportRouter = require('./routes/cablingreport');
var equipmentreportRouter = require('./routes/equipmentreport');
var cablingitemmasterRouter = require('./routes/cablingitemmaster');
var cyberreportRouter = require('./routes/cyberreport');
var cyberrequestRouter = require('./routes/cyberrequest');
var cyberdashboardRouter = require('./routes/cyberdashboard');
var cyberstocksRouter = require('./routes/cyberstocks');
var purchasedashboardRouter = require('./routes/purchasedashboard');
var purchaserequestRouter = require('./routes/purchaserequest');
var purchasereportRouter = require('./routes/purchasereport');
var accountingdashboardRouter = require('./routes/accountingdashboard');
var accountingrequestRouter = require('./routes/accountingrequest');
var accountingreportRouter = require('./routes/accountingreport');
var warehouseRouter = require('./routes/warehouse');
var purchasepricemasterRouter = require('./routes/purchasepricemaster');
var networkdashboardRouter = require('./routes/networkdashboard');
var networkstocksRouter = require('./routes/networkstocks');
var networkrequestRouter = require('./routes/networkrequest');
var networkreportRouter = require('./routes/networkreport');
var sitespareRouter = require('./routes/sitespare');
var supplierRouter = require('./routes/supplier');
var porequestRouter = require('./routes/porequest');
var toolRouter = require('./routes/tool');
var cablingrequesttoolRouter = require('./routes/cablingrequesttool');


var app = express();

//Directory


//create folders


//mongodb
mongoose.connect('mongodb://localhost:27017/EIS')
  .then((res) => {
    console.log("MongoDB Connected!");
  });

const store = new MongoDBSession({
  uri: 'mongodb://localhost:27017/EIS',
  collection: 'EISSessions',
});

//Session
app.use(
  session({
    secret: "5L Secret Key",
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/personel', personelRouter);
app.use('/locations', locationRouter);
app.use('/items', itemsRouter);
app.use('/accounttype', accounttypeRouter);
app.use('/positions', positionsRouter);
app.use('/equipment', equipmentsRouter);
app.use('/networks', networksRouter);
app.use('/cabling', cablingRouter);
app.use('/login', loginRouter);
app.use('/requestequipment', requestequipmentRouter);
app.use('/transfer', transferRouter);
app.use('/clientstores', clientstoresRouter);
app.use('/locationtype', locationtypeRouter);
app.use('/clientname', clientnameRouter);
app.use('/cablingrequest', cablingrequestRouter);
app.use('/cablingreport', cablingreportRouter);
app.use('/equipmentreport', equipmentreportRouter);
app.use('/cablingitemmaster', cablingitemmasterRouter);
app.use('/cyberreport', cyberreportRouter);
app.use('/cyberrequest', cyberrequestRouter);
app.use('/cyberdashboard', cyberdashboardRouter);
app.use('/cyberstocks', cyberstocksRouter);
app.use('/purchasedashboard', purchasedashboardRouter);
app.use('/purchaserequest', purchaserequestRouter);
app.use('/purchasereport', purchasereportRouter);
app.use('/accountingdashboard', accountingdashboardRouter);
app.use('/accountingrequest', accountingrequestRouter);
app.use('/accountingreport', accountingreportRouter);
app.use('/warehouse', warehouseRouter);
app.use('/purchasepricemaster', purchasepricemasterRouter);
app.use('/networkdashboard', networkdashboardRouter);
app.use('/networkstocks', networkstocksRouter);
app.use('/networkrequest', networkrequestRouter);
app.use('/networkreport', networkreportRouter);
app.use('/sitespare', sitespareRouter);
app.use('/supplier', supplierRouter);
app.use('/porequest', porequestRouter);
app.use('/tool', toolRouter);
app.use('/cablingrequesttool', cablingrequesttoolRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
