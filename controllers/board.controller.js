const BoardService = require('../services/board.service');
const { validationMiddleware } = require('../middlewares');
const { checkSchema, query } = require('express-validator');

/**
 * @swagger
 * paths:
 *   /board/{type}:
 *     get:
 *       tags: ['board']
 *       description: 타입별 게시판 조회
 *       summary: 타입별 게시판 조회
 *       operationId: type
 *       parameters:
 *       - name: type
 *         in: path
 *         description: 게시판 타입 (information / notice)
 *         required: true
 *         type: string
 *         example: information
 *       - name: limit
 *         in: query
 *         type: number
 *       - name: offset
 *         in: query
 *         type: number
 *       responses:
 *         200:
 *           description: board data
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   data:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Boards'
 */
exports.getBoardListByType = [
  checkSchema({
    type: {
      in: 'params',
      isIn: {
        options: [['information', 'notice']],
        errorMessage: 'Allowed type is [information, notice]',
      },
    },
  }),
  validationMiddleware,
  async (req, res, next) => {
    const { type } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    try {
      const board = await BoardService.getBoardListByType(type, +limit, +offset);

      return res.status(200).json({
        success: true,
        data: board,
      });
    } catch (error) {
      next(error);
    }
  },
];
