var config = require("./config.js")
var express = require("express")
var bodyParser = require('body-parser');
var request = require('request');
var fs = require('fs')
let api_key = config.api_key
let app = express()
let port = 3000

const filename = "data.json"

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "pug")

app.get("/search", (req, res)=>{
	res.render("homepage",{
		pageType:"initial"
	})
})
app.post("/search", (req, res)=>{
	//hit the google api now
	search_this = req.body.tosearch
	var url = `https://www.googleapis.com/customsearch/v1?key=${api_key}&cx=017576662512468239146:omuauf_lfve&q=${search_this}`
	request(url, function (err, response, body) {
		if(err) {
			res.render("homepage",{
				pageType:"error"
			})
		}
		else{
			body_json = JSON.parse(body)
			if(body_json["items"] != null){
				results = body_json["items"]
				if (body_json["items"].length > 5){
					results = body_json["items"].slice(0, 5);
				}
				res.render("homepage", {
					pageType:"searched", 
					tosearch: req.body.tosearch,
					res: results
				})
			}else{
				res.render("homepage", {
					pageType:"no_res"
				})
			}


		}
	})
})



app.get("/login", (req, res)=>{
	res.render("login", {
		err: false
	})
})

app.post("/login", (req, res)=>{
	username = req.body.username
	password = req.body.password

	if(fs.existsSync(filename)){
		fs.readFile(filename, 'utf8', function(err, obj_data){
			if(err){
				console.log(err)
				res.render("login", {
					err: true
				})
			} else {
				obj = JSON.parse(obj_data)
				if (username in obj){
					if (obj[username] == password){
						res.redirect("/search")
					}
					else{
						console.log("wrong username, password combo")
						res.render("login", {
							err: true
						})
					}
				}
				else{
					console.log("username wrong")
					res.render("login", {
						err: true
					})
				}
			}
		})
	}
	else{
		console.log("no users")
		res.render("login", {
			err: true
		})
	}
})
app.post("/register", (req, res)=>{
	username = req.body.username
	password = req.body.password
	if (fs.existsSync(filename)){
		fs.readFile(filename, 'utf8', function(err, obj_data){
			obj = JSON.parse(obj_data)
			obj[username] = password
			var to_write = JSON.stringify(obj)
			fs.writeFile(filename, to_write, 'utf8', function(err){
					if (err) throw err
			});	
		})
	}
	else{
		data = {}
		data[username] = password
		var json = JSON.stringify(data)
		fs.writeFile(filename, json, 'utf8', function(err){
			if (err) throw err
			console.log('saved')
		});
	}

	res.redirect("/search")
})


app.listen(port)
console.log("Listening to port " + port)