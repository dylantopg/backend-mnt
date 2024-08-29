import { Hono } from 'hono';
// import { logger } from 'hono/logger';
import attendanceRoutes from './routes/attendance';
import { cors } from 'hono/cors'

const app = new Hono();


app.use('*', cors());
app.route('/api', attendanceRoutes);

app.get('/', (c) => c.text('Control de Asistencia API'));

export default {
  port: 3000,
  fetch: app.fetch,
};