function formatTime(now, _24hr) {
  var h = now.getHours(),
      m = now.getMinutes();
  if (m < 10) { m = "0" + m; }

  if (_24hr) {
    return [h, m].join(":");
  }

  if (h >= 12) {
    var pm = true;
    h = h % 12;
  }
  if (h === 0) { h = 12; }
  return [h, m].join(":") + (pm ? " pm" : " am");
}

function formatDate(now) {
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],

  day = now.getDay(),
  month = now.getMonth(),
  dayOfMonth = now.getDate();

  return days[day] + ", " + months[month] + " " + dayOfMonth;
}

function setTime(_24hr) {
  var now = new Date;
      time = formatTime(now, _24hr),
      parts = time.split(" ");

  timeEl = document.querySelector("[role='time']");
  timeEl.textContent = parts[0];

  if (parts[1]) {
    var span = document.createElement("span");
    span.textContent = parts[1];
    timeEl.appendChild(span);
  }
}

function setDate() {
  document.querySelector("[role='date']").textContent = formatDate(new Date);
}

function getPost(data) {
  var posts = data.data.children;

  for (var i = 0; i < posts.length; i++) {
    // Skip NFSW posts
    if (posts[i].data.over_18 === true) { continue; }

    // Check type
    if (!/\.(jpg|jpeg|png|gif)(?!v)/.test(posts[i].data.url)) {
      continue;
    }

    // Check width
    var width = posts[i].data.preview.images[0].source.width;
    var widestImageWidth = 0;
    var widestImageIndex = 0;
    if (width < window.innerWidth) {
      if (width > widestImageWidth) { widestImageIndex = i; }

      if (i === posts.length - 1) {
        i = widestImageIndex;
      } else {
        continue;
      }
    }

    // Return
    posts[i].data.imgUrl = posts[i].data.url;
    return posts[i];
  }

  return { data: {
    imgUrl: "/img/default.jpg",
    permalink: "",
    title: "No image could be found in the top posts.",
    warning: true
  }}
}

function setPost(post) {
  //console.log(post.data)
  document.querySelector("[role='background']").style.backgroundImage =
    "url('" + post.data.imgUrl + "')";
  if (post.data.permalink) {
    document.querySelector("[role='link']").setAttribute("href",
      "http://www.reddit.com" + post.data.permalink);
  }
  document.querySelector("[role='title']").innerHTML = post.data.title;

  linkIconEl = document.querySelector("[role='link-icon']");
  if (post.data.warning) {
    linkIconEl.classList.add("warning");
  } else {
    linkIconEl.classList.remove("warning");
  }

  document.querySelector("[role='background']").classList.remove("hide");
}

function getAllPosts(url) {
  var req = new XMLHttpRequest();
  req.onload = function() {
    if (req.readyState === 4) {
      if (req.status === 200) {
        setPost(getPost(JSON.parse(this.responseText)));
      } else {
        setPost({
          data: {
            imgUrl: "/img/default.jpg",
            permalink: "",
            title: "Uh oh. An error occurred getting posts.",
            warning: true
          }
        });
      }
    }
  }
  req.open("GET", url, true);
  req.send();
}

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get(
    null
    , function(prefs) {
      // Set everything up
      if (prefs.showTime === undefined) { prefs.showTime = true; }
      if (prefs.showDate === undefined) { prefs.showDate = true; }
      if (!prefs.subreddit) { prefs.subreddit = "/r/EarthPorn"; }

      if (prefs.subreddit.charAt(0) !== "/") {
        prefs.subreddit = "/" + prefs.subreddit;
      }

      if ((prefs.subreddit.indexOf("/m/") === -1) &&
          (prefs.subreddit.indexOf("/r/") === -1)) {
        prefs.subreddit = "/r" + prefs.subreddit;
      }

      var url = "http://www.reddit.com" + (prefs.subreddit) + "/" + (prefs.sort || "top") + ".json";
      if (prefs.sort === "top" || prefs.sort === "controversial") {
        url += "?t=" + (prefs.period || "day");
      }

      // Execute
      if (prefs.showTime) {
        setTime(prefs._24hr);
        setInterval(function() { setTime(prefs._24hr); } , 1000);
      }

      if (prefs.showDate) {
        setDate();
        setInterval(function() { setDate(); } , 1000);
      }

      getAllPosts(url);
    });

  document.querySelector("[role='settings']").addEventListener("click", function() {
      if(chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL('options.html'));
      }
  });
});

