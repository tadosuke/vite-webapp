import express from 'express';
import path from 'path';
import routes from './routes.js';

const app = express();

app.use(express.static(path.resolve(process.cwd(), 'dist-src')));
app.use(routes);

app.listen(process.env.PORT || 3000, () => {
  console.log(
    `Server is running at http://localhost:${process.env.PORT || 3000}`,
  );
});
