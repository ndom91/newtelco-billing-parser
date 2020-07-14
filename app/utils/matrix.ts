export const getColumn = (array, column) => {
  let columnNum = column
  if (typeof column === 'string') {
    columnNum = column.toUpperCase().charCodeAt(0) - 65
  }
  return array.map(e => e[columnNum])
}

export const getMultipleColumns = (array, columns) => {
  const returnArr = []
  columns.forEach((column, y) => {
    const columnNum = column.toUpperCase().charCodeAt(0) - 65
    array.map((e, i) => {
      if (y === 0) returnArr.push([])
      const val = e[columnNum]
      returnArr[i][y] = val
      return true
    })
  })
  return returnArr
}

export const getColumnRange = (array, range) => {
  const start = range[0].toUpperCase().charCodeAt(0) - 65
  const end = range[2].toUpperCase().charCodeAt(0) - 65
  console.log(start, end)
  const returnArr = array.reduce((total, e) => {
    const rowValues = e.slice(start, end + 1)
    if (typeof rowValues === 'object') {
      total.push(rowValues)
    }
    return total
  })
  returnArr.splice(0, 25)
  return returnArr
}

// export const compareArrays = (A, B) => {
//   A.reduce((missing, e) => {
//     if (B.indexOf(A[i]) > -1) {
//       missing.push(A[i])
//     }
//     return missing
//   })
// }
