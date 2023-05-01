module.exports = class LessonDto {
  id;
  lessonsId;
  lessons;

  constructor(model) {
    this.lessonsId = model.lessonsId;
    this.id = model._id;
    this.lessons = model.lessons;
  }
};
