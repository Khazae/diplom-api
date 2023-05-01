const userService = require("../service/user-service");
const { validationResult } = require("express-validator");
const ApiError = require("../exceptions/api-error");

class UserController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(
          ApiError.BadRequest("Ошибка при валидации", errors.array())
        );
      }
      const { email, password } = req.body;
      const userData = await userService.registration(email, password);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await userService.login(email, password);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie("refreshToken");
      return res.json(token);
    } catch (e) {
      next(e);
    }
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link;
      await userService.activate(activationLink);
      return res.redirect(process.env.CLIENT_URL);
    } catch (e) {
      next(e);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await userService.refresh(refreshToken);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      return res.json(users);
    } catch (e) {
      next(e);
    }
  }

  async getGroups(req, res, next) {
    try {
      const groups = await userService.getAllGroups();
      return res.json(groups);
    } catch (e) {
      next(e);
    }
  }

  async createGroups(req, res, next) {
    try {
      const { name, startTime, endTime } = req.body;
      const groups = await userService.createGroups(name, startTime, endTime);
      return res.json(groups);
    } catch (e) {
      next(e);
    }
  }

  async deleteGroup(req, res, next) {
    try {
      const { id, lessonsId } = req.body;
      const result = await userService.deleteGroup(id, lessonsId);
      console.log(id);
      if (!result) {
        return res.status(404).json({ message: "Group not found" });
      }
      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async getGroupLesson(req, res, next) {
    try {
      const lessonId = req.params.id;
      const lessons = await userService.getGroupLesson(lessonId);
      return res.json(lessons);
    } catch (e) {
      next(e);
    }
  }

  async updateLessons(req, res, next) {
    try {
      const { id, day, lessons } = req.body;
      const lesson = await userService.updateLessons(id, day, lessons);
      if (!lesson) {
        return res.status(404).json({ message: "Group not found" });
      }
      return res.json(lesson);
    } catch (e) {
      next(e);
    }
  }

  async deleteLesson(req, res, next) {
    try {
      const { id, day, lessonIndex } = req.body;
      const lesson = await userService.deleteLesson(id, day, lessonIndex);
      if (!lesson) {
        return res.status(404).json({ message: "Group not found" });
      }
      return res.json(lesson);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new UserController();
