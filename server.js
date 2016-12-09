var express = require('express');
var handleBars =  require('handleBars');
var exphbs = require('express-handlebars');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cheerio = require('cheerio');
var request = require('request');
var morgan = require('morgan');
var request = require('request');

// use morgan and bodyparser with our app
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

// make public a static dir
app.use(express.static('public'));

//set view engine handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


// Database configuration with mongoose
mongoose.connect('mongodb://localhost/news_scraper');
var db = mongoose.connection;

// show any mongoose errors
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

// once logged in to the db through mongoose, log a success message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});


// And we bring in our Note and Article models
var Note = require('./models/Note.js');
var Article = require('./models/Article.js');


// Routes
// ======

// Simple index route
app.get('/', function(req, res) {
  // res.send(index.html);

  res.redirect('/scrape');
});

// A GET request to scrape the abcnews website.
app.get('/scrape', function(req, res) {

  // first, we grab the body of the html with request
  request('http://www.abcnews.go.com/', function(error, response, html) {
    // then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    console.log('line 54');

    var titles = [];
    // now, we grab every h2 within an article tag, and do the following:
    
    $('li.story div h1 a').each(function() {
        // li h1
        // save an empty result object
        var result = {};
         // add the text and href of every link, 
        // and save them as properties of the result obj
        result.title = $(this).text().trim();

        result.link = $(this).attr('href');
       
        console.log(result);

        //code below checks to make sure the article is not already in the db.
        //After a scrape it pushes the titles to the array 'titles'. 
        //The indexOf property is used to see if the title (result.title) exists anywhere in the array.
        //If it exists the title is set to true and fails the conditional logic
        if(titles.indexOf(result.title) == true){

          titles.push(result.title);

          Article.count({title: result.title}, function(err, newArt){
            if(newArt == false){
              var entry = new Article(result);
                entry.save(function(err, doc){
            if(err){
            console.log(err);
            }
            else{
            console.log(doc);
          }
        });

            }
          })

        // var entry = new Article(result);

        // entry.save(function(err, doc){
        //   if(err){
        //     console.log(err);
        //   }
        //   else {
        //     console.log(doc);
        //   }
        // });



      };
        // using our Article model, create a new entry.
        // Notice the (result):
        // This effectively passes the result object to the entry (and the title and link)
        // // now, save that entry to the db
    });
  });
  // tell the browser that we finished scraping the text.
  // res.send("Scrape Complete");
  // res.render('main.handlebars');
  res.redirect('/articles');
});

// this will get the articles we scraped from the mongoDB
// app.get('/articles', function(req, res){
//   // grab every doc in the Articles array
//   Article.find({}, function(err, doc){
//     // log any errors
//     if (err){
//       console.log(err);
//     } 
//     // or send the doc to the browser as a json object
//     else {
//       res.json(doc);
//     }
//   });
// });

app.get('/articles', function(req, res){

  Article.find().sort({_id: -1})

  .exec(function(err, doc){
    if(err){
      console.log(err);
    }
    else{
      var hbsObject={articles: doc}
      res.render('index', hbsObject);
    }
  })
})

// grab an article by it's ObjectId
app.get('/articles/:id', function(req, res){
  // using the id passed in the id parameter, 
  // prepare a query that finds the matching one in our db...
  Article.findOne({'_id': req.params.id})
  // and populate all of the notes associated with it.
  .populate('note')
  // now, execute our query
  .exec(function(err, doc){
    // log any errors
    if (err){
      console.log(err);
    } 
    // otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});


// replace the existing note of an article with a new one
// or if no note exists for an article, make the posted note it's note.
app.post('/articles/:id', function(req, res){
  // create a new note and pass the req.body to the entry.
  var newNote = new Note(req.body);

  // and save the new note the db
  newNote.save(function(err, doc){
    // log any errors
    if(err){
      console.log(err);
    } 
    // otherwise
    else {
      // using the Article id passed in the id parameter of our url, 
      // prepare a query that finds the matching Article in our db
      // and update it to make it's lone note the one we just saved
      Article.findOneAndUpdate({'_id': req.params.id}, {'note':doc._id})
      // execute the above query
      .exec(function(err, doc){
        // log any errors
        if (err){
          console.log(err);
        } else {
          // or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});







// listen on port 3000
app.listen(3000, function() {
  console.log('App running on port 3000!');
});
