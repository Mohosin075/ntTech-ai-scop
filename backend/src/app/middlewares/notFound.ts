import { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

const notFound: RequestHandler = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `API Route Not Found: ${req.method} ${req.originalUrl}`,
  });
};

export default notFound;
