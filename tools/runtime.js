// Tiny runtime: renders the design's template and patches the page in place.
(function () {
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g, WHOLE = /^\{\{\s*([^}]+?)\s*\}\}$/;
  var SVGNS = 'http://www.w3.org/2000/svg';
  var EVENTS = { onclick: 'click', onchange: 'change', oninput: 'input' };
  function lookup(path, scope) {
    if (path === 'true') return true; if (path === 'false') return false; if (path === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    var parts = path.split('.'), v = scope;
    for (var i = 0; i < parts.length; i++) { if (v == null) return undefined; v = v[parts[i]]; }
    return v;
  }
  function interp(s, scope) { return s.replace(HOLE, function (_, p) { var v = lookup(p, scope); return v == null ? '' : String(v); }); }
  function val(s, scope) { var m = s.match(WHOLE); return m ? lookup(m[1], scope) : interp(s, scope); }

  // template -> virtual nodes
  function build(nodes, scope, out) {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.nodeType === 3) { out.push({ text: interp(n.nodeValue, scope) }); continue; }
      if (n.nodeType !== 1) continue;
      var tag = n.localName;
      if (tag === 'sc-if') { if (val(n.getAttribute('value') || '', scope)) build(n.childNodes, scope, out); continue; }
      if (tag === 'sc-for') {
        var list = val(n.getAttribute('list') || '', scope) || [], as = n.getAttribute('as') || 'item';
        for (var j = 0; j < list.length; j++) { var sc = Object.create(scope); sc[as] = list[j]; sc.$index = j; build(n.childNodes, sc, out); }
        continue;
      }
      var attrs = {}, events = {}, props = {};
      for (var a = 0; a < n.attributes.length; a++) {
        var at = n.attributes[a], name = at.name, v = val(at.value, scope), lname = name.toLowerCase();
        if (lname.indexOf('hint-') === 0) continue;
        if (EVENTS[lname]) {
          var ev = EVENTS[lname];
          if (ev === 'change' && (tag === 'input' || tag === 'textarea')) ev = 'input';
          if (typeof v === 'function') events[ev] = v;
          continue;
        }
        if (name === 'value' && tag === 'input') { props.value = v == null ? '' : String(v); continue; }
        if (name === 'disabled') { if (v === true || v === 'true' || v === '') attrs.disabled = ''; continue; }
        if (v === false || v == null) continue;
        attrs[name] = String(v);
      }
      out.push({ tag: tag, ns: n.namespaceURI, attrs: attrs, events: events, props: props, kids: build(n.childNodes, scope, []) });
    }
    return out;
  }

  function create(v) {
    if (v.text !== undefined) return document.createTextNode(v.text);
    var el = v.ns === SVGNS ? document.createElementNS(SVGNS, v.tag) : document.createElement(v.tag);
    el._h = {};
    update(el, v, true);
    for (var i = 0; i < v.kids.length; i++) el.appendChild(create(v.kids[i]));
    return el;
  }
  function listen(el, ev) { el.addEventListener(ev, function (e) { var f = el._h[ev]; if (f) f(e); }); }
  function update(el, v, fresh) {
    var old = el.attributes, k;
    for (var i = old.length - 1; i >= 0; i--) { if (!(old[i].name in v.attrs)) el.removeAttribute(old[i].name); }
    for (k in v.attrs) { if (el.getAttribute(k) !== v.attrs[k]) el.setAttribute(k, v.attrs[k]); }
    for (k in v.events) { if (!(k in el._h)) listen(el, k); }
    var h = {}; for (k in el._h) h[k] = null; for (k in v.events) h[k] = v.events[k]; el._h = h;
    if ('value' in v.props && el.value !== v.props.value) el.value = v.props.value;
  }
  function same(el, v) {
    if (v.text !== undefined) return el.nodeType === 3;
    return el.nodeType === 1 && el.localName === v.tag && el.namespaceURI === (v.ns || el.namespaceURI);
  }
  function patch(parent, vkids) {
    var kids = parent.childNodes;
    for (var i = 0; i < vkids.length; i++) {
      var v = vkids[i], el = kids[i];
      if (!el) { parent.appendChild(create(v)); continue; }
      if (!same(el, v)) { parent.replaceChild(create(v), el); continue; }
      if (v.text !== undefined) { if (el.nodeValue !== v.text) el.nodeValue = v.text; continue; }
      update(el, v, false);
      patch(el, v.kids);
    }
    while (kids.length > vkids.length) parent.removeChild(parent.lastChild);
  }

  var tpl = document.getElementById('tt-template').content;
  window.DCLogic = class DCLogic {
    constructor() { this.props = {}; this.state = {}; this._q = false; }
    setState(u) {
      var p = typeof u === 'function' ? u(this.state, this.props) : u;
      this.state = Object.assign({}, this.state, p);
      if (this._q) return; this._q = true;
      var self = this; Promise.resolve().then(function () { self._q = false; self._render(); });
    }
    forceUpdate() { this._render(); }
    _render() { patch(this._root, build(tpl.childNodes, this.renderVals(), [])); }
  };
  window.ttMount = function (C) {
    var c = new C(); c._root = document.getElementById('app'); c._render();
    if (c.componentDidMount) c.componentDidMount();
  };
})();
