const { json } = require('express');
var express = require('express');
var router = express.Router();

const { isAuthAdmin } = require('./controller/authBasic');
const helper = require('./repository/customhelper');
const mysql = require('./repository/dbconnect')
const DeployEquipmentPath = `${__dirname}/data/deploy/it/`;
const PulloutEquipmentPath = `${__dirname}/data/pullout/`;

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('equipmentreport', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDate()
  });

});

module.exports = router;

router.get('/load', (req, res) => {
  try {
    let sql = `select * from transaction_it_equipment`;
    mysql.Select(sql, 'TransactionItEquipment', (err, result) => {
      if (err) throw err
      console.log(result);

      res.json({
        msg: 'success',
        data: result
      });
    });
  } catch (error) {
    res.json({
      msg: 'success'
    })
  }
});

router.get('/loaddeploy', (req, res) => {
  try {
    let sql = `select * from deploy_it_equipment`;
    mysql.Select(sql, 'DeployITEquipment', (err, result) => {
      if (err) throw err
      console.log(result);

      res.json({
        msg: 'success',
        data: result
      });
    });
  } catch (error) {
    res.json({
      msg: 'success'
    })
  }
});

router.get('/loadpullout', (req, res) => {
  try {
    let sql = `select * from pullout_it_equipment`;
    mysql.Select(sql, 'PulloutITEquipment', (err, result) => {
      if (err) throw err
      console.log(result);

      res.json({
        msg: 'success',
        data: result
      });
    });
  } catch (error) {
    res.json({
      msg: 'success'
    })
  }
});

router.post('/find', (req, res) => {
  try {
    let ticket = req.body.searchticket;
    let trf = req.body.searchtrf;
    let serial = req.body.searchserial;
    let isWildcardSearch = req.body.iswildcardsearch;
    let condition = '';
    let sql = 'SELECT * FROM transaction_it_equipment WHERE ';
    let count_index = 0;

    console.log(`Wildcard Search: ${isWildcardSearch}`)

    if (isWildcardSearch == 'true') {//wild card search set to true, once true disregard other inputs
      let cmd = `SELECT * FROM transaction_it_equipment WHERE tie_serial LIKE'${serial}%'`

      console.log(cmd);
      mysql.Select(cmd, 'TransactionItEquipment', (err, result) => {
        if (err) throw err;

        let data = result;

        res.json({
          msg: 'success',
          data: data
        })
      });
    }

    if (isWildcardSearch == 'false') {//wild card search set to false
      if (ticket != '') {
        condition += `tie_ticket='${ticket}' &`;
        count_index += 1
      }
      if (trf != '') {
        condition += `tie_trf='${trf}' && `;
        count_index += 1
      }
      if (serial != '') {
        condition += `tie_serial='${serial}'`;
        count_index += 1
      }

      if (condition != '') {

        console.log(`COUNT: ${count_index}`);

        if (count_index == 1) {
          condition = condition.replace('&', '');
        }

        if (count_index == 2) {
          condition = condition.replace('&&', '');
          condition = condition.replace('&', 'AND ');
        }

        if (count_index == 3) {
          condition = condition.replace('&&', 'AND ');
          condition = condition.replace('&', 'AND ');
        }

        let cmd = sql + condition;
        console.log(cmd);

        mysql.Select(cmd, 'TransactionItEquipment', (err, result) => {
          if (err) throw err;

          let data = result;

          res.json({
            msg: 'success',
            data: data
          })
        });

      } else {
        let cmd = `SELECT * FROM transaction_it_equipment`;
        mysql.Select(cmd, 'TransactionItEquipment', (err, result) => {
          if (err) throw err;

          let data = result;

          res.json({
            msg: 'success',
            data: data
          })
        });
      }
    }

  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.post('/deploy', async (req, res) => {    
  try {
    var date = req.body.deploydate;
    var data = req.body.data;
    var deployby = req.body.deployby;
    var dateArr = date.split('-');
    let year = dateArr[0];
    let month = dateArr[1];
    let targetFolder = `${DeployEquipmentPath}/${year}${month}`;
    let filename = `${targetFolder}/${date}_${deployby}.json`
    let dataJson = JSON.stringify(data, null, 2);
    let sqldata = [];
    let serial = '';
    let deployto = '';
    let deploydate = '';
    let deploytrf = '';
    let deployticket = '';

    data.forEach((key, item) => {
      serial = key.deployserial;
      deployto = key.deployto;
      deploydate = key.deploydate;
      deployticket = key.deployticket;
      deploytrf = key.deploytrf;

      sqldata.push([
        key.deployserial,
        key.deployitembrand,
        key.deployitemtype,
        key.deployto,
        key.deployby,
        key.deploydate,
        key.deployticket,
        key.deploytrf
      ])
    });

    Insert_DeployITEquipment = (data, callback) => {
      let sql = `INSERT INTO deploy_it_equipment(
        die_serial,
        die_itembrand,
        die_itemtype,
        die_deployto,
        die_deployby,
        die_deploydate,
        die_ticket,
        die_trf) VALUES ?`

      callback(null, mysql.InsertMultiple(sql, data));
    }

    Update_TransactionITEquipment = (serial, ticket, trf, deployto, deployby, deploydate, callback) => {
      let sql = `UPDATE transaction_it_equipment 
      SET tie_ticket='${ticket}', 
      tie_trf='${trf}', 
      tie_deployto='${deployto}',
      tie_deployby='${deployby}',
      tie_deploydate='${deploydate}',
      tie_status= 'DEPLOY' 
      WHERE tie_serial='${serial}'`;

      mysql.Update(sql, (err, result) => {
        if (err) callback(err, null);
      });

      let sql2 = `UPDATE register_it_equipment SET rie_status='DEPLOY' WHERE rie_serial='${serial}'`;
      mysql.Update(sql2, (err, result) => {
        if (err) callback(err, null);
      });

      callback(null, 'DONE')

    }

    helper.CreateFolder(targetFolder);
    helper.CreateJSON(filename, dataJson);

    await Insert_DeployITEquipment(sqldata, (err, result) => {
      if (err) throw err;
      console.log('Insert_DeployITEquipment');
    });

    await Update_TransactionITEquipment(serial, deployticket, deploytrf, deployto, deployby, deploydate, (err, result) => {
      if (err) throw err;

      console.log(Update_TransactionITEquipment);
    })

    res.json({
      msg: 'success'
    })

  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.post('/pullout', async (req, res) => {
  try {
    var date = req.body.pulloutdate;
    var data = req.body.data;
    var deployby = req.body.pulloutby;
    var dateArr = date.split('-');
    let year = dateArr[0];
    let month = dateArr[1];
    let targetFolder = `${PulloutEquipmentPath}/${year}${month}`;
    let filename = `${targetFolder}/${date}_${deployby}.json`
    let dataJson = JSON.stringify(data, null, 2);
    let sqldata = [];
    let serial = '';
    let pulloutfrom = '';
    let pulloutdate = '';
    let pullouttrf = '';
    let pulloutticket = '';
    let pulloutbrand = '';
    let pulloutitemtype = '';

    data.forEach((key, item) => {
      serial = key.pulloutserial;
      pulloutfrom = key.pulloutfrom;
      pulloutdate = key.pulloutdate;
      pulloutticket = key.pulloutticket;
      pullouttrf = key.pullouttrf;
      pulloutbrand = key.pulloutitembrand;
      pulloutitemtype = key.pulloutitemtype;

      sqldata.push([
        key.pulloutserial,
        key.pulloutitembrand,
        key.pulloutitemtype,
        key.pulloutfrom,
        key.pulloutby,
        key.pulloutdate,
        key.pulloutticket,
        key.pullouttrf
      ])
    });

    Insert_PulloutITEquipment = (data, callback) => {
      let sql = `INSERT INTO pullout_it_equipment(
        pie_serial,
        pie_brandname,
        pie_itemtype,
        pie_pulloutfrom,
        pie_pulloutby,
        pie_pulloutdate,
        pie_ticket,
        pie_trf) VALUES ?`

      callback(null, mysql.InsertMultiple(sql, data));
    }

    Update_TransactionITEquipment = (ticket, pulloutbrand, pulloutitemtype, pulloutserial, pulloutfrom, pulloutdate, callback) => {
      let sql = `UPDATE transaction_it_equipment  SET
      tie_pulloutbrand='${pulloutbrand}',
      tie_pulloutitemtype='${pulloutitemtype}',
      tie_pulloutserial='${pulloutserial}',
      tie_pulloutfrom= '${pulloutfrom}',
      tie_pulloutdate= '${pulloutdate}'
      WHERE tie_ticket='${ticket}'`;

      mysql.Update(sql, (err, result) => {
        if (err) callback(err, null);
        callback(null, result)
      });
    }

    helper.CreateFolder(targetFolder);
    helper.CreateJSON(filename, dataJson);

    await Insert_PulloutITEquipment(sqldata, (err, result) => {
      if (err) throw err;
      console.log('Insert_PulloutITEquipment');
    });

    await Update_TransactionITEquipment(pulloutticket, pulloutbrand, pulloutitemtype, serial, pulloutfrom, pulloutdate, (err, result) => {
      if (err) throw err;
      console.log('Update_TransactionITEquipment');
    })

    res.json({
      msg: 'success'
    })

  } catch (error) {
    res.json({
      msg: error
    })
  }
})