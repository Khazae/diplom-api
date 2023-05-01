module.exports = class GroupsDto {
  name;
  id;
  startTime;
  endTime;

  constructor(model) {
    this.name = model.name;
    this.id = model._id;
    this.startTime = model.startTime;
    this.endTime = model.endTime;
  }
};
