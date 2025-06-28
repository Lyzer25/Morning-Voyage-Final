'use client'

import { Component, ReactNode, ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: 'page' | 'section' | 'component'
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error Boundary caught an error:', error)
      console.error('📋 Component Stack:', errorInfo.componentStack)
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo)

    // In production, you might want to send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      // reportError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  renderErrorUI() {
    const { level = 'component' } = this.props
    const { error } = this.state

    // Page-level error (most critical)
    if (level === 'page') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7] flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-white/90 backdrop-blur-xl shadow-2xl border-0">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-2xl font-bold text-[#4B2E2E] mb-3">
                Something went wrong
              </h1>
              
              <p className="text-[#6E6658] mb-6 leading-relaxed">
                We&apos;re sorry, but this page encountered an unexpected error. Our team has been notified.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] hover:from-[#6E6658] hover:to-[#4B2E2E] text-white rounded-xl"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="w-full border-[#4B2E2E] text-[#4B2E2E] hover:bg-[#4B2E2E] hover:text-white rounded-xl"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && error && (
                <details className="mt-6 text-left">
                  <summary className="text-sm text-[#6E6658] cursor-pointer hover:text-[#4B2E2E]">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-red-50 rounded-lg text-xs text-red-800 font-mono">
                    {error.toString()}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    // Section-level error (moderate impact)
    if (level === 'section') {
      return (
        <Card className="bg-red-50 border-red-200 my-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 mb-1">
                  Section Unavailable
                </h3>
                <p className="text-red-700 text-sm mb-3">
                  This section couldn&apos;t load properly. You can try refreshing or continue browsing.
                </p>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={this.handleRetry}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Component-level error (minimal impact)
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-2">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-yellow-800 text-sm font-medium">
              Component Error
            </p>
            <p className="text-yellow-700 text-xs mt-1">
              This component failed to load. 
              <button 
                onClick={this.handleRetry}
                className="underline hover:no-underline ml-1"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || this.renderErrorUI()
    }

    return this.props.children
  }
}

// HOC for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

export default ErrorBoundary
