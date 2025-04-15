const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

// Ensure protect middleware is a valid function
if (typeof protect !== 'function') {
    throw new TypeError('protect must be a middleware function');
}

// Protect all routes with authentication
router.use(protect);

// Category routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;