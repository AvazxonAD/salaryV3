const {Router} = require('express')
const router = Router()

const {protect} = require('../middleware/auth')

const {createWorker, login, userOpen, updatePassword} = require('../controller/auth.controller')

router.post('/create', protect, createWorker)
router.post('/login', login)
router.get('/get',protect, userOpen)
router.put('/update',protect, updatePassword)


module.exports = router
