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
    let columnNum
    if (column.length === 1) {
      columnNum = column.toUpperCase().charCodeAt(0) - 65
    } else if (column.length === 2) {
      columnNum = column.toUpperCase().charCodeAt(0) - 65
      columnNum = (columnNum + 1) * 26
      columnNum += column.toUpperCase().charCodeAt(1) - 65
    }

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
  const returnArr = array.reduce((total, e) => {
    const rowValues = e.slice(start, end + 1)
    if (Array.isArray(rowValues)) {
      total.push(rowValues)
    }
    return total
  })
  returnArr.splice(0, 4)
  return returnArr
}

export const compareArrays = (inputA, inputB) => {
  const returnArr = { missing: [], serienMismatch: [] }
  inputB.forEach(row => {
    const rowNr = row.pop()
    const returnVal = inputA.find(el => {
      return el[0] === row[0]
    })
    if (returnVal) {
      if (returnVal[1] !== row[1]) {
        returnArr.serienMismatch.push({
          kNr: row[0],
          sNr: returnVal[1],
          row: rowNr,
        })
      }
    } else {
      returnArr.missing.push({
        kNr: row[0],
        sNr: row[1],
        row: rowNr,
      })
    }
  })
  return returnArr
}
export const getMasterPrices = (inputA, inputB) => {
  const returnArr = []
  inputB.forEach(row => {
    const matchingRooms = inputA.find(el => {
      if (typeof el[0] !== 'string') return false
      if (typeof row[0] !== 'string') return false
      const inputARoom = el[1].trim()
      const inputBRoom = row[1].trim()
      return inputARoom === inputBRoom
    })
    if (matchingRooms) {
      const inputAPrice = matchingRooms[0].replace('€', '').trim()
      const inputBPrice = row[0].trim()
      returnArr.push({
        row: matchingRooms[2],
        priceA: inputAPrice,
        priceB: inputBPrice,
      })
    }
  })
  return returnArr
}

export const comparePrices = (inputA, inputB) => {
  const returnArr = []
  inputB.forEach(row => {
    // const rowNr = row.pop()

    // find matching Rack
    const matchingRooms = inputA.find(el => {
      if (typeof el[0] !== 'string') return false
      if (typeof row[0] !== 'string') return false
      const inputARoom = el[1].trim()
      const inputBRoom = row[1].trim()
      return inputARoom === inputBRoom
    })

    if (matchingRooms) {
      const inputAPrice = matchingRooms[0].replace('€', '').trim()
      const inputBPrice = row[0].trim()

      if (inputAPrice !== inputBPrice) {
        returnArr.push({
          priceA: inputAPrice,
          priceB: inputBPrice,
          rowA: matchingRooms[2],
        })
      }
    }
  })
  return returnArr
}
