const mongoose = require("mongoose");
const { mappingConst } = require("../mapping");

const candidateObject = {};
for (s in mappingConst) {
  candidateObject[mappingConst[s].title] = mappingConst[s].type;
}

const CandidateSchema = new mongoose.Schema(candidateObject, {
  timestamps: true,
});

module.exports = mongoose.model("candidates", CandidateSchema);
