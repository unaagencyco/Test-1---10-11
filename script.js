/* UNA · LP Google Ads */
(function () {
  'use strict';

  var WHATSAPP = '5581984808074';
  var MSG_DIRETA = 'Olá! Quero anunciar no Google e gostaria de agendar uma call com a UNA.';

  window.dataLayer = window.dataLayer || [];

  // UTMs / gclid / fbclid da visita, para atribuição
  var attrib = {};
  try {
    var qs = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid'].forEach(function (k) {
      if (qs.get(k)) attrib[k] = qs.get(k);
    });
    if (Object.keys(attrib).length) sessionStorage.setItem('una_attrib', JSON.stringify(attrib));
    else attrib = JSON.parse(sessionStorage.getItem('una_attrib') || '{}');
  } catch (e) { /* storage indisponível */ }

  function waUrl(text) {
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text);
  }

  // Evento de lead para GTM / GA4 / Meta (só dispara o que estiver instalado)
  function track(origem, extra) {
    var data = Object.assign({ event: 'generate_lead', lead_origem: origem }, attrib, extra || {});
    window.dataLayer.push(data);
    if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { lead_origem: origem });
    if (typeof window.fbq === 'function') window.fbq('track', 'Contact', { content_name: origem });
  }

  // ---------- Formulário ----------
  var form = document.getElementById('agendar');
  var inputs = form.querySelectorAll('input[required]');

  function valid(inp) {
    var ok = inp.value.trim().length >= (+inp.getAttribute('minlength') || 1);
    inp.setAttribute('aria-invalid', ok ? 'false' : 'true');
    return ok;
  }

  inputs.forEach(function (inp) {
    inp.addEventListener('input', function () {
      if (inp.getAttribute('aria-invalid') === 'true') valid(inp);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstBad = null;
    inputs.forEach(function (inp) { if (!valid(inp) && !firstBad) firstBad = inp; });
    if (firstBad) { firstBad.focus(); return; }

    var nome = form.nome.value.trim();
    var esp = form.especialidade.value.trim();
    var cid = form.cidade.value.trim();
    var msg = 'Olá! Sou ' + nome + ', de ' + esp + ', em ' + cid +
      '. Quero anunciar no Google e gostaria de agendar uma call com a UNA.';
    var url = waUrl(msg);

    track('formulario', { especialidade: esp, cidade: cid });
    try { sessionStorage.setItem('una_wa', url); } catch (err) {}

    // Abre o WhatsApp numa nova aba (ainda dentro do clique) e leva esta aba ao obrigado.html.
    // Se o navegador bloquear a nova aba, vai direto ao WhatsApp.
    var win = window.open(url, '_blank');
    if (win) {
      win.opener = null;
      setTimeout(function () { location.href = 'obrigado.html'; }, 150);
    } else {
      location.href = url;
    }
  });

  // ---------- Links diretos de WhatsApp ----------
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = waUrl(MSG_DIRETA);
    a.target = '_blank';
    a.rel = 'noopener';
    a.addEventListener('click', function () { track(a.getAttribute('data-cta') || 'link'); });
  });

  // ---------- Âncoras para o formulário ----------
  document.querySelectorAll('[data-scroll-form]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(function () { form.nome.focus({ preventScroll: true }); }, 500);
    });
  });

  // ---------- Botão flutuante: inverte cor sobre seções pretas ----------
  var float = document.querySelector('.wa-float');
  var darks = document.querySelectorAll('.sec-black, .footer');
  if (float && 'IntersectionObserver' in window) {
    var onDark = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.isIntersecting ? onDark.add(en.target) : onDark.delete(en.target); });
      float.classList.toggle('on-dark', onDark.size > 0);
    }, { rootMargin: '0px 0px -' + (window.innerHeight - 90) + 'px 0px' });
    darks.forEach(function (d) { io.observe(d); });
  }

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
