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
    var accordionEl = document.querySelectorAll('#accordion')[0];

    renderAccordion($(accordionEl), publishers, clipsByPublisher, bindEventHandlers);
  });

  function renderAccordion($rootEl, publishers, clipsByPublisher, cb) {
    var panels = publishers.map(function(publisher) {
      return $(makePanel(publisher, clipsByPublisher[publisher]));
    });

    var appendInterval = setInterval(function() {
      if (panels.length) {
        var $panel = panels.splice(0, 1)[0];

        $rootEl.append($panel);
        $panel.fadeIn()
      } else {
        clearInterval(appendInterval);
      }
    }, 125);

    cb();
  }

  function makePanel(title, arrOfClips) {
    var anchoredClips = arrOfClips.reduce(function(strOfAnchors, clip) {
      return strOfAnchors + '<li><div><a target="_blank" href="' + clip.link + '">' + clip.headline + '</a></div></li>';
    }, '');

    return '<div class="accordion__container"><div class="accordion__menu"><h3>' + title + '</h3></div><ul class="accordion__items">' + anchoredClips + '</ul></div>';
  }

  function bindEventHandlers() {
    $('#accordion').on('click', '.accordion__menu', function() {
      $(this).parent().find('.accordion__items').slideToggle();
    });
  }
})();
