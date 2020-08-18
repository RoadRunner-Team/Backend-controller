const ShopperService = require('../services/shopper.service');
const { validationMiddleware } = require('../middlewares');
const { query } = require('express-validator');
const { SHOPPER_ORDER_STATUS } = require('../models/shopperOrders');

/**
 * @swagger
 * paths:
 *   /shopper/orders:
 *     get:
 *       security:
 *         - JWT: []
 *       tags: ['shopper']
 *       description: shopper가 올린 order들을 조회 / shopperId 를 이용하여 선택적으로 리스트를 가져올 수 있다.
 *       summary: shopper가 올린 order들을 조회 / shopperId 를 이용하여 선택적으로 리스트를 가져올 수 있다.
 *       operationId: shopper-orders
 *       parameters:
 *       - name: shopperId
 *         in: query
 *         description: 조회할 shopper의 id 혹은 'me'
 *         type: string
 *         example: me
 *       - name: offset
 *         in: query
 *         description: 조회할 리스트의 시작 offset
 *         type: integer
 *         default: 0
 *       - name: limit
 *         in: query
 *         description: 조회할 리스트의 최대 개수
 *         type: integer
 *         default: 20
 *       responses:
 *         200:
 *           description: order list
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
 *                       totalCount:
 *                         type: integer
 *                         example: 1
 *                       orders:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/ShopperOrders'
 *                           properties:
 *                             shopperOrderRequests:
 *                               $ref: '#/components/schemas/ShopperOrderRequests'
 *                               properties:
 *                                 runner:
 *                                   $ref: '#/components/schemas/Users'
 *                             shopperOrderItems:
 *                               $ref: '#/components/schemas/ShopperOrderItems'
 *                             shopperOrderImages:
 *                               $ref: '#/components/schemas/ShopperOrderImages'
 */
// query 추가하여 query에 따라 request들도 포함하는 기능 및 필터 기능 필요
exports.getOrders = [
  query('offset').isInt().optional().toInt(),
  query('limit').isInt().optional().toInt(),
  query('shopperId').isString().optional(),
  query('status').isString().optional().isIn(SHOPPER_ORDER_STATUS),
  validationMiddleware,
  async (req, res, next) => {
    if (req.query.shopperId === 'me') req.query.shopperId = req.decoded.userId;

    try {
      const orders = await ShopperService.getOrders(req.query);

      return res.status(200).json({ success: true, data: orders });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
];

/**
 * @swagger
 * paths:
 *   /shopper/requests:
 *     get:
 *       security:
 *         - JWT: []
 *       tags: ['shopper']
 *       description: runner가 올린 order에 shopper가 요청한 리스트 조회
 *       summary: runner가 올린 order에 shopper가 요청한 리스트 조회
 *       operationId: shopper-requests
 *       parameters:
 *       - name: shopperId
 *         in: query
 *         description: 조회할 shopper의 id 혹은 'me'
 *         type: string
 *         example: me
 *       - name: requestStatus
 *         in: query
 *         description: 조회할 요청의 상태
 *         type: string
 *         enum: [REQUESTING, MATCHED, MATCH_FAIL, DELIVERED_REQUEST, DELIVERED, REVIEW_REQUEST, REVIEWED]
 *         example: REQUESTING
 *       - name: offset
 *         in: query
 *         description: 조회할 리스트의 시작 offset
 *         type: integer
 *         default: 0
 *       - name: limit
 *         in: query
 *         description: 조회할 리스트의 최대 개수
 *         type: integer
 *         default: 20
 *       responses:
 *         200:
 *           description: order list
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
 *                       totalCount:
 *                         type: integer
 *                         example: 1
 *                       orderRequests:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/ShopperOrderRequests'
 *                           properties:
 *                             runnerOrders:
 *                               $ref: '#/components/schemas/RunnerOrders'
 *                               properties:
 *                                 runner:
 *                                   $ref: '#/components/schemas/Users'
 */
// query 추가하여 query에 따라 request들도 포함하는 기능 및 필터 기능 필요
exports.getRequests = [
  query('offset').isInt().optional().toInt(),
  query('limit').isInt().optional().toInt(),
  query('shopperId').isString().optional(),
  query('requestStatus').isString().optional(),
  validationMiddleware,
  async (req, res, next) => {
    if (req.query.shopperId === 'me') req.query.shopperId = req.decoded.userId;

    try {
      const orders = await ShopperService.getRequests(req.query);

      return res.status(200).json({ success: true, data: orders });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
];

/**
 * @swagger
 * paths:
 *   /shopper/orders/{orderId}:
 *     get:
 *       security:
 *         - JWT: []
 *       tags: ['shopper']
 *       description: 특정 shopper의 특정 order 조회
 *       summary: 특정 shopper의 특정 order 조회
 *       operationId: shopper-orders-Id
 *       parameters:
 *       - name: orderId
 *         in: path
 *         description: orderId
 *         required: true
 *         type: integer
 *         example: 1
 *       responses:
 *         200:
 *           description: order data
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
 *                       order:
 *                         $ref: '#/components/schemas/ShopperOrders'
 *                         properties:
 *                           shopperOrderItems:
 *                             $ref: '#/components/schemas/ShopperOrderItems'
 *                           shopperOrderImages:
 *                             $ref: '#/components/schemas/ShopperOrderImages'
 *                           shopperOrderRequests:
 *                               $ref: '#/components/schemas/ShopperOrderRequests'
 *                               properties:
 *                                 runner:
 *                                   $ref: '#/components/schemas/Users'
 */
exports.getOrderById = async (req, res, next) => {
  const { orderId } = req.params;
  try {
    const order = await ShopperService.getOrderById(orderId);

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @swagger
 * paths:
 *   /shopper/orders:
 *     post:
 *       security:
 *         - JWT: []
 *       tags: ['shopper']
 *       description: 성
 *       summary: shopper의 orders 생성
 *       operationId: create-shopper-orders-Id
 *       requestBody:
 *         content:
 *           application/json:
 *             description:
 *             required: true
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: order request title
 *                 priority:
 *                   type: string
 *                   enum:
 *                     - FREE
 *                     - NORMAL
 *                     - URGENT
 *                   example: FREE
 *                 contents:
 *                   type: string
 *                   example: test contents
 *                 startReceiveTime:
 *                   type: string
 *                   format: time
 *                   example: '15:30:00'
 *                   description: 물품을 받을 수 있는 시간의 시작
 *                 endReceiveTime:
 *                   type: string
 *                   format: time
 *                   example: '18:00:00'
 *                   description: 물품을 받을 수 있는 시간의 끝
 *                 receiveAddress:
 *                   type: string
 *                   example: somewhere
 *                   description: 집
 *                 additionalMessage:
 *                   type: string
 *                   example: nothing
 *                 estimatedPrice:
 *                   type: integer
 *                   example: 15000
 *                   description: 물품들의 예상 총 가격
 *                 runnerTip:
 *                   type: integer
 *                   example: 1500
 *                   description: 러너 팁
 *                 orderItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: order item name
 *                       count:
 *                         type: integer
 *                         example: 2
 *                       price:
 *                         type: integer
 *                         example: 8000
 *                 orderImages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       filename:
 *                         type: string
 *                         example: image file name
 *                       size:
 *                         type: integer
 *                         example: 38756
 *                       path:
 *                         type: integer
 *                         example: /uploads/dog-1592044901355.jpg
 *       responses:
 *         200:
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
 *                       order:
 *                         $ref: '#/components/schemas/ShopperOrders'
 *                         properties:
 *                           shopperOrderItems:
 *                             $ref: '#/components/schemas/ShopperOrderItems'
 *                           shopperOrderImages:
 *                             $ref: '#/components/schemas/ShopperOrderImages'
 */
exports.createOrder = async (req, res, next) => {
  const shopperId = req.decoded.userId;
  const order = Object.assign({ shopperId }, req.body, req.params);
  try {
    const newOrder = await ShopperService.createOrder(order);

    return res.status(200).json({ success: true, data: newOrder });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @swagger
 * paths:
 *   /shopper/orders/{orderId}:
 *     delete:
 *       security:
 *         - JWT: []
 *       tags: ['shopper']
 *       description: 특정 order 삭제
 *       summary: 특정 order 삭제
 *       operationId: delete-shopper-orders-Id
 *       parameters:
 *       - name: orderId
 *         in: path
 *         description: orderId
 *         required: true
 *         type: integer
 *         example: 1
 *       responses:
 *         200:
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
exports.deleteOrder = async (req, res, next) => {
  const shopperId = req.decoded.userId;
  const { orderId } = req.params;
  try {
    const isDeleted = await ShopperService.deleteOrder(shopperId, orderId);

    return res.status(200).json({ success: true, data: { isDeleted } });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @swagger
 * paths:
 *   /shopper/orders/{orderId}/requests:
 *     post:
 *       security:
 *         - JWT: []
 *       tags: ['shopper']
 *       description: shopper의 order에 요청을 보냄
 *       summary: shopper의 order에 요청을 보냄
 *       operationId: create-shopper-orders-Id-requests
 *       parameters:
 *       - name: orderId
 *         in: path
 *         description: orderId
 *         required: true
 *         type: integer
 *         example: 1
 *       responses:
 *         200:
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
 *                       request:
 *                         $ref: '#/components/schemas/ShopperOrderRequests'
 *                         properties:
 *
 */
// TODO: 같은 주문 요청이 2개 이상 들어올 경우 예외처리 필요
exports.createOrderRequest = async (req, res, next) => {
  const { orderId } = req.params;
  const runnerId = req.decoded.userId;
  try {
    const request = await ShopperService.createOrderRequest(orderId, runnerId);

    return res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @swagger
 * paths:
 *   /shopper/orders/{orderId}/requests:
 *     get:
 *       security:
 *         - JWT: []
 *       tags: ['shopper']
 *       description: order에 요청된 리스트 조회
 *       summary: order에 요청된 리스트 조회
 *       operationId: get-shopper-orders-Id-requests
 *       parameters:
 *       - name: orderId
 *         in: path
 *         description: orderId
 *         required: true
 *         type: integer
 *         example: 1
 *       - name: offset
 *         in: query
 *         description: 조회할 리스트의 시작 offset
 *         type: integer
 *         default: 0
 *       - name: limit
 *         in: query
 *         description: 조회할 리스트의 최대 개수
 *         type: integer
 *         default: 20
 *       responses:
 *         200:
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
 *                       requests:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/ShopperOrderRequests'
 *                           properties:
 *                             runner:
 *                               $ref: '#/components/schemas/Users'
 */
exports.getOrderRequests = [
  query('offset').isInt().optional().toInt(),
  query('limit').isInt().optional().toInt(),
  validationMiddleware,
  async (req, res, next) => {
    const { orderId } = req.params;
    try {
      const requests = await ShopperService.getOrderRequests(orderId, req.query);

      return res.status(200).json({ success: true, data: requests });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
];

/**
 * @swagger
 * paths:
 *   /shopper/orders/requests/{requestId}:
 *     get:
 *       security:
 *         - JWT: []
 *       tags: ['shopper']
 *       description: order에 요청 중 특정 요청 조회
 *       summary: order에 요청 중 특정 요청 조회
 *       operationId: get-shopper-orders-requests-Id
 *       parameters:
 *       - name: requestId
 *         in: path
 *         description: requestId
 *         required: true
 *         type: integer
 *         example: 1
 *       responses:
 *         200:
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
 *                       request:
 *                         $ref: '#/components/schemas/ShopperOrderRequests'
 *                         properties:
 *                           runner:
 *                             $ref: '#/components/schemas/Users'
 */
exports.getOrderRequestById = async (req, res, next) => {
  const { requestId } = req.params;
  try {
    const request = await ShopperService.getOrderRequestById(requestId);

    return res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @swagger
 * paths:
 *   /shopper/orders/requests/{requestId}:
 *     put:
 *       security:
 *         - JWT: []
 *       tags: ['shopper']
 *       description: order의 현재 상태를 변경함
 *       summary: order의 현재 상태를 변경함
 *       operationId: update-shopper-order-requests-Id
 *       parameters:
 *       - name: requestId
 *         in: path
 *         description: requestId
 *         required: true
 *         type: integer
 *         example: 1
 *       requestBody:
 *         content:
 *           application/json:
 *             description:
 *             required: true
 *             schema:
 *               type: object
 *               properties:
 *                 requestStatus:
 *                   type: string
 *                   enum: [MATCHING, REQUESTING, MATCHED, MATCH_FAIL, DELIVERED_REQUEST, DELIVERED, REVIEW_REQUEST, REVIEWED]
 *                   example: MATCHED
 *       responses:
 *         200:
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   data:
 *                     type: object
 */
exports.updateOrderRequest = async (req, res, next) => {
  const request = Object.assign(req.body, req.params);
  try {
    await ShopperService.updateOrderRequest(request);

    return res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @swagger
 * paths:
 *   /shopper/orders/requests/{requestId}:
 *     delete:
 *       security:
 *         - JWT: []
 *       tags: ['shopper']
 *       description: 특정 request 삭제
 *       summary: 특정 request 삭제
 *       operationId: delete-shopper-order-requests-Id
 *       parameters:
 *       - name: requestId
 *         in: path
 *         description: requestId
 *         required: true
 *         type: integer
 *         example: 1
 *       responses:
 *         200:
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
exports.deleteOrderRequest = async (req, res, next) => {
  const request = Object.assign(req.body, req.params);
  try {
    const isDeleted = await ShopperService.deleteOrderRequest(request);

    return res.status(200).json({ success: true, data: { isDeleted } });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
