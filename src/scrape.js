import cheerio from 'cheerio';
import axios from 'axios';

export async function scrape(url) {
  let finished = false;

  try {
    let allResults = [];
    let currentPage = url;

    while (!finished) {
      const raw = await axios.get(currentPage);
      const data = cheerio.load(raw.data);

      const items = data('div[class=bsitem]');

      let results = [];
      items.each((itemIndex, itemElement) => {
        const content = data(itemElement).find(' > table > tbody > tr > td:nth-child(2)');

        let item = {};

        const title = content.find('div > a');
        const properties = content.find('div > div');
        const bottomProperties = content.find('table > tbody > tr > td');

        item.Id = data(itemElement).attr('id');
        item.Name = title.text();
        item.Link = title.attr('href');
        
        properties.each((_propIndex, propElement) => {
          const prop = data(propElement).text().trim().split(' :  ');
          item[prop[0].replace(' ', '')] = prop[1];
        });

        item.Location = bottomProperties.first().text().trim();
        item.Price = bottomProperties.find('b').text().trim().split(':')[1].split('[')[0];

        results.push(item);
      });

      const nextPage = data('td[class=pageNumbers] > ul > li > a[rel=next]').attr('href');

      currentPage = `${currentPage.split('?')[0]}${nextPage}`;

      allResults.push(...results);
      finished = nextPage == null;
    }

    return allResults;
  } catch (err) {
    console.log('Error scanning site', err.stack);
  }
}
