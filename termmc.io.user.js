// ==UserScript==
// @name         Mine-Craft.io Terminal Button (#chat version)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Adds a Terminal button near #chat input to send terminal commands with special chat message formatting on mine-craft.io
// @author       ChatGPT
// @match        https://mine-craft.io/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const interval = 100;
            let elapsed = 0;
            const check = () => {
                const el = document.querySelector(selector);
                if (el) resolve(el);
                else {
                    elapsed += interval;
                    if (elapsed >= timeout) reject('Element not found: ' + selector);
                    else setTimeout(check, interval);
                }
            };
            check();
        });
    }

    async function addTerminalButton() {
        try {
            const chatInput = await waitForElement('#chat');

            // Create Terminal button
            const btn = document.createElement('button');
            btn.textContent = 'Terminal';
            btn.style.marginLeft = '8px';
            btn.style.padding = '5px 10px';
            btn.style.cursor = 'pointer';
            btn.style.borderRadius = '4px';
            btn.style.backgroundColor = '#FFAA00';
            btn.style.color = '#000';
            btn.style.fontWeight = 'bold';

            btn.addEventListener('click', onTerminalClick);

            // Insert button right after #chat input
            chatInput.insertAdjacentElement('afterend', btn);

        } catch (e) {
            console.error('Failed to add Terminal button:', e);
        }
    }

    function onTerminalClick() {
        const cmd = prompt('Enter terminal command:');
        if (!cmd) return;

        const chatInput = document.querySelector('#chat');
        if (!chatInput) {
            alert('Chat input (#chat) not found!');
            return;
        }

        // Build the HTML chat message as a string (escaped)
        // Because chat input is text, we can't inject HTML directly.
        // Instead, send a special text command that the server recognizes,
        // for example, prefix with "/term " so the backend or game renders it accordingly.

        const messageToSend = `/term ${cmd}`;

        chatInput.value = messageToSend;
        chatInput.dispatchEvent(new Event('input', { bubbles: true }));

        // Attempt to send message by simulating Enter keypress
        const keyboardEvent = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13
        });

        chatInput.dispatchEvent(keyboardEvent);
    }

    addTerminalButton();

})();