'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class DragErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    }
  }
  
  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error,
      errorInfo: null
    }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 DRAG_ERROR_BOUNDARY: Drag-and-drop error caught:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })
    
    // Log additional context for debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })
  }
  
  handleReset = () => {
    console.log('🔄 DRAG_ERROR_BOUNDARY: Resetting error boundary')
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null
    })
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          margin: '20px',
          border: '2px solid #dc3545',
          borderRadius: '8px',
          backgroundColor: '#f8d7da',
          color: '#721c24'
        }}>
          <h2 style={{ marginTop: 0, color: '#721c24' }}>
            🚨 Drag-and-Drop Error
          </h2>
          
          <div style={{ marginBottom: '16px' }}>
            <strong>Something went wrong with the drag-and-drop system:</strong>
          </div>
          
          {this.state.error && (
            <div style={{ 
              backgroundColor: '#f5c6cb',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '16px',
              fontFamily: 'monospace',
              fontSize: '14px',
              whiteSpace: 'pre-wrap'
            }}>
              <strong>Error:</strong> {this.state.error.message}
              {this.state.error.stack && (
                <details style={{ marginTop: '8px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                    Stack Trace
                  </summary>
                  <pre style={{ 
                    marginTop: '8px', 
                    fontSize: '12px',
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}>
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}
          
          {this.state.errorInfo && (
            <details style={{ marginBottom: '16px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Component Stack
              </summary>
              <pre style={{ 
                marginTop: '8px',
                fontSize: '12px',
                backgroundColor: '#f5c6cb',
                padding: '8px',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '150px'
              }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={this.handleReset}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🔄 Try Again
            </button>
            
            <button 
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔃 Reload Page
            </button>
            
            <button 
              onClick={() => {
                console.clear()
                this.handleReset()
              }}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🧹 Clear Console & Reset
            </button>
          </div>
          
          <div style={{ 
            marginTop: '16px', 
            fontSize: '14px',
            color: '#856404',
            backgroundColor: '#fff3cd',
            padding: '12px',
            borderRadius: '4px',
            border: '1px solid #ffeaa7'
          }}>
            <strong>💡 Troubleshooting Tips:</strong>
            <ul style={{ marginTop: '8px', marginBottom: 0 }}>
              <li>Try refreshing the page</li>
              <li>Check browser console for additional errors</li>
              <li>Ensure you're using a supported browser</li>
              <li>On mobile devices, try switching between portrait/landscape</li>
            </ul>
          </div>
        </div>
      )
    }
    
    return this.props.children
  }
}

export default DragErrorBoundary
