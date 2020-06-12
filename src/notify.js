import mail from '@sendgrid/mail';

import {
  getItemById,
} from './diff';

const notify = (changes, oldItems, newItems, email, queryId) => {
  const { added, removed, changed } = changes;

  mail.setApiKey(process.env.SENDGRID_API_KEY);

  added.forEach((id) => {
    const listing = getItemById(id, newItems);

    mail.send({
      to: email,
      from: 'pinkbike-notifier@jaismith.dev',
      subject: `Update from query ${queryId}`,
      text: 'NEW LISTING:'
            + `\n\n${listing.Name}`
            + `\n\nPrice: ${listing.Price}`
            + `\nFrame Size: ${listing.FrameSize}`
            + `\nWheel Size: ${listing.WheelSize}`
            + `\nFront Travel: ${listing.FrontTravel}`
            + `\nRear Travel: ${listing.RearTravel}`
            + `\nLocation: ${listing.Location}`
            + `\n\n${listing.Link}`,
    });
  });

  removed.forEach((id) => {
    const listing = getItemById(id, oldItems);

    mail.send({
      to: email,
      from: 'pinkbike-notifier@jaismith.dev',
      subject: `Update from query ${queryId}`,
      text: 'LISTING REMOVED:'
            + `\n\n${listing.Name}`
            + `\n\nPrice: ${listing.Price}`
            + `\nFrameSize: ${listing.FrameSize}`
            + `\nWheelSize: ${listing.WheelSize}`
            + `\nFrontTravel: ${listing.FrontTravel}`
            + `\nRearTravel: ${listing.RearTravel}`
            + `\nLocation: ${listing.Location}`
            + `\n\n${listing.Link}`,
    });
  });

  const ids = Object.getOwnPropertyNames(changed);
  ids.forEach((id) => {
    const oldListing = getItemById(id, oldItems);
    const newlisting = getItemById(id, newItems);
    let msg = `LISTING CHANGED:\n\n${newlisting.Name}\n`;

    changed[id].changed.forEach((field) => {
      msg += `\n${field}: ${oldListing[field]} -> ${newlisting[field]}`;
    });

    msg += `\n\n${newlisting.Link}`;

    mail.send({
      to: email,
      from: 'pinkbike-notifier@jaismith.dev',
      subject: `Update from query ${queryId}`,
      text: msg,
    });
  });
};

export default notify;
