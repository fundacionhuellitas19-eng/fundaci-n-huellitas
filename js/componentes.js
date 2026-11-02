
(function () {
  const raiz = document.currentScript.src.replace(/js\/componentes\.js.*$/, '');
  const pagina = location.pathname.split('/').pop() || 'index.html';
  const esInicio = pagina === 'index.html';

  const inicio = esInicio ? '' : raiz + 'index.html';
  const p = (archivo) => raiz + 'paginas/' + archivo;

  const CLAVE_SESION = 'huellitasSesion';
  const CLAVE_TOKEN = 'huellitasToken';
  const EN_COMPUTADOR = location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(location.hostname);
  const API = EN_COMPUTADOR && location.port !== '3000' ? 'http://localhost:3000' : '';

  window.Huellitas = {
    sesion() {
      try { return localStorage.getItem(CLAVE_SESION); } catch (e) { return null; }
    },
    token() {
      try { return localStorage.getItem(CLAVE_TOKEN); } catch (e) { return null; }
    },
    iniciarSesion(correo, token) {
      try {
        localStorage.setItem(CLAVE_SESION, correo);
        localStorage.setItem(CLAVE_TOKEN, token);
      } catch (e) {}
    },
    cerrarSesion() {
      try {
        localStorage.removeItem(CLAVE_SESION);
        localStorage.removeItem(CLAVE_TOKEN);
      } catch (e) {}
    },
    async api(ruta, datos) {
      const token = this.token();
      let respuesta;
      try {
        respuesta = await fetch(`${API}/api/${ruta}`, {
          method: datos ? 'POST' : 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: 'Bearer ' + token } : {}),
          },
          body: datos ? JSON.stringify(datos) : undefined,
        });
      } catch (e) {
        throw new Error(EN_COMPUTADOR
          ? 'El servidor de Huellitas está apagado. Abre una terminal y escribe: npm start'
          : 'No pudimos conectarnos. Revisa tu internet e intenta de nuevo.');
      }
      const json = await respuesta.json().catch(() => ({}));
      if (respuesta.status === 401 && token) this.cerrarSesion();
      if (!respuesta.ok) throw new Error(json.error || 'Algo salió mal. Intenta de nuevo.');
      return json;
    },
    enviando(form, activo) {
      const boton = form.querySelector('button[type="submit"]');
      if (!boton) return;
      if (activo) {
        boton.dataset.texto = boton.innerHTML;
        boton.disabled = true;
        boton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
      } else {
        boton.disabled = false;
        boton.innerHTML = boton.dataset.texto || boton.innerHTML;
      }
    },
    avisar(mensaje) {
      let aviso = document.getElementById('avisoHuellitas');
      if (!aviso) {
        aviso = document.createElement('div');
        aviso.id = 'avisoHuellitas';
        aviso.className = 'aviso-flotante';
        aviso.setAttribute('role', 'alert');
        document.body.appendChild(aviso);
      }
      aviso.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${mensaje}`;
      aviso.classList.add('visible');
      clearTimeout(aviso.temporizador);
      aviso.temporizador = setTimeout(() => aviso.classList.remove('visible'), 5000);
    },
    leer(clave) {
      try { return JSON.parse(localStorage.getItem(clave)) || []; } catch (e) { return []; }
    },
    guardar(clave, lista) {
      try { localStorage.setItem(clave, JSON.stringify(lista)); } catch (e) {}
    },
  };
  const conSesion = !!window.Huellitas.sesion();

  const WHATSAPP = '573024338944';
  const INSTAGRAM = 'https://www.instagram.com/fundacionhuellitas.co/';
  const wa = (mensaje) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

  const encabezado = `
  <div class="demo-banner">
    <i class="fa-solid fa-triangle-exclamation"></i>
    ¿Emergencia con un animal? Escríbenos por WhatsApp:
    <a href="${wa('Hola, tengo una emergencia con un animal.')}" target="_blank"><strong>302 433 8944</strong></a>
  </div>

  <nav class="navbar">
    <a href="${raiz}index.html" class="nav-brand">
      <img src="${raiz}imagenes/logooficial.png" alt="Logo Fundación Huellitas" class="brand-logo">
      <div class="nav-brand-text">
        <span class="title">FUNDACIÓN HUELLITAS</span>
        <span class="subtitle">Rescate &middot; Protección &middot; Adopción</span>
      </div>
    </a>

    <button class="menu-toggle" id="menuToggle" aria-label="Abrir menú">
      <i class="fa-solid fa-bars" id="menuIcon"></i>
    </button>

    <ul class="nav-links" id="navLinks">
      <li><a href="${raiz}index.html">Inicio</a></li>
      <li><a href="${inicio}#nosotros">Nosotros</a></li>
      <li><a href="${inicio}#casos">Mural de Casos</a></li>
      <li><a href="${p('explorar.html')}">Servicios</a></li>

      <li class="nav-dropdown">
        <a href="#">Educación ▾</a>
        <ul class="dropdown-menu">
          <li><a href="${p('ley-angel.html')}">Ley Ángel</a></li>
          <li><a href="${p('sugerencias.html')}">Sugerencias de Cuidado</a></li>
          <li><a href="${p('aprende.html')}">Infórmate y Aprende</a></li>
          <li><a href="${p('asociaciones.html')}">Asociaciones Aliadas</a></li>
        </ul>
      </li>

      <li class="nav-dropdown">
        <a href="#">Acción ▾</a>
        <ul class="dropdown-menu">
          <li><a href="${p('adopcion.html')}">Historias y Adopción</a></li>
          <li><a href="${p('calculadora.html')}">Calculadora de Gastos</a></li>
          <li><a href="${p('mapa-rescate.html')}">Mapa de Rescate</a></li>
          <li><a href="${p('reportar.html')}">Reportar Caso</a></li>
          <li><a href="${p('donar.html')}">Donar y Voluntariado</a></li>
        </ul>
      </li>

      <li class="nav-dropdown">
        <a href="#">Comunidad ▾</a>
        <ul class="dropdown-menu">
          <li><a href="${p('buzon.html')}">Buzón Ciudadano</a></li>
          <li><a href="${p('encuesta.html')}">Encuesta Comunitaria</a></li>
          <li><a href="${p('emergencias.html')}">Contactos de Emergencia</a></li>
        </ul>
      </li>

      <li>
        <a href="${p(conSesion ? 'perfil.html' : 'login.html')}" class="nav-login${conSesion ? ' logged' : ''}" aria-label="${conSesion ? 'Mi perfil' : 'Iniciar sesión'}">
          <i class="fa-${conSesion ? 'solid' : 'regular'} fa-user"></i><span>${conSesion ? 'Mi perfil' : 'Iniciar sesión'}</span>
        </a>
      </li>

      <li>
        <a href="${esInicio ? '#reportar-section' : p('reportar.html')}" class="btn btn-sm btn-primary">
          <i class="fa-solid fa-bullhorn"></i> Reportar
        </a>
      </li>
    </ul>
  </nav>`;

  const pie = `
  <a href="${wa('Hola, quiero comunicarme con Fundación Huellitas.')}" class="whatsapp-float" target="_blank" aria-label="Contacto por WhatsApp">
    <i class="fa-brands fa-whatsapp"></i>
  </a>
  <a href="${INSTAGRAM}" class="instagram-float" target="_blank" aria-label="Síguenos en Instagram">
    <i class="fa-brands fa-instagram"></i>
  </a>

  <footer>
    <div class="footer-grid">
      <div class="footer-about">
        <div class="footer-brand">
          <img src="${raiz}imagenes/logooficial.png" alt="Logo Fundación Huellitas" class="brand-logo">
          <h4>Fundación Huellitas</h4>
        </div>
        <p>
          Organización dedicada a transformar la realidad de los animales vulnerables a través del rescate, la rehabilitación médica, la pedagogía comunitaria y la adopción responsable.
        </p>
      </div>

      <div class="footer-col">
        <h5>Educación</h5>
        <ul class="footer-links">
          <li><a href="${p('ley-angel.html')}">Ley Ángel</a></li>
          <li><a href="${p('sugerencias.html')}">Sugerencias de Cuidado</a></li>
          <li><a href="${p('aprende.html')}">Infórmate y Aprende</a></li>
          <li><a href="${p('asociaciones.html')}">Asociaciones Aliadas</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h5>Acción</h5>
        <ul class="footer-links">
          <li><a href="${p('adopcion.html')}">Historias y Adopción</a></li>
          <li><a href="${p('calculadora.html')}">Calculadora de Gastos</a></li>
          <li><a href="${p('mapa-rescate.html')}">Mapa de Rescate</a></li>
          <li><a href="${p('reportar.html')}">Reportar un Caso</a></li>
          <li><a href="${p('donar.html')}">Donar y Voluntariado</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h5>Contacto</h5>
        <ul class="footer-contact" style="list-style: none;">
          <li><i class="fa-solid fa-phone"></i> +57 302 433 8944</li>
          <li><i class="fa-solid fa-envelope"></i> <a href="mailto:fundacionhuellitas19@gmail.com">fundacionhuellitas19@gmail.com</a></li>
          <li><i class="fa-solid fa-location-dot"></i> Colombia</li>
        </ul>
        <div class="footer-social-links" style="margin-top: 1rem;">
          <a href="${INSTAGRAM}" class="social-icon-btn" target="_blank" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
          <a href="https://wa.me/${WHATSAPP}" class="social-icon-btn" target="_blank" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} Fundación Huellitas &middot; Todos los derechos reservados &middot; Hecho con <i class="fa-solid fa-heart" style="color: var(--color-primary);"></i> en Colombia</p>
    </div>
  </footer>`;

  document.currentScript.insertAdjacentHTML('beforebegin', encabezado);

  document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('beforeend', pie);
    animarAlBajar();

    const sinRuta = ['explorar.html', 'login.html', 'registro.html', 'perfil.html'];
    const destino = document.querySelector('.page-hero-content') || document.querySelector('.main-content');
    if (destino && !esInicio && !sinRuta.includes(pagina)) {
      const titulo = document.title.split(' — ')[0];
      destino.insertAdjacentHTML('afterbegin', `
        <nav class="breadcrumb" aria-label="Ruta de navegación">
          <a href="${raiz}index.html"><i class="fa-solid fa-house"></i> Inicio</a>
          <i class="fa-solid fa-chevron-right"></i>
          <a href="${p('explorar.html')}">Servicios</a>
          <i class="fa-solid fa-chevron-right"></i>
          <span>${titulo}</span>
        </nav>`);
    }
  });

  const ANIMADOS = [
    '.section-header', '.about-grid > *', '.stat-item', '.pet-card', '.step-card',
    '.testimonial-card', '.donation-card', '.service-card', '.featured-card', '.info-card',
    '.line-card', '.scenario-card', '.org-card', '.key-fact', '.help-option', '.vaccine-card',
    '.story-banner', '.danger-box', '.notice-wildlife', '.help-banner', '.ready-test',
    '.side-card', '.form-card', '.donate-box', '.faq details', '.transparency > *',
    '.join-box > *', '.calc-result', '.map-box', '.map-list', '.survey-box', '.auth-layout',
    '.alert-bar', '.service-group-header',
  ].join(', ');

  function animarAlBajar() {
    const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (menosMovimiento || !('IntersectionObserver' in window)) return;

    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach(entrada => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add('visible');
        observador.unobserve(entrada.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(ANIMADOS).forEach(el => {
      if (el.closest('.page-hero, .modal-backdrop')) return;
      const hermanos = [...el.parentElement.children].filter(h => h.matches(ANIMADOS));
      el.style.setProperty('--retraso', (hermanos.indexOf(el) % 4) * 0.09 + 's');
      el.classList.add('reveal');
      el.addEventListener('animationend', (e) => {
        if (e.animationName !== 'aparecer') return;
        el.classList.remove('reveal', 'visible');
        el.style.removeProperty('--retraso');
      });
      observador.observe(el);
    });
  }

  const navLinks = document.getElementById('navLinks');
  const menuIcon = document.getElementById('menuIcon');
  const esMovil = () => window.innerWidth <= 1330;

  function cerrarMenu() {
    navLinks.classList.remove('mobile-open');
    menuIcon.classList.add('fa-bars');
    menuIcon.classList.remove('fa-xmark');
  }

  document.getElementById('menuToggle').addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
    menuIcon.classList.toggle('fa-bars');
    menuIcon.classList.toggle('fa-xmark');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.getAttribute('href') === '#') e.preventDefault();
      if (!esMovil()) return;
      if (link.parentElement.classList.contains('nav-dropdown')) {
        e.preventDefault();
        link.parentElement.classList.toggle('open');
      } else {
        cerrarMenu();
      }
    });
  });

  navLinks.querySelectorAll('a[href]').forEach(link => {
    const destino = link.getAttribute('href').split('/').pop();
    if (destino === pagina && !esInicio) {
      link.classList.add('active');
      const grupo = link.closest('.nav-dropdown');
      if (grupo) grupo.querySelector('a').classList.add('active');
    }
  });
})();
