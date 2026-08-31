/* =========================================================================
   BANNER DE COOKIES — Alcance Isenções
   Compartilhado entre todas as páginas. Registra o consentimento do
   visitante (LGPD, Lei 13.709/2018) em localStorage e expõe
   window.AlcancePreferenciasCookies() para reabrir o painel a qualquer
   momento (usado pelo link "Preferências de cookies" no rodapé).

   Scripts de terceiros (analytics, marketing) devem checar o consentimento
   antes de carregar, ouvindo o evento "alcance:consentimento" disparado no
   document, e ler e.detail.analytics / e.detail.marketing (booleanos).
   ========================================================================= */
(function () {
  "use strict";

  var CHAVE_ARMAZENAMENTO = "alcance_consentimento_cookies";
  var VERSAO_POLITICA = 1;

  function lerConsentimento() {
    try {
      var bruto = window.localStorage.getItem(CHAVE_ARMAZENAMENTO);
      if (!bruto) return null;
      var dados = JSON.parse(bruto);
      if (!dados || dados.versao !== VERSAO_POLITICA) return null;
      return dados;
    } catch (erro) {
      return null;
    }
  }

  function salvarConsentimento(preferencias) {
    var dados = {
      versao: VERSAO_POLITICA,
      necessarios: true,
      analytics: !!preferencias.analytics,
      marketing: !!preferencias.marketing,
      data: new Date().toISOString()
    };
    try {
      window.localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(dados));
    } catch (erro) {
      /* localStorage indisponível (modo privado etc.): o consentimento vale só para esta visita */
    }
    document.dispatchEvent(new CustomEvent("alcance:consentimento", { detail: dados }));
    return dados;
  }

  function iniciar() {
    var elementoAtivoAntes = null;

    var banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Aviso de cookies");
    banner.innerHTML =
      '<div class="cookie-banner-texto">' +
        '<strong>Nós usamos cookies</strong>' +
        '<p>Usamos cookies essenciais para o site funcionar e, com a sua permissão, cookies analíticos e de marketing para melhorar sua experiência. Saiba mais na nossa <a href="privacidade.html#cookies">Política de Privacidade</a>.</p>' +
      "</div>" +
      '<div class="cookie-banner-acoes">' +
        '<button type="button" class="cookie-btn cookie-btn--contorno" data-cookie-acao="personalizar">Personalizar</button>' +
        '<button type="button" class="cookie-btn cookie-btn--contorno" data-cookie-acao="rejeitar">Rejeitar não essenciais</button>' +
        '<button type="button" class="cookie-btn cookie-btn--roxo" data-cookie-acao="aceitar">Aceitar todos</button>' +
      "</div>";

    var overlay = document.createElement("div");
    overlay.className = "cookie-overlay";
    overlay.innerHTML =
      '<div class="cookie-painel" role="dialog" aria-modal="true" aria-labelledby="cookie-painel-titulo">' +
        '<div class="cookie-painel-topo">' +
          '<h2 id="cookie-painel-titulo">Preferências de cookies</h2>' +
          '<button type="button" class="cookie-painel-fechar" data-cookie-acao="fechar" aria-label="Fechar preferências de cookies">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
          "</button>" +
        "</div>" +
        '<div class="cookie-painel-scroll">' +
          '<p>Escolha quais categorias de cookies você permite. Você pode alterar essa escolha quando quiser pelo link "Preferências de cookies" no rodapé. Veja detalhes na <a href="privacidade.html#cookies">Política de Privacidade</a>.</p>' +
          '<div class="cookie-categoria">' +
            '<div class="cookie-categoria-copy"><strong>Necessários</strong><p>Garantem o funcionamento básico do site (navegação, menu, formulário de contato). Não podem ser desativados.</p></div>' +
            '<label class="cookie-switch"><input type="checkbox" checked disabled aria-label="Cookies necessários, sempre ativos"><span class="cookie-switch-trilho"></span></label>' +
          "</div>" +
          '<div class="cookie-categoria">' +
            '<div class="cookie-categoria-copy"><strong>Analíticos</strong><p>Ajudam a entender como o site é usado, para melhorarmos conteúdo e navegação.</p></div>' +
            '<label class="cookie-switch"><input type="checkbox" id="cookie-pref-analytics" aria-label="Cookies analíticos"><span class="cookie-switch-trilho"></span></label>' +
          "</div>" +
          '<div class="cookie-categoria">' +
            '<div class="cookie-categoria-copy"><strong>Marketing</strong><p>Usados para exibir comunicações e anúncios mais relevantes sobre nossos serviços.</p></div>' +
            '<label class="cookie-switch"><input type="checkbox" id="cookie-pref-marketing" aria-label="Cookies de marketing"><span class="cookie-switch-trilho"></span></label>' +
          "</div>" +
        "</div>" +
        '<div class="cookie-painel-acoes">' +
          '<button type="button" class="cookie-btn cookie-btn--contorno" data-cookie-acao="rejeitar">Rejeitar não essenciais</button>' +
          '<button type="button" class="cookie-btn cookie-btn--laranja" data-cookie-acao="salvar">Salvar preferências</button>' +
        "</div>" +
      "</div>";

    document.body.appendChild(banner);
    document.body.appendChild(overlay);

    var campoAnalytics = overlay.querySelector("#cookie-pref-analytics");
    var campoMarketing = overlay.querySelector("#cookie-pref-marketing");

    function mostrarBanner() {
      banner.classList.add("is-visible");
    }
    function esconderBanner() {
      banner.classList.remove("is-visible");
    }

    function abrirPainel(preferenciasAtuais) {
      elementoAtivoAntes = document.activeElement;
      var atuais = preferenciasAtuais || lerConsentimento() || { analytics: false, marketing: false };
      campoAnalytics.checked = !!atuais.analytics;
      campoMarketing.checked = !!atuais.marketing;
      overlay.classList.add("is-visible");
      overlay.querySelector(".cookie-painel-fechar").focus();
      document.addEventListener("keydown", aoTeclarNoPainel);
    }

    function fecharPainel() {
      overlay.classList.remove("is-visible");
      document.removeEventListener("keydown", aoTeclarNoPainel);
      if (elementoAtivoAntes && typeof elementoAtivoAntes.focus === "function") {
        elementoAtivoAntes.focus();
      }
    }

    function aoTeclarNoPainel(evento) {
      if (evento.key === "Escape") fecharPainel();
    }

    banner.addEventListener("click", function (evento) {
      var acao = evento.target.closest("[data-cookie-acao]");
      if (!acao) return;

      if (acao.dataset.cookieAcao === "aceitar") {
        salvarConsentimento({ analytics: true, marketing: true });
        esconderBanner();
      } else if (acao.dataset.cookieAcao === "rejeitar") {
        salvarConsentimento({ analytics: false, marketing: false });
        esconderBanner();
      } else if (acao.dataset.cookieAcao === "personalizar") {
        abrirPainel();
      }
    });

    overlay.addEventListener("click", function (evento) {
      if (evento.target === overlay) { fecharPainel(); return; }

      var acao = evento.target.closest("[data-cookie-acao]");
      if (!acao) return;

      if (acao.dataset.cookieAcao === "fechar") {
        fecharPainel();
      } else if (acao.dataset.cookieAcao === "rejeitar") {
        salvarConsentimento({ analytics: false, marketing: false });
        fecharPainel();
        esconderBanner();
      } else if (acao.dataset.cookieAcao === "salvar") {
        salvarConsentimento({ analytics: campoAnalytics.checked, marketing: campoMarketing.checked });
        fecharPainel();
        esconderBanner();
      }
    });

    window.AlcancePreferenciasCookies = function () {
      abrirPainel();
    };

    var consentimentoExistente = lerConsentimento();
    if (consentimentoExistente) {
      document.dispatchEvent(new CustomEvent("alcance:consentimento", { detail: consentimentoExistente }));
    } else {
      window.requestAnimationFrame(function () {
        window.setTimeout(mostrarBanner, 400);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
