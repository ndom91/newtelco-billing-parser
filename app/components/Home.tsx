import React, { useState, useEffect } from 'react'
import { ipcRenderer } from 'electron'
import styles from './Home.css'
import Filezone from './File'

const Home = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [mode, setMode] = useState('')

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
      <div className={`${styles.container} content`}>
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
          <button
            type='button'
            className={styles.menuIcon}
            onClick={() => setMode('')}
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
              <path d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1' />
            </svg>
          </button>
        </div>
        {mode === '' && (
          <div className={styles.selectionWrapper}>
            <button
              className={styles.centronBtn}
              onClick={() => setMode('centron')}
              type='button'
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
                <path d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
              </svg>
              Centron
            </button>
            <button
              className={styles.sheetsBtn}
              onClick={() => setMode('sheets')}
              type='button'
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
                <path d='M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2' />
              </svg>
              Sheets
            </button>
          </div>
        )}
        {mode === 'centron' ? (
          <Filezone />
        ) : mode === 'sheets' ? (
          <input name='sheet' />
        ) : null}
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
