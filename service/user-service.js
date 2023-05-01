const UserModel = require("../models/user-model");
const GroupModel = require("../models/groups-model");
const LessonModel = require("../models/lessons-model");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const mailService = require("./mail-service");
const tokenService = require("./token-service");
const UserDto = require("../dtos/user-dto");
const GroupsDto = require("../dtos/groups-dto");
const LessonDto = require("../dtos/lesson-dto");
const ApiError = require("../exceptions/api-error");

class UserService {
  async registration(email, password) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(
        `Пользователь с почтовым адресом ${email} уже существует`
      );
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuid.v4(); // v34fa-asfasf-142saf-sa-asf

    const user = await UserModel.create({
      email,
      password: hashPassword,
      activationLink,
    });
    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/activate/${activationLink}`
    );

    const userDto = new UserDto(user); // id, email, isActivated
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { auth: { ...tokens }, admin: userDto };
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest("Неккоректная ссылка активации");
    }
    user.isActivated = true;
    await user.save();
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest("Пользователь с таким email не найден");
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest("Неверный пароль");
    }
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { auth: { ...tokens }, admin: userDto };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }
    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { auth: { ...tokens }, admin: userDto };
  }

  async getAllUsers() {
    const users = await UserModel.find();
    return { data: users };
  }

  async getAllGroups() {
    const groups = await GroupModel.find();
    return groups;
  }

  async createGroups(name, startTime, endTime) {
    const uid = uuid.v4(); // v34fa-asfasf-142saf-sa-asf

    const lessonsId = uid.split("-").join("");

    const user = await GroupModel.create({
      name,
      startTime,
      endTime,
      lessonsId,
    });

    const lessons = await LessonModel.create({
      lessonsId,
      lessons: [
        {
          day: "Понедельник",
          lesson: [],
        },
        {
          day: "Вторник",
          lesson: [],
        },
        {
          day: "Среда",
          lesson: [],
        },
        {
          day: "Четверг",
          lesson: [],
        },
        {
          day: "Пятница",
          lesson: [],
        },
      ],
    });

    const userDto = new GroupsDto(user);

    return { data: userDto };
  }

  async deleteGroup(id, lessonsId) {
    const group = await GroupModel.findById(id);
    const lesson = await LessonModel.findOne({ lessonsId: lessonsId });
    if (!group) {
      return null; // группа не найдена
    }
    await group.remove(); // удаление группы
    await lesson.remove();
    return { message: "Group deleted successfully" };
  }

  async getGroupLesson(id) {
    const lessons = await LessonModel.findOne({ lessonsId: id });
    const LessonsDto = new LessonDto(lessons);
    return [LessonsDto];
  }

  async updateLessons(id, day, lessons) {
    // Находим уроки по id
    const lessonsToUpdate = await LessonModel.findOne({ lessonsId: id });

    if (!lessonsToUpdate) {
      return { message: "Уроки не найдены" };
    }

    // Обновляем уроки для определенного дня
    const updatedLessons = lessonsToUpdate.lessons.map((lesson) => {
      if (lesson.day === day) {
        return { day, lesson: lessons };
      } else {
        return lesson;
      }
    });

    // Сохраняем обновленные уроки
    lessonsToUpdate.lessons = updatedLessons;
    await lessonsToUpdate.save();

    const lessonsDto = new LessonDto(lessonsToUpdate);

    return { data: lessonsDto };
  }

  async deleteLesson(id, day, lessonIndex) {
    // Находим уроки по id
    const lessonsToUpdate = await LessonModel.findOne({ lessonsId: id });

    // Находим урок для определенного дня
    const lessonToDelete = lessonsToUpdate.lessons.find(
      (lesson) => lesson.day === day
    );

    if (!lessonToDelete) {
      return { message: "Урок не найден" };
    }

    // Удаляем урок по индексу
    if (lessonIndex !== "") {
      lessonToDelete.lesson.splice(lessonIndex, 1);
    } else {
      lessonToDelete.lesson = [];
    }

    // Сохраняем обновленные уроки
    await lessonsToUpdate.save();

    const lessonsDto = new LessonDto(lessonsToUpdate);

    return { data: lessonsDto };
  }
}

module.exports = new UserService();
