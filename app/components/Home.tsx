import React, { useState, useEffect } from 'react'
import { ipcRenderer } from 'electron'
import styles from './Home.css'
import Filezone from './File'

const Home = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false)

  useEffect(() => {
    const body = document.querySelector('body')
    if (body) {
      if (sidebarVisible) {
        body.classList.add('shazam')
      } else {
        body.classList.remove('shazam')
      }
    }
  }, [sidebarVisible])

  const quitApplication = () => {
    ipcRenderer.send('app-quit')
  }

  const openAbout = () => {
    ipcRenderer.send('open-about')
  }

  return (
    <>
      <div
        className={`${styles.container} content`}
        style={{ margin: '10px', width: 'calc(100% - 20px)' }}
      >
        <div className={styles.headerWrapper}>
          <button
            type='button'
            className={styles.menuIcon}
            onClick={() => setSidebarVisible(!sidebarVisible)}
          >
            <svg
              width='36'
              height='36'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              viewBox='0 0 24 24'
              stroke='#bcbcbc'
            >
              <path d='M4 6h16M4 12h8m-8 6h16' />
            </svg>
          </button>
          <span className={styles.headerText}>
            <h2 className={styles.header}>Billing Verification</h2>
          </span>
        </div>
        <Filezone />
      </div>
      <ul className='menu_items'>
        <li>
          <button type='button'>
            <i className='icon fa fa-book fa-lg' />
            History
          </button>
        </li>
        <li>
          <button type='button' onClick={quitApplication}>
            <i className='icon fa fa-sign-out-alt fa-lg' />
            Quit
          </button>
        </li>
      </ul>
      <ul className='menu_items_right'>
        <li>
          <button type='button' onClick={openAbout}>
            About
            <i className='icon fa fa-question fa-lg' />
          </button>
        </li>
      </ul>
    </>
  )
}

export default Home
