import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoConfig = {
  url: process.env.MONGODB_URI,
  dbName: process.env.MONGODB_NAME,
};

export async function addQuery(query) {
  const client = new MongoClient(mongoConfig.url, { useUnifiedTopology: true });

  let id = null;

  try {
    await client.connect();

    const db = client.db(mongoConfig.dbName);
    const r = await db.collection('queries').insertOne(query);

    if (r.insertedCount !== 1) {
      console.log('Error writing query (insertion op failed');
    } else {
      id = r.insertedId;
    }
  } catch (err) {
    console.log('Error writing query', err.stack);
  }

  client.close();

  return id;
}

export async function getQueries() {
  const client = new MongoClient(mongoConfig.url, { useUnifiedTopology: true });

  let result = null;

  try {
    await client.connect();

    const db = client.db(mongoConfig.dbName);

    result = await db.collection('queries').find().toArray();
  } catch (err) {
    console.log('Error retrieving queries', err.stack);
  }

  client.close();

  return result;
}

export async function addResult(result, queryId) {
  const client = new MongoClient(mongoConfig.url, { useUnifiedTopology: true });

  let id = null;

  try {
    await client.connect();

    const db = client.db(mongoConfig.dbName);
    const resultsOp = await db.collection('results').insertOne(result);

    if (resultsOp.insertedCount !== 1) {
      console.log('Error writing result (insertion op failed)');
    } else {
      const queryOp = await db.collection('queries').updateOne(
        { _id: queryId },
        {
          $set: {
            current: resultsOp.insertedId,
          },
        },
      );

      if (queryOp.modifiedCount !== 1) {
        console.log('Error updating query');
      } else {
        id = resultsOp.insertedId;
      }
    }
  } catch (err) {
    console.log('Error writing result');
  }

  client.close();

  return id;
}

export async function updateResult(id, result) {
  const client = new MongoClient(mongoConfig.url, { useUnifiedTopology: true });

  let success = false;

  try {
    await client.connect();

    const db = client.db(mongoConfig.dbName);
    const r = await db.collection('results').updateOne({ _id: id }, { $set: result });

    if (r.modifiedCount !== 1) {
      console.log('Error updating result (update op failed)');
    } else {
      success = true;
    }
  } catch (err) {
    console.log('Error updating result');
  }

  client.close();

  return success;
}

export async function getResult(id) {
  const client = new MongoClient(mongoConfig.url, { useUnifiedTopology: true });

  let result = null;

  try {
    await client.connect();

    const db = client.db(mongoConfig.dbName);

    result = await db.collection('results').findOne({ _id: id });
  } catch (err) {
    console.log('Error retrieving result', err.stack);
  }

  client.close();

  return result;
}
