const { Schema, model } = require("mongoose");

const LessonSchema = new Schema({
  day: { type: String, required: false },
  lesson: { type: Array, required: false },
});

const LessonsSchema = new Schema({
  lessonsId: { type: String, required: true },
  lessons: [LessonSchema],
});

module.exports = model("Lessons", LessonsSchema);
