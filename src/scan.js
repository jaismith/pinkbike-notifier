import {
  scrape,
} from './scrape';
import {
  getQueries,
  addResult,
  updateResult,
  getResult,
} from './mongo';

const scanPost = (_req, res) => {
  getQueries()
    .then((queries) => {
      for (let i = 0; i < queries.length; i += 1) {
        processQuery(queries[i], res);
      }

      res.status(200).end();
    })
    .catch(() => {
      console.log('Error retrieving queries');

      res.status(500).end();
    })
}

const processQuery = async function(query, res) {
  let { current, _id } = query;
  let url = query.query;

  if (current) {
    current = await getResult(current)

    if (!current) {
      console.log('Error retrieving last result');
        
      res.status(500).json({
        error: 'Something went wrong, please check the server logs',
      });
    }
  }

  if (!current || new Date().getTime() - new Date(current.timestamp).getTime() > query.frequency * 60000) {
    const scrapeResult = await scrape(url);
    console.log(scrapeResult);
    if (!scrapeResult) {
      console.log(`Error scraping query ${_id}`);

      res.status(500).end();
    }

    if (!current) {
      addResult({
        timestamp: new Date().toISOString(),
        data: scrapeResult
      }, _id)
        .then((id) => {
          if (id) {
            console.log(`Successfully created result ${id} for query ${_id}`);
          } else {
            console.log(`Error creating result for query ${_id}`);

            res.status(500);
          }
        });
    } else if (JSON.stringify(scrapeResult) !== JSON.stringify(current.data)) {
      updateResult(current._id, {
        timestamp: new Date().toISOString(),
        data: scrapeResult,
      })
        .then((success) => {
          if (success) {
            console.log(`Successfully updated result for query ${_id}`);
          } else {
            console.log(`Error updating result for query ${_id}`);

            res.status(500);
          }
        });
    } else {
      updateResult(current._id, {
        timestamp: new Date().toISOString(),
      })
        .then((success) => {
          if (success) {
            console.log(`Successfully renewed result for ${_id}`);
          } else {
            console.log(`Error renewing result for query ${_id}`);

            res.status(500);
          }
        });
    }
  } else {
    console.log(`Result ${current._id} for query ${_id} is up to date`);
  }
} 

export {
  scanPost,
};
