var express = require('express');
var router = express.Router();
const xl = require('excel4node');

function isAuthAdmin(req, res, next) {

  if (req.session.isAuth && req.session.accounttype == "IT CUSTODIAN") {
    next();
  }

  if (req.session.isAuth && req.session.accounttype == "ADMINISTRATOR") {
    next();
  }

  else {
    res.redirect('/login');
  }
};

const helper = require('./repository/customhelper');
const mysql = require('./repository/dbconnect');
const dictionary = require('./repository/dictionary');

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('sitespare', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDatetime()
  });
});

module.exports = router;

router.post('/getspare', (req, res) => {
  try {
    let site = req.body.site;
    let department = req.body.department;
    // let sql = `select rie_itembrand as itembrand,
    //   rie_itemtype as itemtype,
    //   count(*) as itemcount
    //   from register_it_equipment
    //   inner join (select distinct mi_itemname as itemtype from master_item where mi_department='${department}') as Itemtype
    //   on Itemtype.itemtype = register_it_equipment.rie_itemtype
    //   where register_it_equipment.rie_site='${site}'
    //   group by register_it_equipment.rie_itembrand`;

    let sql = `call GetSpareCount('${site}')`;

    mysql.StoredProcedureResult(sql, (err, result) => {
      if (err) console.log(err);

      console.log(result);
      var data = [];
      result.forEach((key, item) => {
        data.push({
          itembrand: key.itembrand,
          itemtype: key.itemtype,
          itemcount: key.itemcount,
        })
      });

      res.json({
        msg: 'success',
        data: data
      });

    })

  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.post('/getactivespare', (req, res) => {
  try {
    let site = req.body.site;
    let department = req.body.department;
    // let sql = `select rie_itembrand as itembrand,
    //   rie_itemtype as itemtype,
    //   count(*) as itemcount
    //   from register_it_equipment
    //   inner join (select distinct mi_itemname as itemtype from master_item where mi_department='${department}') as Itemtype
    //   on Itemtype.itemtype = register_it_equipment.rie_itemtype
    //   where register_it_equipment.rie_site='${site}'
    //   group by register_it_equipment.rie_itembrand`;

    let sql = `call GetSiteSpareCount('${site}','ACTIVE')`;

    mysql.StoredProcedureResult(sql, (err, result) => {
      if (err) console.log(err);

      console.log(result);
      var data = [];
      result.forEach((key, item) => {
        data.push({
          itembrand: key.itembrand,
          itemtype: key.itemtype,
          itemcount: key.itemcount,
        })
      });

      res.json({
        msg: 'success',
        data: data
      });

    })

  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.post('/getdeployspare', (req, res) => {
  try {
    let site = req.body.site;
    let department = req.body.department;
    // let sql = `select rie_itembrand as itembrand,
    //   rie_itemtype as itemtype,
    //   count(*) as itemcount
    //   from register_it_equipment
    //   inner join (select distinct mi_itemname as itemtype from master_item where mi_department='${department}') as Itemtype
    //   on Itemtype.itemtype = register_it_equipment.rie_itemtype
    //   where register_it_equipment.rie_site='${site}'
    //   group by register_it_equipment.rie_itembrand`;

    let sql = `call GetSiteSpareCount('${site}','DEPLOYED')`;

    mysql.StoredProcedureResult(sql, (err, result) => {
      if (err) console.log(err);

      console.log(result);
      var data = [];
      result.forEach((key, item) => {
        data.push({
          itembrand: key.itembrand,
          itemtype: key.itemtype,
          itemcount: key.itemcount,
        })
      });

      res.json({
        msg: 'success',
        data: data
      });

    })

  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.post('/getsparesite', (req, res) => {
  try {
    let site = req.body.site;
    let brandname = req.body.brandname;
    let itemtype = req.body.itemtype
    let sql = `select * from register_it_equipment 
    where rie_itembrand='${brandname}'
    and rie_itemtype='${itemtype}'
    and rie_site='${site}'`;

    mysql.Select(sql, 'RegisterITEquipment', (err, result) => {
      if (err) console.error(err);

      console.log(result)
      res.json({
        msg: 'success',
        data: result
      })
    })

  } catch (error) {
    res.json({
      msg: error
    })
  }
})


let _excelDataArr = [];
let _excelFile = '';
router.post('/excel', (req, res) => {
  try {
    let data = req.body.data;
    let header = req.body.header;
    let filename = `${req.body.filename}_${helper.GetCurrentDate()}`;


    console.log(`Request Received: ${filename}`);

    _excelHeader = header;
    _excelDataArr = data;
    _excelFile = filename;
    res.json({
      msg: 'success'
    })


  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.get('/generate-excel', (req, res) => {
  // res.download(_excelFile);
  const workbook = new xl.Workbook();
  const worksheet = workbook.addWorksheet(`${_excelFile}`);
  var row = 1;
  var col = 1;

  var headerStyle = workbook.createStyle({
    font: {
      bold: true,
      underline: false,
    },
    alignment: {
      wrapText: true,
      horizontal: 'center',
    },
  });

  var dataStyle = workbook.createStyle({
    font: {
      bold: false,
      underline: false,
    },
    alignment: {
      wrapText: true,
      horizontal: 'center',
    },
  });

  // console.log(_excelHeader);
  console.log(`data length: ${_excelHeader.length}`);

  for (x = 0; x < _excelHeader.length; x++) {
    // console.log(`header content length: ${_excelHeader[x].length}`);

    for (z = 0; z < _excelHeader[x].length; z++) {
      // console.log(`row: ${row} col ${col} data: ${_excelHeader[x][z]}`);
      let data = `${_excelHeader[x][z]}`;
      data = data.split(',');
      for (i = 0; i < data.length; i++) {
        if (row == 1) {
          worksheet.cell(row, col).string(data[i]).style(headerStyle);
        }
        else {
          worksheet.cell(row, col).string(data[i]).style(dataStyle);
        }

        col += 1;
      }
    }

    col = 1;
    row += 1;
  }

  for (x = 0; x < _excelDataArr.length; x++) {
    // console.log(`header content length: ${_excelDataArr[x].length}`);

    for (z = 0; z < _excelDataArr[x].length; z++) {
      // console.log(`row: ${row} col ${col} data: ${_excelDataArr[x][z]}`);
      let data = `${_excelDataArr[x][z]}`;
      data = data.split(',');
      for (i = 0; i < data.length; i++) {
        if (row == 1) {
          worksheet.cell(row, col).string(data[i]).style(headerStyle);
        }
        else {
          worksheet.cell(row, col).string(data[i]).style(dataStyle);
        }

        col += 1;
      }
    }

    col = 1;
    row += 1;
  }
  workbook.write(`${_excelFile}.xlsx`, res);
})