const mongoose = require('mongoose');

const dbConnect = async () => {
    try {
        const { connection } = await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log(`mongodb connected with host ${connection.host}`)
    } catch (error) {
        console.log('mongodb connection failed');
        process.exit(1);
    }
}

module.exports = dbConnect;