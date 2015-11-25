var subredditEl = document.querySelector("[role='subreddit']"),
    sortEl = document.querySelector("[role='sort']"),
    periodEl = document.querySelector("[role='period']"),
    nsfwEl = document.querySelector("[role='nsfw']"),
    _24hrEl = document.querySelector("[role='_24hr']");
    showTimeEl = document.querySelector("[role='showTime']");
    showDateEl = document.querySelector("[role='showDate']");

function restoreOptions() {
  chrome.storage.sync.get({
    subreddit: "/r/EarthPorn",
    sort: "top",
    period: "day",
    nsfw: false,
    _24hr: false,
    showTime: true,
    showDate: true
  }, function(items) {
    subredditEl.value = items.subreddit;
    sortEl.value = items.sort;
    periodEl.value = items.period;
    nsfwEl.checked = items.nsfw;
    _24hrEl.checked = items._24hr;
    showTimeEl.checked = items.showTime;
    showDateEl.checked = items.showDate;
    checkPeriodDisabled();
  });
}

function checkPeriodDisabled() {
  periodEl.disabled = (sortEl.value === "top" || sortEl.value === "controversial") ? false : true;
}

function onClickSave() {
  chrome.storage.sync.set({
    subreddit: subredditEl.value,
    sort: sortEl.value,
    period: periodEl.value,
    nsfw: nsfwEl.checked,
    _24hr: _24hrEl.checked,
    showTime: showTimeEl.checked,
    showDate: showDateEl.checked
  }, function() {
    var status = document.querySelector("[role='status']");
    status.textContent = "Saved!";
    setTimeout(function() {
      status.textContent = "";
    }, 2000);
  });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
sortEl.addEventListener("change", checkPeriodDisabled);
document.querySelector("[role='save']").addEventListener("click",
    onClickSave);