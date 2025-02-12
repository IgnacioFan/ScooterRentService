export const ERROR_MESSAGES = {
  RENT_COMPLETED: 'The rent is completed',
  RENT_NOT_FOUND: 'The rent is not found',
  SCOOTER_NOT_FOUND: 'The scooter is not found',
  SCOOTER_NOT_AVAILABLE: (scooterId: number) =>
    `Scooter ${scooterId} is not available`,
  UNCOMPLETED_RENT: (userId: number) =>
    `User ${userId} has an uncompleted rental`,
  USER_NOT_FOUND: 'User not found',
  PAYMENT_FAILED: 'Payment failed',
};

export const RENT_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
};
