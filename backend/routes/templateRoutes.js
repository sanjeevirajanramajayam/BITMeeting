const express = require('express');
const router = express.Router();
const {
    createTemplate,
    getTemplates,
    getTemplateById,
    updateTemplate,
    templateList,
    searchTemplates,
    deleteTemplate,
    getCategories,
    getUsers,
    getVenue
} = require('../controllers/templateController');
const {
    verifyToken
} = require('../controllers/meetingController');

router.post('/create', verifyToken, createTemplate);
router.get("/users", getUsers);
router.get("/venues", getVenue);
router.get('/s', searchTemplates);
router.get('/', getTemplates);
router.get('/categories', getCategories);
router.get('/list', templateList);
router.get('/:id', getTemplateById);
router.put('/update/:id', updateTemplate); 
router.delete('/delete/:id', deleteTemplate);

module.exports = router;