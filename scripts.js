function formatTime(time, _24hr) {
  var h = time.getHours();
  var m = time.getMinutes();
  if (m < 10) { m = "0".concat(m); }

  if (_24hr) {
    return [h, m].join(":");
  } else {
    if (h > 12) {
      var pm = true;
      h = h % 12;
    }
    if (h === 0) { h = 12; }
    return [h, m].join(":") + (pm ? " pm" : " am");
  }
}

function formatDate(date) {
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  var day = date.getDay();
  var month = date.getMonth();
  var dayOfMonth = date.getDate();

  return days[day] + ", " + months[month] + " " + dayOfMonth;
}

function setDateTime(_24hr) {
  var now = new Date;
  var time = formatTime(now, _24hr);
  var parts = time.split(" ");

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
  return /\.(?:jpg|png|gif)(?!.)/.test(url) ? url : false
}

function setPost(data, prefs) {
  var posts = data.data.children;
  posts[posts.length] = { data: {
    url: "/img/default.jpg",
    permalink: "",
    title: "No image link could be found in the top posts.",
    warning: true
  }};

  for (var i = 0; i < posts.length; i++) {
    if (prefs.nsfw === false && posts[i].data.over_18 === true) { continue; }
    var imgUrl = checkImgUrl(posts[i].data.url);

    if (imgUrl) {
      document.querySelector("[role='background']").style.backgroundImage =
        "url('".concat(imgUrl, "')");
      document.querySelector("[role='link']").setAttribute("href",
        "http://www.reddit.com".concat(posts[i].data.permalink));
      document.querySelector("[role='title']").textContent = posts[i].data.title;

      linkIconEl = document.querySelector("[role='link-icon']");
      if (posts[i].data.warning) {
        linkIconEl.classList.add("warning");
      } else {
        linkIconEl.classList.remove("warning");
      }
      break;
    }
  }

  document.querySelector("[role='background']").classList.remove("hide");
}

function getPosts(url, prefs) {
  var req = new XMLHttpRequest();

  req.onreadystatechange = function() {
    if (req.readyState === 4) {
      if (req.status === 200) {
        setPost(JSON.parse(this.responseText), prefs);
      } else {
        setPost({ data: { children: [{
          data: {
            url: "/img/default.jpg",
            permalink: "",
            title: "Uh oh. An error occurred getting posts.",
            warning: true
          }
        }] } }, prefs);
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
      getPosts(url, { nsfw: preferences.nsfw });
    });
});
