export class AppError extends Error {
  constructor(message, status = 500, extra = {}) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    Object.assign(this, extra);
  }
}
export default AppError;
  