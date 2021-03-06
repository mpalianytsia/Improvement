

/** @constructor */
app.Gallery = function() {

  /** 
   * @type {string}
   */
  var API_URL = 'http://api.flickr.com/services/feeds/photos_public.gne';

  /** 
   * @type {string}
   */
  var CONTAINER_ID = 'image-container';

  /** 
   * @type {string}
   */
  var NAV_PANEL_ID = 'nav-panel';
  
  /** 
   * @type{!utils.Message}
   * @private
   */
  var messages_ = new utils.Message;

  /** 
   * @type{!utils.Jsonp}
   * @private
   */
  var jsonp_ = new utils.Jsonp;

  /**
   * type{!utils.Storage}
   * @private
   */
  var storage_ = new utils.Storage;

  /**
   * Initializes module gallery.
   * @private
   */
  function init_() {
    container_ = document.getElementById(CONTAINER_ID);
    form_ = document.forms['search-form'];
    form_.onsubmit = onsubmit_;
    initNavPanel_();
  }

  /**
   * Performs onsubmit action.
   * @return {boolean}
   * @private
   */
  function onsubmit_() {
    /** @type {Element} */
      var searchArea = form_.elements['searching'];
    /** @type {string} */ var searchKey;
    /** @type {!Array} */ var tags = [];
    searchKey = searchArea.value;
    if (searchKey && searchKey.length) {
      messages_.show('info', 'Loading...');
      tags = toCorrectTag_(searchKey);
      jsonp_.req(API_URL, {tags: tags, format: 'json'},
        function(response) {
          draw_(response['items']);
          cacheResponse_(tags.split(','), response['items']);
          initNavPanel_();
      });
      searchArea.value = '';
    } else {
      messages_.show('error', 'Please enter keywords for search');
    }
    return false;
  }

  /**
   * Saves data in storage.
   * @param {Arrat} tags Array of entered keywords.
   * @param {Object} response Response object.
   */
  function cacheResponse_(tags, response) {
    /** @type {Object} */ var cache_;
    /** @type {number} */ var length = tags.length; 
    if (!storage_.get('cache')) cache_ = {};
    else cache_ = JSON.parse(storage_.get('cache'));
    for (/** @type {number} */ var i = 0; i < length;) {
      var tag = tags[i++];
      if (!(tag in cache_)) cache_[tag] = response; 
    }
    storage_.set('cache', JSON.stringify(cache_));
  }

  /**
   * Transform searched keywords into keywords array.
   * @param {string} keywords Searching keywords.
   * @return {!Array} Returns keyword's array.
   * @private
   */
  function toCorrectTag_(keywords) {
    return keywords.split(' ').join(',');
  }

  /**
   * Draws images from server's response.
   * @param {?Object} images Object with images.
   * @private
   */
  function draw_(images) {
    container_.innerHTML = '';
    /** @type {Element} */
    if (images && images.length) {
      /** @type {number} */ var length = images.length;
      for (/** @type {number} */ var i = 0; i < length; i++) {
        /** type {!Object} */ var image = images[i];
        container_.appendChild(createImage_(image));
      }
    } else {
      messages_.show('error', 'There are no images with entered tags.');
    }
  }

  /**
   * Creates single image.
   * @param {!Object} image Image's object.
   * @return {Element} Return image element.
   * @private
   */
  function createImage_(image) {
    /** @type {Element} */ var picture = document.createElement('IMG');
    picture.src = image['media']['m'];
    return picture;
  }

  /**
   * Draws navigation panel.
   * @private
   */
  function drawNavPanel_() {
    if (storage_.get('cache')) {
      /** @type {Array} */ var tags = JSON.parse(storage_.get('cache'));
      /** @type {Element} */
        var navPanel = document.getElementById(NAV_PANEL_ID);
      navPanel.innerHTML = '';
      for (/** @type {string} */ var key in tags) {
        navPanel.appendChild(createNavRow_(key));
      }
    }
  }

  /**
   * Creates navigation panel's row.
   * @param {string} keyword Searching keyword.
   * @return {Element} Returns table row element.
   * @private
   */
  function createNavRow_(keyword) {
    /** @type {Element} */ var row = document.createElement('LI');
    row.innerHTML = '<a href="#">' + keyword + '</a>';
    return row;
  }

  /**
   * Initializes navigation panel.
   * @private
   */
  function initNavPanel_() {
    drawNavPanel_();
    /** @type {Element} */ var navPanel = document.getElementById(NAV_PANEL_ID);
    /** @type {NodeList} */ var rows = navPanel.getElementsByTagName('LI');
    /** @type {number} */ var length = rows.length;
    for (/** @type {number} */ var i = 0; i < length; i++) {
      /** @type {Element} */ var row = rows[i];
      row.onclick = clickRow_;
    }
  }

  /**
   * Performs onclick action.
   * @private
   */
  function clickRow_() {
    /** @type {string} */
      var keyword = this.getElementsByTagName('A')[0].innerHTML;
    draw_(JSON.parse(storage_.get('cache'))[keyword]);
    initNavPanel_();
  }

  /**
   * Image container.
   * @type {Element}
   * @private
   */
  var container_ = null;

  /**
   * Search form. 
   * @type {Element}
   * @private
   */
  var form_ = null;

  init_();
};
