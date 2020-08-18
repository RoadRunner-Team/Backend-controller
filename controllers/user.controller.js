const bcrypt = require('bcrypt');
const UserService = require('../services/user.service');
const { validationMiddleware } = require('../middlewares');
const { body } = require('express-validator');

/**
 * @swagger
 * paths:
 *   /user/{userId}:
 *     get:
 *       tags: ['user']
 *       description: 유저 정보 조회
 *       summary: 유저 정보 조회
 *       operationId: getUserByUserId
 *       parameters:
 *       - name: userId
 *         in: path
 *         description: 유저 정보 조회
 *         required: true
 *         type: number
 *         example: 1
 *       responses:
 *         200:
 *           description: user data
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   data:
 *                     type: object
 *                     properties:
 *                       user:
 *                         $ref: '#/components/schemas/Users'
 */
exports.getUser = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await UserService.getUserById(userId);

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * paths:
 *   /user:
 *     put:
 *       security:
 *         - JWT: []
 *       tags: ['user']
 *       description: 유저 정보 업데이트
 *       summary: 유저 정보 업데이트
 *       operationId: updateUser
 *       requestBody:
 *         content:
 *           application/json:
 *             description: 유저 정보 업데이트
 *             required: true
 *             schema:
 *               type: object
 *               properties:
 *                 displayName:
 *                   type: string
 *                   example: 테스터
 *                 address:
 *                   type: string
 *                   example: 주소
 *                 addressDetail:
 *                   type: string
 *                   example: 상세 주소
 *                 gender:
 *                   type: string
 *                   enum:
 *                     - M
 *                     - F
 *                     - O
 *                   example: F
 *                 profileImagePath:
 *                   type: string
 *                 possibleDistance:
 *                   type: string
 *                   example: 100m
 *                 contactTime:
 *                   type: string
 *                   example: 오후 3시 ~ 오후 8시
 *                 payments:
 *                   type: string
 *                   example: 통장
 *       responses:
 *         200:
 *           description: user data
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   data:
 *                     type: object
 *                     properties:
 *                       user:
 *                         $ref: '#/components/schemas/Users'
 */
exports.updateUser = async (req, res, next) => {
  const userId = req.decoded.userId;
  const user = req.body;
  user.userId = userId;

  try {
    await UserService.updateUser(user);
    const updatedUser = await UserService.getUserById(userId);

    res.status(200).json({ success: true, data: { user: updatedUser } });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * paths:
 *   /user/password:
 *     put:
 *       security:
 *         - JWT: []
 *       tags: ['user']
 *       description: 유저 비밀번호 업데이트
 *       summary: 유저 비밀번호 업데이트
 *       operationId: updateUserPassword
 *       requestBody:
 *         content:
 *           application/json:
 *             description: 유저 비밀번호 업데이트
 *             required: true
 *             schema:
 *               type: object
 *               required:
 *                 - password
 *                 - newPassword
 *               properties:
 *                 password:
 *                   type: string
 *                   description: 현재 비밀번호
 *                   example: password
 *                 newPassword:
 *                   type: string
 *                   description: 변경할 비밀번호
 *                   example: password
 *       responses:
 *         200:
 *           description: user data
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   data:
 *                     type: object
 *                     properties:
 *                       user:
 *                         $ref: '#/components/schemas/Users'
 */
exports.updateUserPassword = [
  body('password').exists(),
  body('newPassword').exists(),
  validationMiddleware,
  async (req, res, next) => {
    const userId = req.decoded.userId;
    const { password, newPassword } = req.body;

    try {
      const user = await UserService.getUserByIdWithPassword(userId);
      const checkPassword = await bcrypt.compare(password, user.password);
      if (!checkPassword) throw new Error('AUTH.PASSWORD_INCORRECT');

      const hashPassword = await bcrypt.hash(newPassword, 12);
      await UserService.updateUserPassword(userId, hashPassword);

      res.status(200).json({ success: true, data: {} });
    } catch (error) {
      next(error);
    }
  },
];

/**
 * @swagger
 * paths:
 *   /user:
 *     delete:
 *       security:
 *         - JWT: []
 *       tags: ['user']
 *       description: 로그인 유저 탈퇴 - 탈퇴된 회원은 이메일에 '_@SOK53ffvaT' 와 같은 _@로 시작하는 10글자의 랜덤 값이 붙음
 *       summary: 로그인 유저 탈퇴
 *       operationId: deleteUserByUserId
 *       responses:
 *         200:
 *           description: user data
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   data:
 *                     type: object
 *                     properties:
 *                       isDeleted:
 *                         type: boolean
 */
exports.deleteUser = async (req, res, next) => {
  const userId = req.decoded.userId;

  try {
    const user = await UserService.getUserById(userId);
    if (!user) throw new Error('USER.USER_NOT_FOUND');

    const isDeleted = await UserService.deleteUserById(userId);

    res.status(200).json({ success: true, data: { isDeleted } });
  } catch (error) {
    next(error);
  }
};
