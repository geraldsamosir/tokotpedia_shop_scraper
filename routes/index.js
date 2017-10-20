var express = require('express');
var router = express.Router();

const  scrapingController =  require("../controller/scrapingController")

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


//get all with all  pagination return url toko
router.get("/shop/:shopname",scrapingController.getidshop)


router.get("/products/:shopid",scrapingController.allproducts)


router.get("/products/all/:shopid/:pages",scrapingController.getallproducts,scrapingController.listproducresponse)




//get product detail
router.post("/product/",scrapingController.productdetail,scrapingController.responseproductdetail)



module.exports = router;
