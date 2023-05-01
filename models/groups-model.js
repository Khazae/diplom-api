const { Schema, model } = require("mongoose");

const GroupSchema = new Schema({
  name: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  lessonsId: { type: String, required: true },
});

module.exports = model("Group", GroupSchema);
