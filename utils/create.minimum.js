const Minimum = require('../models/minimum')

async function createMinimum() {
    const minimum = await Minimum.findOne()
    if(!minimum){
        await Minimum.create({summa : 1000})
        return;
    }
    return;
}

module.exports = createMinimum
