function onClickSave() {
  var subreddit = document.querySelector("[role='subreddit']").value,
      period = document.querySelector("[role='period']").value,
      nsfw = document.querySelector("[role='nsfw']").checked,
      _24hr = document.querySelector("[role='_24hr']").checked;
      showTime = document.querySelector("[role='showTime']").checked;
      showDate = document.querySelector("[role='showDate']").checked;

  chrome.storage.sync.set({
    subreddit: subreddit,
    period: period,
    nsfw: nsfw,
    _24hr: _24hr,
    showTime: showTime,
    showDate: showDate
  }, function() {
    var status = document.querySelector("[role='status']");
    status.textContent = "Saved!";
    setTimeout(function() {
      status.textContent = "";
    }, 2000);
  });
}

function restoreOptions() {
  chrome.storage.sync.get({
    subreddit: "/r/EarthPorn",
    period: "day",
    nsfw: false,
    _24hr: false,
    showTime: true,
    showDate: true
  }, function(items) {
    document.querySelector("[role='subreddit']").value = items.subreddit;
    document.querySelector("[role='period']").value = items.period;
    document.querySelector("[role='nsfw']").checked = items.nsfw;
    document.querySelector("[role='_24hr']").checked = items._24hr;
    document.querySelector("[role='showTime']").checked = items.showTime;
    document.querySelector("[role='showDate']").checked = items.showDate;
  });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("[role='save']").addEventListener("click",
    onClickSave);