import { Pool } from 'pg';
import pg from 'pg';

// 1082 = DATE (повертаємо як чистий рядок "YYYY-MM-DD")
pg.types.setTypeParser(pg.types.builtins.DATE, (value: string) => value);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,

  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  allowExitOnIdle: false,


  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

if (process.env.NODE_ENV !== 'production') {
  pool.connect()
    .then(client => {
      console.log('→ PostgreSQL pool ready');
      client.release();
    })
    .catch(err => console.error('PostgreSQL connection error:', err));
}

export default pool;

export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows as T[];
  } finally {
    client.release();
  }
}