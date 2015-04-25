function saveOptions() {
  var subreddit = document.querySelector("[role='subreddit']").value;
  var period = document.querySelector("[role='period']").value;
  var nsfw = document.querySelector("[role='nsfw']").checked;
  var _24hr = document.querySelector("[role='_24hr']").checked;

  chrome.storage.sync.set({
    subreddit: subreddit,
    period: period,
    nsfw: nsfw,
    _24hr: _24hr
  }, function() {
    var status = document.querySelector("[role='status']");
    status.textContent = "Preferences Saved";
    setTimeout(function() {
      status.textContent = "";
    }, 2000);
  });
}

function restoreOptions() {
  chrome.storage.sync.get({
    subreddit: "EarthPorn",
    period: "day",
    nsfw: false,
    _24hr: false
  }, function(items) {
    document.querySelector("[role='subreddit']").value = items.subreddit;
    document.querySelector("[role='period']").value = items.period;
    document.querySelector("[role='nsfw']").checked = items.nsfw;
    document.querySelector("[role='_24hr']").checked = items._24hr;
  });
}
document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("[role='save']").addEventListener("click",
    saveOptions);