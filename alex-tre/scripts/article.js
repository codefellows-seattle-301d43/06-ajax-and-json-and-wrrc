'use strict';

function Article(rawDataObj) {
  this.author = rawDataObj.author;
  this.authorUrl = rawDataObj.authorUrl;
  this.title = rawDataObj.title;
  this.category = rawDataObj.category;
  this.body = rawDataObj.body;
  this.publishedOn = rawDataObj.publishedOn;
}

// REVIEW: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// COMMENT: Why isn't this method written as an arrow function?
// You can't use arrow function inside constructor function being that this refers to the window object.
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt(
    (new Date() - new Date(this.publishedOn)) / 60 / 60 / 24 / 1000
  );

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // Tenary, it's a short way to handle conditional statements.
  this.publishStatus = this.publishedOn
    ? `published ${this.daysAgo} days ago`
    : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// The function is called at the
Article.loadAll = articleData => {
  articleData.sort((a, b) => new Date(b.publishedOn) - new Date(a.publishedOn));

  articleData.forEach(articleObject =>
    Article.all.push(new Article(articleObject))
  );
};

Article.populateArticles = () => {
  Article.all.forEach(article => {
    $('#articles').append(article.toHtml());
  });
  articleView.populateFilters();
  articleView.handleCategoryFilter();
  articleView.handleAuthorFilter();
  articleView.handleMainNav();
  articleView.setTeasers();
};

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAndAppendArticles = () => {
  // REVIEW: What is this 'if' statement checking for? Where was the rawData set to local storage?
  let dataUrl = 'data/hackerIpsum.json';
  let logErr = err => console.log(`HTTP error code: ${err.status}`);
  $.ajax({ url: dataUrl, type: 'HEAD' })
    .then((data, msg, xhr) => {
      return xhr.getResponseHeader('eTag');
    })
    .done(eTag => {
      if (localStorage.getItem('eTag') === eTag && localStorage.rawData) {
        console.info('read local');
        Article.loadAll(JSON.parse(localStorage.getItem('rawData')));
        Article.populateArticles();
      } else if (
        localStorage.getItem('eTag') !== eTag ||
        !localStorage.rawData ||
        !localStorage.eTag
      ) {
        console.info('fetch by ajax');
        localStorage.setItem('eTag', eTag);
        $.ajax({
          url: dataUrl,
          success: data => {
            //In order to get all the article on the page we need to process a construction of our array of articles inside the callback. Otherwise, we fetch without waiting for data and start processing.
            Article.loadAll(data);
            Article.populateArticles();
            localStorage.setItem('rawData', JSON.stringify(data));
          },
          error: logErr
        });
      }
    })
    .fail(logErr);
};
