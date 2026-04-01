import '../styles/globals.css';
import '../src/firebase';
import Head from 'next/head';
import { useEffect } from 'react';

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Inline protection - runs immediately
    const script = document.createElement('script');
    script.innerHTML = `
      (function() {
        const isAdmin = () => {
          try {
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            return user.email === 'adityaghoghari01@gmail.com';
          } catch { return false; }
        };
        
        if (!isAdmin()) {
          // Block F12 and shortcuts immediately
          document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                (e.ctrlKey && e.key === 'u')) {
              e.preventDefault();
              alert('चालाकी मत कर! तेरा बाप हूं मैं! 👊');
              return false;
            }
          }, true);
          
          // Block right click immediately
          document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            alert('चालाकी मत कर! तेरा बाप हूं मैं! 👊');
            return false;
          }, true);
        }
      })();
    `;
    document.head.appendChild(script);
  }, []);
  
  return (
    <>
      <Head>
        <title>Science and Fun - Educational Platform</title>
        <meta name="description" content="Learn science with fun!" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
