import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - categoryName
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the category
 *         categoryName:
 *           type: string
 *           description: The name of the category
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the category was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the category was last updated
 *       example:
 *         _id: 64f1bfb03b5f3b74a71d1a20
 *         categoryName: Food
 *         createdAt: 2023-09-01T12:34:56.789Z
 *         updatedAt: 2023-09-01T12:34:56.789Z
 */

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
