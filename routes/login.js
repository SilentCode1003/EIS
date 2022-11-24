var express = require('express');
const session = require('express-session');
var router = express.Router();

var helper = require('./repository/customhelper')
var UserPath = `${__dirname}/data/masters/users/`;
const crypt = require('./repository/crytography');

/* GET home page. */
router.get('/', function (req, res) {

  console.log(req.session);
  res.render('login', {
    title: 'Budget Monitoring System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype
  });
});

module.exports = router;

router.post('/authentication', (req, res) => {
  try {
    var username = req.body.username;
    var password = req.body.password;
    var files = helper.GetFiles(UserPath);
    var message = "";

    console.log(`USERNAME: ${username}`)

    message = "error";
    files.forEach(file => {

      var filename = `${UserPath}/${file}`;
      var data = helper.ReadJSONFile(filename);

      data.forEach((key, item) => {

        if (key.username == username) {
          message = 'success';

          console.log(`user:${key.username} password:${key.password}`);

          crypt.Decrypter(key.password, (err, result) => {
            if (err) throw err;

            console.log(result);
          })

          crypt.Encrypter(password, (err, result) => {
            if (err) console.log(err);

            console.log(result);

            if (key.password == result) {
              req.session.isAuth = true;
              req.session.username = key.username;
              req.session.accounttype = key.accounttype;
              req.session.fullname = key.fullname;
            }
            else {
              message = 'error';
            }
          });

        }
      })
    })
    console.log(message);

    if (message == "success") {
      res.json({
        msg: message
      });
    }

    if (message == "error") {
      res.json({
        msg: 'error'
      });
    }


  } catch (error) {
    res, json({
      msg: error
    })
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {

      res.json({
        msg: err
      });

    }

    res.json({
      msg: "success"
    })
  });

});
