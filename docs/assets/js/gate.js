/* ============================================================
   gate.js — site access curtain
   ------------------------------------------------------------
   Loaded in <head> on EVERY page.

   On the entry page (index.html, marked data-gate="entry") it
   wires up the password form. On every other page it acts as a
   guard: no valid key in storage, back to the entry page.

   This is a curtain, not a lock. The site is static, so the
   files remain fetchable by anyone who knows a URL. It stops
   ordinary visitors, not a determined technical one.

   TO CHANGE THE PASSWORD: see the snippet at the bottom.
   ============================================================ */
(function () {
  'use strict';

  var STORE_KEY  = 'rl_access';
  var SALT       = 'raineli.art-2026';
  var ITERATIONS = 150000;
  var EXPECTED   = 'a6264d02ac262375b0768968da7111572d53dc216d1b5c35c7ba389a6a43acb1';

  /* localStorage throws in some privacy modes. If it is unusable we let
     visitors through rather than locking a legitimate one out of a site
     that was never really locked to begin with. */
  var store = (function () {
    try {
      var probe = '__rl' + Date.now();
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      return localStorage;
    } catch (e) {
      return null;
    }
  })();

  var isEntry = document.documentElement.getAttribute('data-gate') === 'entry';
  var unlocked = store ? store.getItem(STORE_KEY) === EXPECTED : true;

  /* ── Guard mode ───────────────────────────────────────────── */
  if (!isEntry) {
    if (!unlocked) {
      document.documentElement.style.display = 'none';
      location.replace('/');
    }
    return;
  }

  /* ── Entry mode ───────────────────────────────────────────── */
  if (unlocked) {
    location.replace('home.html');
    return;
  }

  function toHex(buffer) {
    var bytes = new Uint8Array(buffer);
    var out = '';
    for (var i = 0; i < bytes.length; i++) {
      out += bytes[i].toString(16).padStart(2, '0');
    }
    return out;
  }

  function derive(password) {
    var enc = new TextEncoder();
    return crypto.subtle
      .importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
      .then(function (key) {
        return crypto.subtle.deriveBits({
          name: 'PBKDF2',
          salt: enc.encode(SALT),
          iterations: ITERATIONS,
          hash: 'SHA-256'
        }, key, 256);
      })
      .then(toHex);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form   = document.querySelector('.js-gate-form');
    var input  = document.querySelector('.js-gate-input');
    var button = document.querySelector('.js-gate-submit');
    var note   = document.querySelector('.js-gate-note');
    if (!form || !input || !button || !note) return;

    if (window.matchMedia('(min-width: 720px)').matches) input.focus();

    /* The note keeps its reserved height at all times so showing or
       clearing a message never nudges the form. */
    function say(message) {
      note.textContent = message;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input.value.trim();
      if (!value) return;

      if (!window.crypto || !crypto.subtle) {
        say('This browser can’t check the password. Please email me instead.');
        return;
      }

      var label = button.textContent;
      button.disabled = true;
      button.textContent = 'Checking';
      say('');

      derive(value).then(function (hash) {
        if (hash !== EXPECTED) {
          button.disabled = false;
          button.textContent = label;
          input.value = '';
          input.focus();
          say('That isn’t the password. Try again, or get in touch below.');
          return;
        }
        if (store) store.setItem(STORE_KEY, hash);
        location.replace('home.html');
      }).catch(function () {
        button.disabled = false;
        button.textContent = label;
        say('Something went wrong. Please try again.');
      });
    });
  });
})();

/* ------------------------------------------------------------
   CHANGING THE PASSWORD
   Open the live site, press F12 → Console, paste this with your
   new password, press Enter, then copy the printed value over
   EXPECTED above and push:

   (async p => { const e = new TextEncoder();
     const k = await crypto.subtle.importKey('raw', e.encode(p), 'PBKDF2', false, ['deriveBits']);
     const b = await crypto.subtle.deriveBits({name:'PBKDF2', salt:e.encode('raineli.art-2026'), iterations:150000, hash:'SHA-256'}, k, 256);
     console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''));
   })('YOUR-NEW-PASSWORD');

   Everyone previously let in will be asked again after a change.
   ------------------------------------------------------------ */
