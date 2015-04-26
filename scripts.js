function formatTime(time, _24hr) {
  var h = time.getHours(),
      m = time.getMinutes();
  if (m < 10) { m = "0".concat(m); }

  if (_24hr) {
    return [h, m].join(":");
  }

  if (h > 12) {
    var pm = true;
    h = h % 12;
  }
  if (h === 0) { h = 12; }
  return [h, m].join(":") + (pm ? " pm" : " am");
}

function formatDate(date) {
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],

      day = date.getDay(),
      month = date.getMonth(),
      dayOfMonth = date.getDate();

  return days[day] + ", " + months[month] + " " + dayOfMonth;
}

function setDateTime(_24hr) {
  var now = new Date(),
      time = formatTime(now, _24hr),
      parts = time.split(" ");

  timeEl = document.querySelector("[role='time']");
  timeEl.textContent = parts[0];

  if (parts[1]) {
    var span = document.createElement("span");
    span.textContent = parts[1];
    timeEl.appendChild(span);
  }

  document.querySelector("[role='date']").textContent = formatDate(now);
}

function checkImgUrl(url) {
  return /\.(?:jpg|png|gif)(?!.)/.test(url) ? url : false;
}

function getPost(data, prefs) {
  var posts = data.data.children;
  posts[posts.length] = { data: {
    url: "/img/default.jpg",
    permalink: "",
    title: "No image link could be found in the top posts.",
    warning: true
  }};

  for (var i = 0; i < posts.length; i++) {
    if (prefs.nsfw === false && posts[i].data.over_18 === true) { continue; }
    if (checkImgUrl(posts[i].data.url)) { return posts[i]; }
  }
}

function setPost(post) {
  document.querySelector("[role='background']").style.backgroundImage =
    "url('".concat(post.data.url, "')");
  document.querySelector("[role='link']").setAttribute("href",
    "http://www.reddit.com".concat(post.data.permalink));
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

  req.onreadystatechange = function() {
    if (req.readyState === 4) {
      if (req.status === 200) {
        setPost(getPost(JSON.parse(this.responseText), prefs));
      } else {
        setPost({ data: { children: [{
          data: {
            url: "/img/default.jpg",
            permalink: "",
            title: "Uh oh. An error occurred getting posts.",
            warning: true
          }
        }] } });
      }
    }
  }
  req.open("GET", url, true);
  req.send();
}

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get(
    null
    , function(preferences) {
      setDateTime(preferences._24hr);
      setInterval(function() { setDateTime(preferences._24hr); } , 1000);

      var url = "http://www.reddit.com/r/".concat(
        (preferences.subreddit || "EarthPorn"),
        "/top.json?sort=top&t=",
        (preferences.period || "day")
      );
      getAllPosts(url, { nsfw: preferences.nsfw });
    });
});
