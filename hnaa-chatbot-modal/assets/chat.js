(function () {
  function h(el, tag, cls) {
    var x = document.createElement(tag);
    if (cls) x.className = cls;
    if (el) el.appendChild(x);
    return x;
  }
  function escapeHTML(str) {
    var div = document.createElement("div");
    div.innerText = str;
    return div.innerHTML;
  }
  function linkify(htmlEscapedText) {
    return htmlEscapedText.replace(
      /(https?:\/\/[^\s<>"']*[^\s<>"'\.,\)\]\}])/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
  }

  function buildChatCard(container, opts) {
    var card = h(container, "div", "hnaa-card");
    var header = h(card, "div", "hnaa-header");
    var titleSpan = h(header, "div", "hnaa-title");
    titleSpan.textContent = opts.title || "AIアシスタント";
    if (opts.onClose) {
      var closeBtn = h(header, "button", "hnaa-close");
      closeBtn.type = "button";
      closeBtn.setAttribute("aria-label", "閉じる");
      closeBtn.innerHTML = "×";
      closeBtn.addEventListener("click", opts.onClose);
    }
    var body = h(card, "div", "hnaa-body");
    var msgs = h(body, "div", "hnaa-msgs");
    var form = h(card, "form", "hnaa-form");
    var input = h(form, "textarea", "hnaa-input");
    input.placeholder = opts.placeholder || "質問を入力...";
    input.rows = 2;
    var send = h(form, "button", "hnaa-send");
    send.type = "submit";
    send.textContent = "送信";

    var history = [];
    var pending = false;

    function addMsg(role, content) {
      var row = h(
        msgs,
        "div",
        "hnaa-row " + (role === "user" ? "is-user" : "is-bot")
      );
      var bubble = h(row, "div", "hnaa-bubble");

      msgs.scrollTop = msgs.scrollHeight;
    }
    function setPending(v) {
      pending = v;
      input.disabled = v;
      send.disabled = v;
      send.textContent = v ? "送信中…" : "送信";
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (pending) return;
      var content = (input.value || "").trim();
      if (!content) return;
      addMsg("user", content);
      history.push({ role: "user", content });
      input.value = "";
      setPending(true);
      try {
        var res = await fetch(opts.api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "omit",
          body: JSON.stringify({ message: content, history: history }),
        });
        if (!res.ok) {
          var t = await res.text();
          throw new Error("HTTP " + res.status + ": " + t);
        }
        var data = await res.json();
        var reply = data.reply || data.content || data.message || "";
        addMsg("assistant", reply || "(空の応答)");
        history.push({ role: "assistant", content: reply });
      } catch (err) {
        console.error(err);
        addMsg(
          "assistant",
          "エラーが発生しました: " +
            (err && err.message ? err.message : String(err))
        );
      } finally {
        setPending(false);
      }
    });

    // 初期メッセージ
    addMsg("assistant", "こんにちは！ご質問をどうぞ。");

    return {
      focus: function () {
        try {
          input.focus();
        } catch (_) {}
      },
    };
  }

  function renderInline(root, opts) {
    var theme = (opts.theme || "light").toLowerCase();
    root.innerHTML = "";
    root.classList.add("hnaa-theme-" + (theme === "dark" ? "dark" : "light"));
    buildChatCard(root, {
      api: opts.api,
      title: opts.title,
      placeholder: opts.placeholder,
      onClose: null,
    });
  }

  function renderModal(root, opts) {
    var theme = (opts.theme || "light").toLowerCase();
    root.innerHTML = "";
    root.classList.add("hnaa-theme-" + (theme === "dark" ? "dark" : "light"));

    // Launcher button
    var pos = (opts.launcher_position || "bottom-right").toLowerCase();
    var launcher = h(document.body, "button", "hnaa-launcher " + "pos-" + pos);
    launcher.type = "button";
    launcher.setAttribute("aria-haspopup", "dialog");
    launcher.setAttribute("aria-controls", root.id + "-modal");
    launcher.textContent = opts.launcher_text || "チャット";

    // Modal elements
    var overlay = h(document.body, "div", "hnaa-modal-overlay");
    overlay.id = root.id + "-overlay";
    var modal = h(document.body, "div", "hnaa-modal");
    modal.id = root.id + "-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", root.id + "-title");

    var box = h(modal, "div", "hnaa-modal-box");
    var chatContainer = h(box, "div", "hnaa-modal-chat");
    var chat = buildChatCard(chatContainer, {
      api: opts.api,
      title: opts.title,
      placeholder: opts.placeholder,
      onClose: close,
    });

    function open() {
      document.body.classList.add("hnaa-modal-open");
      overlay.classList.add("is-open");
      modal.classList.add("is-open");
      setTimeout(function () {
        chat.focus();
      }, 50);
    }
    function close() {
      modal.classList.remove("is-open");
      overlay.classList.remove("is-open");
      document.body.classList.remove("hnaa-modal-open");
    }

    launcher.addEventListener("click", open);
    overlay.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });

    if (String(opts.start_open || "").toLowerCase() === "true") {
      open();
    }
  }

  function render(root) {
    var opts = {
      api: root.dataset.api,
      title: root.dataset.title || "AIアシスタント",
      placeholder: root.dataset.placeholder || "質問を入力...",
      theme: root.dataset.theme || "light",
      botname: root.dataset.botname || "Assistant",
      display: (root.dataset.display || "inline").toLowerCase(),
      launcher_text: root.getAttribute("data-launcher-text"),
      launcher_position: root.getAttribute("data-launcher-position"),
      start_open: root.getAttribute("data-start-open"),
    };
    if (!opts.api) {
      root.innerHTML =
        '<div class="hnaa-chatbot-error">APIが設定されていません。</div>';
      return;
    }
    if (!opts.launcher_text) opts.launcher_text = "チャット";
    if (!opts.launcher_position) opts.launcher_position = "bottom-right";

    if (opts.display === "modal") {
      renderModal(root, opts);
    } else {
      renderInline(root, opts);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".hnaa-chatbot-root").forEach(render);
  });
})();
