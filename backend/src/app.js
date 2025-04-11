const adminRoutes = require('./routes/adminRoutes');
const { User, Recipe, Comment } = require('./models/associations');

app.use('/admin', adminRoutes); 