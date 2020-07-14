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
      if (y + 1 === columns.length) {
        returnArr[i][y + 1] = `${column}${i + 2}`
      }
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
    if (Array.isArray(rowValues)) {
      total.push(rowValues)
    }
    return total
  })
  returnArr.splice(0, 25)
  return returnArr
}

export const compareArrays = (inputA, inputB) => {
  const returnArr = []
  inputA.forEach((row, i) => {
    if (inputB.findIndex(el => el.join('') === row.splice(2, 1).join('')) < 0) {
      returnArr.push(inputA[i])
    }
  })
  return returnArr
}
