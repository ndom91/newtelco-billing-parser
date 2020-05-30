import React, { useMemo, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './upload.css';
// const nativeImage = require('electron').nativeImage

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
  transition: 'border .24s ease-in-out'
};

const activeStyle = {
  borderColor: '#2196f3'
};

const acceptStyle = {
  borderColor: '#00e676'
};

const rejectStyle = {
  borderColor: '#ff1744'
};

type File = {
  file: {
    lastModified: number;
    lastModifiedDate: Date;
    name: string;
    path: string;
    size: number;
    type: string;
    webkitRelativePath: string;
  }[];
};

const Upload = () => {
  const [myFiles, setMyFiles] = useState<File>([]);
  const onDrop = useCallback(acceptedFiles => {
    console.log(acceptedFiles);
    setMyFiles([...myFiles, ...acceptedFiles]);
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
  }, []);

  const removeFile = file => () => {
    const newFiles = [...myFiles];
    newFiles.splice(newFiles.indexOf(file), 1);
    setMyFiles(newFiles);
  };

  // const removeAll = () => {
  //   setMyFiles([]);
  // };

  const handleUpload = data => {
    console.log(data);
  };

  const onDropRejected = useCallback(data => {
    console.log(data);
    // const img = nativeImage.createFromPath(
    //   '../assets/img/icons/nt-512-grey.png'
    // )
    // console.log(img)
    if (data[0].errors[0].code === 'file-invalid-type') {
      new Notification('Newtelco', {
        body: 'Only Excel files allowed',
        icon: '../assets/img/icons/nt-512-grey.png'
      });
    }
  });

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    onDropRejected,
    accept: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  });

  const files = myFiles.map(file => (
    <li key={file.path} className={styles.fileItem}>
      <span>{file.name}</span>
      <div className={styles.buttonWrapper}>
        <button
          type="button"
          className={styles.fileButton}
          onClick={() => handleUpload(file.path)}
        >
          Itenos
        </button>
        <button
          type="button"
          className={styles.fileButton}
          onClick={() => handleUpload(file.path)}
        >
          Equinix
        </button>
        <button
          type="button"
          className={styles.fileButton}
          onClick={removeFile(file)}
        >
          Remove
        </button>
      </div>
    </li>
  ));

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {})
    }),
    [isDragActive, isDragReject, isDragAccept]
  );

  return (
    <>
      <div className={styles.dragWrapper} {...getRootProps({ style })}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drop your Billing File Here</p>
        )}
      </div>
      <ul className={styles.fileList}>{files}</ul>
      {!myFiles.length && (
        <>
          <div className={styles.noteWrapper}>
            Only `.xls` or `.xslx` files allowed
          </div>
        </>
      )}
    </>
  );
};

export default Upload;
