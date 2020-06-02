const mssql = require('mssql')
const path = require('path')
const log = require('electron-log')

log.catchErrors()

const config = {
  user: 'ntdb',
  password: 'N3wt3lco',
  server: '192.168.11.19',
  database: 'centron_production',
}

log.info('process.env', process.env.MSSQL_SERVER)
log.info('config', config)
log.info('dirname', __dirname)
log.info('cwd', process.cwd())

mssql.connect(config)

const q = async (query: string) => {
  try {
    const results = await mssql.query(query)
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
