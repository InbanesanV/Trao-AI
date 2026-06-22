import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('❌ MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  let retries = 5;
  const retryDelay = 3000;

  while (retries > 0) {
    try {
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected.');
      });

      return;
    } catch (error) {
      retries -= 1;
      const err = error as Error;
      console.error(`❌ MongoDB connection failed: ${err.message}`);

      if (retries === 0) {
        console.error('🚨 All MongoDB connection retries exhausted. Exiting.');
        process.exit(1);
      }

      console.log(`🔄 Retrying MongoDB connection in ${retryDelay / 1000}s... (${retries} attempts remaining)`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
};

export default connectDB;
