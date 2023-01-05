chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "reshow-popup",
        title: "Reshow Popup",
        contexts:["action"],
    });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) { 
    chrome.tabs.sendMessage(tab.id, {action: "reshow_popup"});
});