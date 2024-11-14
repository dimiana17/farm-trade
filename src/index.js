const app = require('../app');
const connectDb = require('../config/db');

connectDb();

const PORT = process.env.PORT || 3000;  // Change port to 3001

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
