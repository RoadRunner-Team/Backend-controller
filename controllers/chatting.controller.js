const UserService = require('../services/user.service');
const ChattingService = require('../services/chatting.service');

const { validationMiddleware } = require('../middlewares');
const { body, query } = require('express-validator');

/**
 * @swagger
 * paths:
 *   /chatting/room:
 *     get:
 *       security:
 *         - JWT: []
 *       tags: ['chatting']
 *       description: 채팅룸 조회
 *       summary: 채팅룸 조회
 *       operationId: room
 *       parameters:
 *       - name: roomKey
 *         in: query
 *         description: roomKey
 *         required: true
 *         type: string
 *         example: 1-2-3
 *       responses:
 *         200:
 *           description: chattingRoom data
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
 *                       chattingRoom:
 *                         $ref: '#/components/schemas/ChattingRooms'
 *                       users:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Users'
 */
exports.room = [
  query('roomKey').exists(),
  validationMiddleware,
  async (req, res, next) => {
    try {
      const userId = req.decoded.userId;
      const roomKey = req.query.roomKey;

      const chattingRoom = await ChattingService.getRoomByRoomKey(roomKey, userId);
      const users = await UserService.getUserByIds(roomKey.split('-'));

      return res.json({ success: true, data: { chattingRoom, users } });
    } catch (error) {
      next(error);
    }
  },
];

/**
 * @swagger
 * paths:
 *   /chatting/joinRoom:
 *     post:
 *       security:
 *         - JWT: []
 *       tags: ['chatting']
 *       description: 채팅룸 생성
 *       summary: 채팅룸 생성
 *       operationId: joinRoom
 *       requestBody:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - userIds
 *               properties:
 *                 userIds:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example:
 *                     - 1
 *                     - 2
 *                     - 3
 *       responses:
 *         200:
 *           description: chattingRoom data
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
 *                       chattingRoom:
 *                         $ref: '#/components/schemas/ChattingRooms'
 *                       users:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Users'
 */
exports.joinRoom = [
  body('userIds')
    .custom(userIds => Array.isArray(userIds) && userIds.length > 0)
    .withMessage('userIds is Array & userIds is required'),
  validationMiddleware,
  async (req, res, next) => {
    try {
      const userId = req.decoded.userId;
      const userIds = req.body.userIds.map(userId => +userId).sort();
      if (userIds.indexOf(userId) === -1) userIds.push(userId);
      if (userIds.length < 2) throw new Error('CHATTING.INVALID_MEMBER');

      const roomKey = userIds.join('-');

      let chattingRoom = await ChattingService.getRoomByRoomKey(roomKey, userId);
      if (!chattingRoom) {
        const { isSame } = await UserService.getUserCountByIds(userIds);
        if (!isSame) throw new Error('CHATTING.INVALID_MEMBER');

        chattingRoom = await ChattingService.createRoom(userIds);
      }

      const users = await UserService.getUserByIds(userIds);

      return res.json({ success: true, data: { chattingRoom, users } });
    } catch (error) {
      next(error);
    }
  },
];

/**
 * @swagger
 * paths:
 *   /chatting/loadRoom:
 *     get:
 *       security:
 *         - JWT: []
 *       tags: ['chatting']
 *       description: 채팅방 목록 로드
 *       summary: 채팅방 목록 로드
 *       operationId: loadRoom
 *       parameters:
 *       - name: limit
 *         in: query
 *         type: number
 *         default: 30
 *         example: 30
 *       - name: offset
 *         in: query
 *         type: number
 *         default: 0
 *         example: 0
 *       responses:
 *         200:
 *           description: chattingRoom data, <Memo> users 정보는 array여야 함..
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
 *                       chattingMessage:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/ChattingMessages'
 *                           properties:
 *                             users:
 *                               $ref: '#/components/schemas/Users'
 */

exports.loadRoom = [
  async (req, res, next) => {
    try {
      const userId = req.decoded.userId;
      const { limit = 30, offset = 0 } = req.query;

      const chattingRooms = await ChattingService.loadRoom(userId, +limit, +offset);

      return res.json({ success: true, data: { chattingRooms } });
    } catch (error) {
      next(error);
    }
  },
];

/**
 * @swagger
 * paths:
 *   /chatting/loadMessage:
 *     get:
 *       security:
 *         - JWT: []
 *       tags: ['chatting']
 *       description: 채팅방 대화 로드
 *       summary: 채팅방 대화 로드
 *       operationId: loadMessage
 *       parameters:
 *       - name: roomKey
 *         in: query
 *         description: roomKey
 *         required: true
 *         type: string
 *         example: 1-2-3
 *       - name: limit
 *         in: query
 *         type: number
 *         default: 30
 *         example: 30
 *       - name: offset
 *         in: query
 *         type: number
 *         default: 0
 *         example: 0
 *       responses:
 *         200:
 *           description: chattingRoom data
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
 *                       chattingMessage:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/ChattingMessages'
 */
exports.loadMessage = [
  query('roomKey').exists(),
  validationMiddleware,
  async (req, res, next) => {
    const userId = req.decoded.userId;
    const { roomKey, limit = 30, offset = 0 } = req.query;

    try {
      let chattingRoom = await ChattingService.getRoomByRoomKey(roomKey, userId);

      if (!chattingRoom) throw new Error('CHATTING.INVALID_ROOMKEY');

      const chattingMessage = await ChattingService.loadMessage(
        chattingRoom.roomId,
        +limit,
        +offset,
      );

      return res.json({ success: true, data: { chattingMessage } });
    } catch (error) {
      next(error);
    }
  },
];

/**
 * @swagger
 * paths:
 *   /chatting/sendMessage:
 *     post:
 *       security:
 *         - JWT: []
 *       tags: ['chatting']
 *       description: 채팅방 대화 전송
 *       summary: 채팅방 대화 전송
 *       operationId: sendMessage
 *       requestBody:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - roomKey
 *                 - message
 *               properties:
 *                 roomKey:
 *                   type: string
 *                   example: 1-2-3
 *                 message:
 *                   type: string
 *                   example: 아무 메세지나 보내봅시다.
 *       responses:
 *         200:
 *           description: chattingRoom data
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
 *                       chattingMessage:
 *                         $ref: '#/components/schemas/ChattingMessages'
 */
exports.sendMessage = [
  body('roomKey').exists(),
  body('message').exists(),
  validationMiddleware,
  async (req, res, next) => {
    const userId = req.decoded.userId;
    const { message, roomKey, type } = req.body;

    try {
      const chattingRoom = await ChattingService.getRoomByRoomKey(roomKey, userId);
      if (!chattingRoom) throw new Error('CHATTING.INVALID_ROOMKEY');

      const chattingMessage = await ChattingService.createMessage(
        userId,
        message,
        chattingRoom.roomId,
        type,
      );

      req.io.sockets.in(roomKey).emit('message', chattingMessage.toJSON());

      return res.json({ success: true, data: { chattingMessage } });
    } catch (error) {
      next(error);
    }
  },
];
