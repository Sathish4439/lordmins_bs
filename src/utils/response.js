function sendSuccess(res, message, data = {}) {
  return res.status(200).json({
    success: true,
    message,
    data
  });
}

function sendError(res, message, status = 400) {
  return res.status(status).json({
    success: false,
    message
  });
}

module.exports = { sendSuccess, sendError };
