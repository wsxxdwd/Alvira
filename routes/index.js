var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '假装玩贪吃蛇&插♂花' });
});
module.exports = router;
