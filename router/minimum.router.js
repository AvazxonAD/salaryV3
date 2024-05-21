const {Router} = require('express')
const router = Router()

const {protect} = require('../middleware/auth')

const {getMinimum, updateMinimum} = require('../controller/minimum.controller')

router.get('/get', protect, getMinimum)
router.put('/update', protect, updateMinimum)

module.exports = router