import React from 'react';
import styles from './Home.css';
import Upload from './upload';

const Home = () => {
  return (
    <div
      className={styles.container}
      style={{ margin: '10px', width: 'calc(100% - 20px)' }}
    >
      <div>
        <h2 className={styles.header}>Newtelco Billing Parser</h2>
      </div>
      <Upload />
    </div>
  );
};

export default Home;
