import React from 'react';
import { useStory } from '../context';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      preservedIllustrations: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Try to preserve illustrations from context if available
    try {
      const storyContext = this.context;
      if (storyContext?.bookIllustrations) {
        this.setState({ preservedIllustrations: storyContext.bookIllustrations });
        
        // Also try to save to session storage as last resort backup
        sessionStorage.setItem(
          'preserved_illustrations', 
          JSON.stringify(storyContext.bookIllustrations)
        );
      }
    } catch (e) {
      console.error('Failed to preserve illustrations:', e);
    }
  }

  render() {
    if (this.state.hasError) {
      const hasPreservedIllustrations = this.state.preservedIllustrations || 
        sessionStorage.getItem('preserved_illustrations');

      return (
        <div className="p-4 md:p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            {hasPreservedIllustrations && (
              <p className="text-green-600 mt-2">
                Don't worry! Your illustrations have been preserved.
              </p>
            )}
            <div className="flex justify-center gap-4 mt-4">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Try Again
              </button>
              {hasPreservedIllustrations && (
                <button 
                  onClick={() => {
                    // Download preserved illustrations
                    const illustrations = this.state.preservedIllustrations || 
                      JSON.parse(sessionStorage.getItem('preserved_illustrations'));
                    
                    illustrations.forEach((uri, index) => {
                      const link = document.createElement('a');
                      link.href = uri;
                      link.download = `illustration-${index + 1}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    });
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Download Illustrations
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.contextType = useStory;

export default ErrorBoundary; 