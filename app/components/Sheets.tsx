import React, { useState } from 'react'
import path from 'path'
import dayjs from 'dayjs'
import styles from './Sheets.css'
import {
  getColumnRange,
  getMultipleColumns,
  compareArrays,
  comparePrices,
  getMasterPrices,
} from '../utils/matrix'

const DEBUG = false

const { google } = require('googleapis')
const { GoogleAuth } = require('google-auth-library')

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})
const sheets = google.sheets({ version: 'v4', auth })

const Sheets = () => {
  const [working, setWorking] = useState(false)
  const [masterValue, setMasterValue] = useState('MD - master data')
  const [newValue, setNewValue] = useState('')
  const getMasterData = async () => {
    return new Promise((resolve, reject) =>
      sheets.spreadsheets.values.get(
        {
          spreadsheetId: process.env.SHEET_ID,
          range: `${masterValue}!A2:BT`,
        },
        (err, res) => {
          if (err) {
            console.error(err)
            reject(err)
          }
          resolve(res.data.values)
        }
      )
    )
  }
  const getNewData = async () => {
    return new Promise((resolve, reject) =>
      sheets.spreadsheets.values.get(
        {
          spreadsheetId: process.env.SHEET_ID,
          range: `${newValue}!A2:Y`,
        },
        (err, res) => {
          if (err) {
            console.error(err)
            reject(err)
          }
          resolve(res.data.values)
        }
      )
    )
  }

  const updateOneCell = async (value, cell) => {
    const spreadsheetId = process.env.SHEET_ID
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${newValue}!${cell}`,
      resource: {
        values: [[value]],
      },
      valueInputOption: 'USER_ENTERED',
      auth,
    })
  }

  const updateCellRange = async (value, cell) => {
    const spreadsheetId = process.env.SHEET_ID
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${newValue}!${cell}`,
      resource: {
        values: value,
      },
      valueInputOption: 'USER_ENTERED',
      auth,
    })
  }

  const removeNonArrays = arr => {
    if (!Array.isArray(arr)) return false
    const newArr = arr
    newArr.forEach(internalArr => {
      if (!Array.isArray(internalArr)) {
        newArr.shift(1)
      }
    })
    return newArr
  }

  const compareValues = async () => {
    setWorking(true)
    try {
      const master = await getMasterData()
      const newData = await getNewData()

      // Step 1.1 - Get Kunden Referenz + PO Nr. from New Month Sheet
      const kundenReferenzNewSheet = getMultipleColumns(newData, ['Y', 'V'])

      // Step 1.2 - Get Kunden Ref + Po Nr. from Master Data
      const poNrMasterData = getColumnRange(master, 'B:C')

      // Step 1.3 - Compare two last two
      const leftOverValues = compareArrays(
        poNrMasterData,
        kundenReferenzNewSheet
      )

      // Step 1.4 - Update input sheet
      if (!DEBUG) {
        leftOverValues.serienMismatch.forEach((row, i) => {
          setTimeout(() => {
            updateOneCell(`Mismatch: ${row.sNr}`, `AA${row.row.match(/\d+/g)}`)
          }, i * 1500)
        })
        leftOverValues.missing.forEach((row, i) => {
          setTimeout(() => {
            updateOneCell(
              `Missing in Master Data`,
              `AA${row.row.match(/\d+/g)}`
            )
          }, i * 1500)
        })
      }

      // Step 2.0 - get Date from input sheet
      const rawData = getColumnRange(newData, 'N:O')
      let dateData
      while (rawData.some(el => !Array.isArray(el))) {
        dateData = removeNonArrays(rawData)
      }
      const monthValue = dayjs(dateData[0][0]).format('MMM/YY')
      const val = Array(dateData.length).fill([monthValue])
      // Step 2.1 - Write Date Value to Column
      if (!DEBUG) {
        updateCellRange(val, `AB2:AB${dateData.length + 1}`)
      }

      // Step 3 - Match i.e. 'May/20' Netto Preis vom masterdata BD to inputData J (Nettobetrag)
      const inputDataNetto = getMultipleColumns(newData, ['J', 'V'])
      const masterDataNetto = getMultipleColumns(master, ['BD', 'C']) // TODO: dynamically find column 'May/20'

      // Step 4 - Copy prices from Masterdata to input field
      const masterPrices = getMasterPrices(inputDataNetto, masterDataNetto)

      if (!DEBUG) {
        masterPrices.forEach((row, i) => {
          setTimeout(() => {
            updateOneCell(row.priceB, `AC${row.row.match(/\d+/g)}`)
          }, i * 1500)
        })
      }

      // Step 5 - Write if Mismatched Prices to Inputdata AD
      const mismatchedPrices = comparePrices(inputDataNetto, masterDataNetto)

      if (!DEBUG) {
        mismatchedPrices.forEach((row, i) => {
          setTimeout(() => {
            updateOneCell('Incorrect', `AD${row.rowA.match(/\d+/g)}`)
          }, i * 1500)
        })
      }

      // Step 6 - Create column for manual checking
      if (!DEBUG) {
        leftOverValues.serienMismatch.forEach((row, i) => {
          setTimeout(() => {
            updateOneCell(`CHECK`, `AE${row.row.match(/\d+/g)}`)
          }, i * 1500)
        })
        leftOverValues.missing.forEach((row, i) => {
          setTimeout(() => {
            updateOneCell(`CHECK`, `AE${row.row.match(/\d+/g)}`)
          }, i * 1500)
        })
        mismatchedPrices.forEach((row, i) => {
          setTimeout(() => {
            updateOneCell('CHECK', `AE${row.rowA.match(/\d+/g)}`)
          }, i * 1500)
        })
      }

      // Step X - Return
      setWorking(false)
    } catch (err) {
      if (err) console.error(err)
      setWorking(false)
    }
    return true
  }
  const clearValues = () => {
    setNewValue('')
    setMasterValue('')
    return true
  }

  return (
    <div className={styles.wrapper}>
      <span>Enter Master Sheet Name:</span>
      <div className={styles.fields}>
        <svg
          fill='none'
          width='24'
          height='24'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path d='M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z' />
        </svg>
        <input
          type='text'
          className={styles.master}
          value={masterValue}
          onChange={event => setMasterValue(event.target.value)}
        />
      </div>
      <span>Enter new Sheet Name:</span>
      <div className={styles.fields}>
        <svg
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M14.364 13.1214C15.2876 14.045 15.4831 15.4211 14.9504 16.5362L16.4853 18.0711C16.8758 18.4616 16.8758 19.0948 16.4853 19.4853C16.0948 19.8758 15.4616 19.8758 15.0711 19.4853L13.5361 17.9504C12.421 18.4831 11.045 18.2876 10.1213 17.364C8.94975 16.1924 8.94975 14.2929 10.1213 13.1214C11.2929 11.9498 13.1924 11.9498 14.364 13.1214ZM12.9497 15.9498C13.3403 15.5593 13.3403 14.9261 12.9497 14.5356C12.5592 14.145 11.9261 14.145 11.5355 14.5356C11.145 14.9261 11.145 15.5593 11.5355 15.9498C11.9261 16.3403 12.5592 16.3403 12.9497 15.9498Z'
            fill='currentColor'
          />
          <path d='M8 5H16V7H8V5Z' fill='currentColor' />
          <path d='M16 9H8V11H16V9Z' fill='currentColor' />
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M4 4C4 2.34315 5.34315 1 7 1H17C18.6569 1 20 2.34315 20 4V20C20 21.6569 18.6569 23 17 23H7C5.34315 23 4 21.6569 4 20V4ZM7 3H17C17.5523 3 18 3.44772 18 4V20C18 20.5523 17.5523 21 17 21H7C6.44772 21 6 20.5523 6 20V4C6 3.44772 6.44771 3 7 3Z'
            fill='currentColor'
          />
        </svg>
        <input
          type='text'
          className={styles.newSheet}
          value={newValue}
          onChange={event => setNewValue(event.target.value)}
        />
      </div>
      <ul className={styles.actions}>
        <button type='button' className={styles.clearBtn} onClick={clearValues}>
          <svg
            width='24'
            height='24'
            fill='none'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            viewBox='0 0 24 24'
            stroke='#ff5959'
          >
            <path d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
          </svg>
          <span>Clear</span>
        </button>
        <button
          type='button'
          className={styles.confirmBtn}
          onClick={compareValues}
        >
          <svg
            width='24'
            height='24'
            fill='none'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            viewBox='0 0 24 24'
            stroke='#67b246'
          >
            <path d='M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' />
          </svg>
          <span> Compare</span>
        </button>
      </ul>
      {working && (
        <div className={styles.loaderWrapper}>
          <div className='lds-grid'>
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
          </div>
        </div>
      )}
    </div>
  )
}

export default Sheets
