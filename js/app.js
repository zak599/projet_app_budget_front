const app = {
  defaultPage: 'home',
  api :'http://localhost:4005',
  templates: new Map(),
  controllers: {},
  content: document.getElementById('app'),
};


app.init = function () {
  window.addEventListener('hashchange', () => {
      const tplName = window.location.hash.slice(1);
      app.displayTpl(tplName);
  });

  this.navigate(this.defaultPage);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
};

app.navigate = (path) => {
  window.location.hash = `#${path}`;
}


app.displayTpl = async (tpl) => {
  //récupérer le tpl 
  if (!app.templates.has(tpl)) {
      await app.loadTemplate(tpl);
  }
  const _tpl = app.templates.get(tpl);
  app.content.innerHTML = _tpl;
  // INIT controller
  if(app.controllers[tpl] != null) {
      app.controllers[tpl].init();
  }
}

app.loadTemplate = function (tpl) {
  return $.ajax({
      type: 'GET',
      url: `tpl/${tpl}.tpl.html`,
      dataType: 'html',
  }).then((data) => {
      app.templates.set(tpl, data);
  }).fail(() => {
      alert('Impossible de récupérer le template');
  });
}



app.init();