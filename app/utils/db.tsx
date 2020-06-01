const mssql = require('mssql')
const path = require('path')
const log = require('electron-log')

const config = {
  user: process.env.MSSQL_USERNAME,
  password: process.env.MSSQL_PW,
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DB,
}

mssql.connect(config)

const q = async (query: string) => {
  try {
    const results = await mssql.query(query)
    return results
  } catch (error) {
    log.error(error)
    new Notification('Error', {
      body: 'Error connecting to Database',
      icon: path.join(__dirname, '../resources/icons/64x64.png'),
    })
    return { error }
  }
}
export default q
