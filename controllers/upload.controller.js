const multer = require('multer');
const path = require('path');

const { validationMiddleware } = require('../middlewares');
const { param } = require('express-validator');

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'uploads'); // uploads/ 라는 폴더에 파일들을 저장함.
  },
  filename: function (req, file, callback) {
    // 저장할 파일이름에 시간을 붙여 저장함(중복을 피하기 위해)
    let extension = path.extname(file.originalname);
    let basename = path.basename(file.originalname, extension);
    callback(null, basename + '-' + Date.now() + extension);
  },
});

const upload = multer({ storage });

/**
 * @swagger
 * components:
 *   schemas:
 *     file:
 *       type: object
 *       properties:
 *         encoding:
 *           type: string
 *           example: 7bit
 *         mimetype:
 *           type: string
 *           example: image/jpeg
 *         filename:
 *           type: string
 *           example: dog-1591886948288.jpg
 *         path:
 *           type: string
 *           example: /uploads/dog-1591886948288.jpg
 *         size:
 *           type: number
 *           example: 29758
 */

/**
 * @swagger
 * paths:
 *   /upload/{type}:
 *     post:
 *       description: 타입별 파일 업로드
 *       summary: 타입별 파일 업로드
 *       operationId: uploadType
 *       parameters:
 *       - name: type
 *         description: 'Allow Types: [ userProfileImage, shopperOrderImages ]'
 *         in: path
 *         type: string
 *         enum:
 *           - userProfileImage
 *           - shopperOrderImage
 *         example:
 *           userProfileImage
 *       requestBody:
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               required:
 *                 - files
 *               properties:
 *                 files:
 *                   type: array
 *                   items:
 *                     type: file
 *       responses:
 *         200:
 *           description: file data
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
 *                       type:
 *                         type: string
 *                       files:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/file'
 */
const allowTypes = ['userProfileImage', 'shopperOrderImages'];
exports.upload = [
  param('type')
    .custom(type => allowTypes.indexOf(type) > -1)
    .withMessage(`allow type is [${allowTypes.join(',')}]`),
  validationMiddleware,
  // upload.array('files')는 'files'라는 name으로 넘어온 파일 array를 req.files로 입력하는 역할을 함
  upload.array('files'),
  async (req, res, next) => {
    try {
      const { type } = req.params;
      const { files } = req;

      files.map(file => {
        file.path = '/' + file.path.replace('\\', '/');
        delete file.fieldname;
        delete file.destination;
        delete file.originalname;
      });

      return res.json({
        success: true,
        data: {
          type,
          files,
        },
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
];
