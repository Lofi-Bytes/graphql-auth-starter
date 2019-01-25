const { hash, compare } = require('bcrypt')
const { getUserId } = require('../utils')

const Mutation = {
  register: async (parent, { name, email, password }, context) => {
    const hashedPassword = await hash(password, 10)
    const user = await context.prisma.createUser({
      name,
      email,
      password: hashedPassword,
    })

    context.request.session.userId = user.id

    return {
      user,
    }
  },
  login: async (parent, { email, password }, context) => {
    const user = await context.prisma.user({ email })
    if (!user) {
      throw new Error(`No user found for email: ${email}`)
    }
    const passwordValid = await compare(password, user.password)
    if (!passwordValid) {
      throw new Error('Invalid password')
    }

    context.request.session.userId = user.id

    return {
      user,
    }
  },
  createDraft: async (parent, { title, content }, context) => {
    const userId = getUserId(context)
    return context.prisma.createPost({
      title,
      content,
      author: { connect: { id: userId } },
    })
  },
  deletePost: async (parent, { id }, context) => {
    return context.prisma.deletePost({ id })
  },
  publish: async (parent, { id }, context) => {
    return context.prisma.updatePost({
      where: { id },
      data: { published: true },
    })
  },
}

module.exports = {
  Mutation,
}
