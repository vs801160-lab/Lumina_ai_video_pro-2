import express from 'express';
const app = express();
app.get('/', (req, res) => res.send('TSX IS WORKING'));
app.listen(3000, '0.0.0.0', () => console.log('Test server on 3000'));
