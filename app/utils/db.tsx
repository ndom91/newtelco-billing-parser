const sql = require('mssql')
const log = require('electron-log')

log.catchErrors()

const config = {
  user: 'ntdb',
  password: 'N3wt3lco',
  server: 'WINSRV2016-2\\NT_WINSRV2016_2',
  database: 'centron_production',
}

log.info('dirname', __dirname)
log.info('cwd', process.cwd())

const q = async (query: string) => {
  const pool = await sql.connect(config)
  const result1 = await pool.request().query(query)
  return result1
}

export default q
