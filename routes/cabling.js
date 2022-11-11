var express = require('express');
var router = express.Router();

const helper = require('./repository/customhelper');
var CablingPath = `${__dirname}/data/cabling/`;
const { isAuthAdmin } = require('./controller/authBasic');

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('cabling', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype
  });
});

module.exports = router;

router.post('/save', (req, res) => {
  try {
    var brandname = req.body.brandname;
    var itemtype = req.body.itemtype;
    var data = req.body.data;
    var folder = `${CablingPath}${brandname}`;
    var fileDir = `${folder}/${itemtype}_${brandname}.json`;

    console.log(`Target Dir: ${folder}\n Data:${data} \nFilename: ${fileDir}`);

    helper.CreateFolder(folder);
    helper.CreateJSON(fileDir, data);

    res.json({
      msg: 'success'
    })


  } catch (error) {
    res.json({
      msg: error
    })
  }

});

router.get('/load', (req, res) => {
  try {
    var dataArr = [];
    var folders = helper.GetFolderList(CablingPath);

    console.log('hit');

    folders.forEach(folder => {
      var targetFolder = `${CablingPath}${folder}`;
      var files = helper.GetFiles(targetFolder);

      files.forEach(file => {
        var filename = `${targetFolder}/${file}`;
        var data = helper.ReadJSONFile(filename);

        data.forEach((key, item) => {
          dataArr.push({
            brandname: key.brandname,
            itemtype: key.itemtype,
            itemcount: key.itemcount,
            updateby: key.updateby,
            updatedate: key.updatedate,
            createdby: key.createdby,
            createddate: key.createddate
          })
        })

      })

    });

    res.json({
      msg: 'success',
      data: dataArr
    });

  } catch (error) {
    res.json({
      msg: error
    })
  }

});

router.post('/saveexceldata', async (req, res) => {
  try {
    var data = await req.body.data;
    var dataraw = await JSON.parse(data);

    //console.log(`${dataraw}`);
    var dataArr = [];
    await dataraw.forEach(async (key, item) => {

      var folder = `${CablingPath}${key.brandname}`;
      var fileDir = `${folder}/${key.itemtype}_${key.brandname}.json`;

      var brandname = key.brandname;
      var itemtype = key.itemtype;
      var itemcount = key.itemcount;
      var updateby = '';
      var updatedate = '';
      var createdby = createdby == null ? 'CREATOR' : '';
      var createddate = createddate == null ? '2022-10-26' : '';

      dataArr.push({
        'brandname': brandname,
        'itemtype': itemtype,
        'itemcount': itemcount,
        'updateby': updateby,
        'updatedate': updatedate,
        'createdby': createdby,
        'createddate': createddate
      });

      var data = JSON.stringify(dataArr, null, 2);

      //console.log(`Target Dir: ${folder}\n Data:${dataArr} \nFilename: ${fileDir}`);

      helper.CreateFolder(folder);
      helper.CreateJSON(fileDir, data);
      dataArr = [];
    }).then(
      res.json({
        msg: 'success'
      })
    )

  } catch (error) {
    res.json({
      msg: error
    })
  }

});

router.get('/GetCablingEquipmentSummary', (req, res) => {
try {
  let data = helper.GetCablingEquipmentSummary(CablingPath);

  res.json({
    data: data
  })
  
} catch (error) {
  res.json({
    msg: error
  })
}
});

router.get('/GetDetailedEquipmentSummary', (req, res) => {
  try {

    let data = helper.GetDetailedEquipmentSummary(MasterItemPath, EquipmentPath, 'CABLING');

    res.json({
      msg: 'success',
      data: data
    })
    
  } catch (error) {
    res.json({
      msg: error
    })
  }
})