/**
 * eslint esversion: 6
 */

const Command = {
    PIN: 'tab_utils_tab_pin',
    UNPIN: 'tab_utils_tab_unpin',
    MOVE_LEFT: 'tab_utils_tab_move_left',
    MOVE_RIGHT: 'tab_utils_tab_move_right',
    MOVE_END: 'tab_utils_tab_move_end',
    MOVE_START: 'tab_utils_tab_move_start',
    GROUP_BY_DOMAIN: 'tab_utils_group_by_domain'
};

function main() {
    initCommands();
    console.debug('Tab utils initialized!');
}

/**
 * Execute `cb` passing the current tab
 */
function getCurrentTab(cb) {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
        cb(tabs[0]);
    });
}

/**
 * Execute `cb` passing an array of all highlighted tabs.
 */
function getActiveTabs(cb) {
    chrome.tabs.query({highlighted: true}, (tabs) => {
        cb(tabs);
    });
}

function moveTabRight() {
    console.debug('Move tab right');
    getCurrentTab((tab) => {
        chrome.tabs.move(tab.id, {index: tab.index + 1});
    });
}

function moveTabLeft() {
    console.debug('Move tab left');
    getCurrentTab((tab) => {
        chrome.tabs.move(tab.id, {index: tab.index - 1}, t => {
            console.debug(`Tab moved to index ${t.index}`);
        });
    });
}

function moveTabToEnd() {
    console.debug('Move tab to end');
    getCurrentTab((tab) => {
        chrome.tabs.move(tab.id, {index: -1}, t => {
            console.debug(`Tab moved to index ${t.index}`);
        });
    });
}

function moveTabToStart() {
    console.debug('Move tab to start');
    getCurrentTab((tab) => {
        chrome.tabs.move(tab.id, {index: 1}, t => {
            console.debug(`Tab moved to index ${t.index}`);
        });
    });
}

function pinTab() {
    getCurrentTab((tab) => {
        tab.pinned = true;
    });
}

function unpinTab() {
    getCurrentTab((tab) => {
        tab.pinned = false;
    });
}

function groupTabsByDomain() {
    getActiveTabs((tabs) => {
        console.debug(`Sorting ${tabs.length} tabs`);
        let grouped = tabs.reduce((acc, tab) => {
            let hostname = new URL(tab.url).hostname;
            (acc[hostname] || (acc[hostname] = [])).push(tab);
            return acc;
        }, {});
        let pos = 0;
        Object.keys(grouped).sort().forEach((hostname) => {
            grouped[hostname].forEach(tab => {
                console.debug(`Process tab ${tab.title}`);
                chrome.tabs.move(tab.id, {index: pos++}, t => {
                    console.debug(`Moved tab to ${t.index}`);
                });
            });
        });
    });
}

function initCommands() {
    chrome.commands.onCommand.addListener(function(command) {
        console.debug(`Command: ${command}`);
        switch (command) {
            case Command.MOVE_LEFT:
                moveTabLeft();
                break;
            case Command.MOVE_RIGHT:
                moveTabRight();
                break;
            case Command.MOVE_END:
                moveTabToEnd();
                break;
            case Command.MOVE_START:
                moveTabToStart();
                break;
            case Command.PIN:
                pinTab();
                break;
            case Command.UNPIN:
                unpinTab();
                break;
            case Command.GROUP_BY_DOMAIN:
                groupTabsByDomain();
                break;
            default:
                break;
        }
    });
}

chrome.runtime.onInstalled.addListener(function() {
    main();
});
