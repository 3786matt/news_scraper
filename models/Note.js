var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
    posterName: {
      type:String
    },
    comment: {
      type:String
    }
});

var Note = mongoose.model('Note', NoteSchema);

module.exports = Note;