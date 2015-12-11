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

function getType(post) {
  if (!/\.(jpg|png|gif)(?!v)/.test(post.data.url)) {
    return "unsupported";
  } else if (/\.gif/.test(post.data.url)) {
    return "gif";
  } else if (!post.data.preview) {
    return "noPreview";
  } else {
    return "preview";
  }
}

function getPost(data, prefs) {
  var posts = data.data.children;

  for (var i = 0; i < posts.length; i++) {
    if (prefs.nsfw === false && posts[i].data.over_18 === true) { continue; }

    var type = getType(posts[i]);
    if (type === "unsupported") {
      continue;
    } else if (type === "gif" || type === "noPreview") {
      posts[i].data.imgUrl = posts[i].data.url;
      return posts[i];
    } else if (type === "preview") {
      var images = posts[i].data.preview.images;

      for (var j = 0; j < images.length; j++) {
        posts[i].data.imgUrl = images[j].source.url;
        return posts[i];
      }
    }
  }

  return { data: {
    imgUrl: "/img/default.jpg",
    permalink: "",
    title: "No image could be found in the top posts.",
    warning: true
  }}
}

function setPost(post) {
  document.querySelector("[role='background']").style.backgroundImage =
    "url('" + post.data.imgUrl + "')";
  if (post.data.permalink) {
    document.querySelector("[role='link']").setAttribute("href",
      "http://www.reddit.com" + post.data.permalink);
  }
  document.querySelector("[role='title']").textContent = post.data.title;

  linkIconEl = document.querySelector("[role='link-icon']");
  if (post.data.warning) {
    linkIconEl.classList.add("warning");
  } else {
    linkIconEl.classList.remove("warning");
  }

  document.querySelector("[role='background']").classList.remove("hide");
}

function getAllPosts(url, prefs) {
  var req = new XMLHttpRequest();
  req.onload = function() {
    if (req.readyState === 4) {
      if (req.status === 200) {
        setPost(getPost(JSON.parse(this.responseText), prefs));
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
      if (prefs.showTime) {
        setTime(prefs._24hr);
        setInterval(function() { setTime(prefs._24hr); } , 1000);
      }

      if (prefs.showDate) {
        setDate();
        setInterval(function() { setDate(); } , 1000);
      }

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

      getAllPosts(url, { nsfw: prefs.nsfw });
    });

  document.querySelector("[role='settings']").addEventListener("click", function() {
      if(chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL('options.html'));
      }
  });
});

