 const errorHandling = (err, req, res, next) => {
    let statusCode = err.status || 500;
    let message = err.message || "Sorry an error occurred";
    res.status(statusCode).json({
      type: 'error',
      message: message,
    });
  };
  module.exports={errorHandling};
  