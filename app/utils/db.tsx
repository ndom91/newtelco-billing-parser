const sql = require('mssql')
const log = require('electron-log')

log.catchErrors()

const config = {
  user: 'ntdb',
  password: 'N3wt3lco',
  server: 'WINSRV2016-2\\NT_WINSRV2016_2',
  // server: '192.168.11.19',
  database: 'centron_production',
}

log.info('dirname', __dirname)
log.info('cwd', process.cwd())

// mssql.connect(config)

const q = async (query: string) => {
  const pool = await sql.connect(config)
  const result1 = await pool.request().query(query)
  return result1
  // try {
  // const results = await mssql.query(query)
  // return results
  // } catch (error) {
  //   log.error(error)
  //   new Notification('Error', {
  //     body: `Error connecting to Database - ${error}`,
  //     icon: path.join(process.cwd(), '../resources/icons/64x64.png'),
  //   })
  //   return { error }
  // }
}

export default q
