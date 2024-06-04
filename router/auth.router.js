const {Router} = require('express')
const router = Router()

const {protect} = require('../middleware/auth')

const {createWorker, login, userOpen, updatePassword, getLogin} = require('../controller/auth.controller')

router.post('/create', protect, createWorker)
router.post('/login', login)
router.get('/get',protect, userOpen)
router.get("/login/for", getLogin)
router.put('/update',protect, updatePassword)


module.exports = router
