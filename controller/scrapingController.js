const Xray =   require('x-ray');
const x = Xray();
 
const axios = require("axios");
const request = require('request');
const async = require('async');


const json2csv = require('json2csv');
const  csv = require('express-csv')

const fs = require("fs")
 
 
module.exports = new class {
 
    getidshop(req,res){
        x("https://www.tokopedia.com/"+req.params.shopname,{
            title : 'title',
            idshop  :'#shop-id@value',
        })(function(err,obj){
                res.status(200);
                res.json({
                    code :"200",
                     results :obj
                })
        })
    }
 
 
    allproducts(req,res){
         axios.get("https://ace.tokopedia.com/search/v2.6/product?shop_id="+req.params.shopid+"&ob=11&rows=80&start=80&full_domain=www.tokopedia.com&scheme=https&device=desktop&source=shop_product")
            .then(function (response) {
                res.json({
                    code: "200",
                  results:  response.data.header
                })
            })
    }
 
    getallproducts(req,res,next){
        let id  = req.params.shopid
        let pages =  req.params.pages;
        let _request  = []
 
        for (let i = 0 ;i < pages ; i++){
           _request.push(
               axios.get("https://ace.tokopedia.com/search/v2.6/product?shop_id="+id+"&ob=11&rows="+( (i+1) * 80 )+"&start="+(i*80)+"&full_domain=www.tokopedia.com&scheme=https&device=desktop&source=shop_product")
               )
        }
 
        axios.all(_request)
        .then((response)=>{
           
             req.headers.all_product = response.map((data)=>{
                    return data.data
             }) ;
             next();
 
        })
    }
           
   
    listproducresponse(req,res){
        let data =  req.headers.all_product
        let datax = []
        data =  data.map((_data)=>{
             return  _data.data.map((__data)=>{
                return __data
            })
        })
 
        for (let i=0 ;i< data.length;i++){
            datax = datax.concat(data[i])
        }
        res.json({
            code :"200",
            results : datax
        })
    }
 
   
    responseproductdetail(req,res){
        res.json({
            code:"200",
            results :req.headers.productdetails
        })
 
    }
 
    productdetail(req,res,next){
        let  alluri = req.body.data
        alluri =  alluri.map((data)=>{
            return data.uri
        })
        
        const scrape = (uri,callback) => {
            x(uri,{
            title : '.product-title@text',
            idshop  :'#shop-id@value',
            price  : "span[itemprop='price']",
            detail : "p[itemprop='description']",
            berat  : ".detail-info@text",
            gambar  :"img[itemprop='image']@src",
            category  : ".product-navetalase a@text"
            })(function(err,obj){
                    obj.berat = obj.berat.replace(/\s/g,'')
                    obj.berat = obj.berat.slice(parseInt(obj.berat.lastIndexOf("Berat") + 5) ,obj.berat.lastIndexOf("Terjual") -2)
                    obj.detail = obj.detail.replace(/\W+/g, " ")
                    obj.price = obj.price.replace(/\./g,'')

                    callback(null,obj)
            })
        }
        async.map(alluri, scrape, function(err, results) {

            res.json({
                code :"200",
                results : results
            })

        })
        }


        productdetailcsv(req,res){
            let fields =  ["title","idshop","price","detail","berat","gambar"]
            let  data = req.body.data
            let result  =  json2csv({ data: data, fields: fields })
            fs.writeFile('./public/data.csv', result, function(err) {
                if (err) throw err;
                 res.json({
                     code :201
                 })
             });
        }
}


