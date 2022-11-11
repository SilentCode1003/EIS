var express = require('express');
var router = express.Router();

const { isAuthAdmin } = require('./controller/authBasic');
const helper = require('./repository/customhelper');
const ClientStorePath = `${__dirname}/data/masters/clientstores/`

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
