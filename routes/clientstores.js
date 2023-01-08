var express = require('express');
var router = express.Router();

const helper = require('./repository/customhelper');
const ClientStorePath = `${__dirname}/data/masters/clientstores/`;

function isAuthAdmin(req, res, next) {
 
  if (req.session.isAuth && req.session.accounttype == "ADMINISTRATOR") {
    next();
  }

  else {
    res.redirect('/login');
  }
};

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('clientstores', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDate()
  });

});

module.exports = router;

router.post('/save', (req, res) => {
  try {
    let storenumber = req.body.storenumber;
    let storename = req.body.storename;
    let clientname = req.body.clientname;
    let data = req.body.data;
    let ClientFoler = `${ClientStorePath}${clientname}`;
    let filename = `${ClientFoler}/${storename}_${storenumber}.json`;

    console.log(ClientFoler);
    console.log(filename);

    helper.CreateFolder(ClientFoler);
    helper.CreateJSON(filename, data);

    res.json({
      msg: 'success',
    });
  } catch (error) {
    res.json({
      msg: error
    })
  }
});

router.get('/load', (req, res) => {
  try {
    let dataArr = [];
    let folders = helper.GetFolderList(ClientStorePath);

    folders.forEach(folder => {
      let targetFolder = `${ClientStorePath}${folder}/`;
      let files = helper.GetFiles(targetFolder);

      files.forEach(file => {
        let targetFile = `${targetFolder}/${file}`;
        var data = helper.ReadJSONFile(targetFile);

        data.forEach((key, item) => {
          dataArr.push({
            storenumber: key.storenumber,
            storename: key.storename,
            zone: key.zone,
            storetype: key.storetype,
            contactnumber: key.contactnumber,
            storeemail: key.storeemail,
            address: key.address,
            googlemapaddress: key.googlemapaddress,
            clientname: key.clientname,
            createdby: key.createdby,
            createddate: key.createddate
          })
        })
      })

    });

    res.json({
      msg: 'success',
      data: dataArr
    })

  } catch (error) {
    res.json({
      msg: error
    })
  }
});

router.post('/clientstore', (req, res) => {
  try {
    var dataArr = [];
    let index = req.body.clientname;
    let targetFolder = `${ClientStorePath}/${index}/`;
    var files = helper.GetFiles(targetFolder);

    console.log(index);

    files.forEach(file => {
      var fileDir = `${targetFolder}${file}`;
      var data = helper.ReadJSONFile(fileDir);

      data.forEach((key, item) => {
        dataArr.push({
          clientname: key.clientname,
          storename: key.storename,
          storenumber: key.storenumber,
          contactnumber: key.contactnumber,
          address: key.address,
          googlemapaddress: key.googlemapaddress,
        })
      })
    });

    helper.GetByClientStores(dataArr, index, (err, result) => {
      if (err) throw err;

      res.json({
        msg: 'success',
        data: result
      })
    });

  } catch (error) {
    res.json({
      msg: error
    })
  }

});

router.post('/excelsave', (req, res) => {
  try {
    let data = req.body.data;

    function CreateFile(datajson) {
      // console.log(datajson);
      return new Promise((resolve, reject) => {
        datajson = JSON.parse(datajson);
        datajson.forEach((key, item) => {
          var dataClientDetails = [];
          let ClientFoler = `${ClientStorePath}${key.clientname}`;
          let filename = `${ClientFoler}/${key.storename}_${key.storenumber}.json`;

          dataClientDetails.push({
            clientname: key.clientname,
            storenumber: key.storenumber,
            storename: key.storename,
            zone: key.zone,
            storetype: key.storetype,
            contactnumber: key.contactnumber,
            storeemail: key.storeemail,
            address: key.address,
            googlemapaddress: key.googlemapaddress,
            createdby: key.createdby,
            createddate: key.createddate
          })

          dataClientDetails = JSON.stringify(dataClientDetails, null, 2);

          try {
            helper.CreateFolder(ClientFoler);
            helper.CreateJSON(filename, dataClientDetails);
          } catch (error) {
            reject(error)
          }

        })

        resolve('DONE');

      });

    }

    CreateFile(data).then(result => {
      console.log(result)
      res.json({
        msg: 'success'
      })
    }).catch(err => {
      res.json({
        msg: err
      })
    })

  } catch (error) {
    res.json({
      msg: error
    })
  }
})