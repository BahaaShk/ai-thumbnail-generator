import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => console.log("MONGO DB connected"))
    await mongoose.connect(process.env.MONGODB_URI)
  } catch (error) {
    
  }
}