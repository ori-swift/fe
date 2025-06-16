import React from 'react'

const PostPaymentSuccess = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa',
      fontFamily: 'Arial, sans-serif',
      direction: 'rtl'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '400px'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          ✅
        </div>
        
        <h1 style={{
          color: '#28a745',
          fontSize: '24px',
          marginBottom: '16px',
          fontWeight: 'bold'
        }}>
          התשלום בוצע בהצלחה!
        </h1>
        
        <p style={{
          color: '#666',
          fontSize: '16px',
          lineHeight: '1.5',
          margin: '0'
        }}>
          כעת תוכל ליהנות מכל השירותים במערכת
        </p>
      </div>
    </div>
  )
}

export default PostPaymentSuccess