const AuthService = require('../services/auth.service');
const { validationMiddleware, authMiddleware } = require('../middlewares');
const { body } = require('express-validator');

/**
 * @swagger
 * paths:
 *   /auth/join:
 *     post:
 *       tags: ['auth']
 *       description: 사용자 회원가입을 위한 정보
 *       summary: 회원가입
 *       operationId: join
 *       requestBody:
 *         content:
 *           application/json:
 *             description: 사용자 회원가입을 위한 정보
 *             required: true
 *             schema:
 *               type: object
 *               required:
 *                 - email
 *                 - password
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: test@test.te
 *                 password:
 *                   type: string
 *                   example: password
 *                 displayName:
 *                   type: string
 *                   example: 테스터
 *                 gender:
 *                   type: string
 *                   enum:
 *                     - M
 *                     - F
 *                     - O
 *                   example: M
 *                 profileImagePath:
 *                   type: string
 *                   example: ''
 *       responses:
 *         200:
 *           description: successful operation
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
exports.join = [
  body('email').isEmail(),
  body('password').exists(),
  validationMiddleware,
  async (req, res, next) => {
    try {
      const user = await AuthService.join(req.body);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },
];

/**
 * @swagger
 * paths:
 *   /auth/login:
 *     post:
 *       tags: ['auth']
 *       description: 로그인
 *       summary: 로그인
 *       operationId: login
 *       requestBody:
 *         content:
 *           application/json:
 *             description: 사용자 로그인
 *             required: true
 *             type: object
 *             schema:
 *               type: object
 *               required:
 *                 - email
 *                 - password
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: test@test.te
 *                 password:
 *                   type: string
 *                   example: password
 *       responses:
 *         200:
 *           description: user data & jwt token
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
 *                       token:
 *                         type: string
 *                         format: jwt
 */
exports.login = [
  body('email').isEmail(),
  body('password').exists(),
  validationMiddleware,
  async (req, res, next) => {
    try {
      const { user, token } = await AuthService.login(req.body);
      res.status(200).json({ success: true, data: { user, token } });
    } catch (error) {
      next(error);
    }
  },
];

/**
 * @swagger
 * paths:
 *   /auth/verifyToken:
 *     post:
 *       security:
 *         - JWT: []
 *       tags: ['auth']
 *       description: verify token
 *       summary: verify token
 *       operationId: verifyToken
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
exports.verifyToken = [
  authMiddleware,
  async (req, res, next) => {
    const user = req.decoded;
    res.status(200).json({ success: true, data: { user } });
  },
];
