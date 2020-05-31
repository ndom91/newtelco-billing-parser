import React, { useMemo, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import styles from './upload.css'
import q from '../utils/db'

const fs = require('fs')
const ExcelJS = require('exceljs')

const baseStyle = {
  flex: 1,
  maxHeight: '80px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
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
  file: {
    lastModified: number
    lastModifiedDate: Date
    name: string
    path: string
    size: number
    type: string
    webkitRelativePath: string
  }[]
}

const Upload = () => {
  const [myFiles, setMyFiles] = useState<File>([])
  const [working, setWorking] = useState(false)
  const onDrop = useCallback(acceptedFiles => {
    setMyFiles([...myFiles, ...acceptedFiles])
    // acceptedFiles.forEach(file => {
    //   const reader = new FileReader()

    //   reader.onabort = () => console.log('file reading was aborted')
    //   reader.onerror = () => console.log('file reading has failed')
    //   reader.onload = () => {
    //     const binaryStr = reader.result
    //     // console.log(binaryStr)
    //   }
    //   reader.readAsArrayBuffer(file)
    // })
  }, [])

  const removeFile = file => () => {
    const newFiles = [...myFiles]
    newFiles.splice(newFiles.indexOf(file), 1)
    setMyFiles(newFiles)
  }

  // const removeAll = () => {
  //   setMyFiles([]);
  // };

  const handleCompare = async (path: string, type: string) => {
    setWorking(true)
    const workbook = new ExcelJS.Workbook()
    const data = await fs.promises.readFile(path)
    const wb = await workbook.xlsx.load(data.buffer)
    if (type === 'itenos') {
      const orders = {}
      wb.eachSheet((worksheet, sheetId: number) => {
        console.log(sheetId)
        orders[sheetId] = []
        worksheet.eachRow((row, rowNumber) => {
          // console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
          if (typeof row.values[1] === 'number') {
            orders[sheetId].push({
              order: row.values[2],
              po: row.values[3],
              mrc: row.values[5],
            })
          }
        })
      })
      console.log(orders)
      Object.values(orders).forEach(sheet => {
        const orderQuery = sheet.map(row => {
          return row.order
        })
        if (orderQuery.length) {
          q(`select distinct Nummer, SummeNetto 
            from BestKopf2 
            where Nummer in (${orderQuery.join(', ')})`)
            .then(resp => {
              console.log(resp)
              return resp
            })
            .catch(err => console.error(err))
        }
      })

      setWorking(false)
    }
    // const newworksheet = newWorkbook.getWorksheet('My Sheet')
    // newworksheet.columns = [
    //   { header: 'Id', key: 'id', width: 10 },
    //   { header: 'Name', key: 'name', width: 32 },
    //   { header: 'D.O.B.', key: 'dob', width: 15 },
    // ]
    // await newworksheet.addRow({
    //   id: 3,
    //   name: 'New Guy',
    //   dob: new Date(2000, 1, 1),
    // })

    // await newWorkbook.xlsx.writeFile('export2.xlsx')
  }

  const onDropRejected = useCallback(data => {
    if (data[0].errors[0].code === 'file-invalid-type') {
      new Notification('Newtelco', {
        body: 'Only Excel files allowed',
        icon: '../assets/img/icons/nt-512-grey.png',
      })
    }
  })

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

  const files = myFiles.map(file => (
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

  if (!working) {
    return (
      <>
        <div className={styles.dragWrapper} {...getRootProps({ style })}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>
              <i
                className='far fa-file-excel'
                style={{ marginRight: '10px' }}
              />
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
      </>
    )
  } else {
    return (
      <div className='lds-grid'>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    )
  }
}

export default Upload
