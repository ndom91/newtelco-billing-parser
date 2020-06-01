const mssql = require('mssql')
const path = require('path')
const log = require('electron-log')

log.catchErrors()

const config = {
  user: process.env.MSSQL_USERNAME,
  password: process.env.MSSQL_PW,
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DB,
}

log.info('process.env', process.env.MSSQL_SERVER)
log.info('config', config)
log.info('dirname', __dirname)
log.info('cwd', process.cwd())
// log.info('readdir', fs.readdirSync(__dirname))

mssql.connect(config)

const q = async (query: string) => {
  log.info(query)
  try {
    const results = await mssql.query(query)
    log.info(results)
    return results
  } catch (error) {
    log.error(error)
    new Notification('Error', {
      body: 'Error connecting to Database',
      icon: path.join(process.cwd(), '../resources/icons/64x64.png'),
    })
    return { error }
  }
}

export default q
