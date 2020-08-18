const RunnerService = require('../services/runner.service');
const { validationMiddleware } = require('../middlewares');
const { query } = require('express-validator');

/**
 * @swagger
 * paths:
 *   /runner/orders:
 *     get:
 *       security:
 *         - JWT: []
 *       tags: ['runner']
 *       description: runner가 올린 orders 리스트 조회 / runnerId 를 이용하여 선택적으로 리스트를 가져올 수 있다.
 *       summary: runner가 올린 orders 리스트 조회 / runnerId 를 이용하여 선택적으로 리스트를 가져올 수 있다.
 *       operationId: runner-orders
 *       parameters:
 *       - name: runnerId
 *         in: query
 *         description: runnerId를 me로 보내면 자신의 정보를 조회할 수 있다.
 *         type: integer | string
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
 *           description: order list by runnerId
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
 *                       orders:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/RunnerOrders'
 *                       totalCount:
 *                         type: integer
 *                         example: 1
 */
// query 추가하여 query에 따라 request들도 포함하는 기능 및 필터 기능 필요
exports.getOrders = [
  query('offset').isInt().optional().toInt(),
  query('limit').isInt().optional().toInt(),
  query('runnerId').isString().optional(),
  validationMiddleware,
  async (req, res, next) => {
    if (req.query.runnerId === 'me') req.query.runnerId = req.decoded.userId;

    try {
      const orders = await RunnerService.getOrders(req.query);

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
 *   /runner/requests:
 *     get:
 *       security:
 *         - JWT: []
 *       tags: ['runner']
 *       description: shopper가 올린 order에 요청한 리스트 조회
 *       summary: shopper가 올린 order에 요청한 리스트 조회
 *       operationId: runner-requests
 *       parameters:
 *       - name: runnerId
 *         in: query
 *         description: runnerId를 me로 보내면 자신의 정보를 조회할 수 있다.
 *         type: integer | string
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
 *           description: order list by runnerId
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
 *                       orderRequests:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/ShopperOrderRequests'
 *                           properties:
 *                             shopperOrder:
 *                               $ref: '#/components/schemas/ShopperOrders'
 *                               properties:
 *                                 shopperOrderItems:
 *                                   $ref: '#/components/schemas/ShopperOrderItems'
 *                                 shopperOrderImages:
 *                                   $ref: '#/components/schemas/ShopperOrderImages'
 *                       totalCount:
 *                         type: integer
 *                         example: 1
 */
// query 추가하여 query에 따라 request들도 포함하는 기능 및 필터 기능 필요
exports.getRequests = [
  query('offset').isInt().optional().toInt(),
  query('limit').isInt().optional().toInt(),
  query('runnerId').isString().optional(),
  query('requestStatus').isString().optional(),
  validationMiddleware,
  async (req, res, next) => {
    if (req.query.runnerId === 'me') req.query.runnerId = req.decoded.userId;

    try {
      const orders = await RunnerService.getRequests(req.query);

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
 *   /runner/orders/{orderId}:
 *     get:
 *       security:
 *         - JWT: []
 *       tags: ['runner']
 *       description: 특정 orders 조회
 *       summary: 특정 orders 조회
 *       operationId: runner-orders-Id
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
 *                       order:
 *                         $ref: '#/components/schemas/RunnerOrders'
 *                       requests:
 *                         type: array
 *                         items:
 *                           properties:
 *                             shopper:
 *                               type: object
 *                               $ref: '#/components/schemas/Users'
 *                             shopperOrders:
 *                               type: object
 *                               $ref: '#/components/schemas/ShopperOrders'
 *                               properties:
 *                                 shopperOrderItems:
 *                                   $ref: '#/components/schemas/ShopperOrderItems'
 *                                 shopperOrderImages:
 *                                   $ref: '#/components/schemas/ShopperOrderImages'
 */
exports.getOrderById = async (req, res, next) => {
  const { orderId } = req.params;
  try {
    const order = await RunnerService.getOrderById(orderId);

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @swagger
 * paths:
 *   /runner/orders:
 *     post:
 *       security:
 *         - JWT: []
 *       tags: ['runner']
 *       description: 자신의 orders 생성
 *       summary: 자신의 orders 생성
 *       operationId: create-runner-orders-Id
 *       requestBody:
 *         content:
 *           application/json:
 *             description:
 *             required: true
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 estimatedTime:
 *                   type: string
 *                   example: 오후 1시
 *                 introduce:
 *                   type: string
 *                   example: introduce :)
 *                 distance:
 *                   type: string
 *                   example: 100M
 *                   enum:
 *                     - 100M
 *                     - 250M
 *                     - 500M
 *                     - 1KM
 *                     - 1.5KM
 *                     - 2.5KM
 *                     - 5KM
 *                     - 10KM
 *                 address:
 *                   type: string
 *                   description: 활동지역 주소
 *                   example: My home
 *                 startContactableTime:
 *                   type: string
 *                   format: time
 *                   description: 연락 가능한 시간의 시작
 *                   example: '15:30:00'
 *                 endContactableTime:
 *                   type: string
 *                   format: time
 *                   description: 연락 가능한 시간의 끝
 *                   example: '18:00:00'
 *                 additionalMessage:
 *                   type: string
 *                   example: 추가 메세지를 적어주세요.
 *                 payments:
 *                   type: string
 *                   description: 신용카드, 통장 등 정보 저장
 *                   example: 신용카드
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
 *                         $ref: '#/components/schemas/RunnerOrders'
 */
exports.createOrder = async (req, res, next) => {
  const runnerId = req.decoded.userId;
  const order = Object.assign({ runnerId }, req.body, req.params);
  try {
    const newOrder = await RunnerService.createOrder(order);

    return res.status(200).json({ success: true, data: newOrder });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @swagger
 * paths:
 *   /runner/orders/{orderId}:
 *     delete:
 *       security:
 *         - JWT: []
 *       tags: ['runner']
 *       description: 자신의 특정 orders 삭제
 *       summary: 자신의 특정 orders 삭제
 *       operationId: delete-runner-orders-Id
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
  const runnerId = req.decoded.userId;
  const { orderId } = req.params;
  try {
    const isDeleted = await RunnerService.deleteOrder(runnerId, orderId);

    return res.status(200).json({ success: true, data: { isDeleted } });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @swagger
 * paths:
 *   /runner/orders/{orderId}/requests:
 *     post:
 *       security:
 *         - JWT: []
 *       tags: ['runner']
 *       description: shopper가 runner order에 요청을 보냄
 *       summary: shopper가 runner order에 요청을 보냄
 *       operationId: create-runner-orders-Id-requests
 *       parameters:
 *       - name: orderId
 *         in: path
 *         description: orderId
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
 *                   description: 전달할 주소
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
 *                       request:
 *                         $ref: '#/components/schemas/RunnerOrders'
 *                         properties:
 *
 */
// TODO: 같은 주문 요청이 2개 이상 들어올 경우 예외처리 필요
exports.createOrderRequest = async (req, res, next) => {
  const shopperId = req.decoded.userId;
  const shopperOrder = Object.assign({ shopperId }, req.body, req.params);
  try {
    const request = await RunnerService.createOrderRequest(shopperOrder);

    return res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @swagger
 * paths:
 *   /runner/orders/{orderId}/requests:
 *     get:
 *       security:
 *         - JWT: []
 *       tags: ['runner']
 *       description: order에 shopper가 요청한 리스트 조회
 *       summary: order에 shopper가 요청한 리스트 조회
 *       operationId: get-runner-orders-Id-requests
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
 *                           $ref: '#/components/schemas/RunnerOrderRequests'
 *                           properties:
 *                             shopper:
 *                               $ref: '#/components/schemas/Users'
 *                             shopperOrder:
 *                               $ref: '#/components/schemas/ShopperOrders'
 *                               properties:
 *                                 shopperOrderItems:
 *                                   $ref: '#/components/schemas/ShopperOrderItems'
 *                                 shopperOrderImages:
 *                                   $ref: '#/components/schemas/ShopperOrderImages'
 */
exports.getOrderRequests = [
  query('offset').isInt().optional().toInt(),
  query('limit').isInt().optional().toInt(),
  validationMiddleware,
  async (req, res, next) => {
    const { orderId } = req.params;
    try {
      const requests = await RunnerService.getOrderRequests(orderId, req.query);

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
 *   /runner/orders/requests/{requestId}:
 *     get:
 *       security:
 *         - JWT: []
 *       tags: ['runner']
 *       description: order에 요청한 특정 request 조회
 *       summary: order에 요청한 특정 request 조회
 *       operationId: get-runner-orders-requests-Id
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
 *                         $ref: '#/components/schemas/RunnerOrderRequests'
 *                         properties:
 *                           shopper:
 *                             $ref: '#/components/schemas/Users'
 *                           shopperOrder:
 *                             $ref: '#/components/schemas/ShopperOrders'
 *                             properties:
 *                               shopperOrderItems:
 *                                 $ref: '#/components/schemas/ShopperOrderItems'
 *                               shopperOrderImages:
 *                                 $ref: '#/components/schemas/ShopperOrderImages'
 */
exports.getOrderRequestById = async (req, res, next) => {
  const { requestId } = req.params;
  try {
    const request = await RunnerService.getOrderRequestById(requestId);

    return res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @swagger
 * paths:
 *   /runner/orders/requests/{requestId}:
 *     put:
 *       security:
 *         - JWT: []
 *       tags: ['runner']
 *       description: request의 현재 상태를 변경함
 *       summary: request의 현재 상태를 변경함
 *       operationId: update-runner-order-requests-Id
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
 *                   enum:
 *                     - MATCHED
 *                     - MATCH_FAIL
 *                     - DELIVERED
 *                     - REVIEWED
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
    await RunnerService.updateOrderRequest(request);

    return res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @swagger
 * paths:
 *   /runner/orders/requests/{requestId}:
 *     delete:
 *       security:
 *         - JWT: []
 *       tags: ['runner']
 *       description: 특정 request 삭제
 *       summary: 특정 request 삭제
 *       operationId: delete-runner-order-requests-Id
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
 *
 */
exports.deleteOrderRequest = async (req, res, next) => {
  const request = Object.assign(req.body, req.params);
  try {
    const isDeleted = await RunnerService.deleteOrderRequest(request);

    return res.status(200).json({ success: true, data: { isDeleted } });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
