import qt, { ipcMain as Ee, app as ft, dialog as zu, clipboard as cc, BrowserWindow as rr, Menu as Yu } from "electron";
import Fe, { join as Re, dirname as Ge, extname as Xu } from "path";
import an, { homedir as sn, platform as Ju } from "os";
import bt, { fileURLToPath as Ku } from "url";
import { mkdir as vn, readFile as Je, readdir as er, stat as vs, rm as Qu } from "fs/promises";
import Ct, { existsSync as De, readFileSync as Js } from "fs";
import { watch as uc } from "chokidar";
import Zu from "constants";
import Fr from "stream";
import ws from "util";
import fc from "assert";
import on from "child_process";
import dc, { EventEmitter as hc } from "events";
import Lr, { randomUUID as pc } from "crypto";
import mc from "tty";
import gc from "zlib";
import ef from "http";
import { connect as tf } from "net";
var at = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, Lt = {}, En = {}, Gr = {}, Ks;
function Ke() {
  return Ks || (Ks = 1, Gr.fromCallback = function(e) {
    return Object.defineProperty(function(...i) {
      if (typeof i[i.length - 1] == "function") e.apply(this, i);
      else
        return new Promise((c, o) => {
          i.push((d, f) => d != null ? o(d) : c(f)), e.apply(this, i);
        });
    }, "name", { value: e.name });
  }, Gr.fromPromise = function(e) {
    return Object.defineProperty(function(...i) {
      const c = i[i.length - 1];
      if (typeof c != "function") return e.apply(this, i);
      i.pop(), e.apply(this, i).then((o) => c(null, o), c);
    }, "name", { value: e.name });
  }), Gr;
}
var wn, Qs;
function rf() {
  if (Qs) return wn;
  Qs = 1;
  var e = Zu, i = process.cwd, c = null, o = process.env.GRACEFUL_FS_PLATFORM || process.platform;
  process.cwd = function() {
    return c || (c = i.call(process)), c;
  };
  try {
    process.cwd();
  } catch {
  }
  if (typeof process.chdir == "function") {
    var d = process.chdir;
    process.chdir = function(r) {
      c = null, d.call(process, r);
    }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, d);
  }
  wn = f;
  function f(r) {
    e.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && h(r), r.lutimes || t(r), r.chown = n(r.chown), r.fchown = n(r.fchown), r.lchown = n(r.lchown), r.chmod = l(r.chmod), r.fchmod = l(r.fchmod), r.lchmod = l(r.lchmod), r.chownSync = a(r.chownSync), r.fchownSync = a(r.fchownSync), r.lchownSync = a(r.lchownSync), r.chmodSync = s(r.chmodSync), r.fchmodSync = s(r.fchmodSync), r.lchmodSync = s(r.lchmodSync), r.stat = p(r.stat), r.fstat = p(r.fstat), r.lstat = p(r.lstat), r.statSync = g(r.statSync), r.fstatSync = g(r.fstatSync), r.lstatSync = g(r.lstatSync), r.chmod && !r.lchmod && (r.lchmod = function(m, w, R) {
      R && process.nextTick(R);
    }, r.lchmodSync = function() {
    }), r.chown && !r.lchown && (r.lchown = function(m, w, R, b) {
      b && process.nextTick(b);
    }, r.lchownSync = function() {
    }), o === "win32" && (r.rename = typeof r.rename != "function" ? r.rename : (function(m) {
      function w(R, b, D) {
        var P = Date.now(), F = 0;
        m(R, b, function I(L) {
          if (L && (L.code === "EACCES" || L.code === "EPERM" || L.code === "EBUSY") && Date.now() - P < 6e4) {
            setTimeout(function() {
              r.stat(b, function(S, z) {
                S && S.code === "ENOENT" ? m(R, b, I) : D(L);
              });
            }, F), F < 100 && (F += 10);
            return;
          }
          D && D(L);
        });
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(w, m), w;
    })(r.rename)), r.read = typeof r.read != "function" ? r.read : (function(m) {
      function w(R, b, D, P, F, I) {
        var L;
        if (I && typeof I == "function") {
          var S = 0;
          L = function(z, G, $) {
            if (z && z.code === "EAGAIN" && S < 10)
              return S++, m.call(r, R, b, D, P, F, L);
            I.apply(this, arguments);
          };
        }
        return m.call(r, R, b, D, P, F, L);
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(w, m), w;
    })(r.read), r.readSync = typeof r.readSync != "function" ? r.readSync : /* @__PURE__ */ (function(m) {
      return function(w, R, b, D, P) {
        for (var F = 0; ; )
          try {
            return m.call(r, w, R, b, D, P);
          } catch (I) {
            if (I.code === "EAGAIN" && F < 10) {
              F++;
              continue;
            }
            throw I;
          }
      };
    })(r.readSync);
    function h(m) {
      m.lchmod = function(w, R, b) {
        m.open(
          w,
          e.O_WRONLY | e.O_SYMLINK,
          R,
          function(D, P) {
            if (D) {
              b && b(D);
              return;
            }
            m.fchmod(P, R, function(F) {
              m.close(P, function(I) {
                b && b(F || I);
              });
            });
          }
        );
      }, m.lchmodSync = function(w, R) {
        var b = m.openSync(w, e.O_WRONLY | e.O_SYMLINK, R), D = !0, P;
        try {
          P = m.fchmodSync(b, R), D = !1;
        } finally {
          if (D)
            try {
              m.closeSync(b);
            } catch {
            }
          else
            m.closeSync(b);
        }
        return P;
      };
    }
    function t(m) {
      e.hasOwnProperty("O_SYMLINK") && m.futimes ? (m.lutimes = function(w, R, b, D) {
        m.open(w, e.O_SYMLINK, function(P, F) {
          if (P) {
            D && D(P);
            return;
          }
          m.futimes(F, R, b, function(I) {
            m.close(F, function(L) {
              D && D(I || L);
            });
          });
        });
      }, m.lutimesSync = function(w, R, b) {
        var D = m.openSync(w, e.O_SYMLINK), P, F = !0;
        try {
          P = m.futimesSync(D, R, b), F = !1;
        } finally {
          if (F)
            try {
              m.closeSync(D);
            } catch {
            }
          else
            m.closeSync(D);
        }
        return P;
      }) : m.futimes && (m.lutimes = function(w, R, b, D) {
        D && process.nextTick(D);
      }, m.lutimesSync = function() {
      });
    }
    function l(m) {
      return m && function(w, R, b) {
        return m.call(r, w, R, function(D) {
          v(D) && (D = null), b && b.apply(this, arguments);
        });
      };
    }
    function s(m) {
      return m && function(w, R) {
        try {
          return m.call(r, w, R);
        } catch (b) {
          if (!v(b)) throw b;
        }
      };
    }
    function n(m) {
      return m && function(w, R, b, D) {
        return m.call(r, w, R, b, function(P) {
          v(P) && (P = null), D && D.apply(this, arguments);
        });
      };
    }
    function a(m) {
      return m && function(w, R, b) {
        try {
          return m.call(r, w, R, b);
        } catch (D) {
          if (!v(D)) throw D;
        }
      };
    }
    function p(m) {
      return m && function(w, R, b) {
        typeof R == "function" && (b = R, R = null);
        function D(P, F) {
          F && (F.uid < 0 && (F.uid += 4294967296), F.gid < 0 && (F.gid += 4294967296)), b && b.apply(this, arguments);
        }
        return R ? m.call(r, w, R, D) : m.call(r, w, D);
      };
    }
    function g(m) {
      return m && function(w, R) {
        var b = R ? m.call(r, w, R) : m.call(r, w);
        return b && (b.uid < 0 && (b.uid += 4294967296), b.gid < 0 && (b.gid += 4294967296)), b;
      };
    }
    function v(m) {
      if (!m || m.code === "ENOSYS")
        return !0;
      var w = !process.getuid || process.getuid() !== 0;
      return !!(w && (m.code === "EINVAL" || m.code === "EPERM"));
    }
  }
  return wn;
}
var _n, Zs;
function nf() {
  if (Zs) return _n;
  Zs = 1;
  var e = Fr.Stream;
  _n = i;
  function i(c) {
    return {
      ReadStream: o,
      WriteStream: d
    };
    function o(f, r) {
      if (!(this instanceof o)) return new o(f, r);
      e.call(this);
      var h = this;
      this.path = f, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, r = r || {};
      for (var t = Object.keys(r), l = 0, s = t.length; l < s; l++) {
        var n = t[l];
        this[n] = r[n];
      }
      if (this.encoding && this.setEncoding(this.encoding), this.start !== void 0) {
        if (typeof this.start != "number")
          throw TypeError("start must be a Number");
        if (this.end === void 0)
          this.end = 1 / 0;
        else if (typeof this.end != "number")
          throw TypeError("end must be a Number");
        if (this.start > this.end)
          throw new Error("start must be <= end");
        this.pos = this.start;
      }
      if (this.fd !== null) {
        process.nextTick(function() {
          h._read();
        });
        return;
      }
      c.open(this.path, this.flags, this.mode, function(a, p) {
        if (a) {
          h.emit("error", a), h.readable = !1;
          return;
        }
        h.fd = p, h.emit("open", p), h._read();
      });
    }
    function d(f, r) {
      if (!(this instanceof d)) return new d(f, r);
      e.call(this), this.path = f, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, r = r || {};
      for (var h = Object.keys(r), t = 0, l = h.length; t < l; t++) {
        var s = h[t];
        this[s] = r[s];
      }
      if (this.start !== void 0) {
        if (typeof this.start != "number")
          throw TypeError("start must be a Number");
        if (this.start < 0)
          throw new Error("start must be >= zero");
        this.pos = this.start;
      }
      this.busy = !1, this._queue = [], this.fd === null && (this._open = c.open, this._queue.push([this._open, this.path, this.flags, this.mode, void 0]), this.flush());
    }
  }
  return _n;
}
var Sn, ea;
function sf() {
  if (ea) return Sn;
  ea = 1, Sn = i;
  var e = Object.getPrototypeOf || function(c) {
    return c.__proto__;
  };
  function i(c) {
    if (c === null || typeof c != "object")
      return c;
    if (c instanceof Object)
      var o = { __proto__: e(c) };
    else
      var o = /* @__PURE__ */ Object.create(null);
    return Object.getOwnPropertyNames(c).forEach(function(d) {
      Object.defineProperty(o, d, Object.getOwnPropertyDescriptor(c, d));
    }), o;
  }
  return Sn;
}
var Wr, ta;
function Ye() {
  if (ta) return Wr;
  ta = 1;
  var e = Ct, i = rf(), c = nf(), o = sf(), d = ws, f, r;
  typeof Symbol == "function" && typeof Symbol.for == "function" ? (f = /* @__PURE__ */ Symbol.for("graceful-fs.queue"), r = /* @__PURE__ */ Symbol.for("graceful-fs.previous")) : (f = "___graceful-fs.queue", r = "___graceful-fs.previous");
  function h() {
  }
  function t(m, w) {
    Object.defineProperty(m, f, {
      get: function() {
        return w;
      }
    });
  }
  var l = h;
  if (d.debuglog ? l = d.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (l = function() {
    var m = d.format.apply(d, arguments);
    m = "GFS4: " + m.split(/\n/).join(`
GFS4: `), console.error(m);
  }), !e[f]) {
    var s = at[f] || [];
    t(e, s), e.close = (function(m) {
      function w(R, b) {
        return m.call(e, R, function(D) {
          D || g(), typeof b == "function" && b.apply(this, arguments);
        });
      }
      return Object.defineProperty(w, r, {
        value: m
      }), w;
    })(e.close), e.closeSync = (function(m) {
      function w(R) {
        m.apply(e, arguments), g();
      }
      return Object.defineProperty(w, r, {
        value: m
      }), w;
    })(e.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
      l(e[f]), fc.equal(e[f].length, 0);
    });
  }
  at[f] || t(at, e[f]), Wr = n(o(e)), process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !e.__patched && (Wr = n(e), e.__patched = !0);
  function n(m) {
    i(m), m.gracefulify = n, m.createReadStream = ie, m.createWriteStream = te;
    var w = m.readFile;
    m.readFile = R;
    function R(Y, pe, E) {
      return typeof pe == "function" && (E = pe, pe = null), y(Y, pe, E);
      function y(B, N, fe, ge) {
        return w(B, N, function(ye) {
          ye && (ye.code === "EMFILE" || ye.code === "ENFILE") ? a([y, [B, N, fe], ye, ge || Date.now(), Date.now()]) : typeof fe == "function" && fe.apply(this, arguments);
        });
      }
    }
    var b = m.writeFile;
    m.writeFile = D;
    function D(Y, pe, E, y) {
      return typeof E == "function" && (y = E, E = null), B(Y, pe, E, y);
      function B(N, fe, ge, ye, Se) {
        return b(N, fe, ge, function(we) {
          we && (we.code === "EMFILE" || we.code === "ENFILE") ? a([B, [N, fe, ge, ye], we, Se || Date.now(), Date.now()]) : typeof ye == "function" && ye.apply(this, arguments);
        });
      }
    }
    var P = m.appendFile;
    P && (m.appendFile = F);
    function F(Y, pe, E, y) {
      return typeof E == "function" && (y = E, E = null), B(Y, pe, E, y);
      function B(N, fe, ge, ye, Se) {
        return P(N, fe, ge, function(we) {
          we && (we.code === "EMFILE" || we.code === "ENFILE") ? a([B, [N, fe, ge, ye], we, Se || Date.now(), Date.now()]) : typeof ye == "function" && ye.apply(this, arguments);
        });
      }
    }
    var I = m.copyFile;
    I && (m.copyFile = L);
    function L(Y, pe, E, y) {
      return typeof E == "function" && (y = E, E = 0), B(Y, pe, E, y);
      function B(N, fe, ge, ye, Se) {
        return I(N, fe, ge, function(we) {
          we && (we.code === "EMFILE" || we.code === "ENFILE") ? a([B, [N, fe, ge, ye], we, Se || Date.now(), Date.now()]) : typeof ye == "function" && ye.apply(this, arguments);
        });
      }
    }
    var S = m.readdir;
    m.readdir = G;
    var z = /^v[0-5]\./;
    function G(Y, pe, E) {
      typeof pe == "function" && (E = pe, pe = null);
      var y = z.test(process.version) ? function(fe, ge, ye, Se) {
        return S(fe, B(
          fe,
          ge,
          ye,
          Se
        ));
      } : function(fe, ge, ye, Se) {
        return S(fe, ge, B(
          fe,
          ge,
          ye,
          Se
        ));
      };
      return y(Y, pe, E);
      function B(N, fe, ge, ye) {
        return function(Se, we) {
          Se && (Se.code === "EMFILE" || Se.code === "ENFILE") ? a([
            y,
            [N, fe, ge],
            Se,
            ye || Date.now(),
            Date.now()
          ]) : (we && we.sort && we.sort(), typeof ge == "function" && ge.call(this, Se, we));
        };
      }
    }
    if (process.version.substr(0, 4) === "v0.8") {
      var $ = c(m);
      A = $.ReadStream, M = $.WriteStream;
    }
    var H = m.ReadStream;
    H && (A.prototype = Object.create(H.prototype), A.prototype.open = k);
    var U = m.WriteStream;
    U && (M.prototype = Object.create(U.prototype), M.prototype.open = W), Object.defineProperty(m, "ReadStream", {
      get: function() {
        return A;
      },
      set: function(Y) {
        A = Y;
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(m, "WriteStream", {
      get: function() {
        return M;
      },
      set: function(Y) {
        M = Y;
      },
      enumerable: !0,
      configurable: !0
    });
    var C = A;
    Object.defineProperty(m, "FileReadStream", {
      get: function() {
        return C;
      },
      set: function(Y) {
        C = Y;
      },
      enumerable: !0,
      configurable: !0
    });
    var O = M;
    Object.defineProperty(m, "FileWriteStream", {
      get: function() {
        return O;
      },
      set: function(Y) {
        O = Y;
      },
      enumerable: !0,
      configurable: !0
    });
    function A(Y, pe) {
      return this instanceof A ? (H.apply(this, arguments), this) : A.apply(Object.create(A.prototype), arguments);
    }
    function k() {
      var Y = this;
      he(Y.path, Y.flags, Y.mode, function(pe, E) {
        pe ? (Y.autoClose && Y.destroy(), Y.emit("error", pe)) : (Y.fd = E, Y.emit("open", E), Y.read());
      });
    }
    function M(Y, pe) {
      return this instanceof M ? (U.apply(this, arguments), this) : M.apply(Object.create(M.prototype), arguments);
    }
    function W() {
      var Y = this;
      he(Y.path, Y.flags, Y.mode, function(pe, E) {
        pe ? (Y.destroy(), Y.emit("error", pe)) : (Y.fd = E, Y.emit("open", E));
      });
    }
    function ie(Y, pe) {
      return new m.ReadStream(Y, pe);
    }
    function te(Y, pe) {
      return new m.WriteStream(Y, pe);
    }
    var de = m.open;
    m.open = he;
    function he(Y, pe, E, y) {
      return typeof E == "function" && (y = E, E = null), B(Y, pe, E, y);
      function B(N, fe, ge, ye, Se) {
        return de(N, fe, ge, function(we, ze) {
          we && (we.code === "EMFILE" || we.code === "ENFILE") ? a([B, [N, fe, ge, ye], we, Se || Date.now(), Date.now()]) : typeof ye == "function" && ye.apply(this, arguments);
        });
      }
    }
    return m;
  }
  function a(m) {
    l("ENQUEUE", m[0].name, m[1]), e[f].push(m), v();
  }
  var p;
  function g() {
    for (var m = Date.now(), w = 0; w < e[f].length; ++w)
      e[f][w].length > 2 && (e[f][w][3] = m, e[f][w][4] = m);
    v();
  }
  function v() {
    if (clearTimeout(p), p = void 0, e[f].length !== 0) {
      var m = e[f].shift(), w = m[0], R = m[1], b = m[2], D = m[3], P = m[4];
      if (D === void 0)
        l("RETRY", w.name, R), w.apply(null, R);
      else if (Date.now() - D >= 6e4) {
        l("TIMEOUT", w.name, R);
        var F = R.pop();
        typeof F == "function" && F.call(null, b);
      } else {
        var I = Date.now() - P, L = Math.max(P - D, 1), S = Math.min(L * 1.2, 100);
        I >= S ? (l("RETRY", w.name, R), w.apply(null, R.concat([D]))) : e[f].push(m);
      }
      p === void 0 && (p = setTimeout(v, 0));
    }
  }
  return Wr;
}
var ra;
function nr() {
  return ra || (ra = 1, (function(e) {
    const i = Ke().fromCallback, c = Ye(), o = [
      "access",
      "appendFile",
      "chmod",
      "chown",
      "close",
      "copyFile",
      "fchmod",
      "fchown",
      "fdatasync",
      "fstat",
      "fsync",
      "ftruncate",
      "futimes",
      "lchmod",
      "lchown",
      "link",
      "lstat",
      "mkdir",
      "mkdtemp",
      "open",
      "opendir",
      "readdir",
      "readFile",
      "readlink",
      "realpath",
      "rename",
      "rm",
      "rmdir",
      "stat",
      "symlink",
      "truncate",
      "unlink",
      "utimes",
      "writeFile"
    ].filter((d) => typeof c[d] == "function");
    Object.assign(e, c), o.forEach((d) => {
      e[d] = i(c[d]);
    }), e.exists = function(d, f) {
      return typeof f == "function" ? c.exists(d, f) : new Promise((r) => c.exists(d, r));
    }, e.read = function(d, f, r, h, t, l) {
      return typeof l == "function" ? c.read(d, f, r, h, t, l) : new Promise((s, n) => {
        c.read(d, f, r, h, t, (a, p, g) => {
          if (a) return n(a);
          s({ bytesRead: p, buffer: g });
        });
      });
    }, e.write = function(d, f, ...r) {
      return typeof r[r.length - 1] == "function" ? c.write(d, f, ...r) : new Promise((h, t) => {
        c.write(d, f, ...r, (l, s, n) => {
          if (l) return t(l);
          h({ bytesWritten: s, buffer: n });
        });
      });
    }, typeof c.writev == "function" && (e.writev = function(d, f, ...r) {
      return typeof r[r.length - 1] == "function" ? c.writev(d, f, ...r) : new Promise((h, t) => {
        c.writev(d, f, ...r, (l, s, n) => {
          if (l) return t(l);
          h({ bytesWritten: s, buffers: n });
        });
      });
    }), typeof c.realpath.native == "function" ? e.realpath.native = i(c.realpath.native) : process.emitWarning(
      "fs.realpath.native is not a function. Is fs being monkey-patched?",
      "Warning",
      "fs-extra-WARN0003"
    );
  })(En)), En;
}
var Vr = {}, An = {}, na;
function af() {
  if (na) return An;
  na = 1;
  const e = Fe;
  return An.checkPath = function(c) {
    if (process.platform === "win32" && /[<>:"|?*]/.test(c.replace(e.parse(c).root, ""))) {
      const d = new Error(`Path contains invalid characters: ${c}`);
      throw d.code = "EINVAL", d;
    }
  }, An;
}
var ia;
function of() {
  if (ia) return Vr;
  ia = 1;
  const e = /* @__PURE__ */ nr(), { checkPath: i } = /* @__PURE__ */ af(), c = (o) => {
    const d = { mode: 511 };
    return typeof o == "number" ? o : { ...d, ...o }.mode;
  };
  return Vr.makeDir = async (o, d) => (i(o), e.mkdir(o, {
    mode: c(d),
    recursive: !0
  })), Vr.makeDirSync = (o, d) => (i(o), e.mkdirSync(o, {
    mode: c(d),
    recursive: !0
  })), Vr;
}
var Rn, sa;
function dt() {
  if (sa) return Rn;
  sa = 1;
  const e = Ke().fromPromise, { makeDir: i, makeDirSync: c } = /* @__PURE__ */ of(), o = e(i);
  return Rn = {
    mkdirs: o,
    mkdirsSync: c,
    // alias
    mkdirp: o,
    mkdirpSync: c,
    ensureDir: o,
    ensureDirSync: c
  }, Rn;
}
var Tn, aa;
function Mt() {
  if (aa) return Tn;
  aa = 1;
  const e = Ke().fromPromise, i = /* @__PURE__ */ nr();
  function c(o) {
    return i.access(o).then(() => !0).catch(() => !1);
  }
  return Tn = {
    pathExists: e(c),
    pathExistsSync: i.existsSync
  }, Tn;
}
var bn, oa;
function yc() {
  if (oa) return bn;
  oa = 1;
  const e = Ye();
  function i(o, d, f, r) {
    e.open(o, "r+", (h, t) => {
      if (h) return r(h);
      e.futimes(t, d, f, (l) => {
        e.close(t, (s) => {
          r && r(l || s);
        });
      });
    });
  }
  function c(o, d, f) {
    const r = e.openSync(o, "r+");
    return e.futimesSync(r, d, f), e.closeSync(r);
  }
  return bn = {
    utimesMillis: i,
    utimesMillisSync: c
  }, bn;
}
var Cn, la;
function ir() {
  if (la) return Cn;
  la = 1;
  const e = /* @__PURE__ */ nr(), i = Fe, c = ws;
  function o(a, p, g) {
    const v = g.dereference ? (m) => e.stat(m, { bigint: !0 }) : (m) => e.lstat(m, { bigint: !0 });
    return Promise.all([
      v(a),
      v(p).catch((m) => {
        if (m.code === "ENOENT") return null;
        throw m;
      })
    ]).then(([m, w]) => ({ srcStat: m, destStat: w }));
  }
  function d(a, p, g) {
    let v;
    const m = g.dereference ? (R) => e.statSync(R, { bigint: !0 }) : (R) => e.lstatSync(R, { bigint: !0 }), w = m(a);
    try {
      v = m(p);
    } catch (R) {
      if (R.code === "ENOENT") return { srcStat: w, destStat: null };
      throw R;
    }
    return { srcStat: w, destStat: v };
  }
  function f(a, p, g, v, m) {
    c.callbackify(o)(a, p, v, (w, R) => {
      if (w) return m(w);
      const { srcStat: b, destStat: D } = R;
      if (D) {
        if (l(b, D)) {
          const P = i.basename(a), F = i.basename(p);
          return g === "move" && P !== F && P.toLowerCase() === F.toLowerCase() ? m(null, { srcStat: b, destStat: D, isChangingCase: !0 }) : m(new Error("Source and destination must not be the same."));
        }
        if (b.isDirectory() && !D.isDirectory())
          return m(new Error(`Cannot overwrite non-directory '${p}' with directory '${a}'.`));
        if (!b.isDirectory() && D.isDirectory())
          return m(new Error(`Cannot overwrite directory '${p}' with non-directory '${a}'.`));
      }
      return b.isDirectory() && s(a, p) ? m(new Error(n(a, p, g))) : m(null, { srcStat: b, destStat: D });
    });
  }
  function r(a, p, g, v) {
    const { srcStat: m, destStat: w } = d(a, p, v);
    if (w) {
      if (l(m, w)) {
        const R = i.basename(a), b = i.basename(p);
        if (g === "move" && R !== b && R.toLowerCase() === b.toLowerCase())
          return { srcStat: m, destStat: w, isChangingCase: !0 };
        throw new Error("Source and destination must not be the same.");
      }
      if (m.isDirectory() && !w.isDirectory())
        throw new Error(`Cannot overwrite non-directory '${p}' with directory '${a}'.`);
      if (!m.isDirectory() && w.isDirectory())
        throw new Error(`Cannot overwrite directory '${p}' with non-directory '${a}'.`);
    }
    if (m.isDirectory() && s(a, p))
      throw new Error(n(a, p, g));
    return { srcStat: m, destStat: w };
  }
  function h(a, p, g, v, m) {
    const w = i.resolve(i.dirname(a)), R = i.resolve(i.dirname(g));
    if (R === w || R === i.parse(R).root) return m();
    e.stat(R, { bigint: !0 }, (b, D) => b ? b.code === "ENOENT" ? m() : m(b) : l(p, D) ? m(new Error(n(a, g, v))) : h(a, p, R, v, m));
  }
  function t(a, p, g, v) {
    const m = i.resolve(i.dirname(a)), w = i.resolve(i.dirname(g));
    if (w === m || w === i.parse(w).root) return;
    let R;
    try {
      R = e.statSync(w, { bigint: !0 });
    } catch (b) {
      if (b.code === "ENOENT") return;
      throw b;
    }
    if (l(p, R))
      throw new Error(n(a, g, v));
    return t(a, p, w, v);
  }
  function l(a, p) {
    return p.ino && p.dev && p.ino === a.ino && p.dev === a.dev;
  }
  function s(a, p) {
    const g = i.resolve(a).split(i.sep).filter((m) => m), v = i.resolve(p).split(i.sep).filter((m) => m);
    return g.reduce((m, w, R) => m && v[R] === w, !0);
  }
  function n(a, p, g) {
    return `Cannot ${g} '${a}' to a subdirectory of itself, '${p}'.`;
  }
  return Cn = {
    checkPaths: f,
    checkPathsSync: r,
    checkParentPaths: h,
    checkParentPathsSync: t,
    isSrcSubdir: s,
    areIdentical: l
  }, Cn;
}
var Pn, ca;
function lf() {
  if (ca) return Pn;
  ca = 1;
  const e = Ye(), i = Fe, c = dt().mkdirs, o = Mt().pathExists, d = yc().utimesMillis, f = /* @__PURE__ */ ir();
  function r(G, $, H, U) {
    typeof H == "function" && !U ? (U = H, H = {}) : typeof H == "function" && (H = { filter: H }), U = U || function() {
    }, H = H || {}, H.clobber = "clobber" in H ? !!H.clobber : !0, H.overwrite = "overwrite" in H ? !!H.overwrite : H.clobber, H.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0001"
    ), f.checkPaths(G, $, "copy", H, (C, O) => {
      if (C) return U(C);
      const { srcStat: A, destStat: k } = O;
      f.checkParentPaths(G, A, $, "copy", (M) => M ? U(M) : H.filter ? t(h, k, G, $, H, U) : h(k, G, $, H, U));
    });
  }
  function h(G, $, H, U, C) {
    const O = i.dirname(H);
    o(O, (A, k) => {
      if (A) return C(A);
      if (k) return s(G, $, H, U, C);
      c(O, (M) => M ? C(M) : s(G, $, H, U, C));
    });
  }
  function t(G, $, H, U, C, O) {
    Promise.resolve(C.filter(H, U)).then((A) => A ? G($, H, U, C, O) : O(), (A) => O(A));
  }
  function l(G, $, H, U, C) {
    return U.filter ? t(s, G, $, H, U, C) : s(G, $, H, U, C);
  }
  function s(G, $, H, U, C) {
    (U.dereference ? e.stat : e.lstat)($, (A, k) => A ? C(A) : k.isDirectory() ? D(k, G, $, H, U, C) : k.isFile() || k.isCharacterDevice() || k.isBlockDevice() ? n(k, G, $, H, U, C) : k.isSymbolicLink() ? S(G, $, H, U, C) : k.isSocket() ? C(new Error(`Cannot copy a socket file: ${$}`)) : k.isFIFO() ? C(new Error(`Cannot copy a FIFO pipe: ${$}`)) : C(new Error(`Unknown file: ${$}`)));
  }
  function n(G, $, H, U, C, O) {
    return $ ? a(G, H, U, C, O) : p(G, H, U, C, O);
  }
  function a(G, $, H, U, C) {
    if (U.overwrite)
      e.unlink(H, (O) => O ? C(O) : p(G, $, H, U, C));
    else return U.errorOnExist ? C(new Error(`'${H}' already exists`)) : C();
  }
  function p(G, $, H, U, C) {
    e.copyFile($, H, (O) => O ? C(O) : U.preserveTimestamps ? g(G.mode, $, H, C) : R(H, G.mode, C));
  }
  function g(G, $, H, U) {
    return v(G) ? m(H, G, (C) => C ? U(C) : w(G, $, H, U)) : w(G, $, H, U);
  }
  function v(G) {
    return (G & 128) === 0;
  }
  function m(G, $, H) {
    return R(G, $ | 128, H);
  }
  function w(G, $, H, U) {
    b($, H, (C) => C ? U(C) : R(H, G, U));
  }
  function R(G, $, H) {
    return e.chmod(G, $, H);
  }
  function b(G, $, H) {
    e.stat(G, (U, C) => U ? H(U) : d($, C.atime, C.mtime, H));
  }
  function D(G, $, H, U, C, O) {
    return $ ? F(H, U, C, O) : P(G.mode, H, U, C, O);
  }
  function P(G, $, H, U, C) {
    e.mkdir(H, (O) => {
      if (O) return C(O);
      F($, H, U, (A) => A ? C(A) : R(H, G, C));
    });
  }
  function F(G, $, H, U) {
    e.readdir(G, (C, O) => C ? U(C) : I(O, G, $, H, U));
  }
  function I(G, $, H, U, C) {
    const O = G.pop();
    return O ? L(G, O, $, H, U, C) : C();
  }
  function L(G, $, H, U, C, O) {
    const A = i.join(H, $), k = i.join(U, $);
    f.checkPaths(A, k, "copy", C, (M, W) => {
      if (M) return O(M);
      const { destStat: ie } = W;
      l(ie, A, k, C, (te) => te ? O(te) : I(G, H, U, C, O));
    });
  }
  function S(G, $, H, U, C) {
    e.readlink($, (O, A) => {
      if (O) return C(O);
      if (U.dereference && (A = i.resolve(process.cwd(), A)), G)
        e.readlink(H, (k, M) => k ? k.code === "EINVAL" || k.code === "UNKNOWN" ? e.symlink(A, H, C) : C(k) : (U.dereference && (M = i.resolve(process.cwd(), M)), f.isSrcSubdir(A, M) ? C(new Error(`Cannot copy '${A}' to a subdirectory of itself, '${M}'.`)) : G.isDirectory() && f.isSrcSubdir(M, A) ? C(new Error(`Cannot overwrite '${M}' with '${A}'.`)) : z(A, H, C)));
      else
        return e.symlink(A, H, C);
    });
  }
  function z(G, $, H) {
    e.unlink($, (U) => U ? H(U) : e.symlink(G, $, H));
  }
  return Pn = r, Pn;
}
var In, ua;
function cf() {
  if (ua) return In;
  ua = 1;
  const e = Ye(), i = Fe, c = dt().mkdirsSync, o = yc().utimesMillisSync, d = /* @__PURE__ */ ir();
  function f(I, L, S) {
    typeof S == "function" && (S = { filter: S }), S = S || {}, S.clobber = "clobber" in S ? !!S.clobber : !0, S.overwrite = "overwrite" in S ? !!S.overwrite : S.clobber, S.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0002"
    );
    const { srcStat: z, destStat: G } = d.checkPathsSync(I, L, "copy", S);
    return d.checkParentPathsSync(I, z, L, "copy"), r(G, I, L, S);
  }
  function r(I, L, S, z) {
    if (z.filter && !z.filter(L, S)) return;
    const G = i.dirname(S);
    return e.existsSync(G) || c(G), t(I, L, S, z);
  }
  function h(I, L, S, z) {
    if (!(z.filter && !z.filter(L, S)))
      return t(I, L, S, z);
  }
  function t(I, L, S, z) {
    const $ = (z.dereference ? e.statSync : e.lstatSync)(L);
    if ($.isDirectory()) return w($, I, L, S, z);
    if ($.isFile() || $.isCharacterDevice() || $.isBlockDevice()) return l($, I, L, S, z);
    if ($.isSymbolicLink()) return P(I, L, S, z);
    throw $.isSocket() ? new Error(`Cannot copy a socket file: ${L}`) : $.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${L}`) : new Error(`Unknown file: ${L}`);
  }
  function l(I, L, S, z, G) {
    return L ? s(I, S, z, G) : n(I, S, z, G);
  }
  function s(I, L, S, z) {
    if (z.overwrite)
      return e.unlinkSync(S), n(I, L, S, z);
    if (z.errorOnExist)
      throw new Error(`'${S}' already exists`);
  }
  function n(I, L, S, z) {
    return e.copyFileSync(L, S), z.preserveTimestamps && a(I.mode, L, S), v(S, I.mode);
  }
  function a(I, L, S) {
    return p(I) && g(S, I), m(L, S);
  }
  function p(I) {
    return (I & 128) === 0;
  }
  function g(I, L) {
    return v(I, L | 128);
  }
  function v(I, L) {
    return e.chmodSync(I, L);
  }
  function m(I, L) {
    const S = e.statSync(I);
    return o(L, S.atime, S.mtime);
  }
  function w(I, L, S, z, G) {
    return L ? b(S, z, G) : R(I.mode, S, z, G);
  }
  function R(I, L, S, z) {
    return e.mkdirSync(S), b(L, S, z), v(S, I);
  }
  function b(I, L, S) {
    e.readdirSync(I).forEach((z) => D(z, I, L, S));
  }
  function D(I, L, S, z) {
    const G = i.join(L, I), $ = i.join(S, I), { destStat: H } = d.checkPathsSync(G, $, "copy", z);
    return h(H, G, $, z);
  }
  function P(I, L, S, z) {
    let G = e.readlinkSync(L);
    if (z.dereference && (G = i.resolve(process.cwd(), G)), I) {
      let $;
      try {
        $ = e.readlinkSync(S);
      } catch (H) {
        if (H.code === "EINVAL" || H.code === "UNKNOWN") return e.symlinkSync(G, S);
        throw H;
      }
      if (z.dereference && ($ = i.resolve(process.cwd(), $)), d.isSrcSubdir(G, $))
        throw new Error(`Cannot copy '${G}' to a subdirectory of itself, '${$}'.`);
      if (e.statSync(S).isDirectory() && d.isSrcSubdir($, G))
        throw new Error(`Cannot overwrite '${$}' with '${G}'.`);
      return F(G, S);
    } else
      return e.symlinkSync(G, S);
  }
  function F(I, L) {
    return e.unlinkSync(L), e.symlinkSync(I, L);
  }
  return In = f, In;
}
var On, fa;
function _s() {
  if (fa) return On;
  fa = 1;
  const e = Ke().fromCallback;
  return On = {
    copy: e(/* @__PURE__ */ lf()),
    copySync: /* @__PURE__ */ cf()
  }, On;
}
var Dn, da;
function uf() {
  if (da) return Dn;
  da = 1;
  const e = Ye(), i = Fe, c = fc, o = process.platform === "win32";
  function d(g) {
    [
      "unlink",
      "chmod",
      "stat",
      "lstat",
      "rmdir",
      "readdir"
    ].forEach((m) => {
      g[m] = g[m] || e[m], m = m + "Sync", g[m] = g[m] || e[m];
    }), g.maxBusyTries = g.maxBusyTries || 3;
  }
  function f(g, v, m) {
    let w = 0;
    typeof v == "function" && (m = v, v = {}), c(g, "rimraf: missing path"), c.strictEqual(typeof g, "string", "rimraf: path should be a string"), c.strictEqual(typeof m, "function", "rimraf: callback function required"), c(v, "rimraf: invalid options argument provided"), c.strictEqual(typeof v, "object", "rimraf: options should be object"), d(v), r(g, v, function R(b) {
      if (b) {
        if ((b.code === "EBUSY" || b.code === "ENOTEMPTY" || b.code === "EPERM") && w < v.maxBusyTries) {
          w++;
          const D = w * 100;
          return setTimeout(() => r(g, v, R), D);
        }
        b.code === "ENOENT" && (b = null);
      }
      m(b);
    });
  }
  function r(g, v, m) {
    c(g), c(v), c(typeof m == "function"), v.lstat(g, (w, R) => {
      if (w && w.code === "ENOENT")
        return m(null);
      if (w && w.code === "EPERM" && o)
        return h(g, v, w, m);
      if (R && R.isDirectory())
        return l(g, v, w, m);
      v.unlink(g, (b) => {
        if (b) {
          if (b.code === "ENOENT")
            return m(null);
          if (b.code === "EPERM")
            return o ? h(g, v, b, m) : l(g, v, b, m);
          if (b.code === "EISDIR")
            return l(g, v, b, m);
        }
        return m(b);
      });
    });
  }
  function h(g, v, m, w) {
    c(g), c(v), c(typeof w == "function"), v.chmod(g, 438, (R) => {
      R ? w(R.code === "ENOENT" ? null : m) : v.stat(g, (b, D) => {
        b ? w(b.code === "ENOENT" ? null : m) : D.isDirectory() ? l(g, v, m, w) : v.unlink(g, w);
      });
    });
  }
  function t(g, v, m) {
    let w;
    c(g), c(v);
    try {
      v.chmodSync(g, 438);
    } catch (R) {
      if (R.code === "ENOENT")
        return;
      throw m;
    }
    try {
      w = v.statSync(g);
    } catch (R) {
      if (R.code === "ENOENT")
        return;
      throw m;
    }
    w.isDirectory() ? a(g, v, m) : v.unlinkSync(g);
  }
  function l(g, v, m, w) {
    c(g), c(v), c(typeof w == "function"), v.rmdir(g, (R) => {
      R && (R.code === "ENOTEMPTY" || R.code === "EEXIST" || R.code === "EPERM") ? s(g, v, w) : R && R.code === "ENOTDIR" ? w(m) : w(R);
    });
  }
  function s(g, v, m) {
    c(g), c(v), c(typeof m == "function"), v.readdir(g, (w, R) => {
      if (w) return m(w);
      let b = R.length, D;
      if (b === 0) return v.rmdir(g, m);
      R.forEach((P) => {
        f(i.join(g, P), v, (F) => {
          if (!D) {
            if (F) return m(D = F);
            --b === 0 && v.rmdir(g, m);
          }
        });
      });
    });
  }
  function n(g, v) {
    let m;
    v = v || {}, d(v), c(g, "rimraf: missing path"), c.strictEqual(typeof g, "string", "rimraf: path should be a string"), c(v, "rimraf: missing options"), c.strictEqual(typeof v, "object", "rimraf: options should be object");
    try {
      m = v.lstatSync(g);
    } catch (w) {
      if (w.code === "ENOENT")
        return;
      w.code === "EPERM" && o && t(g, v, w);
    }
    try {
      m && m.isDirectory() ? a(g, v, null) : v.unlinkSync(g);
    } catch (w) {
      if (w.code === "ENOENT")
        return;
      if (w.code === "EPERM")
        return o ? t(g, v, w) : a(g, v, w);
      if (w.code !== "EISDIR")
        throw w;
      a(g, v, w);
    }
  }
  function a(g, v, m) {
    c(g), c(v);
    try {
      v.rmdirSync(g);
    } catch (w) {
      if (w.code === "ENOTDIR")
        throw m;
      if (w.code === "ENOTEMPTY" || w.code === "EEXIST" || w.code === "EPERM")
        p(g, v);
      else if (w.code !== "ENOENT")
        throw w;
    }
  }
  function p(g, v) {
    if (c(g), c(v), v.readdirSync(g).forEach((m) => n(i.join(g, m), v)), o) {
      const m = Date.now();
      do
        try {
          return v.rmdirSync(g, v);
        } catch {
        }
      while (Date.now() - m < 500);
    } else
      return v.rmdirSync(g, v);
  }
  return Dn = f, f.sync = n, Dn;
}
var Nn, ha;
function ln() {
  if (ha) return Nn;
  ha = 1;
  const e = Ye(), i = Ke().fromCallback, c = /* @__PURE__ */ uf();
  function o(f, r) {
    if (e.rm) return e.rm(f, { recursive: !0, force: !0 }, r);
    c(f, r);
  }
  function d(f) {
    if (e.rmSync) return e.rmSync(f, { recursive: !0, force: !0 });
    c.sync(f);
  }
  return Nn = {
    remove: i(o),
    removeSync: d
  }, Nn;
}
var Fn, pa;
function ff() {
  if (pa) return Fn;
  pa = 1;
  const e = Ke().fromPromise, i = /* @__PURE__ */ nr(), c = Fe, o = /* @__PURE__ */ dt(), d = /* @__PURE__ */ ln(), f = e(async function(t) {
    let l;
    try {
      l = await i.readdir(t);
    } catch {
      return o.mkdirs(t);
    }
    return Promise.all(l.map((s) => d.remove(c.join(t, s))));
  });
  function r(h) {
    let t;
    try {
      t = i.readdirSync(h);
    } catch {
      return o.mkdirsSync(h);
    }
    t.forEach((l) => {
      l = c.join(h, l), d.removeSync(l);
    });
  }
  return Fn = {
    emptyDirSync: r,
    emptydirSync: r,
    emptyDir: f,
    emptydir: f
  }, Fn;
}
var Ln, ma;
function df() {
  if (ma) return Ln;
  ma = 1;
  const e = Ke().fromCallback, i = Fe, c = Ye(), o = /* @__PURE__ */ dt();
  function d(r, h) {
    function t() {
      c.writeFile(r, "", (l) => {
        if (l) return h(l);
        h();
      });
    }
    c.stat(r, (l, s) => {
      if (!l && s.isFile()) return h();
      const n = i.dirname(r);
      c.stat(n, (a, p) => {
        if (a)
          return a.code === "ENOENT" ? o.mkdirs(n, (g) => {
            if (g) return h(g);
            t();
          }) : h(a);
        p.isDirectory() ? t() : c.readdir(n, (g) => {
          if (g) return h(g);
        });
      });
    });
  }
  function f(r) {
    let h;
    try {
      h = c.statSync(r);
    } catch {
    }
    if (h && h.isFile()) return;
    const t = i.dirname(r);
    try {
      c.statSync(t).isDirectory() || c.readdirSync(t);
    } catch (l) {
      if (l && l.code === "ENOENT") o.mkdirsSync(t);
      else throw l;
    }
    c.writeFileSync(r, "");
  }
  return Ln = {
    createFile: e(d),
    createFileSync: f
  }, Ln;
}
var Un, ga;
function hf() {
  if (ga) return Un;
  ga = 1;
  const e = Ke().fromCallback, i = Fe, c = Ye(), o = /* @__PURE__ */ dt(), d = Mt().pathExists, { areIdentical: f } = /* @__PURE__ */ ir();
  function r(t, l, s) {
    function n(a, p) {
      c.link(a, p, (g) => {
        if (g) return s(g);
        s(null);
      });
    }
    c.lstat(l, (a, p) => {
      c.lstat(t, (g, v) => {
        if (g)
          return g.message = g.message.replace("lstat", "ensureLink"), s(g);
        if (p && f(v, p)) return s(null);
        const m = i.dirname(l);
        d(m, (w, R) => {
          if (w) return s(w);
          if (R) return n(t, l);
          o.mkdirs(m, (b) => {
            if (b) return s(b);
            n(t, l);
          });
        });
      });
    });
  }
  function h(t, l) {
    let s;
    try {
      s = c.lstatSync(l);
    } catch {
    }
    try {
      const p = c.lstatSync(t);
      if (s && f(p, s)) return;
    } catch (p) {
      throw p.message = p.message.replace("lstat", "ensureLink"), p;
    }
    const n = i.dirname(l);
    return c.existsSync(n) || o.mkdirsSync(n), c.linkSync(t, l);
  }
  return Un = {
    createLink: e(r),
    createLinkSync: h
  }, Un;
}
var xn, ya;
function pf() {
  if (ya) return xn;
  ya = 1;
  const e = Fe, i = Ye(), c = Mt().pathExists;
  function o(f, r, h) {
    if (e.isAbsolute(f))
      return i.lstat(f, (t) => t ? (t.message = t.message.replace("lstat", "ensureSymlink"), h(t)) : h(null, {
        toCwd: f,
        toDst: f
      }));
    {
      const t = e.dirname(r), l = e.join(t, f);
      return c(l, (s, n) => s ? h(s) : n ? h(null, {
        toCwd: l,
        toDst: f
      }) : i.lstat(f, (a) => a ? (a.message = a.message.replace("lstat", "ensureSymlink"), h(a)) : h(null, {
        toCwd: f,
        toDst: e.relative(t, f)
      })));
    }
  }
  function d(f, r) {
    let h;
    if (e.isAbsolute(f)) {
      if (h = i.existsSync(f), !h) throw new Error("absolute srcpath does not exist");
      return {
        toCwd: f,
        toDst: f
      };
    } else {
      const t = e.dirname(r), l = e.join(t, f);
      if (h = i.existsSync(l), h)
        return {
          toCwd: l,
          toDst: f
        };
      if (h = i.existsSync(f), !h) throw new Error("relative srcpath does not exist");
      return {
        toCwd: f,
        toDst: e.relative(t, f)
      };
    }
  }
  return xn = {
    symlinkPaths: o,
    symlinkPathsSync: d
  }, xn;
}
var kn, va;
function mf() {
  if (va) return kn;
  va = 1;
  const e = Ye();
  function i(o, d, f) {
    if (f = typeof d == "function" ? d : f, d = typeof d == "function" ? !1 : d, d) return f(null, d);
    e.lstat(o, (r, h) => {
      if (r) return f(null, "file");
      d = h && h.isDirectory() ? "dir" : "file", f(null, d);
    });
  }
  function c(o, d) {
    let f;
    if (d) return d;
    try {
      f = e.lstatSync(o);
    } catch {
      return "file";
    }
    return f && f.isDirectory() ? "dir" : "file";
  }
  return kn = {
    symlinkType: i,
    symlinkTypeSync: c
  }, kn;
}
var $n, Ea;
function gf() {
  if (Ea) return $n;
  Ea = 1;
  const e = Ke().fromCallback, i = Fe, c = /* @__PURE__ */ nr(), o = /* @__PURE__ */ dt(), d = o.mkdirs, f = o.mkdirsSync, r = /* @__PURE__ */ pf(), h = r.symlinkPaths, t = r.symlinkPathsSync, l = /* @__PURE__ */ mf(), s = l.symlinkType, n = l.symlinkTypeSync, a = Mt().pathExists, { areIdentical: p } = /* @__PURE__ */ ir();
  function g(w, R, b, D) {
    D = typeof b == "function" ? b : D, b = typeof b == "function" ? !1 : b, c.lstat(R, (P, F) => {
      !P && F.isSymbolicLink() ? Promise.all([
        c.stat(w),
        c.stat(R)
      ]).then(([I, L]) => {
        if (p(I, L)) return D(null);
        v(w, R, b, D);
      }) : v(w, R, b, D);
    });
  }
  function v(w, R, b, D) {
    h(w, R, (P, F) => {
      if (P) return D(P);
      w = F.toDst, s(F.toCwd, b, (I, L) => {
        if (I) return D(I);
        const S = i.dirname(R);
        a(S, (z, G) => {
          if (z) return D(z);
          if (G) return c.symlink(w, R, L, D);
          d(S, ($) => {
            if ($) return D($);
            c.symlink(w, R, L, D);
          });
        });
      });
    });
  }
  function m(w, R, b) {
    let D;
    try {
      D = c.lstatSync(R);
    } catch {
    }
    if (D && D.isSymbolicLink()) {
      const L = c.statSync(w), S = c.statSync(R);
      if (p(L, S)) return;
    }
    const P = t(w, R);
    w = P.toDst, b = n(P.toCwd, b);
    const F = i.dirname(R);
    return c.existsSync(F) || f(F), c.symlinkSync(w, R, b);
  }
  return $n = {
    createSymlink: e(g),
    createSymlinkSync: m
  }, $n;
}
var qn, wa;
function yf() {
  if (wa) return qn;
  wa = 1;
  const { createFile: e, createFileSync: i } = /* @__PURE__ */ df(), { createLink: c, createLinkSync: o } = /* @__PURE__ */ hf(), { createSymlink: d, createSymlinkSync: f } = /* @__PURE__ */ gf();
  return qn = {
    // file
    createFile: e,
    createFileSync: i,
    ensureFile: e,
    ensureFileSync: i,
    // link
    createLink: c,
    createLinkSync: o,
    ensureLink: c,
    ensureLinkSync: o,
    // symlink
    createSymlink: d,
    createSymlinkSync: f,
    ensureSymlink: d,
    ensureSymlinkSync: f
  }, qn;
}
var Mn, _a;
function Ss() {
  if (_a) return Mn;
  _a = 1;
  function e(c, { EOL: o = `
`, finalEOL: d = !0, replacer: f = null, spaces: r } = {}) {
    const h = d ? o : "", t = JSON.stringify(c, f, r);
    if (t === void 0)
      throw new TypeError(`Converting ${typeof c} value to JSON is not supported`);
    return t.replace(/\n/g, o) + h;
  }
  function i(c) {
    return Buffer.isBuffer(c) && (c = c.toString("utf8")), c.replace(/^\uFEFF/, "");
  }
  return Mn = { stringify: e, stripBom: i }, Mn;
}
var Bn, Sa;
function vf() {
  if (Sa) return Bn;
  Sa = 1;
  let e;
  try {
    e = Ye();
  } catch {
    e = Ct;
  }
  const i = Ke(), { stringify: c, stripBom: o } = Ss();
  async function d(s, n = {}) {
    typeof n == "string" && (n = { encoding: n });
    const a = n.fs || e, p = "throws" in n ? n.throws : !0;
    let g = await i.fromCallback(a.readFile)(s, n);
    g = o(g);
    let v;
    try {
      v = JSON.parse(g, n ? n.reviver : null);
    } catch (m) {
      if (p)
        throw m.message = `${s}: ${m.message}`, m;
      return null;
    }
    return v;
  }
  const f = i.fromPromise(d);
  function r(s, n = {}) {
    typeof n == "string" && (n = { encoding: n });
    const a = n.fs || e, p = "throws" in n ? n.throws : !0;
    try {
      let g = a.readFileSync(s, n);
      return g = o(g), JSON.parse(g, n.reviver);
    } catch (g) {
      if (p)
        throw g.message = `${s}: ${g.message}`, g;
      return null;
    }
  }
  async function h(s, n, a = {}) {
    const p = a.fs || e, g = c(n, a);
    await i.fromCallback(p.writeFile)(s, g, a);
  }
  const t = i.fromPromise(h);
  function l(s, n, a = {}) {
    const p = a.fs || e, g = c(n, a);
    return p.writeFileSync(s, g, a);
  }
  return Bn = {
    readFile: f,
    readFileSync: r,
    writeFile: t,
    writeFileSync: l
  }, Bn;
}
var jn, Aa;
function Ef() {
  if (Aa) return jn;
  Aa = 1;
  const e = vf();
  return jn = {
    // jsonfile exports
    readJson: e.readFile,
    readJsonSync: e.readFileSync,
    writeJson: e.writeFile,
    writeJsonSync: e.writeFileSync
  }, jn;
}
var Hn, Ra;
function As() {
  if (Ra) return Hn;
  Ra = 1;
  const e = Ke().fromCallback, i = Ye(), c = Fe, o = /* @__PURE__ */ dt(), d = Mt().pathExists;
  function f(h, t, l, s) {
    typeof l == "function" && (s = l, l = "utf8");
    const n = c.dirname(h);
    d(n, (a, p) => {
      if (a) return s(a);
      if (p) return i.writeFile(h, t, l, s);
      o.mkdirs(n, (g) => {
        if (g) return s(g);
        i.writeFile(h, t, l, s);
      });
    });
  }
  function r(h, ...t) {
    const l = c.dirname(h);
    if (i.existsSync(l))
      return i.writeFileSync(h, ...t);
    o.mkdirsSync(l), i.writeFileSync(h, ...t);
  }
  return Hn = {
    outputFile: e(f),
    outputFileSync: r
  }, Hn;
}
var Gn, Ta;
function wf() {
  if (Ta) return Gn;
  Ta = 1;
  const { stringify: e } = Ss(), { outputFile: i } = /* @__PURE__ */ As();
  async function c(o, d, f = {}) {
    const r = e(d, f);
    await i(o, r, f);
  }
  return Gn = c, Gn;
}
var Wn, ba;
function _f() {
  if (ba) return Wn;
  ba = 1;
  const { stringify: e } = Ss(), { outputFileSync: i } = /* @__PURE__ */ As();
  function c(o, d, f) {
    const r = e(d, f);
    i(o, r, f);
  }
  return Wn = c, Wn;
}
var Vn, Ca;
function Sf() {
  if (Ca) return Vn;
  Ca = 1;
  const e = Ke().fromPromise, i = /* @__PURE__ */ Ef();
  return i.outputJson = e(/* @__PURE__ */ wf()), i.outputJsonSync = /* @__PURE__ */ _f(), i.outputJSON = i.outputJson, i.outputJSONSync = i.outputJsonSync, i.writeJSON = i.writeJson, i.writeJSONSync = i.writeJsonSync, i.readJSON = i.readJson, i.readJSONSync = i.readJsonSync, Vn = i, Vn;
}
var zn, Pa;
function Af() {
  if (Pa) return zn;
  Pa = 1;
  const e = Ye(), i = Fe, c = _s().copy, o = ln().remove, d = dt().mkdirp, f = Mt().pathExists, r = /* @__PURE__ */ ir();
  function h(a, p, g, v) {
    typeof g == "function" && (v = g, g = {}), g = g || {};
    const m = g.overwrite || g.clobber || !1;
    r.checkPaths(a, p, "move", g, (w, R) => {
      if (w) return v(w);
      const { srcStat: b, isChangingCase: D = !1 } = R;
      r.checkParentPaths(a, b, p, "move", (P) => {
        if (P) return v(P);
        if (t(p)) return l(a, p, m, D, v);
        d(i.dirname(p), (F) => F ? v(F) : l(a, p, m, D, v));
      });
    });
  }
  function t(a) {
    const p = i.dirname(a);
    return i.parse(p).root === p;
  }
  function l(a, p, g, v, m) {
    if (v) return s(a, p, g, m);
    if (g)
      return o(p, (w) => w ? m(w) : s(a, p, g, m));
    f(p, (w, R) => w ? m(w) : R ? m(new Error("dest already exists.")) : s(a, p, g, m));
  }
  function s(a, p, g, v) {
    e.rename(a, p, (m) => m ? m.code !== "EXDEV" ? v(m) : n(a, p, g, v) : v());
  }
  function n(a, p, g, v) {
    c(a, p, {
      overwrite: g,
      errorOnExist: !0
    }, (w) => w ? v(w) : o(a, v));
  }
  return zn = h, zn;
}
var Yn, Ia;
function Rf() {
  if (Ia) return Yn;
  Ia = 1;
  const e = Ye(), i = Fe, c = _s().copySync, o = ln().removeSync, d = dt().mkdirpSync, f = /* @__PURE__ */ ir();
  function r(n, a, p) {
    p = p || {};
    const g = p.overwrite || p.clobber || !1, { srcStat: v, isChangingCase: m = !1 } = f.checkPathsSync(n, a, "move", p);
    return f.checkParentPathsSync(n, v, a, "move"), h(a) || d(i.dirname(a)), t(n, a, g, m);
  }
  function h(n) {
    const a = i.dirname(n);
    return i.parse(a).root === a;
  }
  function t(n, a, p, g) {
    if (g) return l(n, a, p);
    if (p)
      return o(a), l(n, a, p);
    if (e.existsSync(a)) throw new Error("dest already exists.");
    return l(n, a, p);
  }
  function l(n, a, p) {
    try {
      e.renameSync(n, a);
    } catch (g) {
      if (g.code !== "EXDEV") throw g;
      return s(n, a, p);
    }
  }
  function s(n, a, p) {
    return c(n, a, {
      overwrite: p,
      errorOnExist: !0
    }), o(n);
  }
  return Yn = r, Yn;
}
var Xn, Oa;
function Tf() {
  if (Oa) return Xn;
  Oa = 1;
  const e = Ke().fromCallback;
  return Xn = {
    move: e(/* @__PURE__ */ Af()),
    moveSync: /* @__PURE__ */ Rf()
  }, Xn;
}
var Jn, Da;
function Pt() {
  return Da || (Da = 1, Jn = {
    // Export promiseified graceful-fs:
    .../* @__PURE__ */ nr(),
    // Export extra methods:
    .../* @__PURE__ */ _s(),
    .../* @__PURE__ */ ff(),
    .../* @__PURE__ */ yf(),
    .../* @__PURE__ */ Sf(),
    .../* @__PURE__ */ dt(),
    .../* @__PURE__ */ Tf(),
    .../* @__PURE__ */ As(),
    .../* @__PURE__ */ Mt(),
    .../* @__PURE__ */ ln()
  }), Jn;
}
var lr = {}, Ut = {}, Kn = {}, xt = {}, Na;
function Rs() {
  if (Na) return xt;
  Na = 1, Object.defineProperty(xt, "__esModule", { value: !0 }), xt.CancellationError = xt.CancellationToken = void 0;
  const e = dc;
  let i = class extends e.EventEmitter {
    get cancelled() {
      return this._cancelled || this._parent != null && this._parent.cancelled;
    }
    set parent(d) {
      this.removeParentCancelHandler(), this._parent = d, this.parentCancelHandler = () => this.cancel(), this._parent.onCancel(this.parentCancelHandler);
    }
    // babel cannot compile ... correctly for super calls
    constructor(d) {
      super(), this.parentCancelHandler = null, this._parent = null, this._cancelled = !1, d != null && (this.parent = d);
    }
    cancel() {
      this._cancelled = !0, this.emit("cancel");
    }
    onCancel(d) {
      this.cancelled ? d() : this.once("cancel", d);
    }
    createPromise(d) {
      if (this.cancelled)
        return Promise.reject(new c());
      const f = () => {
        if (r != null)
          try {
            this.removeListener("cancel", r), r = null;
          } catch {
          }
      };
      let r = null;
      return new Promise((h, t) => {
        let l = null;
        if (r = () => {
          try {
            l != null && (l(), l = null);
          } finally {
            t(new c());
          }
        }, this.cancelled) {
          r();
          return;
        }
        this.onCancel(r), d(h, t, (s) => {
          l = s;
        });
      }).then((h) => (f(), h)).catch((h) => {
        throw f(), h;
      });
    }
    removeParentCancelHandler() {
      const d = this._parent;
      d != null && this.parentCancelHandler != null && (d.removeListener("cancel", this.parentCancelHandler), this.parentCancelHandler = null);
    }
    dispose() {
      try {
        this.removeParentCancelHandler();
      } finally {
        this.removeAllListeners(), this._parent = null;
      }
    }
  };
  xt.CancellationToken = i;
  class c extends Error {
    constructor() {
      super("cancelled");
    }
  }
  return xt.CancellationError = c, xt;
}
var zr = {}, Fa;
function cn() {
  if (Fa) return zr;
  Fa = 1, Object.defineProperty(zr, "__esModule", { value: !0 }), zr.newError = e;
  function e(i, c) {
    const o = new Error(i);
    return o.code = c, o;
  }
  return zr;
}
var ke = {}, Yr = { exports: {} }, Xr = { exports: {} }, Qn, La;
function bf() {
  if (La) return Qn;
  La = 1;
  var e = 1e3, i = e * 60, c = i * 60, o = c * 24, d = o * 7, f = o * 365.25;
  Qn = function(s, n) {
    n = n || {};
    var a = typeof s;
    if (a === "string" && s.length > 0)
      return r(s);
    if (a === "number" && isFinite(s))
      return n.long ? t(s) : h(s);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(s)
    );
  };
  function r(s) {
    if (s = String(s), !(s.length > 100)) {
      var n = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        s
      );
      if (n) {
        var a = parseFloat(n[1]), p = (n[2] || "ms").toLowerCase();
        switch (p) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return a * f;
          case "weeks":
          case "week":
          case "w":
            return a * d;
          case "days":
          case "day":
          case "d":
            return a * o;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return a * c;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return a * i;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return a * e;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return a;
          default:
            return;
        }
      }
    }
  }
  function h(s) {
    var n = Math.abs(s);
    return n >= o ? Math.round(s / o) + "d" : n >= c ? Math.round(s / c) + "h" : n >= i ? Math.round(s / i) + "m" : n >= e ? Math.round(s / e) + "s" : s + "ms";
  }
  function t(s) {
    var n = Math.abs(s);
    return n >= o ? l(s, n, o, "day") : n >= c ? l(s, n, c, "hour") : n >= i ? l(s, n, i, "minute") : n >= e ? l(s, n, e, "second") : s + " ms";
  }
  function l(s, n, a, p) {
    var g = n >= a * 1.5;
    return Math.round(s / a) + " " + p + (g ? "s" : "");
  }
  return Qn;
}
var Zn, Ua;
function vc() {
  if (Ua) return Zn;
  Ua = 1;
  function e(i) {
    o.debug = o, o.default = o, o.coerce = l, o.disable = h, o.enable = f, o.enabled = t, o.humanize = bf(), o.destroy = s, Object.keys(i).forEach((n) => {
      o[n] = i[n];
    }), o.names = [], o.skips = [], o.formatters = {};
    function c(n) {
      let a = 0;
      for (let p = 0; p < n.length; p++)
        a = (a << 5) - a + n.charCodeAt(p), a |= 0;
      return o.colors[Math.abs(a) % o.colors.length];
    }
    o.selectColor = c;
    function o(n) {
      let a, p = null, g, v;
      function m(...w) {
        if (!m.enabled)
          return;
        const R = m, b = Number(/* @__PURE__ */ new Date()), D = b - (a || b);
        R.diff = D, R.prev = a, R.curr = b, a = b, w[0] = o.coerce(w[0]), typeof w[0] != "string" && w.unshift("%O");
        let P = 0;
        w[0] = w[0].replace(/%([a-zA-Z%])/g, (I, L) => {
          if (I === "%%")
            return "%";
          P++;
          const S = o.formatters[L];
          if (typeof S == "function") {
            const z = w[P];
            I = S.call(R, z), w.splice(P, 1), P--;
          }
          return I;
        }), o.formatArgs.call(R, w), (R.log || o.log).apply(R, w);
      }
      return m.namespace = n, m.useColors = o.useColors(), m.color = o.selectColor(n), m.extend = d, m.destroy = o.destroy, Object.defineProperty(m, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => p !== null ? p : (g !== o.namespaces && (g = o.namespaces, v = o.enabled(n)), v),
        set: (w) => {
          p = w;
        }
      }), typeof o.init == "function" && o.init(m), m;
    }
    function d(n, a) {
      const p = o(this.namespace + (typeof a > "u" ? ":" : a) + n);
      return p.log = this.log, p;
    }
    function f(n) {
      o.save(n), o.namespaces = n, o.names = [], o.skips = [];
      const a = (typeof n == "string" ? n : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const p of a)
        p[0] === "-" ? o.skips.push(p.slice(1)) : o.names.push(p);
    }
    function r(n, a) {
      let p = 0, g = 0, v = -1, m = 0;
      for (; p < n.length; )
        if (g < a.length && (a[g] === n[p] || a[g] === "*"))
          a[g] === "*" ? (v = g, m = p, g++) : (p++, g++);
        else if (v !== -1)
          g = v + 1, m++, p = m;
        else
          return !1;
      for (; g < a.length && a[g] === "*"; )
        g++;
      return g === a.length;
    }
    function h() {
      const n = [
        ...o.names,
        ...o.skips.map((a) => "-" + a)
      ].join(",");
      return o.enable(""), n;
    }
    function t(n) {
      for (const a of o.skips)
        if (r(n, a))
          return !1;
      for (const a of o.names)
        if (r(n, a))
          return !0;
      return !1;
    }
    function l(n) {
      return n instanceof Error ? n.stack || n.message : n;
    }
    function s() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return o.enable(o.load()), o;
  }
  return Zn = e, Zn;
}
var xa;
function Cf() {
  return xa || (xa = 1, (function(e, i) {
    i.formatArgs = o, i.save = d, i.load = f, i.useColors = c, i.storage = r(), i.destroy = /* @__PURE__ */ (() => {
      let t = !1;
      return () => {
        t || (t = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), i.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function c() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
        return !1;
      let t;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (t = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(t[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function o(t) {
      if (t[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + t[0] + (this.useColors ? "%c " : " ") + "+" + e.exports.humanize(this.diff), !this.useColors)
        return;
      const l = "color: " + this.color;
      t.splice(1, 0, l, "color: inherit");
      let s = 0, n = 0;
      t[0].replace(/%[a-zA-Z%]/g, (a) => {
        a !== "%%" && (s++, a === "%c" && (n = s));
      }), t.splice(n, 0, l);
    }
    i.log = console.debug || console.log || (() => {
    });
    function d(t) {
      try {
        t ? i.storage.setItem("debug", t) : i.storage.removeItem("debug");
      } catch {
      }
    }
    function f() {
      let t;
      try {
        t = i.storage.getItem("debug") || i.storage.getItem("DEBUG");
      } catch {
      }
      return !t && typeof process < "u" && "env" in process && (t = process.env.DEBUG), t;
    }
    function r() {
      try {
        return localStorage;
      } catch {
      }
    }
    e.exports = vc()(i);
    const { formatters: h } = e.exports;
    h.j = function(t) {
      try {
        return JSON.stringify(t);
      } catch (l) {
        return "[UnexpectedJSONParseError]: " + l.message;
      }
    };
  })(Xr, Xr.exports)), Xr.exports;
}
var Jr = { exports: {} }, ei, ka;
function Pf() {
  return ka || (ka = 1, ei = (e, i = process.argv) => {
    const c = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", o = i.indexOf(c + e), d = i.indexOf("--");
    return o !== -1 && (d === -1 || o < d);
  }), ei;
}
var ti, $a;
function If() {
  if ($a) return ti;
  $a = 1;
  const e = an, i = mc, c = Pf(), { env: o } = process;
  let d;
  c("no-color") || c("no-colors") || c("color=false") || c("color=never") ? d = 0 : (c("color") || c("colors") || c("color=true") || c("color=always")) && (d = 1), "FORCE_COLOR" in o && (o.FORCE_COLOR === "true" ? d = 1 : o.FORCE_COLOR === "false" ? d = 0 : d = o.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(o.FORCE_COLOR, 10), 3));
  function f(t) {
    return t === 0 ? !1 : {
      level: t,
      hasBasic: !0,
      has256: t >= 2,
      has16m: t >= 3
    };
  }
  function r(t, l) {
    if (d === 0)
      return 0;
    if (c("color=16m") || c("color=full") || c("color=truecolor"))
      return 3;
    if (c("color=256"))
      return 2;
    if (t && !l && d === void 0)
      return 0;
    const s = d || 0;
    if (o.TERM === "dumb")
      return s;
    if (process.platform === "win32") {
      const n = e.release().split(".");
      return Number(n[0]) >= 10 && Number(n[2]) >= 10586 ? Number(n[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in o)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((n) => n in o) || o.CI_NAME === "codeship" ? 1 : s;
    if ("TEAMCITY_VERSION" in o)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(o.TEAMCITY_VERSION) ? 1 : 0;
    if (o.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in o) {
      const n = parseInt((o.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (o.TERM_PROGRAM) {
        case "iTerm.app":
          return n >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(o.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(o.TERM) || "COLORTERM" in o ? 1 : s;
  }
  function h(t) {
    const l = r(t, t && t.isTTY);
    return f(l);
  }
  return ti = {
    supportsColor: h,
    stdout: f(r(!0, i.isatty(1))),
    stderr: f(r(!0, i.isatty(2)))
  }, ti;
}
var qa;
function Of() {
  return qa || (qa = 1, (function(e, i) {
    const c = mc, o = ws;
    i.init = s, i.log = h, i.formatArgs = f, i.save = t, i.load = l, i.useColors = d, i.destroy = o.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), i.colors = [6, 2, 3, 4, 5, 1];
    try {
      const a = If();
      a && (a.stderr || a).level >= 2 && (i.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ]);
    } catch {
    }
    i.inspectOpts = Object.keys(process.env).filter((a) => /^debug_/i.test(a)).reduce((a, p) => {
      const g = p.substring(6).toLowerCase().replace(/_([a-z])/g, (m, w) => w.toUpperCase());
      let v = process.env[p];
      return /^(yes|on|true|enabled)$/i.test(v) ? v = !0 : /^(no|off|false|disabled)$/i.test(v) ? v = !1 : v === "null" ? v = null : v = Number(v), a[g] = v, a;
    }, {});
    function d() {
      return "colors" in i.inspectOpts ? !!i.inspectOpts.colors : c.isatty(process.stderr.fd);
    }
    function f(a) {
      const { namespace: p, useColors: g } = this;
      if (g) {
        const v = this.color, m = "\x1B[3" + (v < 8 ? v : "8;5;" + v), w = `  ${m};1m${p} \x1B[0m`;
        a[0] = w + a[0].split(`
`).join(`
` + w), a.push(m + "m+" + e.exports.humanize(this.diff) + "\x1B[0m");
      } else
        a[0] = r() + p + " " + a[0];
    }
    function r() {
      return i.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function h(...a) {
      return process.stderr.write(o.formatWithOptions(i.inspectOpts, ...a) + `
`);
    }
    function t(a) {
      a ? process.env.DEBUG = a : delete process.env.DEBUG;
    }
    function l() {
      return process.env.DEBUG;
    }
    function s(a) {
      a.inspectOpts = {};
      const p = Object.keys(i.inspectOpts);
      for (let g = 0; g < p.length; g++)
        a.inspectOpts[p[g]] = i.inspectOpts[p[g]];
    }
    e.exports = vc()(i);
    const { formatters: n } = e.exports;
    n.o = function(a) {
      return this.inspectOpts.colors = this.useColors, o.inspect(a, this.inspectOpts).split(`
`).map((p) => p.trim()).join(" ");
    }, n.O = function(a) {
      return this.inspectOpts.colors = this.useColors, o.inspect(a, this.inspectOpts);
    };
  })(Jr, Jr.exports)), Jr.exports;
}
var Ma;
function Df() {
  return Ma || (Ma = 1, typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? Yr.exports = Cf() : Yr.exports = Of()), Yr.exports;
}
var cr = {}, Ba;
function Ec() {
  if (Ba) return cr;
  Ba = 1, Object.defineProperty(cr, "__esModule", { value: !0 }), cr.ProgressCallbackTransform = void 0;
  const e = Fr;
  let i = class extends e.Transform {
    constructor(o, d, f) {
      super(), this.total = o, this.cancellationToken = d, this.onProgress = f, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.nextUpdate = this.start + 1e3;
    }
    _transform(o, d, f) {
      if (this.cancellationToken.cancelled) {
        f(new Error("cancelled"), null);
        return;
      }
      this.transferred += o.length, this.delta += o.length;
      const r = Date.now();
      r >= this.nextUpdate && this.transferred !== this.total && (this.nextUpdate = r + 1e3, this.onProgress({
        total: this.total,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.total * 100,
        bytesPerSecond: Math.round(this.transferred / ((r - this.start) / 1e3))
      }), this.delta = 0), f(null, o);
    }
    _flush(o) {
      if (this.cancellationToken.cancelled) {
        o(new Error("cancelled"));
        return;
      }
      this.onProgress({
        total: this.total,
        delta: this.delta,
        transferred: this.total,
        percent: 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      }), this.delta = 0, o(null);
    }
  };
  return cr.ProgressCallbackTransform = i, cr;
}
var ja;
function Nf() {
  if (ja) return ke;
  ja = 1, Object.defineProperty(ke, "__esModule", { value: !0 }), ke.DigestTransform = ke.HttpExecutor = ke.HttpError = void 0, ke.addSensitiveRedirectHeader = p, ke.addSensitiveFieldPattern = g, ke.createHttpError = v, ke.parseJson = R, ke.configureRequestOptionsFromUrl = P, ke.configureRequestUrl = F, ke.safeGetHeader = S, ke.configureRequestOptions = G, ke.isSensitiveFieldName = $, ke.hashSensitiveValue = H, ke.safeStringifyJson = U;
  const e = Lr, i = Df(), c = Ct, o = Fr, d = bt, f = Rs(), r = cn(), h = Ec(), t = (0, i.default)("electron-builder"), l = (C) => C.toLowerCase().replace(/[-_]/g, ""), s = /* @__PURE__ */ new Set(["authorization", "proxyauthorization", "privatetoken", "xapikey", "xauthtoken", "xaccesstoken", "xgitlabtoken", "cookie", "xcsrftoken"]), n = ["token", "password", "secret", "authorization", "credential", "apikey", "passphrase", "auth"], a = ["key"];
  function p(C) {
    s.add(l(C));
  }
  function g(C) {
    n.push(C.toLowerCase().replace(/[-_]/g, ""));
  }
  function v(C, O = null) {
    return new w(C.statusCode || -1, `${C.statusCode} ${C.statusMessage}` + (O == null ? "" : `
` + JSON.stringify(O, null, "  ")) + `
Headers: ` + U(C.headers), O);
  }
  const m = /* @__PURE__ */ new Map([
    [429, "Too many requests"],
    [400, "Bad request"],
    [403, "Forbidden"],
    [404, "Not found"],
    [405, "Method not allowed"],
    [406, "Not acceptable"],
    [408, "Request timeout"],
    [413, "Request entity too large"],
    [500, "Internal server error"],
    [502, "Bad gateway"],
    [503, "Service unavailable"],
    [504, "Gateway timeout"],
    [505, "HTTP version not supported"]
  ]);
  class w extends Error {
    constructor(O, A = `HTTP error: ${m.get(O) || O}`, k = null) {
      super(A), this.statusCode = O, this.description = k, this.name = "HttpError", this.code = `HTTP_ERROR_${O}`;
    }
    isServerError() {
      return this.statusCode >= 500 && this.statusCode <= 599;
    }
  }
  ke.HttpError = w;
  function R(C) {
    return C.then((O) => O == null || O.length === 0 ? null : JSON.parse(O));
  }
  class b {
    constructor() {
      this.maxRedirects = 10;
    }
    request(O, A = new f.CancellationToken(), k) {
      G(O);
      const M = k == null ? void 0 : JSON.stringify(k), W = M ? Buffer.from(M) : void 0;
      if (W != null) {
        t.enabled && t(U(k));
        const { headers: ie, ...te } = O;
        O = {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": W.length,
            ...ie
          },
          ...te
        };
      }
      return this.doApiRequest(O, A, (ie) => ie.end(W));
    }
    doApiRequest(O, A, k, M = 0) {
      if (t.enabled) {
        const { headers: W, auth: ie, ...te } = O;
        t(`Request: ${U(te)}`);
      }
      return A.createPromise((W, ie, te) => {
        const de = this.createRequest(O, (he) => {
          try {
            this.handleResponse(he, O, A, W, ie, M, k);
          } catch (Y) {
            ie(Y);
          }
        });
        this.addErrorAndTimeoutHandlers(de, ie, O.timeout), this.addRedirectHandlers(de, O, ie, M, (he) => {
          this.doApiRequest(he, A, k, M).then(W).catch(ie);
        }), k(de, ie), te(() => de.abort());
      });
    }
    // noinspection JSUnusedLocalSymbols
    // eslint-disable-next-line
    addRedirectHandlers(O, A, k, M, W) {
    }
    addErrorAndTimeoutHandlers(O, A, k = 60 * 1e3) {
      this.addTimeOutHandler(O, A, k), O.on("error", A), O.on("aborted", () => {
        A(new Error("Request has been aborted by the server"));
      });
    }
    handleResponse(O, A, k, M, W, ie, te) {
      var de;
      if (t.enabled) {
        const { headers: y, auth: B, ...N } = A;
        t(`Response: ${O.statusCode} ${O.statusMessage}, request options: ${U(N)}`);
      }
      if (O.statusCode === 404) {
        W(v(O, `method: ${A.method || "GET"} url: ${A.protocol || "https:"}//${A.hostname}${A.port ? `:${A.port}` : ""}${A.path}

Please double check that your authentication token is correct. Due to security reasons, actual status maybe not reported, but 404.
`));
        return;
      } else if (O.statusCode === 204) {
        M();
        return;
      }
      const he = (de = O.statusCode) !== null && de !== void 0 ? de : 0, Y = he >= 300 && he < 400, pe = S(O, "location");
      if (Y && pe != null) {
        if (ie > this.maxRedirects) {
          W(this.createMaxRedirectError());
          return;
        }
        this.doApiRequest(b.prepareRedirectUrlOptions(pe, A), k, te, ie).then(M).catch(W);
        return;
      }
      O.setEncoding("utf8");
      let E = "";
      O.on("error", W), O.on("data", (y) => E += y), O.on("end", () => {
        try {
          if (O.statusCode != null && O.statusCode >= 400) {
            const y = S(O, "content-type"), B = y != null && (Array.isArray(y) ? y.find((N) => N.includes("json")) != null : y.includes("json"));
            W(v(O, `method: ${A.method || "GET"} url: ${A.protocol || "https:"}//${A.hostname}${A.port ? `:${A.port}` : ""}${A.path}

          Data:
          ${B ? U(JSON.parse(E)) : E}
          `));
          } else
            M(E.length === 0 ? null : E);
        } catch (y) {
          W(y);
        }
      });
    }
    async downloadToBuffer(O, A) {
      return await A.cancellationToken.createPromise((k, M, W) => {
        const ie = [], te = {
          headers: A.headers || void 0,
          // because PrivateGitHubProvider requires HttpExecutor.prepareRedirectUrlOptions logic, so, we need to redirect manually
          redirect: "manual"
        };
        F(O, te), G(te), this.doDownload(te, {
          destination: null,
          options: A,
          onCancel: W,
          callback: (de) => {
            de == null ? k(Buffer.concat(ie)) : M(de);
          },
          responseHandler: (de, he) => {
            let Y = 0;
            de.on("data", (pe) => {
              if (Y += pe.length, Y > 524288e3) {
                he(new Error("Maximum allowed size is 500 MB"));
                return;
              }
              ie.push(pe);
            }), de.on("end", () => {
              he(null);
            });
          }
        }, 0);
      });
    }
    doDownload(O, A, k) {
      const M = this.createRequest(O, (W) => {
        if (W.statusCode >= 400) {
          A.callback(new Error(`Cannot download "${O.protocol || "https:"}//${O.hostname}${O.path}", status ${W.statusCode}: ${W.statusMessage}`));
          return;
        }
        W.on("error", A.callback);
        const ie = S(W, "location");
        if (ie != null) {
          k < this.maxRedirects ? this.doDownload(b.prepareRedirectUrlOptions(ie, O), A, k++) : A.callback(this.createMaxRedirectError());
          return;
        }
        A.responseHandler == null ? z(A, W) : A.responseHandler(W, A.callback);
      });
      this.addErrorAndTimeoutHandlers(M, A.callback, O.timeout), this.addRedirectHandlers(M, O, A.callback, k, (W) => {
        this.doDownload(W, A, k++);
      }), M.end();
    }
    createMaxRedirectError() {
      return new Error(`Too many redirects (> ${this.maxRedirects})`);
    }
    addTimeOutHandler(O, A, k) {
      O.on("socket", (M) => {
        M.setTimeout(k, () => {
          O.abort(), A(new Error("Request timed out"));
        });
      });
    }
    static prepareRedirectUrlOptions(O, A) {
      const k = P(O, { ...A }), M = k.headers;
      if (M == null)
        return k;
      const W = b.reconstructOriginalUrl(A), ie = D(O, A);
      if (b.isCrossOriginRedirect(W, ie)) {
        t.enabled && t(`Cross-origin redirect (${W.host} → ${ie.host}): stripping sensitive headers`);
        for (const te of Object.keys(M))
          s.has(l(te)) && delete M[te];
      }
      return k;
    }
    static reconstructOriginalUrl(O) {
      const A = O.protocol || "https:";
      if (!O.hostname)
        throw new Error("Missing hostname in request options");
      const k = O.hostname, M = O.port ? `:${O.port}` : "", W = O.path || "/";
      return new d.URL(`${A}//${k}${M}${W}`);
    }
    static isCrossOriginRedirect(O, A) {
      if (O.hostname.toLowerCase() !== A.hostname.toLowerCase())
        return !0;
      if (O.protocol === "http:" && // This can be replaced with `!originalUrl.port`, but for the sake of clarity.
      ["80", ""].includes(O.port) && A.protocol === "https:" && // This can be replaced with `!redirectUrl.port`, but for the sake of clarity.
      ["443", ""].includes(A.port))
        return !1;
      if (O.protocol !== A.protocol)
        return !0;
      const k = O.port, M = A.port;
      return k !== M;
    }
    static async retryOnServerError(O, A = 3) {
      for (let k = 0; ; k++)
        try {
          return await O();
        } catch (M) {
          if (k < A && (M instanceof w && M.isServerError() || M.code === "EPIPE")) {
            await new Promise((W) => setTimeout(W, 1e3 * (k + 1)));
            continue;
          }
          throw M;
        }
    }
  }
  ke.HttpExecutor = b;
  function D(C, O) {
    try {
      return new d.URL(C);
    } catch {
      const A = O.hostname, k = O.protocol || "https:", M = O.port ? `:${O.port}` : "", W = `${k}//${A}${M}`;
      return new d.URL(C, W);
    }
  }
  function P(C, O) {
    const A = G(O), k = D(C, O);
    return F(k, A), A;
  }
  function F(C, O) {
    O.protocol = C.protocol, O.hostname = C.hostname, C.port ? O.port = C.port : O.port && delete O.port, O.path = C.pathname + C.search;
  }
  class I extends o.Transform {
    // noinspection JSUnusedGlobalSymbols
    get actual() {
      return this._actual;
    }
    constructor(O, A = "sha512", k = "base64") {
      super(), this.expected = O, this.algorithm = A, this.encoding = k, this._actual = null, this.isValidateOnEnd = !0, this.digester = (0, e.createHash)(A);
    }
    // noinspection JSUnusedGlobalSymbols
    _transform(O, A, k) {
      this.digester.update(O), k(null, O);
    }
    // noinspection JSUnusedGlobalSymbols
    _flush(O) {
      if (this._actual = this.digester.digest(this.encoding), this.isValidateOnEnd)
        try {
          this.validate();
        } catch (A) {
          O(A);
          return;
        }
      O(null);
    }
    validate() {
      if (this._actual == null)
        throw (0, r.newError)("Not finished yet", "ERR_STREAM_NOT_FINISHED");
      if (this._actual !== this.expected)
        throw (0, r.newError)(`${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`, "ERR_CHECKSUM_MISMATCH");
      return null;
    }
  }
  ke.DigestTransform = I;
  function L(C, O, A) {
    return C != null && O != null && C !== O ? (A(new Error(`checksum mismatch: expected ${O} but got ${C} (X-Checksum-Sha2 header)`)), !1) : !0;
  }
  function S(C, O) {
    const A = C.headers[O];
    return A == null ? null : Array.isArray(A) ? A.length === 0 ? null : A[A.length - 1] : A;
  }
  function z(C, O) {
    if (!L(S(O, "X-Checksum-Sha2"), C.options.sha2, C.callback))
      return;
    const A = [];
    if (C.options.onProgress != null) {
      const ie = S(O, "content-length");
      ie != null && A.push(new h.ProgressCallbackTransform(parseInt(ie, 10), C.options.cancellationToken, C.options.onProgress));
    }
    const k = C.options.sha512;
    k != null ? A.push(new I(k, "sha512", k.length === 128 && !k.includes("+") && !k.includes("Z") && !k.includes("=") ? "hex" : "base64")) : C.options.sha2 != null && A.push(new I(C.options.sha2, "sha256", "hex"));
    const M = (0, c.createWriteStream)(C.destination);
    A.push(M);
    let W = O;
    for (const ie of A)
      ie.on("error", (te) => {
        M.close(), C.options.cancellationToken.cancelled || C.callback(te);
      }), W = W.pipe(ie);
    M.on("finish", () => {
      M.close(C.callback);
    });
  }
  function G(C, O, A) {
    A != null && (C.method = A), C.headers = { ...C.headers };
    const k = C.headers;
    return O != null && (k.authorization = O.startsWith("Basic") || O.startsWith("Bearer") ? O : `token ${O}`), k["User-Agent"] == null && (k["User-Agent"] = "electron-builder"), (A == null || A === "GET" || k["Cache-Control"] == null) && (k["Cache-Control"] = "no-cache"), C.protocol == null && process.versions.electron != null && (C.protocol = "https:"), C;
  }
  function $(C) {
    const O = l(C);
    return n.some((A) => O.includes(A)) || a.some((A) => O.endsWith(A));
  }
  function H(C) {
    return `${(0, e.createHash)("sha256").update(C).digest("hex")} (sha256 hash)`;
  }
  function U(C, O) {
    return JSON.stringify(C, (A, k) => $(A) || O != null && O.has(A) ? typeof k == "string" ? H(k) : "<stripped sensitive data>" : k, 2);
  }
  return ke;
}
var ur = {}, Ha;
function Ff() {
  if (Ha) return ur;
  Ha = 1, Object.defineProperty(ur, "__esModule", { value: !0 }), ur.MemoLazy = void 0;
  let e = class {
    constructor(o, d) {
      this.selector = o, this.creator = d, this.selected = void 0, this._value = void 0;
    }
    get hasValue() {
      return this._value !== void 0;
    }
    get value() {
      const o = this.selector();
      if (this._value !== void 0 && i(this.selected, o))
        return this._value;
      this.selected = o;
      const d = this.creator(o);
      return this.value = d, d;
    }
    set value(o) {
      this._value = o;
    }
  };
  ur.MemoLazy = e;
  function i(c, o) {
    if (typeof c == "object" && c !== null && (typeof o == "object" && o !== null)) {
      const r = Object.keys(c), h = Object.keys(o);
      return r.length === h.length && r.every((t) => i(c[t], o[t]));
    }
    return c === o;
  }
  return ur;
}
var Wt = {}, Ga;
function Lf() {
  if (Ga) return Wt;
  Ga = 1, Object.defineProperty(Wt, "__esModule", { value: !0 }), Wt.githubUrl = e, Wt.githubTagPrefix = i, Wt.getS3LikeProviderBaseUrl = c;
  function e(r, h = "github.com") {
    return `${r.protocol || "https"}://${r.host || h}`;
  }
  function i(r) {
    var h;
    return r.tagNamePrefix ? r.tagNamePrefix : !((h = r.vPrefixedTagName) !== null && h !== void 0) || h ? "v" : "";
  }
  function c(r) {
    const h = r.provider;
    if (h === "s3")
      return o(r);
    if (h === "spaces")
      return f(r);
    throw new Error(`Not supported provider: ${h}`);
  }
  function o(r) {
    let h;
    if (r.accelerate == !0)
      h = `https://${r.bucket}.s3-accelerate.amazonaws.com`;
    else if (r.endpoint != null)
      h = `${r.endpoint}/${r.bucket}`;
    else if (r.bucket.includes(".")) {
      if (r.region == null)
        throw new Error(`Bucket name "${r.bucket}" includes a dot, but S3 region is missing`);
      r.region === "us-east-1" ? h = `https://s3.amazonaws.com/${r.bucket}` : h = `https://s3-${r.region}.amazonaws.com/${r.bucket}`;
    } else r.region === "cn-north-1" ? h = `https://${r.bucket}.s3.${r.region}.amazonaws.com.cn` : h = `https://${r.bucket}.s3.amazonaws.com`;
    return d(h, r.path);
  }
  function d(r, h) {
    return h != null && h.length > 0 && (h.startsWith("/") || (r += "/"), r += h), r;
  }
  function f(r) {
    if (r.name == null)
      throw new Error("name is missing");
    if (r.region == null)
      throw new Error("region is missing");
    return d(`https://${r.name}.${r.region}.digitaloceanspaces.com`, r.path);
  }
  return Wt;
}
var Kr = {}, Wa;
function Uf() {
  if (Wa) return Kr;
  Wa = 1, Object.defineProperty(Kr, "__esModule", { value: !0 }), Kr.retry = i;
  const e = Rs();
  async function i(c, o) {
    var d;
    const { retries: f, interval: r, backoff: h = 0, attempt: t = 0, shouldRetry: l, cancellationToken: s = new e.CancellationToken() } = o;
    try {
      return await c();
    } catch (n) {
      if (await Promise.resolve((d = l?.(n)) !== null && d !== void 0 ? d : !0) && f > 0 && !s.cancelled)
        return await new Promise((a) => setTimeout(a, r + h * t)), await i(c, { ...o, retries: f - 1, attempt: t + 1 });
      throw n;
    }
  }
  return Kr;
}
var Qr = {}, Va;
function xf() {
  if (Va) return Qr;
  Va = 1, Object.defineProperty(Qr, "__esModule", { value: !0 }), Qr.parseDn = e;
  function e(i) {
    let c = !1, o = null, d = "", f = 0;
    i = i.trim();
    const r = /* @__PURE__ */ new Map();
    for (let h = 0; h <= i.length; h++) {
      if (h === i.length) {
        o !== null && r.set(o, d);
        break;
      }
      const t = i[h];
      if (c) {
        if (t === '"') {
          c = !1;
          continue;
        }
      } else {
        if (t === '"') {
          c = !0;
          continue;
        }
        if (t === "\\") {
          h++;
          const l = parseInt(i.slice(h, h + 2), 16);
          Number.isNaN(l) ? d += i[h] : (h++, d += String.fromCharCode(l));
          continue;
        }
        if (o === null && t === "=") {
          o = d, d = "";
          continue;
        }
        if (t === "," || t === ";" || t === "+") {
          o !== null && r.set(o, d), o = null, d = "";
          continue;
        }
      }
      if (t === " " && !c) {
        if (d.length === 0)
          continue;
        if (h > f) {
          let l = h;
          for (; i[l] === " "; )
            l++;
          f = l;
        }
        if (f >= i.length || i[f] === "," || i[f] === ";" || o === null && i[f] === "=" || o !== null && i[f] === "+") {
          h = f - 1;
          continue;
        }
      }
      d += t;
    }
    return r;
  }
  return Qr;
}
var kt = {}, za;
function kf() {
  if (za) return kt;
  za = 1, Object.defineProperty(kt, "__esModule", { value: !0 }), kt.nil = kt.UUID = void 0;
  const e = Lr, i = cn(), c = "options.name must be either a string or a Buffer", o = (0, e.randomBytes)(16);
  o[0] = o[0] | 1;
  const d = {}, f = [];
  for (let n = 0; n < 256; n++) {
    const a = (n + 256).toString(16).substr(1);
    d[a] = n, f[n] = a;
  }
  class r {
    constructor(a) {
      this.ascii = null, this.binary = null;
      const p = r.check(a);
      if (!p)
        throw new Error("not a UUID");
      this.version = p.version, p.format === "ascii" ? this.ascii = a : this.binary = a;
    }
    static v5(a, p) {
      return l(a, "sha1", 80, p);
    }
    toString() {
      return this.ascii == null && (this.ascii = s(this.binary)), this.ascii;
    }
    inspect() {
      return `UUID v${this.version} ${this.toString()}`;
    }
    static check(a, p = 0) {
      if (typeof a == "string")
        return a = a.toLowerCase(), /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-([a-f0-9]{12})$/.test(a) ? a === "00000000-0000-0000-0000-000000000000" ? { version: void 0, variant: "nil", format: "ascii" } : {
          version: (d[a[14] + a[15]] & 240) >> 4,
          variant: h((d[a[19] + a[20]] & 224) >> 5),
          format: "ascii"
        } : !1;
      if (Buffer.isBuffer(a)) {
        if (a.length < p + 16)
          return !1;
        let g = 0;
        for (; g < 16 && a[p + g] === 0; g++)
          ;
        return g === 16 ? { version: void 0, variant: "nil", format: "binary" } : {
          version: (a[p + 6] & 240) >> 4,
          variant: h((a[p + 8] & 224) >> 5),
          format: "binary"
        };
      }
      throw (0, i.newError)("Unknown type of uuid", "ERR_UNKNOWN_UUID_TYPE");
    }
    // read stringified uuid into a Buffer
    static parse(a) {
      const p = Buffer.allocUnsafe(16);
      let g = 0;
      for (let v = 0; v < 16; v++)
        p[v] = d[a[g++] + a[g++]], (v === 3 || v === 5 || v === 7 || v === 9) && (g += 1);
      return p;
    }
  }
  kt.UUID = r, r.OID = r.parse("6ba7b812-9dad-11d1-80b4-00c04fd430c8");
  function h(n) {
    switch (n) {
      case 0:
      case 1:
      case 3:
        return "ncs";
      case 4:
      case 5:
        return "rfc4122";
      case 6:
        return "microsoft";
      default:
        return "future";
    }
  }
  var t;
  (function(n) {
    n[n.ASCII = 0] = "ASCII", n[n.BINARY = 1] = "BINARY", n[n.OBJECT = 2] = "OBJECT";
  })(t || (t = {}));
  function l(n, a, p, g, v = t.ASCII) {
    const m = (0, e.createHash)(a);
    if (typeof n != "string" && !Buffer.isBuffer(n))
      throw (0, i.newError)(c, "ERR_INVALID_UUID_NAME");
    m.update(g), m.update(n);
    const R = m.digest();
    let b;
    switch (v) {
      case t.BINARY:
        R[6] = R[6] & 15 | p, R[8] = R[8] & 63 | 128, b = R;
        break;
      case t.OBJECT:
        R[6] = R[6] & 15 | p, R[8] = R[8] & 63 | 128, b = new r(R);
        break;
      default:
        b = f[R[0]] + f[R[1]] + f[R[2]] + f[R[3]] + "-" + f[R[4]] + f[R[5]] + "-" + f[R[6] & 15 | p] + f[R[7]] + "-" + f[R[8] & 63 | 128] + f[R[9]] + "-" + f[R[10]] + f[R[11]] + f[R[12]] + f[R[13]] + f[R[14]] + f[R[15]];
        break;
    }
    return b;
  }
  function s(n) {
    return f[n[0]] + f[n[1]] + f[n[2]] + f[n[3]] + "-" + f[n[4]] + f[n[5]] + "-" + f[n[6]] + f[n[7]] + "-" + f[n[8]] + f[n[9]] + "-" + f[n[10]] + f[n[11]] + f[n[12]] + f[n[13]] + f[n[14]] + f[n[15]];
  }
  return kt.nil = new r("00000000-0000-0000-0000-000000000000"), kt;
}
var Vt = {}, ri = {}, Ya;
function $f() {
  return Ya || (Ya = 1, (function(e) {
    (function(i) {
      i.parser = function(E, y) {
        return new o(E, y);
      }, i.SAXParser = o, i.SAXStream = s, i.createStream = l, i.MAX_BUFFER_LENGTH = 64 * 1024;
      var c = [
        "comment",
        "sgmlDecl",
        "textNode",
        "tagName",
        "doctype",
        "procInstName",
        "procInstBody",
        "entity",
        "attribName",
        "attribValue",
        "cdata",
        "script"
      ];
      i.EVENTS = [
        "text",
        "processinginstruction",
        "sgmldeclaration",
        "doctype",
        "comment",
        "opentagstart",
        "attribute",
        "opentag",
        "closetag",
        "opencdata",
        "cdata",
        "closecdata",
        "error",
        "end",
        "ready",
        "script",
        "opennamespace",
        "closenamespace"
      ];
      function o(E, y) {
        if (!(this instanceof o))
          return new o(E, y);
        var B = this;
        f(B), B.q = B.c = "", B.bufferCheckPosition = i.MAX_BUFFER_LENGTH, B.opt = y || {}, B.opt.lowercase = B.opt.lowercase || B.opt.lowercasetags, B.looseCase = B.opt.lowercase ? "toLowerCase" : "toUpperCase", B.tags = [], B.closed = B.closedRoot = B.sawRoot = !1, B.tag = B.error = null, B.strict = !!E, B.noscript = !!(E || B.opt.noscript), B.state = S.BEGIN, B.strictEntities = B.opt.strictEntities, B.ENTITIES = B.strictEntities ? Object.create(i.XML_ENTITIES) : Object.create(i.ENTITIES), B.attribList = [], B.opt.xmlns && (B.ns = Object.create(v)), B.opt.unquotedAttributeValues === void 0 && (B.opt.unquotedAttributeValues = !E), B.trackPosition = B.opt.position !== !1, B.trackPosition && (B.position = B.line = B.column = 0), G(B, "onready");
      }
      Object.create || (Object.create = function(E) {
        function y() {
        }
        y.prototype = E;
        var B = new y();
        return B;
      }), Object.keys || (Object.keys = function(E) {
        var y = [];
        for (var B in E) E.hasOwnProperty(B) && y.push(B);
        return y;
      });
      function d(E) {
        for (var y = Math.max(i.MAX_BUFFER_LENGTH, 10), B = 0, N = 0, fe = c.length; N < fe; N++) {
          var ge = E[c[N]].length;
          if (ge > y)
            switch (c[N]) {
              case "textNode":
                H(E);
                break;
              case "cdata":
                $(E, "oncdata", E.cdata), E.cdata = "";
                break;
              case "script":
                $(E, "onscript", E.script), E.script = "";
                break;
              default:
                C(E, "Max buffer length exceeded: " + c[N]);
            }
          B = Math.max(B, ge);
        }
        var ye = i.MAX_BUFFER_LENGTH - B;
        E.bufferCheckPosition = ye + E.position;
      }
      function f(E) {
        for (var y = 0, B = c.length; y < B; y++)
          E[c[y]] = "";
      }
      function r(E) {
        H(E), E.cdata !== "" && ($(E, "oncdata", E.cdata), E.cdata = ""), E.script !== "" && ($(E, "onscript", E.script), E.script = "");
      }
      o.prototype = {
        end: function() {
          O(this);
        },
        write: pe,
        resume: function() {
          return this.error = null, this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          r(this);
        }
      };
      var h;
      try {
        h = require("stream").Stream;
      } catch {
        h = function() {
        };
      }
      h || (h = function() {
      });
      var t = i.EVENTS.filter(function(E) {
        return E !== "error" && E !== "end";
      });
      function l(E, y) {
        return new s(E, y);
      }
      function s(E, y) {
        if (!(this instanceof s))
          return new s(E, y);
        h.apply(this), this._parser = new o(E, y), this.writable = !0, this.readable = !0;
        var B = this;
        this._parser.onend = function() {
          B.emit("end");
        }, this._parser.onerror = function(N) {
          B.emit("error", N), B._parser.error = null;
        }, this._decoder = null, t.forEach(function(N) {
          Object.defineProperty(B, "on" + N, {
            get: function() {
              return B._parser["on" + N];
            },
            set: function(fe) {
              if (!fe)
                return B.removeAllListeners(N), B._parser["on" + N] = fe, fe;
              B.on(N, fe);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      s.prototype = Object.create(h.prototype, {
        constructor: {
          value: s
        }
      }), s.prototype.write = function(E) {
        return typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(E) && (this._decoder || (this._decoder = new TextDecoder("utf8")), E = this._decoder.decode(E, { stream: !0 })), this._parser.write(E.toString()), this.emit("data", E), !0;
      }, s.prototype.end = function(E) {
        if (E && E.length && this.write(E), this._decoder) {
          var y = this._decoder.decode();
          y && (this._parser.write(y), this.emit("data", y));
        }
        return this._parser.end(), !0;
      }, s.prototype.on = function(E, y) {
        var B = this;
        return !B._parser["on" + E] && t.indexOf(E) !== -1 && (B._parser["on" + E] = function() {
          var N = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          N.splice(0, 0, E), B.emit.apply(B, N);
        }), h.prototype.on.call(B, E, y);
      };
      var n = "[CDATA[", a = "DOCTYPE", p = "http://www.w3.org/XML/1998/namespace", g = "http://www.w3.org/2000/xmlns/", v = { xml: p, xmlns: g }, m = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, w = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, R = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, b = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function D(E) {
        return E === " " || E === `
` || E === "\r" || E === "	";
      }
      function P(E) {
        return E === '"' || E === "'";
      }
      function F(E) {
        return E === ">" || D(E);
      }
      function I(E, y) {
        return E.test(y);
      }
      function L(E, y) {
        return !I(E, y);
      }
      var S = 0;
      i.STATE = {
        BEGIN: S++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: S++,
        // leading whitespace
        TEXT: S++,
        // general stuff
        TEXT_ENTITY: S++,
        // &amp and such.
        OPEN_WAKA: S++,
        // <
        SGML_DECL: S++,
        // <!BLARG
        SGML_DECL_QUOTED: S++,
        // <!BLARG foo "bar
        DOCTYPE: S++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: S++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: S++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: S++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: S++,
        // <!-
        COMMENT: S++,
        // <!--
        COMMENT_ENDING: S++,
        // <!-- blah -
        COMMENT_ENDED: S++,
        // <!-- blah --
        CDATA: S++,
        // <![CDATA[ something
        CDATA_ENDING: S++,
        // ]
        CDATA_ENDING_2: S++,
        // ]]
        PROC_INST: S++,
        // <?hi
        PROC_INST_BODY: S++,
        // <?hi there
        PROC_INST_ENDING: S++,
        // <?hi "there" ?
        OPEN_TAG: S++,
        // <strong
        OPEN_TAG_SLASH: S++,
        // <strong /
        ATTRIB: S++,
        // <a
        ATTRIB_NAME: S++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: S++,
        // <a foo _
        ATTRIB_VALUE: S++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: S++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: S++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: S++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: S++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: S++,
        // <foo bar=&quot
        CLOSE_TAG: S++,
        // </a
        CLOSE_TAG_SAW_WHITE: S++,
        // </a   >
        SCRIPT: S++,
        // <script> ...
        SCRIPT_ENDING: S++
        // <script> ... <
      }, i.XML_ENTITIES = {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: '"',
        apos: "'"
      }, i.ENTITIES = {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: '"',
        apos: "'",
        AElig: 198,
        Aacute: 193,
        Acirc: 194,
        Agrave: 192,
        Aring: 197,
        Atilde: 195,
        Auml: 196,
        Ccedil: 199,
        ETH: 208,
        Eacute: 201,
        Ecirc: 202,
        Egrave: 200,
        Euml: 203,
        Iacute: 205,
        Icirc: 206,
        Igrave: 204,
        Iuml: 207,
        Ntilde: 209,
        Oacute: 211,
        Ocirc: 212,
        Ograve: 210,
        Oslash: 216,
        Otilde: 213,
        Ouml: 214,
        THORN: 222,
        Uacute: 218,
        Ucirc: 219,
        Ugrave: 217,
        Uuml: 220,
        Yacute: 221,
        aacute: 225,
        acirc: 226,
        aelig: 230,
        agrave: 224,
        aring: 229,
        atilde: 227,
        auml: 228,
        ccedil: 231,
        eacute: 233,
        ecirc: 234,
        egrave: 232,
        eth: 240,
        euml: 235,
        iacute: 237,
        icirc: 238,
        igrave: 236,
        iuml: 239,
        ntilde: 241,
        oacute: 243,
        ocirc: 244,
        ograve: 242,
        oslash: 248,
        otilde: 245,
        ouml: 246,
        szlig: 223,
        thorn: 254,
        uacute: 250,
        ucirc: 251,
        ugrave: 249,
        uuml: 252,
        yacute: 253,
        yuml: 255,
        copy: 169,
        reg: 174,
        nbsp: 160,
        iexcl: 161,
        cent: 162,
        pound: 163,
        curren: 164,
        yen: 165,
        brvbar: 166,
        sect: 167,
        uml: 168,
        ordf: 170,
        laquo: 171,
        not: 172,
        shy: 173,
        macr: 175,
        deg: 176,
        plusmn: 177,
        sup1: 185,
        sup2: 178,
        sup3: 179,
        acute: 180,
        micro: 181,
        para: 182,
        middot: 183,
        cedil: 184,
        ordm: 186,
        raquo: 187,
        frac14: 188,
        frac12: 189,
        frac34: 190,
        iquest: 191,
        times: 215,
        divide: 247,
        OElig: 338,
        oelig: 339,
        Scaron: 352,
        scaron: 353,
        Yuml: 376,
        fnof: 402,
        circ: 710,
        tilde: 732,
        Alpha: 913,
        Beta: 914,
        Gamma: 915,
        Delta: 916,
        Epsilon: 917,
        Zeta: 918,
        Eta: 919,
        Theta: 920,
        Iota: 921,
        Kappa: 922,
        Lambda: 923,
        Mu: 924,
        Nu: 925,
        Xi: 926,
        Omicron: 927,
        Pi: 928,
        Rho: 929,
        Sigma: 931,
        Tau: 932,
        Upsilon: 933,
        Phi: 934,
        Chi: 935,
        Psi: 936,
        Omega: 937,
        alpha: 945,
        beta: 946,
        gamma: 947,
        delta: 948,
        epsilon: 949,
        zeta: 950,
        eta: 951,
        theta: 952,
        iota: 953,
        kappa: 954,
        lambda: 955,
        mu: 956,
        nu: 957,
        xi: 958,
        omicron: 959,
        pi: 960,
        rho: 961,
        sigmaf: 962,
        sigma: 963,
        tau: 964,
        upsilon: 965,
        phi: 966,
        chi: 967,
        psi: 968,
        omega: 969,
        thetasym: 977,
        upsih: 978,
        piv: 982,
        ensp: 8194,
        emsp: 8195,
        thinsp: 8201,
        zwnj: 8204,
        zwj: 8205,
        lrm: 8206,
        rlm: 8207,
        ndash: 8211,
        mdash: 8212,
        lsquo: 8216,
        rsquo: 8217,
        sbquo: 8218,
        ldquo: 8220,
        rdquo: 8221,
        bdquo: 8222,
        dagger: 8224,
        Dagger: 8225,
        bull: 8226,
        hellip: 8230,
        permil: 8240,
        prime: 8242,
        Prime: 8243,
        lsaquo: 8249,
        rsaquo: 8250,
        oline: 8254,
        frasl: 8260,
        euro: 8364,
        image: 8465,
        weierp: 8472,
        real: 8476,
        trade: 8482,
        alefsym: 8501,
        larr: 8592,
        uarr: 8593,
        rarr: 8594,
        darr: 8595,
        harr: 8596,
        crarr: 8629,
        lArr: 8656,
        uArr: 8657,
        rArr: 8658,
        dArr: 8659,
        hArr: 8660,
        forall: 8704,
        part: 8706,
        exist: 8707,
        empty: 8709,
        nabla: 8711,
        isin: 8712,
        notin: 8713,
        ni: 8715,
        prod: 8719,
        sum: 8721,
        minus: 8722,
        lowast: 8727,
        radic: 8730,
        prop: 8733,
        infin: 8734,
        ang: 8736,
        and: 8743,
        or: 8744,
        cap: 8745,
        cup: 8746,
        int: 8747,
        there4: 8756,
        sim: 8764,
        cong: 8773,
        asymp: 8776,
        ne: 8800,
        equiv: 8801,
        le: 8804,
        ge: 8805,
        sub: 8834,
        sup: 8835,
        nsub: 8836,
        sube: 8838,
        supe: 8839,
        oplus: 8853,
        otimes: 8855,
        perp: 8869,
        sdot: 8901,
        lceil: 8968,
        rceil: 8969,
        lfloor: 8970,
        rfloor: 8971,
        lang: 9001,
        rang: 9002,
        loz: 9674,
        spades: 9824,
        clubs: 9827,
        hearts: 9829,
        diams: 9830
      }, Object.keys(i.ENTITIES).forEach(function(E) {
        var y = i.ENTITIES[E], B = typeof y == "number" ? String.fromCharCode(y) : y;
        i.ENTITIES[E] = B;
      });
      for (var z in i.STATE)
        i.STATE[i.STATE[z]] = z;
      S = i.STATE;
      function G(E, y, B) {
        E[y] && E[y](B);
      }
      function $(E, y, B) {
        E.textNode && H(E), G(E, y, B);
      }
      function H(E) {
        E.textNode = U(E.opt, E.textNode), E.textNode && G(E, "ontext", E.textNode), E.textNode = "";
      }
      function U(E, y) {
        return E.trim && (y = y.trim()), E.normalize && (y = y.replace(/\s+/g, " ")), y;
      }
      function C(E, y) {
        return H(E), E.trackPosition && (y += `
Line: ` + E.line + `
Column: ` + E.column + `
Char: ` + E.c), y = new Error(y), E.error = y, G(E, "onerror", y), E;
      }
      function O(E) {
        return E.sawRoot && !E.closedRoot && A(E, "Unclosed root tag"), E.state !== S.BEGIN && E.state !== S.BEGIN_WHITESPACE && E.state !== S.TEXT && C(E, "Unexpected end"), H(E), E.c = "", E.closed = !0, G(E, "onend"), o.call(E, E.strict, E.opt), E;
      }
      function A(E, y) {
        if (typeof E != "object" || !(E instanceof o))
          throw new Error("bad call to strictFail");
        E.strict && C(E, y);
      }
      function k(E) {
        E.strict || (E.tagName = E.tagName[E.looseCase]());
        var y = E.tags[E.tags.length - 1] || E, B = E.tag = { name: E.tagName, attributes: {} };
        E.opt.xmlns && (B.ns = y.ns), E.attribList.length = 0, $(E, "onopentagstart", B);
      }
      function M(E, y) {
        var B = E.indexOf(":"), N = B < 0 ? ["", E] : E.split(":"), fe = N[0], ge = N[1];
        return y && E === "xmlns" && (fe = "xmlns", ge = ""), { prefix: fe, local: ge };
      }
      function W(E) {
        if (E.strict || (E.attribName = E.attribName[E.looseCase]()), E.attribList.indexOf(E.attribName) !== -1 || E.tag.attributes.hasOwnProperty(E.attribName)) {
          E.attribName = E.attribValue = "";
          return;
        }
        if (E.opt.xmlns) {
          var y = M(E.attribName, !0), B = y.prefix, N = y.local;
          if (B === "xmlns")
            if (N === "xml" && E.attribValue !== p)
              A(
                E,
                "xml: prefix must be bound to " + p + `
Actual: ` + E.attribValue
              );
            else if (N === "xmlns" && E.attribValue !== g)
              A(
                E,
                "xmlns: prefix must be bound to " + g + `
Actual: ` + E.attribValue
              );
            else {
              var fe = E.tag, ge = E.tags[E.tags.length - 1] || E;
              fe.ns === ge.ns && (fe.ns = Object.create(ge.ns)), fe.ns[N] = E.attribValue;
            }
          E.attribList.push([E.attribName, E.attribValue]);
        } else
          E.tag.attributes[E.attribName] = E.attribValue, $(E, "onattribute", {
            name: E.attribName,
            value: E.attribValue
          });
        E.attribName = E.attribValue = "";
      }
      function ie(E, y) {
        if (E.opt.xmlns) {
          var B = E.tag, N = M(E.tagName);
          B.prefix = N.prefix, B.local = N.local, B.uri = B.ns[N.prefix] || "", B.prefix && !B.uri && (A(
            E,
            "Unbound namespace prefix: " + JSON.stringify(E.tagName)
          ), B.uri = N.prefix);
          var fe = E.tags[E.tags.length - 1] || E;
          B.ns && fe.ns !== B.ns && Object.keys(B.ns).forEach(function(u) {
            $(E, "onopennamespace", {
              prefix: u,
              uri: B.ns[u]
            });
          });
          for (var ge = 0, ye = E.attribList.length; ge < ye; ge++) {
            var Se = E.attribList[ge], we = Se[0], ze = Se[1], Te = M(we, !0), He = Te.prefix, Et = Te.local, pt = He === "" ? "" : B.ns[He] || "", ut = {
              name: we,
              value: ze,
              prefix: He,
              local: Et,
              uri: pt
            };
            He && He !== "xmlns" && !pt && (A(
              E,
              "Unbound namespace prefix: " + JSON.stringify(He)
            ), ut.uri = He), E.tag.attributes[we] = ut, $(E, "onattribute", ut);
          }
          E.attribList.length = 0;
        }
        E.tag.isSelfClosing = !!y, E.sawRoot = !0, E.tags.push(E.tag), $(E, "onopentag", E.tag), y || (!E.noscript && E.tagName.toLowerCase() === "script" ? E.state = S.SCRIPT : E.state = S.TEXT, E.tag = null, E.tagName = ""), E.attribName = E.attribValue = "", E.attribList.length = 0;
      }
      function te(E) {
        if (!E.tagName) {
          A(E, "Weird empty close tag."), E.textNode += "</>", E.state = S.TEXT;
          return;
        }
        if (E.script) {
          if (E.tagName !== "script") {
            E.script += "</" + E.tagName + ">", E.tagName = "", E.state = S.SCRIPT;
            return;
          }
          $(E, "onscript", E.script), E.script = "";
        }
        var y = E.tags.length, B = E.tagName;
        E.strict || (B = B[E.looseCase]());
        for (var N = B; y--; ) {
          var fe = E.tags[y];
          if (fe.name !== N)
            A(E, "Unexpected close tag");
          else
            break;
        }
        if (y < 0) {
          A(E, "Unmatched closing tag: " + E.tagName), E.textNode += "</" + E.tagName + ">", E.state = S.TEXT;
          return;
        }
        E.tagName = B;
        for (var ge = E.tags.length; ge-- > y; ) {
          var ye = E.tag = E.tags.pop();
          E.tagName = E.tag.name, $(E, "onclosetag", E.tagName);
          var Se = {};
          for (var we in ye.ns)
            Se[we] = ye.ns[we];
          var ze = E.tags[E.tags.length - 1] || E;
          E.opt.xmlns && ye.ns !== ze.ns && Object.keys(ye.ns).forEach(function(Te) {
            var He = ye.ns[Te];
            $(E, "onclosenamespace", { prefix: Te, uri: He });
          });
        }
        y === 0 && (E.closedRoot = !0), E.tagName = E.attribValue = E.attribName = "", E.attribList.length = 0, E.state = S.TEXT;
      }
      function de(E) {
        var y = E.entity, B = y.toLowerCase(), N, fe = "";
        return E.ENTITIES[y] ? E.ENTITIES[y] : E.ENTITIES[B] ? E.ENTITIES[B] : (y = B, y.charAt(0) === "#" && (y.charAt(1) === "x" ? (y = y.slice(2), N = parseInt(y, 16), fe = N.toString(16)) : (y = y.slice(1), N = parseInt(y, 10), fe = N.toString(10))), y = y.replace(/^0+/, ""), isNaN(N) || fe.toLowerCase() !== y || N < 0 || N > 1114111 ? (A(E, "Invalid character entity"), "&" + E.entity + ";") : String.fromCodePoint(N));
      }
      function he(E, y) {
        y === "<" ? (E.state = S.OPEN_WAKA, E.startTagPosition = E.position) : D(y) || (A(E, "Non-whitespace before first tag."), E.textNode = y, E.state = S.TEXT);
      }
      function Y(E, y) {
        var B = "";
        return y < E.length && (B = E.charAt(y)), B;
      }
      function pe(E) {
        var y = this;
        if (this.error)
          throw this.error;
        if (y.closed)
          return C(
            y,
            "Cannot write after close. Assign an onready handler."
          );
        if (E === null)
          return O(y);
        typeof E == "object" && (E = E.toString());
        for (var B = 0, N = ""; N = Y(E, B++), y.c = N, !!N; )
          switch (y.trackPosition && (y.position++, N === `
` ? (y.line++, y.column = 0) : y.column++), y.state) {
            case S.BEGIN:
              if (y.state = S.BEGIN_WHITESPACE, N === "\uFEFF")
                continue;
              he(y, N);
              continue;
            case S.BEGIN_WHITESPACE:
              he(y, N);
              continue;
            case S.TEXT:
              if (y.sawRoot && !y.closedRoot) {
                for (var ge = B - 1; N && N !== "<" && N !== "&"; )
                  N = Y(E, B++), N && y.trackPosition && (y.position++, N === `
` ? (y.line++, y.column = 0) : y.column++);
                y.textNode += E.substring(ge, B - 1);
              }
              N === "<" && !(y.sawRoot && y.closedRoot && !y.strict) ? (y.state = S.OPEN_WAKA, y.startTagPosition = y.position) : (!D(N) && (!y.sawRoot || y.closedRoot) && A(y, "Text data outside of root node."), N === "&" ? y.state = S.TEXT_ENTITY : y.textNode += N);
              continue;
            case S.SCRIPT:
              N === "<" ? y.state = S.SCRIPT_ENDING : y.script += N;
              continue;
            case S.SCRIPT_ENDING:
              N === "/" ? y.state = S.CLOSE_TAG : (y.script += "<" + N, y.state = S.SCRIPT);
              continue;
            case S.OPEN_WAKA:
              if (N === "!")
                y.state = S.SGML_DECL, y.sgmlDecl = "";
              else if (!D(N)) if (I(m, N))
                y.state = S.OPEN_TAG, y.tagName = N;
              else if (N === "/")
                y.state = S.CLOSE_TAG, y.tagName = "";
              else if (N === "?")
                y.state = S.PROC_INST, y.procInstName = y.procInstBody = "";
              else {
                if (A(y, "Unencoded <"), y.startTagPosition + 1 < y.position) {
                  var fe = y.position - y.startTagPosition;
                  N = new Array(fe).join(" ") + N;
                }
                y.textNode += "<" + N, y.state = S.TEXT;
              }
              continue;
            case S.SGML_DECL:
              if (y.sgmlDecl + N === "--") {
                y.state = S.COMMENT, y.comment = "", y.sgmlDecl = "";
                continue;
              }
              y.doctype && y.doctype !== !0 && y.sgmlDecl ? (y.state = S.DOCTYPE_DTD, y.doctype += "<!" + y.sgmlDecl + N, y.sgmlDecl = "") : (y.sgmlDecl + N).toUpperCase() === n ? ($(y, "onopencdata"), y.state = S.CDATA, y.sgmlDecl = "", y.cdata = "") : (y.sgmlDecl + N).toUpperCase() === a ? (y.state = S.DOCTYPE, (y.doctype || y.sawRoot) && A(
                y,
                "Inappropriately located doctype declaration"
              ), y.doctype = "", y.sgmlDecl = "") : N === ">" ? ($(y, "onsgmldeclaration", y.sgmlDecl), y.sgmlDecl = "", y.state = S.TEXT) : (P(N) && (y.state = S.SGML_DECL_QUOTED), y.sgmlDecl += N);
              continue;
            case S.SGML_DECL_QUOTED:
              N === y.q && (y.state = S.SGML_DECL, y.q = ""), y.sgmlDecl += N;
              continue;
            case S.DOCTYPE:
              N === ">" ? (y.state = S.TEXT, $(y, "ondoctype", y.doctype), y.doctype = !0) : (y.doctype += N, N === "[" ? y.state = S.DOCTYPE_DTD : P(N) && (y.state = S.DOCTYPE_QUOTED, y.q = N));
              continue;
            case S.DOCTYPE_QUOTED:
              y.doctype += N, N === y.q && (y.q = "", y.state = S.DOCTYPE);
              continue;
            case S.DOCTYPE_DTD:
              N === "]" ? (y.doctype += N, y.state = S.DOCTYPE) : N === "<" ? (y.state = S.OPEN_WAKA, y.startTagPosition = y.position) : P(N) ? (y.doctype += N, y.state = S.DOCTYPE_DTD_QUOTED, y.q = N) : y.doctype += N;
              continue;
            case S.DOCTYPE_DTD_QUOTED:
              y.doctype += N, N === y.q && (y.state = S.DOCTYPE_DTD, y.q = "");
              continue;
            case S.COMMENT:
              N === "-" ? y.state = S.COMMENT_ENDING : y.comment += N;
              continue;
            case S.COMMENT_ENDING:
              N === "-" ? (y.state = S.COMMENT_ENDED, y.comment = U(y.opt, y.comment), y.comment && $(y, "oncomment", y.comment), y.comment = "") : (y.comment += "-" + N, y.state = S.COMMENT);
              continue;
            case S.COMMENT_ENDED:
              N !== ">" ? (A(y, "Malformed comment"), y.comment += "--" + N, y.state = S.COMMENT) : y.doctype && y.doctype !== !0 ? y.state = S.DOCTYPE_DTD : y.state = S.TEXT;
              continue;
            case S.CDATA:
              for (var ge = B - 1; N && N !== "]"; )
                N = Y(E, B++), N && y.trackPosition && (y.position++, N === `
` ? (y.line++, y.column = 0) : y.column++);
              y.cdata += E.substring(ge, B - 1), N === "]" && (y.state = S.CDATA_ENDING);
              continue;
            case S.CDATA_ENDING:
              N === "]" ? y.state = S.CDATA_ENDING_2 : (y.cdata += "]" + N, y.state = S.CDATA);
              continue;
            case S.CDATA_ENDING_2:
              N === ">" ? (y.cdata && $(y, "oncdata", y.cdata), $(y, "onclosecdata"), y.cdata = "", y.state = S.TEXT) : N === "]" ? y.cdata += "]" : (y.cdata += "]]" + N, y.state = S.CDATA);
              continue;
            case S.PROC_INST:
              N === "?" ? y.state = S.PROC_INST_ENDING : D(N) ? y.state = S.PROC_INST_BODY : y.procInstName += N;
              continue;
            case S.PROC_INST_BODY:
              if (!y.procInstBody && D(N))
                continue;
              N === "?" ? y.state = S.PROC_INST_ENDING : y.procInstBody += N;
              continue;
            case S.PROC_INST_ENDING:
              N === ">" ? ($(y, "onprocessinginstruction", {
                name: y.procInstName,
                body: y.procInstBody
              }), y.procInstName = y.procInstBody = "", y.state = S.TEXT) : (y.procInstBody += "?" + N, y.state = S.PROC_INST_BODY);
              continue;
            case S.OPEN_TAG:
              I(w, N) ? y.tagName += N : (k(y), N === ">" ? ie(y) : N === "/" ? y.state = S.OPEN_TAG_SLASH : (D(N) || A(y, "Invalid character in tag name"), y.state = S.ATTRIB));
              continue;
            case S.OPEN_TAG_SLASH:
              N === ">" ? (ie(y, !0), te(y)) : (A(
                y,
                "Forward-slash in opening tag not followed by >"
              ), y.state = S.ATTRIB);
              continue;
            case S.ATTRIB:
              if (D(N))
                continue;
              N === ">" ? ie(y) : N === "/" ? y.state = S.OPEN_TAG_SLASH : I(m, N) ? (y.attribName = N, y.attribValue = "", y.state = S.ATTRIB_NAME) : A(y, "Invalid attribute name");
              continue;
            case S.ATTRIB_NAME:
              N === "=" ? y.state = S.ATTRIB_VALUE : N === ">" ? (A(y, "Attribute without value"), y.attribValue = y.attribName, W(y), ie(y)) : D(N) ? y.state = S.ATTRIB_NAME_SAW_WHITE : I(w, N) ? y.attribName += N : A(y, "Invalid attribute name");
              continue;
            case S.ATTRIB_NAME_SAW_WHITE:
              if (N === "=")
                y.state = S.ATTRIB_VALUE;
              else {
                if (D(N))
                  continue;
                A(y, "Attribute without value"), y.tag.attributes[y.attribName] = "", y.attribValue = "", $(y, "onattribute", {
                  name: y.attribName,
                  value: ""
                }), y.attribName = "", N === ">" ? ie(y) : I(m, N) ? (y.attribName = N, y.state = S.ATTRIB_NAME) : (A(y, "Invalid attribute name"), y.state = S.ATTRIB);
              }
              continue;
            case S.ATTRIB_VALUE:
              if (D(N))
                continue;
              P(N) ? (y.q = N, y.state = S.ATTRIB_VALUE_QUOTED) : (y.opt.unquotedAttributeValues || C(y, "Unquoted attribute value"), y.state = S.ATTRIB_VALUE_UNQUOTED, y.attribValue = N);
              continue;
            case S.ATTRIB_VALUE_QUOTED:
              if (N !== y.q) {
                N === "&" ? y.state = S.ATTRIB_VALUE_ENTITY_Q : y.attribValue += N;
                continue;
              }
              W(y), y.q = "", y.state = S.ATTRIB_VALUE_CLOSED;
              continue;
            case S.ATTRIB_VALUE_CLOSED:
              D(N) ? y.state = S.ATTRIB : N === ">" ? ie(y) : N === "/" ? y.state = S.OPEN_TAG_SLASH : I(m, N) ? (A(y, "No whitespace between attributes"), y.attribName = N, y.attribValue = "", y.state = S.ATTRIB_NAME) : A(y, "Invalid attribute name");
              continue;
            case S.ATTRIB_VALUE_UNQUOTED:
              if (!F(N)) {
                N === "&" ? y.state = S.ATTRIB_VALUE_ENTITY_U : y.attribValue += N;
                continue;
              }
              W(y), N === ">" ? ie(y) : y.state = S.ATTRIB;
              continue;
            case S.CLOSE_TAG:
              if (y.tagName)
                N === ">" ? te(y) : I(w, N) ? y.tagName += N : y.script ? (y.script += "</" + y.tagName + N, y.tagName = "", y.state = S.SCRIPT) : (D(N) || A(y, "Invalid tagname in closing tag"), y.state = S.CLOSE_TAG_SAW_WHITE);
              else {
                if (D(N))
                  continue;
                L(m, N) ? y.script ? (y.script += "</" + N, y.state = S.SCRIPT) : A(y, "Invalid tagname in closing tag.") : y.tagName = N;
              }
              continue;
            case S.CLOSE_TAG_SAW_WHITE:
              if (D(N))
                continue;
              N === ">" ? te(y) : A(y, "Invalid characters in closing tag");
              continue;
            case S.TEXT_ENTITY:
            case S.ATTRIB_VALUE_ENTITY_Q:
            case S.ATTRIB_VALUE_ENTITY_U:
              var ye, Se;
              switch (y.state) {
                case S.TEXT_ENTITY:
                  ye = S.TEXT, Se = "textNode";
                  break;
                case S.ATTRIB_VALUE_ENTITY_Q:
                  ye = S.ATTRIB_VALUE_QUOTED, Se = "attribValue";
                  break;
                case S.ATTRIB_VALUE_ENTITY_U:
                  ye = S.ATTRIB_VALUE_UNQUOTED, Se = "attribValue";
                  break;
              }
              if (N === ";") {
                var we = de(y);
                y.opt.unparsedEntities && !Object.values(i.XML_ENTITIES).includes(we) ? (y.entity = "", y.state = ye, y.write(we)) : (y[Se] += we, y.entity = "", y.state = ye);
              } else I(y.entity.length ? b : R, N) ? y.entity += N : (A(y, "Invalid character in entity name"), y[Se] += "&" + y.entity + N, y.entity = "", y.state = ye);
              continue;
            default:
              throw new Error(y, "Unknown state: " + y.state);
          }
        return y.position >= y.bufferCheckPosition && d(y), y;
      }
      String.fromCodePoint || (function() {
        var E = String.fromCharCode, y = Math.floor, B = function() {
          var N = 16384, fe = [], ge, ye, Se = -1, we = arguments.length;
          if (!we)
            return "";
          for (var ze = ""; ++Se < we; ) {
            var Te = Number(arguments[Se]);
            if (!isFinite(Te) || // `NaN`, `+Infinity`, or `-Infinity`
            Te < 0 || // not a valid Unicode code point
            Te > 1114111 || // not a valid Unicode code point
            y(Te) !== Te)
              throw RangeError("Invalid code point: " + Te);
            Te <= 65535 ? fe.push(Te) : (Te -= 65536, ge = (Te >> 10) + 55296, ye = Te % 1024 + 56320, fe.push(ge, ye)), (Se + 1 === we || fe.length > N) && (ze += E.apply(null, fe), fe.length = 0);
          }
          return ze;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: B,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = B;
      })();
    })(e);
  })(ri)), ri;
}
var Xa;
function qf() {
  if (Xa) return Vt;
  Xa = 1, Object.defineProperty(Vt, "__esModule", { value: !0 }), Vt.XElement = void 0, Vt.parseXml = r;
  const e = $f(), i = cn();
  class c {
    constructor(t) {
      if (this.name = t, this.value = "", this.attributes = null, this.isCData = !1, this.elements = null, !t)
        throw (0, i.newError)("Element name cannot be empty", "ERR_XML_ELEMENT_NAME_EMPTY");
      if (!d(t))
        throw (0, i.newError)(`Invalid element name: ${t}`, "ERR_XML_ELEMENT_INVALID_NAME");
    }
    attribute(t) {
      const l = this.attributes === null ? null : this.attributes[t];
      if (l == null)
        throw (0, i.newError)(`No attribute "${t}"`, "ERR_XML_MISSED_ATTRIBUTE");
      return l;
    }
    removeAttribute(t) {
      this.attributes !== null && delete this.attributes[t];
    }
    element(t, l = !1, s = null) {
      const n = this.elementOrNull(t, l);
      if (n === null)
        throw (0, i.newError)(s || `No element "${t}"`, "ERR_XML_MISSED_ELEMENT");
      return n;
    }
    elementOrNull(t, l = !1) {
      if (this.elements === null)
        return null;
      for (const s of this.elements)
        if (f(s, t, l))
          return s;
      return null;
    }
    getElements(t, l = !1) {
      return this.elements === null ? [] : this.elements.filter((s) => f(s, t, l));
    }
    elementValueOrEmpty(t, l = !1) {
      const s = this.elementOrNull(t, l);
      return s === null ? "" : s.value;
    }
  }
  Vt.XElement = c;
  const o = new RegExp(/^[A-Za-z_][:A-Za-z0-9_-]*$/i);
  function d(h) {
    return o.test(h);
  }
  function f(h, t, l) {
    const s = h.name;
    return s === t || l === !0 && s.length === t.length && s.toLowerCase() === t.toLowerCase();
  }
  function r(h) {
    let t = null;
    const l = e.parser(!0, {}), s = [];
    return l.onopentag = (n) => {
      const a = new c(n.name);
      if (a.attributes = n.attributes, t === null)
        t = a;
      else {
        const p = s[s.length - 1];
        p.elements == null && (p.elements = []), p.elements.push(a);
      }
      s.push(a);
    }, l.onclosetag = () => {
      s.pop();
    }, l.ontext = (n) => {
      s.length > 0 && (s[s.length - 1].value = n);
    }, l.oncdata = (n) => {
      const a = s[s.length - 1];
      a.value = n, a.isCData = !0;
    }, l.onerror = (n) => {
      throw n;
    }, l.write(h), t;
  }
  return Vt;
}
var At = {}, Ja;
function Mf() {
  if (Ja) return At;
  Ja = 1, Object.defineProperty(At, "__esModule", { value: !0 }), At.mapToObject = e, At.isValidKey = i, At.asArray = c, At.deepAssign = r, At.objectToArgs = l;
  function e(s) {
    const n = {};
    for (const [a, p] of s)
      i(a) && (p instanceof Map ? n[a] = e(p) : n[a] = p);
    return n;
  }
  function i(s) {
    return ["__proto__", "prototype", "constructor"].includes(s) ? !1 : ["string", "number", "symbol", "boolean"].includes(typeof s) || s === null;
  }
  function c(s) {
    return s == null ? [] : Array.isArray(s) ? s : [s];
  }
  function o(s) {
    if (Array.isArray(s))
      return !1;
    const n = typeof s;
    return n === "object" || n === "function";
  }
  function d(s, n, a) {
    const p = n[a];
    if (p === void 0)
      return;
    const g = s[a];
    g == null || p == null || !o(g) || !o(p) ? Array.isArray(g) && Array.isArray(p) ? s[a] = Array.from(new Set(g.concat(p))) : s[a] = p : s[a] = f(g, p);
  }
  function f(s, n) {
    if (s !== n)
      for (const a of Object.getOwnPropertyNames(n))
        i(a) && d(s, n, a);
    return s;
  }
  function r(s, ...n) {
    for (const a of n)
      a != null && f(s, a);
    return s;
  }
  const h = /^[a-zA-Z][a-zA-Z0-9-]*$/, t = /[\0\r\n]/;
  function l(s) {
    const n = Object.entries(s).reduce((a, [p, g]) => {
      if (!i(p) || g == null)
        return a;
      if (!h.test(p))
        throw new Error(`objectToArgs: unsafe flag name rejected: ${JSON.stringify(p)}`);
      if (t.test(g))
        throw new Error(`objectToArgs: value for --${p} contains a null byte or newline`);
      return a.concat([`--${p}`, g]);
    }, []);
    return Object.freeze(n);
  }
  return At;
}
var Ka;
function qe() {
  return Ka || (Ka = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CURRENT_APP_PACKAGE_FILE_NAME = e.CURRENT_APP_INSTALLER_FILE_NAME = e.objectToArgs = e.deepAssign = e.asArray = e.mapToObject = e.isValidKey = e.XElement = e.parseXml = e.UUID = e.parseDn = e.retry = e.githubTagPrefix = e.githubUrl = e.getS3LikeProviderBaseUrl = e.ProgressCallbackTransform = e.MemoLazy = e.safeStringifyJson = e.safeGetHeader = e.parseJson = e.isSensitiveFieldName = e.HttpExecutor = e.hashSensitiveValue = e.HttpError = e.DigestTransform = e.createHttpError = e.configureRequestUrl = e.configureRequestOptionsFromUrl = e.configureRequestOptions = e.newError = e.CancellationToken = e.CancellationError = void 0;
    var i = Rs();
    Object.defineProperty(e, "CancellationError", { enumerable: !0, get: function() {
      return i.CancellationError;
    } }), Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
      return i.CancellationToken;
    } });
    var c = cn();
    Object.defineProperty(e, "newError", { enumerable: !0, get: function() {
      return c.newError;
    } });
    var o = Nf();
    Object.defineProperty(e, "configureRequestOptions", { enumerable: !0, get: function() {
      return o.configureRequestOptions;
    } }), Object.defineProperty(e, "configureRequestOptionsFromUrl", { enumerable: !0, get: function() {
      return o.configureRequestOptionsFromUrl;
    } }), Object.defineProperty(e, "configureRequestUrl", { enumerable: !0, get: function() {
      return o.configureRequestUrl;
    } }), Object.defineProperty(e, "createHttpError", { enumerable: !0, get: function() {
      return o.createHttpError;
    } }), Object.defineProperty(e, "DigestTransform", { enumerable: !0, get: function() {
      return o.DigestTransform;
    } }), Object.defineProperty(e, "HttpError", { enumerable: !0, get: function() {
      return o.HttpError;
    } }), Object.defineProperty(e, "hashSensitiveValue", { enumerable: !0, get: function() {
      return o.hashSensitiveValue;
    } }), Object.defineProperty(e, "HttpExecutor", { enumerable: !0, get: function() {
      return o.HttpExecutor;
    } }), Object.defineProperty(e, "isSensitiveFieldName", { enumerable: !0, get: function() {
      return o.isSensitiveFieldName;
    } }), Object.defineProperty(e, "parseJson", { enumerable: !0, get: function() {
      return o.parseJson;
    } }), Object.defineProperty(e, "safeGetHeader", { enumerable: !0, get: function() {
      return o.safeGetHeader;
    } }), Object.defineProperty(e, "safeStringifyJson", { enumerable: !0, get: function() {
      return o.safeStringifyJson;
    } });
    var d = Ff();
    Object.defineProperty(e, "MemoLazy", { enumerable: !0, get: function() {
      return d.MemoLazy;
    } });
    var f = Ec();
    Object.defineProperty(e, "ProgressCallbackTransform", { enumerable: !0, get: function() {
      return f.ProgressCallbackTransform;
    } });
    var r = Lf();
    Object.defineProperty(e, "getS3LikeProviderBaseUrl", { enumerable: !0, get: function() {
      return r.getS3LikeProviderBaseUrl;
    } }), Object.defineProperty(e, "githubUrl", { enumerable: !0, get: function() {
      return r.githubUrl;
    } }), Object.defineProperty(e, "githubTagPrefix", { enumerable: !0, get: function() {
      return r.githubTagPrefix;
    } });
    var h = Uf();
    Object.defineProperty(e, "retry", { enumerable: !0, get: function() {
      return h.retry;
    } });
    var t = xf();
    Object.defineProperty(e, "parseDn", { enumerable: !0, get: function() {
      return t.parseDn;
    } });
    var l = kf();
    Object.defineProperty(e, "UUID", { enumerable: !0, get: function() {
      return l.UUID;
    } });
    var s = qf();
    Object.defineProperty(e, "parseXml", { enumerable: !0, get: function() {
      return s.parseXml;
    } }), Object.defineProperty(e, "XElement", { enumerable: !0, get: function() {
      return s.XElement;
    } });
    var n = Mf();
    Object.defineProperty(e, "isValidKey", { enumerable: !0, get: function() {
      return n.isValidKey;
    } }), Object.defineProperty(e, "mapToObject", { enumerable: !0, get: function() {
      return n.mapToObject;
    } }), Object.defineProperty(e, "asArray", { enumerable: !0, get: function() {
      return n.asArray;
    } }), Object.defineProperty(e, "deepAssign", { enumerable: !0, get: function() {
      return n.deepAssign;
    } }), Object.defineProperty(e, "objectToArgs", { enumerable: !0, get: function() {
      return n.objectToArgs;
    } }), e.CURRENT_APP_INSTALLER_FILE_NAME = "installer.exe", e.CURRENT_APP_PACKAGE_FILE_NAME = "package.7z";
  })(Kn)), Kn;
}
var je = {}, Zr = {}, Rt = {}, Qa;
function Ur() {
  if (Qa) return Rt;
  Qa = 1;
  function e(r) {
    return typeof r > "u" || r === null;
  }
  function i(r) {
    return typeof r == "object" && r !== null;
  }
  function c(r) {
    return Array.isArray(r) ? r : e(r) ? [] : [r];
  }
  function o(r, h) {
    var t, l, s, n;
    if (h)
      for (n = Object.keys(h), t = 0, l = n.length; t < l; t += 1)
        s = n[t], r[s] = h[s];
    return r;
  }
  function d(r, h) {
    var t = "", l;
    for (l = 0; l < h; l += 1)
      t += r;
    return t;
  }
  function f(r) {
    return r === 0 && Number.NEGATIVE_INFINITY === 1 / r;
  }
  return Rt.isNothing = e, Rt.isObject = i, Rt.toArray = c, Rt.repeat = d, Rt.isNegativeZero = f, Rt.extend = o, Rt;
}
var ni, Za;
function xr() {
  if (Za) return ni;
  Za = 1;
  function e(c, o) {
    var d = "", f = c.reason || "(unknown reason)";
    return c.mark ? (c.mark.name && (d += 'in "' + c.mark.name + '" '), d += "(" + (c.mark.line + 1) + ":" + (c.mark.column + 1) + ")", !o && c.mark.snippet && (d += `

` + c.mark.snippet), f + " " + d) : f;
  }
  function i(c, o) {
    Error.call(this), this.name = "YAMLException", this.reason = c, this.mark = o, this.message = e(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
  }
  return i.prototype = Object.create(Error.prototype), i.prototype.constructor = i, i.prototype.toString = function(o) {
    return this.name + ": " + e(this, o);
  }, ni = i, ni;
}
var ii, eo;
function Bf() {
  if (eo) return ii;
  eo = 1;
  var e = Ur();
  function i(d, f, r, h, t) {
    var l = "", s = "", n = Math.floor(t / 2) - 1;
    return h - f > n && (l = " ... ", f = h - n + l.length), r - h > n && (s = " ...", r = h + n - s.length), {
      str: l + d.slice(f, r).replace(/\t/g, "→") + s,
      pos: h - f + l.length
      // relative position
    };
  }
  function c(d, f) {
    return e.repeat(" ", f - d.length) + d;
  }
  function o(d, f) {
    if (f = Object.create(f || null), !d.buffer) return null;
    f.maxLength || (f.maxLength = 79), typeof f.indent != "number" && (f.indent = 1), typeof f.linesBefore != "number" && (f.linesBefore = 3), typeof f.linesAfter != "number" && (f.linesAfter = 2);
    for (var r = /\r?\n|\r|\0/g, h = [0], t = [], l, s = -1; l = r.exec(d.buffer); )
      t.push(l.index), h.push(l.index + l[0].length), d.position <= l.index && s < 0 && (s = h.length - 2);
    s < 0 && (s = h.length - 1);
    var n = "", a, p, g = Math.min(d.line + f.linesAfter, t.length).toString().length, v = f.maxLength - (f.indent + g + 3);
    for (a = 1; a <= f.linesBefore && !(s - a < 0); a++)
      p = i(
        d.buffer,
        h[s - a],
        t[s - a],
        d.position - (h[s] - h[s - a]),
        v
      ), n = e.repeat(" ", f.indent) + c((d.line - a + 1).toString(), g) + " | " + p.str + `
` + n;
    for (p = i(d.buffer, h[s], t[s], d.position, v), n += e.repeat(" ", f.indent) + c((d.line + 1).toString(), g) + " | " + p.str + `
`, n += e.repeat("-", f.indent + g + 3 + p.pos) + `^
`, a = 1; a <= f.linesAfter && !(s + a >= t.length); a++)
      p = i(
        d.buffer,
        h[s + a],
        t[s + a],
        d.position - (h[s] - h[s + a]),
        v
      ), n += e.repeat(" ", f.indent) + c((d.line + a + 1).toString(), g) + " | " + p.str + `
`;
    return n.replace(/\n$/, "");
  }
  return ii = o, ii;
}
var si, to;
function We() {
  if (to) return si;
  to = 1;
  var e = xr(), i = [
    "kind",
    "multi",
    "resolve",
    "construct",
    "instanceOf",
    "predicate",
    "represent",
    "representName",
    "defaultStyle",
    "styleAliases"
  ], c = [
    "scalar",
    "sequence",
    "mapping"
  ];
  function o(f) {
    var r = {};
    return f !== null && Object.keys(f).forEach(function(h) {
      f[h].forEach(function(t) {
        r[String(t)] = h;
      });
    }), r;
  }
  function d(f, r) {
    if (r = r || {}, Object.keys(r).forEach(function(h) {
      if (i.indexOf(h) === -1)
        throw new e('Unknown option "' + h + '" is met in definition of "' + f + '" YAML type.');
    }), this.options = r, this.tag = f, this.kind = r.kind || null, this.resolve = r.resolve || function() {
      return !0;
    }, this.construct = r.construct || function(h) {
      return h;
    }, this.instanceOf = r.instanceOf || null, this.predicate = r.predicate || null, this.represent = r.represent || null, this.representName = r.representName || null, this.defaultStyle = r.defaultStyle || null, this.multi = r.multi || !1, this.styleAliases = o(r.styleAliases || null), c.indexOf(this.kind) === -1)
      throw new e('Unknown kind "' + this.kind + '" is specified for "' + f + '" YAML type.');
  }
  return si = d, si;
}
var ai, ro;
function wc() {
  if (ro) return ai;
  ro = 1;
  var e = xr(), i = We();
  function c(f, r) {
    var h = [];
    return f[r].forEach(function(t) {
      var l = h.length;
      h.forEach(function(s, n) {
        s.tag === t.tag && s.kind === t.kind && s.multi === t.multi && (l = n);
      }), h[l] = t;
    }), h;
  }
  function o() {
    var f = {
      scalar: {},
      sequence: {},
      mapping: {},
      fallback: {},
      multi: {
        scalar: [],
        sequence: [],
        mapping: [],
        fallback: []
      }
    }, r, h;
    function t(l) {
      l.multi ? (f.multi[l.kind].push(l), f.multi.fallback.push(l)) : f[l.kind][l.tag] = f.fallback[l.tag] = l;
    }
    for (r = 0, h = arguments.length; r < h; r += 1)
      arguments[r].forEach(t);
    return f;
  }
  function d(f) {
    return this.extend(f);
  }
  return d.prototype.extend = function(r) {
    var h = [], t = [];
    if (r instanceof i)
      t.push(r);
    else if (Array.isArray(r))
      t = t.concat(r);
    else if (r && (Array.isArray(r.implicit) || Array.isArray(r.explicit)))
      r.implicit && (h = h.concat(r.implicit)), r.explicit && (t = t.concat(r.explicit));
    else
      throw new e("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
    h.forEach(function(s) {
      if (!(s instanceof i))
        throw new e("Specified list of YAML types (or a single Type object) contains a non-Type object.");
      if (s.loadKind && s.loadKind !== "scalar")
        throw new e("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
      if (s.multi)
        throw new e("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }), t.forEach(function(s) {
      if (!(s instanceof i))
        throw new e("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    });
    var l = Object.create(d.prototype);
    return l.implicit = (this.implicit || []).concat(h), l.explicit = (this.explicit || []).concat(t), l.compiledImplicit = c(l, "implicit"), l.compiledExplicit = c(l, "explicit"), l.compiledTypeMap = o(l.compiledImplicit, l.compiledExplicit), l;
  }, ai = d, ai;
}
var oi, no;
function _c() {
  if (no) return oi;
  no = 1;
  var e = We();
  return oi = new e("tag:yaml.org,2002:str", {
    kind: "scalar",
    construct: function(i) {
      return i !== null ? i : "";
    }
  }), oi;
}
var li, io;
function Sc() {
  if (io) return li;
  io = 1;
  var e = We();
  return li = new e("tag:yaml.org,2002:seq", {
    kind: "sequence",
    construct: function(i) {
      return i !== null ? i : [];
    }
  }), li;
}
var ci, so;
function Ac() {
  if (so) return ci;
  so = 1;
  var e = We();
  return ci = new e("tag:yaml.org,2002:map", {
    kind: "mapping",
    construct: function(i) {
      return i !== null ? i : {};
    }
  }), ci;
}
var ui, ao;
function Rc() {
  if (ao) return ui;
  ao = 1;
  var e = wc();
  return ui = new e({
    explicit: [
      _c(),
      Sc(),
      Ac()
    ]
  }), ui;
}
var fi, oo;
function Tc() {
  if (oo) return fi;
  oo = 1;
  var e = We();
  function i(d) {
    if (d === null) return !0;
    var f = d.length;
    return f === 1 && d === "~" || f === 4 && (d === "null" || d === "Null" || d === "NULL");
  }
  function c() {
    return null;
  }
  function o(d) {
    return d === null;
  }
  return fi = new e("tag:yaml.org,2002:null", {
    kind: "scalar",
    resolve: i,
    construct: c,
    predicate: o,
    represent: {
      canonical: function() {
        return "~";
      },
      lowercase: function() {
        return "null";
      },
      uppercase: function() {
        return "NULL";
      },
      camelcase: function() {
        return "Null";
      },
      empty: function() {
        return "";
      }
    },
    defaultStyle: "lowercase"
  }), fi;
}
var di, lo;
function bc() {
  if (lo) return di;
  lo = 1;
  var e = We();
  function i(d) {
    if (d === null) return !1;
    var f = d.length;
    return f === 4 && (d === "true" || d === "True" || d === "TRUE") || f === 5 && (d === "false" || d === "False" || d === "FALSE");
  }
  function c(d) {
    return d === "true" || d === "True" || d === "TRUE";
  }
  function o(d) {
    return Object.prototype.toString.call(d) === "[object Boolean]";
  }
  return di = new e("tag:yaml.org,2002:bool", {
    kind: "scalar",
    resolve: i,
    construct: c,
    predicate: o,
    represent: {
      lowercase: function(d) {
        return d ? "true" : "false";
      },
      uppercase: function(d) {
        return d ? "TRUE" : "FALSE";
      },
      camelcase: function(d) {
        return d ? "True" : "False";
      }
    },
    defaultStyle: "lowercase"
  }), di;
}
var hi, co;
function Cc() {
  if (co) return hi;
  co = 1;
  var e = Ur(), i = We();
  function c(t) {
    return 48 <= t && t <= 57 || 65 <= t && t <= 70 || 97 <= t && t <= 102;
  }
  function o(t) {
    return 48 <= t && t <= 55;
  }
  function d(t) {
    return 48 <= t && t <= 57;
  }
  function f(t) {
    if (t === null) return !1;
    var l = t.length, s = 0, n = !1, a;
    if (!l) return !1;
    if (a = t[s], (a === "-" || a === "+") && (a = t[++s]), a === "0") {
      if (s + 1 === l) return !0;
      if (a = t[++s], a === "b") {
        for (s++; s < l; s++)
          if (a = t[s], a !== "_") {
            if (a !== "0" && a !== "1") return !1;
            n = !0;
          }
        return n && a !== "_";
      }
      if (a === "x") {
        for (s++; s < l; s++)
          if (a = t[s], a !== "_") {
            if (!c(t.charCodeAt(s))) return !1;
            n = !0;
          }
        return n && a !== "_";
      }
      if (a === "o") {
        for (s++; s < l; s++)
          if (a = t[s], a !== "_") {
            if (!o(t.charCodeAt(s))) return !1;
            n = !0;
          }
        return n && a !== "_";
      }
    }
    if (a === "_") return !1;
    for (; s < l; s++)
      if (a = t[s], a !== "_") {
        if (!d(t.charCodeAt(s)))
          return !1;
        n = !0;
      }
    return !(!n || a === "_");
  }
  function r(t) {
    var l = t, s = 1, n;
    if (l.indexOf("_") !== -1 && (l = l.replace(/_/g, "")), n = l[0], (n === "-" || n === "+") && (n === "-" && (s = -1), l = l.slice(1), n = l[0]), l === "0") return 0;
    if (n === "0") {
      if (l[1] === "b") return s * parseInt(l.slice(2), 2);
      if (l[1] === "x") return s * parseInt(l.slice(2), 16);
      if (l[1] === "o") return s * parseInt(l.slice(2), 8);
    }
    return s * parseInt(l, 10);
  }
  function h(t) {
    return Object.prototype.toString.call(t) === "[object Number]" && t % 1 === 0 && !e.isNegativeZero(t);
  }
  return hi = new i("tag:yaml.org,2002:int", {
    kind: "scalar",
    resolve: f,
    construct: r,
    predicate: h,
    represent: {
      binary: function(t) {
        return t >= 0 ? "0b" + t.toString(2) : "-0b" + t.toString(2).slice(1);
      },
      octal: function(t) {
        return t >= 0 ? "0o" + t.toString(8) : "-0o" + t.toString(8).slice(1);
      },
      decimal: function(t) {
        return t.toString(10);
      },
      /* eslint-disable max-len */
      hexadecimal: function(t) {
        return t >= 0 ? "0x" + t.toString(16).toUpperCase() : "-0x" + t.toString(16).toUpperCase().slice(1);
      }
    },
    defaultStyle: "decimal",
    styleAliases: {
      binary: [2, "bin"],
      octal: [8, "oct"],
      decimal: [10, "dec"],
      hexadecimal: [16, "hex"]
    }
  }), hi;
}
var pi, uo;
function Pc() {
  if (uo) return pi;
  uo = 1;
  var e = Ur(), i = We(), c = new RegExp(
    // 2.5e4, 2.5 and integers
    "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
  );
  function o(t) {
    return !(t === null || !c.test(t) || // Quick hack to not allow integers end with `_`
    // Probably should update regexp & check speed
    t[t.length - 1] === "_");
  }
  function d(t) {
    var l, s;
    return l = t.replace(/_/g, "").toLowerCase(), s = l[0] === "-" ? -1 : 1, "+-".indexOf(l[0]) >= 0 && (l = l.slice(1)), l === ".inf" ? s === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : l === ".nan" ? NaN : s * parseFloat(l, 10);
  }
  var f = /^[-+]?[0-9]+e/;
  function r(t, l) {
    var s;
    if (isNaN(t))
      switch (l) {
        case "lowercase":
          return ".nan";
        case "uppercase":
          return ".NAN";
        case "camelcase":
          return ".NaN";
      }
    else if (Number.POSITIVE_INFINITY === t)
      switch (l) {
        case "lowercase":
          return ".inf";
        case "uppercase":
          return ".INF";
        case "camelcase":
          return ".Inf";
      }
    else if (Number.NEGATIVE_INFINITY === t)
      switch (l) {
        case "lowercase":
          return "-.inf";
        case "uppercase":
          return "-.INF";
        case "camelcase":
          return "-.Inf";
      }
    else if (e.isNegativeZero(t))
      return "-0.0";
    return s = t.toString(10), f.test(s) ? s.replace("e", ".e") : s;
  }
  function h(t) {
    return Object.prototype.toString.call(t) === "[object Number]" && (t % 1 !== 0 || e.isNegativeZero(t));
  }
  return pi = new i("tag:yaml.org,2002:float", {
    kind: "scalar",
    resolve: o,
    construct: d,
    predicate: h,
    represent: r,
    defaultStyle: "lowercase"
  }), pi;
}
var mi, fo;
function Ic() {
  return fo || (fo = 1, mi = Rc().extend({
    implicit: [
      Tc(),
      bc(),
      Cc(),
      Pc()
    ]
  })), mi;
}
var gi, ho;
function Oc() {
  return ho || (ho = 1, gi = Ic()), gi;
}
var yi, po;
function Dc() {
  if (po) return yi;
  po = 1;
  var e = We(), i = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
  ), c = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
  );
  function o(r) {
    return r === null ? !1 : i.exec(r) !== null || c.exec(r) !== null;
  }
  function d(r) {
    var h, t, l, s, n, a, p, g = 0, v = null, m, w, R;
    if (h = i.exec(r), h === null && (h = c.exec(r)), h === null) throw new Error("Date resolve error");
    if (t = +h[1], l = +h[2] - 1, s = +h[3], !h[4])
      return new Date(Date.UTC(t, l, s));
    if (n = +h[4], a = +h[5], p = +h[6], h[7]) {
      for (g = h[7].slice(0, 3); g.length < 3; )
        g += "0";
      g = +g;
    }
    return h[9] && (m = +h[10], w = +(h[11] || 0), v = (m * 60 + w) * 6e4, h[9] === "-" && (v = -v)), R = new Date(Date.UTC(t, l, s, n, a, p, g)), v && R.setTime(R.getTime() - v), R;
  }
  function f(r) {
    return r.toISOString();
  }
  return yi = new e("tag:yaml.org,2002:timestamp", {
    kind: "scalar",
    resolve: o,
    construct: d,
    instanceOf: Date,
    represent: f
  }), yi;
}
var vi, mo;
function Nc() {
  if (mo) return vi;
  mo = 1;
  var e = We();
  function i(c) {
    return c === "<<" || c === null;
  }
  return vi = new e("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: i
  }), vi;
}
var Ei, go;
function Fc() {
  if (go) return Ei;
  go = 1;
  var e = We(), i = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
  function c(r) {
    if (r === null) return !1;
    var h, t, l = 0, s = r.length, n = i;
    for (t = 0; t < s; t++)
      if (h = n.indexOf(r.charAt(t)), !(h > 64)) {
        if (h < 0) return !1;
        l += 6;
      }
    return l % 8 === 0;
  }
  function o(r) {
    var h, t, l = r.replace(/[\r\n=]/g, ""), s = l.length, n = i, a = 0, p = [];
    for (h = 0; h < s; h++)
      h % 4 === 0 && h && (p.push(a >> 16 & 255), p.push(a >> 8 & 255), p.push(a & 255)), a = a << 6 | n.indexOf(l.charAt(h));
    return t = s % 4 * 6, t === 0 ? (p.push(a >> 16 & 255), p.push(a >> 8 & 255), p.push(a & 255)) : t === 18 ? (p.push(a >> 10 & 255), p.push(a >> 2 & 255)) : t === 12 && p.push(a >> 4 & 255), new Uint8Array(p);
  }
  function d(r) {
    var h = "", t = 0, l, s, n = r.length, a = i;
    for (l = 0; l < n; l++)
      l % 3 === 0 && l && (h += a[t >> 18 & 63], h += a[t >> 12 & 63], h += a[t >> 6 & 63], h += a[t & 63]), t = (t << 8) + r[l];
    return s = n % 3, s === 0 ? (h += a[t >> 18 & 63], h += a[t >> 12 & 63], h += a[t >> 6 & 63], h += a[t & 63]) : s === 2 ? (h += a[t >> 10 & 63], h += a[t >> 4 & 63], h += a[t << 2 & 63], h += a[64]) : s === 1 && (h += a[t >> 2 & 63], h += a[t << 4 & 63], h += a[64], h += a[64]), h;
  }
  function f(r) {
    return Object.prototype.toString.call(r) === "[object Uint8Array]";
  }
  return Ei = new e("tag:yaml.org,2002:binary", {
    kind: "scalar",
    resolve: c,
    construct: o,
    predicate: f,
    represent: d
  }), Ei;
}
var wi, yo;
function Lc() {
  if (yo) return wi;
  yo = 1;
  var e = We(), i = Object.prototype.hasOwnProperty, c = Object.prototype.toString;
  function o(f) {
    if (f === null) return !0;
    var r = [], h, t, l, s, n, a = f;
    for (h = 0, t = a.length; h < t; h += 1) {
      if (l = a[h], n = !1, c.call(l) !== "[object Object]") return !1;
      for (s in l)
        if (i.call(l, s))
          if (!n) n = !0;
          else return !1;
      if (!n) return !1;
      if (r.indexOf(s) === -1) r.push(s);
      else return !1;
    }
    return !0;
  }
  function d(f) {
    return f !== null ? f : [];
  }
  return wi = new e("tag:yaml.org,2002:omap", {
    kind: "sequence",
    resolve: o,
    construct: d
  }), wi;
}
var _i, vo;
function Uc() {
  if (vo) return _i;
  vo = 1;
  var e = We(), i = Object.prototype.toString;
  function c(d) {
    if (d === null) return !0;
    var f, r, h, t, l, s = d;
    for (l = new Array(s.length), f = 0, r = s.length; f < r; f += 1) {
      if (h = s[f], i.call(h) !== "[object Object]" || (t = Object.keys(h), t.length !== 1)) return !1;
      l[f] = [t[0], h[t[0]]];
    }
    return !0;
  }
  function o(d) {
    if (d === null) return [];
    var f, r, h, t, l, s = d;
    for (l = new Array(s.length), f = 0, r = s.length; f < r; f += 1)
      h = s[f], t = Object.keys(h), l[f] = [t[0], h[t[0]]];
    return l;
  }
  return _i = new e("tag:yaml.org,2002:pairs", {
    kind: "sequence",
    resolve: c,
    construct: o
  }), _i;
}
var Si, Eo;
function xc() {
  if (Eo) return Si;
  Eo = 1;
  var e = We(), i = Object.prototype.hasOwnProperty;
  function c(d) {
    if (d === null) return !0;
    var f, r = d;
    for (f in r)
      if (i.call(r, f) && r[f] !== null)
        return !1;
    return !0;
  }
  function o(d) {
    return d !== null ? d : {};
  }
  return Si = new e("tag:yaml.org,2002:set", {
    kind: "mapping",
    resolve: c,
    construct: o
  }), Si;
}
var Ai, wo;
function Ts() {
  return wo || (wo = 1, Ai = Oc().extend({
    implicit: [
      Dc(),
      Nc()
    ],
    explicit: [
      Fc(),
      Lc(),
      Uc(),
      xc()
    ]
  })), Ai;
}
var _o;
function jf() {
  if (_o) return Zr;
  _o = 1;
  var e = Ur(), i = xr(), c = Bf(), o = Ts(), d = Object.prototype.hasOwnProperty, f = 1, r = 2, h = 3, t = 4, l = 1, s = 2, n = 3, a = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, p = /[\x85\u2028\u2029]/, g = /[,\[\]\{\}]/, v = /^(?:!|!!|![a-z\-]+!)$/i, m = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
  function w(u) {
    return Object.prototype.toString.call(u);
  }
  function R(u) {
    return u === 10 || u === 13;
  }
  function b(u) {
    return u === 9 || u === 32;
  }
  function D(u) {
    return u === 9 || u === 32 || u === 10 || u === 13;
  }
  function P(u) {
    return u === 44 || u === 91 || u === 93 || u === 123 || u === 125;
  }
  function F(u) {
    var j;
    return 48 <= u && u <= 57 ? u - 48 : (j = u | 32, 97 <= j && j <= 102 ? j - 97 + 10 : -1);
  }
  function I(u) {
    return u === 120 ? 2 : u === 117 ? 4 : u === 85 ? 8 : 0;
  }
  function L(u) {
    return 48 <= u && u <= 57 ? u - 48 : -1;
  }
  function S(u) {
    return u === 48 ? "\0" : u === 97 ? "\x07" : u === 98 ? "\b" : u === 116 || u === 9 ? "	" : u === 110 ? `
` : u === 118 ? "\v" : u === 102 ? "\f" : u === 114 ? "\r" : u === 101 ? "\x1B" : u === 32 ? " " : u === 34 ? '"' : u === 47 ? "/" : u === 92 ? "\\" : u === 78 ? "" : u === 95 ? " " : u === 76 ? "\u2028" : u === 80 ? "\u2029" : "";
  }
  function z(u) {
    return u <= 65535 ? String.fromCharCode(u) : String.fromCharCode(
      (u - 65536 >> 10) + 55296,
      (u - 65536 & 1023) + 56320
    );
  }
  function G(u, j, V) {
    j === "__proto__" ? Object.defineProperty(u, j, {
      configurable: !0,
      enumerable: !0,
      writable: !0,
      value: V
    }) : u[j] = V;
  }
  for (var $ = new Array(256), H = new Array(256), U = 0; U < 256; U++)
    $[U] = S(U) ? 1 : 0, H[U] = S(U);
  function C(u, j) {
    this.input = u, this.filename = j.filename || null, this.schema = j.schema || o, this.onWarning = j.onWarning || null, this.legacy = j.legacy || !1, this.json = j.json || !1, this.listener = j.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = u.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
  }
  function O(u, j) {
    var V = {
      name: u.filename,
      buffer: u.input.slice(0, -1),
      // omit trailing \0
      position: u.position,
      line: u.line,
      column: u.position - u.lineStart
    };
    return V.snippet = c(V), new i(j, V);
  }
  function A(u, j) {
    throw O(u, j);
  }
  function k(u, j) {
    u.onWarning && u.onWarning.call(null, O(u, j));
  }
  var M = {
    YAML: function(j, V, se) {
      var X, ne, ee;
      j.version !== null && A(j, "duplication of %YAML directive"), se.length !== 1 && A(j, "YAML directive accepts exactly one argument"), X = /^([0-9]+)\.([0-9]+)$/.exec(se[0]), X === null && A(j, "ill-formed argument of the YAML directive"), ne = parseInt(X[1], 10), ee = parseInt(X[2], 10), ne !== 1 && A(j, "unacceptable YAML version of the document"), j.version = se[0], j.checkLineBreaks = ee < 2, ee !== 1 && ee !== 2 && k(j, "unsupported YAML version of the document");
    },
    TAG: function(j, V, se) {
      var X, ne;
      se.length !== 2 && A(j, "TAG directive accepts exactly two arguments"), X = se[0], ne = se[1], v.test(X) || A(j, "ill-formed tag handle (first argument) of the TAG directive"), d.call(j.tagMap, X) && A(j, 'there is a previously declared suffix for "' + X + '" tag handle'), m.test(ne) || A(j, "ill-formed tag prefix (second argument) of the TAG directive");
      try {
        ne = decodeURIComponent(ne);
      } catch {
        A(j, "tag prefix is malformed: " + ne);
      }
      j.tagMap[X] = ne;
    }
  };
  function W(u, j, V, se) {
    var X, ne, ee, oe;
    if (j < V) {
      if (oe = u.input.slice(j, V), se)
        for (X = 0, ne = oe.length; X < ne; X += 1)
          ee = oe.charCodeAt(X), ee === 9 || 32 <= ee && ee <= 1114111 || A(u, "expected valid JSON character");
      else a.test(oe) && A(u, "the stream contains non-printable characters");
      u.result += oe;
    }
  }
  function ie(u, j, V, se) {
    var X, ne, ee, oe;
    for (e.isObject(V) || A(u, "cannot merge mappings; the provided source object is unacceptable"), X = Object.keys(V), ee = 0, oe = X.length; ee < oe; ee += 1)
      ne = X[ee], d.call(j, ne) || (G(j, ne, V[ne]), se[ne] = !0);
  }
  function te(u, j, V, se, X, ne, ee, oe, ue) {
    var be, Ce;
    if (Array.isArray(X))
      for (X = Array.prototype.slice.call(X), be = 0, Ce = X.length; be < Ce; be += 1)
        Array.isArray(X[be]) && A(u, "nested arrays are not supported inside keys"), typeof X == "object" && w(X[be]) === "[object Object]" && (X[be] = "[object Object]");
    if (typeof X == "object" && w(X) === "[object Object]" && (X = "[object Object]"), X = String(X), j === null && (j = {}), se === "tag:yaml.org,2002:merge")
      if (Array.isArray(ne))
        for (be = 0, Ce = ne.length; be < Ce; be += 1)
          ie(u, j, ne[be], V);
      else
        ie(u, j, ne, V);
    else
      !u.json && !d.call(V, X) && d.call(j, X) && (u.line = ee || u.line, u.lineStart = oe || u.lineStart, u.position = ue || u.position, A(u, "duplicated mapping key")), G(j, X, ne), delete V[X];
    return j;
  }
  function de(u) {
    var j;
    j = u.input.charCodeAt(u.position), j === 10 ? u.position++ : j === 13 ? (u.position++, u.input.charCodeAt(u.position) === 10 && u.position++) : A(u, "a line break is expected"), u.line += 1, u.lineStart = u.position, u.firstTabInLine = -1;
  }
  function he(u, j, V) {
    for (var se = 0, X = u.input.charCodeAt(u.position); X !== 0; ) {
      for (; b(X); )
        X === 9 && u.firstTabInLine === -1 && (u.firstTabInLine = u.position), X = u.input.charCodeAt(++u.position);
      if (j && X === 35)
        do
          X = u.input.charCodeAt(++u.position);
        while (X !== 10 && X !== 13 && X !== 0);
      if (R(X))
        for (de(u), X = u.input.charCodeAt(u.position), se++, u.lineIndent = 0; X === 32; )
          u.lineIndent++, X = u.input.charCodeAt(++u.position);
      else
        break;
    }
    return V !== -1 && se !== 0 && u.lineIndent < V && k(u, "deficient indentation"), se;
  }
  function Y(u) {
    var j = u.position, V;
    return V = u.input.charCodeAt(j), !!((V === 45 || V === 46) && V === u.input.charCodeAt(j + 1) && V === u.input.charCodeAt(j + 2) && (j += 3, V = u.input.charCodeAt(j), V === 0 || D(V)));
  }
  function pe(u, j) {
    j === 1 ? u.result += " " : j > 1 && (u.result += e.repeat(`
`, j - 1));
  }
  function E(u, j, V) {
    var se, X, ne, ee, oe, ue, be, Ce, ve = u.kind, _ = u.result, q;
    if (q = u.input.charCodeAt(u.position), D(q) || P(q) || q === 35 || q === 38 || q === 42 || q === 33 || q === 124 || q === 62 || q === 39 || q === 34 || q === 37 || q === 64 || q === 96 || (q === 63 || q === 45) && (X = u.input.charCodeAt(u.position + 1), D(X) || V && P(X)))
      return !1;
    for (u.kind = "scalar", u.result = "", ne = ee = u.position, oe = !1; q !== 0; ) {
      if (q === 58) {
        if (X = u.input.charCodeAt(u.position + 1), D(X) || V && P(X))
          break;
      } else if (q === 35) {
        if (se = u.input.charCodeAt(u.position - 1), D(se))
          break;
      } else {
        if (u.position === u.lineStart && Y(u) || V && P(q))
          break;
        if (R(q))
          if (ue = u.line, be = u.lineStart, Ce = u.lineIndent, he(u, !1, -1), u.lineIndent >= j) {
            oe = !0, q = u.input.charCodeAt(u.position);
            continue;
          } else {
            u.position = ee, u.line = ue, u.lineStart = be, u.lineIndent = Ce;
            break;
          }
      }
      oe && (W(u, ne, ee, !1), pe(u, u.line - ue), ne = ee = u.position, oe = !1), b(q) || (ee = u.position + 1), q = u.input.charCodeAt(++u.position);
    }
    return W(u, ne, ee, !1), u.result ? !0 : (u.kind = ve, u.result = _, !1);
  }
  function y(u, j) {
    var V, se, X;
    if (V = u.input.charCodeAt(u.position), V !== 39)
      return !1;
    for (u.kind = "scalar", u.result = "", u.position++, se = X = u.position; (V = u.input.charCodeAt(u.position)) !== 0; )
      if (V === 39)
        if (W(u, se, u.position, !0), V = u.input.charCodeAt(++u.position), V === 39)
          se = u.position, u.position++, X = u.position;
        else
          return !0;
      else R(V) ? (W(u, se, X, !0), pe(u, he(u, !1, j)), se = X = u.position) : u.position === u.lineStart && Y(u) ? A(u, "unexpected end of the document within a single quoted scalar") : (u.position++, X = u.position);
    A(u, "unexpected end of the stream within a single quoted scalar");
  }
  function B(u, j) {
    var V, se, X, ne, ee, oe;
    if (oe = u.input.charCodeAt(u.position), oe !== 34)
      return !1;
    for (u.kind = "scalar", u.result = "", u.position++, V = se = u.position; (oe = u.input.charCodeAt(u.position)) !== 0; ) {
      if (oe === 34)
        return W(u, V, u.position, !0), u.position++, !0;
      if (oe === 92) {
        if (W(u, V, u.position, !0), oe = u.input.charCodeAt(++u.position), R(oe))
          he(u, !1, j);
        else if (oe < 256 && $[oe])
          u.result += H[oe], u.position++;
        else if ((ee = I(oe)) > 0) {
          for (X = ee, ne = 0; X > 0; X--)
            oe = u.input.charCodeAt(++u.position), (ee = F(oe)) >= 0 ? ne = (ne << 4) + ee : A(u, "expected hexadecimal character");
          u.result += z(ne), u.position++;
        } else
          A(u, "unknown escape sequence");
        V = se = u.position;
      } else R(oe) ? (W(u, V, se, !0), pe(u, he(u, !1, j)), V = se = u.position) : u.position === u.lineStart && Y(u) ? A(u, "unexpected end of the document within a double quoted scalar") : (u.position++, se = u.position);
    }
    A(u, "unexpected end of the stream within a double quoted scalar");
  }
  function N(u, j) {
    var V = !0, se, X, ne, ee = u.tag, oe, ue = u.anchor, be, Ce, ve, _, q, J = /* @__PURE__ */ Object.create(null), K, Q, ae, re;
    if (re = u.input.charCodeAt(u.position), re === 91)
      Ce = 93, q = !1, oe = [];
    else if (re === 123)
      Ce = 125, q = !0, oe = {};
    else
      return !1;
    for (u.anchor !== null && (u.anchorMap[u.anchor] = oe), re = u.input.charCodeAt(++u.position); re !== 0; ) {
      if (he(u, !0, j), re = u.input.charCodeAt(u.position), re === Ce)
        return u.position++, u.tag = ee, u.anchor = ue, u.kind = q ? "mapping" : "sequence", u.result = oe, !0;
      V ? re === 44 && A(u, "expected the node content, but found ','") : A(u, "missed comma between flow collection entries"), Q = K = ae = null, ve = _ = !1, re === 63 && (be = u.input.charCodeAt(u.position + 1), D(be) && (ve = _ = !0, u.position++, he(u, !0, j))), se = u.line, X = u.lineStart, ne = u.position, Te(u, j, f, !1, !0), Q = u.tag, K = u.result, he(u, !0, j), re = u.input.charCodeAt(u.position), (_ || u.line === se) && re === 58 && (ve = !0, re = u.input.charCodeAt(++u.position), he(u, !0, j), Te(u, j, f, !1, !0), ae = u.result), q ? te(u, oe, J, Q, K, ae, se, X, ne) : ve ? oe.push(te(u, null, J, Q, K, ae, se, X, ne)) : oe.push(K), he(u, !0, j), re = u.input.charCodeAt(u.position), re === 44 ? (V = !0, re = u.input.charCodeAt(++u.position)) : V = !1;
    }
    A(u, "unexpected end of the stream within a flow collection");
  }
  function fe(u, j) {
    var V, se, X = l, ne = !1, ee = !1, oe = j, ue = 0, be = !1, Ce, ve;
    if (ve = u.input.charCodeAt(u.position), ve === 124)
      se = !1;
    else if (ve === 62)
      se = !0;
    else
      return !1;
    for (u.kind = "scalar", u.result = ""; ve !== 0; )
      if (ve = u.input.charCodeAt(++u.position), ve === 43 || ve === 45)
        l === X ? X = ve === 43 ? n : s : A(u, "repeat of a chomping mode identifier");
      else if ((Ce = L(ve)) >= 0)
        Ce === 0 ? A(u, "bad explicit indentation width of a block scalar; it cannot be less than one") : ee ? A(u, "repeat of an indentation width identifier") : (oe = j + Ce - 1, ee = !0);
      else
        break;
    if (b(ve)) {
      do
        ve = u.input.charCodeAt(++u.position);
      while (b(ve));
      if (ve === 35)
        do
          ve = u.input.charCodeAt(++u.position);
        while (!R(ve) && ve !== 0);
    }
    for (; ve !== 0; ) {
      for (de(u), u.lineIndent = 0, ve = u.input.charCodeAt(u.position); (!ee || u.lineIndent < oe) && ve === 32; )
        u.lineIndent++, ve = u.input.charCodeAt(++u.position);
      if (!ee && u.lineIndent > oe && (oe = u.lineIndent), R(ve)) {
        ue++;
        continue;
      }
      if (u.lineIndent < oe) {
        X === n ? u.result += e.repeat(`
`, ne ? 1 + ue : ue) : X === l && ne && (u.result += `
`);
        break;
      }
      for (se ? b(ve) ? (be = !0, u.result += e.repeat(`
`, ne ? 1 + ue : ue)) : be ? (be = !1, u.result += e.repeat(`
`, ue + 1)) : ue === 0 ? ne && (u.result += " ") : u.result += e.repeat(`
`, ue) : u.result += e.repeat(`
`, ne ? 1 + ue : ue), ne = !0, ee = !0, ue = 0, V = u.position; !R(ve) && ve !== 0; )
        ve = u.input.charCodeAt(++u.position);
      W(u, V, u.position, !1);
    }
    return !0;
  }
  function ge(u, j) {
    var V, se = u.tag, X = u.anchor, ne = [], ee, oe = !1, ue;
    if (u.firstTabInLine !== -1) return !1;
    for (u.anchor !== null && (u.anchorMap[u.anchor] = ne), ue = u.input.charCodeAt(u.position); ue !== 0 && (u.firstTabInLine !== -1 && (u.position = u.firstTabInLine, A(u, "tab characters must not be used in indentation")), !(ue !== 45 || (ee = u.input.charCodeAt(u.position + 1), !D(ee)))); ) {
      if (oe = !0, u.position++, he(u, !0, -1) && u.lineIndent <= j) {
        ne.push(null), ue = u.input.charCodeAt(u.position);
        continue;
      }
      if (V = u.line, Te(u, j, h, !1, !0), ne.push(u.result), he(u, !0, -1), ue = u.input.charCodeAt(u.position), (u.line === V || u.lineIndent > j) && ue !== 0)
        A(u, "bad indentation of a sequence entry");
      else if (u.lineIndent < j)
        break;
    }
    return oe ? (u.tag = se, u.anchor = X, u.kind = "sequence", u.result = ne, !0) : !1;
  }
  function ye(u, j, V) {
    var se, X, ne, ee, oe, ue, be = u.tag, Ce = u.anchor, ve = {}, _ = /* @__PURE__ */ Object.create(null), q = null, J = null, K = null, Q = !1, ae = !1, re;
    if (u.firstTabInLine !== -1) return !1;
    for (u.anchor !== null && (u.anchorMap[u.anchor] = ve), re = u.input.charCodeAt(u.position); re !== 0; ) {
      if (!Q && u.firstTabInLine !== -1 && (u.position = u.firstTabInLine, A(u, "tab characters must not be used in indentation")), se = u.input.charCodeAt(u.position + 1), ne = u.line, (re === 63 || re === 58) && D(se))
        re === 63 ? (Q && (te(u, ve, _, q, J, null, ee, oe, ue), q = J = K = null), ae = !0, Q = !0, X = !0) : Q ? (Q = !1, X = !0) : A(u, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), u.position += 1, re = se;
      else {
        if (ee = u.line, oe = u.lineStart, ue = u.position, !Te(u, V, r, !1, !0))
          break;
        if (u.line === ne) {
          for (re = u.input.charCodeAt(u.position); b(re); )
            re = u.input.charCodeAt(++u.position);
          if (re === 58)
            re = u.input.charCodeAt(++u.position), D(re) || A(u, "a whitespace character is expected after the key-value separator within a block mapping"), Q && (te(u, ve, _, q, J, null, ee, oe, ue), q = J = K = null), ae = !0, Q = !1, X = !1, q = u.tag, J = u.result;
          else if (ae)
            A(u, "can not read an implicit mapping pair; a colon is missed");
          else
            return u.tag = be, u.anchor = Ce, !0;
        } else if (ae)
          A(u, "can not read a block mapping entry; a multiline key may not be an implicit key");
        else
          return u.tag = be, u.anchor = Ce, !0;
      }
      if ((u.line === ne || u.lineIndent > j) && (Q && (ee = u.line, oe = u.lineStart, ue = u.position), Te(u, j, t, !0, X) && (Q ? J = u.result : K = u.result), Q || (te(u, ve, _, q, J, K, ee, oe, ue), q = J = K = null), he(u, !0, -1), re = u.input.charCodeAt(u.position)), (u.line === ne || u.lineIndent > j) && re !== 0)
        A(u, "bad indentation of a mapping entry");
      else if (u.lineIndent < j)
        break;
    }
    return Q && te(u, ve, _, q, J, null, ee, oe, ue), ae && (u.tag = be, u.anchor = Ce, u.kind = "mapping", u.result = ve), ae;
  }
  function Se(u) {
    var j, V = !1, se = !1, X, ne, ee;
    if (ee = u.input.charCodeAt(u.position), ee !== 33) return !1;
    if (u.tag !== null && A(u, "duplication of a tag property"), ee = u.input.charCodeAt(++u.position), ee === 60 ? (V = !0, ee = u.input.charCodeAt(++u.position)) : ee === 33 ? (se = !0, X = "!!", ee = u.input.charCodeAt(++u.position)) : X = "!", j = u.position, V) {
      do
        ee = u.input.charCodeAt(++u.position);
      while (ee !== 0 && ee !== 62);
      u.position < u.length ? (ne = u.input.slice(j, u.position), ee = u.input.charCodeAt(++u.position)) : A(u, "unexpected end of the stream within a verbatim tag");
    } else {
      for (; ee !== 0 && !D(ee); )
        ee === 33 && (se ? A(u, "tag suffix cannot contain exclamation marks") : (X = u.input.slice(j - 1, u.position + 1), v.test(X) || A(u, "named tag handle cannot contain such characters"), se = !0, j = u.position + 1)), ee = u.input.charCodeAt(++u.position);
      ne = u.input.slice(j, u.position), g.test(ne) && A(u, "tag suffix cannot contain flow indicator characters");
    }
    ne && !m.test(ne) && A(u, "tag name cannot contain such characters: " + ne);
    try {
      ne = decodeURIComponent(ne);
    } catch {
      A(u, "tag name is malformed: " + ne);
    }
    return V ? u.tag = ne : d.call(u.tagMap, X) ? u.tag = u.tagMap[X] + ne : X === "!" ? u.tag = "!" + ne : X === "!!" ? u.tag = "tag:yaml.org,2002:" + ne : A(u, 'undeclared tag handle "' + X + '"'), !0;
  }
  function we(u) {
    var j, V;
    if (V = u.input.charCodeAt(u.position), V !== 38) return !1;
    for (u.anchor !== null && A(u, "duplication of an anchor property"), V = u.input.charCodeAt(++u.position), j = u.position; V !== 0 && !D(V) && !P(V); )
      V = u.input.charCodeAt(++u.position);
    return u.position === j && A(u, "name of an anchor node must contain at least one character"), u.anchor = u.input.slice(j, u.position), !0;
  }
  function ze(u) {
    var j, V, se;
    if (se = u.input.charCodeAt(u.position), se !== 42) return !1;
    for (se = u.input.charCodeAt(++u.position), j = u.position; se !== 0 && !D(se) && !P(se); )
      se = u.input.charCodeAt(++u.position);
    return u.position === j && A(u, "name of an alias node must contain at least one character"), V = u.input.slice(j, u.position), d.call(u.anchorMap, V) || A(u, 'unidentified alias "' + V + '"'), u.result = u.anchorMap[V], he(u, !0, -1), !0;
  }
  function Te(u, j, V, se, X) {
    var ne, ee, oe, ue = 1, be = !1, Ce = !1, ve, _, q, J, K, Q;
    if (u.listener !== null && u.listener("open", u), u.tag = null, u.anchor = null, u.kind = null, u.result = null, ne = ee = oe = t === V || h === V, se && he(u, !0, -1) && (be = !0, u.lineIndent > j ? ue = 1 : u.lineIndent === j ? ue = 0 : u.lineIndent < j && (ue = -1)), ue === 1)
      for (; Se(u) || we(u); )
        he(u, !0, -1) ? (be = !0, oe = ne, u.lineIndent > j ? ue = 1 : u.lineIndent === j ? ue = 0 : u.lineIndent < j && (ue = -1)) : oe = !1;
    if (oe && (oe = be || X), (ue === 1 || t === V) && (f === V || r === V ? K = j : K = j + 1, Q = u.position - u.lineStart, ue === 1 ? oe && (ge(u, Q) || ye(u, Q, K)) || N(u, K) ? Ce = !0 : (ee && fe(u, K) || y(u, K) || B(u, K) ? Ce = !0 : ze(u) ? (Ce = !0, (u.tag !== null || u.anchor !== null) && A(u, "alias node should not have any properties")) : E(u, K, f === V) && (Ce = !0, u.tag === null && (u.tag = "?")), u.anchor !== null && (u.anchorMap[u.anchor] = u.result)) : ue === 0 && (Ce = oe && ge(u, Q))), u.tag === null)
      u.anchor !== null && (u.anchorMap[u.anchor] = u.result);
    else if (u.tag === "?") {
      for (u.result !== null && u.kind !== "scalar" && A(u, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + u.kind + '"'), ve = 0, _ = u.implicitTypes.length; ve < _; ve += 1)
        if (J = u.implicitTypes[ve], J.resolve(u.result)) {
          u.result = J.construct(u.result), u.tag = J.tag, u.anchor !== null && (u.anchorMap[u.anchor] = u.result);
          break;
        }
    } else if (u.tag !== "!") {
      if (d.call(u.typeMap[u.kind || "fallback"], u.tag))
        J = u.typeMap[u.kind || "fallback"][u.tag];
      else
        for (J = null, q = u.typeMap.multi[u.kind || "fallback"], ve = 0, _ = q.length; ve < _; ve += 1)
          if (u.tag.slice(0, q[ve].tag.length) === q[ve].tag) {
            J = q[ve];
            break;
          }
      J || A(u, "unknown tag !<" + u.tag + ">"), u.result !== null && J.kind !== u.kind && A(u, "unacceptable node kind for !<" + u.tag + '> tag; it should be "' + J.kind + '", not "' + u.kind + '"'), J.resolve(u.result, u.tag) ? (u.result = J.construct(u.result, u.tag), u.anchor !== null && (u.anchorMap[u.anchor] = u.result)) : A(u, "cannot resolve a node with !<" + u.tag + "> explicit tag");
    }
    return u.listener !== null && u.listener("close", u), u.tag !== null || u.anchor !== null || Ce;
  }
  function He(u) {
    var j = u.position, V, se, X, ne = !1, ee;
    for (u.version = null, u.checkLineBreaks = u.legacy, u.tagMap = /* @__PURE__ */ Object.create(null), u.anchorMap = /* @__PURE__ */ Object.create(null); (ee = u.input.charCodeAt(u.position)) !== 0 && (he(u, !0, -1), ee = u.input.charCodeAt(u.position), !(u.lineIndent > 0 || ee !== 37)); ) {
      for (ne = !0, ee = u.input.charCodeAt(++u.position), V = u.position; ee !== 0 && !D(ee); )
        ee = u.input.charCodeAt(++u.position);
      for (se = u.input.slice(V, u.position), X = [], se.length < 1 && A(u, "directive name must not be less than one character in length"); ee !== 0; ) {
        for (; b(ee); )
          ee = u.input.charCodeAt(++u.position);
        if (ee === 35) {
          do
            ee = u.input.charCodeAt(++u.position);
          while (ee !== 0 && !R(ee));
          break;
        }
        if (R(ee)) break;
        for (V = u.position; ee !== 0 && !D(ee); )
          ee = u.input.charCodeAt(++u.position);
        X.push(u.input.slice(V, u.position));
      }
      ee !== 0 && de(u), d.call(M, se) ? M[se](u, se, X) : k(u, 'unknown document directive "' + se + '"');
    }
    if (he(u, !0, -1), u.lineIndent === 0 && u.input.charCodeAt(u.position) === 45 && u.input.charCodeAt(u.position + 1) === 45 && u.input.charCodeAt(u.position + 2) === 45 ? (u.position += 3, he(u, !0, -1)) : ne && A(u, "directives end mark is expected"), Te(u, u.lineIndent - 1, t, !1, !0), he(u, !0, -1), u.checkLineBreaks && p.test(u.input.slice(j, u.position)) && k(u, "non-ASCII line breaks are interpreted as content"), u.documents.push(u.result), u.position === u.lineStart && Y(u)) {
      u.input.charCodeAt(u.position) === 46 && (u.position += 3, he(u, !0, -1));
      return;
    }
    if (u.position < u.length - 1)
      A(u, "end of the stream or a document separator is expected");
    else
      return;
  }
  function Et(u, j) {
    u = String(u), j = j || {}, u.length !== 0 && (u.charCodeAt(u.length - 1) !== 10 && u.charCodeAt(u.length - 1) !== 13 && (u += `
`), u.charCodeAt(0) === 65279 && (u = u.slice(1)));
    var V = new C(u, j), se = u.indexOf("\0");
    for (se !== -1 && (V.position = se, A(V, "null byte is not allowed in input")), V.input += "\0"; V.input.charCodeAt(V.position) === 32; )
      V.lineIndent += 1, V.position += 1;
    for (; V.position < V.length - 1; )
      He(V);
    return V.documents;
  }
  function pt(u, j, V) {
    j !== null && typeof j == "object" && typeof V > "u" && (V = j, j = null);
    var se = Et(u, V);
    if (typeof j != "function")
      return se;
    for (var X = 0, ne = se.length; X < ne; X += 1)
      j(se[X]);
  }
  function ut(u, j) {
    var V = Et(u, j);
    if (V.length !== 0) {
      if (V.length === 1)
        return V[0];
      throw new i("expected a single document in the stream, but found more");
    }
  }
  return Zr.loadAll = pt, Zr.load = ut, Zr;
}
var Ri = {}, So;
function Hf() {
  if (So) return Ri;
  So = 1;
  var e = Ur(), i = xr(), c = Ts(), o = Object.prototype.toString, d = Object.prototype.hasOwnProperty, f = 65279, r = 9, h = 10, t = 13, l = 32, s = 33, n = 34, a = 35, p = 37, g = 38, v = 39, m = 42, w = 44, R = 45, b = 58, D = 61, P = 62, F = 63, I = 64, L = 91, S = 93, z = 96, G = 123, $ = 124, H = 125, U = {};
  U[0] = "\\0", U[7] = "\\a", U[8] = "\\b", U[9] = "\\t", U[10] = "\\n", U[11] = "\\v", U[12] = "\\f", U[13] = "\\r", U[27] = "\\e", U[34] = '\\"', U[92] = "\\\\", U[133] = "\\N", U[160] = "\\_", U[8232] = "\\L", U[8233] = "\\P";
  var C = [
    "y",
    "Y",
    "yes",
    "Yes",
    "YES",
    "on",
    "On",
    "ON",
    "n",
    "N",
    "no",
    "No",
    "NO",
    "off",
    "Off",
    "OFF"
  ], O = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
  function A(_, q) {
    var J, K, Q, ae, re, le, me;
    if (q === null) return {};
    for (J = {}, K = Object.keys(q), Q = 0, ae = K.length; Q < ae; Q += 1)
      re = K[Q], le = String(q[re]), re.slice(0, 2) === "!!" && (re = "tag:yaml.org,2002:" + re.slice(2)), me = _.compiledTypeMap.fallback[re], me && d.call(me.styleAliases, le) && (le = me.styleAliases[le]), J[re] = le;
    return J;
  }
  function k(_) {
    var q, J, K;
    if (q = _.toString(16).toUpperCase(), _ <= 255)
      J = "x", K = 2;
    else if (_ <= 65535)
      J = "u", K = 4;
    else if (_ <= 4294967295)
      J = "U", K = 8;
    else
      throw new i("code point within a string may not be greater than 0xFFFFFFFF");
    return "\\" + J + e.repeat("0", K - q.length) + q;
  }
  var M = 1, W = 2;
  function ie(_) {
    this.schema = _.schema || c, this.indent = Math.max(1, _.indent || 2), this.noArrayIndent = _.noArrayIndent || !1, this.skipInvalid = _.skipInvalid || !1, this.flowLevel = e.isNothing(_.flowLevel) ? -1 : _.flowLevel, this.styleMap = A(this.schema, _.styles || null), this.sortKeys = _.sortKeys || !1, this.lineWidth = _.lineWidth || 80, this.noRefs = _.noRefs || !1, this.noCompatMode = _.noCompatMode || !1, this.condenseFlow = _.condenseFlow || !1, this.quotingType = _.quotingType === '"' ? W : M, this.forceQuotes = _.forceQuotes || !1, this.replacer = typeof _.replacer == "function" ? _.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
  }
  function te(_, q) {
    for (var J = e.repeat(" ", q), K = 0, Q = -1, ae = "", re, le = _.length; K < le; )
      Q = _.indexOf(`
`, K), Q === -1 ? (re = _.slice(K), K = le) : (re = _.slice(K, Q + 1), K = Q + 1), re.length && re !== `
` && (ae += J), ae += re;
    return ae;
  }
  function de(_, q) {
    return `
` + e.repeat(" ", _.indent * q);
  }
  function he(_, q) {
    var J, K, Q;
    for (J = 0, K = _.implicitTypes.length; J < K; J += 1)
      if (Q = _.implicitTypes[J], Q.resolve(q))
        return !0;
    return !1;
  }
  function Y(_) {
    return _ === l || _ === r;
  }
  function pe(_) {
    return 32 <= _ && _ <= 126 || 161 <= _ && _ <= 55295 && _ !== 8232 && _ !== 8233 || 57344 <= _ && _ <= 65533 && _ !== f || 65536 <= _ && _ <= 1114111;
  }
  function E(_) {
    return pe(_) && _ !== f && _ !== t && _ !== h;
  }
  function y(_, q, J) {
    var K = E(_), Q = K && !Y(_);
    return (
      // ns-plain-safe
      (J ? (
        // c = flow-in
        K
      ) : K && _ !== w && _ !== L && _ !== S && _ !== G && _ !== H) && _ !== a && !(q === b && !Q) || E(q) && !Y(q) && _ === a || q === b && Q
    );
  }
  function B(_) {
    return pe(_) && _ !== f && !Y(_) && _ !== R && _ !== F && _ !== b && _ !== w && _ !== L && _ !== S && _ !== G && _ !== H && _ !== a && _ !== g && _ !== m && _ !== s && _ !== $ && _ !== D && _ !== P && _ !== v && _ !== n && _ !== p && _ !== I && _ !== z;
  }
  function N(_) {
    return !Y(_) && _ !== b;
  }
  function fe(_, q) {
    var J = _.charCodeAt(q), K;
    return J >= 55296 && J <= 56319 && q + 1 < _.length && (K = _.charCodeAt(q + 1), K >= 56320 && K <= 57343) ? (J - 55296) * 1024 + K - 56320 + 65536 : J;
  }
  function ge(_) {
    var q = /^\n* /;
    return q.test(_);
  }
  var ye = 1, Se = 2, we = 3, ze = 4, Te = 5;
  function He(_, q, J, K, Q, ae, re, le) {
    var me, _e = 0, Ie = null, Ue = !1, Pe = !1, Ht = K !== -1, nt = -1, It = B(fe(_, 0)) && N(fe(_, _.length - 1));
    if (q || re)
      for (me = 0; me < _.length; _e >= 65536 ? me += 2 : me++) {
        if (_e = fe(_, me), !pe(_e))
          return Te;
        It = It && y(_e, Ie, le), Ie = _e;
      }
    else {
      for (me = 0; me < _.length; _e >= 65536 ? me += 2 : me++) {
        if (_e = fe(_, me), _e === h)
          Ue = !0, Ht && (Pe = Pe || // Foldable line = too long, and not more-indented.
          me - nt - 1 > K && _[nt + 1] !== " ", nt = me);
        else if (!pe(_e))
          return Te;
        It = It && y(_e, Ie, le), Ie = _e;
      }
      Pe = Pe || Ht && me - nt - 1 > K && _[nt + 1] !== " ";
    }
    return !Ue && !Pe ? It && !re && !Q(_) ? ye : ae === W ? Te : Se : J > 9 && ge(_) ? Te : re ? ae === W ? Te : Se : Pe ? ze : we;
  }
  function Et(_, q, J, K, Q) {
    _.dump = (function() {
      if (q.length === 0)
        return _.quotingType === W ? '""' : "''";
      if (!_.noCompatMode && (C.indexOf(q) !== -1 || O.test(q)))
        return _.quotingType === W ? '"' + q + '"' : "'" + q + "'";
      var ae = _.indent * Math.max(1, J), re = _.lineWidth === -1 ? -1 : Math.max(Math.min(_.lineWidth, 40), _.lineWidth - ae), le = K || _.flowLevel > -1 && J >= _.flowLevel;
      function me(_e) {
        return he(_, _e);
      }
      switch (He(
        q,
        le,
        _.indent,
        re,
        me,
        _.quotingType,
        _.forceQuotes && !K,
        Q
      )) {
        case ye:
          return q;
        case Se:
          return "'" + q.replace(/'/g, "''") + "'";
        case we:
          return "|" + pt(q, _.indent) + ut(te(q, ae));
        case ze:
          return ">" + pt(q, _.indent) + ut(te(u(q, re), ae));
        case Te:
          return '"' + V(q) + '"';
        default:
          throw new i("impossible error: invalid scalar style");
      }
    })();
  }
  function pt(_, q) {
    var J = ge(_) ? String(q) : "", K = _[_.length - 1] === `
`, Q = K && (_[_.length - 2] === `
` || _ === `
`), ae = Q ? "+" : K ? "" : "-";
    return J + ae + `
`;
  }
  function ut(_) {
    return _[_.length - 1] === `
` ? _.slice(0, -1) : _;
  }
  function u(_, q) {
    for (var J = /(\n+)([^\n]*)/g, K = (function() {
      var _e = _.indexOf(`
`);
      return _e = _e !== -1 ? _e : _.length, J.lastIndex = _e, j(_.slice(0, _e), q);
    })(), Q = _[0] === `
` || _[0] === " ", ae, re; re = J.exec(_); ) {
      var le = re[1], me = re[2];
      ae = me[0] === " ", K += le + (!Q && !ae && me !== "" ? `
` : "") + j(me, q), Q = ae;
    }
    return K;
  }
  function j(_, q) {
    if (_ === "" || _[0] === " ") return _;
    for (var J = / [^ ]/g, K, Q = 0, ae, re = 0, le = 0, me = ""; K = J.exec(_); )
      le = K.index, le - Q > q && (ae = re > Q ? re : le, me += `
` + _.slice(Q, ae), Q = ae + 1), re = le;
    return me += `
`, _.length - Q > q && re > Q ? me += _.slice(Q, re) + `
` + _.slice(re + 1) : me += _.slice(Q), me.slice(1);
  }
  function V(_) {
    for (var q = "", J = 0, K, Q = 0; Q < _.length; J >= 65536 ? Q += 2 : Q++)
      J = fe(_, Q), K = U[J], !K && pe(J) ? (q += _[Q], J >= 65536 && (q += _[Q + 1])) : q += K || k(J);
    return q;
  }
  function se(_, q, J) {
    var K = "", Q = _.tag, ae, re, le;
    for (ae = 0, re = J.length; ae < re; ae += 1)
      le = J[ae], _.replacer && (le = _.replacer.call(J, String(ae), le)), (ue(_, q, le, !1, !1) || typeof le > "u" && ue(_, q, null, !1, !1)) && (K !== "" && (K += "," + (_.condenseFlow ? "" : " ")), K += _.dump);
    _.tag = Q, _.dump = "[" + K + "]";
  }
  function X(_, q, J, K) {
    var Q = "", ae = _.tag, re, le, me;
    for (re = 0, le = J.length; re < le; re += 1)
      me = J[re], _.replacer && (me = _.replacer.call(J, String(re), me)), (ue(_, q + 1, me, !0, !0, !1, !0) || typeof me > "u" && ue(_, q + 1, null, !0, !0, !1, !0)) && ((!K || Q !== "") && (Q += de(_, q)), _.dump && h === _.dump.charCodeAt(0) ? Q += "-" : Q += "- ", Q += _.dump);
    _.tag = ae, _.dump = Q || "[]";
  }
  function ne(_, q, J) {
    var K = "", Q = _.tag, ae = Object.keys(J), re, le, me, _e, Ie;
    for (re = 0, le = ae.length; re < le; re += 1)
      Ie = "", K !== "" && (Ie += ", "), _.condenseFlow && (Ie += '"'), me = ae[re], _e = J[me], _.replacer && (_e = _.replacer.call(J, me, _e)), ue(_, q, me, !1, !1) && (_.dump.length > 1024 && (Ie += "? "), Ie += _.dump + (_.condenseFlow ? '"' : "") + ":" + (_.condenseFlow ? "" : " "), ue(_, q, _e, !1, !1) && (Ie += _.dump, K += Ie));
    _.tag = Q, _.dump = "{" + K + "}";
  }
  function ee(_, q, J, K) {
    var Q = "", ae = _.tag, re = Object.keys(J), le, me, _e, Ie, Ue, Pe;
    if (_.sortKeys === !0)
      re.sort();
    else if (typeof _.sortKeys == "function")
      re.sort(_.sortKeys);
    else if (_.sortKeys)
      throw new i("sortKeys must be a boolean or a function");
    for (le = 0, me = re.length; le < me; le += 1)
      Pe = "", (!K || Q !== "") && (Pe += de(_, q)), _e = re[le], Ie = J[_e], _.replacer && (Ie = _.replacer.call(J, _e, Ie)), ue(_, q + 1, _e, !0, !0, !0) && (Ue = _.tag !== null && _.tag !== "?" || _.dump && _.dump.length > 1024, Ue && (_.dump && h === _.dump.charCodeAt(0) ? Pe += "?" : Pe += "? "), Pe += _.dump, Ue && (Pe += de(_, q)), ue(_, q + 1, Ie, !0, Ue) && (_.dump && h === _.dump.charCodeAt(0) ? Pe += ":" : Pe += ": ", Pe += _.dump, Q += Pe));
    _.tag = ae, _.dump = Q || "{}";
  }
  function oe(_, q, J) {
    var K, Q, ae, re, le, me;
    for (Q = J ? _.explicitTypes : _.implicitTypes, ae = 0, re = Q.length; ae < re; ae += 1)
      if (le = Q[ae], (le.instanceOf || le.predicate) && (!le.instanceOf || typeof q == "object" && q instanceof le.instanceOf) && (!le.predicate || le.predicate(q))) {
        if (J ? le.multi && le.representName ? _.tag = le.representName(q) : _.tag = le.tag : _.tag = "?", le.represent) {
          if (me = _.styleMap[le.tag] || le.defaultStyle, o.call(le.represent) === "[object Function]")
            K = le.represent(q, me);
          else if (d.call(le.represent, me))
            K = le.represent[me](q, me);
          else
            throw new i("!<" + le.tag + '> tag resolver accepts not "' + me + '" style');
          _.dump = K;
        }
        return !0;
      }
    return !1;
  }
  function ue(_, q, J, K, Q, ae, re) {
    _.tag = null, _.dump = J, oe(_, J, !1) || oe(_, J, !0);
    var le = o.call(_.dump), me = K, _e;
    K && (K = _.flowLevel < 0 || _.flowLevel > q);
    var Ie = le === "[object Object]" || le === "[object Array]", Ue, Pe;
    if (Ie && (Ue = _.duplicates.indexOf(J), Pe = Ue !== -1), (_.tag !== null && _.tag !== "?" || Pe || _.indent !== 2 && q > 0) && (Q = !1), Pe && _.usedDuplicates[Ue])
      _.dump = "*ref_" + Ue;
    else {
      if (Ie && Pe && !_.usedDuplicates[Ue] && (_.usedDuplicates[Ue] = !0), le === "[object Object]")
        K && Object.keys(_.dump).length !== 0 ? (ee(_, q, _.dump, Q), Pe && (_.dump = "&ref_" + Ue + _.dump)) : (ne(_, q, _.dump), Pe && (_.dump = "&ref_" + Ue + " " + _.dump));
      else if (le === "[object Array]")
        K && _.dump.length !== 0 ? (_.noArrayIndent && !re && q > 0 ? X(_, q - 1, _.dump, Q) : X(_, q, _.dump, Q), Pe && (_.dump = "&ref_" + Ue + _.dump)) : (se(_, q, _.dump), Pe && (_.dump = "&ref_" + Ue + " " + _.dump));
      else if (le === "[object String]")
        _.tag !== "?" && Et(_, _.dump, q, ae, me);
      else {
        if (le === "[object Undefined]")
          return !1;
        if (_.skipInvalid) return !1;
        throw new i("unacceptable kind of an object to dump " + le);
      }
      _.tag !== null && _.tag !== "?" && (_e = encodeURI(
        _.tag[0] === "!" ? _.tag.slice(1) : _.tag
      ).replace(/!/g, "%21"), _.tag[0] === "!" ? _e = "!" + _e : _e.slice(0, 18) === "tag:yaml.org,2002:" ? _e = "!!" + _e.slice(18) : _e = "!<" + _e + ">", _.dump = _e + " " + _.dump);
    }
    return !0;
  }
  function be(_, q) {
    var J = [], K = [], Q, ae;
    for (Ce(_, J, K), Q = 0, ae = K.length; Q < ae; Q += 1)
      q.duplicates.push(J[K[Q]]);
    q.usedDuplicates = new Array(ae);
  }
  function Ce(_, q, J) {
    var K, Q, ae;
    if (_ !== null && typeof _ == "object")
      if (Q = q.indexOf(_), Q !== -1)
        J.indexOf(Q) === -1 && J.push(Q);
      else if (q.push(_), Array.isArray(_))
        for (Q = 0, ae = _.length; Q < ae; Q += 1)
          Ce(_[Q], q, J);
      else
        for (K = Object.keys(_), Q = 0, ae = K.length; Q < ae; Q += 1)
          Ce(_[K[Q]], q, J);
  }
  function ve(_, q) {
    q = q || {};
    var J = new ie(q);
    J.noRefs || be(_, J);
    var K = _;
    return J.replacer && (K = J.replacer.call({ "": K }, "", K)), ue(J, 0, K, !0, !0) ? J.dump + `
` : "";
  }
  return Ri.dump = ve, Ri;
}
var Ao;
function bs() {
  if (Ao) return je;
  Ao = 1;
  var e = jf(), i = Hf();
  function c(o, d) {
    return function() {
      throw new Error("Function yaml." + o + " is removed in js-yaml 4. Use yaml." + d + " instead, which is now safe by default.");
    };
  }
  return je.Type = We(), je.Schema = wc(), je.FAILSAFE_SCHEMA = Rc(), je.JSON_SCHEMA = Ic(), je.CORE_SCHEMA = Oc(), je.DEFAULT_SCHEMA = Ts(), je.load = e.load, je.loadAll = e.loadAll, je.dump = i.dump, je.YAMLException = xr(), je.types = {
    binary: Fc(),
    float: Pc(),
    map: Ac(),
    null: Tc(),
    pairs: Uc(),
    set: xc(),
    timestamp: Dc(),
    bool: bc(),
    int: Cc(),
    merge: Nc(),
    omap: Lc(),
    seq: Sc(),
    str: _c()
  }, je.safeLoad = c("safeLoad", "load"), je.safeLoadAll = c("safeLoadAll", "loadAll"), je.safeDump = c("safeDump", "dump"), je;
}
var fr = {}, Ro;
function Gf() {
  if (Ro) return fr;
  Ro = 1, Object.defineProperty(fr, "__esModule", { value: !0 }), fr.Lazy = void 0;
  class e {
    constructor(c) {
      this._value = null, this.creator = c;
    }
    get hasValue() {
      return this.creator == null;
    }
    get value() {
      if (this.creator == null)
        return this._value;
      const c = this.creator();
      return this.value = c, c;
    }
    set value(c) {
      this._value = c, this.creator = null;
    }
  }
  return fr.Lazy = e, fr;
}
var en = { exports: {} }, Ti, To;
function un() {
  if (To) return Ti;
  To = 1;
  const e = "2.0.0", i = 256, c = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, o = 16, d = i - 6;
  return Ti = {
    MAX_LENGTH: i,
    MAX_SAFE_COMPONENT_LENGTH: o,
    MAX_SAFE_BUILD_LENGTH: d,
    MAX_SAFE_INTEGER: c,
    RELEASE_TYPES: [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ],
    SEMVER_SPEC_VERSION: e,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  }, Ti;
}
var bi, bo;
function fn() {
  return bo || (bo = 1, bi = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...i) => console.error("SEMVER", ...i) : () => {
  }), bi;
}
var Co;
function kr() {
  return Co || (Co = 1, (function(e, i) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: c,
      MAX_SAFE_BUILD_LENGTH: o,
      MAX_LENGTH: d
    } = un(), f = fn();
    i = e.exports = {};
    const r = i.re = [], h = i.safeRe = [], t = i.src = [], l = i.safeSrc = [], s = i.t = {};
    let n = 0;
    const a = "[a-zA-Z0-9-]", p = [
      ["\\s", 1],
      ["\\d", d],
      [a, o]
    ], g = (m) => {
      for (const [w, R] of p)
        m = m.split(`${w}*`).join(`${w}{0,${R}}`).split(`${w}+`).join(`${w}{1,${R}}`);
      return m;
    }, v = (m, w, R) => {
      const b = g(w), D = n++;
      f(m, D, w), s[m] = D, t[D] = w, l[D] = b, r[D] = new RegExp(w, R ? "g" : void 0), h[D] = new RegExp(b, R ? "g" : void 0);
    };
    v("NUMERICIDENTIFIER", "0|[1-9]\\d*"), v("NUMERICIDENTIFIERLOOSE", "\\d+"), v("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${a}*`), v("MAINVERSION", `(${t[s.NUMERICIDENTIFIER]})\\.(${t[s.NUMERICIDENTIFIER]})\\.(${t[s.NUMERICIDENTIFIER]})`), v("MAINVERSIONLOOSE", `(${t[s.NUMERICIDENTIFIERLOOSE]})\\.(${t[s.NUMERICIDENTIFIERLOOSE]})\\.(${t[s.NUMERICIDENTIFIERLOOSE]})`), v("PRERELEASEIDENTIFIER", `(?:${t[s.NONNUMERICIDENTIFIER]}|${t[s.NUMERICIDENTIFIER]})`), v("PRERELEASEIDENTIFIERLOOSE", `(?:${t[s.NONNUMERICIDENTIFIER]}|${t[s.NUMERICIDENTIFIERLOOSE]})`), v("PRERELEASE", `(?:-(${t[s.PRERELEASEIDENTIFIER]}(?:\\.${t[s.PRERELEASEIDENTIFIER]})*))`), v("PRERELEASELOOSE", `(?:-?(${t[s.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${t[s.PRERELEASEIDENTIFIERLOOSE]})*))`), v("BUILDIDENTIFIER", `${a}+`), v("BUILD", `(?:\\+(${t[s.BUILDIDENTIFIER]}(?:\\.${t[s.BUILDIDENTIFIER]})*))`), v("FULLPLAIN", `v?${t[s.MAINVERSION]}${t[s.PRERELEASE]}?${t[s.BUILD]}?`), v("FULL", `^${t[s.FULLPLAIN]}$`), v("LOOSEPLAIN", `[v=\\s]*${t[s.MAINVERSIONLOOSE]}${t[s.PRERELEASELOOSE]}?${t[s.BUILD]}?`), v("LOOSE", `^${t[s.LOOSEPLAIN]}$`), v("GTLT", "((?:<|>)?=?)"), v("XRANGEIDENTIFIERLOOSE", `${t[s.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), v("XRANGEIDENTIFIER", `${t[s.NUMERICIDENTIFIER]}|x|X|\\*`), v("XRANGEPLAIN", `[v=\\s]*(${t[s.XRANGEIDENTIFIER]})(?:\\.(${t[s.XRANGEIDENTIFIER]})(?:\\.(${t[s.XRANGEIDENTIFIER]})(?:${t[s.PRERELEASE]})?${t[s.BUILD]}?)?)?`), v("XRANGEPLAINLOOSE", `[v=\\s]*(${t[s.XRANGEIDENTIFIERLOOSE]})(?:\\.(${t[s.XRANGEIDENTIFIERLOOSE]})(?:\\.(${t[s.XRANGEIDENTIFIERLOOSE]})(?:${t[s.PRERELEASELOOSE]})?${t[s.BUILD]}?)?)?`), v("XRANGE", `^${t[s.GTLT]}\\s*${t[s.XRANGEPLAIN]}$`), v("XRANGELOOSE", `^${t[s.GTLT]}\\s*${t[s.XRANGEPLAINLOOSE]}$`), v("COERCEPLAIN", `(^|[^\\d])(\\d{1,${c}})(?:\\.(\\d{1,${c}}))?(?:\\.(\\d{1,${c}}))?`), v("COERCE", `${t[s.COERCEPLAIN]}(?:$|[^\\d])`), v("COERCEFULL", t[s.COERCEPLAIN] + `(?:${t[s.PRERELEASE]})?(?:${t[s.BUILD]})?(?:$|[^\\d])`), v("COERCERTL", t[s.COERCE], !0), v("COERCERTLFULL", t[s.COERCEFULL], !0), v("LONETILDE", "(?:~>?)"), v("TILDETRIM", `(\\s*)${t[s.LONETILDE]}\\s+`, !0), i.tildeTrimReplace = "$1~", v("TILDE", `^${t[s.LONETILDE]}${t[s.XRANGEPLAIN]}$`), v("TILDELOOSE", `^${t[s.LONETILDE]}${t[s.XRANGEPLAINLOOSE]}$`), v("LONECARET", "(?:\\^)"), v("CARETTRIM", `(\\s*)${t[s.LONECARET]}\\s+`, !0), i.caretTrimReplace = "$1^", v("CARET", `^${t[s.LONECARET]}${t[s.XRANGEPLAIN]}$`), v("CARETLOOSE", `^${t[s.LONECARET]}${t[s.XRANGEPLAINLOOSE]}$`), v("COMPARATORLOOSE", `^${t[s.GTLT]}\\s*(${t[s.LOOSEPLAIN]})$|^$`), v("COMPARATOR", `^${t[s.GTLT]}\\s*(${t[s.FULLPLAIN]})$|^$`), v("COMPARATORTRIM", `(\\s*)${t[s.GTLT]}\\s*(${t[s.LOOSEPLAIN]}|${t[s.XRANGEPLAIN]})`, !0), i.comparatorTrimReplace = "$1$2$3", v("HYPHENRANGE", `^\\s*(${t[s.XRANGEPLAIN]})\\s+-\\s+(${t[s.XRANGEPLAIN]})\\s*$`), v("HYPHENRANGELOOSE", `^\\s*(${t[s.XRANGEPLAINLOOSE]})\\s+-\\s+(${t[s.XRANGEPLAINLOOSE]})\\s*$`), v("STAR", "(<|>)?=?\\s*\\*"), v("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), v("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(en, en.exports)), en.exports;
}
var Ci, Po;
function Cs() {
  if (Po) return Ci;
  Po = 1;
  const e = Object.freeze({ loose: !0 }), i = Object.freeze({});
  return Ci = (o) => o ? typeof o != "object" ? e : o : i, Ci;
}
var Pi, Io;
function kc() {
  if (Io) return Pi;
  Io = 1;
  const e = /^[0-9]+$/, i = (o, d) => {
    if (typeof o == "number" && typeof d == "number")
      return o === d ? 0 : o < d ? -1 : 1;
    const f = e.test(o), r = e.test(d);
    return f && r && (o = +o, d = +d), o === d ? 0 : f && !r ? -1 : r && !f ? 1 : o < d ? -1 : 1;
  };
  return Pi = {
    compareIdentifiers: i,
    rcompareIdentifiers: (o, d) => i(d, o)
  }, Pi;
}
var Ii, Oo;
function Ve() {
  if (Oo) return Ii;
  Oo = 1;
  const e = fn(), { MAX_LENGTH: i, MAX_SAFE_INTEGER: c } = un(), { safeRe: o, t: d } = kr(), f = Cs(), { compareIdentifiers: r } = kc();
  class h {
    constructor(l, s) {
      if (s = f(s), l instanceof h) {
        if (l.loose === !!s.loose && l.includePrerelease === !!s.includePrerelease)
          return l;
        l = l.version;
      } else if (typeof l != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof l}".`);
      if (l.length > i)
        throw new TypeError(
          `version is longer than ${i} characters`
        );
      e("SemVer", l, s), this.options = s, this.loose = !!s.loose, this.includePrerelease = !!s.includePrerelease;
      const n = l.trim().match(s.loose ? o[d.LOOSE] : o[d.FULL]);
      if (!n)
        throw new TypeError(`Invalid Version: ${l}`);
      if (this.raw = l, this.major = +n[1], this.minor = +n[2], this.patch = +n[3], this.major > c || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > c || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > c || this.patch < 0)
        throw new TypeError("Invalid patch version");
      n[4] ? this.prerelease = n[4].split(".").map((a) => {
        if (/^[0-9]+$/.test(a)) {
          const p = +a;
          if (p >= 0 && p < c)
            return p;
        }
        return a;
      }) : this.prerelease = [], this.build = n[5] ? n[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(l) {
      if (e("SemVer.compare", this.version, this.options, l), !(l instanceof h)) {
        if (typeof l == "string" && l === this.version)
          return 0;
        l = new h(l, this.options);
      }
      return l.version === this.version ? 0 : this.compareMain(l) || this.comparePre(l);
    }
    compareMain(l) {
      return l instanceof h || (l = new h(l, this.options)), this.major < l.major ? -1 : this.major > l.major ? 1 : this.minor < l.minor ? -1 : this.minor > l.minor ? 1 : this.patch < l.patch ? -1 : this.patch > l.patch ? 1 : 0;
    }
    comparePre(l) {
      if (l instanceof h || (l = new h(l, this.options)), this.prerelease.length && !l.prerelease.length)
        return -1;
      if (!this.prerelease.length && l.prerelease.length)
        return 1;
      if (!this.prerelease.length && !l.prerelease.length)
        return 0;
      let s = 0;
      do {
        const n = this.prerelease[s], a = l.prerelease[s];
        if (e("prerelease compare", s, n, a), n === void 0 && a === void 0)
          return 0;
        if (a === void 0)
          return 1;
        if (n === void 0)
          return -1;
        if (n === a)
          continue;
        return r(n, a);
      } while (++s);
    }
    compareBuild(l) {
      l instanceof h || (l = new h(l, this.options));
      let s = 0;
      do {
        const n = this.build[s], a = l.build[s];
        if (e("build compare", s, n, a), n === void 0 && a === void 0)
          return 0;
        if (a === void 0)
          return 1;
        if (n === void 0)
          return -1;
        if (n === a)
          continue;
        return r(n, a);
      } while (++s);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(l, s, n) {
      if (l.startsWith("pre")) {
        if (!s && n === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (s) {
          const a = `-${s}`.match(this.options.loose ? o[d.PRERELEASELOOSE] : o[d.PRERELEASE]);
          if (!a || a[1] !== s)
            throw new Error(`invalid identifier: ${s}`);
        }
      }
      switch (l) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", s, n);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", s, n);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", s, n), this.inc("pre", s, n);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", s, n), this.inc("pre", s, n);
          break;
        case "release":
          if (this.prerelease.length === 0)
            throw new Error(`version ${this.raw} is not a prerelease`);
          this.prerelease.length = 0;
          break;
        case "major":
          (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
          break;
        case "minor":
          (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
          break;
        case "patch":
          this.prerelease.length === 0 && this.patch++, this.prerelease = [];
          break;
        // This probably shouldn't be used publicly.
        // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
        case "pre": {
          const a = Number(n) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [a];
          else {
            let p = this.prerelease.length;
            for (; --p >= 0; )
              typeof this.prerelease[p] == "number" && (this.prerelease[p]++, p = -2);
            if (p === -1) {
              if (s === this.prerelease.join(".") && n === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(a);
            }
          }
          if (s) {
            let p = [s, a];
            n === !1 && (p = [s]), r(this.prerelease[0], s) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = p) : this.prerelease = p;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${l}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return Ii = h, Ii;
}
var Oi, Do;
function sr() {
  if (Do) return Oi;
  Do = 1;
  const e = Ve();
  return Oi = (c, o, d = !1) => {
    if (c instanceof e)
      return c;
    try {
      return new e(c, o);
    } catch (f) {
      if (!d)
        return null;
      throw f;
    }
  }, Oi;
}
var Di, No;
function Wf() {
  if (No) return Di;
  No = 1;
  const e = sr();
  return Di = (c, o) => {
    const d = e(c, o);
    return d ? d.version : null;
  }, Di;
}
var Ni, Fo;
function Vf() {
  if (Fo) return Ni;
  Fo = 1;
  const e = sr();
  return Ni = (c, o) => {
    const d = e(c.trim().replace(/^[=v]+/, ""), o);
    return d ? d.version : null;
  }, Ni;
}
var Fi, Lo;
function zf() {
  if (Lo) return Fi;
  Lo = 1;
  const e = Ve();
  return Fi = (c, o, d, f, r) => {
    typeof d == "string" && (r = f, f = d, d = void 0);
    try {
      return new e(
        c instanceof e ? c.version : c,
        d
      ).inc(o, f, r).version;
    } catch {
      return null;
    }
  }, Fi;
}
var Li, Uo;
function Yf() {
  if (Uo) return Li;
  Uo = 1;
  const e = sr();
  return Li = (c, o) => {
    const d = e(c, null, !0), f = e(o, null, !0), r = d.compare(f);
    if (r === 0)
      return null;
    const h = r > 0, t = h ? d : f, l = h ? f : d, s = !!t.prerelease.length;
    if (!!l.prerelease.length && !s) {
      if (!l.patch && !l.minor)
        return "major";
      if (l.compareMain(t) === 0)
        return l.minor && !l.patch ? "minor" : "patch";
    }
    const a = s ? "pre" : "";
    return d.major !== f.major ? a + "major" : d.minor !== f.minor ? a + "minor" : d.patch !== f.patch ? a + "patch" : "prerelease";
  }, Li;
}
var Ui, xo;
function Xf() {
  if (xo) return Ui;
  xo = 1;
  const e = Ve();
  return Ui = (c, o) => new e(c, o).major, Ui;
}
var xi, ko;
function Jf() {
  if (ko) return xi;
  ko = 1;
  const e = Ve();
  return xi = (c, o) => new e(c, o).minor, xi;
}
var ki, $o;
function Kf() {
  if ($o) return ki;
  $o = 1;
  const e = Ve();
  return ki = (c, o) => new e(c, o).patch, ki;
}
var $i, qo;
function Qf() {
  if (qo) return $i;
  qo = 1;
  const e = sr();
  return $i = (c, o) => {
    const d = e(c, o);
    return d && d.prerelease.length ? d.prerelease : null;
  }, $i;
}
var qi, Mo;
function lt() {
  if (Mo) return qi;
  Mo = 1;
  const e = Ve();
  return qi = (c, o, d) => new e(c, d).compare(new e(o, d)), qi;
}
var Mi, Bo;
function Zf() {
  if (Bo) return Mi;
  Bo = 1;
  const e = lt();
  return Mi = (c, o, d) => e(o, c, d), Mi;
}
var Bi, jo;
function ed() {
  if (jo) return Bi;
  jo = 1;
  const e = lt();
  return Bi = (c, o) => e(c, o, !0), Bi;
}
var ji, Ho;
function Ps() {
  if (Ho) return ji;
  Ho = 1;
  const e = Ve();
  return ji = (c, o, d) => {
    const f = new e(c, d), r = new e(o, d);
    return f.compare(r) || f.compareBuild(r);
  }, ji;
}
var Hi, Go;
function td() {
  if (Go) return Hi;
  Go = 1;
  const e = Ps();
  return Hi = (c, o) => c.sort((d, f) => e(d, f, o)), Hi;
}
var Gi, Wo;
function rd() {
  if (Wo) return Gi;
  Wo = 1;
  const e = Ps();
  return Gi = (c, o) => c.sort((d, f) => e(f, d, o)), Gi;
}
var Wi, Vo;
function dn() {
  if (Vo) return Wi;
  Vo = 1;
  const e = lt();
  return Wi = (c, o, d) => e(c, o, d) > 0, Wi;
}
var Vi, zo;
function Is() {
  if (zo) return Vi;
  zo = 1;
  const e = lt();
  return Vi = (c, o, d) => e(c, o, d) < 0, Vi;
}
var zi, Yo;
function $c() {
  if (Yo) return zi;
  Yo = 1;
  const e = lt();
  return zi = (c, o, d) => e(c, o, d) === 0, zi;
}
var Yi, Xo;
function qc() {
  if (Xo) return Yi;
  Xo = 1;
  const e = lt();
  return Yi = (c, o, d) => e(c, o, d) !== 0, Yi;
}
var Xi, Jo;
function Os() {
  if (Jo) return Xi;
  Jo = 1;
  const e = lt();
  return Xi = (c, o, d) => e(c, o, d) >= 0, Xi;
}
var Ji, Ko;
function Ds() {
  if (Ko) return Ji;
  Ko = 1;
  const e = lt();
  return Ji = (c, o, d) => e(c, o, d) <= 0, Ji;
}
var Ki, Qo;
function Mc() {
  if (Qo) return Ki;
  Qo = 1;
  const e = $c(), i = qc(), c = dn(), o = Os(), d = Is(), f = Ds();
  return Ki = (h, t, l, s) => {
    switch (t) {
      case "===":
        return typeof h == "object" && (h = h.version), typeof l == "object" && (l = l.version), h === l;
      case "!==":
        return typeof h == "object" && (h = h.version), typeof l == "object" && (l = l.version), h !== l;
      case "":
      case "=":
      case "==":
        return e(h, l, s);
      case "!=":
        return i(h, l, s);
      case ">":
        return c(h, l, s);
      case ">=":
        return o(h, l, s);
      case "<":
        return d(h, l, s);
      case "<=":
        return f(h, l, s);
      default:
        throw new TypeError(`Invalid operator: ${t}`);
    }
  }, Ki;
}
var Qi, Zo;
function nd() {
  if (Zo) return Qi;
  Zo = 1;
  const e = Ve(), i = sr(), { safeRe: c, t: o } = kr();
  return Qi = (f, r) => {
    if (f instanceof e)
      return f;
    if (typeof f == "number" && (f = String(f)), typeof f != "string")
      return null;
    r = r || {};
    let h = null;
    if (!r.rtl)
      h = f.match(r.includePrerelease ? c[o.COERCEFULL] : c[o.COERCE]);
    else {
      const p = r.includePrerelease ? c[o.COERCERTLFULL] : c[o.COERCERTL];
      let g;
      for (; (g = p.exec(f)) && (!h || h.index + h[0].length !== f.length); )
        (!h || g.index + g[0].length !== h.index + h[0].length) && (h = g), p.lastIndex = g.index + g[1].length + g[2].length;
      p.lastIndex = -1;
    }
    if (h === null)
      return null;
    const t = h[2], l = h[3] || "0", s = h[4] || "0", n = r.includePrerelease && h[5] ? `-${h[5]}` : "", a = r.includePrerelease && h[6] ? `+${h[6]}` : "";
    return i(`${t}.${l}.${s}${n}${a}`, r);
  }, Qi;
}
var Zi, el;
function id() {
  if (el) return Zi;
  el = 1;
  class e {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(c) {
      const o = this.map.get(c);
      if (o !== void 0)
        return this.map.delete(c), this.map.set(c, o), o;
    }
    delete(c) {
      return this.map.delete(c);
    }
    set(c, o) {
      if (!this.delete(c) && o !== void 0) {
        if (this.map.size >= this.max) {
          const f = this.map.keys().next().value;
          this.delete(f);
        }
        this.map.set(c, o);
      }
      return this;
    }
  }
  return Zi = e, Zi;
}
var es, tl;
function ct() {
  if (tl) return es;
  tl = 1;
  const e = /\s+/g;
  class i {
    constructor(C, O) {
      if (O = d(O), C instanceof i)
        return C.loose === !!O.loose && C.includePrerelease === !!O.includePrerelease ? C : new i(C.raw, O);
      if (C instanceof f)
        return this.raw = C.value, this.set = [[C]], this.formatted = void 0, this;
      if (this.options = O, this.loose = !!O.loose, this.includePrerelease = !!O.includePrerelease, this.raw = C.trim().replace(e, " "), this.set = this.raw.split("||").map((A) => this.parseRange(A.trim())).filter((A) => A.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const A = this.set[0];
        if (this.set = this.set.filter((k) => !v(k[0])), this.set.length === 0)
          this.set = [A];
        else if (this.set.length > 1) {
          for (const k of this.set)
            if (k.length === 1 && m(k[0])) {
              this.set = [k];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let C = 0; C < this.set.length; C++) {
          C > 0 && (this.formatted += "||");
          const O = this.set[C];
          for (let A = 0; A < O.length; A++)
            A > 0 && (this.formatted += " "), this.formatted += O[A].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(C) {
      const A = ((this.options.includePrerelease && p) | (this.options.loose && g)) + ":" + C, k = o.get(A);
      if (k)
        return k;
      const M = this.options.loose, W = M ? t[l.HYPHENRANGELOOSE] : t[l.HYPHENRANGE];
      C = C.replace(W, $(this.options.includePrerelease)), r("hyphen replace", C), C = C.replace(t[l.COMPARATORTRIM], s), r("comparator trim", C), C = C.replace(t[l.TILDETRIM], n), r("tilde trim", C), C = C.replace(t[l.CARETTRIM], a), r("caret trim", C);
      let ie = C.split(" ").map((Y) => R(Y, this.options)).join(" ").split(/\s+/).map((Y) => G(Y, this.options));
      M && (ie = ie.filter((Y) => (r("loose invalid filter", Y, this.options), !!Y.match(t[l.COMPARATORLOOSE])))), r("range list", ie);
      const te = /* @__PURE__ */ new Map(), de = ie.map((Y) => new f(Y, this.options));
      for (const Y of de) {
        if (v(Y))
          return [Y];
        te.set(Y.value, Y);
      }
      te.size > 1 && te.has("") && te.delete("");
      const he = [...te.values()];
      return o.set(A, he), he;
    }
    intersects(C, O) {
      if (!(C instanceof i))
        throw new TypeError("a Range is required");
      return this.set.some((A) => w(A, O) && C.set.some((k) => w(k, O) && A.every((M) => k.every((W) => M.intersects(W, O)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(C) {
      if (!C)
        return !1;
      if (typeof C == "string")
        try {
          C = new h(C, this.options);
        } catch {
          return !1;
        }
      for (let O = 0; O < this.set.length; O++)
        if (H(this.set[O], C, this.options))
          return !0;
      return !1;
    }
  }
  es = i;
  const c = id(), o = new c(), d = Cs(), f = hn(), r = fn(), h = Ve(), {
    safeRe: t,
    t: l,
    comparatorTrimReplace: s,
    tildeTrimReplace: n,
    caretTrimReplace: a
  } = kr(), { FLAG_INCLUDE_PRERELEASE: p, FLAG_LOOSE: g } = un(), v = (U) => U.value === "<0.0.0-0", m = (U) => U.value === "", w = (U, C) => {
    let O = !0;
    const A = U.slice();
    let k = A.pop();
    for (; O && A.length; )
      O = A.every((M) => k.intersects(M, C)), k = A.pop();
    return O;
  }, R = (U, C) => (U = U.replace(t[l.BUILD], ""), r("comp", U, C), U = F(U, C), r("caret", U), U = D(U, C), r("tildes", U), U = L(U, C), r("xrange", U), U = z(U, C), r("stars", U), U), b = (U) => !U || U.toLowerCase() === "x" || U === "*", D = (U, C) => U.trim().split(/\s+/).map((O) => P(O, C)).join(" "), P = (U, C) => {
    const O = C.loose ? t[l.TILDELOOSE] : t[l.TILDE];
    return U.replace(O, (A, k, M, W, ie) => {
      r("tilde", U, A, k, M, W, ie);
      let te;
      return b(k) ? te = "" : b(M) ? te = `>=${k}.0.0 <${+k + 1}.0.0-0` : b(W) ? te = `>=${k}.${M}.0 <${k}.${+M + 1}.0-0` : ie ? (r("replaceTilde pr", ie), te = `>=${k}.${M}.${W}-${ie} <${k}.${+M + 1}.0-0`) : te = `>=${k}.${M}.${W} <${k}.${+M + 1}.0-0`, r("tilde return", te), te;
    });
  }, F = (U, C) => U.trim().split(/\s+/).map((O) => I(O, C)).join(" "), I = (U, C) => {
    r("caret", U, C);
    const O = C.loose ? t[l.CARETLOOSE] : t[l.CARET], A = C.includePrerelease ? "-0" : "";
    return U.replace(O, (k, M, W, ie, te) => {
      r("caret", U, k, M, W, ie, te);
      let de;
      return b(M) ? de = "" : b(W) ? de = `>=${M}.0.0${A} <${+M + 1}.0.0-0` : b(ie) ? M === "0" ? de = `>=${M}.${W}.0${A} <${M}.${+W + 1}.0-0` : de = `>=${M}.${W}.0${A} <${+M + 1}.0.0-0` : te ? (r("replaceCaret pr", te), M === "0" ? W === "0" ? de = `>=${M}.${W}.${ie}-${te} <${M}.${W}.${+ie + 1}-0` : de = `>=${M}.${W}.${ie}-${te} <${M}.${+W + 1}.0-0` : de = `>=${M}.${W}.${ie}-${te} <${+M + 1}.0.0-0`) : (r("no pr"), M === "0" ? W === "0" ? de = `>=${M}.${W}.${ie}${A} <${M}.${W}.${+ie + 1}-0` : de = `>=${M}.${W}.${ie}${A} <${M}.${+W + 1}.0-0` : de = `>=${M}.${W}.${ie} <${+M + 1}.0.0-0`), r("caret return", de), de;
    });
  }, L = (U, C) => (r("replaceXRanges", U, C), U.split(/\s+/).map((O) => S(O, C)).join(" ")), S = (U, C) => {
    U = U.trim();
    const O = C.loose ? t[l.XRANGELOOSE] : t[l.XRANGE];
    return U.replace(O, (A, k, M, W, ie, te) => {
      r("xRange", U, A, k, M, W, ie, te);
      const de = b(M), he = de || b(W), Y = he || b(ie), pe = Y;
      return k === "=" && pe && (k = ""), te = C.includePrerelease ? "-0" : "", de ? k === ">" || k === "<" ? A = "<0.0.0-0" : A = "*" : k && pe ? (he && (W = 0), ie = 0, k === ">" ? (k = ">=", he ? (M = +M + 1, W = 0, ie = 0) : (W = +W + 1, ie = 0)) : k === "<=" && (k = "<", he ? M = +M + 1 : W = +W + 1), k === "<" && (te = "-0"), A = `${k + M}.${W}.${ie}${te}`) : he ? A = `>=${M}.0.0${te} <${+M + 1}.0.0-0` : Y && (A = `>=${M}.${W}.0${te} <${M}.${+W + 1}.0-0`), r("xRange return", A), A;
    });
  }, z = (U, C) => (r("replaceStars", U, C), U.trim().replace(t[l.STAR], "")), G = (U, C) => (r("replaceGTE0", U, C), U.trim().replace(t[C.includePrerelease ? l.GTE0PRE : l.GTE0], "")), $ = (U) => (C, O, A, k, M, W, ie, te, de, he, Y, pe) => (b(A) ? O = "" : b(k) ? O = `>=${A}.0.0${U ? "-0" : ""}` : b(M) ? O = `>=${A}.${k}.0${U ? "-0" : ""}` : W ? O = `>=${O}` : O = `>=${O}${U ? "-0" : ""}`, b(de) ? te = "" : b(he) ? te = `<${+de + 1}.0.0-0` : b(Y) ? te = `<${de}.${+he + 1}.0-0` : pe ? te = `<=${de}.${he}.${Y}-${pe}` : U ? te = `<${de}.${he}.${+Y + 1}-0` : te = `<=${te}`, `${O} ${te}`.trim()), H = (U, C, O) => {
    for (let A = 0; A < U.length; A++)
      if (!U[A].test(C))
        return !1;
    if (C.prerelease.length && !O.includePrerelease) {
      for (let A = 0; A < U.length; A++)
        if (r(U[A].semver), U[A].semver !== f.ANY && U[A].semver.prerelease.length > 0) {
          const k = U[A].semver;
          if (k.major === C.major && k.minor === C.minor && k.patch === C.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return es;
}
var ts, rl;
function hn() {
  if (rl) return ts;
  rl = 1;
  const e = /* @__PURE__ */ Symbol("SemVer ANY");
  class i {
    static get ANY() {
      return e;
    }
    constructor(s, n) {
      if (n = c(n), s instanceof i) {
        if (s.loose === !!n.loose)
          return s;
        s = s.value;
      }
      s = s.trim().split(/\s+/).join(" "), r("comparator", s, n), this.options = n, this.loose = !!n.loose, this.parse(s), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, r("comp", this);
    }
    parse(s) {
      const n = this.options.loose ? o[d.COMPARATORLOOSE] : o[d.COMPARATOR], a = s.match(n);
      if (!a)
        throw new TypeError(`Invalid comparator: ${s}`);
      this.operator = a[1] !== void 0 ? a[1] : "", this.operator === "=" && (this.operator = ""), a[2] ? this.semver = new h(a[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(s) {
      if (r("Comparator.test", s, this.options.loose), this.semver === e || s === e)
        return !0;
      if (typeof s == "string")
        try {
          s = new h(s, this.options);
        } catch {
          return !1;
        }
      return f(s, this.operator, this.semver, this.options);
    }
    intersects(s, n) {
      if (!(s instanceof i))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new t(s.value, n).test(this.value) : s.operator === "" ? s.value === "" ? !0 : new t(this.value, n).test(s.semver) : (n = c(n), n.includePrerelease && (this.value === "<0.0.0-0" || s.value === "<0.0.0-0") || !n.includePrerelease && (this.value.startsWith("<0.0.0") || s.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && s.operator.startsWith(">") || this.operator.startsWith("<") && s.operator.startsWith("<") || this.semver.version === s.semver.version && this.operator.includes("=") && s.operator.includes("=") || f(this.semver, "<", s.semver, n) && this.operator.startsWith(">") && s.operator.startsWith("<") || f(this.semver, ">", s.semver, n) && this.operator.startsWith("<") && s.operator.startsWith(">")));
    }
  }
  ts = i;
  const c = Cs(), { safeRe: o, t: d } = kr(), f = Mc(), r = fn(), h = Ve(), t = ct();
  return ts;
}
var rs, nl;
function pn() {
  if (nl) return rs;
  nl = 1;
  const e = ct();
  return rs = (c, o, d) => {
    try {
      o = new e(o, d);
    } catch {
      return !1;
    }
    return o.test(c);
  }, rs;
}
var ns, il;
function sd() {
  if (il) return ns;
  il = 1;
  const e = ct();
  return ns = (c, o) => new e(c, o).set.map((d) => d.map((f) => f.value).join(" ").trim().split(" ")), ns;
}
var is, sl;
function ad() {
  if (sl) return is;
  sl = 1;
  const e = Ve(), i = ct();
  return is = (o, d, f) => {
    let r = null, h = null, t = null;
    try {
      t = new i(d, f);
    } catch {
      return null;
    }
    return o.forEach((l) => {
      t.test(l) && (!r || h.compare(l) === -1) && (r = l, h = new e(r, f));
    }), r;
  }, is;
}
var ss, al;
function od() {
  if (al) return ss;
  al = 1;
  const e = Ve(), i = ct();
  return ss = (o, d, f) => {
    let r = null, h = null, t = null;
    try {
      t = new i(d, f);
    } catch {
      return null;
    }
    return o.forEach((l) => {
      t.test(l) && (!r || h.compare(l) === 1) && (r = l, h = new e(r, f));
    }), r;
  }, ss;
}
var as, ol;
function ld() {
  if (ol) return as;
  ol = 1;
  const e = Ve(), i = ct(), c = dn();
  return as = (d, f) => {
    d = new i(d, f);
    let r = new e("0.0.0");
    if (d.test(r) || (r = new e("0.0.0-0"), d.test(r)))
      return r;
    r = null;
    for (let h = 0; h < d.set.length; ++h) {
      const t = d.set[h];
      let l = null;
      t.forEach((s) => {
        const n = new e(s.semver.version);
        switch (s.operator) {
          case ">":
            n.prerelease.length === 0 ? n.patch++ : n.prerelease.push(0), n.raw = n.format();
          /* fallthrough */
          case "":
          case ">=":
            (!l || c(n, l)) && (l = n);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${s.operator}`);
        }
      }), l && (!r || c(r, l)) && (r = l);
    }
    return r && d.test(r) ? r : null;
  }, as;
}
var os, ll;
function cd() {
  if (ll) return os;
  ll = 1;
  const e = ct();
  return os = (c, o) => {
    try {
      return new e(c, o).range || "*";
    } catch {
      return null;
    }
  }, os;
}
var ls, cl;
function Ns() {
  if (cl) return ls;
  cl = 1;
  const e = Ve(), i = hn(), { ANY: c } = i, o = ct(), d = pn(), f = dn(), r = Is(), h = Ds(), t = Os();
  return ls = (s, n, a, p) => {
    s = new e(s, p), n = new o(n, p);
    let g, v, m, w, R;
    switch (a) {
      case ">":
        g = f, v = h, m = r, w = ">", R = ">=";
        break;
      case "<":
        g = r, v = t, m = f, w = "<", R = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (d(s, n, p))
      return !1;
    for (let b = 0; b < n.set.length; ++b) {
      const D = n.set[b];
      let P = null, F = null;
      if (D.forEach((I) => {
        I.semver === c && (I = new i(">=0.0.0")), P = P || I, F = F || I, g(I.semver, P.semver, p) ? P = I : m(I.semver, F.semver, p) && (F = I);
      }), P.operator === w || P.operator === R || (!F.operator || F.operator === w) && v(s, F.semver))
        return !1;
      if (F.operator === R && m(s, F.semver))
        return !1;
    }
    return !0;
  }, ls;
}
var cs, ul;
function ud() {
  if (ul) return cs;
  ul = 1;
  const e = Ns();
  return cs = (c, o, d) => e(c, o, ">", d), cs;
}
var us, fl;
function fd() {
  if (fl) return us;
  fl = 1;
  const e = Ns();
  return us = (c, o, d) => e(c, o, "<", d), us;
}
var fs, dl;
function dd() {
  if (dl) return fs;
  dl = 1;
  const e = ct();
  return fs = (c, o, d) => (c = new e(c, d), o = new e(o, d), c.intersects(o, d)), fs;
}
var ds, hl;
function hd() {
  if (hl) return ds;
  hl = 1;
  const e = pn(), i = lt();
  return ds = (c, o, d) => {
    const f = [];
    let r = null, h = null;
    const t = c.sort((a, p) => i(a, p, d));
    for (const a of t)
      e(a, o, d) ? (h = a, r || (r = a)) : (h && f.push([r, h]), h = null, r = null);
    r && f.push([r, null]);
    const l = [];
    for (const [a, p] of f)
      a === p ? l.push(a) : !p && a === t[0] ? l.push("*") : p ? a === t[0] ? l.push(`<=${p}`) : l.push(`${a} - ${p}`) : l.push(`>=${a}`);
    const s = l.join(" || "), n = typeof o.raw == "string" ? o.raw : String(o);
    return s.length < n.length ? s : o;
  }, ds;
}
var hs, pl;
function pd() {
  if (pl) return hs;
  pl = 1;
  const e = ct(), i = hn(), { ANY: c } = i, o = pn(), d = lt(), f = (n, a, p = {}) => {
    if (n === a)
      return !0;
    n = new e(n, p), a = new e(a, p);
    let g = !1;
    e: for (const v of n.set) {
      for (const m of a.set) {
        const w = t(v, m, p);
        if (g = g || w !== null, w)
          continue e;
      }
      if (g)
        return !1;
    }
    return !0;
  }, r = [new i(">=0.0.0-0")], h = [new i(">=0.0.0")], t = (n, a, p) => {
    if (n === a)
      return !0;
    if (n.length === 1 && n[0].semver === c) {
      if (a.length === 1 && a[0].semver === c)
        return !0;
      p.includePrerelease ? n = r : n = h;
    }
    if (a.length === 1 && a[0].semver === c) {
      if (p.includePrerelease)
        return !0;
      a = h;
    }
    const g = /* @__PURE__ */ new Set();
    let v, m;
    for (const L of n)
      L.operator === ">" || L.operator === ">=" ? v = l(v, L, p) : L.operator === "<" || L.operator === "<=" ? m = s(m, L, p) : g.add(L.semver);
    if (g.size > 1)
      return null;
    let w;
    if (v && m) {
      if (w = d(v.semver, m.semver, p), w > 0)
        return null;
      if (w === 0 && (v.operator !== ">=" || m.operator !== "<="))
        return null;
    }
    for (const L of g) {
      if (v && !o(L, String(v), p) || m && !o(L, String(m), p))
        return null;
      for (const S of a)
        if (!o(L, String(S), p))
          return !1;
      return !0;
    }
    let R, b, D, P, F = m && !p.includePrerelease && m.semver.prerelease.length ? m.semver : !1, I = v && !p.includePrerelease && v.semver.prerelease.length ? v.semver : !1;
    F && F.prerelease.length === 1 && m.operator === "<" && F.prerelease[0] === 0 && (F = !1);
    for (const L of a) {
      if (P = P || L.operator === ">" || L.operator === ">=", D = D || L.operator === "<" || L.operator === "<=", v) {
        if (I && L.semver.prerelease && L.semver.prerelease.length && L.semver.major === I.major && L.semver.minor === I.minor && L.semver.patch === I.patch && (I = !1), L.operator === ">" || L.operator === ">=") {
          if (R = l(v, L, p), R === L && R !== v)
            return !1;
        } else if (v.operator === ">=" && !o(v.semver, String(L), p))
          return !1;
      }
      if (m) {
        if (F && L.semver.prerelease && L.semver.prerelease.length && L.semver.major === F.major && L.semver.minor === F.minor && L.semver.patch === F.patch && (F = !1), L.operator === "<" || L.operator === "<=") {
          if (b = s(m, L, p), b === L && b !== m)
            return !1;
        } else if (m.operator === "<=" && !o(m.semver, String(L), p))
          return !1;
      }
      if (!L.operator && (m || v) && w !== 0)
        return !1;
    }
    return !(v && D && !m && w !== 0 || m && P && !v && w !== 0 || I || F);
  }, l = (n, a, p) => {
    if (!n)
      return a;
    const g = d(n.semver, a.semver, p);
    return g > 0 ? n : g < 0 || a.operator === ">" && n.operator === ">=" ? a : n;
  }, s = (n, a, p) => {
    if (!n)
      return a;
    const g = d(n.semver, a.semver, p);
    return g < 0 ? n : g > 0 || a.operator === "<" && n.operator === "<=" ? a : n;
  };
  return hs = f, hs;
}
var ps, ml;
function Bc() {
  if (ml) return ps;
  ml = 1;
  const e = kr(), i = un(), c = Ve(), o = kc(), d = sr(), f = Wf(), r = Vf(), h = zf(), t = Yf(), l = Xf(), s = Jf(), n = Kf(), a = Qf(), p = lt(), g = Zf(), v = ed(), m = Ps(), w = td(), R = rd(), b = dn(), D = Is(), P = $c(), F = qc(), I = Os(), L = Ds(), S = Mc(), z = nd(), G = hn(), $ = ct(), H = pn(), U = sd(), C = ad(), O = od(), A = ld(), k = cd(), M = Ns(), W = ud(), ie = fd(), te = dd(), de = hd(), he = pd();
  return ps = {
    parse: d,
    valid: f,
    clean: r,
    inc: h,
    diff: t,
    major: l,
    minor: s,
    patch: n,
    prerelease: a,
    compare: p,
    rcompare: g,
    compareLoose: v,
    compareBuild: m,
    sort: w,
    rsort: R,
    gt: b,
    lt: D,
    eq: P,
    neq: F,
    gte: I,
    lte: L,
    cmp: S,
    coerce: z,
    Comparator: G,
    Range: $,
    satisfies: H,
    toComparators: U,
    maxSatisfying: C,
    minSatisfying: O,
    minVersion: A,
    validRange: k,
    outside: M,
    gtr: W,
    ltr: ie,
    intersects: te,
    simplifyRange: de,
    subset: he,
    SemVer: c,
    re: e.re,
    src: e.src,
    tokens: e.t,
    SEMVER_SPEC_VERSION: i.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: i.RELEASE_TYPES,
    compareIdentifiers: o.compareIdentifiers,
    rcompareIdentifiers: o.rcompareIdentifiers
  }, ps;
}
var zt = {}, Dr = { exports: {} };
Dr.exports;
var gl;
function md() {
  return gl || (gl = 1, (function(e, i) {
    var c = 200, o = "__lodash_hash_undefined__", d = 1, f = 2, r = 9007199254740991, h = "[object Arguments]", t = "[object Array]", l = "[object AsyncFunction]", s = "[object Boolean]", n = "[object Date]", a = "[object Error]", p = "[object Function]", g = "[object GeneratorFunction]", v = "[object Map]", m = "[object Number]", w = "[object Null]", R = "[object Object]", b = "[object Promise]", D = "[object Proxy]", P = "[object RegExp]", F = "[object Set]", I = "[object String]", L = "[object Symbol]", S = "[object Undefined]", z = "[object WeakMap]", G = "[object ArrayBuffer]", $ = "[object DataView]", H = "[object Float32Array]", U = "[object Float64Array]", C = "[object Int8Array]", O = "[object Int16Array]", A = "[object Int32Array]", k = "[object Uint8Array]", M = "[object Uint8ClampedArray]", W = "[object Uint16Array]", ie = "[object Uint32Array]", te = /[\\^$.*+?()[\]{}|]/g, de = /^\[object .+?Constructor\]$/, he = /^(?:0|[1-9]\d*)$/, Y = {};
    Y[H] = Y[U] = Y[C] = Y[O] = Y[A] = Y[k] = Y[M] = Y[W] = Y[ie] = !0, Y[h] = Y[t] = Y[G] = Y[s] = Y[$] = Y[n] = Y[a] = Y[p] = Y[v] = Y[m] = Y[R] = Y[P] = Y[F] = Y[I] = Y[z] = !1;
    var pe = typeof at == "object" && at && at.Object === Object && at, E = typeof self == "object" && self && self.Object === Object && self, y = pe || E || Function("return this")(), B = i && !i.nodeType && i, N = B && !0 && e && !e.nodeType && e, fe = N && N.exports === B, ge = fe && pe.process, ye = (function() {
      try {
        return ge && ge.binding && ge.binding("util");
      } catch {
      }
    })(), Se = ye && ye.isTypedArray;
    function we(T, x) {
      for (var Z = -1, ce = T == null ? 0 : T.length, Ne = 0, Ae = []; ++Z < ce; ) {
        var xe = T[Z];
        x(xe, Z, T) && (Ae[Ne++] = xe);
      }
      return Ae;
    }
    function ze(T, x) {
      for (var Z = -1, ce = x.length, Ne = T.length; ++Z < ce; )
        T[Ne + Z] = x[Z];
      return T;
    }
    function Te(T, x) {
      for (var Z = -1, ce = T == null ? 0 : T.length; ++Z < ce; )
        if (x(T[Z], Z, T))
          return !0;
      return !1;
    }
    function He(T, x) {
      for (var Z = -1, ce = Array(T); ++Z < T; )
        ce[Z] = x(Z);
      return ce;
    }
    function Et(T) {
      return function(x) {
        return T(x);
      };
    }
    function pt(T, x) {
      return T.has(x);
    }
    function ut(T, x) {
      return T?.[x];
    }
    function u(T) {
      var x = -1, Z = Array(T.size);
      return T.forEach(function(ce, Ne) {
        Z[++x] = [Ne, ce];
      }), Z;
    }
    function j(T, x) {
      return function(Z) {
        return T(x(Z));
      };
    }
    function V(T) {
      var x = -1, Z = Array(T.size);
      return T.forEach(function(ce) {
        Z[++x] = ce;
      }), Z;
    }
    var se = Array.prototype, X = Function.prototype, ne = Object.prototype, ee = y["__core-js_shared__"], oe = X.toString, ue = ne.hasOwnProperty, be = (function() {
      var T = /[^.]+$/.exec(ee && ee.keys && ee.keys.IE_PROTO || "");
      return T ? "Symbol(src)_1." + T : "";
    })(), Ce = ne.toString, ve = RegExp(
      "^" + oe.call(ue).replace(te, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    ), _ = fe ? y.Buffer : void 0, q = y.Symbol, J = y.Uint8Array, K = ne.propertyIsEnumerable, Q = se.splice, ae = q ? q.toStringTag : void 0, re = Object.getOwnPropertySymbols, le = _ ? _.isBuffer : void 0, me = j(Object.keys, Object), _e = Gt(y, "DataView"), Ie = Gt(y, "Map"), Ue = Gt(y, "Promise"), Pe = Gt(y, "Set"), Ht = Gt(y, "WeakMap"), nt = Gt(Object, "create"), It = Nt(_e), eu = Nt(Ie), tu = Nt(Ue), ru = Nt(Pe), nu = Nt(Ht), qs = q ? q.prototype : void 0, gn = qs ? qs.valueOf : void 0;
    function Ot(T) {
      var x = -1, Z = T == null ? 0 : T.length;
      for (this.clear(); ++x < Z; ) {
        var ce = T[x];
        this.set(ce[0], ce[1]);
      }
    }
    function iu() {
      this.__data__ = nt ? nt(null) : {}, this.size = 0;
    }
    function su(T) {
      var x = this.has(T) && delete this.__data__[T];
      return this.size -= x ? 1 : 0, x;
    }
    function au(T) {
      var x = this.__data__;
      if (nt) {
        var Z = x[T];
        return Z === o ? void 0 : Z;
      }
      return ue.call(x, T) ? x[T] : void 0;
    }
    function ou(T) {
      var x = this.__data__;
      return nt ? x[T] !== void 0 : ue.call(x, T);
    }
    function lu(T, x) {
      var Z = this.__data__;
      return this.size += this.has(T) ? 0 : 1, Z[T] = nt && x === void 0 ? o : x, this;
    }
    Ot.prototype.clear = iu, Ot.prototype.delete = su, Ot.prototype.get = au, Ot.prototype.has = ou, Ot.prototype.set = lu;
    function mt(T) {
      var x = -1, Z = T == null ? 0 : T.length;
      for (this.clear(); ++x < Z; ) {
        var ce = T[x];
        this.set(ce[0], ce[1]);
      }
    }
    function cu() {
      this.__data__ = [], this.size = 0;
    }
    function uu(T) {
      var x = this.__data__, Z = qr(x, T);
      if (Z < 0)
        return !1;
      var ce = x.length - 1;
      return Z == ce ? x.pop() : Q.call(x, Z, 1), --this.size, !0;
    }
    function fu(T) {
      var x = this.__data__, Z = qr(x, T);
      return Z < 0 ? void 0 : x[Z][1];
    }
    function du(T) {
      return qr(this.__data__, T) > -1;
    }
    function hu(T, x) {
      var Z = this.__data__, ce = qr(Z, T);
      return ce < 0 ? (++this.size, Z.push([T, x])) : Z[ce][1] = x, this;
    }
    mt.prototype.clear = cu, mt.prototype.delete = uu, mt.prototype.get = fu, mt.prototype.has = du, mt.prototype.set = hu;
    function Dt(T) {
      var x = -1, Z = T == null ? 0 : T.length;
      for (this.clear(); ++x < Z; ) {
        var ce = T[x];
        this.set(ce[0], ce[1]);
      }
    }
    function pu() {
      this.size = 0, this.__data__ = {
        hash: new Ot(),
        map: new (Ie || mt)(),
        string: new Ot()
      };
    }
    function mu(T) {
      var x = Mr(this, T).delete(T);
      return this.size -= x ? 1 : 0, x;
    }
    function gu(T) {
      return Mr(this, T).get(T);
    }
    function yu(T) {
      return Mr(this, T).has(T);
    }
    function vu(T, x) {
      var Z = Mr(this, T), ce = Z.size;
      return Z.set(T, x), this.size += Z.size == ce ? 0 : 1, this;
    }
    Dt.prototype.clear = pu, Dt.prototype.delete = mu, Dt.prototype.get = gu, Dt.prototype.has = yu, Dt.prototype.set = vu;
    function $r(T) {
      var x = -1, Z = T == null ? 0 : T.length;
      for (this.__data__ = new Dt(); ++x < Z; )
        this.add(T[x]);
    }
    function Eu(T) {
      return this.__data__.set(T, o), this;
    }
    function wu(T) {
      return this.__data__.has(T);
    }
    $r.prototype.add = $r.prototype.push = Eu, $r.prototype.has = wu;
    function wt(T) {
      var x = this.__data__ = new mt(T);
      this.size = x.size;
    }
    function _u() {
      this.__data__ = new mt(), this.size = 0;
    }
    function Su(T) {
      var x = this.__data__, Z = x.delete(T);
      return this.size = x.size, Z;
    }
    function Au(T) {
      return this.__data__.get(T);
    }
    function Ru(T) {
      return this.__data__.has(T);
    }
    function Tu(T, x) {
      var Z = this.__data__;
      if (Z instanceof mt) {
        var ce = Z.__data__;
        if (!Ie || ce.length < c - 1)
          return ce.push([T, x]), this.size = ++Z.size, this;
        Z = this.__data__ = new Dt(ce);
      }
      return Z.set(T, x), this.size = Z.size, this;
    }
    wt.prototype.clear = _u, wt.prototype.delete = Su, wt.prototype.get = Au, wt.prototype.has = Ru, wt.prototype.set = Tu;
    function bu(T, x) {
      var Z = Br(T), ce = !Z && Bu(T), Ne = !Z && !ce && yn(T), Ae = !Z && !ce && !Ne && Ys(T), xe = Z || ce || Ne || Ae, $e = xe ? He(T.length, String) : [], Me = $e.length;
      for (var Le in T)
        ue.call(T, Le) && !(xe && // Safari 9 has enumerable `arguments.length` in strict mode.
        (Le == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        Ne && (Le == "offset" || Le == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        Ae && (Le == "buffer" || Le == "byteLength" || Le == "byteOffset") || // Skip index properties.
        xu(Le, Me))) && $e.push(Le);
      return $e;
    }
    function qr(T, x) {
      for (var Z = T.length; Z--; )
        if (Gs(T[Z][0], x))
          return Z;
      return -1;
    }
    function Cu(T, x, Z) {
      var ce = x(T);
      return Br(T) ? ce : ze(ce, Z(T));
    }
    function ar(T) {
      return T == null ? T === void 0 ? S : w : ae && ae in Object(T) ? Lu(T) : Mu(T);
    }
    function Ms(T) {
      return or(T) && ar(T) == h;
    }
    function Bs(T, x, Z, ce, Ne) {
      return T === x ? !0 : T == null || x == null || !or(T) && !or(x) ? T !== T && x !== x : Pu(T, x, Z, ce, Bs, Ne);
    }
    function Pu(T, x, Z, ce, Ne, Ae) {
      var xe = Br(T), $e = Br(x), Me = xe ? t : _t(T), Le = $e ? t : _t(x);
      Me = Me == h ? R : Me, Le = Le == h ? R : Le;
      var Xe = Me == R, it = Le == R, Be = Me == Le;
      if (Be && yn(T)) {
        if (!yn(x))
          return !1;
        xe = !0, Xe = !1;
      }
      if (Be && !Xe)
        return Ae || (Ae = new wt()), xe || Ys(T) ? js(T, x, Z, ce, Ne, Ae) : Nu(T, x, Me, Z, ce, Ne, Ae);
      if (!(Z & d)) {
        var Ze = Xe && ue.call(T, "__wrapped__"), et = it && ue.call(x, "__wrapped__");
        if (Ze || et) {
          var St = Ze ? T.value() : T, gt = et ? x.value() : x;
          return Ae || (Ae = new wt()), Ne(St, gt, Z, ce, Ae);
        }
      }
      return Be ? (Ae || (Ae = new wt()), Fu(T, x, Z, ce, Ne, Ae)) : !1;
    }
    function Iu(T) {
      if (!zs(T) || $u(T))
        return !1;
      var x = Ws(T) ? ve : de;
      return x.test(Nt(T));
    }
    function Ou(T) {
      return or(T) && Vs(T.length) && !!Y[ar(T)];
    }
    function Du(T) {
      if (!qu(T))
        return me(T);
      var x = [];
      for (var Z in Object(T))
        ue.call(T, Z) && Z != "constructor" && x.push(Z);
      return x;
    }
    function js(T, x, Z, ce, Ne, Ae) {
      var xe = Z & d, $e = T.length, Me = x.length;
      if ($e != Me && !(xe && Me > $e))
        return !1;
      var Le = Ae.get(T);
      if (Le && Ae.get(x))
        return Le == x;
      var Xe = -1, it = !0, Be = Z & f ? new $r() : void 0;
      for (Ae.set(T, x), Ae.set(x, T); ++Xe < $e; ) {
        var Ze = T[Xe], et = x[Xe];
        if (ce)
          var St = xe ? ce(et, Ze, Xe, x, T, Ae) : ce(Ze, et, Xe, T, x, Ae);
        if (St !== void 0) {
          if (St)
            continue;
          it = !1;
          break;
        }
        if (Be) {
          if (!Te(x, function(gt, Ft) {
            if (!pt(Be, Ft) && (Ze === gt || Ne(Ze, gt, Z, ce, Ae)))
              return Be.push(Ft);
          })) {
            it = !1;
            break;
          }
        } else if (!(Ze === et || Ne(Ze, et, Z, ce, Ae))) {
          it = !1;
          break;
        }
      }
      return Ae.delete(T), Ae.delete(x), it;
    }
    function Nu(T, x, Z, ce, Ne, Ae, xe) {
      switch (Z) {
        case $:
          if (T.byteLength != x.byteLength || T.byteOffset != x.byteOffset)
            return !1;
          T = T.buffer, x = x.buffer;
        case G:
          return !(T.byteLength != x.byteLength || !Ae(new J(T), new J(x)));
        case s:
        case n:
        case m:
          return Gs(+T, +x);
        case a:
          return T.name == x.name && T.message == x.message;
        case P:
        case I:
          return T == x + "";
        case v:
          var $e = u;
        case F:
          var Me = ce & d;
          if ($e || ($e = V), T.size != x.size && !Me)
            return !1;
          var Le = xe.get(T);
          if (Le)
            return Le == x;
          ce |= f, xe.set(T, x);
          var Xe = js($e(T), $e(x), ce, Ne, Ae, xe);
          return xe.delete(T), Xe;
        case L:
          if (gn)
            return gn.call(T) == gn.call(x);
      }
      return !1;
    }
    function Fu(T, x, Z, ce, Ne, Ae) {
      var xe = Z & d, $e = Hs(T), Me = $e.length, Le = Hs(x), Xe = Le.length;
      if (Me != Xe && !xe)
        return !1;
      for (var it = Me; it--; ) {
        var Be = $e[it];
        if (!(xe ? Be in x : ue.call(x, Be)))
          return !1;
      }
      var Ze = Ae.get(T);
      if (Ze && Ae.get(x))
        return Ze == x;
      var et = !0;
      Ae.set(T, x), Ae.set(x, T);
      for (var St = xe; ++it < Me; ) {
        Be = $e[it];
        var gt = T[Be], Ft = x[Be];
        if (ce)
          var Xs = xe ? ce(Ft, gt, Be, x, T, Ae) : ce(gt, Ft, Be, T, x, Ae);
        if (!(Xs === void 0 ? gt === Ft || Ne(gt, Ft, Z, ce, Ae) : Xs)) {
          et = !1;
          break;
        }
        St || (St = Be == "constructor");
      }
      if (et && !St) {
        var jr = T.constructor, Hr = x.constructor;
        jr != Hr && "constructor" in T && "constructor" in x && !(typeof jr == "function" && jr instanceof jr && typeof Hr == "function" && Hr instanceof Hr) && (et = !1);
      }
      return Ae.delete(T), Ae.delete(x), et;
    }
    function Hs(T) {
      return Cu(T, Gu, Uu);
    }
    function Mr(T, x) {
      var Z = T.__data__;
      return ku(x) ? Z[typeof x == "string" ? "string" : "hash"] : Z.map;
    }
    function Gt(T, x) {
      var Z = ut(T, x);
      return Iu(Z) ? Z : void 0;
    }
    function Lu(T) {
      var x = ue.call(T, ae), Z = T[ae];
      try {
        T[ae] = void 0;
        var ce = !0;
      } catch {
      }
      var Ne = Ce.call(T);
      return ce && (x ? T[ae] = Z : delete T[ae]), Ne;
    }
    var Uu = re ? function(T) {
      return T == null ? [] : (T = Object(T), we(re(T), function(x) {
        return K.call(T, x);
      }));
    } : Wu, _t = ar;
    (_e && _t(new _e(new ArrayBuffer(1))) != $ || Ie && _t(new Ie()) != v || Ue && _t(Ue.resolve()) != b || Pe && _t(new Pe()) != F || Ht && _t(new Ht()) != z) && (_t = function(T) {
      var x = ar(T), Z = x == R ? T.constructor : void 0, ce = Z ? Nt(Z) : "";
      if (ce)
        switch (ce) {
          case It:
            return $;
          case eu:
            return v;
          case tu:
            return b;
          case ru:
            return F;
          case nu:
            return z;
        }
      return x;
    });
    function xu(T, x) {
      return x = x ?? r, !!x && (typeof T == "number" || he.test(T)) && T > -1 && T % 1 == 0 && T < x;
    }
    function ku(T) {
      var x = typeof T;
      return x == "string" || x == "number" || x == "symbol" || x == "boolean" ? T !== "__proto__" : T === null;
    }
    function $u(T) {
      return !!be && be in T;
    }
    function qu(T) {
      var x = T && T.constructor, Z = typeof x == "function" && x.prototype || ne;
      return T === Z;
    }
    function Mu(T) {
      return Ce.call(T);
    }
    function Nt(T) {
      if (T != null) {
        try {
          return oe.call(T);
        } catch {
        }
        try {
          return T + "";
        } catch {
        }
      }
      return "";
    }
    function Gs(T, x) {
      return T === x || T !== T && x !== x;
    }
    var Bu = Ms(/* @__PURE__ */ (function() {
      return arguments;
    })()) ? Ms : function(T) {
      return or(T) && ue.call(T, "callee") && !K.call(T, "callee");
    }, Br = Array.isArray;
    function ju(T) {
      return T != null && Vs(T.length) && !Ws(T);
    }
    var yn = le || Vu;
    function Hu(T, x) {
      return Bs(T, x);
    }
    function Ws(T) {
      if (!zs(T))
        return !1;
      var x = ar(T);
      return x == p || x == g || x == l || x == D;
    }
    function Vs(T) {
      return typeof T == "number" && T > -1 && T % 1 == 0 && T <= r;
    }
    function zs(T) {
      var x = typeof T;
      return T != null && (x == "object" || x == "function");
    }
    function or(T) {
      return T != null && typeof T == "object";
    }
    var Ys = Se ? Et(Se) : Ou;
    function Gu(T) {
      return ju(T) ? bu(T) : Du(T);
    }
    function Wu() {
      return [];
    }
    function Vu() {
      return !1;
    }
    e.exports = Hu;
  })(Dr, Dr.exports)), Dr.exports;
}
var yl;
function gd() {
  if (yl) return zt;
  yl = 1, Object.defineProperty(zt, "__esModule", { value: !0 }), zt.DownloadedUpdateHelper = void 0, zt.createTempUpdateFile = h;
  const e = Lr, i = Ct, c = md(), o = /* @__PURE__ */ Pt(), d = Fe;
  let f = class {
    constructor(l) {
      this.cacheDir = l, this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, this._downloadedFileInfo = null;
    }
    get downloadedFileInfo() {
      return this._downloadedFileInfo;
    }
    get file() {
      return this._file;
    }
    get packageFile() {
      return this._packageFile;
    }
    get cacheDirForPendingUpdate() {
      return d.join(this.cacheDir, "pending");
    }
    async validateDownloadedPath(l, s, n, a) {
      if (this.versionInfo != null && this.file === l && this.fileInfo != null)
        return c(this.versionInfo, s) && c(this.fileInfo.info, n.info) && await (0, o.pathExists)(l) ? l : null;
      const p = await this.getValidCachedUpdateFile(n, a);
      return p === null ? null : (a.info(`Update has already been downloaded to ${l}).`), this._file = p, p);
    }
    async setDownloadedFile(l, s, n, a, p, g) {
      this._file = l, this._packageFile = s, this.versionInfo = n, this.fileInfo = a, this._downloadedFileInfo = {
        fileName: p,
        sha512: a.info.sha512,
        isAdminRightsRequired: a.info.isAdminRightsRequired === !0
      }, g && await (0, o.outputJson)(this.getUpdateInfoFile(), this._downloadedFileInfo);
    }
    async clear() {
      this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, await this.cleanCacheDirForPendingUpdate();
    }
    async cleanCacheDirForPendingUpdate() {
      try {
        await (0, o.emptyDir)(this.cacheDirForPendingUpdate);
      } catch {
      }
    }
    /**
     * Returns "update-info.json" which is created in the update cache directory's "pending" subfolder after the first update is downloaded.  If the update file does not exist then the cache is cleared and recreated.  If the update file exists then its properties are validated.
     * @param fileInfo
     * @param logger
     */
    async getValidCachedUpdateFile(l, s) {
      const n = this.getUpdateInfoFile();
      if (!await (0, o.pathExists)(n))
        return null;
      let p;
      try {
        p = await (0, o.readJson)(n);
      } catch (w) {
        let R = "No cached update info available";
        return w.code !== "ENOENT" && (await this.cleanCacheDirForPendingUpdate(), R += ` (error on read: ${w.message})`), s.info(R), null;
      }
      if (!(p?.fileName !== null))
        return s.warn("Cached update info is corrupted: no fileName, directory for cached update will be cleaned"), await this.cleanCacheDirForPendingUpdate(), null;
      if (l.info.sha512 !== p.sha512)
        return s.info(`Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${p.sha512}, expected: ${l.info.sha512}. Directory for cached update will be cleaned`), await this.cleanCacheDirForPendingUpdate(), null;
      const v = d.join(this.cacheDirForPendingUpdate, p.fileName);
      if (!await (0, o.pathExists)(v))
        return s.info("Cached update file doesn't exist"), null;
      const m = await r(v);
      return l.info.sha512 !== m ? (s.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${m}, expected: ${l.info.sha512}`), await this.cleanCacheDirForPendingUpdate(), null) : (this._downloadedFileInfo = p, v);
    }
    getUpdateInfoFile() {
      return d.join(this.cacheDirForPendingUpdate, "update-info.json");
    }
  };
  zt.DownloadedUpdateHelper = f;
  function r(t, l = "sha512", s = "base64", n) {
    return new Promise((a, p) => {
      const g = (0, e.createHash)(l);
      g.on("error", p).setEncoding(s), (0, i.createReadStream)(t, {
        ...n,
        highWaterMark: 1024 * 1024
        /* better to use more memory but hash faster */
      }).on("error", p).on("end", () => {
        g.end(), a(g.read());
      }).pipe(g, { end: !1 });
    });
  }
  async function h(t, l, s) {
    let n = 0, a = d.join(l, t);
    for (let p = 0; p < 3; p++)
      try {
        return await (0, o.unlink)(a), a;
      } catch (g) {
        if (g.code === "ENOENT")
          return a;
        s.warn(`Error on remove temp update file: ${g}`), a = d.join(l, `${n++}-${t}`);
      }
    return a;
  }
  return zt;
}
var dr = {}, tn = {}, vl;
function yd() {
  if (vl) return tn;
  vl = 1, Object.defineProperty(tn, "__esModule", { value: !0 }), tn.getAppCacheDir = c;
  const e = Fe, i = an;
  function c() {
    const o = (0, i.homedir)();
    let d;
    return process.platform === "win32" ? d = process.env.LOCALAPPDATA || e.join(o, "AppData", "Local") : process.platform === "darwin" ? d = e.join(o, "Library", "Caches") : d = process.env.XDG_CACHE_HOME || e.join(o, ".cache"), d;
  }
  return tn;
}
var El;
function vd() {
  if (El) return dr;
  El = 1, Object.defineProperty(dr, "__esModule", { value: !0 }), dr.ElectronAppAdapter = void 0;
  const e = Fe, i = yd();
  let c = class {
    constructor(d = qt.app) {
      this.app = d;
    }
    whenReady() {
      return this.app.whenReady();
    }
    get version() {
      return this.app.getVersion();
    }
    get name() {
      return this.app.getName();
    }
    get isPackaged() {
      return this.app.isPackaged === !0;
    }
    get appUpdateConfigPath() {
      return this.isPackaged ? e.join(process.resourcesPath, "app-update.yml") : e.join(this.app.getAppPath(), "dev-app-update.yml");
    }
    get userDataPath() {
      return this.app.getPath("userData");
    }
    get baseCachePath() {
      return (0, i.getAppCacheDir)();
    }
    quit() {
      this.app.quit();
    }
    relaunch() {
      this.app.relaunch();
    }
    onQuit(d) {
      this.app.once("quit", (f, r) => d(r));
    }
  };
  return dr.ElectronAppAdapter = c, dr;
}
var ms = {}, wl;
function Ed() {
  return wl || (wl = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ElectronHttpExecutor = e.NET_SESSION_NAME = void 0, e.getNetSession = c;
    const i = qe();
    e.NET_SESSION_NAME = "electron-updater";
    function c() {
      return qt.session.fromPartition(e.NET_SESSION_NAME, {
        cache: !1
      });
    }
    class o extends i.HttpExecutor {
      constructor(f) {
        super(), this.proxyLoginCallback = f, this.cachedSession = null;
      }
      async download(f, r, h) {
        return await h.cancellationToken.createPromise((t, l, s) => {
          const n = {
            headers: h.headers || void 0,
            redirect: "manual"
          };
          (0, i.configureRequestUrl)(f, n), (0, i.configureRequestOptions)(n), this.doDownload(n, {
            destination: r,
            options: h,
            onCancel: s,
            callback: (a) => {
              a == null ? t(r) : l(a);
            },
            responseHandler: null
          }, 0);
        });
      }
      createRequest(f, r) {
        f.headers && f.headers.Host && (f.host = f.headers.Host, delete f.headers.Host), this.cachedSession == null && (this.cachedSession = c());
        const h = qt.net.request({
          ...f,
          session: this.cachedSession
        });
        return h.on("response", r), this.proxyLoginCallback != null && h.on("login", this.proxyLoginCallback), h;
      }
      addRedirectHandlers(f, r, h, t, l) {
        f.on("redirect", (s, n, a) => {
          f.abort(), t > this.maxRedirects ? h(this.createMaxRedirectError()) : l(i.HttpExecutor.prepareRedirectUrlOptions(a, r));
        });
      }
    }
    e.ElectronHttpExecutor = o;
  })(ms)), ms;
}
var hr = {}, Yt = {}, _l;
function Bt() {
  if (_l) return Yt;
  _l = 1, Object.defineProperty(Yt, "__esModule", { value: !0 }), Yt.newBaseUrl = i, Yt.newUrlFromBase = c, Yt.getChannelFilename = o;
  const e = bt;
  function i(d) {
    const f = new e.URL(d);
    return f.pathname.endsWith("/") || (f.pathname += "/"), f;
  }
  function c(d, f, r = !1) {
    const h = new e.URL(d, f), t = f.search;
    return t != null && t.length !== 0 ? h.search = t : r && (h.search = `noCache=${Date.now().toString(32)}`), h;
  }
  function o(d) {
    return `${d}.yml`;
  }
  return Yt;
}
var yt = {}, gs, Sl;
function jc() {
  if (Sl) return gs;
  Sl = 1;
  var e = "[object Symbol]", i = /[\\^$.*+?()[\]{}|]/g, c = RegExp(i.source), o = typeof at == "object" && at && at.Object === Object && at, d = typeof self == "object" && self && self.Object === Object && self, f = o || d || Function("return this")(), r = Object.prototype, h = r.toString, t = f.Symbol, l = t ? t.prototype : void 0, s = l ? l.toString : void 0;
  function n(m) {
    if (typeof m == "string")
      return m;
    if (p(m))
      return s ? s.call(m) : "";
    var w = m + "";
    return w == "0" && 1 / m == -1 / 0 ? "-0" : w;
  }
  function a(m) {
    return !!m && typeof m == "object";
  }
  function p(m) {
    return typeof m == "symbol" || a(m) && h.call(m) == e;
  }
  function g(m) {
    return m == null ? "" : n(m);
  }
  function v(m) {
    return m = g(m), m && c.test(m) ? m.replace(i, "\\$&") : m;
  }
  return gs = v, gs;
}
var Al;
function Qe() {
  if (Al) return yt;
  Al = 1, Object.defineProperty(yt, "__esModule", { value: !0 }), yt.Provider = void 0, yt.findFile = r, yt.parseUpdateInfo = h, yt.getFileList = t, yt.resolveFiles = l;
  const e = qe(), i = bs(), c = bt, o = Bt(), d = jc();
  let f = class {
    constructor(n) {
      this.runtimeOptions = n, this.requestHeaders = null, this.executor = n.executor;
    }
    // By default, the blockmap file is in the same directory as the main file
    // But some providers may have a different blockmap file, so we need to override this method
    getBlockMapFiles(n, a, p, g = null) {
      const v = (0, o.newUrlFromBase)(`${n.pathname}.blockmap`, n);
      return [(0, o.newUrlFromBase)(`${n.pathname.replace(new RegExp(d(p), "g"), a)}.blockmap`, g ? new c.URL(g) : n), v];
    }
    get isUseMultipleRangeRequest() {
      return this.runtimeOptions.isUseMultipleRangeRequest !== !1;
    }
    getChannelFilePrefix() {
      if (this.runtimeOptions.platform === "linux") {
        const n = process.env.TEST_UPDATER_ARCH || process.arch;
        return "-linux" + (n === "x64" ? "" : `-${n}`);
      } else
        return this.runtimeOptions.platform === "darwin" ? "-mac" : "";
    }
    // due to historical reasons for windows we use channel name without platform specifier
    getDefaultChannelName() {
      return this.getCustomChannelName("latest");
    }
    getCustomChannelName(n) {
      return `${n}${this.getChannelFilePrefix()}`;
    }
    get fileExtraDownloadHeaders() {
      return null;
    }
    setRequestHeaders(n) {
      this.requestHeaders = n;
    }
    /**
     * Method to perform API request only to resolve update info, but not to download update.
     */
    httpRequest(n, a, p) {
      return this.executor.request(this.createRequestOptions(n, a), p);
    }
    createRequestOptions(n, a) {
      const p = {};
      return this.requestHeaders == null ? a != null && (p.headers = a) : p.headers = a == null ? this.requestHeaders : { ...this.requestHeaders, ...a }, (0, e.configureRequestUrl)(n, p), p;
    }
  };
  yt.Provider = f;
  function r(s, n, a) {
    var p;
    if (s.length === 0)
      throw (0, e.newError)("No files provided", "ERR_UPDATER_NO_FILES_PROVIDED");
    const g = s.filter((m) => m.url.pathname.toLowerCase().endsWith(`.${n.toLowerCase()}`)), v = (p = g.find((m) => [m.url.pathname, m.info.url].some((w) => w.includes(process.arch)))) !== null && p !== void 0 ? p : g.shift();
    return v || (a == null ? s[0] : s.find((m) => !a.some((w) => m.url.pathname.toLowerCase().endsWith(`.${w.toLowerCase()}`))));
  }
  function h(s, n, a) {
    if (s == null)
      throw (0, e.newError)(`Cannot parse update info from ${n} in the latest release artifacts (${a}): rawData: null`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    let p;
    try {
      p = (0, i.load)(s);
    } catch (g) {
      throw (0, e.newError)(`Cannot parse update info from ${n} in the latest release artifacts (${a}): ${g.stack || g.message}, rawData: ${s}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    }
    return p;
  }
  function t(s) {
    const n = s.files;
    if (n != null && n.length > 0)
      return n;
    if (s.path != null)
      return [
        {
          url: s.path,
          sha2: s.sha2,
          sha512: s.sha512
        }
      ];
    throw (0, e.newError)(`No files provided: ${(0, e.safeStringifyJson)(s)}`, "ERR_UPDATER_NO_FILES_PROVIDED");
  }
  function l(s, n, a = (p) => p) {
    const g = t(s).map((w) => {
      if (w.sha2 == null && w.sha512 == null)
        throw (0, e.newError)(`Update info doesn't contain nor sha256 neither sha512 checksum: ${(0, e.safeStringifyJson)(w)}`, "ERR_UPDATER_NO_CHECKSUM");
      return {
        url: (0, o.newUrlFromBase)(a(w.url), n),
        info: w
      };
    }), v = s.packages, m = v == null ? null : v[process.arch] || v.ia32;
    return m != null && (g[0].packageInfo = {
      ...m,
      path: (0, o.newUrlFromBase)(a(m.path), n).href
    }), g;
  }
  return yt;
}
var Rl;
function Hc() {
  if (Rl) return hr;
  Rl = 1, Object.defineProperty(hr, "__esModule", { value: !0 }), hr.GenericProvider = void 0;
  const e = qe(), i = Bt(), c = Qe();
  let o = class extends c.Provider {
    constructor(f, r, h) {
      super(h), this.configuration = f, this.updater = r, this.baseUrl = (0, i.newBaseUrl)(this.configuration.url);
    }
    get channel() {
      const f = this.updater.channel || this.configuration.channel;
      return f == null ? this.getDefaultChannelName() : this.getCustomChannelName(f);
    }
    async getLatestVersion() {
      const f = (0, i.getChannelFilename)(this.channel), r = (0, i.newUrlFromBase)(f, this.baseUrl, this.updater.isAddNoCacheQuery);
      for (let h = 0; ; h++)
        try {
          return (0, c.parseUpdateInfo)(await this.httpRequest(r), f, r);
        } catch (t) {
          if (t instanceof e.HttpError && t.statusCode === 404)
            throw (0, e.newError)(`Cannot find channel "${f}" update info: ${t.stack || t.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
          if (t.code === "ECONNREFUSED" && h < 3) {
            await new Promise((l, s) => {
              try {
                setTimeout(l, 1e3 * h);
              } catch (n) {
                s(n);
              }
            });
            continue;
          }
          throw t;
        }
    }
    resolveFiles(f) {
      return (0, c.resolveFiles)(f, this.baseUrl);
    }
  };
  return hr.GenericProvider = o, hr;
}
var pr = {}, mr = {}, Tl;
function wd() {
  if (Tl) return mr;
  Tl = 1, Object.defineProperty(mr, "__esModule", { value: !0 }), mr.BitbucketProvider = void 0;
  const e = qe(), i = Bt(), c = Qe();
  let o = class extends c.Provider {
    constructor(f, r, h) {
      super({
        ...h,
        isUseMultipleRangeRequest: !1
      }), this.configuration = f, this.updater = r;
      const { owner: t, slug: l } = f;
      this.baseUrl = (0, i.newBaseUrl)(`https://api.bitbucket.org/2.0/repositories/${t}/${l}/downloads`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "latest";
    }
    async getLatestVersion() {
      const f = new e.CancellationToken(), r = (0, i.getChannelFilename)(this.getCustomChannelName(this.channel)), h = (0, i.newUrlFromBase)(r, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const t = await this.httpRequest(h, void 0, f);
        return (0, c.parseUpdateInfo)(t, r, h);
      } catch (t) {
        throw (0, e.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${t.stack || t.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(f) {
      return (0, c.resolveFiles)(f, this.baseUrl);
    }
    toString() {
      const { owner: f, slug: r } = this.configuration;
      return `Bitbucket (owner: ${f}, slug: ${r}, channel: ${this.channel})`;
    }
  };
  return mr.BitbucketProvider = o, mr;
}
var Tt = {}, bl;
function Gc() {
  if (bl) return Tt;
  bl = 1, Object.defineProperty(Tt, "__esModule", { value: !0 }), Tt.GitHubProvider = Tt.BaseGitHubProvider = void 0, Tt.computeReleaseNotes = l;
  const e = qe(), i = Bc(), c = bt, o = Bt(), d = Qe(), f = /\/tag\/(v?[^/]+)$/;
  class r extends d.Provider {
    constructor(n, a, p) {
      super({
        ...p,
        /* because GitHib uses S3 */
        isUseMultipleRangeRequest: !1
      }), this.options = n, this.baseUrl = (0, o.newBaseUrl)((0, e.githubUrl)(n, a));
      const g = a === "github.com" ? "api.github.com" : a;
      this.baseApiUrl = (0, o.newBaseUrl)((0, e.githubUrl)(n, g));
    }
    computeGithubBasePath(n) {
      const a = this.options.host;
      return a && !["github.com", "api.github.com"].includes(a) ? `/api/v3${n}` : n;
    }
  }
  Tt.BaseGitHubProvider = r;
  let h = class extends r {
    constructor(n, a, p) {
      super(n, "github.com", p), this.options = n, this.updater = a;
    }
    get channel() {
      const n = this.updater.channel || this.options.channel;
      return n == null ? this.getDefaultChannelName() : this.getCustomChannelName(n);
    }
    async getLatestVersion() {
      var n, a, p, g, v;
      const m = new e.CancellationToken(), w = await this.httpRequest((0, o.newUrlFromBase)(`${this.basePath}.atom`, this.baseUrl), {
        accept: "application/xml, application/atom+xml, text/xml, */*"
      }, m), R = (0, e.parseXml)(w);
      let b = R.element("entry", !1, "No published versions on GitHub"), D = null;
      try {
        if (this.updater.allowPrerelease) {
          const z = ((n = this.updater) === null || n === void 0 ? void 0 : n.channel) || ((a = i.prerelease(this.updater.currentVersion)) === null || a === void 0 ? void 0 : a[0]) || null;
          if (z === null)
            D = f.exec(b.element("link").attribute("href"))[1];
          else
            for (const G of R.getElements("entry")) {
              const $ = f.exec(G.element("link").attribute("href"));
              if ($ === null)
                continue;
              const H = $[1];
              if (!i.valid(H))
                continue;
              const U = ((p = i.prerelease(H)) === null || p === void 0 ? void 0 : p[0]) || null, C = !z || ["alpha", "beta"].includes(z), O = U !== null && !["alpha", "beta"].includes(String(U));
              if (C && !O && !(z === "beta" && U === "alpha")) {
                D = H, b = G;
                break;
              }
              if (U && U === z) {
                D = H, b = G;
                break;
              }
            }
        } else {
          D = await this.getLatestTagName(m);
          for (const z of R.getElements("entry")) {
            const G = f.exec(z.element("link").attribute("href"));
            if (G != null && G[1] === D) {
              b = z;
              break;
            }
          }
        }
      } catch (z) {
        throw (0, e.newError)(`Cannot parse releases feed: ${z.stack || z.message},
XML:
${w}`, "ERR_UPDATER_INVALID_RELEASE_FEED");
      }
      if (D == null)
        throw (0, e.newError)("No published versions on GitHub", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
      let P, F = "", I = "";
      const L = async (z) => {
        F = (0, o.getChannelFilename)(z), I = (0, o.newUrlFromBase)(this.getBaseDownloadPath(String(D), F), this.baseUrl);
        const G = this.createRequestOptions(I);
        try {
          return await this.executor.request(G, m);
        } catch ($) {
          throw $ instanceof e.HttpError && $.statusCode === 404 ? (0, e.newError)(`Cannot find ${F} in the latest release artifacts (${I}): ${$.stack || $.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : $;
        }
      };
      try {
        let z = this.channel;
        this.updater.allowPrerelease && (!((g = i.prerelease(D)) === null || g === void 0) && g[0]) && (z = this.getCustomChannelName(String((v = i.prerelease(D)) === null || v === void 0 ? void 0 : v[0]))), P = await L(z);
      } catch (z) {
        if (this.updater.allowPrerelease)
          P = await L(this.getDefaultChannelName());
        else
          throw z;
      }
      const S = (0, d.parseUpdateInfo)(P, F, I);
      return S.releaseName == null && (S.releaseName = b.elementValueOrEmpty("title")), S.releaseNotes == null && (S.releaseNotes = l(this.updater.currentVersion, this.updater.fullChangelog, R, b)), {
        tag: D,
        ...S
      };
    }
    async getLatestTagName(n) {
      const a = this.options, p = a.host == null || a.host === "github.com" ? (0, o.newUrlFromBase)(`${this.basePath}/latest`, this.baseUrl) : new c.URL(`${this.computeGithubBasePath(`/repos/${a.owner}/${a.repo}/releases`)}/latest`, this.baseApiUrl);
      try {
        const g = await this.httpRequest(p, { Accept: "application/json" }, n);
        return g == null ? null : JSON.parse(g).tag_name;
      } catch (g) {
        throw (0, e.newError)(`Unable to find latest version on GitHub (${p}), please ensure a production release exists: ${g.stack || g.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    get basePath() {
      return `/${this.options.owner}/${this.options.repo}/releases`;
    }
    resolveFiles(n) {
      return (0, d.resolveFiles)(n, this.baseUrl, (a) => this.getBaseDownloadPath(n.tag, a.replace(/ /g, "-")));
    }
    getBaseDownloadPath(n, a) {
      return `${this.basePath}/download/${n}/${a}`;
    }
  };
  Tt.GitHubProvider = h;
  function t(s) {
    const n = s.elementValueOrEmpty("content");
    return n === "No content." ? "" : n;
  }
  function l(s, n, a, p) {
    if (!n)
      return t(p);
    const g = /\/tag\/v?([^/]+)$/;
    let v;
    try {
      v = g.exec(p.element("link").attribute("href"))[1], v = i.valid(v) ? v : void 0;
    } catch {
    }
    if (v == null)
      return null;
    const m = [];
    for (const w of a.getElements("entry")) {
      let R;
      try {
        const P = g.exec(w.element("link").attribute("href"));
        if (!P)
          continue;
        R = P[1];
      } catch {
        continue;
      }
      if (!i.valid(R))
        continue;
      const b = i.gt(R, s.raw), D = i.lte(R, v);
      b && D && m.push({
        version: R,
        note: t(w)
      });
    }
    return m.sort((w, R) => i.rcompare(w.version, R.version));
  }
  return Tt;
}
var gr = {}, Cl;
function _d() {
  if (Cl) return gr;
  Cl = 1, Object.defineProperty(gr, "__esModule", { value: !0 }), gr.GitLabProvider = void 0;
  const e = qe(), i = bt, c = jc(), o = Bt(), d = Qe();
  let f = class extends d.Provider {
    /**
     * Normalizes filenames by replacing spaces and underscores with dashes.
     *
     * This is a workaround to handle filename formatting differences between tools:
     * - electron-builder formats filenames like "test file.txt" as "test-file.txt"
     * - GitLab may provide asset URLs using underscores, such as "test_file.txt"
     *
     * Because of this mismatch, we can't reliably extract the correct filename from
     * the asset path without normalization. This function ensures consistent matching
     * across different filename formats by converting all spaces and underscores to dashes.
     *
     * @param filename The filename to normalize
     * @returns The normalized filename with spaces and underscores replaced by dashes
     */
    normalizeFilename(h) {
      return h.replace(/ |_/g, "-");
    }
    constructor(h, t, l) {
      super({
        ...l,
        // GitLab might not support multiple range requests efficiently
        isUseMultipleRangeRequest: !1
      }), this.options = h, this.updater = t, this.cachedLatestVersion = null;
      const n = h.host || "gitlab.com";
      this.baseApiUrl = (0, o.newBaseUrl)(`https://${n}/api/v4`);
    }
    createRequestOptions(h, t) {
      const l = super.createRequestOptions(h, t);
      return l.redirect = "manual", l;
    }
    get channel() {
      const h = this.updater.channel || this.options.channel;
      return h == null ? this.getDefaultChannelName() : this.getCustomChannelName(h);
    }
    async getLatestVersion() {
      const h = new e.CancellationToken(), t = (0, o.newUrlFromBase)(`projects/${this.options.projectId}/releases/permalink/latest`, this.baseApiUrl), l = { Accept: "application/json", ...this.setAuthHeaderForToken(this.options.token || null) };
      let s;
      try {
        s = await this.httpRequest(t, l, h);
      } catch (b) {
        throw (0, e.newError)(`Unable to find latest release on GitLab (${t}): ${b.stack || b.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
      if (!s)
        throw (0, e.newError)("No published releases on GitLab", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
      let n;
      try {
        n = JSON.parse(s);
      } catch (b) {
        throw (0, e.newError)(`Unable to parse latest release response from GitLab (${t}): response was not valid JSON: ${b.stack || b.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
      if (n.upcoming_release)
        throw (0, e.newError)("Latest GitLab release is scheduled but not yet published", "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      const a = n.tag_name;
      let p = null, g = "", v = null;
      const m = async (b) => {
        g = (0, o.getChannelFilename)(b);
        const D = n.assets.links.find((I) => I.name === g);
        if (!D)
          throw (0, e.newError)(`Cannot find ${g} in the latest release assets`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
        v = new i.URL(D.direct_asset_url);
        const P = this.setAuthHeaderForToken(this.options.token || null), F = Object.keys(P).length ? P : void 0;
        try {
          const I = await this.httpRequest(v, F, h);
          if (!I)
            throw (0, e.newError)(`Empty response from ${v}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
          return I;
        } catch (I) {
          throw I instanceof e.HttpError && I.statusCode === 404 ? (0, e.newError)(`Cannot find ${g} in the latest release artifacts (${v}): ${I.stack || I.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : I;
        }
      };
      try {
        p = await m(this.channel);
      } catch (b) {
        if (this.channel !== this.getDefaultChannelName())
          p = await m(this.getDefaultChannelName());
        else
          throw b;
      }
      if (!p)
        throw (0, e.newError)(`Unable to parse channel data from ${g}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
      const w = (0, d.parseUpdateInfo)(p, g, v);
      w.releaseName == null && (w.releaseName = n.name), w.releaseNotes == null && (w.releaseNotes = n.description || null);
      const R = {
        tag: a,
        assets: this.convertAssetsToMap(n.assets),
        ...w
      };
      return this.cachedLatestVersion = R, R;
    }
    /**
     * Utility function to convert GitlabReleaseAsset to Map<string, string>
     * Maps asset names to their download URLs
     */
    convertAssetsToMap(h) {
      const t = /* @__PURE__ */ new Map();
      for (const l of h.links)
        t.set(this.normalizeFilename(l.name), l.direct_asset_url);
      return t;
    }
    /**
     * Find blockmap file URL in assets map for a specific filename
     */
    findBlockMapInAssets(h, t) {
      const l = [`${t}.blockmap`, `${this.normalizeFilename(t)}.blockmap`];
      for (const s of l) {
        const n = h.get(s);
        if (n)
          return new i.URL(n);
      }
      return null;
    }
    async fetchReleaseInfoByVersion(h) {
      const t = new e.CancellationToken(), l = [`v${h}`, h];
      for (const s of l) {
        const n = (0, o.newUrlFromBase)(`projects/${this.options.projectId}/releases/${encodeURIComponent(s)}`, this.baseApiUrl);
        try {
          const a = { Accept: "application/json", ...this.setAuthHeaderForToken(this.options.token || null) }, p = await this.httpRequest(n, a, t);
          if (p)
            return JSON.parse(p);
        } catch (a) {
          if (a instanceof e.HttpError && a.statusCode === 404)
            continue;
          throw (0, e.newError)(`Unable to find release ${s} on GitLab (${n}): ${a.stack || a.message}`, "ERR_UPDATER_RELEASE_NOT_FOUND");
        }
      }
      throw (0, e.newError)(`Unable to find release with version ${h} (tried: ${l.join(", ")}) on GitLab`, "ERR_UPDATER_RELEASE_NOT_FOUND");
    }
    setAuthHeaderForToken(h) {
      const t = {};
      return h != null && (h.startsWith("Bearer") ? t.authorization = h : t["PRIVATE-TOKEN"] = h), t;
    }
    /**
     * Get version info for blockmap files, using cache when possible
     */
    async getVersionInfoForBlockMap(h) {
      if (this.cachedLatestVersion && this.cachedLatestVersion.version === h)
        return this.cachedLatestVersion.assets;
      const t = await this.fetchReleaseInfoByVersion(h);
      return t && t.assets ? this.convertAssetsToMap(t.assets) : null;
    }
    /**
     * Find blockmap URLs from version assets
     */
    async findBlockMapUrlsFromAssets(h, t, l) {
      let s = null, n = null;
      const a = await this.getVersionInfoForBlockMap(t);
      a && (s = this.findBlockMapInAssets(a, l));
      const p = await this.getVersionInfoForBlockMap(h);
      if (p) {
        const g = l.replace(new RegExp(c(t), "g"), h);
        n = this.findBlockMapInAssets(p, g);
      }
      return [n, s];
    }
    async getBlockMapFiles(h, t, l, s = null) {
      if (this.options.uploadTarget === "project_upload") {
        const n = h.pathname.split("/").pop() || "", [a, p] = await this.findBlockMapUrlsFromAssets(t, l, n);
        if (!p)
          throw (0, e.newError)(`Cannot find blockmap file for ${l} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
        if (!a)
          throw (0, e.newError)(`Cannot find blockmap file for ${t} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
        return [a, p];
      } else
        return super.getBlockMapFiles(h, t, l, s);
    }
    resolveFiles(h) {
      return (0, d.getFileList)(h).map((t) => {
        const s = [
          t.url,
          // Original filename
          this.normalizeFilename(t.url)
          // Normalized filename (spaces/underscores → dashes)
        ].find((a) => h.assets.has(a)), n = s ? h.assets.get(s) : void 0;
        if (!n)
          throw (0, e.newError)(`Cannot find asset "${t.url}" in GitLab release assets. Available assets: ${Array.from(h.assets.keys()).join(", ")}`, "ERR_UPDATER_ASSET_NOT_FOUND");
        return {
          url: new i.URL(n),
          info: t
        };
      });
    }
    toString() {
      return `GitLab (projectId: ${this.options.projectId}, channel: ${this.channel})`;
    }
  };
  return gr.GitLabProvider = f, gr;
}
var yr = {}, Pl;
function Sd() {
  if (Pl) return yr;
  Pl = 1, Object.defineProperty(yr, "__esModule", { value: !0 }), yr.KeygenProvider = void 0;
  const e = qe(), i = Bt(), c = Qe();
  let o = class extends c.Provider {
    constructor(f, r, h) {
      super({
        ...h,
        isUseMultipleRangeRequest: !1
      }), this.configuration = f, this.updater = r, this.defaultHostname = "api.keygen.sh";
      const t = this.configuration.host || this.defaultHostname;
      this.baseUrl = (0, i.newBaseUrl)(`https://${t}/v1/accounts/${this.configuration.account}/artifacts?product=${this.configuration.product}`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "stable";
    }
    async getLatestVersion() {
      const f = new e.CancellationToken(), r = (0, i.getChannelFilename)(this.getCustomChannelName(this.channel)), h = (0, i.newUrlFromBase)(r, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const t = await this.httpRequest(h, {
          Accept: "application/vnd.api+json",
          "Keygen-Version": "1.1"
        }, f);
        return (0, c.parseUpdateInfo)(t, r, h);
      } catch (t) {
        throw (0, e.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${t.stack || t.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(f) {
      return (0, c.resolveFiles)(f, this.baseUrl);
    }
    toString() {
      const { account: f, product: r, platform: h } = this.configuration;
      return `Keygen (account: ${f}, product: ${r}, platform: ${h}, channel: ${this.channel})`;
    }
  };
  return yr.KeygenProvider = o, yr;
}
var vr = {}, Il;
function Ad() {
  if (Il) return vr;
  Il = 1, Object.defineProperty(vr, "__esModule", { value: !0 }), vr.PrivateGitHubProvider = void 0;
  const e = qe(), i = bs(), c = Fe, o = bt, d = Bt(), f = Gc(), r = Qe();
  let h = class extends f.BaseGitHubProvider {
    constructor(l, s, n, a) {
      super(l, "api.github.com", a), this.updater = s, this.token = n;
    }
    createRequestOptions(l, s) {
      const n = super.createRequestOptions(l, s);
      return n.redirect = "manual", n;
    }
    async getLatestVersion() {
      const l = new e.CancellationToken(), s = (0, d.getChannelFilename)(this.getDefaultChannelName()), n = await this.getLatestVersionInfo(l), a = n.assets.find((v) => v.name === s);
      if (a == null)
        throw (0, e.newError)(`Cannot find ${s} in the release ${n.html_url || n.name}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
      const p = new o.URL(a.url);
      let g;
      try {
        g = (0, i.load)(await this.httpRequest(p, this.configureHeaders("application/octet-stream"), l));
      } catch (v) {
        throw v instanceof e.HttpError && v.statusCode === 404 ? (0, e.newError)(`Cannot find ${s} in the latest release artifacts (${p}): ${v.stack || v.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : v;
      }
      return g.assets = n.assets, g;
    }
    get fileExtraDownloadHeaders() {
      return this.configureHeaders("application/octet-stream");
    }
    configureHeaders(l) {
      return {
        accept: l,
        authorization: `token ${this.token}`
      };
    }
    async getLatestVersionInfo(l) {
      const s = this.updater.allowPrerelease;
      let n = this.basePath;
      s || (n = `${n}/latest`);
      const a = (0, d.newUrlFromBase)(n, this.baseUrl);
      try {
        const p = JSON.parse(await this.httpRequest(a, this.configureHeaders("application/vnd.github.v3+json"), l));
        if (s) {
          const g = p.filter((v) => !v.draft);
          return g.find((v) => v.prerelease) || g[0];
        } else
          return p;
      } catch (p) {
        throw (0, e.newError)(`Unable to find latest version on GitHub (${a}), please ensure a production release exists: ${p.stack || p.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    get basePath() {
      return this.computeGithubBasePath(`/repos/${this.options.owner}/${this.options.repo}/releases`);
    }
    resolveFiles(l) {
      return (0, r.getFileList)(l).map((s) => {
        const n = c.posix.basename(s.url).replace(/ /g, "-"), a = l.assets.find((p) => p != null && p.name === n);
        if (a == null)
          throw (0, e.newError)(`Cannot find asset "${n}" in: ${JSON.stringify(l.assets, null, 2)}`, "ERR_UPDATER_ASSET_NOT_FOUND");
        return {
          url: new o.URL(a.url),
          info: s
        };
      });
    }
  };
  return vr.PrivateGitHubProvider = h, vr;
}
var Ol;
function Rd() {
  if (Ol) return pr;
  Ol = 1, Object.defineProperty(pr, "__esModule", { value: !0 }), pr.isUrlProbablySupportMultiRangeRequests = h, pr.createClient = t;
  const e = qe(), i = wd(), c = Hc(), o = Gc(), d = _d(), f = Sd(), r = Ad();
  function h(l) {
    return !l.includes("s3.amazonaws.com");
  }
  function t(l, s, n) {
    if (typeof l == "string")
      throw (0, e.newError)("Please pass PublishConfiguration object", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
    const a = l.provider;
    switch (a) {
      case "github": {
        const p = l, g = (p.private ? process.env.GH_TOKEN || process.env.GITHUB_TOKEN : null) || p.token;
        return g == null ? new o.GitHubProvider(p, s, n) : new r.PrivateGitHubProvider(p, s, g, n);
      }
      case "bitbucket":
        return new i.BitbucketProvider(l, s, n);
      case "gitlab":
        return new d.GitLabProvider(l, s, n);
      case "keygen":
        return new f.KeygenProvider(l, s, n);
      case "s3":
      case "spaces":
        return new c.GenericProvider({
          provider: "generic",
          url: (0, e.getS3LikeProviderBaseUrl)(l),
          channel: l.channel || null
        }, s, {
          ...n,
          // https://github.com/minio/minio/issues/5285#issuecomment-350428955
          isUseMultipleRangeRequest: !1
        });
      case "generic": {
        const p = l;
        return new c.GenericProvider(p, s, {
          ...n,
          isUseMultipleRangeRequest: p.useMultipleRangeRequest !== !1 && h(p.url)
        });
      }
      case "custom": {
        const p = l, g = p.updateProvider;
        if (!g)
          throw (0, e.newError)("Custom provider not specified", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
        return new g(p, s, n);
      }
      default:
        throw (0, e.newError)(`Unsupported provider: ${a}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
    }
  }
  return pr;
}
var Er = {}, wr = {}, Xt = {}, Jt = {}, Dl;
function Fs() {
  if (Dl) return Jt;
  Dl = 1, Object.defineProperty(Jt, "__esModule", { value: !0 }), Jt.OperationKind = void 0, Jt.computeOperations = i;
  var e;
  (function(r) {
    r[r.COPY = 0] = "COPY", r[r.DOWNLOAD = 1] = "DOWNLOAD";
  })(e || (Jt.OperationKind = e = {}));
  function i(r, h, t) {
    const l = f(r.files), s = f(h.files);
    let n = null;
    const a = h.files[0], p = [], g = a.name, v = l.get(g);
    if (v == null)
      throw new Error(`no file ${g} in old blockmap`);
    const m = s.get(g);
    let w = 0;
    const { checksumToOffset: R, checksumToOldSize: b } = d(l.get(g), v.offset, t);
    let D = a.offset;
    for (let P = 0; P < m.checksums.length; D += m.sizes[P], P++) {
      const F = m.sizes[P], I = m.checksums[P];
      let L = R.get(I);
      L != null && b.get(I) !== F && (t.warn(`Checksum ("${I}") matches, but size differs (old: ${b.get(I)}, new: ${F})`), L = void 0), L === void 0 ? (w++, n != null && n.kind === e.DOWNLOAD && n.end === D ? n.end += F : (n = {
        kind: e.DOWNLOAD,
        start: D,
        end: D + F
        // oldBlocks: null,
      }, o(n, p, I, P))) : n != null && n.kind === e.COPY && n.end === L ? n.end += F : (n = {
        kind: e.COPY,
        start: L,
        end: L + F
        // oldBlocks: [checksum]
      }, o(n, p, I, P));
    }
    return w > 0 && t.info(`File${a.name === "file" ? "" : " " + a.name} has ${w} changed blocks`), p;
  }
  const c = process.env.DIFFERENTIAL_DOWNLOAD_PLAN_BUILDER_VALIDATE_RANGES === "true";
  function o(r, h, t, l) {
    if (c && h.length !== 0) {
      const s = h[h.length - 1];
      if (s.kind === r.kind && r.start < s.end && r.start > s.start) {
        const n = [s.start, s.end, r.start, r.end].reduce((a, p) => a < p ? a : p);
        throw new Error(`operation (block index: ${l}, checksum: ${t}, kind: ${e[r.kind]}) overlaps previous operation (checksum: ${t}):
abs: ${s.start} until ${s.end} and ${r.start} until ${r.end}
rel: ${s.start - n} until ${s.end - n} and ${r.start - n} until ${r.end - n}`);
      }
    }
    h.push(r);
  }
  function d(r, h, t) {
    const l = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
    let n = h;
    for (let a = 0; a < r.checksums.length; a++) {
      const p = r.checksums[a], g = r.sizes[a], v = s.get(p);
      if (v === void 0)
        l.set(p, n), s.set(p, g);
      else if (t.debug != null) {
        const m = v === g ? "(same size)" : `(size: ${v}, this size: ${g})`;
        t.debug(`${p} duplicated in blockmap ${m}, it doesn't lead to broken differential downloader, just corresponding block will be skipped)`);
      }
      n += g;
    }
    return { checksumToOffset: l, checksumToOldSize: s };
  }
  function f(r) {
    const h = /* @__PURE__ */ new Map();
    for (const t of r)
      h.set(t.name, t);
    return h;
  }
  return Jt;
}
var Nl;
function Wc() {
  if (Nl) return Xt;
  Nl = 1, Object.defineProperty(Xt, "__esModule", { value: !0 }), Xt.DataSplitter = void 0, Xt.copyData = r;
  const e = qe(), i = Ct, c = Fr, o = Fs(), d = Buffer.from(`\r
\r
`);
  var f;
  (function(t) {
    t[t.INIT = 0] = "INIT", t[t.HEADER = 1] = "HEADER", t[t.BODY = 2] = "BODY";
  })(f || (f = {}));
  function r(t, l, s, n, a) {
    const p = (0, i.createReadStream)("", {
      fd: s,
      autoClose: !1,
      start: t.start,
      // end is inclusive
      end: t.end - 1
    });
    p.on("error", n), p.once("end", a), p.pipe(l, {
      end: !1
    });
  }
  let h = class extends c.Writable {
    constructor(l, s, n, a, p, g, v, m) {
      super(), this.out = l, this.options = s, this.partIndexToTaskIndex = n, this.partIndexToLength = p, this.finishHandler = g, this.grandTotalBytes = v, this.onProgress = m, this.start = Date.now(), this.nextUpdate = this.start + 1e3, this.transferred = 0, this.delta = 0, this.partIndex = -1, this.headerListBuffer = null, this.readState = f.INIT, this.ignoreByteCount = 0, this.remainingPartDataCount = 0, this.actualPartLength = 0, this.boundaryLength = a.length + 4, this.ignoreByteCount = this.boundaryLength - 2;
    }
    get isFinished() {
      return this.partIndex === this.partIndexToLength.length;
    }
    // noinspection JSUnusedGlobalSymbols
    _write(l, s, n) {
      if (this.isFinished) {
        console.error(`Trailing ignored data: ${l.length} bytes`);
        return;
      }
      this.handleData(l).then(() => {
        if (this.onProgress) {
          const a = Date.now();
          (a >= this.nextUpdate || this.transferred === this.grandTotalBytes) && this.grandTotalBytes && (a - this.start) / 1e3 && (this.nextUpdate = a + 1e3, this.onProgress({
            total: this.grandTotalBytes,
            delta: this.delta,
            transferred: this.transferred,
            percent: this.transferred / this.grandTotalBytes * 100,
            bytesPerSecond: Math.round(this.transferred / ((a - this.start) / 1e3))
          }), this.delta = 0);
        }
        n();
      }).catch(n);
    }
    async handleData(l) {
      let s = 0;
      if (this.ignoreByteCount !== 0 && this.remainingPartDataCount !== 0)
        throw (0, e.newError)("Internal error", "ERR_DATA_SPLITTER_BYTE_COUNT_MISMATCH");
      if (this.ignoreByteCount > 0) {
        const n = Math.min(this.ignoreByteCount, l.length);
        this.ignoreByteCount -= n, s = n;
      } else if (this.remainingPartDataCount > 0) {
        const n = Math.min(this.remainingPartDataCount, l.length);
        this.remainingPartDataCount -= n, await this.processPartData(l, 0, n), s = n;
      }
      if (s !== l.length) {
        if (this.readState === f.HEADER) {
          const n = this.searchHeaderListEnd(l, s);
          if (n === -1)
            return;
          s = n, this.readState = f.BODY, this.headerListBuffer = null;
        }
        for (; ; ) {
          if (this.readState === f.BODY)
            this.readState = f.INIT;
          else {
            this.partIndex++;
            let g = this.partIndexToTaskIndex.get(this.partIndex);
            if (g == null)
              if (this.isFinished)
                g = this.options.end;
              else
                throw (0, e.newError)("taskIndex is null", "ERR_DATA_SPLITTER_TASK_INDEX_IS_NULL");
            const v = this.partIndex === 0 ? this.options.start : this.partIndexToTaskIndex.get(this.partIndex - 1) + 1;
            if (v < g)
              await this.copyExistingData(v, g);
            else if (v > g)
              throw (0, e.newError)("prevTaskIndex must be < taskIndex", "ERR_DATA_SPLITTER_TASK_INDEX_ASSERT_FAILED");
            if (this.isFinished) {
              this.onPartEnd(), this.finishHandler();
              return;
            }
            if (s = this.searchHeaderListEnd(l, s), s === -1) {
              this.readState = f.HEADER;
              return;
            }
          }
          const n = this.partIndexToLength[this.partIndex], a = s + n, p = Math.min(a, l.length);
          if (await this.processPartStarted(l, s, p), this.remainingPartDataCount = n - (p - s), this.remainingPartDataCount > 0)
            return;
          if (s = a + this.boundaryLength, s >= l.length) {
            this.ignoreByteCount = this.boundaryLength - (l.length - a);
            return;
          }
        }
      }
    }
    copyExistingData(l, s) {
      return new Promise((n, a) => {
        const p = () => {
          if (l === s) {
            n();
            return;
          }
          const g = this.options.tasks[l];
          if (g.kind !== o.OperationKind.COPY) {
            a(new Error("Task kind must be COPY"));
            return;
          }
          r(g, this.out, this.options.oldFileFd, a, () => {
            l++, p();
          });
        };
        p();
      });
    }
    searchHeaderListEnd(l, s) {
      const n = l.indexOf(d, s);
      if (n !== -1)
        return n + d.length;
      const a = s === 0 ? l : l.slice(s);
      return this.headerListBuffer == null ? this.headerListBuffer = a : this.headerListBuffer = Buffer.concat([this.headerListBuffer, a]), -1;
    }
    onPartEnd() {
      const l = this.partIndexToLength[this.partIndex - 1];
      if (this.actualPartLength !== l)
        throw (0, e.newError)(`Expected length: ${l} differs from actual: ${this.actualPartLength}`, "ERR_DATA_SPLITTER_LENGTH_MISMATCH");
      this.actualPartLength = 0;
    }
    processPartStarted(l, s, n) {
      return this.partIndex !== 0 && this.onPartEnd(), this.processPartData(l, s, n);
    }
    processPartData(l, s, n) {
      this.actualPartLength += n - s, this.transferred += n - s, this.delta += n - s;
      const a = this.out;
      return a.write(s === 0 && l.length === n ? l : l.slice(s, n)) ? Promise.resolve() : new Promise((p, g) => {
        a.on("error", g), a.once("drain", () => {
          a.removeListener("error", g), p();
        });
      });
    }
  };
  return Xt.DataSplitter = h, Xt;
}
var _r = {}, Fl;
function Td() {
  if (Fl) return _r;
  Fl = 1, Object.defineProperty(_r, "__esModule", { value: !0 }), _r.executeTasksUsingMultipleRangeRequests = o, _r.checkIsRangesSupported = f;
  const e = qe(), i = Wc(), c = Fs();
  function o(r, h, t, l, s) {
    const n = (a) => {
      if (a >= h.length) {
        r.fileMetadataBuffer != null && t.write(r.fileMetadataBuffer), t.end();
        return;
      }
      const p = a + 1e3;
      d(r, {
        tasks: h,
        start: a,
        end: Math.min(h.length, p),
        oldFileFd: l
      }, t, () => n(p), s);
    };
    return n;
  }
  function d(r, h, t, l, s) {
    let n = "bytes=", a = 0, p = 0;
    const g = /* @__PURE__ */ new Map(), v = [];
    for (let R = h.start; R < h.end; R++) {
      const b = h.tasks[R];
      b.kind === c.OperationKind.DOWNLOAD && (n += `${b.start}-${b.end - 1}, `, g.set(a, R), a++, v.push(b.end - b.start), p += b.end - b.start);
    }
    if (a <= 1) {
      const R = (b) => {
        if (b >= h.end) {
          l();
          return;
        }
        const D = h.tasks[b++];
        if (D.kind === c.OperationKind.COPY)
          (0, i.copyData)(D, t, h.oldFileFd, s, () => R(b));
        else {
          const P = r.createRequestOptions();
          P.headers.Range = `bytes=${D.start}-${D.end - 1}`;
          const F = r.httpExecutor.createRequest(P, (I) => {
            I.on("error", s), f(I, s) && (I.pipe(t, {
              end: !1
            }), I.once("end", () => R(b)));
          });
          r.httpExecutor.addErrorAndTimeoutHandlers(F, s), F.end();
        }
      };
      R(h.start);
      return;
    }
    const m = r.createRequestOptions();
    m.headers.Range = n.substring(0, n.length - 2);
    const w = r.httpExecutor.createRequest(m, (R) => {
      if (!f(R, s))
        return;
      const b = (0, e.safeGetHeader)(R, "content-type"), D = /^multipart\/.+?\s*;\s*boundary=(?:"([^"]+)"|([^\s";]+))\s*$/i.exec(b);
      if (D == null) {
        s(new Error(`Content-Type "multipart/byteranges" is expected, but got "${b}"`));
        return;
      }
      const P = new i.DataSplitter(t, h, g, D[1] || D[2], v, l, p, r.options.onProgress);
      P.on("error", s), R.pipe(P), R.on("end", () => {
        setTimeout(() => {
          w.abort(), s(new Error("Response ends without calling any handlers"));
        }, 1e4);
      });
    });
    r.httpExecutor.addErrorAndTimeoutHandlers(w, s), w.end();
  }
  function f(r, h) {
    if (r.statusCode >= 400)
      return h((0, e.createHttpError)(r)), !1;
    if (r.statusCode !== 206) {
      const t = (0, e.safeGetHeader)(r, "accept-ranges");
      if (t == null || t === "none")
        return h(new Error(`Server doesn't support Accept-Ranges (response code ${r.statusCode})`)), !1;
    }
    return !0;
  }
  return _r;
}
var Sr = {}, Ll;
function bd() {
  if (Ll) return Sr;
  Ll = 1, Object.defineProperty(Sr, "__esModule", { value: !0 }), Sr.ProgressDifferentialDownloadCallbackTransform = void 0;
  const e = Fr;
  var i;
  (function(o) {
    o[o.COPY = 0] = "COPY", o[o.DOWNLOAD = 1] = "DOWNLOAD";
  })(i || (i = {}));
  let c = class extends e.Transform {
    constructor(d, f, r) {
      super(), this.progressDifferentialDownloadInfo = d, this.cancellationToken = f, this.onProgress = r, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.expectedBytes = 0, this.index = 0, this.operationType = i.COPY, this.nextUpdate = this.start + 1e3;
    }
    _transform(d, f, r) {
      if (this.cancellationToken.cancelled) {
        r(new Error("cancelled"), null);
        return;
      }
      if (this.operationType == i.COPY) {
        r(null, d);
        return;
      }
      this.transferred += d.length, this.delta += d.length;
      const h = Date.now();
      h >= this.nextUpdate && this.transferred !== this.expectedBytes && this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && (this.nextUpdate = h + 1e3, this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
        bytesPerSecond: Math.round(this.transferred / ((h - this.start) / 1e3))
      }), this.delta = 0), r(null, d);
    }
    beginFileCopy() {
      this.operationType = i.COPY;
    }
    beginRangeDownload() {
      this.operationType = i.DOWNLOAD, this.expectedBytes += this.progressDifferentialDownloadInfo.expectedByteCounts[this.index++];
    }
    endRangeDownload() {
      this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      });
    }
    // Called when we are 100% done with the connection/download
    _flush(d) {
      if (this.cancellationToken.cancelled) {
        d(new Error("cancelled"));
        return;
      }
      this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      }), this.delta = 0, this.transferred = 0, d(null);
    }
  };
  return Sr.ProgressDifferentialDownloadCallbackTransform = c, Sr;
}
var Ul;
function Vc() {
  if (Ul) return wr;
  Ul = 1, Object.defineProperty(wr, "__esModule", { value: !0 }), wr.DifferentialDownloader = void 0;
  const e = qe(), i = /* @__PURE__ */ Pt(), c = Ct, o = Wc(), d = bt, f = Fs(), r = Td(), h = bd();
  let t = class {
    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    constructor(a, p, g) {
      this.blockAwareFileInfo = a, this.httpExecutor = p, this.options = g, this.fileMetadataBuffer = null, this.logger = g.logger;
    }
    createRequestOptions() {
      const a = {
        headers: {
          ...this.options.requestHeaders,
          accept: "*/*"
        }
      };
      return (0, e.configureRequestUrl)(this.options.newUrl, a), (0, e.configureRequestOptions)(a), a;
    }
    doDownload(a, p) {
      if (a.version !== p.version)
        throw new Error(`version is different (${a.version} - ${p.version}), full download is required`);
      const g = this.logger, v = (0, f.computeOperations)(a, p, g);
      g.debug != null && g.debug(JSON.stringify(v, null, 2));
      let m = 0, w = 0;
      for (const b of v) {
        const D = b.end - b.start;
        b.kind === f.OperationKind.DOWNLOAD ? m += D : w += D;
      }
      const R = this.blockAwareFileInfo.size;
      if (m + w + (this.fileMetadataBuffer == null ? 0 : this.fileMetadataBuffer.length) !== R)
        throw new Error(`Internal error, size mismatch: downloadSize: ${m}, copySize: ${w}, newSize: ${R}`);
      return g.info(`Full: ${l(R)}, To download: ${l(m)} (${Math.round(m / (R / 100))}%)`), this.downloadFile(v);
    }
    downloadFile(a) {
      const p = [], g = () => Promise.all(p.map((v) => (0, i.close)(v.descriptor).catch((m) => {
        this.logger.error(`cannot close file "${v.path}": ${m}`);
      })));
      return this.doDownloadFile(a, p).then(g).catch((v) => g().catch((m) => {
        try {
          this.logger.error(`cannot close files: ${m}`);
        } catch (w) {
          try {
            console.error(w);
          } catch {
          }
        }
        throw v;
      }).then(() => {
        throw v;
      }));
    }
    async doDownloadFile(a, p) {
      const g = await (0, i.open)(this.options.oldFile, "r");
      p.push({ descriptor: g, path: this.options.oldFile });
      const v = await (0, i.open)(this.options.newFile, "w");
      p.push({ descriptor: v, path: this.options.newFile });
      const m = (0, c.createWriteStream)(this.options.newFile, { fd: v });
      await new Promise((w, R) => {
        const b = [];
        let D;
        if (!this.options.isUseMultipleRangeRequest && this.options.onProgress) {
          const $ = [];
          let H = 0;
          for (const C of a)
            C.kind === f.OperationKind.DOWNLOAD && ($.push(C.end - C.start), H += C.end - C.start);
          const U = {
            expectedByteCounts: $,
            grandTotal: H
          };
          D = new h.ProgressDifferentialDownloadCallbackTransform(U, this.options.cancellationToken, this.options.onProgress), b.push(D);
        }
        const P = new e.DigestTransform(this.blockAwareFileInfo.sha512);
        P.isValidateOnEnd = !1, b.push(P), m.on("finish", () => {
          m.close(() => {
            p.splice(1, 1);
            try {
              P.validate();
            } catch ($) {
              R($);
              return;
            }
            w(void 0);
          });
        }), b.push(m);
        let F = null;
        for (const $ of b)
          $.on("error", R), F == null ? F = $ : F = F.pipe($);
        const I = b[0];
        let L;
        if (this.options.isUseMultipleRangeRequest) {
          L = (0, r.executeTasksUsingMultipleRangeRequests)(this, a, I, g, R), L(0);
          return;
        }
        let S = 0, z = null;
        this.logger.info(`Differential download: ${this.options.newUrl}`);
        const G = this.createRequestOptions();
        G.redirect = "manual", L = ($) => {
          var H, U;
          if ($ >= a.length) {
            this.fileMetadataBuffer != null && I.write(this.fileMetadataBuffer), I.end();
            return;
          }
          const C = a[$++];
          if (C.kind === f.OperationKind.COPY) {
            D && D.beginFileCopy(), (0, o.copyData)(C, I, g, R, () => L($));
            return;
          }
          const O = `bytes=${C.start}-${C.end - 1}`;
          G.headers.range = O, (U = (H = this.logger) === null || H === void 0 ? void 0 : H.debug) === null || U === void 0 || U.call(H, `download range: ${O}`), D && D.beginRangeDownload();
          const A = this.httpExecutor.createRequest(G, (k) => {
            k.on("error", R), k.on("aborted", () => {
              R(new Error("response has been aborted by the server"));
            }), k.statusCode >= 400 && R((0, e.createHttpError)(k)), k.pipe(I, {
              end: !1
            }), k.once("end", () => {
              D && D.endRangeDownload(), ++S === 100 ? (S = 0, setTimeout(() => L($), 1e3)) : L($);
            });
          });
          A.on("redirect", (k, M, W) => {
            this.logger.info(`Redirect to ${s(W)}`), z = W, (0, e.configureRequestUrl)(new d.URL(z), G), A.followRedirect();
          }), this.httpExecutor.addErrorAndTimeoutHandlers(A, R), A.end();
        }, L(0);
      });
    }
    async readRemoteBytes(a, p) {
      const g = Buffer.allocUnsafe(p + 1 - a), v = this.createRequestOptions();
      v.headers.range = `bytes=${a}-${p}`;
      let m = 0;
      if (await this.request(v, (w) => {
        w.copy(g, m), m += w.length;
      }), m !== g.length)
        throw new Error(`Received data length ${m} is not equal to expected ${g.length}`);
      return g;
    }
    request(a, p) {
      return new Promise((g, v) => {
        const m = this.httpExecutor.createRequest(a, (w) => {
          (0, r.checkIsRangesSupported)(w, v) && (w.on("error", v), w.on("aborted", () => {
            v(new Error("response has been aborted by the server"));
          }), w.on("data", p), w.on("end", () => g()));
        });
        this.httpExecutor.addErrorAndTimeoutHandlers(m, v), m.end();
      });
    }
  };
  wr.DifferentialDownloader = t;
  function l(n, a = " KB") {
    return new Intl.NumberFormat("en").format((n / 1024).toFixed(2)) + a;
  }
  function s(n) {
    const a = n.indexOf("?");
    return a < 0 ? n : n.substring(0, a);
  }
  return wr;
}
var xl;
function Cd() {
  if (xl) return Er;
  xl = 1, Object.defineProperty(Er, "__esModule", { value: !0 }), Er.GenericDifferentialDownloader = void 0;
  const e = Vc();
  let i = class extends e.DifferentialDownloader {
    download(o, d) {
      return this.doDownload(o, d);
    }
  };
  return Er.GenericDifferentialDownloader = i, Er;
}
var ys = {}, kl;
function jt() {
  return kl || (kl = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.UpdaterSignal = e.UPDATE_DOWNLOADED = e.DOWNLOAD_PROGRESS = e.CancellationToken = void 0, e.addHandler = o;
    const i = qe();
    Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
      return i.CancellationToken;
    } }), e.DOWNLOAD_PROGRESS = "download-progress", e.UPDATE_DOWNLOADED = "update-downloaded";
    class c {
      constructor(f) {
        this.emitter = f;
      }
      /**
       * Emitted when an authenticating proxy is [asking for user credentials](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login).
       */
      login(f) {
        o(this.emitter, "login", f);
      }
      progress(f) {
        o(this.emitter, e.DOWNLOAD_PROGRESS, f);
      }
      updateDownloaded(f) {
        o(this.emitter, e.UPDATE_DOWNLOADED, f);
      }
      updateCancelled(f) {
        o(this.emitter, "update-cancelled", f);
      }
    }
    e.UpdaterSignal = c;
    function o(d, f, r) {
      d.on(f, r);
    }
  })(ys)), ys;
}
var $l;
function Ls() {
  if ($l) return Ut;
  $l = 1, Object.defineProperty(Ut, "__esModule", { value: !0 }), Ut.NoOpLogger = Ut.AppUpdater = void 0;
  const e = qe(), i = Lr, c = an, o = dc, d = /* @__PURE__ */ Pt(), f = bs(), r = Gf(), h = Fe, t = Bc(), l = gd(), s = vd(), n = Ed(), a = Hc(), p = Rd(), g = gc, v = Cd(), m = jt();
  let w = class zc extends o.EventEmitter {
    /**
     * Get the update channel. Doesn't return `channel` from the update configuration, only if was previously set.
     */
    get channel() {
      return this._channel;
    }
    /**
     * Set the update channel. Overrides `channel` in the update configuration.
     *
     * `allowDowngrade` will be automatically set to `true`. If this behavior is not suitable for you, simple set `allowDowngrade` explicitly after.
     */
    set channel(P) {
      if (this._channel != null) {
        if (typeof P != "string")
          throw (0, e.newError)(`Channel must be a string, but got: ${P}`, "ERR_UPDATER_INVALID_CHANNEL");
        if (P.length === 0)
          throw (0, e.newError)("Channel must be not an empty string", "ERR_UPDATER_INVALID_CHANNEL");
      }
      this._channel = P, this.allowDowngrade = !0;
    }
    /**
     *  Shortcut for explicitly adding auth tokens to request headers
     */
    addAuthHeader(P) {
      this.requestHeaders = Object.assign({}, this.requestHeaders, {
        authorization: P
      });
    }
    // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    get netSession() {
      return (0, n.getNetSession)();
    }
    /**
     * The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
     * Set it to `null` if you would like to disable a logging feature.
     */
    get logger() {
      return this._logger;
    }
    set logger(P) {
      this._logger = P ?? new b();
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * test only
     * @private
     */
    set updateConfigPath(P) {
      this.clientPromise = null, this._appUpdateConfigPath = P, this.configOnDisk = new r.Lazy(() => this.loadUpdateConfig());
    }
    /**
     * Allows developer to override default logic for determining if an update is supported.
     * The default logic compares the `UpdateInfo` minimum system version against the `os.release()` with `semver` package
     */
    get isUpdateSupported() {
      return this._isUpdateSupported;
    }
    set isUpdateSupported(P) {
      P && (this._isUpdateSupported = P);
    }
    /**
     * Allows developer to override default logic for determining if the user is below the rollout threshold.
     * The default logic compares the staging percentage with numerical representation of user ID.
     * An override can define custom logic, or bypass it if needed.
     */
    get isUserWithinRollout() {
      return this._isUserWithinRollout;
    }
    set isUserWithinRollout(P) {
      P && (this._isUserWithinRollout = P);
    }
    constructor(P, F) {
      super(), this.autoDownload = !0, this.autoInstallOnAppQuit = !0, this.autoRunAppAfterInstall = !0, this.allowPrerelease = !1, this.fullChangelog = !1, this.allowDowngrade = !1, this.disableWebInstaller = !1, this.disableDifferentialDownload = !1, this.forceDevUpdateConfig = !1, this.previousBlockmapBaseUrlOverride = null, this._channel = null, this.downloadedUpdateHelper = null, this.requestHeaders = null, this._logger = console, this.signals = new m.UpdaterSignal(this), this._appUpdateConfigPath = null, this._isUpdateSupported = (S) => this.checkIfUpdateSupported(S), this._isUserWithinRollout = (S) => this.isStagingMatch(S), this.clientPromise = null, this.stagingUserIdPromise = new r.Lazy(() => this.getOrCreateStagingUserId()), this.configOnDisk = new r.Lazy(() => this.loadUpdateConfig()), this.checkForUpdatesPromise = null, this.downloadPromise = null, this.updateInfoAndProvider = null, this._testOnlyOptions = null, this.on("error", (S) => {
        this._logger.error(`Error: ${S.stack || S.message}`);
      }), F == null ? (this.app = new s.ElectronAppAdapter(), this.httpExecutor = new n.ElectronHttpExecutor((S, z) => this.emit("login", S, z))) : (this.app = F, this.httpExecutor = null);
      const I = this.app.version, L = (0, t.parse)(I);
      if (L == null)
        throw (0, e.newError)(`App version is not a valid semver version: "${I}"`, "ERR_UPDATER_INVALID_VERSION");
      this.currentVersion = L, this.allowPrerelease = R(L), P != null && (this.setFeedURL(P), typeof P != "string" && P.requestHeaders && (this.requestHeaders = P.requestHeaders));
    }
    //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    getFeedURL() {
      return "Deprecated. Do not use it.";
    }
    /**
     * Configure update provider. If value is `string`, [GenericServerOptions](https://www.electron.build/publish#genericserveroptions) will be set with value as `url`.
     * @param options If you want to override configuration in the `app-update.yml`.
     */
    setFeedURL(P) {
      const F = this.createProviderRuntimeOptions();
      let I;
      typeof P == "string" ? I = new a.GenericProvider({ provider: "generic", url: P }, this, {
        ...F,
        isUseMultipleRangeRequest: (0, p.isUrlProbablySupportMultiRangeRequests)(P)
      }) : I = (0, p.createClient)(P, this, F), this.clientPromise = Promise.resolve(I);
    }
    /**
     * Asks the server whether there is an update.
     * @returns null if the updater is disabled, otherwise info about the latest version
     */
    checkForUpdates() {
      if (!this.isUpdaterActive())
        return Promise.resolve(null);
      let P = this.checkForUpdatesPromise;
      if (P != null)
        return this._logger.info("Checking for update (already in progress)"), P;
      const F = () => this.checkForUpdatesPromise = null;
      return this._logger.info("Checking for update"), P = this.doCheckForUpdates().then((I) => (F(), I)).catch((I) => {
        throw F(), this.emit("error", I, `Cannot check for updates: ${(I.stack || I).toString()}`), I;
      }), this.checkForUpdatesPromise = P, P;
    }
    isUpdaterActive() {
      return this.app.isPackaged || this.forceDevUpdateConfig ? !0 : (this._logger.info("Skip checkForUpdates because application is not packed and dev update config is not forced"), !1);
    }
    // noinspection JSUnusedGlobalSymbols
    checkForUpdatesAndNotify(P) {
      return this.checkForUpdates().then((F) => F?.downloadPromise ? (F.downloadPromise.then(() => {
        const I = zc.formatDownloadNotification(F.updateInfo.version, this.app.name, P);
        new qt.Notification(I).show();
      }), F) : (this._logger.debug != null && this._logger.debug("checkForUpdatesAndNotify called, downloadPromise is null"), F));
    }
    static formatDownloadNotification(P, F, I) {
      return I == null && (I = {
        title: "A new update is ready to install",
        body: "{appName} version {version} has been downloaded and will be automatically installed on exit"
      }), I = {
        title: I.title.replace("{appName}", F).replace("{version}", P),
        body: I.body.replace("{appName}", F).replace("{version}", P)
      }, I;
    }
    async isStagingMatch(P) {
      const F = P.stagingPercentage;
      let I = F;
      if (I == null)
        return !0;
      if (I = parseInt(I, 10), isNaN(I))
        return this._logger.warn(`Staging percentage is NaN: ${F}`), !0;
      I = I / 100;
      const L = await this.stagingUserIdPromise.value, z = e.UUID.parse(L).readUInt32BE(12) / 4294967295;
      return this._logger.info(`Staging percentage: ${I}, percentage: ${z}, user id: ${L}`), z < I;
    }
    computeFinalHeaders(P) {
      return this.requestHeaders != null && Object.assign(P, this.requestHeaders), P;
    }
    async isUpdateAvailable(P) {
      const F = (0, t.parse)(P.version);
      if (F == null)
        throw (0, e.newError)(`This file could not be downloaded, or the latest version (from update server) does not have a valid semver version: "${P.version}"`, "ERR_UPDATER_INVALID_VERSION");
      const I = this.currentVersion;
      if ((0, t.eq)(F, I) || !await Promise.resolve(this.isUpdateSupported(P)) || !await Promise.resolve(this.isUserWithinRollout(P)))
        return !1;
      const S = (0, t.gt)(F, I), z = (0, t.lt)(F, I);
      return S ? !0 : this.allowDowngrade && z;
    }
    checkIfUpdateSupported(P) {
      const F = P?.minimumSystemVersion, I = (0, c.release)();
      if (F)
        try {
          if ((0, t.lt)(I, F))
            return this._logger.info(`Current OS version ${I} is less than the minimum OS version required ${F} for version ${I}`), !1;
        } catch (L) {
          this._logger.warn(`Failed to compare current OS version(${I}) with minimum OS version(${F}): ${(L.message || L).toString()}`);
        }
      return !0;
    }
    async getUpdateInfoAndProvider() {
      await this.app.whenReady(), this.clientPromise == null && (this.clientPromise = this.configOnDisk.value.then((I) => (0, p.createClient)(I, this, this.createProviderRuntimeOptions())));
      const P = await this.clientPromise, F = await this.stagingUserIdPromise.value;
      return P.setRequestHeaders(this.computeFinalHeaders({ "x-user-staging-id": F })), {
        info: await P.getLatestVersion(),
        provider: P
      };
    }
    createProviderRuntimeOptions() {
      return {
        isUseMultipleRangeRequest: !0,
        platform: this._testOnlyOptions == null ? process.platform : this._testOnlyOptions.platform,
        executor: this.httpExecutor
      };
    }
    async doCheckForUpdates() {
      this.emit("checking-for-update");
      const P = await this.getUpdateInfoAndProvider(), F = P.info;
      if (!await this.isUpdateAvailable(F))
        return this._logger.info(`Update for version ${this.currentVersion.format()} is not available (latest version: ${F.version}, downgrade is ${this.allowDowngrade ? "allowed" : "disallowed"}).`), this.emit("update-not-available", F), {
          isUpdateAvailable: !1,
          versionInfo: F,
          updateInfo: F
        };
      this.updateInfoAndProvider = P, this.onUpdateAvailable(F);
      const I = new e.CancellationToken();
      return {
        isUpdateAvailable: !0,
        versionInfo: F,
        updateInfo: F,
        cancellationToken: I,
        downloadPromise: this.autoDownload ? this.downloadUpdate(I) : null
      };
    }
    onUpdateAvailable(P) {
      this._logger.info(`Found version ${P.version} (url: ${(0, e.asArray)(P.files).map((F) => F.url).join(", ")})`), this.emit("update-available", P);
    }
    /**
     * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
     * @returns {Promise<Array<string>>} Paths to downloaded files.
     */
    downloadUpdate(P = new e.CancellationToken()) {
      const F = this.updateInfoAndProvider;
      if (F == null) {
        const L = new Error("Please check update first");
        return this.dispatchError(L), Promise.reject(L);
      }
      if (this.downloadPromise != null)
        return this._logger.info("Downloading update (already in progress)"), this.downloadPromise;
      this._logger.info(`Downloading update from ${(0, e.asArray)(F.info.files).map((L) => L.url).join(", ")}`);
      const I = (L) => {
        if (!(L instanceof e.CancellationError))
          try {
            this.dispatchError(L);
          } catch (S) {
            this._logger.warn(`Cannot dispatch error event: ${S.stack || S}`);
          }
        return L;
      };
      return this.downloadPromise = this.doDownloadUpdate({
        updateInfoAndProvider: F,
        requestHeaders: this.computeRequestHeaders(F.provider),
        cancellationToken: P,
        disableWebInstaller: this.disableWebInstaller,
        disableDifferentialDownload: this.disableDifferentialDownload
      }).catch((L) => {
        throw I(L);
      }).finally(() => {
        this.downloadPromise = null;
      }), this.downloadPromise;
    }
    dispatchError(P) {
      this.emit("error", P, (P.stack || P).toString());
    }
    dispatchUpdateDownloaded(P) {
      this.emit(m.UPDATE_DOWNLOADED, P);
    }
    async loadUpdateConfig() {
      return this._appUpdateConfigPath == null && (this._appUpdateConfigPath = this.app.appUpdateConfigPath), (0, f.load)(await (0, d.readFile)(this._appUpdateConfigPath, "utf-8"));
    }
    computeRequestHeaders(P) {
      const F = P.fileExtraDownloadHeaders;
      if (F != null) {
        const I = this.requestHeaders;
        return I == null ? F : {
          ...F,
          ...I
        };
      }
      return this.computeFinalHeaders({ accept: "*/*" });
    }
    async getOrCreateStagingUserId() {
      const P = h.join(this.app.userDataPath, ".updaterId");
      try {
        const I = await (0, d.readFile)(P, "utf-8");
        if (e.UUID.check(I))
          return I;
        this._logger.warn(`Staging user id file exists, but content was invalid: ${I}`);
      } catch (I) {
        I.code !== "ENOENT" && this._logger.warn(`Couldn't read staging user ID, creating a blank one: ${I}`);
      }
      const F = e.UUID.v5((0, i.randomBytes)(4096), e.UUID.OID);
      this._logger.info(`Generated new staging user ID: ${F}`);
      try {
        await (0, d.outputFile)(P, F);
      } catch (I) {
        this._logger.warn(`Couldn't write out staging user ID: ${I}`);
      }
      return F;
    }
    /** @internal */
    get isAddNoCacheQuery() {
      const P = this.requestHeaders;
      if (P == null)
        return !0;
      for (const F of Object.keys(P)) {
        const I = F.toLowerCase();
        if (I === "authorization" || I === "private-token")
          return !1;
      }
      return !0;
    }
    async getOrCreateDownloadHelper() {
      let P = this.downloadedUpdateHelper;
      if (P == null) {
        const F = (await this.configOnDisk.value).updaterCacheDirName, I = this._logger;
        F == null && I.error("updaterCacheDirName is not specified in app-update.yml Was app build using at least electron-builder 20.34.0?");
        const L = h.join(this.app.baseCachePath, F || this.app.name);
        I.debug != null && I.debug(`updater cache dir: ${L}`), P = new l.DownloadedUpdateHelper(L), this.downloadedUpdateHelper = P;
      }
      return P;
    }
    async executeDownload(P) {
      const F = P.fileInfo, I = {
        headers: P.downloadUpdateOptions.requestHeaders,
        cancellationToken: P.downloadUpdateOptions.cancellationToken,
        sha2: F.info.sha2,
        sha512: F.info.sha512
      };
      this.listenerCount(m.DOWNLOAD_PROGRESS) > 0 && (I.onProgress = (te) => this.emit(m.DOWNLOAD_PROGRESS, te));
      const L = P.downloadUpdateOptions.updateInfoAndProvider.info, S = L.version, z = F.packageInfo;
      function G() {
        const te = decodeURIComponent(P.fileInfo.url.pathname);
        return te.toLowerCase().endsWith(`.${P.fileExtension.toLowerCase()}`) ? h.basename(te) : h.basename(P.fileInfo.info.url);
      }
      const $ = await this.getOrCreateDownloadHelper(), H = $.cacheDirForPendingUpdate;
      await (0, d.mkdir)(H, { recursive: !0 });
      const U = G();
      let C = h.join(H, U);
      const O = z == null ? null : h.join(H, `package-${S}${h.extname(z.path) || ".7z"}`), A = async (te) => {
        await $.setDownloadedFile(C, O, L, F, U, te), await P.done({
          ...L,
          downloadedFile: C
        });
        const de = h.join(H, "current.blockmap");
        return await (0, d.pathExists)(de) && await (0, d.copyFile)(de, h.join($.cacheDir, "current.blockmap")), O == null ? [C] : [C, O];
      }, k = this._logger, M = await $.validateDownloadedPath(C, L, F, k);
      if (M != null)
        return C = M, await A(!1);
      const W = async () => (await $.clear().catch(() => {
      }), await (0, d.unlink)(C).catch(() => {
      })), ie = await (0, l.createTempUpdateFile)(`temp-${U}`, H, k);
      try {
        await P.task(ie, I, O, W), await (0, e.retry)(() => (0, d.rename)(ie, C), {
          retries: 60,
          interval: 500,
          shouldRetry: (te) => te instanceof Error && /^EBUSY:/.test(te.message) ? !0 : (k.warn(`Cannot rename temp file to final file: ${te.message || te.stack}`), !1)
        });
      } catch (te) {
        throw await W(), te instanceof e.CancellationError && (k.info("cancelled"), this.emit("update-cancelled", L)), te;
      }
      return k.info(`New version ${S} has been downloaded to ${C}`), await A(!0);
    }
    async differentialDownloadInstaller(P, F, I, L, S) {
      try {
        if (this._testOnlyOptions != null && !this._testOnlyOptions.isUseDifferentialDownload)
          return !0;
        const z = F.updateInfoAndProvider.provider, G = await z.getBlockMapFiles(P.url, this.app.version, F.updateInfoAndProvider.info.version, this.previousBlockmapBaseUrlOverride);
        this._logger.info(`Download block maps (old: "${G[0]}", new: ${G[1]})`);
        const $ = async (k) => {
          const M = await this.httpExecutor.downloadToBuffer(k, {
            headers: F.requestHeaders,
            cancellationToken: F.cancellationToken
          });
          if (M == null || M.length === 0)
            throw new Error(`Blockmap "${k.href}" is empty`);
          try {
            return JSON.parse((0, g.gunzipSync)(M).toString());
          } catch (W) {
            throw new Error(`Cannot parse blockmap "${k.href}", error: ${W}`);
          }
        }, H = {
          newUrl: P.url,
          oldFile: h.join(this.downloadedUpdateHelper.cacheDir, S),
          logger: this._logger,
          newFile: I,
          isUseMultipleRangeRequest: z.isUseMultipleRangeRequest,
          requestHeaders: F.requestHeaders,
          cancellationToken: F.cancellationToken
        };
        this.listenerCount(m.DOWNLOAD_PROGRESS) > 0 && (H.onProgress = (k) => this.emit(m.DOWNLOAD_PROGRESS, k));
        const U = async (k, M) => {
          const W = h.join(M, "current.blockmap");
          await (0, d.outputFile)(W, (0, g.gzipSync)(JSON.stringify(k)));
        }, C = async (k) => {
          const M = h.join(k, "current.blockmap");
          try {
            if (await (0, d.pathExists)(M))
              return JSON.parse((0, g.gunzipSync)(await (0, d.readFile)(M)).toString());
          } catch (W) {
            this._logger.warn(`Cannot parse blockmap "${M}", error: ${W}`);
          }
          return null;
        }, O = await $(G[1]);
        await U(O, this.downloadedUpdateHelper.cacheDirForPendingUpdate);
        let A = await C(this.downloadedUpdateHelper.cacheDir);
        return A == null && (A = await $(G[0])), await new v.GenericDifferentialDownloader(P.info, this.httpExecutor, H).download(A, O), !1;
      } catch (z) {
        if (this._logger.error(`Cannot download differentially, fallback to full download: ${z.stack || z}`), this._testOnlyOptions != null)
          throw z;
        return !0;
      }
    }
  };
  Ut.AppUpdater = w;
  function R(D) {
    const P = (0, t.prerelease)(D);
    return P != null && P.length > 0;
  }
  class b {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    info(P) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    warn(P) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error(P) {
    }
  }
  return Ut.NoOpLogger = b, Ut;
}
var ql;
function mn() {
  if (ql) return lr;
  ql = 1, Object.defineProperty(lr, "__esModule", { value: !0 }), lr.BaseUpdater = void 0;
  const e = on, i = Fe, c = Ls();
  let o = class extends c.AppUpdater {
    constructor(f, r) {
      super(f, r), this.quitAndInstallCalled = !1, this.quitHandlerAdded = !1;
    }
    quitAndInstall(f = !1, r = !1) {
      this._logger.info("Install on explicit quitAndInstall"), this.install(f, f ? r : this.autoRunAppAfterInstall) ? setImmediate(() => {
        qt.autoUpdater.emit("before-quit-for-update"), this.app.quit();
      }) : this.quitAndInstallCalled = !1;
    }
    executeDownload(f) {
      return super.executeDownload({
        ...f,
        done: (r) => (this.dispatchUpdateDownloaded(r), this.addQuitHandler(), Promise.resolve())
      });
    }
    get installerPath() {
      return this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.file;
    }
    // must be sync (because quit even handler is not async)
    install(f = !1, r = !1) {
      if (this.quitAndInstallCalled)
        return this._logger.warn("install call ignored: quitAndInstallCalled is set to true"), !1;
      const h = this.downloadedUpdateHelper, t = this.installerPath, l = h == null ? null : h.downloadedFileInfo;
      if (t == null || l == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      this.quitAndInstallCalled = !0;
      try {
        return this._logger.info(`Install: isSilent: ${f}, isForceRunAfter: ${r}`), this.doInstall({
          isSilent: f,
          isForceRunAfter: r,
          isAdminRightsRequired: l.isAdminRightsRequired
        });
      } catch (s) {
        return this.dispatchError(s), !1;
      }
    }
    addQuitHandler() {
      this.quitHandlerAdded || !this.autoInstallOnAppQuit || (this.quitHandlerAdded = !0, this.app.onQuit((f) => {
        if (this.quitAndInstallCalled) {
          this._logger.info("Update installer has already been triggered. Quitting application.");
          return;
        }
        if (!this.autoInstallOnAppQuit) {
          this._logger.info("Update will not be installed on quit because autoInstallOnAppQuit is set to false.");
          return;
        }
        if (f !== 0) {
          this._logger.info(`Update will be not installed on quit because application is quitting with exit code ${f}`);
          return;
        }
        this._logger.info("Auto install update on quit"), this.install(!0, !1);
      }));
    }
    /**
     * Strips relative-path entries from a PATH string.
     * Prevents PATH-poisoning where a writable directory earlier in PATH shadows
     * a trusted package manager binary.
     */
    sanitizeEnvPath(f) {
      return f.split(i.delimiter).filter((r) => i.isAbsolute(r)).join(i.delimiter);
    }
    spawnSyncLog(f, r = [], h = {}) {
      var t;
      this._logger.info(`Executing: ${f} with args: ${r}`);
      const l = { ...process.env, ...h }, s = (0, e.spawnSync)(f, r, {
        env: { ...l, PATH: this.sanitizeEnvPath((t = l.PATH) !== null && t !== void 0 ? t : "") },
        encoding: "utf-8",
        shell: !0
      }), { error: n, status: a, stdout: p, stderr: g } = s;
      if (n != null)
        throw this._logger.error(g), n;
      if (a != null && a !== 0)
        throw this._logger.error(g), new Error(`Command ${f} exited with code ${a}`);
      return p.trim();
    }
    /**
     * This handles both node 8 and node 10 way of emitting error when spawning a process
     *   - node 8: Throws the error
     *   - node 10: Emit the error(Need to listen with on)
     */
    // https://github.com/electron-userland/electron-builder/issues/1129
    // Node 8 sends errors: https://nodejs.org/dist/latest-v8.x/docs/api/errors.html#errors_common_system_errors
    async spawnLog(f, r = [], h = void 0, t = "ignore") {
      return this._logger.info(`Executing: ${f} with args: ${r}`), new Promise((l, s) => {
        try {
          const n = { stdio: t, env: h, detached: !0 }, a = (0, e.spawn)(f, r, n);
          a.on("error", (p) => {
            s(p);
          }), a.unref(), a.pid !== void 0 && l(!0);
        } catch (n) {
          s(n);
        }
      });
    }
  };
  return lr.BaseUpdater = o, lr;
}
var Ar = {}, Rr = {}, Ml;
function Yc() {
  if (Ml) return Rr;
  Ml = 1, Object.defineProperty(Rr, "__esModule", { value: !0 }), Rr.FileWithEmbeddedBlockMapDifferentialDownloader = void 0;
  const e = /* @__PURE__ */ Pt(), i = Vc(), c = gc;
  let o = class extends i.DifferentialDownloader {
    async download() {
      const h = this.blockAwareFileInfo, t = h.size, l = t - (h.blockMapSize + 4);
      this.fileMetadataBuffer = await this.readRemoteBytes(l, t - 1);
      const s = d(this.fileMetadataBuffer.slice(0, this.fileMetadataBuffer.length - 4));
      await this.doDownload(await f(this.options.oldFile), s);
    }
  };
  Rr.FileWithEmbeddedBlockMapDifferentialDownloader = o;
  function d(r) {
    return JSON.parse((0, c.inflateRawSync)(r).toString());
  }
  async function f(r) {
    const h = await (0, e.open)(r, "r");
    try {
      const t = (await (0, e.fstat)(h)).size, l = Buffer.allocUnsafe(4);
      await (0, e.read)(h, l, 0, l.length, t - l.length);
      const s = Buffer.allocUnsafe(l.readUInt32BE(0));
      return await (0, e.read)(h, s, 0, s.length, t - l.length - s.length), await (0, e.close)(h), d(s);
    } catch (t) {
      throw await (0, e.close)(h), t;
    }
  }
  return Rr;
}
var Bl;
function jl() {
  if (Bl) return Ar;
  Bl = 1, Object.defineProperty(Ar, "__esModule", { value: !0 }), Ar.AppImageUpdater = void 0;
  const e = qe(), i = on, c = /* @__PURE__ */ Pt(), o = Ct, d = Fe, f = mn(), r = Yc(), h = Qe(), t = jt();
  let l = class extends f.BaseUpdater {
    constructor(n, a) {
      super(n, a);
    }
    isUpdaterActive() {
      return process.env.APPIMAGE == null && !this.forceDevUpdateConfig ? (process.env.SNAP == null ? this._logger.warn("APPIMAGE env is not defined, current application is not an AppImage") : this._logger.info("SNAP env is defined, updater is disabled"), !1) : super.isUpdaterActive();
    }
    /*** @private */
    doDownloadUpdate(n) {
      const a = n.updateInfoAndProvider.provider, p = (0, h.findFile)(a.resolveFiles(n.updateInfoAndProvider.info), "AppImage", ["rpm", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "AppImage",
        fileInfo: p,
        downloadUpdateOptions: n,
        task: async (g, v) => {
          const m = process.env.APPIMAGE;
          if (m == null)
            throw (0, e.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
          (n.disableDifferentialDownload || await this.downloadDifferential(p, m, g, a, n)) && await this.httpExecutor.download(p.url, g, v), await (0, c.chmod)(g, 493);
        }
      });
    }
    async downloadDifferential(n, a, p, g, v) {
      try {
        const m = {
          newUrl: n.url,
          oldFile: a,
          logger: this._logger,
          newFile: p,
          isUseMultipleRangeRequest: g.isUseMultipleRangeRequest,
          requestHeaders: v.requestHeaders,
          cancellationToken: v.cancellationToken
        };
        return this.listenerCount(t.DOWNLOAD_PROGRESS) > 0 && (m.onProgress = (w) => this.emit(t.DOWNLOAD_PROGRESS, w)), await new r.FileWithEmbeddedBlockMapDifferentialDownloader(n.info, this.httpExecutor, m).download(), !1;
      } catch (m) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${m.stack || m}`), process.platform === "linux";
      }
    }
    doInstall(n) {
      const a = process.env.APPIMAGE;
      if (a == null)
        throw (0, e.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
      if (!d.isAbsolute(a) || a.includes("\0"))
        throw (0, e.newError)(`APPIMAGE env is not a valid absolute path: "${a}"`, "ERR_UPDATER_OLD_FILE_NOT_FOUND");
      (0, o.unlinkSync)(a);
      let p;
      const g = d.basename(a), v = this.installerPath;
      if (v == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      d.basename(v) === g || !/\d+\.\d+\.\d+/.test(g) ? p = a : p = d.join(d.dirname(a), d.basename(v)), (0, i.execFileSync)("mv", ["-f", v, p]), p !== a && this.emit("appimage-filename-updated", p);
      const m = {
        ...process.env,
        APPIMAGE_SILENT_INSTALL: "true"
      };
      return n.isForceRunAfter ? this.spawnLog(p, [], m) : (m.APPIMAGE_EXIT_AFTER_INSTALL = "true", (0, i.execFileSync)(p, [], { env: m })), !0;
    }
  };
  return Ar.AppImageUpdater = l, Ar;
}
var Tr = {}, br = {}, Hl;
function Us() {
  if (Hl) return br;
  Hl = 1, Object.defineProperty(br, "__esModule", { value: !0 }), br.LinuxUpdater = void 0;
  const e = mn(), i = /^[a-zA-Z0-9_-]+$/;
  let c = class extends e.BaseUpdater {
    constructor(d, f) {
      super(d, f);
    }
    /**
     * Returns true if the current process is running as root.
     */
    isRunningAsRoot() {
      var d;
      return ((d = process.getuid) === null || d === void 0 ? void 0 : d.call(process)) === 0;
    }
    /**
     * Sanitizes the installer path for use with shell:true spawn calls.
     * Backslash-escapes metacharacters that have special meaning in POSIX shell.
     * Note: paths containing single-quotes (') are not supported.
     */
    get installerPath() {
      const d = super.installerPath;
      return d == null ? null : d.replace(/\\/g, "\\\\").replace(/([`$!" ;|&()<>])/g, "\\$1").replace(/[\n\r]/g, "");
    }
    runCommandWithSudoIfNeeded(d) {
      if (this.isRunningAsRoot())
        return this._logger.info("Running as root, no need to use sudo"), this.spawnSyncLog(d[0], d.slice(1));
      const { name: f } = this.app, h = `"${f.replace(/["`$\\!\n\r;|&<>(){}*?[\]#~]/g, "")} would like to update"`, t = this.sudoWithArgs(h);
      this._logger.info(`Running as non-root user, using sudo to install: ${t}`);
      let l = '"';
      return (/pkexec/i.test(t[0]) || t[0] === "sudo") && (l = ""), this.spawnSyncLog(t[0], [...t.length > 1 ? t.slice(1) : [], `${l}/bin/bash`, "-c", `'${d.join(" ")}'${l}`]);
    }
    sudoWithArgs(d) {
      const f = this.determineSudoCommand(), r = [f];
      return /kdesudo/i.test(f) ? (r.push("--comment", d), r.push("-c")) : /gksudo/i.test(f) ? r.push("--message", d) : /pkexec/i.test(f) && r.push("--disable-internal-agent"), r;
    }
    hasCommand(d) {
      try {
        return this.spawnSyncLog("command", ["-v", d]), !0;
      } catch {
        return !1;
      }
    }
    determineSudoCommand() {
      const d = ["gksudo", "kdesudo", "pkexec", "beesu"];
      for (const f of d)
        if (this.hasCommand(f))
          return f;
      return "sudo";
    }
    /**
     * Detects the package manager to use based on the available commands.
     * Allows overriding the default behavior by setting the ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER environment variable.
     * If the environment variable is set, it will be used directly. (This is useful for testing each package manager logic path.)
     * Otherwise, it checks for the presence of the specified package manager commands in the order provided.
     * @param pms - An array of package manager commands to check for, in priority order.
     * @returns The detected package manager command or "unknown" if none are found.
     */
    detectPackageManager(d) {
      var f;
      let r = d;
      const h = (f = process.env.ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER) === null || f === void 0 ? void 0 : f.trim();
      h && (i.test(h) ? r = [h] : this._logger.warn(`ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER "${h}" contains unsafe characters. Ignoring override.`));
      for (const s of r)
        if (this.hasCommand(s))
          return s;
      const t = h ? `ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER override "${h}", ` : "", l = d[0];
      return this._logger.warn(`No package manager found in the list: ${t}${d.join(", ")}. Utilizing default: ${l}`), l;
    }
  };
  return br.LinuxUpdater = c, br;
}
var Gl;
function Wl() {
  if (Gl) return Tr;
  Gl = 1, Object.defineProperty(Tr, "__esModule", { value: !0 }), Tr.DebUpdater = void 0;
  const e = Qe(), i = jt(), c = Us();
  let o = class Xc extends c.LinuxUpdater {
    constructor(f, r) {
      super(f, r);
    }
    /*** @private */
    doDownloadUpdate(f) {
      const r = f.updateInfoAndProvider.provider, h = (0, e.findFile)(r.resolveFiles(f.updateInfoAndProvider.info), "deb", ["AppImage", "rpm", "pacman"]);
      return this.executeDownload({
        fileExtension: "deb",
        fileInfo: h,
        downloadUpdateOptions: f,
        task: async (t, l) => {
          this.listenerCount(i.DOWNLOAD_PROGRESS) > 0 && (l.onProgress = (s) => this.emit(i.DOWNLOAD_PROGRESS, s)), await this.httpExecutor.download(h.url, t, l);
        }
      });
    }
    doInstall(f) {
      const r = this.installerPath;
      if (r == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      if (!this.hasCommand("dpkg") && !this.hasCommand("apt"))
        return this.dispatchError(new Error("Neither dpkg nor apt command found. Cannot install .deb package.")), !1;
      const h = ["dpkg", "apt"], t = this.detectPackageManager(h);
      try {
        Xc.installWithCommandRunner(t, r, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
      } catch (l) {
        return this.dispatchError(l), !1;
      }
      return f.isForceRunAfter && this.app.relaunch(), !0;
    }
    static installWithCommandRunner(f, r, h, t) {
      var l;
      if (f === "dpkg")
        try {
          h(["dpkg", "-i", r]);
        } catch (s) {
          t.warn((l = s.message) !== null && l !== void 0 ? l : s), t.warn("dpkg installation failed, trying to fix broken dependencies with apt-get"), h(["apt-get", "install", "-f", "-y"]);
        }
      else if (f === "apt")
        t.warn("Using apt to install a local .deb. This may fail for unsigned packages unless properly configured."), h([
          "apt",
          "install",
          "-y",
          "--allow-unauthenticated",
          // needed for unsigned .debs
          "--allow-downgrades",
          // allow lower version installs
          "--allow-change-held-packages",
          r
        ]);
      else
        throw new Error(`Package manager ${f} not supported`);
    }
  };
  return Tr.DebUpdater = o, Tr;
}
var Cr = {}, Vl;
function zl() {
  if (Vl) return Cr;
  Vl = 1, Object.defineProperty(Cr, "__esModule", { value: !0 }), Cr.PacmanUpdater = void 0;
  const e = jt(), i = Qe(), c = Us();
  let o = class Jc extends c.LinuxUpdater {
    constructor(f, r) {
      super(f, r);
    }
    /*** @private */
    doDownloadUpdate(f) {
      const r = f.updateInfoAndProvider.provider, h = (0, i.findFile)(r.resolveFiles(f.updateInfoAndProvider.info), "pacman", ["AppImage", "deb", "rpm"]);
      return this.executeDownload({
        fileExtension: "pacman",
        fileInfo: h,
        downloadUpdateOptions: f,
        task: async (t, l) => {
          this.listenerCount(e.DOWNLOAD_PROGRESS) > 0 && (l.onProgress = (s) => this.emit(e.DOWNLOAD_PROGRESS, s)), await this.httpExecutor.download(h.url, t, l);
        }
      });
    }
    doInstall(f) {
      const r = this.installerPath;
      if (r == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      try {
        Jc.installWithCommandRunner(r, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
      } catch (h) {
        return this.dispatchError(h), !1;
      }
      return f.isForceRunAfter && this.app.relaunch(), !0;
    }
    static installWithCommandRunner(f, r, h) {
      var t;
      try {
        r(["pacman", "-U", "--noconfirm", f]);
      } catch (l) {
        h.warn((t = l.message) !== null && t !== void 0 ? t : l), h.warn("pacman installation failed, attempting to update package database and retry");
        try {
          r(["pacman", "-Sy", "--noconfirm"]), r(["pacman", "-U", "--noconfirm", f]);
        } catch (s) {
          throw h.error("Retry after pacman -Sy failed"), s;
        }
      }
    }
  };
  return Cr.PacmanUpdater = o, Cr;
}
var Pr = {}, Yl;
function Xl() {
  if (Yl) return Pr;
  Yl = 1, Object.defineProperty(Pr, "__esModule", { value: !0 }), Pr.RpmUpdater = void 0;
  const e = jt(), i = Qe(), c = Us();
  let o = class Kc extends c.LinuxUpdater {
    constructor(f, r) {
      super(f, r);
    }
    /*** @private */
    doDownloadUpdate(f) {
      const r = f.updateInfoAndProvider.provider, h = (0, i.findFile)(r.resolveFiles(f.updateInfoAndProvider.info), "rpm", ["AppImage", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "rpm",
        fileInfo: h,
        downloadUpdateOptions: f,
        task: async (t, l) => {
          this.listenerCount(e.DOWNLOAD_PROGRESS) > 0 && (l.onProgress = (s) => this.emit(e.DOWNLOAD_PROGRESS, s)), await this.httpExecutor.download(h.url, t, l);
        }
      });
    }
    doInstall(f) {
      const r = this.installerPath;
      if (r == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      const h = ["zypper", "dnf", "yum", "rpm"], t = this.detectPackageManager(h);
      try {
        Kc.installWithCommandRunner(t, r, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
      } catch (l) {
        return this.dispatchError(l), !1;
      }
      return f.isForceRunAfter && this.app.relaunch(), !0;
    }
    static installWithCommandRunner(f, r, h, t) {
      if (f === "zypper")
        return h(["zypper", "--non-interactive", "--no-refresh", "install", "--allow-unsigned-rpm", "-f", r]);
      if (f === "dnf")
        return h(["dnf", "install", "--nogpgcheck", "-y", r]);
      if (f === "yum")
        return h(["yum", "install", "--nogpgcheck", "-y", r]);
      if (f === "rpm")
        return t.warn("Installing with rpm only (no dependency resolution)."), h(["rpm", "-Uvh", "--replacepkgs", "--replacefiles", "--nodeps", r]);
      throw new Error(`Package manager ${f} not supported`);
    }
  };
  return Pr.RpmUpdater = o, Pr;
}
var Ir = {}, Jl;
function Kl() {
  if (Jl) return Ir;
  Jl = 1, Object.defineProperty(Ir, "__esModule", { value: !0 }), Ir.MacUpdater = void 0;
  const e = qe(), i = /* @__PURE__ */ Pt(), c = Ct, o = Fe, d = ef, f = Ls(), r = Qe(), h = on, t = Lr;
  let l = class Qc extends f.AppUpdater {
    constructor(n, a) {
      super(n, a), this.nativeUpdater = qt.autoUpdater, this.squirrelDownloadedUpdate = !1, this.nativeUpdater.on("error", (p) => {
        this._logger.warn(p), this.emit("error", p);
      }), this.nativeUpdater.on("update-downloaded", () => {
        this.squirrelDownloadedUpdate = !0, this.debug("nativeUpdater.update-downloaded");
      });
    }
    /** Filters update files to the appropriate architecture.
     * On arm64 Macs (including Rosetta), arm64 files are preferred when available.
     * On x64 Macs, arm64 files are excluded. */
    static filterFilesForArch(n, a) {
      const p = (g) => {
        var v;
        return g.url.pathname.includes("arm64") || ((v = g.info.url) === null || v === void 0 ? void 0 : v.includes("arm64"));
      };
      return a && n.some(p) ? n.filter((g) => a === p(g)) : n.filter((g) => !p(g));
    }
    debug(n) {
      this._logger.debug != null && this._logger.debug(n);
    }
    closeServerIfExists() {
      this.server && (this.debug("Closing proxy server"), this.server.close((n) => {
        n && this.debug("proxy server wasn't already open, probably attempted closing again as a safety check before quit");
      }));
    }
    async doDownloadUpdate(n) {
      let a = n.updateInfoAndProvider.provider.resolveFiles(n.updateInfoAndProvider.info);
      const p = this._logger, g = "sysctl.proc_translated";
      let v = !1;
      try {
        this.debug("Checking for macOS Rosetta environment"), v = (0, h.execFileSync)("sysctl", [g], { encoding: "utf8" }).includes(`${g}: 1`), p.info(`Checked for macOS Rosetta environment (isRosetta=${v})`);
      } catch (D) {
        p.warn(`sysctl shell command to check for macOS Rosetta environment failed: ${D}`);
      }
      let m = !1;
      try {
        this.debug("Checking for arm64 in uname");
        const P = (0, h.execFileSync)("uname", ["-a"], { encoding: "utf8" }).includes("ARM");
        p.info(`Checked 'uname -a': arm64=${P}`), m = m || P;
      } catch (D) {
        p.warn(`uname shell command to check for arm64 failed: ${D}`);
      }
      m = m || process.arch === "arm64" || v, a = Qc.filterFilesForArch(a, m);
      const w = (0, r.findFile)(a, "zip", ["pkg", "dmg"]);
      if (w == null)
        throw (0, e.newError)(`ZIP file not provided: ${(0, e.safeStringifyJson)(a)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
      const R = n.updateInfoAndProvider.provider, b = "update.zip";
      return this.executeDownload({
        fileExtension: "zip",
        fileInfo: w,
        downloadUpdateOptions: n,
        task: async (D, P) => {
          const F = o.join(this.downloadedUpdateHelper.cacheDir, b), I = () => (0, i.pathExistsSync)(F) ? !n.disableDifferentialDownload : (p.info("Unable to locate previous update.zip for differential download (is this first install?), falling back to full download"), !1);
          let L = !0;
          I() && (L = await this.differentialDownloadInstaller(w, n, D, R, b)), L && await this.httpExecutor.download(w.url, D, P);
        },
        done: async (D) => {
          if (!n.disableDifferentialDownload)
            try {
              const P = o.join(this.downloadedUpdateHelper.cacheDir, b);
              await (0, i.copyFile)(D.downloadedFile, P);
            } catch (P) {
              this._logger.warn(`Unable to copy file for caching for future differential downloads: ${P.message}`);
            }
          return this.updateDownloaded(w, D);
        }
      });
    }
    async updateDownloaded(n, a) {
      var p;
      const g = a.downloadedFile, v = (p = n.info.size) !== null && p !== void 0 ? p : (await (0, i.stat)(g)).size, m = this._logger, w = `fileToProxy=${n.url.href}`;
      this.closeServerIfExists(), this.debug(`Creating proxy server for native Squirrel.Mac (${w})`), this.server = (0, d.createServer)(), this.debug(`Proxy server for native Squirrel.Mac is created (${w})`), this.server.on("close", () => {
        m.info(`Proxy server for native Squirrel.Mac is closed (${w})`);
      });
      const R = (b) => {
        const D = b.address();
        return typeof D == "string" ? D : `http://127.0.0.1:${D?.port}`;
      };
      return await new Promise((b, D) => {
        const P = (0, t.randomBytes)(64).toString("base64").replace(/\//g, "_").replace(/\+/g, "-"), F = Buffer.from(`autoupdater:${P}`, "ascii"), I = `/${(0, t.randomBytes)(64).toString("hex")}.zip`;
        this.server.on("request", (L, S) => {
          const z = L.url;
          if (m.info(`${z} requested`), z === "/") {
            if (!L.headers.authorization || L.headers.authorization.indexOf("Basic ") === -1) {
              S.statusCode = 401, S.statusMessage = "Invalid Authentication Credentials", S.end(), m.warn("No authenthication info");
              return;
            }
            const H = L.headers.authorization.split(" ")[1], U = Buffer.from(H, "base64").toString("ascii"), [C, O] = U.split(":");
            if (C !== "autoupdater" || O !== P) {
              S.statusCode = 401, S.statusMessage = "Invalid Authentication Credentials", S.end(), m.warn("Invalid authenthication credentials");
              return;
            }
            const A = Buffer.from(`{ "url": "${R(this.server)}${I}" }`);
            S.writeHead(200, { "Content-Type": "application/json", "Content-Length": A.length }), S.end(A);
            return;
          }
          if (!z.startsWith(I)) {
            m.warn(`${z} requested, but not supported`), S.writeHead(404), S.end();
            return;
          }
          m.info(`${I} requested by Squirrel.Mac, pipe ${g}`);
          let G = !1;
          S.on("finish", () => {
            G || (this.nativeUpdater.removeListener("error", D), b([]));
          });
          const $ = (0, c.createReadStream)(g);
          $.on("error", (H) => {
            try {
              S.end();
            } catch (U) {
              m.warn(`cannot end response: ${U}`);
            }
            G = !0, this.nativeUpdater.removeListener("error", D), D(new Error(`Cannot pipe "${g}": ${H}`));
          }), S.writeHead(200, {
            "Content-Type": "application/zip",
            "Content-Length": v
          }), $.pipe(S);
        }), this.debug(`Proxy server for native Squirrel.Mac is starting to listen (${w})`), this.server.listen(0, "127.0.0.1", () => {
          this.debug(`Proxy server for native Squirrel.Mac is listening (address=${R(this.server)}, ${w})`), this.nativeUpdater.setFeedURL({
            url: R(this.server),
            headers: {
              "Cache-Control": "no-cache",
              Authorization: `Basic ${F.toString("base64")}`
            }
          }), this.dispatchUpdateDownloaded(a), this.autoInstallOnAppQuit ? (this.nativeUpdater.once("error", D), this.nativeUpdater.checkForUpdates()) : b([]);
        });
      });
    }
    handleUpdateDownloaded() {
      this.autoRunAppAfterInstall ? this.nativeUpdater.quitAndInstall() : this.app.quit(), this.closeServerIfExists();
    }
    quitAndInstall() {
      this.squirrelDownloadedUpdate ? this.handleUpdateDownloaded() : (this.nativeUpdater.on("update-downloaded", () => this.handleUpdateDownloaded()), this.autoInstallOnAppQuit || this.nativeUpdater.checkForUpdates());
    }
  };
  return Ir.MacUpdater = l, Ir;
}
var Or = {}, rn = {}, Ql;
function Pd() {
  if (Ql) return rn;
  Ql = 1, Object.defineProperty(rn, "__esModule", { value: !0 }), rn.verifySignature = f;
  const e = qe(), i = on, c = an, o = Fe;
  function d(l, s) {
    return ['set "PSModulePath=" & chcp 65001 >NUL & powershell.exe', ["-NoProfile", "-NonInteractive", "-InputFormat", "None", "-Command", l], {
      shell: !0,
      timeout: s
    }];
  }
  function f(l, s, n) {
    return new Promise((a, p) => {
      const g = s.replace(/'/g, "''");
      n.info(`Verifying signature ${g}`), (0, i.execFile)(...d(`"Get-AuthenticodeSignature -LiteralPath '${g}' | ConvertTo-Json -Compress"`, 20 * 1e3), (v, m, w) => {
        var R;
        try {
          if (v != null || w) {
            h(n, v, w, p), a(null);
            return;
          }
          const b = r(m);
          if (b.Status === 0) {
            try {
              const I = o.normalize(b.Path), L = o.normalize(s);
              if (n.info(`LiteralPath: ${I}. Update Path: ${L}`), I !== L) {
                h(n, new Error(`LiteralPath of ${I} is different than ${L}`), w, p), a(null);
                return;
              }
            } catch (I) {
              n.warn(`Unable to verify LiteralPath of update asset due to missing data.Path. Skipping this step of validation. Message: ${(R = I.message) !== null && R !== void 0 ? R : I.stack}`);
            }
            const P = (0, e.parseDn)(b.SignerCertificate.Subject);
            let F = !1;
            for (const I of l) {
              const L = (0, e.parseDn)(I);
              if (L.size ? F = Array.from(L.keys()).every((z) => L.get(z) === P.get(z)) : I === P.get("CN") && (n.warn(`Signature validated using only CN ${I}. Please add your full Distinguished Name (DN) to publisherNames configuration`), F = !0), F) {
                a(null);
                return;
              }
            }
          }
          const D = `publisherNames: ${l.join(" | ")}, raw info: ` + JSON.stringify(b, (P, F) => P === "RawData" ? void 0 : F, 2);
          n.warn(`Sign verification failed, installer signed with incorrect certificate: ${D}`), a(D);
        } catch (b) {
          h(n, b, null, p), a(null);
          return;
        }
      });
    });
  }
  function r(l) {
    const s = JSON.parse(l);
    delete s.PrivateKey, delete s.IsOSBinary, delete s.SignatureType;
    const n = s.SignerCertificate;
    return n != null && (delete n.Archived, delete n.Extensions, delete n.Handle, delete n.HasPrivateKey, delete n.SubjectName), s;
  }
  function h(l, s, n, a) {
    if (t()) {
      l.warn(`Cannot execute Get-AuthenticodeSignature: ${s || n}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    try {
      (0, i.execFileSync)(...d("ConvertTo-Json test", 10 * 1e3));
    } catch (p) {
      l.warn(`Cannot execute ConvertTo-Json: ${p.message}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    s != null && a(s), n && a(new Error(`Cannot execute Get-AuthenticodeSignature, stderr: ${n}. Failing signature validation due to unknown stderr.`));
  }
  function t() {
    const l = c.release();
    return l.startsWith("6.") && !l.startsWith("6.3");
  }
  return rn;
}
var Zl;
function ec() {
  if (Zl) return Or;
  Zl = 1, Object.defineProperty(Or, "__esModule", { value: !0 }), Or.NsisUpdater = void 0;
  const e = qe(), i = Fe, c = mn(), o = Yc(), d = jt(), f = Qe(), r = /* @__PURE__ */ Pt(), h = Pd(), t = bt;
  let l = class extends c.BaseUpdater {
    constructor(n, a) {
      super(n, a), this._verifyUpdateCodeSignature = (p, g) => (0, h.verifySignature)(p, g, this._logger);
    }
    /**
     * The verifyUpdateCodeSignature. You can pass [win-verify-signature](https://github.com/beyondkmp/win-verify-trust) or another custom verify function: ` (publisherName: string[], path: string) => Promise<string | null>`.
     * The default verify function uses [windowsExecutableCodeSignatureVerifier](https://github.com/electron-userland/electron-builder/blob/master/packages/electron-updater/src/windowsExecutableCodeSignatureVerifier.ts)
     */
    get verifyUpdateCodeSignature() {
      return this._verifyUpdateCodeSignature;
    }
    set verifyUpdateCodeSignature(n) {
      n && (this._verifyUpdateCodeSignature = n);
    }
    /*** @private */
    doDownloadUpdate(n) {
      const a = n.updateInfoAndProvider.provider, p = (0, f.findFile)(a.resolveFiles(n.updateInfoAndProvider.info), "exe");
      return this.executeDownload({
        fileExtension: "exe",
        downloadUpdateOptions: n,
        fileInfo: p,
        task: async (g, v, m, w) => {
          const R = p.packageInfo, b = R != null && m != null;
          if (b && n.disableWebInstaller)
            throw (0, e.newError)(`Unable to download new version ${n.updateInfoAndProvider.info.version}. Web Installers are disabled`, "ERR_UPDATER_WEB_INSTALLER_DISABLED");
          !b && !n.disableWebInstaller && this._logger.warn("disableWebInstaller is set to false, you should set it to true if you do not plan on using a web installer. This will default to true in a future version."), (b || n.disableDifferentialDownload || await this.differentialDownloadInstaller(p, n, g, a, e.CURRENT_APP_INSTALLER_FILE_NAME)) && await this.httpExecutor.download(p.url, g, v);
          const D = await this.verifySignature(g);
          if (D != null)
            throw await w(), (0, e.newError)(`New version ${n.updateInfoAndProvider.info.version} is not signed by the application owner: ${D}`, "ERR_UPDATER_INVALID_SIGNATURE");
          if (b && await this.differentialDownloadWebPackage(n, R, m, a))
            try {
              await this.httpExecutor.download(new t.URL(R.path), m, {
                headers: n.requestHeaders,
                cancellationToken: n.cancellationToken,
                sha512: R.sha512
              });
            } catch (P) {
              try {
                await (0, r.unlink)(m);
              } catch {
              }
              throw P;
            }
        }
      });
    }
    // $certificateInfo = (Get-AuthenticodeSignature 'xxx\yyy.exe'
    // | where {$_.Status.Equals([System.Management.Automation.SignatureStatus]::Valid) -and $_.SignerCertificate.Subject.Contains("CN=siemens.com")})
    // | Out-String ; if ($certificateInfo) { exit 0 } else { exit 1 }
    async verifySignature(n) {
      let a;
      try {
        if (a = (await this.configOnDisk.value).publisherName, a == null)
          return null;
      } catch (p) {
        if (p.code === "ENOENT")
          return null;
        throw p;
      }
      return await this._verifyUpdateCodeSignature(Array.isArray(a) ? a : [a], n);
    }
    doInstall(n) {
      const a = this.installerPath;
      if (a == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      const p = ["--updated"];
      n.isSilent && p.push("/S"), n.isForceRunAfter && p.push("--force-run"), this.installDirectory && p.push(`/D=${this.installDirectory}`);
      const g = this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.packageFile;
      g != null && p.push(`--package-file=${g}`);
      const v = () => {
        this.spawnLog(i.join(process.resourcesPath, "elevate.exe"), [a].concat(p)).catch((m) => this.dispatchError(m));
      };
      return n.isAdminRightsRequired ? (this._logger.info("isAdminRightsRequired is set to true, run installer using elevate.exe"), v(), !0) : (this.spawnLog(a, p).catch((m) => {
        const w = m.code;
        this._logger.info(`Cannot run installer: error code: ${w}, error message: "${m.message}", will be executed again using elevate if EACCES, and will try to use electron.shell.openItem if ENOENT`), w === "UNKNOWN" || w === "EACCES" ? v() : w === "ENOENT" ? qt.shell.openPath(a).catch((R) => this.dispatchError(R)) : this.dispatchError(m);
      }), !0);
    }
    async differentialDownloadWebPackage(n, a, p, g) {
      if (a.blockMapSize == null)
        return !0;
      try {
        const v = {
          newUrl: new t.URL(a.path),
          oldFile: i.join(this.downloadedUpdateHelper.cacheDir, e.CURRENT_APP_PACKAGE_FILE_NAME),
          logger: this._logger,
          newFile: p,
          requestHeaders: this.requestHeaders,
          isUseMultipleRangeRequest: g.isUseMultipleRangeRequest,
          cancellationToken: n.cancellationToken
        };
        this.listenerCount(d.DOWNLOAD_PROGRESS) > 0 && (v.onProgress = (m) => this.emit(d.DOWNLOAD_PROGRESS, m)), await new o.FileWithEmbeddedBlockMapDifferentialDownloader(a, this.httpExecutor, v).download();
      } catch (v) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${v.stack || v}`), process.platform === "win32";
      }
      return !1;
    }
  };
  return Or.NsisUpdater = l, Or;
}
var tc;
function Id() {
  return tc || (tc = 1, (function(e) {
    var i = Lt && Lt.__createBinding || (Object.create ? (function(m, w, R, b) {
      b === void 0 && (b = R);
      var D = Object.getOwnPropertyDescriptor(w, R);
      (!D || ("get" in D ? !w.__esModule : D.writable || D.configurable)) && (D = { enumerable: !0, get: function() {
        return w[R];
      } }), Object.defineProperty(m, b, D);
    }) : (function(m, w, R, b) {
      b === void 0 && (b = R), m[b] = w[R];
    })), c = Lt && Lt.__exportStar || function(m, w) {
      for (var R in m) R !== "default" && !Object.prototype.hasOwnProperty.call(w, R) && i(w, m, R);
    };
    Object.defineProperty(e, "__esModule", { value: !0 }), e.NsisUpdater = e.MacUpdater = e.RpmUpdater = e.PacmanUpdater = e.DebUpdater = e.AppImageUpdater = e.Provider = e.NoOpLogger = e.AppUpdater = e.BaseUpdater = void 0;
    const o = /* @__PURE__ */ Pt(), d = Fe;
    var f = mn();
    Object.defineProperty(e, "BaseUpdater", { enumerable: !0, get: function() {
      return f.BaseUpdater;
    } });
    var r = Ls();
    Object.defineProperty(e, "AppUpdater", { enumerable: !0, get: function() {
      return r.AppUpdater;
    } }), Object.defineProperty(e, "NoOpLogger", { enumerable: !0, get: function() {
      return r.NoOpLogger;
    } });
    var h = Qe();
    Object.defineProperty(e, "Provider", { enumerable: !0, get: function() {
      return h.Provider;
    } });
    var t = jl();
    Object.defineProperty(e, "AppImageUpdater", { enumerable: !0, get: function() {
      return t.AppImageUpdater;
    } });
    var l = Wl();
    Object.defineProperty(e, "DebUpdater", { enumerable: !0, get: function() {
      return l.DebUpdater;
    } });
    var s = zl();
    Object.defineProperty(e, "PacmanUpdater", { enumerable: !0, get: function() {
      return s.PacmanUpdater;
    } });
    var n = Xl();
    Object.defineProperty(e, "RpmUpdater", { enumerable: !0, get: function() {
      return n.RpmUpdater;
    } });
    var a = Kl();
    Object.defineProperty(e, "MacUpdater", { enumerable: !0, get: function() {
      return a.MacUpdater;
    } });
    var p = ec();
    Object.defineProperty(e, "NsisUpdater", { enumerable: !0, get: function() {
      return p.NsisUpdater;
    } }), c(jt(), e);
    let g;
    function v() {
      if (process.platform === "win32")
        g = new (ec()).NsisUpdater();
      else if (process.platform === "darwin")
        g = new (Kl()).MacUpdater();
      else {
        g = new (jl()).AppImageUpdater();
        try {
          const m = d.join(process.resourcesPath, "package-type");
          if (!(0, o.existsSync)(m))
            return g;
          switch ((0, o.readFileSync)(m).toString().trim()) {
            case "deb":
              g = new (Wl()).DebUpdater();
              break;
            case "rpm":
              g = new (Xl()).RpmUpdater();
              break;
            case "pacman":
              g = new (zl()).PacmanUpdater();
              break;
            default:
              break;
          }
        } catch (m) {
          console.warn("Unable to detect 'package-type' for autoUpdater (rpm/deb/pacman support). If you'd like to expand support, please consider contributing to electron-builder", m.message);
        }
      }
      return g;
    }
    Object.defineProperty(e, "autoUpdater", {
      enumerable: !0,
      get: () => g || v()
    });
  })(Lt)), Lt;
}
var st = Id();
const Od = Re(sn(), ".claude", "agentic-processes"), Nr = /* @__PURE__ */ new Map();
async function Dd(e, i, c) {
  Zc("global");
  const o = Od;
  if (console.log("Starting file watcher for:", o), console.log("Path exists:", De(o)), !De(o)) {
    console.log("Creating agentic-processes directory structure...");
    try {
      await vn(Re(o, "active"), { recursive: !0 }), await vn(Re(o, "completed"), { recursive: !0 }), await vn(Re(o, "failed"), { recursive: !0 }), console.log("agentic-processes directory structure created successfully");
    } catch (t) {
      const l = `Failed to create agentic-processes directory structure: ${t instanceof Error ? t.message : String(t)}`;
      return console.error(l), c && c(l), { success: !1, error: l };
    }
  }
  const d = uc(o, {
    persistent: !0,
    ignoreInitial: !1,
    usePolling: !0,
    interval: 1e3,
    depth: 4,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100
    }
  }), f = (t) => {
    const l = t.replace(/\\/g, "/");
    return l.includes("/active/") || l.includes("/completed/") || l.includes("/failed/");
  }, r = (t) => {
    const l = t.replace(/\\/g, "/");
    return l.endsWith("/process.json") ? "process" : l.endsWith("/log.json") ? "log" : l.endsWith("/pending-interaction.json") ? "pending-interaction" : l.endsWith("/qa-session.json") ? "qa-session" : /\/memory\/[^/]+\.json$/.test(l) ? "memory" : null;
  }, h = (t) => {
    const l = t.replace(/\\/g, "/");
    if (/\/memory\/[^/]+\.json$/.test(l)) {
      const n = Ge(t), a = Ge(n);
      return Re(a, "process.json");
    }
    const s = Ge(t);
    return Re(s, "process.json");
  };
  return d.on("add", async (t) => {
    const l = r(t);
    if (!(!l || !f(t))) {
      console.log(`${l}.json found:`, t);
      try {
        const s = await Je(t, "utf-8"), n = JSON.parse(s), a = h(t);
        console.log(`${l} parsed for process:`, a), i("added", l, { path: t, processPath: a, content: n });
      } catch (s) {
        console.error(`Error reading ${l}.json:`, t, s);
      }
    }
  }), d.on("change", async (t) => {
    const l = r(t);
    if (!(!l || !f(t))) {
      console.log(`${l}.json changed:`, t);
      try {
        const s = await Je(t, "utf-8"), n = JSON.parse(s), a = h(t);
        i("changed", l, { path: t, processPath: a, content: n });
      } catch (s) {
        console.error(`Error reading ${l}.json:`, t, s);
      }
    }
  }), d.on("unlink", (t) => {
    const l = r(t);
    if (!l || !f(t)) return;
    console.log(`${l}.json removed:`, t);
    const s = h(t);
    i("removed", l, { path: t, processPath: s });
  }), d.on("error", (t) => {
    console.error("Watcher error:", t), c && c(`File watcher error: ${t instanceof Error ? t.message : String(t)}`);
  }), d.on("ready", () => {
    console.log(`File watcher ready for: ${o}`);
  }), Nr.set("global", d), { success: !0 };
}
function Zc(e) {
  if (e) {
    const i = Nr.get(e);
    i && (i.close(), Nr.delete(e), console.log(`File watcher stopped for: ${e}`));
  } else
    xs();
}
function xs() {
  for (const [e, i] of Nr)
    i.close(), console.log(`File watcher stopped for: ${e}`);
  Nr.clear(), console.log("All file watchers stopped");
}
const Nd = 5e3;
function rc() {
  return process.env.HERDR_SOCKET_PATH ? process.env.HERDR_SOCKET_PATH : process.env.HERDR_SESSION ? Re(sn(), ".config", "herdr", "sessions", process.env.HERDR_SESSION, "herdr.sock") : Ju() === "win32" ? "\\\\.\\pipe\\herdr" : Re(sn(), ".config", "herdr", "herdr.sock");
}
class Fd extends hc {
  status = "disconnected";
  lastError = null;
  pingTimer = null;
  connect() {
    this.pingTimer || (this.pingTimer = setInterval(() => this.checkStatus(), Nd), this.checkStatus());
  }
  disconnect() {
    this.pingTimer && (clearInterval(this.pingTimer), this.pingTimer = null), this.setStatus("disconnected", null);
  }
  async checkStatus() {
    try {
      await this.call("ping", {}, 3e3), this.setStatus("connected", null);
    } catch (i) {
      this.setStatus("disconnected", i instanceof Error ? i.message : "Herdr socket unreachable");
    }
  }
  setStatus(i, c) {
    i === this.status && c === this.lastError || (this.status = i, this.lastError = c, this.emit("connection-status", { status: i, error: c }));
  }
  getStatus() {
    return { status: this.status, error: this.lastError, socketPath: rc() };
  }
  call(i, c, o = 1e4) {
    return new Promise((d, f) => {
      const r = tf(rc());
      let h = "", t = !1;
      const l = (n) => {
        t || (t = !0, clearTimeout(s), r.destroy(), n());
      }, s = setTimeout(() => {
        l(() => f(new Error(`Herdr call "${i}" timed out after ${o}ms`)));
      }, o);
      r.once("connect", () => {
        const n = JSON.stringify({ id: pc(), method: i, params: c ?? {} }) + `
`;
        r.write(n, (a) => {
          a && l(() => f(a));
        });
      }), r.on("data", (n) => {
        h += n.toString("utf-8");
        const a = h.indexOf(`
`);
        if (a < 0) return;
        const p = h.slice(0, a);
        l(() => {
          let g;
          try {
            g = JSON.parse(p);
          } catch {
            f(new Error(`Malformed response from Herdr for "${i}"`));
            return;
          }
          g.error ? f(new Error(g.error.message || g.error.code || "Herdr call failed")) : d(g.result);
        });
      }), r.on("error", (n) => l(() => f(n)));
    });
  }
}
let Kt = null;
function tt() {
  return Kt || (Kt = new Fd()), Kt;
}
function Ld() {
  Kt && (Kt.disconnect(), Kt = null);
}
const nn = {
  "claude-code": {
    command: "claude",
    args: [],
    processAttachCommand: (e) => `/process-continue ${e}`,
    available: !0,
    displayName: "Claude Code"
  }
};
function nc(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const ic = 200;
class Ud extends hc {
  sessions = /* @__PURE__ */ new Map();
  constructor() {
    super(), tt().on("connection-status", ({ status: i }) => {
      if (i === "disconnected")
        for (const c of this.sessions.values())
          (c.status === "running" || c.status === "starting") && (this.stopPolling(c), c.status = "error", this.emit("status", {
            sessionId: c.id,
            status: "error",
            error: "Herdr disconnected"
          }));
    });
  }
  /**
   * Get all available agent types with their configurations
   */
  getAvailableAgents() {
    return Object.entries(nn).filter(([, i]) => i.available).map(([i, c]) => ({ type: i, config: c }));
  }
  /**
   * Create a new agent session
   */
  async createSession(i, c, o, d) {
    const f = nn[i];
    if (!f.available)
      throw new Error(`Agent type '${i}' is not available yet`);
    const r = pc(), h = {
      id: r,
      agentType: i,
      attachedProcessId: null,
      attachedProcessPath: o || null,
      status: "starting",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      workingDirectory: c,
      herdrPaneId: null,
      herdrWorkspaceId: null,
      herdrTabId: null,
      herdrAgentId: null,
      outputBuffer: "",
      pollTimer: null,
      resizeDebounce: null
    };
    this.sessions.set(r, h);
    try {
      const t = tt();
      let l = c;
      if (!De(l)) {
        if (o)
          try {
            const p = Ge(o), g = Re(p, "process.json");
            if (De(g)) {
              const v = JSON.parse(Js(g, "utf-8")), m = v.metadata?.projectPaths, w = v.metadata?.projectPath, R = Array.isArray(m) && m.length > 0 ? m[0] : typeof w == "string" ? w : null;
              R && De(R) && (l = R);
            }
          } catch {
          }
        if (!De(l))
          throw new Error(
            `Working directory does not exist: "${c}". The process may have been created on a different machine. Please update the projectPaths in the process.json file.`
          );
      }
      const s = await t.call("workspace.create", { cwd: l, label: f.displayName });
      h.herdrWorkspaceId = s.workspace.workspace_id, h.herdrTabId = s.tab.tab_id;
      const n = [f.command, ...f.args ?? []];
      d?.permissionMode === "allow-all" && i === "claude-code" && n.push("--dangerously-skip-permissions"), d?.resumeSessionId && i === "claude-code" && n.push("--resume", d.resumeSessionId);
      const a = await t.call("agent.start", {
        name: r,
        tab_id: s.tab.tab_id,
        argv: n,
        focus: !1
      });
      return h.herdrPaneId = a.agent.pane_id, h.herdrAgentId = a.agent.name, await t.call("pane.close", { pane_id: s.root_pane.pane_id }).catch(() => {
      }), await this.pollAgentStatus(h.herdrAgentId, 3e4).catch(() => {
      }), h.status === "stopped" ? this.getSessionPublic(h) : (this.startPolling(h), h.status = "running", this.emit("status", { sessionId: r, status: "running" }), o && await this.attachToProcess(r, o), this.getSessionPublic(h));
    } catch (t) {
      throw h.status !== "stopped" && (h.status = "error", this.emit("status", {
        sessionId: r,
        status: "error",
        error: t instanceof Error ? t.message : "Unknown error"
      })), t;
    }
  }
  /**
   * Attach an existing session to an agentic process
   */
  async attachToProcess(i, c) {
    const o = this.sessions.get(i);
    if (!o)
      throw new Error(`Session '${i}' not found`);
    if (!o.herdrPaneId)
      throw new Error(`Session '${i}' has no active Herdr pane`);
    const f = nn[o.agentType].processAttachCommand(c);
    if (!f)
      throw new Error(`Agent type '${o.agentType}' does not support process attachment`);
    const r = tt();
    await r.call("pane.send_text", { pane_id: o.herdrPaneId, text: f });
    const h = f.slice(-20);
    await r.call("pane.wait_for_output", {
      pane_id: o.herdrPaneId,
      pattern: nc(h),
      timeout_ms: 5e3
    }).catch(() => {
    }), await r.call("pane.send_keys", { pane_id: o.herdrPaneId, keys: ["Enter"] }), o.attachedProcessPath = c, this.emit("status", { sessionId: i, status: o.status });
  }
  /**
   * Send a prompt/command to the agent session
   */
  async sendPrompt(i, c) {
    const o = this.sessions.get(i);
    if (!o)
      throw new Error(`Session '${i}' not found`);
    if (!o.herdrPaneId)
      throw new Error(`Session '${i}' has no active Herdr pane`);
    if (o.status !== "running")
      throw new Error(`Session '${i}' is not running (status: ${o.status})`);
    const d = tt();
    if (o.herdrAgentId) {
      await d.call("agent.send", { target: o.herdrAgentId, text: c }), await d.call("pane.send_keys", { pane_id: o.herdrPaneId, keys: ["Enter"] }), await this.pollAgentStatus(o.herdrAgentId, 15e3).catch(() => {
      });
      return;
    }
    await d.call("pane.send_text", { pane_id: o.herdrPaneId, text: c });
    const f = c.slice(-20);
    await d.call("pane.wait_for_output", {
      pane_id: o.herdrPaneId,
      pattern: nc(f),
      timeout_ms: 5e3
    }).catch(() => {
    }), await d.call("pane.send_keys", { pane_id: o.herdrPaneId, keys: ["Enter"] });
  }
  /**
   * Resize the terminal.
   * ponytail: Herdr's `pane.resize` takes a split direction + ratio (0-1), not
   * a terminal character grid (cols/rows) like node-pty's resize did — the two
   * concepts don't map. There is no known Herdr call for "set this pane's PTY
   * to N cols by M rows" (Herdr owns pane sizing via its own layout). This is
   * therefore a no-op kept debounced/trailing-edge per the approved plan so
   * the call site doesn't need to change; upgrade if Herdr adds a real
   * grid-resize method.
   */
  resizeTerminal(i, c, o) {
    const d = this.sessions.get(i);
    d && (d.resizeDebounce && clearTimeout(d.resizeDebounce), d.resizeDebounce = setTimeout(() => {
      d.resizeDebounce = null;
    }, 150));
  }
  /**
   * Send raw input to the pane (for keyboard events)
   */
  sendInput(i, c) {
    const o = this.sessions.get(i);
    o?.herdrPaneId && tt().call("pane.send_input", { pane_id: o.herdrPaneId, text: c }).catch(() => {
    });
  }
  /**
   * Kill an agent session
   */
  killSession(i) {
    const c = this.sessions.get(i);
    if (!c)
      return;
    this.stopPolling(c);
    const o = c.herdrPaneId, d = c.herdrTabId;
    if (c.herdrPaneId = null, o) {
      const f = tt();
      f.call("pane.close", { pane_id: o }).catch(() => {
      }), d && f.call("tab.close", { tab_id: d }).catch(() => {
      });
    }
    c.status = "stopped", this.emit("status", { sessionId: i, status: "stopped" });
  }
  /**
   * Get a session by ID
   */
  getSession(i) {
    const c = this.sessions.get(i);
    return c ? this.getSessionPublic(c) : null;
  }
  /**
   * Get all active sessions
   */
  listSessions() {
    return Array.from(this.sessions.values()).map((i) => this.getSessionPublic(i));
  }
  /**
   * Get sessions attached to a specific process
   */
  getSessionsForProcess(i) {
    return Array.from(this.sessions.values()).filter((c) => c.attachedProcessPath === i).map((c) => this.getSessionPublic(c));
  }
  /**
   * Discover external Claude Code sessions attached to active processes.
   * Detection is file-based (.session file in the process folder); PIDs are
   * enriched, best-effort, via Herdr's own pane/process bookkeeping
   * (pane.list + pane.process_info) instead of OS-level ps/registry scanning.
   */
  async discoverExternalSessions(i) {
    const c = /* @__PURE__ */ new Map();
    for (const o of i) {
      const d = Ge(o.path), f = Re(d, ".session");
      let r = null;
      try {
        De(f) && (r = Js(f, "utf-8").trim());
      } catch {
      }
      !r || this.getSessionsForProcess(o.path).some((t) => t.status === "running" || t.status === "starting") || c.set(o.path, {
        pid: 0,
        commandLine: "",
        claudeSessionId: r,
        processPath: o.path,
        workingDirectory: o.projectPaths?.[0]
      });
    }
    if (c.size > 0)
      try {
        const o = new Set(
          Array.from(this.sessions.values()).map((h) => h.herdrPaneId).filter(Boolean)
        ), d = tt(), r = ((await d.call("pane.list", {})).panes ?? []).filter((h) => !o.has(h.pane_id));
        for (const [, h] of c)
          for (const t of r)
            try {
              const l = await d.call(
                "pane.process_info",
                { pane_id: t.pane_id }
              ), s = h.workingDirectory && t.foreground_cwd && t.foreground_cwd.replace(/\\/g, "/").includes(h.workingDirectory.replace(/\\/g, "/")), n = l.foreground_processes?.[0], a = n?.cmdline?.includes(h.claudeSessionId);
              if (s || a) {
                h.pid = n?.pid ?? l.pid ?? 0, h.commandLine = n?.cmdline ?? "";
                break;
              }
            } catch {
            }
      } catch {
      }
    return c;
  }
  /**
   * Migrate an external Claude Code session into this app.
   * Finds (via Herdr pane bookkeeping) and closes the external pane, then
   * resumes the session in a freshly created pane.
   */
  async migrateExternalSession(i, c, o) {
    try {
      const d = tt(), f = new Set(
        Array.from(this.sessions.values()).map((t) => t.herdrPaneId).filter(Boolean)
      ), h = ((await d.call("pane.list", {})).panes ?? []).filter((t) => !f.has(t.pane_id));
      for (const t of h)
        try {
          const s = (await d.call(
            "pane.process_info",
            { pane_id: t.pane_id }
          )).foreground_processes?.[0];
          if (s?.pid && s.pid === i.pid || s?.cmdline?.includes(i.claudeSessionId) || i.workingDirectory && t.foreground_cwd && t.foreground_cwd.replace(/\\/g, "/").includes(i.workingDirectory.replace(/\\/g, "/"))) {
            await d.call("pane.close", { pane_id: t.pane_id }).catch(() => {
            });
            break;
          }
        } catch {
        }
    } catch {
    }
    return await new Promise((d) => setTimeout(d, 1500)), this.createSession(
      "claude-code",
      c,
      i.processPath,
      { resumeSessionId: i.claudeSessionId, permissionMode: o?.permissionMode }
    );
  }
  /**
   * Clean up all sessions
   */
  cleanup() {
    for (const [i] of this.sessions)
      this.killSession(i);
    this.sessions.clear();
  }
  // -- Agent status waiting ----------------------------------------------
  // No blocking agent-wait RPC exists in this protocol version (confirmed
  // against the live server's method list and by observing the `herdr agent
  // wait` CLI itself poll `agent.get` in a loop). Mirrors that behavior.
  async pollAgentStatus(i, c) {
    const o = tt(), d = Date.now() + c;
    for (; Date.now() < d; ) {
      let f;
      try {
        f = (await o.call("agent.get", { target: i })).agent?.agent_status;
      } catch {
        return;
      }
      if (f === "idle" || f === "done") return;
      await new Promise((r) => setTimeout(r, ic));
    }
    throw new Error(`Agent "${i}" did not reach idle within ${c}ms`);
  }
  // -- Output polling (see POLL_INTERVAL_MS doc comment) ---------------------
  startPolling(i) {
    if (i.pollTimer) return;
    const c = tt();
    i.pollTimer = setInterval(async () => {
      if (i.herdrPaneId)
        try {
          const d = (await c.call("pane.read", {
            pane_id: i.herdrPaneId,
            source: "recent_unwrapped"
          })).read?.text ?? "";
          if (d && d !== i.outputBuffer) {
            const f = d.startsWith(i.outputBuffer) ? d.slice(i.outputBuffer.length) : d;
            i.outputBuffer = d.length > 10240 ? d.slice(-10240) : d, f && this.emit("output", { sessionId: i.id, data: f });
          }
        } catch {
        }
    }, ic);
  }
  stopPolling(i) {
    i.pollTimer && (clearInterval(i.pollTimer), i.pollTimer = null), i.resizeDebounce && (clearTimeout(i.resizeDebounce), i.resizeDebounce = null);
  }
  /**
   * Convert internal session to public session (without Herdr internals)
   */
  getSessionPublic(i) {
    const {
      herdrPaneId: c,
      herdrWorkspaceId: o,
      herdrTabId: d,
      herdrAgentId: f,
      outputBuffer: r,
      pollTimer: h,
      resizeDebounce: t,
      ...l
    } = i;
    return l;
  }
}
let Qt = null;
function rt() {
  return Qt || (Qt = new Ud()), Qt;
}
function xd() {
  Qt && (Qt.cleanup(), Qt = null);
}
const kd = Ku(import.meta.url), ot = Ge(kd), ks = Re(ot, "..", "..", "agentic-processes");
let Oe = null, tr = /* @__PURE__ */ new Map(), sc = !1, $t = /* @__PURE__ */ new Map(), Zt = /* @__PURE__ */ new Map(), Es = /* @__PURE__ */ new Map();
function vt(e, i) {
  Oe?.webContents.send(e, i);
  for (const [, c] of Zt)
    c.isDestroyed() || c.webContents.send(e, i);
}
function ac() {
  const e = Re(ot, "../images/icon.png");
  Oe = new rr({
    width: 1400,
    height: 900,
    minWidth: 1e3,
    minHeight: 700,
    icon: De(e) ? e : void 0,
    backgroundColor: "#0d1117",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: Re(ot, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), process.env.VITE_DEV_SERVER_URL ? (Oe.loadURL(process.env.VITE_DEV_SERVER_URL), Oe.webContents.openDevTools(), Oe.webContents.on("console-message", (i, c, o) => {
    o.includes("Autofill.enable") || o.includes("Autofill.setAddresses");
  })) : Oe.loadFile(Re(ot, "../dist/index.html")), Oe.on("closed", () => {
    Oe = null;
  });
}
function $d(e, i, c) {
  const o = $t.get(e);
  if (o && !o.isDestroyed()) {
    o.focus();
    return;
  }
  const d = Re(ot, "../images/icon.png"), f = new rr({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    icon: De(d) ? d : void 0,
    backgroundColor: "#0d1117",
    title: c || "Agent Terminal",
    webPreferences: {
      preload: Re(ot, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  });
  f.setMenuBarVisibility(!1);
  const r = `?sessionId=${encodeURIComponent(e)}&processPath=${encodeURIComponent(i)}&processName=${encodeURIComponent(c)}`;
  process.env.VITE_DEV_SERVER_URL ? f.loadURL(`${process.env.VITE_DEV_SERVER_URL}terminal-window.html${r}`) : f.loadFile(Re(ot, "../dist/terminal-window.html"), {
    search: r
  }), $t.set(e, f), f.on("closed", () => {
    $t.delete(e);
  });
}
Ee.handle("update:get-current-version", () => ft.getVersion());
Ee.handle("update:quit-and-install", () => {
  st.autoUpdater.quitAndInstall();
});
Ee.handle("update:start-download", () => st.autoUpdater.downloadUpdate());
Ee.handle("select-project-folder", async () => {
  const e = await zu.showOpenDialog({
    properties: ["openDirectory"],
    title: "Select Project Folder"
  });
  return !e.canceled && e.filePaths.length > 0 ? e.filePaths[0] : null;
});
Ee.handle("start-watching", async (e, i) => {
  if (Oe) {
    const c = await Dd(
      i,
      async (o, d, f) => {
        switch (d) {
          case "process":
            o === "added" || o === "changed" ? Es.set(f.processPath, f.content) : o === "removed" && Es.delete(f.processPath), vt("process-update", {
              event: o,
              data: { path: f.processPath, process: f.content }
            });
            break;
          case "memory":
            try {
              const r = Re(Ge(f.processPath), "memory");
              if (De(r)) {
                const h = await er(r), t = {};
                for (const l of h)
                  if (l.endsWith(".json"))
                    try {
                      const s = await Je(Re(r, l), "utf-8");
                      t[l.replace(/\.json$/, "")] = JSON.parse(s);
                    } catch {
                    }
                vt("memory-update", {
                  event: o,
                  processPath: f.processPath,
                  memory: t
                });
              }
            } catch (r) {
              console.error("Error aggregating memory topics:", r);
            }
            break;
          case "log":
            vt("log-update", {
              event: o,
              processPath: f.processPath,
              log: f.content
            });
            break;
          case "pending-interaction":
            vt("pending-interaction-update", {
              event: o,
              processPath: f.processPath,
              pendingInteraction: f.content
            });
            break;
          case "qa-session":
            vt("qa-session-update", {
              event: o,
              processPath: f.processPath,
              qaSession: f.content
            });
            break;
        }
      },
      (o) => {
        vt("watcher-error", { error: o });
      }
    );
    if (!c.success)
      return { success: !1, error: c.error };
  }
  return { success: !0 };
});
Ee.handle("stop-watching", (e, i) => (Zc(i), !0));
Ee.handle("stop-all-watching", () => (xs(), !0));
Ee.handle("read-process-file", async (e, i, c) => {
  try {
    const o = Ge(i), d = Re(o, c);
    if (!De(d))
      return console.log(`File not found: ${d}`), null;
    const f = await Je(d, "utf-8");
    return JSON.parse(f);
  } catch (o) {
    return console.error(`Error reading ${c}:`, o), null;
  }
});
Ee.handle("read-memory-directory", async (e, i) => {
  try {
    const c = Ge(i), o = Re(c, "memory");
    if (!De(o))
      return console.log(`Memory directory not found: ${o}`), null;
    const d = await er(o), f = {};
    for (const r of d) {
      if (!r.endsWith(".json")) continue;
      const h = Re(o, r);
      try {
        const t = await Je(h, "utf-8"), l = r.replace(/\.json$/, "");
        f[l] = JSON.parse(t);
      } catch (t) {
        console.error(`Error reading memory topic file: ${h}`, t);
      }
    }
    return f;
  } catch (c) {
    return console.error("Error reading memory directory:", c), null;
  }
});
Ee.handle("list-process-files", async (e, i) => {
  try {
    const c = Ge(i);
    if (!De(c))
      return console.log(`Process directory not found: ${c}`), [];
    const o = await er(c), d = [];
    for (const f of o) {
      const r = Xu(f).toLowerCase();
      if (r === ".md" || r === ".json") {
        const h = Re(c, f), t = await vs(h);
        t.isFile() && d.push({
          name: f,
          path: h,
          type: r === ".md" ? "markdown" : "json",
          size: t.size,
          modifiedAt: t.mtime.toISOString()
        });
      }
    }
    return d.sort((f, r) => f.name.localeCompare(r.name)), d;
  } catch (c) {
    return console.error("Error listing process files:", c), [];
  }
});
Ee.handle("read-file-content", async (e, i) => {
  try {
    return De(i) ? await Je(i, "utf-8") : (console.log(`File not found: ${i}`), null);
  } catch (c) {
    return console.error(`Error reading file content: ${i}`, c), null;
  }
});
Ee.handle("watch-file", (e, i) => {
  if (tr.has(i))
    return !0;
  if (!De(i))
    return console.log(`Cannot watch non-existent file: ${i}`), !1;
  console.log(`Starting file content watcher for: ${i}`);
  const c = uc(i, {
    persistent: !0,
    usePolling: !0,
    interval: 500,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100
    }
  });
  return c.on("change", async (o) => {
    console.log(`File content changed: ${o}`);
    try {
      const d = await Je(o, "utf-8");
      vt("file-content-update", {
        filePath: o,
        content: d
      });
    } catch (d) {
      console.error(`Error reading changed file: ${o}`, d);
    }
  }), c.on("unlink", (o) => {
    console.log(`Watched file removed: ${o}`), vt("file-content-update", {
      filePath: o,
      content: null,
      removed: !0
    });
  }), tr.set(i, c), !0;
});
Ee.handle("unwatch-file", (e, i) => {
  const c = tr.get(i);
  return c && (c.close(), tr.delete(i), console.log(`Stopped watching file: ${i}`)), !0;
});
Ee.handle("delete-process-instance", async (e, i) => {
  try {
    const c = Ge(i);
    return c.includes("agentic-processes") ? De(c) ? (await Qu(c, { recursive: !0, force: !0 }), console.log(`Deleted process directory: ${c}`), { success: !0 }) : { success: !1, error: "Process directory not found" } : { success: !1, error: "Invalid path: not in agentic-processes" };
  } catch (c) {
    return console.error("Error deleting process instance:", c), {
      success: !1,
      error: c instanceof Error ? c.message : "Unknown error"
    };
  }
});
Ee.handle("read-qa-session", async (e, i) => {
  try {
    const c = Ge(i), o = Re(c, "qa-session.json");
    if (!c.includes("agentic-processes"))
      return console.error("Invalid path: not in agentic-processes"), null;
    if (!De(o))
      return null;
    const d = await Je(o, "utf-8");
    return JSON.parse(d);
  } catch (c) {
    return console.error("Error reading qa-session.json:", c), null;
  }
});
Ee.handle("answer-question", async (e, i, c, o) => {
  try {
    if (!Ge(i).includes("agentic-processes"))
      return { success: !1, error: "Invalid path" };
    if (!c || typeof c != "string")
      return { success: !1, error: "Invalid question ID" };
    if (!o || typeof o != "string")
      return { success: !1, error: "Invalid answer" };
    const f = c.replace(/[^\w-]/g, ""), r = o.replace(/[\r\n]+/g, " ").trim(), { spawn: h } = await import("child_process"), t = h("python3", [
      "scripts/process_manager.py",
      "update-qa-answer",
      i,
      f,
      r
    ], {
      cwd: ks
    });
    let l = "", s = "";
    return t.stdout.on("data", (n) => {
      l += n.toString();
    }), t.stderr.on("data", (n) => {
      s += n.toString();
    }), new Promise((n) => {
      t.on("close", (a) => {
        a === 0 ? n({ success: !0 }) : (console.error(`Python script failed with code ${a}:`, s), n({ success: !1, error: "Failed to update answer" }));
      });
    });
  } catch (d) {
    return console.error("Error answering question:", d), {
      success: !1,
      error: "Internal error"
    };
  }
});
Ee.handle("complete-question", async (e, i, c) => {
  try {
    if (!Ge(i).includes("agentic-processes"))
      return { success: !1, error: "Invalid path" };
    if (!c || typeof c != "string")
      return { success: !1, error: "Invalid question ID" };
    const d = c.replace(/[^\w-]/g, ""), { spawn: f } = await import("child_process"), r = f("python3", [
      "scripts/process_manager.py",
      "complete-qa-question",
      i,
      d
    ], {
      cwd: ks
    });
    let h = "", t = "";
    return r.stdout.on("data", (l) => {
      h += l.toString();
    }), r.stderr.on("data", (l) => {
      t += l.toString();
    }), new Promise((l) => {
      r.on("close", (s) => {
        s === 0 ? l({ success: !0 }) : (console.error(`Python script failed with code ${s}:`, t), l({ success: !1, error: "Failed to complete question" }));
      });
    });
  } catch (o) {
    return console.error("Error completing question:", o), {
      success: !1,
      error: "Internal error"
    };
  }
});
Ee.handle("get-qa-session-status", async (e, i) => {
  try {
    const c = Ge(i), o = Re(c, "qa-session.json");
    if (!c.includes("agentic-processes") || !De(o))
      return null;
    const d = await Je(o, "utf-8");
    return JSON.parse(d).status || null;
  } catch (c) {
    return console.error("Error reading qa-session status:", c), null;
  }
});
const qd = [
  "output",
  "guidance",
  "substeps",
  "flow",
  "memoryFileUsage",
  "parameters",
  "improvementCategories",
  "prioritization",
  "workflow",
  "successCriteria",
  "complianceChecklist",
  "searchModes",
  "changeProposalFormat",
  "captureTypes"
];
async function Md(e) {
  const i = /* @__PURE__ */ new Map();
  if (!De(e)) return i;
  const c = await er(e, { withFileTypes: !0 });
  for (const o of c) {
    if (!o.isDirectory()) continue;
    const d = Re(e, o.name, `${o.name}.json`);
    if (De(d))
      try {
        const f = await Je(d, "utf-8"), r = JSON.parse(f);
        r.type === "step" && r.id && i.set(r.id, d);
      } catch {
      }
  }
  return i;
}
async function oc(e, i) {
  if (!e.steps || !Array.isArray(e.steps)) return;
  const c = await Md(i);
  for (const o of e.steps) {
    if (!o.stepRef || o.stepDefinition && Object.keys(o.stepDefinition).length > 0) continue;
    const d = c.get(o.stepRef);
    if (d && De(d))
      try {
        const f = await Je(d, "utf-8"), r = JSON.parse(f), h = {};
        for (const t of qd)
          t in r && (h[t] = r[t]);
        o.stepDefinition = h;
      } catch (f) {
        console.error(`Error resolving step definition UUID ${o.stepRef}: ${d}`, f);
      }
  }
}
Ee.handle("load-process-templates", async () => {
  try {
    const e = Re(sn(), ".claude", "agentic-processes", "templates", "processes");
    if (!De(e))
      return console.log(`Templates directory not found: ${e}`), [];
    const i = [], c = await er(e);
    for (const o of c) {
      const d = Re(e, o);
      if (!(await vs(d)).isDirectory() || o.startsWith(".") || o.startsWith("_"))
        continue;
      const r = Re(d, `${o}.json`);
      if (De(r)) {
        try {
          const t = await Je(r, "utf-8"), l = JSON.parse(t);
          l.type === "template" && (l.filePath = r, await oc(l, d), i.push(l));
        } catch (t) {
          console.error(`Error reading template: ${r}`, t);
        }
        continue;
      }
      const h = await er(d);
      for (const t of h) {
        const l = Re(d, t);
        if (!(await vs(l)).isDirectory() || t.startsWith(".") || t.startsWith("_"))
          continue;
        const n = Re(l, `${t}.json`);
        if (De(n))
          try {
            const a = await Je(n, "utf-8"), p = JSON.parse(a);
            p.type === "template" && (p.filePath = n, await oc(p, l), i.push(p));
          } catch (a) {
            console.error(`Error reading template: ${n}`, a);
          }
      }
    }
    return i;
  } catch (e) {
    return console.error("Error loading process templates:", e), [];
  }
});
Ee.handle("clipboard:read-text", () => cc.readText());
Ee.handle("clipboard:write-text", (e, i) => (cc.writeText(i), !0));
function $s() {
  if (sc) return;
  const e = rt();
  e.on("output", (i) => {
    Oe?.webContents.send("agent:output", i);
    const c = $t.get(i.sessionId);
    c && !c.isDestroyed() && c.webContents.send("agent:output", i);
  }), e.on("status", (i) => {
    Oe?.webContents.send("agent:status", i);
    const c = $t.get(i.sessionId);
    c && !c.isDestroyed() && c.webContents.send("agent:status", i);
  }), sc = !0;
}
Ee.handle("agent:get-available", () => Object.entries(nn).map(([e, i]) => ({
  type: e,
  displayName: i.displayName,
  available: i.available
})));
Ee.handle("agent:create", async (e, i, c, o, d) => {
  try {
    return $s(), { success: !0, session: await rt().createSession(i, c, o, {
      permissionMode: d?.permissionMode
    }) };
  } catch (f) {
    return console.error("Error creating agent session:", f), {
      success: !1,
      error: f instanceof Error ? f.message : "Unknown error"
    };
  }
});
Ee.handle("agent:attach", async (e, i, c) => {
  try {
    return await rt().attachToProcess(i, c), { success: !0 };
  } catch (o) {
    return console.error("Error attaching to process:", o), {
      success: !1,
      error: o instanceof Error ? o.message : "Unknown error"
    };
  }
});
Ee.handle("agent:send-prompt", async (e, i, c) => {
  try {
    return await rt().sendPrompt(i, c), { success: !0 };
  } catch (o) {
    return console.error("Error sending prompt:", o), {
      success: !1,
      error: o instanceof Error ? o.message : "Unknown error"
    };
  }
});
Ee.handle("agent:input", (e, i, c) => {
  try {
    return rt().sendInput(i, c), { success: !0 };
  } catch (o) {
    return {
      success: !1,
      error: o instanceof Error ? o.message : "Unknown error"
    };
  }
});
Ee.handle("agent:resize", (e, i, c, o) => {
  try {
    return rt().resizeTerminal(i, c, o), { success: !0 };
  } catch (d) {
    return {
      success: !1,
      error: d instanceof Error ? d.message : "Unknown error"
    };
  }
});
Ee.handle("agent:kill", (e, i) => {
  try {
    return rt().killSession(i), { success: !0 };
  } catch (c) {
    return {
      success: !1,
      error: c instanceof Error ? c.message : "Unknown error"
    };
  }
});
Ee.handle("agent:list", () => {
  try {
    return { success: !0, sessions: rt().listSessions() };
  } catch (e) {
    return {
      success: !1,
      sessions: [],
      error: e instanceof Error ? e.message : "Unknown error"
    };
  }
});
Ee.handle("agent:get", (e, i) => {
  try {
    return { success: !0, session: rt().getSession(i) };
  } catch (c) {
    return {
      success: !1,
      session: null,
      error: c instanceof Error ? c.message : "Unknown error"
    };
  }
});
Ee.handle("agent:open-window", (e, i, c, o) => {
  try {
    return $d(i, c, o), { success: !0 };
  } catch (d) {
    return console.error("Error opening terminal window:", d), {
      success: !1,
      error: d instanceof Error ? d.message : "Unknown error"
    };
  }
});
Ee.handle("agent:close-window", (e) => {
  try {
    const i = rr.getFocusedWindow();
    return i && i !== Oe && i.close(), { success: !0 };
  } catch (i) {
    return {
      success: !1,
      error: i instanceof Error ? i.message : "Unknown error"
    };
  }
});
Ee.handle("agent:get-window-params", (e) => {
  const i = rr.fromWebContents(e.sender);
  if (!i) return null;
  try {
    const c = i.webContents.getURL(), o = new URL(c);
    return {
      sessionId: o.searchParams.get("sessionId"),
      processPath: o.searchParams.get("processPath"),
      processName: o.searchParams.get("processName")
    };
  } catch {
    return null;
  }
});
Ee.handle("agent:get-for-process", (e, i) => {
  try {
    return { success: !0, sessions: rt().getSessionsForProcess(i) };
  } catch (c) {
    return {
      success: !1,
      sessions: [],
      error: c instanceof Error ? c.message : "Unknown error"
    };
  }
});
Ee.handle("agent:discover-external", async (e, i) => {
  try {
    $s();
    const o = await rt().discoverExternalSessions(i), d = {};
    for (const [f, r] of o)
      d[f] = r;
    return { success: !0, sessions: d };
  } catch (c) {
    return console.error("Error discovering external sessions:", c), {
      success: !1,
      sessions: {},
      error: c instanceof Error ? c.message : "Unknown error"
    };
  }
});
Ee.handle("agent:migrate-external", async (e, i, c, o) => {
  try {
    return $s(), { success: !0, session: await rt().migrateExternalSession(i, c, {
      permissionMode: o?.permissionMode
    }) };
  } catch (d) {
    return console.error("Error migrating external session:", d), {
      success: !1,
      error: d instanceof Error ? d.message : "Unknown error"
    };
  }
});
let lc = !1;
function Bd() {
  if (lc) return;
  lc = !0;
  const e = tt();
  e.on("connection-status", (i) => {
    vt("herdr:status-changed", i);
  }), e.connect();
}
Ee.handle("herdr:get-status", () => tt().getStatus());
function jd() {
  const e = Zt.get("default");
  if (e && !e.isDestroyed()) {
    e.focus();
    return;
  }
  const i = Re(ot, "../images/icon.png"), c = new rr({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: De(i) ? i : void 0,
    backgroundColor: "#0d1117",
    title: "Processes Overview",
    webPreferences: {
      preload: Re(ot, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  });
  c.setMenuBarVisibility(!1), process.env.VITE_DEV_SERVER_URL ? c.loadURL(`${process.env.VITE_DEV_SERVER_URL}overview-window.html`) : c.loadFile(Re(ot, "../dist/overview-window.html")), Zt.set("default", c), c.on("closed", () => {
    Zt.delete("default");
  });
}
Ee.handle("overview:open-window", () => {
  try {
    return jd(), { success: !0 };
  } catch (e) {
    return console.error("Error opening overview window:", e), {
      success: !1,
      error: e instanceof Error ? e.message : "Unknown error"
    };
  }
});
Ee.handle("overview:get-window-params", () => null);
Ee.handle("overview:get-current-processes", () => {
  const e = {};
  for (const [i, c] of Es)
    e[i] = c;
  return e;
});
Ee.handle("overview:navigate-to-process", (e, i) => (Oe && !Oe.isDestroyed() && (Oe.webContents.send("navigate-to-process-request", i), Oe.focus()), { success: !0 }));
async function ht(e) {
  const { spawn: i } = await import("child_process");
  return new Promise((c) => {
    const o = i("python3", ["scripts/template_manager.py", ...e], {
      cwd: ks
    });
    let d = "", f = "";
    o.stdout.on("data", (r) => {
      d += r.toString();
    }), o.stderr.on("data", (r) => {
      f += r.toString();
    }), o.on("close", (r) => {
      if (r === 0)
        try {
          c({ success: !0, data: JSON.parse(d) });
        } catch {
          c({ success: !1, error: "Failed to parse response" });
        }
      else {
        let h = f || "Command failed";
        try {
          const t = JSON.parse(d);
          t.message && (h = t.message);
        } catch {
        }
        c({ success: !1, error: h });
      }
    }), o.on("error", (r) => {
      c({ success: !1, error: r.message });
    });
  });
}
Ee.handle("marketplace:list", async () => ht(["list-marketplaces"]));
Ee.handle("marketplace:add", async (e, i, c, o, d) => ht([
  "add-marketplace",
  "--name",
  i,
  "--url",
  c,
  "--branch",
  o,
  "--priority",
  String(d)
]));
Ee.handle("marketplace:remove", async (e, i) => ht(["remove-marketplace", "--name", i]));
Ee.handle("marketplace:toggle", async (e, i) => ht(["toggle-marketplace", "--name", i]));
Ee.handle("marketplace:update", async (e, i, c) => {
  const o = ["update-marketplace", "--name", i];
  return c.newName && o.push("--new-name", c.newName), c.url && o.push("--url", c.url), c.branch && o.push("--branch", c.branch), c.priority !== void 0 && o.push("--priority", String(c.priority)), ht(o);
});
Ee.handle("marketplace:refresh", async (e, i) => {
  const c = ["refresh"];
  return i && c.push("--marketplace", i), ht(c);
});
Ee.handle("marketplace:status", async () => ht(["status"]));
Ee.handle("marketplace:catalog", async () => ht(["catalog"]));
Ee.handle("marketplace:install", async (e, i, c, o, d) => ht([
  "install",
  "--marketplace",
  i,
  "--template",
  c,
  "--category",
  o,
  "--type",
  d
]));
Ee.handle("marketplace:uninstall", async (e, i, c) => ht(["uninstall", "--template", i, "--type", c]));
const Hd = ft.requestSingleInstanceLock();
Hd ? ft.on("second-instance", () => {
  Oe && (Oe.isMinimized() && Oe.restore(), Oe.focus());
}) : ft.quit();
ft.name = "Agentic Processes UI";
ft.whenReady().then(() => {
  if (Yu.setApplicationMenu(null), process.platform === "darwin") {
    const e = Re(ot, "../images/icon.png");
    De(e) && ft.dock.setIcon(e);
  }
  ac(), Bd(), process.env.VITE_DEV_SERVER_URL || (st.autoUpdater.autoDownload = !1, st.autoUpdater.autoInstallOnAppQuit = !0, st.autoUpdater.on("checking-for-update", () => {
    Oe?.webContents.send("update:status", { status: "checking" });
  }), st.autoUpdater.on("update-available", (e) => {
    Oe?.webContents.send("update:status", {
      status: "available",
      version: e.version
    });
  }), st.autoUpdater.on("update-not-available", () => {
    Oe?.webContents.send("update:status", { status: "not-available" });
  }), st.autoUpdater.on("download-progress", (e) => {
    Oe?.webContents.send("update:status", {
      status: "downloading",
      percent: e.percent,
      transferred: e.transferred,
      total: e.total
    });
  }), st.autoUpdater.on("update-downloaded", (e) => {
    Oe?.webContents.send("update:status", {
      status: "downloaded",
      version: e.version
    });
  }), st.autoUpdater.on("error", (e) => {
    Oe?.webContents.send("update:status", {
      status: "error",
      error: e?.message || "Unknown error"
    });
  }), st.autoUpdater.checkForUpdates().catch((e) => {
    console.log("Auto-update check failed:", e?.message);
  })), ft.on("activate", () => {
    rr.getAllWindows().length === 0 && ac();
  });
});
ft.on("window-all-closed", () => {
  xs();
  for (const [, e] of tr)
    e.close();
  tr.clear();
  for (const [, e] of $t)
    e.isDestroyed() || e.close();
  $t.clear();
  for (const [, e] of Zt)
    e.isDestroyed() || e.close();
  Zt.clear(), xd(), Ld(), process.platform !== "darwin" && ft.quit();
});
