import mongoose from 'mongoose';
import { getConnectionString, databaseName } from './config';

mongoose
  .connect(getConnectionString(), {
    useNewUrlParser: true,
    dbName: databaseName,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .catch(console.error.bind(console, 'DB connection error:'));

const conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'DB connection error:'));
conn.once('open', () => {
  console.info('Connected to DB');
});

export default mongoose;
