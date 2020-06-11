import {
  addQuery,
  getQueries,
} from './mongo';

const queriesGet = (_req, res) => {
  getQueries()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch(() => {
      res.status(500).json({
        error: 'Something went wrong, please check the server logs.',
      });
    });
}

const queriesPost = (req, res) => {
  try {
    const query = {
      query: req.body.query,
      current: null,
      frequency: req.body.frequency,
    };

    addQuery(query)
      .then((id) => {
        res.status(200).json({ id });
      })
      .catch(() => {
        res.status(500).json({
          error: 'Something went wrong, please check the server logs.',
        });
      });
  } catch (_err) {
    res.status(400).json({
      error: 'Invalid request, please provide a valid query.',
    });
  }
}

export {
  queriesGet,
  queriesPost,
};
