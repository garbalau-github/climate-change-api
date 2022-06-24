const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');
const PORT = process.env.PORT || 8000;

const app = express();

const newspapers = [
  {
    name: 'cityam',
    address:
      'https://www.cityam.com/london-must-become-a-world-leader-on-climate-change-action/',
    base: '',
  },
  {
    name: 'thetimes',
    address: 'https://www.thetimes.co.uk/environment/climate-change',
    base: '',
  },
  {
    name: 'theguardian',
    address: 'https://www.theguardian.com/environment/climate-crisis',
    base: '',
  },
  {
    name: 'telegraph',
    address: 'https://www.telegraph.co.uk/climate-change',
    base: 'https://www.telegraph.co.uk',
  },
  {
    name: 'nytimes',
    address: 'https://www.nytimes.com/international/section/climate',
    base: '',
  },
  {
    name: 'latimes',
    address: 'https://www.latimes.com/environment',
    base: '',
  },
  {
    name: 'smh',
    address: 'https://www.smh.com.au/environment/climate-change',
    base: 'https://www.smh.com.au',
  },
  {
    name: 'un',
    address: 'https://www.un.org/climatechange',
    base: '',
  },
  {
    name: 'bbc',
    address: 'https://www.bbc.co.uk/news/science_and_environment',
    base: 'https://www.bbc.co.uk',
  },
  {
    name: 'standard',
    address: 'https://www.standard.co.uk/topic/climate-change',
    base: 'https://www.standard.co.uk',
  },
  {
    name: 'thesun',
    address: 'https://www.thesun.co.uk/topic/climate-change-environment/',
    base: '',
  },
  {
    name: 'dailymail',
    address:
      'https://www.dailymail.co.uk/news/climate_change_global_warming/index.html',
    base: '',
  },
  {
    name: 'nypost',
    address: 'https://nypost.com/tag/climate-change/',
    base: '',
  },
];

const articles = [];

const scrapArticles = () => {
  newspapers.forEach((newspaper) => {
    axios
      .get(newspaper.address)
      .then((response) => {
        const html = response.data;
        const $ = cheerio.load(html);
        $('a:contains("climate")', html).each(function () {
          const title = $(this).text();
          const url = $(this).attr('href');
          articles.push({
            title,
            url: newspaper.base + url,
            source: newspaper.name,
          });
        });
      })
      .catch((err) => {
        console.log(`Error: ${err}`);
      });
  });
};

scrapArticles();

app.get('/', (req, res) => {
  return res.send('Welcome to Climate Change News API');
});

app.get('/news', (req, res) => {
  return res.json(articles);
});

app.get('/news/:name', (req, res) => {
  try {
    const address = newspapers.filter(
      (news) => news.name === req.params.name
    )[0].address;

    const base = newspapers.filter((news) => news.name === req.params.name)[0]
      .base;

    axios
      .get(address)
      .then((response) => {
        const html = response.data;
        const $ = cheerio.load(html);
        const specifiedArticles = [];
        $('a:contains("climate")', html).each(function () {
          const title = $(this).text();
          const url = $(this).attr('href');
          specifiedArticles.push({
            title,
            url: base + url,
            source: address,
          });
        });
        res.json(specifiedArticles);
      })
      .catch((err) => {
        console.log(`Error: ${err}`);
      });
  } catch (err) {
    res.status(404).send({ message: 'Oops, no newspaper!' });
  }
});

app.listen(PORT, () => console.log(`API running on port: ${PORT}!`));
