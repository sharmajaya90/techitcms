// Error controller for handling application errors

// Handle 404 errors
exports.notFound = (req, res, next) => {
    const error = new Error(`Page Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
};

// Handle general errors
exports.handleError = (err, req, res, next) => {
    const statusCode = err.status || 500;
    
    // Check if it's an API request
    const isApiRequest = req.originalUrl.startsWith('/api');
    
    if (isApiRequest) {
        // Return JSON response for API requests
        return res.status(statusCode).json({
            success: false,
            message: err.message || 'An error occurred',
            stack: process.env.NODE_ENV === 'production' ? null : err.stack
        });
    }
    
    // Render error page for HTML requests
    res.status(statusCode).render('pages/error', {
        pageTitle: `Error ${statusCode}`,
        message: err.message || 'Something went wrong',
        error: err,
        currentPage: 'error',
        scripts: []
    });
}; 