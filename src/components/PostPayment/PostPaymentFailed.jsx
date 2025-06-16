import React from 'react'

const PostPaymentFailed = () => {
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
          ❌
        </div>
        
        <h1 style={{
          color: '#dc3545',
          fontSize: '24px',
          marginBottom: '16px',
          fontWeight: 'bold'
        }}>
          התשלום נכשל
        </h1>
        
        <p style={{
          color: '#666',
          fontSize: '16px',
          lineHeight: '1.5',
          marginBottom: '24px'
        }}>
          מצטערים, אירעה שגיאה במהלך עיבוד התשלום
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <button style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            נסה שנית
          </button>
          
          <button style={{
            backgroundColor: 'transparent',
            color: '#666',
            border: '1px solid #ddd',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer'
          }}>
            צור קשר עם התמיכה
          </button>
        </div>
      </div>
    </div>
  )
}

export default PostPaymentFailed