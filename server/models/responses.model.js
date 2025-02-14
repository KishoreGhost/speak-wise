const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  answers: { type: Map, of: mongoose.Schema.Types.Mixed, required: true },
  submittedAt: { type: Date, default: Date.now },
});

const Response = mongoose.model('responses', ResponseSchema);
module.exports = Response;
