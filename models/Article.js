var mongoose = require('mongoose');
//Below code makes a Schema class
var Schema = mongoose.Schema;
//Below sets up the article schema
var ArticleSchema = new Schema({

    title: {
      type:String,
      required:true
    },
    link: {
      type:String,
      required:true
    },
    // note: [{
    //   type: Schema.Types.ObjectsId,
    //   ref: 'Note'
    // }]
});

//Create the Article model
var Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;