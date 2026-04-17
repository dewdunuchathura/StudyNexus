const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({ ok: true, data });
};

const sendError = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({ ok: false, message });
};

module.exports = {
  sendError,
  sendSuccess,
};
