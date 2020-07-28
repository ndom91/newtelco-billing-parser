import React, { useMemo, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import path from 'path'
import * as fs from 'fs'
import q from '../utils/db'
import objDiff from '../utils/objDiff'
import styles from './File.css'

const { dialog } = require('electron').remote
const ExcelJS = require('exceljs')
const { google } = require('googleapis')
const { GoogleAuth } = require('google-auth-library')

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/spreadsheets.readonly',
})
const sheets = google.sheets({ version: 'v4', auth })
const sheetName = 'MD - master data'
sheets.spreadsheets.values.get(
  {
    spreadsheetId: process.env.SHEET_ID,
    range: `${sheetName}!A2:I`,
  },
  // eslint-disable-next-line
  (err, res) => {
    if (err) console.error(err)
    // console.log(res)
  }
)

const baseStyle = {
  flex: 1,
  maxHeight: '80px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 5,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
}

const activeStyle = {
  borderColor: '#2196f3',
}

const acceptStyle = {
  borderColor: '#00e676',
}

const rejectStyle = {
  borderColor: '#ff1744',
}

type File = {
  lastModified: number
  lastModifiedDate: Date
  name: string
  path: string
  size: number
  type: string
  webkitRelativePath: string
}

type FileArr = File[]

const Filezone = () => {
  const [myFiles, setMyFiles] = useState<FileArr>([])
  const [working, setWorking] = useState(false)
  const [saveModal, setSaveModal] = useState(false)
  const [workbook, setWorkbook] = useState({})
  const onDrop = useCallback(acceptedFiles => {
    setMyFiles([...myFiles, ...acceptedFiles])
  }, [])

  const removeFile = (file: File) => () => {
    const newFiles = [...myFiles]
    newFiles.splice(newFiles.indexOf(file), 1)
    setMyFiles(newFiles)
  }

  const handleCompare = async (filePath: string, type: string) => {
    setWorking(true)
    const inputWorkbook = new ExcelJS.Workbook()
    const data = await fs.promises.readFile(filePath)
    const wb = await inputWorkbook.xlsx.load(data.buffer)
    if (type === 'itenos') {
      const orders = {}
      wb.eachSheet((worksheet, sheetId: number) => {
        if (worksheet.state === 'visible' && worksheet.name.charAt(0) === '3') {
          orders[sheetId] = { name: worksheet.name, values: [] }
          worksheet.eachRow(row => {
            if (typeof row.values[1] === 'number') {
              orders[sheetId].values.push({
                Nummer: row.values[2],
                SummeNetto: row.values[5],
              })
            }
          })
        }
      })
      const returnData = []
      for await (const sheet of Object.values(orders)) {
        const orderQuery = sheet.values.map(row => {
          return row.Nummer
        })
        if (orderQuery.length) {
          const orderIdQuery = await q(`
            select I3D, Nummer 
            from BestKopf2 
            where AktuelleVersion = 1 
            and Nummer in (${orderQuery.join(', ')})
          `)
          const orderIds = orderIdQuery.recordset.map(row => {
            return row.I3D
          })
          const positionIds = await q(`
            select 
              I3D, 
              BestKopfI3D,
              preis
            from BestPos2
            where BestKopfI3D in (${orderIds.join(', ')})
            and Text like '%MRC%'
          `)
          const map = new Map()
          orderIdQuery.recordset.forEach(item => map.set(item.I3D, item))
          positionIds.recordset.forEach(item =>
            map.set(item.BestKopfI3D, { ...map.get(item.BestKopfI3D), ...item })
          )
          const mergedArr = Array.from(map.values())
          const dbValues = mergedArr.map(item => {
            return { Nummer: item.Nummer, SummeNetto: item.preis }
          })
          const correctWorksheet = Object.values(orders).find(
            order => order.name === dbValues[0].Nummer.toString().substr(0, 3)
          )
          const diff = objDiff(dbValues, correctWorksheet.values)
          returnData.push({ sheetName: sheet.name, diff })
        }
      }
      const returnWorkbook = new ExcelJS.Workbook()
      returnData
        .sort((a, b) => {
          if (a.sheetName < b.sheetName) {
            return -1
          }
          return 1
        })
        .forEach(ws => {
          const sheet = returnWorkbook.addWorksheet(ws.sheetName)
          sheet.columns = [
            { header: 'Order', key: 'order', width: 12 },
            { header: 'Excel Value', key: 'excel', width: 15 },
            {
              header: 'Centron Value',
              key: 'centron',
              width: 15,
            },
          ]
          ws.diff.forEach(async row => {
            await sheet.addRow({
              order: row.order,
              excel: row.excel,
              centron: row.centron,
            })
          })
          sheet.getRow(1).font = { bold: true }
          sheet.getCell('A1').alignment = { horizontal: 'center' }
          sheet.getCell('B1').alignment = { horizontal: 'center' }
          sheet.getCell('C1').alignment = { horizontal: 'center' }
          sheet.getCell('A1').border = { bottom: { style: 'thin' } }
          sheet.getCell('B1').border = { bottom: { style: 'thin' } }
          sheet.getCell('C1').border = { bottom: { style: 'thin' } }
          sheet.getColumn(2).numFmt = '"€"#,##0.00;'
          sheet.getColumn(3).numFmt = '"€"#,##0.00;'

          sheet.autoFilter = {
            from: 'A1',
            to: 'C1',
          }
        })
      setWorkbook(returnWorkbook)
      setWorking(false)
      setSaveModal(true)
    }
  }

  const saveDiffExcel = async () => {
    const saveDialog = await dialog.showSaveDialog({
      title: 'Save Billing Descrepencies',
      defaultPath: `itenos_compare_${new Date().toLocaleDateString(
        'de-DE'
      )}.xlsx`,
    })
    if (!saveDialog.canceled) {
      const saveBuffer = await workbook.xlsx.writeBuffer(saveDialog.filePath)
      fs.writeFile(saveDialog.filePath, saveBuffer, err => {
        if (err) console.error(err)
      })
      setSaveModal(false)
    }
  }

  const onDropRejected = useCallback(data => {
    if (data[0].errors[0].code === 'file-invalid-type') {
      new Notification('Newtelco', {
        body: 'Only Excel files allowed',
        icon: path.join(__dirname, '../resources/icons/64x64.png'),
      })
    }
  }, [])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    onDropRejected,
    accept: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  })

  const files = myFiles.map((file: File) => (
    <li key={file.path} className={styles.fileItem}>
      <span>{file.name}</span>
      <div className={styles.buttonWrapper}>
        <button
          type='button'
          className={styles.fileButton}
          onClick={() => handleCompare(file.path, 'itenos')}
        >
          Itenos
        </button>
        <button
          type='button'
          className={styles.fileButton}
          onClick={() => handleCompare(file.path, 'equinix')}
        >
          Equinix
        </button>
        <button
          type='button'
          className={styles.fileButton}
          onClick={removeFile(file)}
        >
          Remove
        </button>
      </div>
    </li>
  ))

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept]
  )

  return (
    <>
      <div className={styles.dragWrapper} {...getRootProps({ style })}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>
            <i className='far fa-file-excel' style={{ marginRight: '10px' }} />
            Drop your Excel File Here
          </p>
        )}
      </div>
      <ul className={styles.fileList}>{files}</ul>
      <div>
        {!myFiles.length && (
          <>
            <div className={styles.noteWrapper}>
              Only `.xls` or `.xslx` files allowed
            </div>
          </>
        )}
      </div>
      <div>
        {saveModal && (
          <div className={styles.modalWrapper}>
            <div className={styles.modalContent}>
              <h2>Analysis Complete</h2>
              <div>Would you like to download the resulting Excel file?</div>
              <div className={styles.btnWrapper}>
                <button
                  className={styles.saveBtn}
                  name='saveExcel'
                  type='button'
                  onClick={saveDiffExcel}
                >
                  Save
                </button>
                <button
                  className={styles.cancelBtn}
                  name='cancel'
                  type='button'
                  onClick={() => setSaveModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
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
    </>
  )
}

export default Filezone
