const express = require('express');
const router = express.Router();
const controllers = require('../controllers/fileControllers');

// Ensure that these routes are defined
router.get('/', controllers.homeGet);
router.get('/sign-up', controllers.signUpGet);
router.post('/sign-up', controllers.signInPost);
router.get('/log-in', controllers.logInGet);
router.post('/log-in', controllers.logInPost);

router.get('/filesPage', controllers.filesGet);

// Folder-related routes
router.get('/folders', controllers.getFolders);
router.post('/folders', controllers.createFolder);
router.post('/folders/:id/update', controllers.updateFolder);
router.post('/folders/:id/delete', controllers.deleteFolder);

// File-related routes
router.get('/folders/:id/files', controllers.getFiles);
router.post('/folders/:id/files', controllers.uploadFile);
router.post('/folders/:folderId/files/:fileId/delete', controllers.deleteFile);
router.post('/folders/:folderId/files/:fileId/rename', controllers.renameFile);


module.exports = router;
