class AuthError extends Error {
  constructor() {
    super('Not authorized')
  }
}

function getUserId(context) {
  if (context.request.session.userId) {
    return context.request.session.userId
  }

  throw new AuthError()
}

module.exports = {
  getUserId,
}
