(function() {
  var clips = $.get('https://spreadsheets.google.com/feeds/list/1ZkQdqqcItaWeyinrCYibK0zmmw6_4HE3Zjgfe98cyeI/1/public/basic?alt=json', function(data) {

    var clipsByPublisher = data.feed.entry
      .map(function(entry) {
        var content = entry.content.$t;
        var publisher = entry.title.$t;
        var headline = content.match(/^headline:\s(.*),\slink:/)[1];
        var link = content.match(/link:\s(.*$)/)[1];

        return {
          publisher: publisher,
          headline: headline,
          link: link
        };
      })
      .reduce(function(groupedClips, clip) {
        var publisher = clip.publisher;

        if (!groupedClips[publisher]) {
          groupedClips[publisher] = [];
        }

        groupedClips[publisher].push(clip);

        return groupedClips;
      }, {});

    var publishers = Object.keys(clipsByPublisher);
    var clipsEl = document.querySelectorAll('#clips-content')[0];

    renderAccordion(clipsEl, publishers, clipsByPublisher, bindEventHandlers);
  });

  function renderAccordion(rootEl, publishers, clipsByPublisher, cb) {
    var accordion = document.createElement('div');
    var panels = publishers.reduce(function(panelStr, publisher) {
      var arrOfClips = clipsByPublisher[publisher];
      return panelStr + makePanel(publisher, arrOfClips);
    }, '');

    accordion.className = "accordion";
    $(accordion).append(panels);
    rootEl.appendChild(accordion);

    cb();
  }

  function makePanel(title, arrOfClips) {
    var anchoredClips = arrOfClips.reduce(function(strOfAnchors, clip) {
      return strOfAnchors + '<a target="_blank" href="' + clip.link + '">' + clip.headline + '</a>';
    }, '');

    return '<div class="accordion__container"><div class="accordion__menu"><h2>' + title + '</h2></div><div class="accordion__items">' + anchoredClips + '</div></div>';
  }

  function bindEventHandlers() {
    $('.accordion__menu').click(function() {
      $(this).parent().find('.accordion__items').slideToggle();
    });
  }
})();