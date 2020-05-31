const mssql = require('mssql')

// const db = async () => {
//   // let connection
//   // make sure that any items are correctly URL encoded in the connection string
//   console.log(mssql)
//   console.log(process.env.MSSQL_USERNAME)
//   const config = {
//     user: process.env.MSSQL_USERNAME,
//     password: process.env.MSSQL_PW,
//     server: process.env.MSSQL_SERVER,
//     database: process.env.MSSQL_DB,
//   }
//   const connection = await mssql.connect(config)
//   // const result = await mssql.query`select I3D, Freitext from AbholPos`
//   // console.dir(result)
//   return connection
//   // return connection
// }

const config = {
  user: process.env.MSSQL_USERNAME,
  password: process.env.MSSQL_PW,
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DB,
}

mssql.connect(config)

const q = async query => {
  try {
    const results = await mssql.query(query)
    return results
  } catch (error) {
    new Notification('Error', {
      body: 'Error connecting to database',
    })
    return { error }
  }
}
export default q

// exports.query = async query => {

//   try {
//     const results = await db.query(query)
//     await db.end()
//     return results
//   } catch (error) {
//     return { error }
//   }
// }
