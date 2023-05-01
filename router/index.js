const Router = require("express").Router;
const userController = require("../controllers/user-controller");
const router = new Router();
const { body } = require("express-validator");
const authMiddleware = require("../middlewares/auth-middleware");

router.post(
  "/registration",
  body("email").isEmail(),
  body("password").isLength({ min: 3, max: 32 }),
  userController.registration
);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/activate/:link", userController.activate);
router.get("/refresh", userController.refresh);
router.get("/users", authMiddleware, userController.getUsers);
router.get("/groups", userController.getGroups);
router.post("/groups", userController.createGroups);
router.delete("/groups", userController.deleteGroup);
router.get("/groups/:id", userController.getGroupLesson);
router.post("/lessons", userController.updateLessons);
router.delete("/lessons", userController.deleteLesson);

module.exports = router;
