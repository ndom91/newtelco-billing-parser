/**
 * Find difference between two objects
 * @param  {object} origObj - Source object to compare newObj against
 * @param  {object} newObj  - New object with potential changes
 * @return {object} differences
 */

const objDiff = (arr1, arr2) => {
  const unequal = []
  arr1.forEach(x => {
    const a2Value = arr2.find(y => y.Nummer === x.Nummer)
    if (a2Value.SummeNetto !== x.SummeNetto) {
      unequal.push({
        order: x.Nummer,
        excel: a2Value.SummeNetto,
        centron: x.SummeNetto,
      })
    }
    //   unequal.push(x)
    // }
  })
  return unequal
}

export default objDiff
