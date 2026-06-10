import xt, { ipcMain as ge, dialog as af, clipboard as _c, BrowserWindow as $t, app as Ut, Menu as lf } from "electron";
import Ne, { join as Re, dirname as He, resolve as oo, extname as cf } from "path";
import dn, { homedir as xr, platform as cn } from "os";
import St, { fileURLToPath as Sc } from "url";
import { mkdir as Tn, readFile as Je, readdir as kt, stat as Nr, rm as uf } from "fs/promises";
import At, { existsSync as Oe, readFileSync as un, mkdirSync as ff, readdirSync as df, unlinkSync as hf, writeFileSync as pf } from "fs";
import { watch as Is } from "chokidar";
import mf from "constants";
import Ur from "stream";
import Ds, { promisify as gf } from "util";
import Ac from "assert";
import hn, { exec as yf, execSync as Rc } from "child_process";
import Tc, { EventEmitter as Cc } from "events";
import kr, { randomUUID as vf } from "crypto";
import bc from "tty";
import Pc from "zlib";
import Ef, { request as Cn } from "http";
import { spawn as wf } from "node-pty";
var it = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, It = {}, bn = {}, Yr = {}, ao;
function Ke() {
  return ao || (ao = 1, Yr.fromCallback = function(e) {
    return Object.defineProperty(function(...t) {
      if (typeof t[t.length - 1] == "function") e.apply(this, t);
      else
        return new Promise((l, s) => {
          t.push((d, u) => d != null ? s(d) : l(u)), e.apply(this, t);
        });
    }, "name", { value: e.name });
  }, Yr.fromPromise = function(e) {
    return Object.defineProperty(function(...t) {
      const l = t[t.length - 1];
      if (typeof l != "function") return e.apply(this, t);
      t.pop(), e.apply(this, t).then((s) => l(null, s), l);
    }, "name", { value: e.name });
  }), Yr;
}
var Pn, lo;
function _f() {
  if (lo) return Pn;
  lo = 1;
  var e = mf, t = process.cwd, l = null, s = process.env.GRACEFUL_FS_PLATFORM || process.platform;
  process.cwd = function() {
    return l || (l = t.call(process)), l;
  };
  try {
    process.cwd();
  } catch {
  }
  if (typeof process.chdir == "function") {
    var d = process.chdir;
    process.chdir = function(n) {
      l = null, d.call(process, n);
    }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, d);
  }
  Pn = u;
  function u(n) {
    e.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && h(n), n.lutimes || r(n), n.chown = i(n.chown), n.fchown = i(n.fchown), n.lchown = i(n.lchown), n.chmod = c(n.chmod), n.fchmod = c(n.fchmod), n.lchmod = c(n.lchmod), n.chownSync = a(n.chownSync), n.fchownSync = a(n.fchownSync), n.lchownSync = a(n.lchownSync), n.chmodSync = o(n.chmodSync), n.fchmodSync = o(n.fchmodSync), n.lchmodSync = o(n.lchmodSync), n.stat = p(n.stat), n.fstat = p(n.fstat), n.lstat = p(n.lstat), n.statSync = g(n.statSync), n.fstatSync = g(n.fstatSync), n.lstatSync = g(n.lstatSync), n.chmod && !n.lchmod && (n.lchmod = function(m, w, R) {
      R && process.nextTick(R);
    }, n.lchmodSync = function() {
    }), n.chown && !n.lchown && (n.lchown = function(m, w, R, C) {
      C && process.nextTick(C);
    }, n.lchownSync = function() {
    }), s === "win32" && (n.rename = typeof n.rename != "function" ? n.rename : (function(m) {
      function w(R, C, D) {
        var P = Date.now(), F = 0;
        m(R, C, function O(L) {
          if (L && (L.code === "EACCES" || L.code === "EPERM" || L.code === "EBUSY") && Date.now() - P < 6e4) {
            setTimeout(function() {
              n.stat(C, function(S, z) {
                S && S.code === "ENOENT" ? m(R, C, O) : D(L);
              });
            }, F), F < 100 && (F += 10);
            return;
          }
          D && D(L);
        });
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(w, m), w;
    })(n.rename)), n.read = typeof n.read != "function" ? n.read : (function(m) {
      function w(R, C, D, P, F, O) {
        var L;
        if (O && typeof O == "function") {
          var S = 0;
          L = function(z, G, $) {
            if (z && z.code === "EAGAIN" && S < 10)
              return S++, m.call(n, R, C, D, P, F, L);
            O.apply(this, arguments);
          };
        }
        return m.call(n, R, C, D, P, F, L);
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(w, m), w;
    })(n.read), n.readSync = typeof n.readSync != "function" ? n.readSync : /* @__PURE__ */ (function(m) {
      return function(w, R, C, D, P) {
        for (var F = 0; ; )
          try {
            return m.call(n, w, R, C, D, P);
          } catch (O) {
            if (O.code === "EAGAIN" && F < 10) {
              F++;
              continue;
            }
            throw O;
          }
      };
    })(n.readSync);
    function h(m) {
      m.lchmod = function(w, R, C) {
        m.open(
          w,
          e.O_WRONLY | e.O_SYMLINK,
          R,
          function(D, P) {
            if (D) {
              C && C(D);
              return;
            }
            m.fchmod(P, R, function(F) {
              m.close(P, function(O) {
                C && C(F || O);
              });
            });
          }
        );
      }, m.lchmodSync = function(w, R) {
        var C = m.openSync(w, e.O_WRONLY | e.O_SYMLINK, R), D = !0, P;
        try {
          P = m.fchmodSync(C, R), D = !1;
        } finally {
          if (D)
            try {
              m.closeSync(C);
            } catch {
            }
          else
            m.closeSync(C);
        }
        return P;
      };
    }
    function r(m) {
      e.hasOwnProperty("O_SYMLINK") && m.futimes ? (m.lutimes = function(w, R, C, D) {
        m.open(w, e.O_SYMLINK, function(P, F) {
          if (P) {
            D && D(P);
            return;
          }
          m.futimes(F, R, C, function(O) {
            m.close(F, function(L) {
              D && D(O || L);
            });
          });
        });
      }, m.lutimesSync = function(w, R, C) {
        var D = m.openSync(w, e.O_SYMLINK), P, F = !0;
        try {
          P = m.futimesSync(D, R, C), F = !1;
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
      }) : m.futimes && (m.lutimes = function(w, R, C, D) {
        D && process.nextTick(D);
      }, m.lutimesSync = function() {
      });
    }
    function c(m) {
      return m && function(w, R, C) {
        return m.call(n, w, R, function(D) {
          v(D) && (D = null), C && C.apply(this, arguments);
        });
      };
    }
    function o(m) {
      return m && function(w, R) {
        try {
          return m.call(n, w, R);
        } catch (C) {
          if (!v(C)) throw C;
        }
      };
    }
    function i(m) {
      return m && function(w, R, C, D) {
        return m.call(n, w, R, C, function(P) {
          v(P) && (P = null), D && D.apply(this, arguments);
        });
      };
    }
    function a(m) {
      return m && function(w, R, C) {
        try {
          return m.call(n, w, R, C);
        } catch (D) {
          if (!v(D)) throw D;
        }
      };
    }
    function p(m) {
      return m && function(w, R, C) {
        typeof R == "function" && (C = R, R = null);
        function D(P, F) {
          F && (F.uid < 0 && (F.uid += 4294967296), F.gid < 0 && (F.gid += 4294967296)), C && C.apply(this, arguments);
        }
        return R ? m.call(n, w, R, D) : m.call(n, w, D);
      };
    }
    function g(m) {
      return m && function(w, R) {
        var C = R ? m.call(n, w, R) : m.call(n, w);
        return C && (C.uid < 0 && (C.uid += 4294967296), C.gid < 0 && (C.gid += 4294967296)), C;
      };
    }
    function v(m) {
      if (!m || m.code === "ENOSYS")
        return !0;
      var w = !process.getuid || process.getuid() !== 0;
      return !!(w && (m.code === "EINVAL" || m.code === "EPERM"));
    }
  }
  return Pn;
}
var On, co;
function Sf() {
  if (co) return On;
  co = 1;
  var e = Ur.Stream;
  On = t;
  function t(l) {
    return {
      ReadStream: s,
      WriteStream: d
    };
    function s(u, n) {
      if (!(this instanceof s)) return new s(u, n);
      e.call(this);
      var h = this;
      this.path = u, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, n = n || {};
      for (var r = Object.keys(n), c = 0, o = r.length; c < o; c++) {
        var i = r[c];
        this[i] = n[i];
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
      l.open(this.path, this.flags, this.mode, function(a, p) {
        if (a) {
          h.emit("error", a), h.readable = !1;
          return;
        }
        h.fd = p, h.emit("open", p), h._read();
      });
    }
    function d(u, n) {
      if (!(this instanceof d)) return new d(u, n);
      e.call(this), this.path = u, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, n = n || {};
      for (var h = Object.keys(n), r = 0, c = h.length; r < c; r++) {
        var o = h[r];
        this[o] = n[o];
      }
      if (this.start !== void 0) {
        if (typeof this.start != "number")
          throw TypeError("start must be a Number");
        if (this.start < 0)
          throw new Error("start must be >= zero");
        this.pos = this.start;
      }
      this.busy = !1, this._queue = [], this.fd === null && (this._open = l.open, this._queue.push([this._open, this.path, this.flags, this.mode, void 0]), this.flush());
    }
  }
  return On;
}
var In, uo;
function Af() {
  if (uo) return In;
  uo = 1, In = t;
  var e = Object.getPrototypeOf || function(l) {
    return l.__proto__;
  };
  function t(l) {
    if (l === null || typeof l != "object")
      return l;
    if (l instanceof Object)
      var s = { __proto__: e(l) };
    else
      var s = /* @__PURE__ */ Object.create(null);
    return Object.getOwnPropertyNames(l).forEach(function(d) {
      Object.defineProperty(s, d, Object.getOwnPropertyDescriptor(l, d));
    }), s;
  }
  return In;
}
var Xr, fo;
function Ye() {
  if (fo) return Xr;
  fo = 1;
  var e = At, t = _f(), l = Sf(), s = Af(), d = Ds, u, n;
  typeof Symbol == "function" && typeof Symbol.for == "function" ? (u = /* @__PURE__ */ Symbol.for("graceful-fs.queue"), n = /* @__PURE__ */ Symbol.for("graceful-fs.previous")) : (u = "___graceful-fs.queue", n = "___graceful-fs.previous");
  function h() {
  }
  function r(m, w) {
    Object.defineProperty(m, u, {
      get: function() {
        return w;
      }
    });
  }
  var c = h;
  if (d.debuglog ? c = d.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (c = function() {
    var m = d.format.apply(d, arguments);
    m = "GFS4: " + m.split(/\n/).join(`
GFS4: `), console.error(m);
  }), !e[u]) {
    var o = it[u] || [];
    r(e, o), e.close = (function(m) {
      function w(R, C) {
        return m.call(e, R, function(D) {
          D || g(), typeof C == "function" && C.apply(this, arguments);
        });
      }
      return Object.defineProperty(w, n, {
        value: m
      }), w;
    })(e.close), e.closeSync = (function(m) {
      function w(R) {
        m.apply(e, arguments), g();
      }
      return Object.defineProperty(w, n, {
        value: m
      }), w;
    })(e.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
      c(e[u]), Ac.equal(e[u].length, 0);
    });
  }
  it[u] || r(it, e[u]), Xr = i(s(e)), process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !e.__patched && (Xr = i(e), e.__patched = !0);
  function i(m) {
    t(m), m.gracefulify = i, m.createReadStream = ie, m.createWriteStream = te;
    var w = m.readFile;
    m.readFile = R;
    function R(Y, pe, E) {
      return typeof pe == "function" && (E = pe, pe = null), y(Y, pe, E);
      function y(B, N, fe, ye) {
        return w(B, N, function(ve) {
          ve && (ve.code === "EMFILE" || ve.code === "ENFILE") ? a([y, [B, N, fe], ve, ye || Date.now(), Date.now()]) : typeof fe == "function" && fe.apply(this, arguments);
        });
      }
    }
    var C = m.writeFile;
    m.writeFile = D;
    function D(Y, pe, E, y) {
      return typeof E == "function" && (y = E, E = null), B(Y, pe, E, y);
      function B(N, fe, ye, ve, Se) {
        return C(N, fe, ye, function(we) {
          we && (we.code === "EMFILE" || we.code === "ENFILE") ? a([B, [N, fe, ye, ve], we, Se || Date.now(), Date.now()]) : typeof ve == "function" && ve.apply(this, arguments);
        });
      }
    }
    var P = m.appendFile;
    P && (m.appendFile = F);
    function F(Y, pe, E, y) {
      return typeof E == "function" && (y = E, E = null), B(Y, pe, E, y);
      function B(N, fe, ye, ve, Se) {
        return P(N, fe, ye, function(we) {
          we && (we.code === "EMFILE" || we.code === "ENFILE") ? a([B, [N, fe, ye, ve], we, Se || Date.now(), Date.now()]) : typeof ve == "function" && ve.apply(this, arguments);
        });
      }
    }
    var O = m.copyFile;
    O && (m.copyFile = L);
    function L(Y, pe, E, y) {
      return typeof E == "function" && (y = E, E = 0), B(Y, pe, E, y);
      function B(N, fe, ye, ve, Se) {
        return O(N, fe, ye, function(we) {
          we && (we.code === "EMFILE" || we.code === "ENFILE") ? a([B, [N, fe, ye, ve], we, Se || Date.now(), Date.now()]) : typeof ve == "function" && ve.apply(this, arguments);
        });
      }
    }
    var S = m.readdir;
    m.readdir = G;
    var z = /^v[0-5]\./;
    function G(Y, pe, E) {
      typeof pe == "function" && (E = pe, pe = null);
      var y = z.test(process.version) ? function(fe, ye, ve, Se) {
        return S(fe, B(
          fe,
          ye,
          ve,
          Se
        ));
      } : function(fe, ye, ve, Se) {
        return S(fe, ye, B(
          fe,
          ye,
          ve,
          Se
        ));
      };
      return y(Y, pe, E);
      function B(N, fe, ye, ve) {
        return function(Se, we) {
          Se && (Se.code === "EMFILE" || Se.code === "ENFILE") ? a([
            y,
            [N, fe, ye],
            Se,
            ve || Date.now(),
            Date.now()
          ]) : (we && we.sort && we.sort(), typeof ye == "function" && ye.call(this, Se, we));
        };
      }
    }
    if (process.version.substr(0, 4) === "v0.8") {
      var $ = l(m);
      A = $.ReadStream, M = $.WriteStream;
    }
    var H = m.ReadStream;
    H && (A.prototype = Object.create(H.prototype), A.prototype.open = k);
    var x = m.WriteStream;
    x && (M.prototype = Object.create(x.prototype), M.prototype.open = W), Object.defineProperty(m, "ReadStream", {
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
    var b = A;
    Object.defineProperty(m, "FileReadStream", {
      get: function() {
        return b;
      },
      set: function(Y) {
        b = Y;
      },
      enumerable: !0,
      configurable: !0
    });
    var I = M;
    Object.defineProperty(m, "FileWriteStream", {
      get: function() {
        return I;
      },
      set: function(Y) {
        I = Y;
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
      return this instanceof M ? (x.apply(this, arguments), this) : M.apply(Object.create(M.prototype), arguments);
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
      function B(N, fe, ye, ve, Se) {
        return de(N, fe, ye, function(we, ze) {
          we && (we.code === "EMFILE" || we.code === "ENFILE") ? a([B, [N, fe, ye, ve], we, Se || Date.now(), Date.now()]) : typeof ve == "function" && ve.apply(this, arguments);
        });
      }
    }
    return m;
  }
  function a(m) {
    c("ENQUEUE", m[0].name, m[1]), e[u].push(m), v();
  }
  var p;
  function g() {
    for (var m = Date.now(), w = 0; w < e[u].length; ++w)
      e[u][w].length > 2 && (e[u][w][3] = m, e[u][w][4] = m);
    v();
  }
  function v() {
    if (clearTimeout(p), p = void 0, e[u].length !== 0) {
      var m = e[u].shift(), w = m[0], R = m[1], C = m[2], D = m[3], P = m[4];
      if (D === void 0)
        c("RETRY", w.name, R), w.apply(null, R);
      else if (Date.now() - D >= 6e4) {
        c("TIMEOUT", w.name, R);
        var F = R.pop();
        typeof F == "function" && F.call(null, C);
      } else {
        var O = Date.now() - P, L = Math.max(P - D, 1), S = Math.min(L * 1.2, 100);
        O >= S ? (c("RETRY", w.name, R), w.apply(null, R.concat([D]))) : e[u].push(m);
      }
      p === void 0 && (p = setTimeout(v, 0));
    }
  }
  return Xr;
}
var ho;
function tr() {
  return ho || (ho = 1, (function(e) {
    const t = Ke().fromCallback, l = Ye(), s = [
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
    ].filter((d) => typeof l[d] == "function");
    Object.assign(e, l), s.forEach((d) => {
      e[d] = t(l[d]);
    }), e.exists = function(d, u) {
      return typeof u == "function" ? l.exists(d, u) : new Promise((n) => l.exists(d, n));
    }, e.read = function(d, u, n, h, r, c) {
      return typeof c == "function" ? l.read(d, u, n, h, r, c) : new Promise((o, i) => {
        l.read(d, u, n, h, r, (a, p, g) => {
          if (a) return i(a);
          o({ bytesRead: p, buffer: g });
        });
      });
    }, e.write = function(d, u, ...n) {
      return typeof n[n.length - 1] == "function" ? l.write(d, u, ...n) : new Promise((h, r) => {
        l.write(d, u, ...n, (c, o, i) => {
          if (c) return r(c);
          h({ bytesWritten: o, buffer: i });
        });
      });
    }, typeof l.writev == "function" && (e.writev = function(d, u, ...n) {
      return typeof n[n.length - 1] == "function" ? l.writev(d, u, ...n) : new Promise((h, r) => {
        l.writev(d, u, ...n, (c, o, i) => {
          if (c) return r(c);
          h({ bytesWritten: o, buffers: i });
        });
      });
    }), typeof l.realpath.native == "function" ? e.realpath.native = t(l.realpath.native) : process.emitWarning(
      "fs.realpath.native is not a function. Is fs being monkey-patched?",
      "Warning",
      "fs-extra-WARN0003"
    );
  })(bn)), bn;
}
var Jr = {}, Dn = {}, po;
function Rf() {
  if (po) return Dn;
  po = 1;
  const e = Ne;
  return Dn.checkPath = function(l) {
    if (process.platform === "win32" && /[<>:"|?*]/.test(l.replace(e.parse(l).root, ""))) {
      const d = new Error(`Path contains invalid characters: ${l}`);
      throw d.code = "EINVAL", d;
    }
  }, Dn;
}
var mo;
function Tf() {
  if (mo) return Jr;
  mo = 1;
  const e = /* @__PURE__ */ tr(), { checkPath: t } = /* @__PURE__ */ Rf(), l = (s) => {
    const d = { mode: 511 };
    return typeof s == "number" ? s : { ...d, ...s }.mode;
  };
  return Jr.makeDir = async (s, d) => (t(s), e.mkdir(s, {
    mode: l(d),
    recursive: !0
  })), Jr.makeDirSync = (s, d) => (t(s), e.mkdirSync(s, {
    mode: l(d),
    recursive: !0
  })), Jr;
}
var Nn, go;
function lt() {
  if (go) return Nn;
  go = 1;
  const e = Ke().fromPromise, { makeDir: t, makeDirSync: l } = /* @__PURE__ */ Tf(), s = e(t);
  return Nn = {
    mkdirs: s,
    mkdirsSync: l,
    // alias
    mkdirp: s,
    mkdirpSync: l,
    ensureDir: s,
    ensureDirSync: l
  }, Nn;
}
var Fn, yo;
function qt() {
  if (yo) return Fn;
  yo = 1;
  const e = Ke().fromPromise, t = /* @__PURE__ */ tr();
  function l(s) {
    return t.access(s).then(() => !0).catch(() => !1);
  }
  return Fn = {
    pathExists: e(l),
    pathExistsSync: t.existsSync
  }, Fn;
}
var Ln, vo;
function Oc() {
  if (vo) return Ln;
  vo = 1;
  const e = Ye();
  function t(s, d, u, n) {
    e.open(s, "r+", (h, r) => {
      if (h) return n(h);
      e.futimes(r, d, u, (c) => {
        e.close(r, (o) => {
          n && n(c || o);
        });
      });
    });
  }
  function l(s, d, u) {
    const n = e.openSync(s, "r+");
    return e.futimesSync(n, d, u), e.closeSync(n);
  }
  return Ln = {
    utimesMillis: t,
    utimesMillisSync: l
  }, Ln;
}
var xn, Eo;
function rr() {
  if (Eo) return xn;
  Eo = 1;
  const e = /* @__PURE__ */ tr(), t = Ne, l = Ds;
  function s(a, p, g) {
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
  function u(a, p, g, v, m) {
    l.callbackify(s)(a, p, v, (w, R) => {
      if (w) return m(w);
      const { srcStat: C, destStat: D } = R;
      if (D) {
        if (c(C, D)) {
          const P = t.basename(a), F = t.basename(p);
          return g === "move" && P !== F && P.toLowerCase() === F.toLowerCase() ? m(null, { srcStat: C, destStat: D, isChangingCase: !0 }) : m(new Error("Source and destination must not be the same."));
        }
        if (C.isDirectory() && !D.isDirectory())
          return m(new Error(`Cannot overwrite non-directory '${p}' with directory '${a}'.`));
        if (!C.isDirectory() && D.isDirectory())
          return m(new Error(`Cannot overwrite directory '${p}' with non-directory '${a}'.`));
      }
      return C.isDirectory() && o(a, p) ? m(new Error(i(a, p, g))) : m(null, { srcStat: C, destStat: D });
    });
  }
  function n(a, p, g, v) {
    const { srcStat: m, destStat: w } = d(a, p, v);
    if (w) {
      if (c(m, w)) {
        const R = t.basename(a), C = t.basename(p);
        if (g === "move" && R !== C && R.toLowerCase() === C.toLowerCase())
          return { srcStat: m, destStat: w, isChangingCase: !0 };
        throw new Error("Source and destination must not be the same.");
      }
      if (m.isDirectory() && !w.isDirectory())
        throw new Error(`Cannot overwrite non-directory '${p}' with directory '${a}'.`);
      if (!m.isDirectory() && w.isDirectory())
        throw new Error(`Cannot overwrite directory '${p}' with non-directory '${a}'.`);
    }
    if (m.isDirectory() && o(a, p))
      throw new Error(i(a, p, g));
    return { srcStat: m, destStat: w };
  }
  function h(a, p, g, v, m) {
    const w = t.resolve(t.dirname(a)), R = t.resolve(t.dirname(g));
    if (R === w || R === t.parse(R).root) return m();
    e.stat(R, { bigint: !0 }, (C, D) => C ? C.code === "ENOENT" ? m() : m(C) : c(p, D) ? m(new Error(i(a, g, v))) : h(a, p, R, v, m));
  }
  function r(a, p, g, v) {
    const m = t.resolve(t.dirname(a)), w = t.resolve(t.dirname(g));
    if (w === m || w === t.parse(w).root) return;
    let R;
    try {
      R = e.statSync(w, { bigint: !0 });
    } catch (C) {
      if (C.code === "ENOENT") return;
      throw C;
    }
    if (c(p, R))
      throw new Error(i(a, g, v));
    return r(a, p, w, v);
  }
  function c(a, p) {
    return p.ino && p.dev && p.ino === a.ino && p.dev === a.dev;
  }
  function o(a, p) {
    const g = t.resolve(a).split(t.sep).filter((m) => m), v = t.resolve(p).split(t.sep).filter((m) => m);
    return g.reduce((m, w, R) => m && v[R] === w, !0);
  }
  function i(a, p, g) {
    return `Cannot ${g} '${a}' to a subdirectory of itself, '${p}'.`;
  }
  return xn = {
    checkPaths: u,
    checkPathsSync: n,
    checkParentPaths: h,
    checkParentPathsSync: r,
    isSrcSubdir: o,
    areIdentical: c
  }, xn;
}
var Un, wo;
function Cf() {
  if (wo) return Un;
  wo = 1;
  const e = Ye(), t = Ne, l = lt().mkdirs, s = qt().pathExists, d = Oc().utimesMillis, u = /* @__PURE__ */ rr();
  function n(G, $, H, x) {
    typeof H == "function" && !x ? (x = H, H = {}) : typeof H == "function" && (H = { filter: H }), x = x || function() {
    }, H = H || {}, H.clobber = "clobber" in H ? !!H.clobber : !0, H.overwrite = "overwrite" in H ? !!H.overwrite : H.clobber, H.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0001"
    ), u.checkPaths(G, $, "copy", H, (b, I) => {
      if (b) return x(b);
      const { srcStat: A, destStat: k } = I;
      u.checkParentPaths(G, A, $, "copy", (M) => M ? x(M) : H.filter ? r(h, k, G, $, H, x) : h(k, G, $, H, x));
    });
  }
  function h(G, $, H, x, b) {
    const I = t.dirname(H);
    s(I, (A, k) => {
      if (A) return b(A);
      if (k) return o(G, $, H, x, b);
      l(I, (M) => M ? b(M) : o(G, $, H, x, b));
    });
  }
  function r(G, $, H, x, b, I) {
    Promise.resolve(b.filter(H, x)).then((A) => A ? G($, H, x, b, I) : I(), (A) => I(A));
  }
  function c(G, $, H, x, b) {
    return x.filter ? r(o, G, $, H, x, b) : o(G, $, H, x, b);
  }
  function o(G, $, H, x, b) {
    (x.dereference ? e.stat : e.lstat)($, (A, k) => A ? b(A) : k.isDirectory() ? D(k, G, $, H, x, b) : k.isFile() || k.isCharacterDevice() || k.isBlockDevice() ? i(k, G, $, H, x, b) : k.isSymbolicLink() ? S(G, $, H, x, b) : k.isSocket() ? b(new Error(`Cannot copy a socket file: ${$}`)) : k.isFIFO() ? b(new Error(`Cannot copy a FIFO pipe: ${$}`)) : b(new Error(`Unknown file: ${$}`)));
  }
  function i(G, $, H, x, b, I) {
    return $ ? a(G, H, x, b, I) : p(G, H, x, b, I);
  }
  function a(G, $, H, x, b) {
    if (x.overwrite)
      e.unlink(H, (I) => I ? b(I) : p(G, $, H, x, b));
    else return x.errorOnExist ? b(new Error(`'${H}' already exists`)) : b();
  }
  function p(G, $, H, x, b) {
    e.copyFile($, H, (I) => I ? b(I) : x.preserveTimestamps ? g(G.mode, $, H, b) : R(H, G.mode, b));
  }
  function g(G, $, H, x) {
    return v(G) ? m(H, G, (b) => b ? x(b) : w(G, $, H, x)) : w(G, $, H, x);
  }
  function v(G) {
    return (G & 128) === 0;
  }
  function m(G, $, H) {
    return R(G, $ | 128, H);
  }
  function w(G, $, H, x) {
    C($, H, (b) => b ? x(b) : R(H, G, x));
  }
  function R(G, $, H) {
    return e.chmod(G, $, H);
  }
  function C(G, $, H) {
    e.stat(G, (x, b) => x ? H(x) : d($, b.atime, b.mtime, H));
  }
  function D(G, $, H, x, b, I) {
    return $ ? F(H, x, b, I) : P(G.mode, H, x, b, I);
  }
  function P(G, $, H, x, b) {
    e.mkdir(H, (I) => {
      if (I) return b(I);
      F($, H, x, (A) => A ? b(A) : R(H, G, b));
    });
  }
  function F(G, $, H, x) {
    e.readdir(G, (b, I) => b ? x(b) : O(I, G, $, H, x));
  }
  function O(G, $, H, x, b) {
    const I = G.pop();
    return I ? L(G, I, $, H, x, b) : b();
  }
  function L(G, $, H, x, b, I) {
    const A = t.join(H, $), k = t.join(x, $);
    u.checkPaths(A, k, "copy", b, (M, W) => {
      if (M) return I(M);
      const { destStat: ie } = W;
      c(ie, A, k, b, (te) => te ? I(te) : O(G, H, x, b, I));
    });
  }
  function S(G, $, H, x, b) {
    e.readlink($, (I, A) => {
      if (I) return b(I);
      if (x.dereference && (A = t.resolve(process.cwd(), A)), G)
        e.readlink(H, (k, M) => k ? k.code === "EINVAL" || k.code === "UNKNOWN" ? e.symlink(A, H, b) : b(k) : (x.dereference && (M = t.resolve(process.cwd(), M)), u.isSrcSubdir(A, M) ? b(new Error(`Cannot copy '${A}' to a subdirectory of itself, '${M}'.`)) : G.isDirectory() && u.isSrcSubdir(M, A) ? b(new Error(`Cannot overwrite '${M}' with '${A}'.`)) : z(A, H, b)));
      else
        return e.symlink(A, H, b);
    });
  }
  function z(G, $, H) {
    e.unlink($, (x) => x ? H(x) : e.symlink(G, $, H));
  }
  return Un = n, Un;
}
var kn, _o;
function bf() {
  if (_o) return kn;
  _o = 1;
  const e = Ye(), t = Ne, l = lt().mkdirsSync, s = Oc().utimesMillisSync, d = /* @__PURE__ */ rr();
  function u(O, L, S) {
    typeof S == "function" && (S = { filter: S }), S = S || {}, S.clobber = "clobber" in S ? !!S.clobber : !0, S.overwrite = "overwrite" in S ? !!S.overwrite : S.clobber, S.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0002"
    );
    const { srcStat: z, destStat: G } = d.checkPathsSync(O, L, "copy", S);
    return d.checkParentPathsSync(O, z, L, "copy"), n(G, O, L, S);
  }
  function n(O, L, S, z) {
    if (z.filter && !z.filter(L, S)) return;
    const G = t.dirname(S);
    return e.existsSync(G) || l(G), r(O, L, S, z);
  }
  function h(O, L, S, z) {
    if (!(z.filter && !z.filter(L, S)))
      return r(O, L, S, z);
  }
  function r(O, L, S, z) {
    const $ = (z.dereference ? e.statSync : e.lstatSync)(L);
    if ($.isDirectory()) return w($, O, L, S, z);
    if ($.isFile() || $.isCharacterDevice() || $.isBlockDevice()) return c($, O, L, S, z);
    if ($.isSymbolicLink()) return P(O, L, S, z);
    throw $.isSocket() ? new Error(`Cannot copy a socket file: ${L}`) : $.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${L}`) : new Error(`Unknown file: ${L}`);
  }
  function c(O, L, S, z, G) {
    return L ? o(O, S, z, G) : i(O, S, z, G);
  }
  function o(O, L, S, z) {
    if (z.overwrite)
      return e.unlinkSync(S), i(O, L, S, z);
    if (z.errorOnExist)
      throw new Error(`'${S}' already exists`);
  }
  function i(O, L, S, z) {
    return e.copyFileSync(L, S), z.preserveTimestamps && a(O.mode, L, S), v(S, O.mode);
  }
  function a(O, L, S) {
    return p(O) && g(S, O), m(L, S);
  }
  function p(O) {
    return (O & 128) === 0;
  }
  function g(O, L) {
    return v(O, L | 128);
  }
  function v(O, L) {
    return e.chmodSync(O, L);
  }
  function m(O, L) {
    const S = e.statSync(O);
    return s(L, S.atime, S.mtime);
  }
  function w(O, L, S, z, G) {
    return L ? C(S, z, G) : R(O.mode, S, z, G);
  }
  function R(O, L, S, z) {
    return e.mkdirSync(S), C(L, S, z), v(S, O);
  }
  function C(O, L, S) {
    e.readdirSync(O).forEach((z) => D(z, O, L, S));
  }
  function D(O, L, S, z) {
    const G = t.join(L, O), $ = t.join(S, O), { destStat: H } = d.checkPathsSync(G, $, "copy", z);
    return h(H, G, $, z);
  }
  function P(O, L, S, z) {
    let G = e.readlinkSync(L);
    if (z.dereference && (G = t.resolve(process.cwd(), G)), O) {
      let $;
      try {
        $ = e.readlinkSync(S);
      } catch (H) {
        if (H.code === "EINVAL" || H.code === "UNKNOWN") return e.symlinkSync(G, S);
        throw H;
      }
      if (z.dereference && ($ = t.resolve(process.cwd(), $)), d.isSrcSubdir(G, $))
        throw new Error(`Cannot copy '${G}' to a subdirectory of itself, '${$}'.`);
      if (e.statSync(S).isDirectory() && d.isSrcSubdir($, G))
        throw new Error(`Cannot overwrite '${$}' with '${G}'.`);
      return F(G, S);
    } else
      return e.symlinkSync(G, S);
  }
  function F(O, L) {
    return e.unlinkSync(L), e.symlinkSync(O, L);
  }
  return kn = u, kn;
}
var $n, So;
function Ns() {
  if (So) return $n;
  So = 1;
  const e = Ke().fromCallback;
  return $n = {
    copy: e(/* @__PURE__ */ Cf()),
    copySync: /* @__PURE__ */ bf()
  }, $n;
}
var qn, Ao;
function Pf() {
  if (Ao) return qn;
  Ao = 1;
  const e = Ye(), t = Ne, l = Ac, s = process.platform === "win32";
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
  function u(g, v, m) {
    let w = 0;
    typeof v == "function" && (m = v, v = {}), l(g, "rimraf: missing path"), l.strictEqual(typeof g, "string", "rimraf: path should be a string"), l.strictEqual(typeof m, "function", "rimraf: callback function required"), l(v, "rimraf: invalid options argument provided"), l.strictEqual(typeof v, "object", "rimraf: options should be object"), d(v), n(g, v, function R(C) {
      if (C) {
        if ((C.code === "EBUSY" || C.code === "ENOTEMPTY" || C.code === "EPERM") && w < v.maxBusyTries) {
          w++;
          const D = w * 100;
          return setTimeout(() => n(g, v, R), D);
        }
        C.code === "ENOENT" && (C = null);
      }
      m(C);
    });
  }
  function n(g, v, m) {
    l(g), l(v), l(typeof m == "function"), v.lstat(g, (w, R) => {
      if (w && w.code === "ENOENT")
        return m(null);
      if (w && w.code === "EPERM" && s)
        return h(g, v, w, m);
      if (R && R.isDirectory())
        return c(g, v, w, m);
      v.unlink(g, (C) => {
        if (C) {
          if (C.code === "ENOENT")
            return m(null);
          if (C.code === "EPERM")
            return s ? h(g, v, C, m) : c(g, v, C, m);
          if (C.code === "EISDIR")
            return c(g, v, C, m);
        }
        return m(C);
      });
    });
  }
  function h(g, v, m, w) {
    l(g), l(v), l(typeof w == "function"), v.chmod(g, 438, (R) => {
      R ? w(R.code === "ENOENT" ? null : m) : v.stat(g, (C, D) => {
        C ? w(C.code === "ENOENT" ? null : m) : D.isDirectory() ? c(g, v, m, w) : v.unlink(g, w);
      });
    });
  }
  function r(g, v, m) {
    let w;
    l(g), l(v);
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
  function c(g, v, m, w) {
    l(g), l(v), l(typeof w == "function"), v.rmdir(g, (R) => {
      R && (R.code === "ENOTEMPTY" || R.code === "EEXIST" || R.code === "EPERM") ? o(g, v, w) : R && R.code === "ENOTDIR" ? w(m) : w(R);
    });
  }
  function o(g, v, m) {
    l(g), l(v), l(typeof m == "function"), v.readdir(g, (w, R) => {
      if (w) return m(w);
      let C = R.length, D;
      if (C === 0) return v.rmdir(g, m);
      R.forEach((P) => {
        u(t.join(g, P), v, (F) => {
          if (!D) {
            if (F) return m(D = F);
            --C === 0 && v.rmdir(g, m);
          }
        });
      });
    });
  }
  function i(g, v) {
    let m;
    v = v || {}, d(v), l(g, "rimraf: missing path"), l.strictEqual(typeof g, "string", "rimraf: path should be a string"), l(v, "rimraf: missing options"), l.strictEqual(typeof v, "object", "rimraf: options should be object");
    try {
      m = v.lstatSync(g);
    } catch (w) {
      if (w.code === "ENOENT")
        return;
      w.code === "EPERM" && s && r(g, v, w);
    }
    try {
      m && m.isDirectory() ? a(g, v, null) : v.unlinkSync(g);
    } catch (w) {
      if (w.code === "ENOENT")
        return;
      if (w.code === "EPERM")
        return s ? r(g, v, w) : a(g, v, w);
      if (w.code !== "EISDIR")
        throw w;
      a(g, v, w);
    }
  }
  function a(g, v, m) {
    l(g), l(v);
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
    if (l(g), l(v), v.readdirSync(g).forEach((m) => i(t.join(g, m), v)), s) {
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
  return qn = u, u.sync = i, qn;
}
var Mn, Ro;
function pn() {
  if (Ro) return Mn;
  Ro = 1;
  const e = Ye(), t = Ke().fromCallback, l = /* @__PURE__ */ Pf();
  function s(u, n) {
    if (e.rm) return e.rm(u, { recursive: !0, force: !0 }, n);
    l(u, n);
  }
  function d(u) {
    if (e.rmSync) return e.rmSync(u, { recursive: !0, force: !0 });
    l.sync(u);
  }
  return Mn = {
    remove: t(s),
    removeSync: d
  }, Mn;
}
var Bn, To;
function Of() {
  if (To) return Bn;
  To = 1;
  const e = Ke().fromPromise, t = /* @__PURE__ */ tr(), l = Ne, s = /* @__PURE__ */ lt(), d = /* @__PURE__ */ pn(), u = e(async function(r) {
    let c;
    try {
      c = await t.readdir(r);
    } catch {
      return s.mkdirs(r);
    }
    return Promise.all(c.map((o) => d.remove(l.join(r, o))));
  });
  function n(h) {
    let r;
    try {
      r = t.readdirSync(h);
    } catch {
      return s.mkdirsSync(h);
    }
    r.forEach((c) => {
      c = l.join(h, c), d.removeSync(c);
    });
  }
  return Bn = {
    emptyDirSync: n,
    emptydirSync: n,
    emptyDir: u,
    emptydir: u
  }, Bn;
}
var jn, Co;
function If() {
  if (Co) return jn;
  Co = 1;
  const e = Ke().fromCallback, t = Ne, l = Ye(), s = /* @__PURE__ */ lt();
  function d(n, h) {
    function r() {
      l.writeFile(n, "", (c) => {
        if (c) return h(c);
        h();
      });
    }
    l.stat(n, (c, o) => {
      if (!c && o.isFile()) return h();
      const i = t.dirname(n);
      l.stat(i, (a, p) => {
        if (a)
          return a.code === "ENOENT" ? s.mkdirs(i, (g) => {
            if (g) return h(g);
            r();
          }) : h(a);
        p.isDirectory() ? r() : l.readdir(i, (g) => {
          if (g) return h(g);
        });
      });
    });
  }
  function u(n) {
    let h;
    try {
      h = l.statSync(n);
    } catch {
    }
    if (h && h.isFile()) return;
    const r = t.dirname(n);
    try {
      l.statSync(r).isDirectory() || l.readdirSync(r);
    } catch (c) {
      if (c && c.code === "ENOENT") s.mkdirsSync(r);
      else throw c;
    }
    l.writeFileSync(n, "");
  }
  return jn = {
    createFile: e(d),
    createFileSync: u
  }, jn;
}
var Hn, bo;
function Df() {
  if (bo) return Hn;
  bo = 1;
  const e = Ke().fromCallback, t = Ne, l = Ye(), s = /* @__PURE__ */ lt(), d = qt().pathExists, { areIdentical: u } = /* @__PURE__ */ rr();
  function n(r, c, o) {
    function i(a, p) {
      l.link(a, p, (g) => {
        if (g) return o(g);
        o(null);
      });
    }
    l.lstat(c, (a, p) => {
      l.lstat(r, (g, v) => {
        if (g)
          return g.message = g.message.replace("lstat", "ensureLink"), o(g);
        if (p && u(v, p)) return o(null);
        const m = t.dirname(c);
        d(m, (w, R) => {
          if (w) return o(w);
          if (R) return i(r, c);
          s.mkdirs(m, (C) => {
            if (C) return o(C);
            i(r, c);
          });
        });
      });
    });
  }
  function h(r, c) {
    let o;
    try {
      o = l.lstatSync(c);
    } catch {
    }
    try {
      const p = l.lstatSync(r);
      if (o && u(p, o)) return;
    } catch (p) {
      throw p.message = p.message.replace("lstat", "ensureLink"), p;
    }
    const i = t.dirname(c);
    return l.existsSync(i) || s.mkdirsSync(i), l.linkSync(r, c);
  }
  return Hn = {
    createLink: e(n),
    createLinkSync: h
  }, Hn;
}
var Gn, Po;
function Nf() {
  if (Po) return Gn;
  Po = 1;
  const e = Ne, t = Ye(), l = qt().pathExists;
  function s(u, n, h) {
    if (e.isAbsolute(u))
      return t.lstat(u, (r) => r ? (r.message = r.message.replace("lstat", "ensureSymlink"), h(r)) : h(null, {
        toCwd: u,
        toDst: u
      }));
    {
      const r = e.dirname(n), c = e.join(r, u);
      return l(c, (o, i) => o ? h(o) : i ? h(null, {
        toCwd: c,
        toDst: u
      }) : t.lstat(u, (a) => a ? (a.message = a.message.replace("lstat", "ensureSymlink"), h(a)) : h(null, {
        toCwd: u,
        toDst: e.relative(r, u)
      })));
    }
  }
  function d(u, n) {
    let h;
    if (e.isAbsolute(u)) {
      if (h = t.existsSync(u), !h) throw new Error("absolute srcpath does not exist");
      return {
        toCwd: u,
        toDst: u
      };
    } else {
      const r = e.dirname(n), c = e.join(r, u);
      if (h = t.existsSync(c), h)
        return {
          toCwd: c,
          toDst: u
        };
      if (h = t.existsSync(u), !h) throw new Error("relative srcpath does not exist");
      return {
        toCwd: u,
        toDst: e.relative(r, u)
      };
    }
  }
  return Gn = {
    symlinkPaths: s,
    symlinkPathsSync: d
  }, Gn;
}
var Wn, Oo;
function Ff() {
  if (Oo) return Wn;
  Oo = 1;
  const e = Ye();
  function t(s, d, u) {
    if (u = typeof d == "function" ? d : u, d = typeof d == "function" ? !1 : d, d) return u(null, d);
    e.lstat(s, (n, h) => {
      if (n) return u(null, "file");
      d = h && h.isDirectory() ? "dir" : "file", u(null, d);
    });
  }
  function l(s, d) {
    let u;
    if (d) return d;
    try {
      u = e.lstatSync(s);
    } catch {
      return "file";
    }
    return u && u.isDirectory() ? "dir" : "file";
  }
  return Wn = {
    symlinkType: t,
    symlinkTypeSync: l
  }, Wn;
}
var Vn, Io;
function Lf() {
  if (Io) return Vn;
  Io = 1;
  const e = Ke().fromCallback, t = Ne, l = /* @__PURE__ */ tr(), s = /* @__PURE__ */ lt(), d = s.mkdirs, u = s.mkdirsSync, n = /* @__PURE__ */ Nf(), h = n.symlinkPaths, r = n.symlinkPathsSync, c = /* @__PURE__ */ Ff(), o = c.symlinkType, i = c.symlinkTypeSync, a = qt().pathExists, { areIdentical: p } = /* @__PURE__ */ rr();
  function g(w, R, C, D) {
    D = typeof C == "function" ? C : D, C = typeof C == "function" ? !1 : C, l.lstat(R, (P, F) => {
      !P && F.isSymbolicLink() ? Promise.all([
        l.stat(w),
        l.stat(R)
      ]).then(([O, L]) => {
        if (p(O, L)) return D(null);
        v(w, R, C, D);
      }) : v(w, R, C, D);
    });
  }
  function v(w, R, C, D) {
    h(w, R, (P, F) => {
      if (P) return D(P);
      w = F.toDst, o(F.toCwd, C, (O, L) => {
        if (O) return D(O);
        const S = t.dirname(R);
        a(S, (z, G) => {
          if (z) return D(z);
          if (G) return l.symlink(w, R, L, D);
          d(S, ($) => {
            if ($) return D($);
            l.symlink(w, R, L, D);
          });
        });
      });
    });
  }
  function m(w, R, C) {
    let D;
    try {
      D = l.lstatSync(R);
    } catch {
    }
    if (D && D.isSymbolicLink()) {
      const L = l.statSync(w), S = l.statSync(R);
      if (p(L, S)) return;
    }
    const P = r(w, R);
    w = P.toDst, C = i(P.toCwd, C);
    const F = t.dirname(R);
    return l.existsSync(F) || u(F), l.symlinkSync(w, R, C);
  }
  return Vn = {
    createSymlink: e(g),
    createSymlinkSync: m
  }, Vn;
}
var zn, Do;
function xf() {
  if (Do) return zn;
  Do = 1;
  const { createFile: e, createFileSync: t } = /* @__PURE__ */ If(), { createLink: l, createLinkSync: s } = /* @__PURE__ */ Df(), { createSymlink: d, createSymlinkSync: u } = /* @__PURE__ */ Lf();
  return zn = {
    // file
    createFile: e,
    createFileSync: t,
    ensureFile: e,
    ensureFileSync: t,
    // link
    createLink: l,
    createLinkSync: s,
    ensureLink: l,
    ensureLinkSync: s,
    // symlink
    createSymlink: d,
    createSymlinkSync: u,
    ensureSymlink: d,
    ensureSymlinkSync: u
  }, zn;
}
var Yn, No;
function Fs() {
  if (No) return Yn;
  No = 1;
  function e(l, { EOL: s = `
`, finalEOL: d = !0, replacer: u = null, spaces: n } = {}) {
    const h = d ? s : "", r = JSON.stringify(l, u, n);
    if (r === void 0)
      throw new TypeError(`Converting ${typeof l} value to JSON is not supported`);
    return r.replace(/\n/g, s) + h;
  }
  function t(l) {
    return Buffer.isBuffer(l) && (l = l.toString("utf8")), l.replace(/^\uFEFF/, "");
  }
  return Yn = { stringify: e, stripBom: t }, Yn;
}
var Xn, Fo;
function Uf() {
  if (Fo) return Xn;
  Fo = 1;
  let e;
  try {
    e = Ye();
  } catch {
    e = At;
  }
  const t = Ke(), { stringify: l, stripBom: s } = Fs();
  async function d(o, i = {}) {
    typeof i == "string" && (i = { encoding: i });
    const a = i.fs || e, p = "throws" in i ? i.throws : !0;
    let g = await t.fromCallback(a.readFile)(o, i);
    g = s(g);
    let v;
    try {
      v = JSON.parse(g, i ? i.reviver : null);
    } catch (m) {
      if (p)
        throw m.message = `${o}: ${m.message}`, m;
      return null;
    }
    return v;
  }
  const u = t.fromPromise(d);
  function n(o, i = {}) {
    typeof i == "string" && (i = { encoding: i });
    const a = i.fs || e, p = "throws" in i ? i.throws : !0;
    try {
      let g = a.readFileSync(o, i);
      return g = s(g), JSON.parse(g, i.reviver);
    } catch (g) {
      if (p)
        throw g.message = `${o}: ${g.message}`, g;
      return null;
    }
  }
  async function h(o, i, a = {}) {
    const p = a.fs || e, g = l(i, a);
    await t.fromCallback(p.writeFile)(o, g, a);
  }
  const r = t.fromPromise(h);
  function c(o, i, a = {}) {
    const p = a.fs || e, g = l(i, a);
    return p.writeFileSync(o, g, a);
  }
  return Xn = {
    readFile: u,
    readFileSync: n,
    writeFile: r,
    writeFileSync: c
  }, Xn;
}
var Jn, Lo;
function kf() {
  if (Lo) return Jn;
  Lo = 1;
  const e = Uf();
  return Jn = {
    // jsonfile exports
    readJson: e.readFile,
    readJsonSync: e.readFileSync,
    writeJson: e.writeFile,
    writeJsonSync: e.writeFileSync
  }, Jn;
}
var Kn, xo;
function Ls() {
  if (xo) return Kn;
  xo = 1;
  const e = Ke().fromCallback, t = Ye(), l = Ne, s = /* @__PURE__ */ lt(), d = qt().pathExists;
  function u(h, r, c, o) {
    typeof c == "function" && (o = c, c = "utf8");
    const i = l.dirname(h);
    d(i, (a, p) => {
      if (a) return o(a);
      if (p) return t.writeFile(h, r, c, o);
      s.mkdirs(i, (g) => {
        if (g) return o(g);
        t.writeFile(h, r, c, o);
      });
    });
  }
  function n(h, ...r) {
    const c = l.dirname(h);
    if (t.existsSync(c))
      return t.writeFileSync(h, ...r);
    s.mkdirsSync(c), t.writeFileSync(h, ...r);
  }
  return Kn = {
    outputFile: e(u),
    outputFileSync: n
  }, Kn;
}
var Qn, Uo;
function $f() {
  if (Uo) return Qn;
  Uo = 1;
  const { stringify: e } = Fs(), { outputFile: t } = /* @__PURE__ */ Ls();
  async function l(s, d, u = {}) {
    const n = e(d, u);
    await t(s, n, u);
  }
  return Qn = l, Qn;
}
var Zn, ko;
function qf() {
  if (ko) return Zn;
  ko = 1;
  const { stringify: e } = Fs(), { outputFileSync: t } = /* @__PURE__ */ Ls();
  function l(s, d, u) {
    const n = e(d, u);
    t(s, n, u);
  }
  return Zn = l, Zn;
}
var ei, $o;
function Mf() {
  if ($o) return ei;
  $o = 1;
  const e = Ke().fromPromise, t = /* @__PURE__ */ kf();
  return t.outputJson = e(/* @__PURE__ */ $f()), t.outputJsonSync = /* @__PURE__ */ qf(), t.outputJSON = t.outputJson, t.outputJSONSync = t.outputJsonSync, t.writeJSON = t.writeJson, t.writeJSONSync = t.writeJsonSync, t.readJSON = t.readJson, t.readJSONSync = t.readJsonSync, ei = t, ei;
}
var ti, qo;
function Bf() {
  if (qo) return ti;
  qo = 1;
  const e = Ye(), t = Ne, l = Ns().copy, s = pn().remove, d = lt().mkdirp, u = qt().pathExists, n = /* @__PURE__ */ rr();
  function h(a, p, g, v) {
    typeof g == "function" && (v = g, g = {}), g = g || {};
    const m = g.overwrite || g.clobber || !1;
    n.checkPaths(a, p, "move", g, (w, R) => {
      if (w) return v(w);
      const { srcStat: C, isChangingCase: D = !1 } = R;
      n.checkParentPaths(a, C, p, "move", (P) => {
        if (P) return v(P);
        if (r(p)) return c(a, p, m, D, v);
        d(t.dirname(p), (F) => F ? v(F) : c(a, p, m, D, v));
      });
    });
  }
  function r(a) {
    const p = t.dirname(a);
    return t.parse(p).root === p;
  }
  function c(a, p, g, v, m) {
    if (v) return o(a, p, g, m);
    if (g)
      return s(p, (w) => w ? m(w) : o(a, p, g, m));
    u(p, (w, R) => w ? m(w) : R ? m(new Error("dest already exists.")) : o(a, p, g, m));
  }
  function o(a, p, g, v) {
    e.rename(a, p, (m) => m ? m.code !== "EXDEV" ? v(m) : i(a, p, g, v) : v());
  }
  function i(a, p, g, v) {
    l(a, p, {
      overwrite: g,
      errorOnExist: !0
    }, (w) => w ? v(w) : s(a, v));
  }
  return ti = h, ti;
}
var ri, Mo;
function jf() {
  if (Mo) return ri;
  Mo = 1;
  const e = Ye(), t = Ne, l = Ns().copySync, s = pn().removeSync, d = lt().mkdirpSync, u = /* @__PURE__ */ rr();
  function n(i, a, p) {
    p = p || {};
    const g = p.overwrite || p.clobber || !1, { srcStat: v, isChangingCase: m = !1 } = u.checkPathsSync(i, a, "move", p);
    return u.checkParentPathsSync(i, v, a, "move"), h(a) || d(t.dirname(a)), r(i, a, g, m);
  }
  function h(i) {
    const a = t.dirname(i);
    return t.parse(a).root === a;
  }
  function r(i, a, p, g) {
    if (g) return c(i, a, p);
    if (p)
      return s(a), c(i, a, p);
    if (e.existsSync(a)) throw new Error("dest already exists.");
    return c(i, a, p);
  }
  function c(i, a, p) {
    try {
      e.renameSync(i, a);
    } catch (g) {
      if (g.code !== "EXDEV") throw g;
      return o(i, a, p);
    }
  }
  function o(i, a, p) {
    return l(i, a, {
      overwrite: p,
      errorOnExist: !0
    }), s(i);
  }
  return ri = n, ri;
}
var ni, Bo;
function Hf() {
  if (Bo) return ni;
  Bo = 1;
  const e = Ke().fromCallback;
  return ni = {
    move: e(/* @__PURE__ */ Bf()),
    moveSync: /* @__PURE__ */ jf()
  }, ni;
}
var ii, jo;
function Rt() {
  return jo || (jo = 1, ii = {
    // Export promiseified graceful-fs:
    .../* @__PURE__ */ tr(),
    // Export extra methods:
    .../* @__PURE__ */ Ns(),
    .../* @__PURE__ */ Of(),
    .../* @__PURE__ */ xf(),
    .../* @__PURE__ */ Mf(),
    .../* @__PURE__ */ lt(),
    .../* @__PURE__ */ Hf(),
    .../* @__PURE__ */ Ls(),
    .../* @__PURE__ */ qt(),
    .../* @__PURE__ */ pn()
  }), ii;
}
var ar = {}, Dt = {}, si = {}, Nt = {}, Ho;
function xs() {
  if (Ho) return Nt;
  Ho = 1, Object.defineProperty(Nt, "__esModule", { value: !0 }), Nt.CancellationError = Nt.CancellationToken = void 0;
  const e = Tc;
  let t = class extends e.EventEmitter {
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
        return Promise.reject(new l());
      const u = () => {
        if (n != null)
          try {
            this.removeListener("cancel", n), n = null;
          } catch {
          }
      };
      let n = null;
      return new Promise((h, r) => {
        let c = null;
        if (n = () => {
          try {
            c != null && (c(), c = null);
          } finally {
            r(new l());
          }
        }, this.cancelled) {
          n();
          return;
        }
        this.onCancel(n), d(h, r, (o) => {
          c = o;
        });
      }).then((h) => (u(), h)).catch((h) => {
        throw u(), h;
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
  Nt.CancellationToken = t;
  class l extends Error {
    constructor() {
      super("cancelled");
    }
  }
  return Nt.CancellationError = l, Nt;
}
var Kr = {}, Go;
function mn() {
  if (Go) return Kr;
  Go = 1, Object.defineProperty(Kr, "__esModule", { value: !0 }), Kr.newError = e;
  function e(t, l) {
    const s = new Error(t);
    return s.code = l, s;
  }
  return Kr;
}
var ke = {}, Qr = { exports: {} }, Zr = { exports: {} }, oi, Wo;
function Gf() {
  if (Wo) return oi;
  Wo = 1;
  var e = 1e3, t = e * 60, l = t * 60, s = l * 24, d = s * 7, u = s * 365.25;
  oi = function(o, i) {
    i = i || {};
    var a = typeof o;
    if (a === "string" && o.length > 0)
      return n(o);
    if (a === "number" && isFinite(o))
      return i.long ? r(o) : h(o);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(o)
    );
  };
  function n(o) {
    if (o = String(o), !(o.length > 100)) {
      var i = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        o
      );
      if (i) {
        var a = parseFloat(i[1]), p = (i[2] || "ms").toLowerCase();
        switch (p) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return a * u;
          case "weeks":
          case "week":
          case "w":
            return a * d;
          case "days":
          case "day":
          case "d":
            return a * s;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return a * l;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return a * t;
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
  function h(o) {
    var i = Math.abs(o);
    return i >= s ? Math.round(o / s) + "d" : i >= l ? Math.round(o / l) + "h" : i >= t ? Math.round(o / t) + "m" : i >= e ? Math.round(o / e) + "s" : o + "ms";
  }
  function r(o) {
    var i = Math.abs(o);
    return i >= s ? c(o, i, s, "day") : i >= l ? c(o, i, l, "hour") : i >= t ? c(o, i, t, "minute") : i >= e ? c(o, i, e, "second") : o + " ms";
  }
  function c(o, i, a, p) {
    var g = i >= a * 1.5;
    return Math.round(o / a) + " " + p + (g ? "s" : "");
  }
  return oi;
}
var ai, Vo;
function Ic() {
  if (Vo) return ai;
  Vo = 1;
  function e(t) {
    s.debug = s, s.default = s, s.coerce = c, s.disable = h, s.enable = u, s.enabled = r, s.humanize = Gf(), s.destroy = o, Object.keys(t).forEach((i) => {
      s[i] = t[i];
    }), s.names = [], s.skips = [], s.formatters = {};
    function l(i) {
      let a = 0;
      for (let p = 0; p < i.length; p++)
        a = (a << 5) - a + i.charCodeAt(p), a |= 0;
      return s.colors[Math.abs(a) % s.colors.length];
    }
    s.selectColor = l;
    function s(i) {
      let a, p = null, g, v;
      function m(...w) {
        if (!m.enabled)
          return;
        const R = m, C = Number(/* @__PURE__ */ new Date()), D = C - (a || C);
        R.diff = D, R.prev = a, R.curr = C, a = C, w[0] = s.coerce(w[0]), typeof w[0] != "string" && w.unshift("%O");
        let P = 0;
        w[0] = w[0].replace(/%([a-zA-Z%])/g, (O, L) => {
          if (O === "%%")
            return "%";
          P++;
          const S = s.formatters[L];
          if (typeof S == "function") {
            const z = w[P];
            O = S.call(R, z), w.splice(P, 1), P--;
          }
          return O;
        }), s.formatArgs.call(R, w), (R.log || s.log).apply(R, w);
      }
      return m.namespace = i, m.useColors = s.useColors(), m.color = s.selectColor(i), m.extend = d, m.destroy = s.destroy, Object.defineProperty(m, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => p !== null ? p : (g !== s.namespaces && (g = s.namespaces, v = s.enabled(i)), v),
        set: (w) => {
          p = w;
        }
      }), typeof s.init == "function" && s.init(m), m;
    }
    function d(i, a) {
      const p = s(this.namespace + (typeof a > "u" ? ":" : a) + i);
      return p.log = this.log, p;
    }
    function u(i) {
      s.save(i), s.namespaces = i, s.names = [], s.skips = [];
      const a = (typeof i == "string" ? i : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const p of a)
        p[0] === "-" ? s.skips.push(p.slice(1)) : s.names.push(p);
    }
    function n(i, a) {
      let p = 0, g = 0, v = -1, m = 0;
      for (; p < i.length; )
        if (g < a.length && (a[g] === i[p] || a[g] === "*"))
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
      const i = [
        ...s.names,
        ...s.skips.map((a) => "-" + a)
      ].join(",");
      return s.enable(""), i;
    }
    function r(i) {
      for (const a of s.skips)
        if (n(i, a))
          return !1;
      for (const a of s.names)
        if (n(i, a))
          return !0;
      return !1;
    }
    function c(i) {
      return i instanceof Error ? i.stack || i.message : i;
    }
    function o() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return s.enable(s.load()), s;
  }
  return ai = e, ai;
}
var zo;
function Wf() {
  return zo || (zo = 1, (function(e, t) {
    t.formatArgs = s, t.save = d, t.load = u, t.useColors = l, t.storage = n(), t.destroy = /* @__PURE__ */ (() => {
      let r = !1;
      return () => {
        r || (r = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), t.colors = [
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
    function l() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
        return !1;
      let r;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (r = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(r[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function s(r) {
      if (r[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + r[0] + (this.useColors ? "%c " : " ") + "+" + e.exports.humanize(this.diff), !this.useColors)
        return;
      const c = "color: " + this.color;
      r.splice(1, 0, c, "color: inherit");
      let o = 0, i = 0;
      r[0].replace(/%[a-zA-Z%]/g, (a) => {
        a !== "%%" && (o++, a === "%c" && (i = o));
      }), r.splice(i, 0, c);
    }
    t.log = console.debug || console.log || (() => {
    });
    function d(r) {
      try {
        r ? t.storage.setItem("debug", r) : t.storage.removeItem("debug");
      } catch {
      }
    }
    function u() {
      let r;
      try {
        r = t.storage.getItem("debug") || t.storage.getItem("DEBUG");
      } catch {
      }
      return !r && typeof process < "u" && "env" in process && (r = process.env.DEBUG), r;
    }
    function n() {
      try {
        return localStorage;
      } catch {
      }
    }
    e.exports = Ic()(t);
    const { formatters: h } = e.exports;
    h.j = function(r) {
      try {
        return JSON.stringify(r);
      } catch (c) {
        return "[UnexpectedJSONParseError]: " + c.message;
      }
    };
  })(Zr, Zr.exports)), Zr.exports;
}
var en = { exports: {} }, li, Yo;
function Vf() {
  return Yo || (Yo = 1, li = (e, t = process.argv) => {
    const l = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", s = t.indexOf(l + e), d = t.indexOf("--");
    return s !== -1 && (d === -1 || s < d);
  }), li;
}
var ci, Xo;
function zf() {
  if (Xo) return ci;
  Xo = 1;
  const e = dn, t = bc, l = Vf(), { env: s } = process;
  let d;
  l("no-color") || l("no-colors") || l("color=false") || l("color=never") ? d = 0 : (l("color") || l("colors") || l("color=true") || l("color=always")) && (d = 1), "FORCE_COLOR" in s && (s.FORCE_COLOR === "true" ? d = 1 : s.FORCE_COLOR === "false" ? d = 0 : d = s.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(s.FORCE_COLOR, 10), 3));
  function u(r) {
    return r === 0 ? !1 : {
      level: r,
      hasBasic: !0,
      has256: r >= 2,
      has16m: r >= 3
    };
  }
  function n(r, c) {
    if (d === 0)
      return 0;
    if (l("color=16m") || l("color=full") || l("color=truecolor"))
      return 3;
    if (l("color=256"))
      return 2;
    if (r && !c && d === void 0)
      return 0;
    const o = d || 0;
    if (s.TERM === "dumb")
      return o;
    if (process.platform === "win32") {
      const i = e.release().split(".");
      return Number(i[0]) >= 10 && Number(i[2]) >= 10586 ? Number(i[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in s)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((i) => i in s) || s.CI_NAME === "codeship" ? 1 : o;
    if ("TEAMCITY_VERSION" in s)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(s.TEAMCITY_VERSION) ? 1 : 0;
    if (s.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in s) {
      const i = parseInt((s.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (s.TERM_PROGRAM) {
        case "iTerm.app":
          return i >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(s.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(s.TERM) || "COLORTERM" in s ? 1 : o;
  }
  function h(r) {
    const c = n(r, r && r.isTTY);
    return u(c);
  }
  return ci = {
    supportsColor: h,
    stdout: u(n(!0, t.isatty(1))),
    stderr: u(n(!0, t.isatty(2)))
  }, ci;
}
var Jo;
function Yf() {
  return Jo || (Jo = 1, (function(e, t) {
    const l = bc, s = Ds;
    t.init = o, t.log = h, t.formatArgs = u, t.save = r, t.load = c, t.useColors = d, t.destroy = s.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), t.colors = [6, 2, 3, 4, 5, 1];
    try {
      const a = zf();
      a && (a.stderr || a).level >= 2 && (t.colors = [
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
    t.inspectOpts = Object.keys(process.env).filter((a) => /^debug_/i.test(a)).reduce((a, p) => {
      const g = p.substring(6).toLowerCase().replace(/_([a-z])/g, (m, w) => w.toUpperCase());
      let v = process.env[p];
      return /^(yes|on|true|enabled)$/i.test(v) ? v = !0 : /^(no|off|false|disabled)$/i.test(v) ? v = !1 : v === "null" ? v = null : v = Number(v), a[g] = v, a;
    }, {});
    function d() {
      return "colors" in t.inspectOpts ? !!t.inspectOpts.colors : l.isatty(process.stderr.fd);
    }
    function u(a) {
      const { namespace: p, useColors: g } = this;
      if (g) {
        const v = this.color, m = "\x1B[3" + (v < 8 ? v : "8;5;" + v), w = `  ${m};1m${p} \x1B[0m`;
        a[0] = w + a[0].split(`
`).join(`
` + w), a.push(m + "m+" + e.exports.humanize(this.diff) + "\x1B[0m");
      } else
        a[0] = n() + p + " " + a[0];
    }
    function n() {
      return t.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function h(...a) {
      return process.stderr.write(s.formatWithOptions(t.inspectOpts, ...a) + `
`);
    }
    function r(a) {
      a ? process.env.DEBUG = a : delete process.env.DEBUG;
    }
    function c() {
      return process.env.DEBUG;
    }
    function o(a) {
      a.inspectOpts = {};
      const p = Object.keys(t.inspectOpts);
      for (let g = 0; g < p.length; g++)
        a.inspectOpts[p[g]] = t.inspectOpts[p[g]];
    }
    e.exports = Ic()(t);
    const { formatters: i } = e.exports;
    i.o = function(a) {
      return this.inspectOpts.colors = this.useColors, s.inspect(a, this.inspectOpts).split(`
`).map((p) => p.trim()).join(" ");
    }, i.O = function(a) {
      return this.inspectOpts.colors = this.useColors, s.inspect(a, this.inspectOpts);
    };
  })(en, en.exports)), en.exports;
}
var Ko;
function Xf() {
  return Ko || (Ko = 1, typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? Qr.exports = Wf() : Qr.exports = Yf()), Qr.exports;
}
var lr = {}, Qo;
function Dc() {
  if (Qo) return lr;
  Qo = 1, Object.defineProperty(lr, "__esModule", { value: !0 }), lr.ProgressCallbackTransform = void 0;
  const e = Ur;
  let t = class extends e.Transform {
    constructor(s, d, u) {
      super(), this.total = s, this.cancellationToken = d, this.onProgress = u, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.nextUpdate = this.start + 1e3;
    }
    _transform(s, d, u) {
      if (this.cancellationToken.cancelled) {
        u(new Error("cancelled"), null);
        return;
      }
      this.transferred += s.length, this.delta += s.length;
      const n = Date.now();
      n >= this.nextUpdate && this.transferred !== this.total && (this.nextUpdate = n + 1e3, this.onProgress({
        total: this.total,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.total * 100,
        bytesPerSecond: Math.round(this.transferred / ((n - this.start) / 1e3))
      }), this.delta = 0), u(null, s);
    }
    _flush(s) {
      if (this.cancellationToken.cancelled) {
        s(new Error("cancelled"));
        return;
      }
      this.onProgress({
        total: this.total,
        delta: this.delta,
        transferred: this.total,
        percent: 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      }), this.delta = 0, s(null);
    }
  };
  return lr.ProgressCallbackTransform = t, lr;
}
var Zo;
function Jf() {
  if (Zo) return ke;
  Zo = 1, Object.defineProperty(ke, "__esModule", { value: !0 }), ke.DigestTransform = ke.HttpExecutor = ke.HttpError = void 0, ke.addSensitiveRedirectHeader = p, ke.addSensitiveFieldPattern = g, ke.createHttpError = v, ke.parseJson = R, ke.configureRequestOptionsFromUrl = P, ke.configureRequestUrl = F, ke.safeGetHeader = S, ke.configureRequestOptions = G, ke.isSensitiveFieldName = $, ke.hashSensitiveValue = H, ke.safeStringifyJson = x;
  const e = kr, t = Xf(), l = At, s = Ur, d = St, u = xs(), n = mn(), h = Dc(), r = (0, t.default)("electron-builder"), c = (b) => b.toLowerCase().replace(/[-_]/g, ""), o = /* @__PURE__ */ new Set(["authorization", "proxyauthorization", "privatetoken", "xapikey", "xauthtoken", "xaccesstoken", "xgitlabtoken", "cookie", "xcsrftoken"]), i = ["token", "password", "secret", "authorization", "credential", "apikey", "passphrase", "auth"], a = ["key"];
  function p(b) {
    o.add(c(b));
  }
  function g(b) {
    i.push(b.toLowerCase().replace(/[-_]/g, ""));
  }
  function v(b, I = null) {
    return new w(b.statusCode || -1, `${b.statusCode} ${b.statusMessage}` + (I == null ? "" : `
` + JSON.stringify(I, null, "  ")) + `
Headers: ` + x(b.headers), I);
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
    constructor(I, A = `HTTP error: ${m.get(I) || I}`, k = null) {
      super(A), this.statusCode = I, this.description = k, this.name = "HttpError", this.code = `HTTP_ERROR_${I}`;
    }
    isServerError() {
      return this.statusCode >= 500 && this.statusCode <= 599;
    }
  }
  ke.HttpError = w;
  function R(b) {
    return b.then((I) => I == null || I.length === 0 ? null : JSON.parse(I));
  }
  class C {
    constructor() {
      this.maxRedirects = 10;
    }
    request(I, A = new u.CancellationToken(), k) {
      G(I);
      const M = k == null ? void 0 : JSON.stringify(k), W = M ? Buffer.from(M) : void 0;
      if (W != null) {
        r.enabled && r(x(k));
        const { headers: ie, ...te } = I;
        I = {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": W.length,
            ...ie
          },
          ...te
        };
      }
      return this.doApiRequest(I, A, (ie) => ie.end(W));
    }
    doApiRequest(I, A, k, M = 0) {
      if (r.enabled) {
        const { headers: W, auth: ie, ...te } = I;
        r(`Request: ${x(te)}`);
      }
      return A.createPromise((W, ie, te) => {
        const de = this.createRequest(I, (he) => {
          try {
            this.handleResponse(he, I, A, W, ie, M, k);
          } catch (Y) {
            ie(Y);
          }
        });
        this.addErrorAndTimeoutHandlers(de, ie, I.timeout), this.addRedirectHandlers(de, I, ie, M, (he) => {
          this.doApiRequest(he, A, k, M).then(W).catch(ie);
        }), k(de, ie), te(() => de.abort());
      });
    }
    // noinspection JSUnusedLocalSymbols
    // eslint-disable-next-line
    addRedirectHandlers(I, A, k, M, W) {
    }
    addErrorAndTimeoutHandlers(I, A, k = 60 * 1e3) {
      this.addTimeOutHandler(I, A, k), I.on("error", A), I.on("aborted", () => {
        A(new Error("Request has been aborted by the server"));
      });
    }
    handleResponse(I, A, k, M, W, ie, te) {
      var de;
      if (r.enabled) {
        const { headers: y, auth: B, ...N } = A;
        r(`Response: ${I.statusCode} ${I.statusMessage}, request options: ${x(N)}`);
      }
      if (I.statusCode === 404) {
        W(v(I, `method: ${A.method || "GET"} url: ${A.protocol || "https:"}//${A.hostname}${A.port ? `:${A.port}` : ""}${A.path}

Please double check that your authentication token is correct. Due to security reasons, actual status maybe not reported, but 404.
`));
        return;
      } else if (I.statusCode === 204) {
        M();
        return;
      }
      const he = (de = I.statusCode) !== null && de !== void 0 ? de : 0, Y = he >= 300 && he < 400, pe = S(I, "location");
      if (Y && pe != null) {
        if (ie > this.maxRedirects) {
          W(this.createMaxRedirectError());
          return;
        }
        this.doApiRequest(C.prepareRedirectUrlOptions(pe, A), k, te, ie).then(M).catch(W);
        return;
      }
      I.setEncoding("utf8");
      let E = "";
      I.on("error", W), I.on("data", (y) => E += y), I.on("end", () => {
        try {
          if (I.statusCode != null && I.statusCode >= 400) {
            const y = S(I, "content-type"), B = y != null && (Array.isArray(y) ? y.find((N) => N.includes("json")) != null : y.includes("json"));
            W(v(I, `method: ${A.method || "GET"} url: ${A.protocol || "https:"}//${A.hostname}${A.port ? `:${A.port}` : ""}${A.path}

          Data:
          ${B ? x(JSON.parse(E)) : E}
          `));
          } else
            M(E.length === 0 ? null : E);
        } catch (y) {
          W(y);
        }
      });
    }
    async downloadToBuffer(I, A) {
      return await A.cancellationToken.createPromise((k, M, W) => {
        const ie = [], te = {
          headers: A.headers || void 0,
          // because PrivateGitHubProvider requires HttpExecutor.prepareRedirectUrlOptions logic, so, we need to redirect manually
          redirect: "manual"
        };
        F(I, te), G(te), this.doDownload(te, {
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
    doDownload(I, A, k) {
      const M = this.createRequest(I, (W) => {
        if (W.statusCode >= 400) {
          A.callback(new Error(`Cannot download "${I.protocol || "https:"}//${I.hostname}${I.path}", status ${W.statusCode}: ${W.statusMessage}`));
          return;
        }
        W.on("error", A.callback);
        const ie = S(W, "location");
        if (ie != null) {
          k < this.maxRedirects ? this.doDownload(C.prepareRedirectUrlOptions(ie, I), A, k++) : A.callback(this.createMaxRedirectError());
          return;
        }
        A.responseHandler == null ? z(A, W) : A.responseHandler(W, A.callback);
      });
      this.addErrorAndTimeoutHandlers(M, A.callback, I.timeout), this.addRedirectHandlers(M, I, A.callback, k, (W) => {
        this.doDownload(W, A, k++);
      }), M.end();
    }
    createMaxRedirectError() {
      return new Error(`Too many redirects (> ${this.maxRedirects})`);
    }
    addTimeOutHandler(I, A, k) {
      I.on("socket", (M) => {
        M.setTimeout(k, () => {
          I.abort(), A(new Error("Request timed out"));
        });
      });
    }
    static prepareRedirectUrlOptions(I, A) {
      const k = P(I, { ...A }), M = k.headers;
      if (M == null)
        return k;
      const W = C.reconstructOriginalUrl(A), ie = D(I, A);
      if (C.isCrossOriginRedirect(W, ie)) {
        r.enabled && r(`Cross-origin redirect (${W.host} → ${ie.host}): stripping sensitive headers`);
        for (const te of Object.keys(M))
          o.has(c(te)) && delete M[te];
      }
      return k;
    }
    static reconstructOriginalUrl(I) {
      const A = I.protocol || "https:";
      if (!I.hostname)
        throw new Error("Missing hostname in request options");
      const k = I.hostname, M = I.port ? `:${I.port}` : "", W = I.path || "/";
      return new d.URL(`${A}//${k}${M}${W}`);
    }
    static isCrossOriginRedirect(I, A) {
      if (I.hostname.toLowerCase() !== A.hostname.toLowerCase())
        return !0;
      if (I.protocol === "http:" && // This can be replaced with `!originalUrl.port`, but for the sake of clarity.
      ["80", ""].includes(I.port) && A.protocol === "https:" && // This can be replaced with `!redirectUrl.port`, but for the sake of clarity.
      ["443", ""].includes(A.port))
        return !1;
      if (I.protocol !== A.protocol)
        return !0;
      const k = I.port, M = A.port;
      return k !== M;
    }
    static async retryOnServerError(I, A = 3) {
      for (let k = 0; ; k++)
        try {
          return await I();
        } catch (M) {
          if (k < A && (M instanceof w && M.isServerError() || M.code === "EPIPE")) {
            await new Promise((W) => setTimeout(W, 1e3 * (k + 1)));
            continue;
          }
          throw M;
        }
    }
  }
  ke.HttpExecutor = C;
  function D(b, I) {
    try {
      return new d.URL(b);
    } catch {
      const A = I.hostname, k = I.protocol || "https:", M = I.port ? `:${I.port}` : "", W = `${k}//${A}${M}`;
      return new d.URL(b, W);
    }
  }
  function P(b, I) {
    const A = G(I), k = D(b, I);
    return F(k, A), A;
  }
  function F(b, I) {
    I.protocol = b.protocol, I.hostname = b.hostname, b.port ? I.port = b.port : I.port && delete I.port, I.path = b.pathname + b.search;
  }
  class O extends s.Transform {
    // noinspection JSUnusedGlobalSymbols
    get actual() {
      return this._actual;
    }
    constructor(I, A = "sha512", k = "base64") {
      super(), this.expected = I, this.algorithm = A, this.encoding = k, this._actual = null, this.isValidateOnEnd = !0, this.digester = (0, e.createHash)(A);
    }
    // noinspection JSUnusedGlobalSymbols
    _transform(I, A, k) {
      this.digester.update(I), k(null, I);
    }
    // noinspection JSUnusedGlobalSymbols
    _flush(I) {
      if (this._actual = this.digester.digest(this.encoding), this.isValidateOnEnd)
        try {
          this.validate();
        } catch (A) {
          I(A);
          return;
        }
      I(null);
    }
    validate() {
      if (this._actual == null)
        throw (0, n.newError)("Not finished yet", "ERR_STREAM_NOT_FINISHED");
      if (this._actual !== this.expected)
        throw (0, n.newError)(`${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`, "ERR_CHECKSUM_MISMATCH");
      return null;
    }
  }
  ke.DigestTransform = O;
  function L(b, I, A) {
    return b != null && I != null && b !== I ? (A(new Error(`checksum mismatch: expected ${I} but got ${b} (X-Checksum-Sha2 header)`)), !1) : !0;
  }
  function S(b, I) {
    const A = b.headers[I];
    return A == null ? null : Array.isArray(A) ? A.length === 0 ? null : A[A.length - 1] : A;
  }
  function z(b, I) {
    if (!L(S(I, "X-Checksum-Sha2"), b.options.sha2, b.callback))
      return;
    const A = [];
    if (b.options.onProgress != null) {
      const ie = S(I, "content-length");
      ie != null && A.push(new h.ProgressCallbackTransform(parseInt(ie, 10), b.options.cancellationToken, b.options.onProgress));
    }
    const k = b.options.sha512;
    k != null ? A.push(new O(k, "sha512", k.length === 128 && !k.includes("+") && !k.includes("Z") && !k.includes("=") ? "hex" : "base64")) : b.options.sha2 != null && A.push(new O(b.options.sha2, "sha256", "hex"));
    const M = (0, l.createWriteStream)(b.destination);
    A.push(M);
    let W = I;
    for (const ie of A)
      ie.on("error", (te) => {
        M.close(), b.options.cancellationToken.cancelled || b.callback(te);
      }), W = W.pipe(ie);
    M.on("finish", () => {
      M.close(b.callback);
    });
  }
  function G(b, I, A) {
    A != null && (b.method = A), b.headers = { ...b.headers };
    const k = b.headers;
    return I != null && (k.authorization = I.startsWith("Basic") || I.startsWith("Bearer") ? I : `token ${I}`), k["User-Agent"] == null && (k["User-Agent"] = "electron-builder"), (A == null || A === "GET" || k["Cache-Control"] == null) && (k["Cache-Control"] = "no-cache"), b.protocol == null && process.versions.electron != null && (b.protocol = "https:"), b;
  }
  function $(b) {
    const I = c(b);
    return i.some((A) => I.includes(A)) || a.some((A) => I.endsWith(A));
  }
  function H(b) {
    return `${(0, e.createHash)("sha256").update(b).digest("hex")} (sha256 hash)`;
  }
  function x(b, I) {
    return JSON.stringify(b, (A, k) => $(A) || I != null && I.has(A) ? typeof k == "string" ? H(k) : "<stripped sensitive data>" : k, 2);
  }
  return ke;
}
var cr = {}, ea;
function Kf() {
  if (ea) return cr;
  ea = 1, Object.defineProperty(cr, "__esModule", { value: !0 }), cr.MemoLazy = void 0;
  let e = class {
    constructor(s, d) {
      this.selector = s, this.creator = d, this.selected = void 0, this._value = void 0;
    }
    get hasValue() {
      return this._value !== void 0;
    }
    get value() {
      const s = this.selector();
      if (this._value !== void 0 && t(this.selected, s))
        return this._value;
      this.selected = s;
      const d = this.creator(s);
      return this.value = d, d;
    }
    set value(s) {
      this._value = s;
    }
  };
  cr.MemoLazy = e;
  function t(l, s) {
    if (typeof l == "object" && l !== null && (typeof s == "object" && s !== null)) {
      const n = Object.keys(l), h = Object.keys(s);
      return n.length === h.length && n.every((r) => t(l[r], s[r]));
    }
    return l === s;
  }
  return cr;
}
var Wt = {}, ta;
function Qf() {
  if (ta) return Wt;
  ta = 1, Object.defineProperty(Wt, "__esModule", { value: !0 }), Wt.githubUrl = e, Wt.githubTagPrefix = t, Wt.getS3LikeProviderBaseUrl = l;
  function e(n, h = "github.com") {
    return `${n.protocol || "https"}://${n.host || h}`;
  }
  function t(n) {
    var h;
    return n.tagNamePrefix ? n.tagNamePrefix : !((h = n.vPrefixedTagName) !== null && h !== void 0) || h ? "v" : "";
  }
  function l(n) {
    const h = n.provider;
    if (h === "s3")
      return s(n);
    if (h === "spaces")
      return u(n);
    throw new Error(`Not supported provider: ${h}`);
  }
  function s(n) {
    let h;
    if (n.accelerate == !0)
      h = `https://${n.bucket}.s3-accelerate.amazonaws.com`;
    else if (n.endpoint != null)
      h = `${n.endpoint}/${n.bucket}`;
    else if (n.bucket.includes(".")) {
      if (n.region == null)
        throw new Error(`Bucket name "${n.bucket}" includes a dot, but S3 region is missing`);
      n.region === "us-east-1" ? h = `https://s3.amazonaws.com/${n.bucket}` : h = `https://s3-${n.region}.amazonaws.com/${n.bucket}`;
    } else n.region === "cn-north-1" ? h = `https://${n.bucket}.s3.${n.region}.amazonaws.com.cn` : h = `https://${n.bucket}.s3.amazonaws.com`;
    return d(h, n.path);
  }
  function d(n, h) {
    return h != null && h.length > 0 && (h.startsWith("/") || (n += "/"), n += h), n;
  }
  function u(n) {
    if (n.name == null)
      throw new Error("name is missing");
    if (n.region == null)
      throw new Error("region is missing");
    return d(`https://${n.name}.${n.region}.digitaloceanspaces.com`, n.path);
  }
  return Wt;
}
var tn = {}, ra;
function Zf() {
  if (ra) return tn;
  ra = 1, Object.defineProperty(tn, "__esModule", { value: !0 }), tn.retry = t;
  const e = xs();
  async function t(l, s) {
    var d;
    const { retries: u, interval: n, backoff: h = 0, attempt: r = 0, shouldRetry: c, cancellationToken: o = new e.CancellationToken() } = s;
    try {
      return await l();
    } catch (i) {
      if (await Promise.resolve((d = c?.(i)) !== null && d !== void 0 ? d : !0) && u > 0 && !o.cancelled)
        return await new Promise((a) => setTimeout(a, n + h * r)), await t(l, { ...s, retries: u - 1, attempt: r + 1 });
      throw i;
    }
  }
  return tn;
}
var rn = {}, na;
function ed() {
  if (na) return rn;
  na = 1, Object.defineProperty(rn, "__esModule", { value: !0 }), rn.parseDn = e;
  function e(t) {
    let l = !1, s = null, d = "", u = 0;
    t = t.trim();
    const n = /* @__PURE__ */ new Map();
    for (let h = 0; h <= t.length; h++) {
      if (h === t.length) {
        s !== null && n.set(s, d);
        break;
      }
      const r = t[h];
      if (l) {
        if (r === '"') {
          l = !1;
          continue;
        }
      } else {
        if (r === '"') {
          l = !0;
          continue;
        }
        if (r === "\\") {
          h++;
          const c = parseInt(t.slice(h, h + 2), 16);
          Number.isNaN(c) ? d += t[h] : (h++, d += String.fromCharCode(c));
          continue;
        }
        if (s === null && r === "=") {
          s = d, d = "";
          continue;
        }
        if (r === "," || r === ";" || r === "+") {
          s !== null && n.set(s, d), s = null, d = "";
          continue;
        }
      }
      if (r === " " && !l) {
        if (d.length === 0)
          continue;
        if (h > u) {
          let c = h;
          for (; t[c] === " "; )
            c++;
          u = c;
        }
        if (u >= t.length || t[u] === "," || t[u] === ";" || s === null && t[u] === "=" || s !== null && t[u] === "+") {
          h = u - 1;
          continue;
        }
      }
      d += r;
    }
    return n;
  }
  return rn;
}
var Ft = {}, ia;
function td() {
  if (ia) return Ft;
  ia = 1, Object.defineProperty(Ft, "__esModule", { value: !0 }), Ft.nil = Ft.UUID = void 0;
  const e = kr, t = mn(), l = "options.name must be either a string or a Buffer", s = (0, e.randomBytes)(16);
  s[0] = s[0] | 1;
  const d = {}, u = [];
  for (let i = 0; i < 256; i++) {
    const a = (i + 256).toString(16).substr(1);
    d[a] = i, u[i] = a;
  }
  class n {
    constructor(a) {
      this.ascii = null, this.binary = null;
      const p = n.check(a);
      if (!p)
        throw new Error("not a UUID");
      this.version = p.version, p.format === "ascii" ? this.ascii = a : this.binary = a;
    }
    static v5(a, p) {
      return c(a, "sha1", 80, p);
    }
    toString() {
      return this.ascii == null && (this.ascii = o(this.binary)), this.ascii;
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
      throw (0, t.newError)("Unknown type of uuid", "ERR_UNKNOWN_UUID_TYPE");
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
  Ft.UUID = n, n.OID = n.parse("6ba7b812-9dad-11d1-80b4-00c04fd430c8");
  function h(i) {
    switch (i) {
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
  var r;
  (function(i) {
    i[i.ASCII = 0] = "ASCII", i[i.BINARY = 1] = "BINARY", i[i.OBJECT = 2] = "OBJECT";
  })(r || (r = {}));
  function c(i, a, p, g, v = r.ASCII) {
    const m = (0, e.createHash)(a);
    if (typeof i != "string" && !Buffer.isBuffer(i))
      throw (0, t.newError)(l, "ERR_INVALID_UUID_NAME");
    m.update(g), m.update(i);
    const R = m.digest();
    let C;
    switch (v) {
      case r.BINARY:
        R[6] = R[6] & 15 | p, R[8] = R[8] & 63 | 128, C = R;
        break;
      case r.OBJECT:
        R[6] = R[6] & 15 | p, R[8] = R[8] & 63 | 128, C = new n(R);
        break;
      default:
        C = u[R[0]] + u[R[1]] + u[R[2]] + u[R[3]] + "-" + u[R[4]] + u[R[5]] + "-" + u[R[6] & 15 | p] + u[R[7]] + "-" + u[R[8] & 63 | 128] + u[R[9]] + "-" + u[R[10]] + u[R[11]] + u[R[12]] + u[R[13]] + u[R[14]] + u[R[15]];
        break;
    }
    return C;
  }
  function o(i) {
    return u[i[0]] + u[i[1]] + u[i[2]] + u[i[3]] + "-" + u[i[4]] + u[i[5]] + "-" + u[i[6]] + u[i[7]] + "-" + u[i[8]] + u[i[9]] + "-" + u[i[10]] + u[i[11]] + u[i[12]] + u[i[13]] + u[i[14]] + u[i[15]];
  }
  return Ft.nil = new n("00000000-0000-0000-0000-000000000000"), Ft;
}
var Vt = {}, ui = {}, sa;
function rd() {
  return sa || (sa = 1, (function(e) {
    (function(t) {
      t.parser = function(E, y) {
        return new s(E, y);
      }, t.SAXParser = s, t.SAXStream = o, t.createStream = c, t.MAX_BUFFER_LENGTH = 64 * 1024;
      var l = [
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
      t.EVENTS = [
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
      function s(E, y) {
        if (!(this instanceof s))
          return new s(E, y);
        var B = this;
        u(B), B.q = B.c = "", B.bufferCheckPosition = t.MAX_BUFFER_LENGTH, B.opt = y || {}, B.opt.lowercase = B.opt.lowercase || B.opt.lowercasetags, B.looseCase = B.opt.lowercase ? "toLowerCase" : "toUpperCase", B.tags = [], B.closed = B.closedRoot = B.sawRoot = !1, B.tag = B.error = null, B.strict = !!E, B.noscript = !!(E || B.opt.noscript), B.state = S.BEGIN, B.strictEntities = B.opt.strictEntities, B.ENTITIES = B.strictEntities ? Object.create(t.XML_ENTITIES) : Object.create(t.ENTITIES), B.attribList = [], B.opt.xmlns && (B.ns = Object.create(v)), B.opt.unquotedAttributeValues === void 0 && (B.opt.unquotedAttributeValues = !E), B.trackPosition = B.opt.position !== !1, B.trackPosition && (B.position = B.line = B.column = 0), G(B, "onready");
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
        for (var y = Math.max(t.MAX_BUFFER_LENGTH, 10), B = 0, N = 0, fe = l.length; N < fe; N++) {
          var ye = E[l[N]].length;
          if (ye > y)
            switch (l[N]) {
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
                b(E, "Max buffer length exceeded: " + l[N]);
            }
          B = Math.max(B, ye);
        }
        var ve = t.MAX_BUFFER_LENGTH - B;
        E.bufferCheckPosition = ve + E.position;
      }
      function u(E) {
        for (var y = 0, B = l.length; y < B; y++)
          E[l[y]] = "";
      }
      function n(E) {
        H(E), E.cdata !== "" && ($(E, "oncdata", E.cdata), E.cdata = ""), E.script !== "" && ($(E, "onscript", E.script), E.script = "");
      }
      s.prototype = {
        end: function() {
          I(this);
        },
        write: pe,
        resume: function() {
          return this.error = null, this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          n(this);
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
      var r = t.EVENTS.filter(function(E) {
        return E !== "error" && E !== "end";
      });
      function c(E, y) {
        return new o(E, y);
      }
      function o(E, y) {
        if (!(this instanceof o))
          return new o(E, y);
        h.apply(this), this._parser = new s(E, y), this.writable = !0, this.readable = !0;
        var B = this;
        this._parser.onend = function() {
          B.emit("end");
        }, this._parser.onerror = function(N) {
          B.emit("error", N), B._parser.error = null;
        }, this._decoder = null, r.forEach(function(N) {
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
      o.prototype = Object.create(h.prototype, {
        constructor: {
          value: o
        }
      }), o.prototype.write = function(E) {
        return typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(E) && (this._decoder || (this._decoder = new TextDecoder("utf8")), E = this._decoder.decode(E, { stream: !0 })), this._parser.write(E.toString()), this.emit("data", E), !0;
      }, o.prototype.end = function(E) {
        if (E && E.length && this.write(E), this._decoder) {
          var y = this._decoder.decode();
          y && (this._parser.write(y), this.emit("data", y));
        }
        return this._parser.end(), !0;
      }, o.prototype.on = function(E, y) {
        var B = this;
        return !B._parser["on" + E] && r.indexOf(E) !== -1 && (B._parser["on" + E] = function() {
          var N = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          N.splice(0, 0, E), B.emit.apply(B, N);
        }), h.prototype.on.call(B, E, y);
      };
      var i = "[CDATA[", a = "DOCTYPE", p = "http://www.w3.org/XML/1998/namespace", g = "http://www.w3.org/2000/xmlns/", v = { xml: p, xmlns: g }, m = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, w = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, R = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, C = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
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
      function O(E, y) {
        return E.test(y);
      }
      function L(E, y) {
        return !O(E, y);
      }
      var S = 0;
      t.STATE = {
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
      }, t.XML_ENTITIES = {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: '"',
        apos: "'"
      }, t.ENTITIES = {
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
      }, Object.keys(t.ENTITIES).forEach(function(E) {
        var y = t.ENTITIES[E], B = typeof y == "number" ? String.fromCharCode(y) : y;
        t.ENTITIES[E] = B;
      });
      for (var z in t.STATE)
        t.STATE[t.STATE[z]] = z;
      S = t.STATE;
      function G(E, y, B) {
        E[y] && E[y](B);
      }
      function $(E, y, B) {
        E.textNode && H(E), G(E, y, B);
      }
      function H(E) {
        E.textNode = x(E.opt, E.textNode), E.textNode && G(E, "ontext", E.textNode), E.textNode = "";
      }
      function x(E, y) {
        return E.trim && (y = y.trim()), E.normalize && (y = y.replace(/\s+/g, " ")), y;
      }
      function b(E, y) {
        return H(E), E.trackPosition && (y += `
Line: ` + E.line + `
Column: ` + E.column + `
Char: ` + E.c), y = new Error(y), E.error = y, G(E, "onerror", y), E;
      }
      function I(E) {
        return E.sawRoot && !E.closedRoot && A(E, "Unclosed root tag"), E.state !== S.BEGIN && E.state !== S.BEGIN_WHITESPACE && E.state !== S.TEXT && b(E, "Unexpected end"), H(E), E.c = "", E.closed = !0, G(E, "onend"), s.call(E, E.strict, E.opt), E;
      }
      function A(E, y) {
        if (typeof E != "object" || !(E instanceof s))
          throw new Error("bad call to strictFail");
        E.strict && b(E, y);
      }
      function k(E) {
        E.strict || (E.tagName = E.tagName[E.looseCase]());
        var y = E.tags[E.tags.length - 1] || E, B = E.tag = { name: E.tagName, attributes: {} };
        E.opt.xmlns && (B.ns = y.ns), E.attribList.length = 0, $(E, "onopentagstart", B);
      }
      function M(E, y) {
        var B = E.indexOf(":"), N = B < 0 ? ["", E] : E.split(":"), fe = N[0], ye = N[1];
        return y && E === "xmlns" && (fe = "xmlns", ye = ""), { prefix: fe, local: ye };
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
              var fe = E.tag, ye = E.tags[E.tags.length - 1] || E;
              fe.ns === ye.ns && (fe.ns = Object.create(ye.ns)), fe.ns[N] = E.attribValue;
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
          B.ns && fe.ns !== B.ns && Object.keys(B.ns).forEach(function(f) {
            $(E, "onopennamespace", {
              prefix: f,
              uri: B.ns[f]
            });
          });
          for (var ye = 0, ve = E.attribList.length; ye < ve; ye++) {
            var Se = E.attribList[ye], we = Se[0], ze = Se[1], Te = M(we, !0), Ge = Te.prefix, pt = Te.local, ct = Ge === "" ? "" : B.ns[Ge] || "", at = {
              name: we,
              value: ze,
              prefix: Ge,
              local: pt,
              uri: ct
            };
            Ge && Ge !== "xmlns" && !ct && (A(
              E,
              "Unbound namespace prefix: " + JSON.stringify(Ge)
            ), at.uri = Ge), E.tag.attributes[we] = at, $(E, "onattribute", at);
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
        for (var ye = E.tags.length; ye-- > y; ) {
          var ve = E.tag = E.tags.pop();
          E.tagName = E.tag.name, $(E, "onclosetag", E.tagName);
          var Se = {};
          for (var we in ve.ns)
            Se[we] = ve.ns[we];
          var ze = E.tags[E.tags.length - 1] || E;
          E.opt.xmlns && ve.ns !== ze.ns && Object.keys(ve.ns).forEach(function(Te) {
            var Ge = ve.ns[Te];
            $(E, "onclosenamespace", { prefix: Te, uri: Ge });
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
          return b(
            y,
            "Cannot write after close. Assign an onready handler."
          );
        if (E === null)
          return I(y);
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
                for (var ye = B - 1; N && N !== "<" && N !== "&"; )
                  N = Y(E, B++), N && y.trackPosition && (y.position++, N === `
` ? (y.line++, y.column = 0) : y.column++);
                y.textNode += E.substring(ye, B - 1);
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
              else if (!D(N)) if (O(m, N))
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
              y.doctype && y.doctype !== !0 && y.sgmlDecl ? (y.state = S.DOCTYPE_DTD, y.doctype += "<!" + y.sgmlDecl + N, y.sgmlDecl = "") : (y.sgmlDecl + N).toUpperCase() === i ? ($(y, "onopencdata"), y.state = S.CDATA, y.sgmlDecl = "", y.cdata = "") : (y.sgmlDecl + N).toUpperCase() === a ? (y.state = S.DOCTYPE, (y.doctype || y.sawRoot) && A(
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
              N === "-" ? (y.state = S.COMMENT_ENDED, y.comment = x(y.opt, y.comment), y.comment && $(y, "oncomment", y.comment), y.comment = "") : (y.comment += "-" + N, y.state = S.COMMENT);
              continue;
            case S.COMMENT_ENDED:
              N !== ">" ? (A(y, "Malformed comment"), y.comment += "--" + N, y.state = S.COMMENT) : y.doctype && y.doctype !== !0 ? y.state = S.DOCTYPE_DTD : y.state = S.TEXT;
              continue;
            case S.CDATA:
              for (var ye = B - 1; N && N !== "]"; )
                N = Y(E, B++), N && y.trackPosition && (y.position++, N === `
` ? (y.line++, y.column = 0) : y.column++);
              y.cdata += E.substring(ye, B - 1), N === "]" && (y.state = S.CDATA_ENDING);
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
              O(w, N) ? y.tagName += N : (k(y), N === ">" ? ie(y) : N === "/" ? y.state = S.OPEN_TAG_SLASH : (D(N) || A(y, "Invalid character in tag name"), y.state = S.ATTRIB));
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
              N === ">" ? ie(y) : N === "/" ? y.state = S.OPEN_TAG_SLASH : O(m, N) ? (y.attribName = N, y.attribValue = "", y.state = S.ATTRIB_NAME) : A(y, "Invalid attribute name");
              continue;
            case S.ATTRIB_NAME:
              N === "=" ? y.state = S.ATTRIB_VALUE : N === ">" ? (A(y, "Attribute without value"), y.attribValue = y.attribName, W(y), ie(y)) : D(N) ? y.state = S.ATTRIB_NAME_SAW_WHITE : O(w, N) ? y.attribName += N : A(y, "Invalid attribute name");
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
                }), y.attribName = "", N === ">" ? ie(y) : O(m, N) ? (y.attribName = N, y.state = S.ATTRIB_NAME) : (A(y, "Invalid attribute name"), y.state = S.ATTRIB);
              }
              continue;
            case S.ATTRIB_VALUE:
              if (D(N))
                continue;
              P(N) ? (y.q = N, y.state = S.ATTRIB_VALUE_QUOTED) : (y.opt.unquotedAttributeValues || b(y, "Unquoted attribute value"), y.state = S.ATTRIB_VALUE_UNQUOTED, y.attribValue = N);
              continue;
            case S.ATTRIB_VALUE_QUOTED:
              if (N !== y.q) {
                N === "&" ? y.state = S.ATTRIB_VALUE_ENTITY_Q : y.attribValue += N;
                continue;
              }
              W(y), y.q = "", y.state = S.ATTRIB_VALUE_CLOSED;
              continue;
            case S.ATTRIB_VALUE_CLOSED:
              D(N) ? y.state = S.ATTRIB : N === ">" ? ie(y) : N === "/" ? y.state = S.OPEN_TAG_SLASH : O(m, N) ? (A(y, "No whitespace between attributes"), y.attribName = N, y.attribValue = "", y.state = S.ATTRIB_NAME) : A(y, "Invalid attribute name");
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
                N === ">" ? te(y) : O(w, N) ? y.tagName += N : y.script ? (y.script += "</" + y.tagName + N, y.tagName = "", y.state = S.SCRIPT) : (D(N) || A(y, "Invalid tagname in closing tag"), y.state = S.CLOSE_TAG_SAW_WHITE);
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
              var ve, Se;
              switch (y.state) {
                case S.TEXT_ENTITY:
                  ve = S.TEXT, Se = "textNode";
                  break;
                case S.ATTRIB_VALUE_ENTITY_Q:
                  ve = S.ATTRIB_VALUE_QUOTED, Se = "attribValue";
                  break;
                case S.ATTRIB_VALUE_ENTITY_U:
                  ve = S.ATTRIB_VALUE_UNQUOTED, Se = "attribValue";
                  break;
              }
              if (N === ";") {
                var we = de(y);
                y.opt.unparsedEntities && !Object.values(t.XML_ENTITIES).includes(we) ? (y.entity = "", y.state = ve, y.write(we)) : (y[Se] += we, y.entity = "", y.state = ve);
              } else O(y.entity.length ? C : R, N) ? y.entity += N : (A(y, "Invalid character in entity name"), y[Se] += "&" + y.entity + N, y.entity = "", y.state = ve);
              continue;
            default:
              throw new Error(y, "Unknown state: " + y.state);
          }
        return y.position >= y.bufferCheckPosition && d(y), y;
      }
      String.fromCodePoint || (function() {
        var E = String.fromCharCode, y = Math.floor, B = function() {
          var N = 16384, fe = [], ye, ve, Se = -1, we = arguments.length;
          if (!we)
            return "";
          for (var ze = ""; ++Se < we; ) {
            var Te = Number(arguments[Se]);
            if (!isFinite(Te) || // `NaN`, `+Infinity`, or `-Infinity`
            Te < 0 || // not a valid Unicode code point
            Te > 1114111 || // not a valid Unicode code point
            y(Te) !== Te)
              throw RangeError("Invalid code point: " + Te);
            Te <= 65535 ? fe.push(Te) : (Te -= 65536, ye = (Te >> 10) + 55296, ve = Te % 1024 + 56320, fe.push(ye, ve)), (Se + 1 === we || fe.length > N) && (ze += E.apply(null, fe), fe.length = 0);
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
  })(ui)), ui;
}
var oa;
function nd() {
  if (oa) return Vt;
  oa = 1, Object.defineProperty(Vt, "__esModule", { value: !0 }), Vt.XElement = void 0, Vt.parseXml = n;
  const e = rd(), t = mn();
  class l {
    constructor(r) {
      if (this.name = r, this.value = "", this.attributes = null, this.isCData = !1, this.elements = null, !r)
        throw (0, t.newError)("Element name cannot be empty", "ERR_XML_ELEMENT_NAME_EMPTY");
      if (!d(r))
        throw (0, t.newError)(`Invalid element name: ${r}`, "ERR_XML_ELEMENT_INVALID_NAME");
    }
    attribute(r) {
      const c = this.attributes === null ? null : this.attributes[r];
      if (c == null)
        throw (0, t.newError)(`No attribute "${r}"`, "ERR_XML_MISSED_ATTRIBUTE");
      return c;
    }
    removeAttribute(r) {
      this.attributes !== null && delete this.attributes[r];
    }
    element(r, c = !1, o = null) {
      const i = this.elementOrNull(r, c);
      if (i === null)
        throw (0, t.newError)(o || `No element "${r}"`, "ERR_XML_MISSED_ELEMENT");
      return i;
    }
    elementOrNull(r, c = !1) {
      if (this.elements === null)
        return null;
      for (const o of this.elements)
        if (u(o, r, c))
          return o;
      return null;
    }
    getElements(r, c = !1) {
      return this.elements === null ? [] : this.elements.filter((o) => u(o, r, c));
    }
    elementValueOrEmpty(r, c = !1) {
      const o = this.elementOrNull(r, c);
      return o === null ? "" : o.value;
    }
  }
  Vt.XElement = l;
  const s = new RegExp(/^[A-Za-z_][:A-Za-z0-9_-]*$/i);
  function d(h) {
    return s.test(h);
  }
  function u(h, r, c) {
    const o = h.name;
    return o === r || c === !0 && o.length === r.length && o.toLowerCase() === r.toLowerCase();
  }
  function n(h) {
    let r = null;
    const c = e.parser(!0, {}), o = [];
    return c.onopentag = (i) => {
      const a = new l(i.name);
      if (a.attributes = i.attributes, r === null)
        r = a;
      else {
        const p = o[o.length - 1];
        p.elements == null && (p.elements = []), p.elements.push(a);
      }
      o.push(a);
    }, c.onclosetag = () => {
      o.pop();
    }, c.ontext = (i) => {
      o.length > 0 && (o[o.length - 1].value = i);
    }, c.oncdata = (i) => {
      const a = o[o.length - 1];
      a.value = i, a.isCData = !0;
    }, c.onerror = (i) => {
      throw i;
    }, c.write(h), r;
  }
  return Vt;
}
var vt = {}, aa;
function id() {
  if (aa) return vt;
  aa = 1, Object.defineProperty(vt, "__esModule", { value: !0 }), vt.mapToObject = e, vt.isValidKey = t, vt.asArray = l, vt.deepAssign = n, vt.objectToArgs = c;
  function e(o) {
    const i = {};
    for (const [a, p] of o)
      t(a) && (p instanceof Map ? i[a] = e(p) : i[a] = p);
    return i;
  }
  function t(o) {
    return ["__proto__", "prototype", "constructor"].includes(o) ? !1 : ["string", "number", "symbol", "boolean"].includes(typeof o) || o === null;
  }
  function l(o) {
    return o == null ? [] : Array.isArray(o) ? o : [o];
  }
  function s(o) {
    if (Array.isArray(o))
      return !1;
    const i = typeof o;
    return i === "object" || i === "function";
  }
  function d(o, i, a) {
    const p = i[a];
    if (p === void 0)
      return;
    const g = o[a];
    g == null || p == null || !s(g) || !s(p) ? Array.isArray(g) && Array.isArray(p) ? o[a] = Array.from(new Set(g.concat(p))) : o[a] = p : o[a] = u(g, p);
  }
  function u(o, i) {
    if (o !== i)
      for (const a of Object.getOwnPropertyNames(i))
        t(a) && d(o, i, a);
    return o;
  }
  function n(o, ...i) {
    for (const a of i)
      a != null && u(o, a);
    return o;
  }
  const h = /^[a-zA-Z][a-zA-Z0-9-]*$/, r = /[\0\r\n]/;
  function c(o) {
    const i = Object.entries(o).reduce((a, [p, g]) => {
      if (!t(p) || g == null)
        return a;
      if (!h.test(p))
        throw new Error(`objectToArgs: unsafe flag name rejected: ${JSON.stringify(p)}`);
      if (r.test(g))
        throw new Error(`objectToArgs: value for --${p} contains a null byte or newline`);
      return a.concat([`--${p}`, g]);
    }, []);
    return Object.freeze(i);
  }
  return vt;
}
var la;
function qe() {
  return la || (la = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CURRENT_APP_PACKAGE_FILE_NAME = e.CURRENT_APP_INSTALLER_FILE_NAME = e.objectToArgs = e.deepAssign = e.asArray = e.mapToObject = e.isValidKey = e.XElement = e.parseXml = e.UUID = e.parseDn = e.retry = e.githubTagPrefix = e.githubUrl = e.getS3LikeProviderBaseUrl = e.ProgressCallbackTransform = e.MemoLazy = e.safeStringifyJson = e.safeGetHeader = e.parseJson = e.isSensitiveFieldName = e.HttpExecutor = e.hashSensitiveValue = e.HttpError = e.DigestTransform = e.createHttpError = e.configureRequestUrl = e.configureRequestOptionsFromUrl = e.configureRequestOptions = e.newError = e.CancellationToken = e.CancellationError = void 0;
    var t = xs();
    Object.defineProperty(e, "CancellationError", { enumerable: !0, get: function() {
      return t.CancellationError;
    } }), Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
      return t.CancellationToken;
    } });
    var l = mn();
    Object.defineProperty(e, "newError", { enumerable: !0, get: function() {
      return l.newError;
    } });
    var s = Jf();
    Object.defineProperty(e, "configureRequestOptions", { enumerable: !0, get: function() {
      return s.configureRequestOptions;
    } }), Object.defineProperty(e, "configureRequestOptionsFromUrl", { enumerable: !0, get: function() {
      return s.configureRequestOptionsFromUrl;
    } }), Object.defineProperty(e, "configureRequestUrl", { enumerable: !0, get: function() {
      return s.configureRequestUrl;
    } }), Object.defineProperty(e, "createHttpError", { enumerable: !0, get: function() {
      return s.createHttpError;
    } }), Object.defineProperty(e, "DigestTransform", { enumerable: !0, get: function() {
      return s.DigestTransform;
    } }), Object.defineProperty(e, "HttpError", { enumerable: !0, get: function() {
      return s.HttpError;
    } }), Object.defineProperty(e, "hashSensitiveValue", { enumerable: !0, get: function() {
      return s.hashSensitiveValue;
    } }), Object.defineProperty(e, "HttpExecutor", { enumerable: !0, get: function() {
      return s.HttpExecutor;
    } }), Object.defineProperty(e, "isSensitiveFieldName", { enumerable: !0, get: function() {
      return s.isSensitiveFieldName;
    } }), Object.defineProperty(e, "parseJson", { enumerable: !0, get: function() {
      return s.parseJson;
    } }), Object.defineProperty(e, "safeGetHeader", { enumerable: !0, get: function() {
      return s.safeGetHeader;
    } }), Object.defineProperty(e, "safeStringifyJson", { enumerable: !0, get: function() {
      return s.safeStringifyJson;
    } });
    var d = Kf();
    Object.defineProperty(e, "MemoLazy", { enumerable: !0, get: function() {
      return d.MemoLazy;
    } });
    var u = Dc();
    Object.defineProperty(e, "ProgressCallbackTransform", { enumerable: !0, get: function() {
      return u.ProgressCallbackTransform;
    } });
    var n = Qf();
    Object.defineProperty(e, "getS3LikeProviderBaseUrl", { enumerable: !0, get: function() {
      return n.getS3LikeProviderBaseUrl;
    } }), Object.defineProperty(e, "githubUrl", { enumerable: !0, get: function() {
      return n.githubUrl;
    } }), Object.defineProperty(e, "githubTagPrefix", { enumerable: !0, get: function() {
      return n.githubTagPrefix;
    } });
    var h = Zf();
    Object.defineProperty(e, "retry", { enumerable: !0, get: function() {
      return h.retry;
    } });
    var r = ed();
    Object.defineProperty(e, "parseDn", { enumerable: !0, get: function() {
      return r.parseDn;
    } });
    var c = td();
    Object.defineProperty(e, "UUID", { enumerable: !0, get: function() {
      return c.UUID;
    } });
    var o = nd();
    Object.defineProperty(e, "parseXml", { enumerable: !0, get: function() {
      return o.parseXml;
    } }), Object.defineProperty(e, "XElement", { enumerable: !0, get: function() {
      return o.XElement;
    } });
    var i = id();
    Object.defineProperty(e, "isValidKey", { enumerable: !0, get: function() {
      return i.isValidKey;
    } }), Object.defineProperty(e, "mapToObject", { enumerable: !0, get: function() {
      return i.mapToObject;
    } }), Object.defineProperty(e, "asArray", { enumerable: !0, get: function() {
      return i.asArray;
    } }), Object.defineProperty(e, "deepAssign", { enumerable: !0, get: function() {
      return i.deepAssign;
    } }), Object.defineProperty(e, "objectToArgs", { enumerable: !0, get: function() {
      return i.objectToArgs;
    } }), e.CURRENT_APP_INSTALLER_FILE_NAME = "installer.exe", e.CURRENT_APP_PACKAGE_FILE_NAME = "package.7z";
  })(si)), si;
}
var je = {}, nn = {}, Et = {}, ca;
function $r() {
  if (ca) return Et;
  ca = 1;
  function e(n) {
    return typeof n > "u" || n === null;
  }
  function t(n) {
    return typeof n == "object" && n !== null;
  }
  function l(n) {
    return Array.isArray(n) ? n : e(n) ? [] : [n];
  }
  function s(n, h) {
    var r, c, o, i;
    if (h)
      for (i = Object.keys(h), r = 0, c = i.length; r < c; r += 1)
        o = i[r], n[o] = h[o];
    return n;
  }
  function d(n, h) {
    var r = "", c;
    for (c = 0; c < h; c += 1)
      r += n;
    return r;
  }
  function u(n) {
    return n === 0 && Number.NEGATIVE_INFINITY === 1 / n;
  }
  return Et.isNothing = e, Et.isObject = t, Et.toArray = l, Et.repeat = d, Et.isNegativeZero = u, Et.extend = s, Et;
}
var fi, ua;
function qr() {
  if (ua) return fi;
  ua = 1;
  function e(l, s) {
    var d = "", u = l.reason || "(unknown reason)";
    return l.mark ? (l.mark.name && (d += 'in "' + l.mark.name + '" '), d += "(" + (l.mark.line + 1) + ":" + (l.mark.column + 1) + ")", !s && l.mark.snippet && (d += `

` + l.mark.snippet), u + " " + d) : u;
  }
  function t(l, s) {
    Error.call(this), this.name = "YAMLException", this.reason = l, this.mark = s, this.message = e(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
  }
  return t.prototype = Object.create(Error.prototype), t.prototype.constructor = t, t.prototype.toString = function(s) {
    return this.name + ": " + e(this, s);
  }, fi = t, fi;
}
var di, fa;
function sd() {
  if (fa) return di;
  fa = 1;
  var e = $r();
  function t(d, u, n, h, r) {
    var c = "", o = "", i = Math.floor(r / 2) - 1;
    return h - u > i && (c = " ... ", u = h - i + c.length), n - h > i && (o = " ...", n = h + i - o.length), {
      str: c + d.slice(u, n).replace(/\t/g, "→") + o,
      pos: h - u + c.length
      // relative position
    };
  }
  function l(d, u) {
    return e.repeat(" ", u - d.length) + d;
  }
  function s(d, u) {
    if (u = Object.create(u || null), !d.buffer) return null;
    u.maxLength || (u.maxLength = 79), typeof u.indent != "number" && (u.indent = 1), typeof u.linesBefore != "number" && (u.linesBefore = 3), typeof u.linesAfter != "number" && (u.linesAfter = 2);
    for (var n = /\r?\n|\r|\0/g, h = [0], r = [], c, o = -1; c = n.exec(d.buffer); )
      r.push(c.index), h.push(c.index + c[0].length), d.position <= c.index && o < 0 && (o = h.length - 2);
    o < 0 && (o = h.length - 1);
    var i = "", a, p, g = Math.min(d.line + u.linesAfter, r.length).toString().length, v = u.maxLength - (u.indent + g + 3);
    for (a = 1; a <= u.linesBefore && !(o - a < 0); a++)
      p = t(
        d.buffer,
        h[o - a],
        r[o - a],
        d.position - (h[o] - h[o - a]),
        v
      ), i = e.repeat(" ", u.indent) + l((d.line - a + 1).toString(), g) + " | " + p.str + `
` + i;
    for (p = t(d.buffer, h[o], r[o], d.position, v), i += e.repeat(" ", u.indent) + l((d.line + 1).toString(), g) + " | " + p.str + `
`, i += e.repeat("-", u.indent + g + 3 + p.pos) + `^
`, a = 1; a <= u.linesAfter && !(o + a >= r.length); a++)
      p = t(
        d.buffer,
        h[o + a],
        r[o + a],
        d.position - (h[o] - h[o + a]),
        v
      ), i += e.repeat(" ", u.indent) + l((d.line + a + 1).toString(), g) + " | " + p.str + `
`;
    return i.replace(/\n$/, "");
  }
  return di = s, di;
}
var hi, da;
function We() {
  if (da) return hi;
  da = 1;
  var e = qr(), t = [
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
  ], l = [
    "scalar",
    "sequence",
    "mapping"
  ];
  function s(u) {
    var n = {};
    return u !== null && Object.keys(u).forEach(function(h) {
      u[h].forEach(function(r) {
        n[String(r)] = h;
      });
    }), n;
  }
  function d(u, n) {
    if (n = n || {}, Object.keys(n).forEach(function(h) {
      if (t.indexOf(h) === -1)
        throw new e('Unknown option "' + h + '" is met in definition of "' + u + '" YAML type.');
    }), this.options = n, this.tag = u, this.kind = n.kind || null, this.resolve = n.resolve || function() {
      return !0;
    }, this.construct = n.construct || function(h) {
      return h;
    }, this.instanceOf = n.instanceOf || null, this.predicate = n.predicate || null, this.represent = n.represent || null, this.representName = n.representName || null, this.defaultStyle = n.defaultStyle || null, this.multi = n.multi || !1, this.styleAliases = s(n.styleAliases || null), l.indexOf(this.kind) === -1)
      throw new e('Unknown kind "' + this.kind + '" is specified for "' + u + '" YAML type.');
  }
  return hi = d, hi;
}
var pi, ha;
function Nc() {
  if (ha) return pi;
  ha = 1;
  var e = qr(), t = We();
  function l(u, n) {
    var h = [];
    return u[n].forEach(function(r) {
      var c = h.length;
      h.forEach(function(o, i) {
        o.tag === r.tag && o.kind === r.kind && o.multi === r.multi && (c = i);
      }), h[c] = r;
    }), h;
  }
  function s() {
    var u = {
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
    }, n, h;
    function r(c) {
      c.multi ? (u.multi[c.kind].push(c), u.multi.fallback.push(c)) : u[c.kind][c.tag] = u.fallback[c.tag] = c;
    }
    for (n = 0, h = arguments.length; n < h; n += 1)
      arguments[n].forEach(r);
    return u;
  }
  function d(u) {
    return this.extend(u);
  }
  return d.prototype.extend = function(n) {
    var h = [], r = [];
    if (n instanceof t)
      r.push(n);
    else if (Array.isArray(n))
      r = r.concat(n);
    else if (n && (Array.isArray(n.implicit) || Array.isArray(n.explicit)))
      n.implicit && (h = h.concat(n.implicit)), n.explicit && (r = r.concat(n.explicit));
    else
      throw new e("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
    h.forEach(function(o) {
      if (!(o instanceof t))
        throw new e("Specified list of YAML types (or a single Type object) contains a non-Type object.");
      if (o.loadKind && o.loadKind !== "scalar")
        throw new e("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
      if (o.multi)
        throw new e("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }), r.forEach(function(o) {
      if (!(o instanceof t))
        throw new e("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    });
    var c = Object.create(d.prototype);
    return c.implicit = (this.implicit || []).concat(h), c.explicit = (this.explicit || []).concat(r), c.compiledImplicit = l(c, "implicit"), c.compiledExplicit = l(c, "explicit"), c.compiledTypeMap = s(c.compiledImplicit, c.compiledExplicit), c;
  }, pi = d, pi;
}
var mi, pa;
function Fc() {
  if (pa) return mi;
  pa = 1;
  var e = We();
  return mi = new e("tag:yaml.org,2002:str", {
    kind: "scalar",
    construct: function(t) {
      return t !== null ? t : "";
    }
  }), mi;
}
var gi, ma;
function Lc() {
  if (ma) return gi;
  ma = 1;
  var e = We();
  return gi = new e("tag:yaml.org,2002:seq", {
    kind: "sequence",
    construct: function(t) {
      return t !== null ? t : [];
    }
  }), gi;
}
var yi, ga;
function xc() {
  if (ga) return yi;
  ga = 1;
  var e = We();
  return yi = new e("tag:yaml.org,2002:map", {
    kind: "mapping",
    construct: function(t) {
      return t !== null ? t : {};
    }
  }), yi;
}
var vi, ya;
function Uc() {
  if (ya) return vi;
  ya = 1;
  var e = Nc();
  return vi = new e({
    explicit: [
      Fc(),
      Lc(),
      xc()
    ]
  }), vi;
}
var Ei, va;
function kc() {
  if (va) return Ei;
  va = 1;
  var e = We();
  function t(d) {
    if (d === null) return !0;
    var u = d.length;
    return u === 1 && d === "~" || u === 4 && (d === "null" || d === "Null" || d === "NULL");
  }
  function l() {
    return null;
  }
  function s(d) {
    return d === null;
  }
  return Ei = new e("tag:yaml.org,2002:null", {
    kind: "scalar",
    resolve: t,
    construct: l,
    predicate: s,
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
  }), Ei;
}
var wi, Ea;
function $c() {
  if (Ea) return wi;
  Ea = 1;
  var e = We();
  function t(d) {
    if (d === null) return !1;
    var u = d.length;
    return u === 4 && (d === "true" || d === "True" || d === "TRUE") || u === 5 && (d === "false" || d === "False" || d === "FALSE");
  }
  function l(d) {
    return d === "true" || d === "True" || d === "TRUE";
  }
  function s(d) {
    return Object.prototype.toString.call(d) === "[object Boolean]";
  }
  return wi = new e("tag:yaml.org,2002:bool", {
    kind: "scalar",
    resolve: t,
    construct: l,
    predicate: s,
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
  }), wi;
}
var _i, wa;
function qc() {
  if (wa) return _i;
  wa = 1;
  var e = $r(), t = We();
  function l(r) {
    return 48 <= r && r <= 57 || 65 <= r && r <= 70 || 97 <= r && r <= 102;
  }
  function s(r) {
    return 48 <= r && r <= 55;
  }
  function d(r) {
    return 48 <= r && r <= 57;
  }
  function u(r) {
    if (r === null) return !1;
    var c = r.length, o = 0, i = !1, a;
    if (!c) return !1;
    if (a = r[o], (a === "-" || a === "+") && (a = r[++o]), a === "0") {
      if (o + 1 === c) return !0;
      if (a = r[++o], a === "b") {
        for (o++; o < c; o++)
          if (a = r[o], a !== "_") {
            if (a !== "0" && a !== "1") return !1;
            i = !0;
          }
        return i && a !== "_";
      }
      if (a === "x") {
        for (o++; o < c; o++)
          if (a = r[o], a !== "_") {
            if (!l(r.charCodeAt(o))) return !1;
            i = !0;
          }
        return i && a !== "_";
      }
      if (a === "o") {
        for (o++; o < c; o++)
          if (a = r[o], a !== "_") {
            if (!s(r.charCodeAt(o))) return !1;
            i = !0;
          }
        return i && a !== "_";
      }
    }
    if (a === "_") return !1;
    for (; o < c; o++)
      if (a = r[o], a !== "_") {
        if (!d(r.charCodeAt(o)))
          return !1;
        i = !0;
      }
    return !(!i || a === "_");
  }
  function n(r) {
    var c = r, o = 1, i;
    if (c.indexOf("_") !== -1 && (c = c.replace(/_/g, "")), i = c[0], (i === "-" || i === "+") && (i === "-" && (o = -1), c = c.slice(1), i = c[0]), c === "0") return 0;
    if (i === "0") {
      if (c[1] === "b") return o * parseInt(c.slice(2), 2);
      if (c[1] === "x") return o * parseInt(c.slice(2), 16);
      if (c[1] === "o") return o * parseInt(c.slice(2), 8);
    }
    return o * parseInt(c, 10);
  }
  function h(r) {
    return Object.prototype.toString.call(r) === "[object Number]" && r % 1 === 0 && !e.isNegativeZero(r);
  }
  return _i = new t("tag:yaml.org,2002:int", {
    kind: "scalar",
    resolve: u,
    construct: n,
    predicate: h,
    represent: {
      binary: function(r) {
        return r >= 0 ? "0b" + r.toString(2) : "-0b" + r.toString(2).slice(1);
      },
      octal: function(r) {
        return r >= 0 ? "0o" + r.toString(8) : "-0o" + r.toString(8).slice(1);
      },
      decimal: function(r) {
        return r.toString(10);
      },
      /* eslint-disable max-len */
      hexadecimal: function(r) {
        return r >= 0 ? "0x" + r.toString(16).toUpperCase() : "-0x" + r.toString(16).toUpperCase().slice(1);
      }
    },
    defaultStyle: "decimal",
    styleAliases: {
      binary: [2, "bin"],
      octal: [8, "oct"],
      decimal: [10, "dec"],
      hexadecimal: [16, "hex"]
    }
  }), _i;
}
var Si, _a;
function Mc() {
  if (_a) return Si;
  _a = 1;
  var e = $r(), t = We(), l = new RegExp(
    // 2.5e4, 2.5 and integers
    "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
  );
  function s(r) {
    return !(r === null || !l.test(r) || // Quick hack to not allow integers end with `_`
    // Probably should update regexp & check speed
    r[r.length - 1] === "_");
  }
  function d(r) {
    var c, o;
    return c = r.replace(/_/g, "").toLowerCase(), o = c[0] === "-" ? -1 : 1, "+-".indexOf(c[0]) >= 0 && (c = c.slice(1)), c === ".inf" ? o === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : c === ".nan" ? NaN : o * parseFloat(c, 10);
  }
  var u = /^[-+]?[0-9]+e/;
  function n(r, c) {
    var o;
    if (isNaN(r))
      switch (c) {
        case "lowercase":
          return ".nan";
        case "uppercase":
          return ".NAN";
        case "camelcase":
          return ".NaN";
      }
    else if (Number.POSITIVE_INFINITY === r)
      switch (c) {
        case "lowercase":
          return ".inf";
        case "uppercase":
          return ".INF";
        case "camelcase":
          return ".Inf";
      }
    else if (Number.NEGATIVE_INFINITY === r)
      switch (c) {
        case "lowercase":
          return "-.inf";
        case "uppercase":
          return "-.INF";
        case "camelcase":
          return "-.Inf";
      }
    else if (e.isNegativeZero(r))
      return "-0.0";
    return o = r.toString(10), u.test(o) ? o.replace("e", ".e") : o;
  }
  function h(r) {
    return Object.prototype.toString.call(r) === "[object Number]" && (r % 1 !== 0 || e.isNegativeZero(r));
  }
  return Si = new t("tag:yaml.org,2002:float", {
    kind: "scalar",
    resolve: s,
    construct: d,
    predicate: h,
    represent: n,
    defaultStyle: "lowercase"
  }), Si;
}
var Ai, Sa;
function Bc() {
  return Sa || (Sa = 1, Ai = Uc().extend({
    implicit: [
      kc(),
      $c(),
      qc(),
      Mc()
    ]
  })), Ai;
}
var Ri, Aa;
function jc() {
  return Aa || (Aa = 1, Ri = Bc()), Ri;
}
var Ti, Ra;
function Hc() {
  if (Ra) return Ti;
  Ra = 1;
  var e = We(), t = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
  ), l = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
  );
  function s(n) {
    return n === null ? !1 : t.exec(n) !== null || l.exec(n) !== null;
  }
  function d(n) {
    var h, r, c, o, i, a, p, g = 0, v = null, m, w, R;
    if (h = t.exec(n), h === null && (h = l.exec(n)), h === null) throw new Error("Date resolve error");
    if (r = +h[1], c = +h[2] - 1, o = +h[3], !h[4])
      return new Date(Date.UTC(r, c, o));
    if (i = +h[4], a = +h[5], p = +h[6], h[7]) {
      for (g = h[7].slice(0, 3); g.length < 3; )
        g += "0";
      g = +g;
    }
    return h[9] && (m = +h[10], w = +(h[11] || 0), v = (m * 60 + w) * 6e4, h[9] === "-" && (v = -v)), R = new Date(Date.UTC(r, c, o, i, a, p, g)), v && R.setTime(R.getTime() - v), R;
  }
  function u(n) {
    return n.toISOString();
  }
  return Ti = new e("tag:yaml.org,2002:timestamp", {
    kind: "scalar",
    resolve: s,
    construct: d,
    instanceOf: Date,
    represent: u
  }), Ti;
}
var Ci, Ta;
function Gc() {
  if (Ta) return Ci;
  Ta = 1;
  var e = We();
  function t(l) {
    return l === "<<" || l === null;
  }
  return Ci = new e("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: t
  }), Ci;
}
var bi, Ca;
function Wc() {
  if (Ca) return bi;
  Ca = 1;
  var e = We(), t = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
  function l(n) {
    if (n === null) return !1;
    var h, r, c = 0, o = n.length, i = t;
    for (r = 0; r < o; r++)
      if (h = i.indexOf(n.charAt(r)), !(h > 64)) {
        if (h < 0) return !1;
        c += 6;
      }
    return c % 8 === 0;
  }
  function s(n) {
    var h, r, c = n.replace(/[\r\n=]/g, ""), o = c.length, i = t, a = 0, p = [];
    for (h = 0; h < o; h++)
      h % 4 === 0 && h && (p.push(a >> 16 & 255), p.push(a >> 8 & 255), p.push(a & 255)), a = a << 6 | i.indexOf(c.charAt(h));
    return r = o % 4 * 6, r === 0 ? (p.push(a >> 16 & 255), p.push(a >> 8 & 255), p.push(a & 255)) : r === 18 ? (p.push(a >> 10 & 255), p.push(a >> 2 & 255)) : r === 12 && p.push(a >> 4 & 255), new Uint8Array(p);
  }
  function d(n) {
    var h = "", r = 0, c, o, i = n.length, a = t;
    for (c = 0; c < i; c++)
      c % 3 === 0 && c && (h += a[r >> 18 & 63], h += a[r >> 12 & 63], h += a[r >> 6 & 63], h += a[r & 63]), r = (r << 8) + n[c];
    return o = i % 3, o === 0 ? (h += a[r >> 18 & 63], h += a[r >> 12 & 63], h += a[r >> 6 & 63], h += a[r & 63]) : o === 2 ? (h += a[r >> 10 & 63], h += a[r >> 4 & 63], h += a[r << 2 & 63], h += a[64]) : o === 1 && (h += a[r >> 2 & 63], h += a[r << 4 & 63], h += a[64], h += a[64]), h;
  }
  function u(n) {
    return Object.prototype.toString.call(n) === "[object Uint8Array]";
  }
  return bi = new e("tag:yaml.org,2002:binary", {
    kind: "scalar",
    resolve: l,
    construct: s,
    predicate: u,
    represent: d
  }), bi;
}
var Pi, ba;
function Vc() {
  if (ba) return Pi;
  ba = 1;
  var e = We(), t = Object.prototype.hasOwnProperty, l = Object.prototype.toString;
  function s(u) {
    if (u === null) return !0;
    var n = [], h, r, c, o, i, a = u;
    for (h = 0, r = a.length; h < r; h += 1) {
      if (c = a[h], i = !1, l.call(c) !== "[object Object]") return !1;
      for (o in c)
        if (t.call(c, o))
          if (!i) i = !0;
          else return !1;
      if (!i) return !1;
      if (n.indexOf(o) === -1) n.push(o);
      else return !1;
    }
    return !0;
  }
  function d(u) {
    return u !== null ? u : [];
  }
  return Pi = new e("tag:yaml.org,2002:omap", {
    kind: "sequence",
    resolve: s,
    construct: d
  }), Pi;
}
var Oi, Pa;
function zc() {
  if (Pa) return Oi;
  Pa = 1;
  var e = We(), t = Object.prototype.toString;
  function l(d) {
    if (d === null) return !0;
    var u, n, h, r, c, o = d;
    for (c = new Array(o.length), u = 0, n = o.length; u < n; u += 1) {
      if (h = o[u], t.call(h) !== "[object Object]" || (r = Object.keys(h), r.length !== 1)) return !1;
      c[u] = [r[0], h[r[0]]];
    }
    return !0;
  }
  function s(d) {
    if (d === null) return [];
    var u, n, h, r, c, o = d;
    for (c = new Array(o.length), u = 0, n = o.length; u < n; u += 1)
      h = o[u], r = Object.keys(h), c[u] = [r[0], h[r[0]]];
    return c;
  }
  return Oi = new e("tag:yaml.org,2002:pairs", {
    kind: "sequence",
    resolve: l,
    construct: s
  }), Oi;
}
var Ii, Oa;
function Yc() {
  if (Oa) return Ii;
  Oa = 1;
  var e = We(), t = Object.prototype.hasOwnProperty;
  function l(d) {
    if (d === null) return !0;
    var u, n = d;
    for (u in n)
      if (t.call(n, u) && n[u] !== null)
        return !1;
    return !0;
  }
  function s(d) {
    return d !== null ? d : {};
  }
  return Ii = new e("tag:yaml.org,2002:set", {
    kind: "mapping",
    resolve: l,
    construct: s
  }), Ii;
}
var Di, Ia;
function Us() {
  return Ia || (Ia = 1, Di = jc().extend({
    implicit: [
      Hc(),
      Gc()
    ],
    explicit: [
      Wc(),
      Vc(),
      zc(),
      Yc()
    ]
  })), Di;
}
var Da;
function od() {
  if (Da) return nn;
  Da = 1;
  var e = $r(), t = qr(), l = sd(), s = Us(), d = Object.prototype.hasOwnProperty, u = 1, n = 2, h = 3, r = 4, c = 1, o = 2, i = 3, a = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, p = /[\x85\u2028\u2029]/, g = /[,\[\]\{\}]/, v = /^(?:!|!!|![a-z\-]+!)$/i, m = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
  function w(f) {
    return Object.prototype.toString.call(f);
  }
  function R(f) {
    return f === 10 || f === 13;
  }
  function C(f) {
    return f === 9 || f === 32;
  }
  function D(f) {
    return f === 9 || f === 32 || f === 10 || f === 13;
  }
  function P(f) {
    return f === 44 || f === 91 || f === 93 || f === 123 || f === 125;
  }
  function F(f) {
    var j;
    return 48 <= f && f <= 57 ? f - 48 : (j = f | 32, 97 <= j && j <= 102 ? j - 97 + 10 : -1);
  }
  function O(f) {
    return f === 120 ? 2 : f === 117 ? 4 : f === 85 ? 8 : 0;
  }
  function L(f) {
    return 48 <= f && f <= 57 ? f - 48 : -1;
  }
  function S(f) {
    return f === 48 ? "\0" : f === 97 ? "\x07" : f === 98 ? "\b" : f === 116 || f === 9 ? "	" : f === 110 ? `
` : f === 118 ? "\v" : f === 102 ? "\f" : f === 114 ? "\r" : f === 101 ? "\x1B" : f === 32 ? " " : f === 34 ? '"' : f === 47 ? "/" : f === 92 ? "\\" : f === 78 ? "" : f === 95 ? " " : f === 76 ? "\u2028" : f === 80 ? "\u2029" : "";
  }
  function z(f) {
    return f <= 65535 ? String.fromCharCode(f) : String.fromCharCode(
      (f - 65536 >> 10) + 55296,
      (f - 65536 & 1023) + 56320
    );
  }
  function G(f, j, V) {
    j === "__proto__" ? Object.defineProperty(f, j, {
      configurable: !0,
      enumerable: !0,
      writable: !0,
      value: V
    }) : f[j] = V;
  }
  for (var $ = new Array(256), H = new Array(256), x = 0; x < 256; x++)
    $[x] = S(x) ? 1 : 0, H[x] = S(x);
  function b(f, j) {
    this.input = f, this.filename = j.filename || null, this.schema = j.schema || s, this.onWarning = j.onWarning || null, this.legacy = j.legacy || !1, this.json = j.json || !1, this.listener = j.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = f.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
  }
  function I(f, j) {
    var V = {
      name: f.filename,
      buffer: f.input.slice(0, -1),
      // omit trailing \0
      position: f.position,
      line: f.line,
      column: f.position - f.lineStart
    };
    return V.snippet = l(V), new t(j, V);
  }
  function A(f, j) {
    throw I(f, j);
  }
  function k(f, j) {
    f.onWarning && f.onWarning.call(null, I(f, j));
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
  function W(f, j, V, se) {
    var X, ne, ee, ae;
    if (j < V) {
      if (ae = f.input.slice(j, V), se)
        for (X = 0, ne = ae.length; X < ne; X += 1)
          ee = ae.charCodeAt(X), ee === 9 || 32 <= ee && ee <= 1114111 || A(f, "expected valid JSON character");
      else a.test(ae) && A(f, "the stream contains non-printable characters");
      f.result += ae;
    }
  }
  function ie(f, j, V, se) {
    var X, ne, ee, ae;
    for (e.isObject(V) || A(f, "cannot merge mappings; the provided source object is unacceptable"), X = Object.keys(V), ee = 0, ae = X.length; ee < ae; ee += 1)
      ne = X[ee], d.call(j, ne) || (G(j, ne, V[ne]), se[ne] = !0);
  }
  function te(f, j, V, se, X, ne, ee, ae, ue) {
    var Ce, be;
    if (Array.isArray(X))
      for (X = Array.prototype.slice.call(X), Ce = 0, be = X.length; Ce < be; Ce += 1)
        Array.isArray(X[Ce]) && A(f, "nested arrays are not supported inside keys"), typeof X == "object" && w(X[Ce]) === "[object Object]" && (X[Ce] = "[object Object]");
    if (typeof X == "object" && w(X) === "[object Object]" && (X = "[object Object]"), X = String(X), j === null && (j = {}), se === "tag:yaml.org,2002:merge")
      if (Array.isArray(ne))
        for (Ce = 0, be = ne.length; Ce < be; Ce += 1)
          ie(f, j, ne[Ce], V);
      else
        ie(f, j, ne, V);
    else
      !f.json && !d.call(V, X) && d.call(j, X) && (f.line = ee || f.line, f.lineStart = ae || f.lineStart, f.position = ue || f.position, A(f, "duplicated mapping key")), G(j, X, ne), delete V[X];
    return j;
  }
  function de(f) {
    var j;
    j = f.input.charCodeAt(f.position), j === 10 ? f.position++ : j === 13 ? (f.position++, f.input.charCodeAt(f.position) === 10 && f.position++) : A(f, "a line break is expected"), f.line += 1, f.lineStart = f.position, f.firstTabInLine = -1;
  }
  function he(f, j, V) {
    for (var se = 0, X = f.input.charCodeAt(f.position); X !== 0; ) {
      for (; C(X); )
        X === 9 && f.firstTabInLine === -1 && (f.firstTabInLine = f.position), X = f.input.charCodeAt(++f.position);
      if (j && X === 35)
        do
          X = f.input.charCodeAt(++f.position);
        while (X !== 10 && X !== 13 && X !== 0);
      if (R(X))
        for (de(f), X = f.input.charCodeAt(f.position), se++, f.lineIndent = 0; X === 32; )
          f.lineIndent++, X = f.input.charCodeAt(++f.position);
      else
        break;
    }
    return V !== -1 && se !== 0 && f.lineIndent < V && k(f, "deficient indentation"), se;
  }
  function Y(f) {
    var j = f.position, V;
    return V = f.input.charCodeAt(j), !!((V === 45 || V === 46) && V === f.input.charCodeAt(j + 1) && V === f.input.charCodeAt(j + 2) && (j += 3, V = f.input.charCodeAt(j), V === 0 || D(V)));
  }
  function pe(f, j) {
    j === 1 ? f.result += " " : j > 1 && (f.result += e.repeat(`
`, j - 1));
  }
  function E(f, j, V) {
    var se, X, ne, ee, ae, ue, Ce, be, Ee = f.kind, _ = f.result, q;
    if (q = f.input.charCodeAt(f.position), D(q) || P(q) || q === 35 || q === 38 || q === 42 || q === 33 || q === 124 || q === 62 || q === 39 || q === 34 || q === 37 || q === 64 || q === 96 || (q === 63 || q === 45) && (X = f.input.charCodeAt(f.position + 1), D(X) || V && P(X)))
      return !1;
    for (f.kind = "scalar", f.result = "", ne = ee = f.position, ae = !1; q !== 0; ) {
      if (q === 58) {
        if (X = f.input.charCodeAt(f.position + 1), D(X) || V && P(X))
          break;
      } else if (q === 35) {
        if (se = f.input.charCodeAt(f.position - 1), D(se))
          break;
      } else {
        if (f.position === f.lineStart && Y(f) || V && P(q))
          break;
        if (R(q))
          if (ue = f.line, Ce = f.lineStart, be = f.lineIndent, he(f, !1, -1), f.lineIndent >= j) {
            ae = !0, q = f.input.charCodeAt(f.position);
            continue;
          } else {
            f.position = ee, f.line = ue, f.lineStart = Ce, f.lineIndent = be;
            break;
          }
      }
      ae && (W(f, ne, ee, !1), pe(f, f.line - ue), ne = ee = f.position, ae = !1), C(q) || (ee = f.position + 1), q = f.input.charCodeAt(++f.position);
    }
    return W(f, ne, ee, !1), f.result ? !0 : (f.kind = Ee, f.result = _, !1);
  }
  function y(f, j) {
    var V, se, X;
    if (V = f.input.charCodeAt(f.position), V !== 39)
      return !1;
    for (f.kind = "scalar", f.result = "", f.position++, se = X = f.position; (V = f.input.charCodeAt(f.position)) !== 0; )
      if (V === 39)
        if (W(f, se, f.position, !0), V = f.input.charCodeAt(++f.position), V === 39)
          se = f.position, f.position++, X = f.position;
        else
          return !0;
      else R(V) ? (W(f, se, X, !0), pe(f, he(f, !1, j)), se = X = f.position) : f.position === f.lineStart && Y(f) ? A(f, "unexpected end of the document within a single quoted scalar") : (f.position++, X = f.position);
    A(f, "unexpected end of the stream within a single quoted scalar");
  }
  function B(f, j) {
    var V, se, X, ne, ee, ae;
    if (ae = f.input.charCodeAt(f.position), ae !== 34)
      return !1;
    for (f.kind = "scalar", f.result = "", f.position++, V = se = f.position; (ae = f.input.charCodeAt(f.position)) !== 0; ) {
      if (ae === 34)
        return W(f, V, f.position, !0), f.position++, !0;
      if (ae === 92) {
        if (W(f, V, f.position, !0), ae = f.input.charCodeAt(++f.position), R(ae))
          he(f, !1, j);
        else if (ae < 256 && $[ae])
          f.result += H[ae], f.position++;
        else if ((ee = O(ae)) > 0) {
          for (X = ee, ne = 0; X > 0; X--)
            ae = f.input.charCodeAt(++f.position), (ee = F(ae)) >= 0 ? ne = (ne << 4) + ee : A(f, "expected hexadecimal character");
          f.result += z(ne), f.position++;
        } else
          A(f, "unknown escape sequence");
        V = se = f.position;
      } else R(ae) ? (W(f, V, se, !0), pe(f, he(f, !1, j)), V = se = f.position) : f.position === f.lineStart && Y(f) ? A(f, "unexpected end of the document within a double quoted scalar") : (f.position++, se = f.position);
    }
    A(f, "unexpected end of the stream within a double quoted scalar");
  }
  function N(f, j) {
    var V = !0, se, X, ne, ee = f.tag, ae, ue = f.anchor, Ce, be, Ee, _, q, J = /* @__PURE__ */ Object.create(null), K, Q, oe, re;
    if (re = f.input.charCodeAt(f.position), re === 91)
      be = 93, q = !1, ae = [];
    else if (re === 123)
      be = 125, q = !0, ae = {};
    else
      return !1;
    for (f.anchor !== null && (f.anchorMap[f.anchor] = ae), re = f.input.charCodeAt(++f.position); re !== 0; ) {
      if (he(f, !0, j), re = f.input.charCodeAt(f.position), re === be)
        return f.position++, f.tag = ee, f.anchor = ue, f.kind = q ? "mapping" : "sequence", f.result = ae, !0;
      V ? re === 44 && A(f, "expected the node content, but found ','") : A(f, "missed comma between flow collection entries"), Q = K = oe = null, Ee = _ = !1, re === 63 && (Ce = f.input.charCodeAt(f.position + 1), D(Ce) && (Ee = _ = !0, f.position++, he(f, !0, j))), se = f.line, X = f.lineStart, ne = f.position, Te(f, j, u, !1, !0), Q = f.tag, K = f.result, he(f, !0, j), re = f.input.charCodeAt(f.position), (_ || f.line === se) && re === 58 && (Ee = !0, re = f.input.charCodeAt(++f.position), he(f, !0, j), Te(f, j, u, !1, !0), oe = f.result), q ? te(f, ae, J, Q, K, oe, se, X, ne) : Ee ? ae.push(te(f, null, J, Q, K, oe, se, X, ne)) : ae.push(K), he(f, !0, j), re = f.input.charCodeAt(f.position), re === 44 ? (V = !0, re = f.input.charCodeAt(++f.position)) : V = !1;
    }
    A(f, "unexpected end of the stream within a flow collection");
  }
  function fe(f, j) {
    var V, se, X = c, ne = !1, ee = !1, ae = j, ue = 0, Ce = !1, be, Ee;
    if (Ee = f.input.charCodeAt(f.position), Ee === 124)
      se = !1;
    else if (Ee === 62)
      se = !0;
    else
      return !1;
    for (f.kind = "scalar", f.result = ""; Ee !== 0; )
      if (Ee = f.input.charCodeAt(++f.position), Ee === 43 || Ee === 45)
        c === X ? X = Ee === 43 ? i : o : A(f, "repeat of a chomping mode identifier");
      else if ((be = L(Ee)) >= 0)
        be === 0 ? A(f, "bad explicit indentation width of a block scalar; it cannot be less than one") : ee ? A(f, "repeat of an indentation width identifier") : (ae = j + be - 1, ee = !0);
      else
        break;
    if (C(Ee)) {
      do
        Ee = f.input.charCodeAt(++f.position);
      while (C(Ee));
      if (Ee === 35)
        do
          Ee = f.input.charCodeAt(++f.position);
        while (!R(Ee) && Ee !== 0);
    }
    for (; Ee !== 0; ) {
      for (de(f), f.lineIndent = 0, Ee = f.input.charCodeAt(f.position); (!ee || f.lineIndent < ae) && Ee === 32; )
        f.lineIndent++, Ee = f.input.charCodeAt(++f.position);
      if (!ee && f.lineIndent > ae && (ae = f.lineIndent), R(Ee)) {
        ue++;
        continue;
      }
      if (f.lineIndent < ae) {
        X === i ? f.result += e.repeat(`
`, ne ? 1 + ue : ue) : X === c && ne && (f.result += `
`);
        break;
      }
      for (se ? C(Ee) ? (Ce = !0, f.result += e.repeat(`
`, ne ? 1 + ue : ue)) : Ce ? (Ce = !1, f.result += e.repeat(`
`, ue + 1)) : ue === 0 ? ne && (f.result += " ") : f.result += e.repeat(`
`, ue) : f.result += e.repeat(`
`, ne ? 1 + ue : ue), ne = !0, ee = !0, ue = 0, V = f.position; !R(Ee) && Ee !== 0; )
        Ee = f.input.charCodeAt(++f.position);
      W(f, V, f.position, !1);
    }
    return !0;
  }
  function ye(f, j) {
    var V, se = f.tag, X = f.anchor, ne = [], ee, ae = !1, ue;
    if (f.firstTabInLine !== -1) return !1;
    for (f.anchor !== null && (f.anchorMap[f.anchor] = ne), ue = f.input.charCodeAt(f.position); ue !== 0 && (f.firstTabInLine !== -1 && (f.position = f.firstTabInLine, A(f, "tab characters must not be used in indentation")), !(ue !== 45 || (ee = f.input.charCodeAt(f.position + 1), !D(ee)))); ) {
      if (ae = !0, f.position++, he(f, !0, -1) && f.lineIndent <= j) {
        ne.push(null), ue = f.input.charCodeAt(f.position);
        continue;
      }
      if (V = f.line, Te(f, j, h, !1, !0), ne.push(f.result), he(f, !0, -1), ue = f.input.charCodeAt(f.position), (f.line === V || f.lineIndent > j) && ue !== 0)
        A(f, "bad indentation of a sequence entry");
      else if (f.lineIndent < j)
        break;
    }
    return ae ? (f.tag = se, f.anchor = X, f.kind = "sequence", f.result = ne, !0) : !1;
  }
  function ve(f, j, V) {
    var se, X, ne, ee, ae, ue, Ce = f.tag, be = f.anchor, Ee = {}, _ = /* @__PURE__ */ Object.create(null), q = null, J = null, K = null, Q = !1, oe = !1, re;
    if (f.firstTabInLine !== -1) return !1;
    for (f.anchor !== null && (f.anchorMap[f.anchor] = Ee), re = f.input.charCodeAt(f.position); re !== 0; ) {
      if (!Q && f.firstTabInLine !== -1 && (f.position = f.firstTabInLine, A(f, "tab characters must not be used in indentation")), se = f.input.charCodeAt(f.position + 1), ne = f.line, (re === 63 || re === 58) && D(se))
        re === 63 ? (Q && (te(f, Ee, _, q, J, null, ee, ae, ue), q = J = K = null), oe = !0, Q = !0, X = !0) : Q ? (Q = !1, X = !0) : A(f, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), f.position += 1, re = se;
      else {
        if (ee = f.line, ae = f.lineStart, ue = f.position, !Te(f, V, n, !1, !0))
          break;
        if (f.line === ne) {
          for (re = f.input.charCodeAt(f.position); C(re); )
            re = f.input.charCodeAt(++f.position);
          if (re === 58)
            re = f.input.charCodeAt(++f.position), D(re) || A(f, "a whitespace character is expected after the key-value separator within a block mapping"), Q && (te(f, Ee, _, q, J, null, ee, ae, ue), q = J = K = null), oe = !0, Q = !1, X = !1, q = f.tag, J = f.result;
          else if (oe)
            A(f, "can not read an implicit mapping pair; a colon is missed");
          else
            return f.tag = Ce, f.anchor = be, !0;
        } else if (oe)
          A(f, "can not read a block mapping entry; a multiline key may not be an implicit key");
        else
          return f.tag = Ce, f.anchor = be, !0;
      }
      if ((f.line === ne || f.lineIndent > j) && (Q && (ee = f.line, ae = f.lineStart, ue = f.position), Te(f, j, r, !0, X) && (Q ? J = f.result : K = f.result), Q || (te(f, Ee, _, q, J, K, ee, ae, ue), q = J = K = null), he(f, !0, -1), re = f.input.charCodeAt(f.position)), (f.line === ne || f.lineIndent > j) && re !== 0)
        A(f, "bad indentation of a mapping entry");
      else if (f.lineIndent < j)
        break;
    }
    return Q && te(f, Ee, _, q, J, null, ee, ae, ue), oe && (f.tag = Ce, f.anchor = be, f.kind = "mapping", f.result = Ee), oe;
  }
  function Se(f) {
    var j, V = !1, se = !1, X, ne, ee;
    if (ee = f.input.charCodeAt(f.position), ee !== 33) return !1;
    if (f.tag !== null && A(f, "duplication of a tag property"), ee = f.input.charCodeAt(++f.position), ee === 60 ? (V = !0, ee = f.input.charCodeAt(++f.position)) : ee === 33 ? (se = !0, X = "!!", ee = f.input.charCodeAt(++f.position)) : X = "!", j = f.position, V) {
      do
        ee = f.input.charCodeAt(++f.position);
      while (ee !== 0 && ee !== 62);
      f.position < f.length ? (ne = f.input.slice(j, f.position), ee = f.input.charCodeAt(++f.position)) : A(f, "unexpected end of the stream within a verbatim tag");
    } else {
      for (; ee !== 0 && !D(ee); )
        ee === 33 && (se ? A(f, "tag suffix cannot contain exclamation marks") : (X = f.input.slice(j - 1, f.position + 1), v.test(X) || A(f, "named tag handle cannot contain such characters"), se = !0, j = f.position + 1)), ee = f.input.charCodeAt(++f.position);
      ne = f.input.slice(j, f.position), g.test(ne) && A(f, "tag suffix cannot contain flow indicator characters");
    }
    ne && !m.test(ne) && A(f, "tag name cannot contain such characters: " + ne);
    try {
      ne = decodeURIComponent(ne);
    } catch {
      A(f, "tag name is malformed: " + ne);
    }
    return V ? f.tag = ne : d.call(f.tagMap, X) ? f.tag = f.tagMap[X] + ne : X === "!" ? f.tag = "!" + ne : X === "!!" ? f.tag = "tag:yaml.org,2002:" + ne : A(f, 'undeclared tag handle "' + X + '"'), !0;
  }
  function we(f) {
    var j, V;
    if (V = f.input.charCodeAt(f.position), V !== 38) return !1;
    for (f.anchor !== null && A(f, "duplication of an anchor property"), V = f.input.charCodeAt(++f.position), j = f.position; V !== 0 && !D(V) && !P(V); )
      V = f.input.charCodeAt(++f.position);
    return f.position === j && A(f, "name of an anchor node must contain at least one character"), f.anchor = f.input.slice(j, f.position), !0;
  }
  function ze(f) {
    var j, V, se;
    if (se = f.input.charCodeAt(f.position), se !== 42) return !1;
    for (se = f.input.charCodeAt(++f.position), j = f.position; se !== 0 && !D(se) && !P(se); )
      se = f.input.charCodeAt(++f.position);
    return f.position === j && A(f, "name of an alias node must contain at least one character"), V = f.input.slice(j, f.position), d.call(f.anchorMap, V) || A(f, 'unidentified alias "' + V + '"'), f.result = f.anchorMap[V], he(f, !0, -1), !0;
  }
  function Te(f, j, V, se, X) {
    var ne, ee, ae, ue = 1, Ce = !1, be = !1, Ee, _, q, J, K, Q;
    if (f.listener !== null && f.listener("open", f), f.tag = null, f.anchor = null, f.kind = null, f.result = null, ne = ee = ae = r === V || h === V, se && he(f, !0, -1) && (Ce = !0, f.lineIndent > j ? ue = 1 : f.lineIndent === j ? ue = 0 : f.lineIndent < j && (ue = -1)), ue === 1)
      for (; Se(f) || we(f); )
        he(f, !0, -1) ? (Ce = !0, ae = ne, f.lineIndent > j ? ue = 1 : f.lineIndent === j ? ue = 0 : f.lineIndent < j && (ue = -1)) : ae = !1;
    if (ae && (ae = Ce || X), (ue === 1 || r === V) && (u === V || n === V ? K = j : K = j + 1, Q = f.position - f.lineStart, ue === 1 ? ae && (ye(f, Q) || ve(f, Q, K)) || N(f, K) ? be = !0 : (ee && fe(f, K) || y(f, K) || B(f, K) ? be = !0 : ze(f) ? (be = !0, (f.tag !== null || f.anchor !== null) && A(f, "alias node should not have any properties")) : E(f, K, u === V) && (be = !0, f.tag === null && (f.tag = "?")), f.anchor !== null && (f.anchorMap[f.anchor] = f.result)) : ue === 0 && (be = ae && ye(f, Q))), f.tag === null)
      f.anchor !== null && (f.anchorMap[f.anchor] = f.result);
    else if (f.tag === "?") {
      for (f.result !== null && f.kind !== "scalar" && A(f, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + f.kind + '"'), Ee = 0, _ = f.implicitTypes.length; Ee < _; Ee += 1)
        if (J = f.implicitTypes[Ee], J.resolve(f.result)) {
          f.result = J.construct(f.result), f.tag = J.tag, f.anchor !== null && (f.anchorMap[f.anchor] = f.result);
          break;
        }
    } else if (f.tag !== "!") {
      if (d.call(f.typeMap[f.kind || "fallback"], f.tag))
        J = f.typeMap[f.kind || "fallback"][f.tag];
      else
        for (J = null, q = f.typeMap.multi[f.kind || "fallback"], Ee = 0, _ = q.length; Ee < _; Ee += 1)
          if (f.tag.slice(0, q[Ee].tag.length) === q[Ee].tag) {
            J = q[Ee];
            break;
          }
      J || A(f, "unknown tag !<" + f.tag + ">"), f.result !== null && J.kind !== f.kind && A(f, "unacceptable node kind for !<" + f.tag + '> tag; it should be "' + J.kind + '", not "' + f.kind + '"'), J.resolve(f.result, f.tag) ? (f.result = J.construct(f.result, f.tag), f.anchor !== null && (f.anchorMap[f.anchor] = f.result)) : A(f, "cannot resolve a node with !<" + f.tag + "> explicit tag");
    }
    return f.listener !== null && f.listener("close", f), f.tag !== null || f.anchor !== null || be;
  }
  function Ge(f) {
    var j = f.position, V, se, X, ne = !1, ee;
    for (f.version = null, f.checkLineBreaks = f.legacy, f.tagMap = /* @__PURE__ */ Object.create(null), f.anchorMap = /* @__PURE__ */ Object.create(null); (ee = f.input.charCodeAt(f.position)) !== 0 && (he(f, !0, -1), ee = f.input.charCodeAt(f.position), !(f.lineIndent > 0 || ee !== 37)); ) {
      for (ne = !0, ee = f.input.charCodeAt(++f.position), V = f.position; ee !== 0 && !D(ee); )
        ee = f.input.charCodeAt(++f.position);
      for (se = f.input.slice(V, f.position), X = [], se.length < 1 && A(f, "directive name must not be less than one character in length"); ee !== 0; ) {
        for (; C(ee); )
          ee = f.input.charCodeAt(++f.position);
        if (ee === 35) {
          do
            ee = f.input.charCodeAt(++f.position);
          while (ee !== 0 && !R(ee));
          break;
        }
        if (R(ee)) break;
        for (V = f.position; ee !== 0 && !D(ee); )
          ee = f.input.charCodeAt(++f.position);
        X.push(f.input.slice(V, f.position));
      }
      ee !== 0 && de(f), d.call(M, se) ? M[se](f, se, X) : k(f, 'unknown document directive "' + se + '"');
    }
    if (he(f, !0, -1), f.lineIndent === 0 && f.input.charCodeAt(f.position) === 45 && f.input.charCodeAt(f.position + 1) === 45 && f.input.charCodeAt(f.position + 2) === 45 ? (f.position += 3, he(f, !0, -1)) : ne && A(f, "directives end mark is expected"), Te(f, f.lineIndent - 1, r, !1, !0), he(f, !0, -1), f.checkLineBreaks && p.test(f.input.slice(j, f.position)) && k(f, "non-ASCII line breaks are interpreted as content"), f.documents.push(f.result), f.position === f.lineStart && Y(f)) {
      f.input.charCodeAt(f.position) === 46 && (f.position += 3, he(f, !0, -1));
      return;
    }
    if (f.position < f.length - 1)
      A(f, "end of the stream or a document separator is expected");
    else
      return;
  }
  function pt(f, j) {
    f = String(f), j = j || {}, f.length !== 0 && (f.charCodeAt(f.length - 1) !== 10 && f.charCodeAt(f.length - 1) !== 13 && (f += `
`), f.charCodeAt(0) === 65279 && (f = f.slice(1)));
    var V = new b(f, j), se = f.indexOf("\0");
    for (se !== -1 && (V.position = se, A(V, "null byte is not allowed in input")), V.input += "\0"; V.input.charCodeAt(V.position) === 32; )
      V.lineIndent += 1, V.position += 1;
    for (; V.position < V.length - 1; )
      Ge(V);
    return V.documents;
  }
  function ct(f, j, V) {
    j !== null && typeof j == "object" && typeof V > "u" && (V = j, j = null);
    var se = pt(f, V);
    if (typeof j != "function")
      return se;
    for (var X = 0, ne = se.length; X < ne; X += 1)
      j(se[X]);
  }
  function at(f, j) {
    var V = pt(f, j);
    if (V.length !== 0) {
      if (V.length === 1)
        return V[0];
      throw new t("expected a single document in the stream, but found more");
    }
  }
  return nn.loadAll = ct, nn.load = at, nn;
}
var Ni = {}, Na;
function ad() {
  if (Na) return Ni;
  Na = 1;
  var e = $r(), t = qr(), l = Us(), s = Object.prototype.toString, d = Object.prototype.hasOwnProperty, u = 65279, n = 9, h = 10, r = 13, c = 32, o = 33, i = 34, a = 35, p = 37, g = 38, v = 39, m = 42, w = 44, R = 45, C = 58, D = 61, P = 62, F = 63, O = 64, L = 91, S = 93, z = 96, G = 123, $ = 124, H = 125, x = {};
  x[0] = "\\0", x[7] = "\\a", x[8] = "\\b", x[9] = "\\t", x[10] = "\\n", x[11] = "\\v", x[12] = "\\f", x[13] = "\\r", x[27] = "\\e", x[34] = '\\"', x[92] = "\\\\", x[133] = "\\N", x[160] = "\\_", x[8232] = "\\L", x[8233] = "\\P";
  var b = [
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
  ], I = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
  function A(_, q) {
    var J, K, Q, oe, re, le, me;
    if (q === null) return {};
    for (J = {}, K = Object.keys(q), Q = 0, oe = K.length; Q < oe; Q += 1)
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
      throw new t("code point within a string may not be greater than 0xFFFFFFFF");
    return "\\" + J + e.repeat("0", K - q.length) + q;
  }
  var M = 1, W = 2;
  function ie(_) {
    this.schema = _.schema || l, this.indent = Math.max(1, _.indent || 2), this.noArrayIndent = _.noArrayIndent || !1, this.skipInvalid = _.skipInvalid || !1, this.flowLevel = e.isNothing(_.flowLevel) ? -1 : _.flowLevel, this.styleMap = A(this.schema, _.styles || null), this.sortKeys = _.sortKeys || !1, this.lineWidth = _.lineWidth || 80, this.noRefs = _.noRefs || !1, this.noCompatMode = _.noCompatMode || !1, this.condenseFlow = _.condenseFlow || !1, this.quotingType = _.quotingType === '"' ? W : M, this.forceQuotes = _.forceQuotes || !1, this.replacer = typeof _.replacer == "function" ? _.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
  }
  function te(_, q) {
    for (var J = e.repeat(" ", q), K = 0, Q = -1, oe = "", re, le = _.length; K < le; )
      Q = _.indexOf(`
`, K), Q === -1 ? (re = _.slice(K), K = le) : (re = _.slice(K, Q + 1), K = Q + 1), re.length && re !== `
` && (oe += J), oe += re;
    return oe;
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
    return _ === c || _ === n;
  }
  function pe(_) {
    return 32 <= _ && _ <= 126 || 161 <= _ && _ <= 55295 && _ !== 8232 && _ !== 8233 || 57344 <= _ && _ <= 65533 && _ !== u || 65536 <= _ && _ <= 1114111;
  }
  function E(_) {
    return pe(_) && _ !== u && _ !== r && _ !== h;
  }
  function y(_, q, J) {
    var K = E(_), Q = K && !Y(_);
    return (
      // ns-plain-safe
      (J ? (
        // c = flow-in
        K
      ) : K && _ !== w && _ !== L && _ !== S && _ !== G && _ !== H) && _ !== a && !(q === C && !Q) || E(q) && !Y(q) && _ === a || q === C && Q
    );
  }
  function B(_) {
    return pe(_) && _ !== u && !Y(_) && _ !== R && _ !== F && _ !== C && _ !== w && _ !== L && _ !== S && _ !== G && _ !== H && _ !== a && _ !== g && _ !== m && _ !== o && _ !== $ && _ !== D && _ !== P && _ !== v && _ !== i && _ !== p && _ !== O && _ !== z;
  }
  function N(_) {
    return !Y(_) && _ !== C;
  }
  function fe(_, q) {
    var J = _.charCodeAt(q), K;
    return J >= 55296 && J <= 56319 && q + 1 < _.length && (K = _.charCodeAt(q + 1), K >= 56320 && K <= 57343) ? (J - 55296) * 1024 + K - 56320 + 65536 : J;
  }
  function ye(_) {
    var q = /^\n* /;
    return q.test(_);
  }
  var ve = 1, Se = 2, we = 3, ze = 4, Te = 5;
  function Ge(_, q, J, K, Q, oe, re, le) {
    var me, _e = 0, Ie = null, xe = !1, Pe = !1, Ht = K !== -1, rt = -1, Tt = B(fe(_, 0)) && N(fe(_, _.length - 1));
    if (q || re)
      for (me = 0; me < _.length; _e >= 65536 ? me += 2 : me++) {
        if (_e = fe(_, me), !pe(_e))
          return Te;
        Tt = Tt && y(_e, Ie, le), Ie = _e;
      }
    else {
      for (me = 0; me < _.length; _e >= 65536 ? me += 2 : me++) {
        if (_e = fe(_, me), _e === h)
          xe = !0, Ht && (Pe = Pe || // Foldable line = too long, and not more-indented.
          me - rt - 1 > K && _[rt + 1] !== " ", rt = me);
        else if (!pe(_e))
          return Te;
        Tt = Tt && y(_e, Ie, le), Ie = _e;
      }
      Pe = Pe || Ht && me - rt - 1 > K && _[rt + 1] !== " ";
    }
    return !xe && !Pe ? Tt && !re && !Q(_) ? ve : oe === W ? Te : Se : J > 9 && ye(_) ? Te : re ? oe === W ? Te : Se : Pe ? ze : we;
  }
  function pt(_, q, J, K, Q) {
    _.dump = (function() {
      if (q.length === 0)
        return _.quotingType === W ? '""' : "''";
      if (!_.noCompatMode && (b.indexOf(q) !== -1 || I.test(q)))
        return _.quotingType === W ? '"' + q + '"' : "'" + q + "'";
      var oe = _.indent * Math.max(1, J), re = _.lineWidth === -1 ? -1 : Math.max(Math.min(_.lineWidth, 40), _.lineWidth - oe), le = K || _.flowLevel > -1 && J >= _.flowLevel;
      function me(_e) {
        return he(_, _e);
      }
      switch (Ge(
        q,
        le,
        _.indent,
        re,
        me,
        _.quotingType,
        _.forceQuotes && !K,
        Q
      )) {
        case ve:
          return q;
        case Se:
          return "'" + q.replace(/'/g, "''") + "'";
        case we:
          return "|" + ct(q, _.indent) + at(te(q, oe));
        case ze:
          return ">" + ct(q, _.indent) + at(te(f(q, re), oe));
        case Te:
          return '"' + V(q) + '"';
        default:
          throw new t("impossible error: invalid scalar style");
      }
    })();
  }
  function ct(_, q) {
    var J = ye(_) ? String(q) : "", K = _[_.length - 1] === `
`, Q = K && (_[_.length - 2] === `
` || _ === `
`), oe = Q ? "+" : K ? "" : "-";
    return J + oe + `
`;
  }
  function at(_) {
    return _[_.length - 1] === `
` ? _.slice(0, -1) : _;
  }
  function f(_, q) {
    for (var J = /(\n+)([^\n]*)/g, K = (function() {
      var _e = _.indexOf(`
`);
      return _e = _e !== -1 ? _e : _.length, J.lastIndex = _e, j(_.slice(0, _e), q);
    })(), Q = _[0] === `
` || _[0] === " ", oe, re; re = J.exec(_); ) {
      var le = re[1], me = re[2];
      oe = me[0] === " ", K += le + (!Q && !oe && me !== "" ? `
` : "") + j(me, q), Q = oe;
    }
    return K;
  }
  function j(_, q) {
    if (_ === "" || _[0] === " ") return _;
    for (var J = / [^ ]/g, K, Q = 0, oe, re = 0, le = 0, me = ""; K = J.exec(_); )
      le = K.index, le - Q > q && (oe = re > Q ? re : le, me += `
` + _.slice(Q, oe), Q = oe + 1), re = le;
    return me += `
`, _.length - Q > q && re > Q ? me += _.slice(Q, re) + `
` + _.slice(re + 1) : me += _.slice(Q), me.slice(1);
  }
  function V(_) {
    for (var q = "", J = 0, K, Q = 0; Q < _.length; J >= 65536 ? Q += 2 : Q++)
      J = fe(_, Q), K = x[J], !K && pe(J) ? (q += _[Q], J >= 65536 && (q += _[Q + 1])) : q += K || k(J);
    return q;
  }
  function se(_, q, J) {
    var K = "", Q = _.tag, oe, re, le;
    for (oe = 0, re = J.length; oe < re; oe += 1)
      le = J[oe], _.replacer && (le = _.replacer.call(J, String(oe), le)), (ue(_, q, le, !1, !1) || typeof le > "u" && ue(_, q, null, !1, !1)) && (K !== "" && (K += "," + (_.condenseFlow ? "" : " ")), K += _.dump);
    _.tag = Q, _.dump = "[" + K + "]";
  }
  function X(_, q, J, K) {
    var Q = "", oe = _.tag, re, le, me;
    for (re = 0, le = J.length; re < le; re += 1)
      me = J[re], _.replacer && (me = _.replacer.call(J, String(re), me)), (ue(_, q + 1, me, !0, !0, !1, !0) || typeof me > "u" && ue(_, q + 1, null, !0, !0, !1, !0)) && ((!K || Q !== "") && (Q += de(_, q)), _.dump && h === _.dump.charCodeAt(0) ? Q += "-" : Q += "- ", Q += _.dump);
    _.tag = oe, _.dump = Q || "[]";
  }
  function ne(_, q, J) {
    var K = "", Q = _.tag, oe = Object.keys(J), re, le, me, _e, Ie;
    for (re = 0, le = oe.length; re < le; re += 1)
      Ie = "", K !== "" && (Ie += ", "), _.condenseFlow && (Ie += '"'), me = oe[re], _e = J[me], _.replacer && (_e = _.replacer.call(J, me, _e)), ue(_, q, me, !1, !1) && (_.dump.length > 1024 && (Ie += "? "), Ie += _.dump + (_.condenseFlow ? '"' : "") + ":" + (_.condenseFlow ? "" : " "), ue(_, q, _e, !1, !1) && (Ie += _.dump, K += Ie));
    _.tag = Q, _.dump = "{" + K + "}";
  }
  function ee(_, q, J, K) {
    var Q = "", oe = _.tag, re = Object.keys(J), le, me, _e, Ie, xe, Pe;
    if (_.sortKeys === !0)
      re.sort();
    else if (typeof _.sortKeys == "function")
      re.sort(_.sortKeys);
    else if (_.sortKeys)
      throw new t("sortKeys must be a boolean or a function");
    for (le = 0, me = re.length; le < me; le += 1)
      Pe = "", (!K || Q !== "") && (Pe += de(_, q)), _e = re[le], Ie = J[_e], _.replacer && (Ie = _.replacer.call(J, _e, Ie)), ue(_, q + 1, _e, !0, !0, !0) && (xe = _.tag !== null && _.tag !== "?" || _.dump && _.dump.length > 1024, xe && (_.dump && h === _.dump.charCodeAt(0) ? Pe += "?" : Pe += "? "), Pe += _.dump, xe && (Pe += de(_, q)), ue(_, q + 1, Ie, !0, xe) && (_.dump && h === _.dump.charCodeAt(0) ? Pe += ":" : Pe += ": ", Pe += _.dump, Q += Pe));
    _.tag = oe, _.dump = Q || "{}";
  }
  function ae(_, q, J) {
    var K, Q, oe, re, le, me;
    for (Q = J ? _.explicitTypes : _.implicitTypes, oe = 0, re = Q.length; oe < re; oe += 1)
      if (le = Q[oe], (le.instanceOf || le.predicate) && (!le.instanceOf || typeof q == "object" && q instanceof le.instanceOf) && (!le.predicate || le.predicate(q))) {
        if (J ? le.multi && le.representName ? _.tag = le.representName(q) : _.tag = le.tag : _.tag = "?", le.represent) {
          if (me = _.styleMap[le.tag] || le.defaultStyle, s.call(le.represent) === "[object Function]")
            K = le.represent(q, me);
          else if (d.call(le.represent, me))
            K = le.represent[me](q, me);
          else
            throw new t("!<" + le.tag + '> tag resolver accepts not "' + me + '" style');
          _.dump = K;
        }
        return !0;
      }
    return !1;
  }
  function ue(_, q, J, K, Q, oe, re) {
    _.tag = null, _.dump = J, ae(_, J, !1) || ae(_, J, !0);
    var le = s.call(_.dump), me = K, _e;
    K && (K = _.flowLevel < 0 || _.flowLevel > q);
    var Ie = le === "[object Object]" || le === "[object Array]", xe, Pe;
    if (Ie && (xe = _.duplicates.indexOf(J), Pe = xe !== -1), (_.tag !== null && _.tag !== "?" || Pe || _.indent !== 2 && q > 0) && (Q = !1), Pe && _.usedDuplicates[xe])
      _.dump = "*ref_" + xe;
    else {
      if (Ie && Pe && !_.usedDuplicates[xe] && (_.usedDuplicates[xe] = !0), le === "[object Object]")
        K && Object.keys(_.dump).length !== 0 ? (ee(_, q, _.dump, Q), Pe && (_.dump = "&ref_" + xe + _.dump)) : (ne(_, q, _.dump), Pe && (_.dump = "&ref_" + xe + " " + _.dump));
      else if (le === "[object Array]")
        K && _.dump.length !== 0 ? (_.noArrayIndent && !re && q > 0 ? X(_, q - 1, _.dump, Q) : X(_, q, _.dump, Q), Pe && (_.dump = "&ref_" + xe + _.dump)) : (se(_, q, _.dump), Pe && (_.dump = "&ref_" + xe + " " + _.dump));
      else if (le === "[object String]")
        _.tag !== "?" && pt(_, _.dump, q, oe, me);
      else {
        if (le === "[object Undefined]")
          return !1;
        if (_.skipInvalid) return !1;
        throw new t("unacceptable kind of an object to dump " + le);
      }
      _.tag !== null && _.tag !== "?" && (_e = encodeURI(
        _.tag[0] === "!" ? _.tag.slice(1) : _.tag
      ).replace(/!/g, "%21"), _.tag[0] === "!" ? _e = "!" + _e : _e.slice(0, 18) === "tag:yaml.org,2002:" ? _e = "!!" + _e.slice(18) : _e = "!<" + _e + ">", _.dump = _e + " " + _.dump);
    }
    return !0;
  }
  function Ce(_, q) {
    var J = [], K = [], Q, oe;
    for (be(_, J, K), Q = 0, oe = K.length; Q < oe; Q += 1)
      q.duplicates.push(J[K[Q]]);
    q.usedDuplicates = new Array(oe);
  }
  function be(_, q, J) {
    var K, Q, oe;
    if (_ !== null && typeof _ == "object")
      if (Q = q.indexOf(_), Q !== -1)
        J.indexOf(Q) === -1 && J.push(Q);
      else if (q.push(_), Array.isArray(_))
        for (Q = 0, oe = _.length; Q < oe; Q += 1)
          be(_[Q], q, J);
      else
        for (K = Object.keys(_), Q = 0, oe = K.length; Q < oe; Q += 1)
          be(_[K[Q]], q, J);
  }
  function Ee(_, q) {
    q = q || {};
    var J = new ie(q);
    J.noRefs || Ce(_, J);
    var K = _;
    return J.replacer && (K = J.replacer.call({ "": K }, "", K)), ue(J, 0, K, !0, !0) ? J.dump + `
` : "";
  }
  return Ni.dump = Ee, Ni;
}
var Fa;
function ks() {
  if (Fa) return je;
  Fa = 1;
  var e = od(), t = ad();
  function l(s, d) {
    return function() {
      throw new Error("Function yaml." + s + " is removed in js-yaml 4. Use yaml." + d + " instead, which is now safe by default.");
    };
  }
  return je.Type = We(), je.Schema = Nc(), je.FAILSAFE_SCHEMA = Uc(), je.JSON_SCHEMA = Bc(), je.CORE_SCHEMA = jc(), je.DEFAULT_SCHEMA = Us(), je.load = e.load, je.loadAll = e.loadAll, je.dump = t.dump, je.YAMLException = qr(), je.types = {
    binary: Wc(),
    float: Mc(),
    map: xc(),
    null: kc(),
    pairs: zc(),
    set: Yc(),
    timestamp: Hc(),
    bool: $c(),
    int: qc(),
    merge: Gc(),
    omap: Vc(),
    seq: Lc(),
    str: Fc()
  }, je.safeLoad = l("safeLoad", "load"), je.safeLoadAll = l("safeLoadAll", "loadAll"), je.safeDump = l("safeDump", "dump"), je;
}
var ur = {}, La;
function ld() {
  if (La) return ur;
  La = 1, Object.defineProperty(ur, "__esModule", { value: !0 }), ur.Lazy = void 0;
  class e {
    constructor(l) {
      this._value = null, this.creator = l;
    }
    get hasValue() {
      return this.creator == null;
    }
    get value() {
      if (this.creator == null)
        return this._value;
      const l = this.creator();
      return this.value = l, l;
    }
    set value(l) {
      this._value = l, this.creator = null;
    }
  }
  return ur.Lazy = e, ur;
}
var sn = { exports: {} }, Fi, xa;
function gn() {
  if (xa) return Fi;
  xa = 1;
  const e = "2.0.0", t = 256, l = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, s = 16, d = t - 6;
  return Fi = {
    MAX_LENGTH: t,
    MAX_SAFE_COMPONENT_LENGTH: s,
    MAX_SAFE_BUILD_LENGTH: d,
    MAX_SAFE_INTEGER: l,
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
  }, Fi;
}
var Li, Ua;
function yn() {
  return Ua || (Ua = 1, Li = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {
  }), Li;
}
var ka;
function Mr() {
  return ka || (ka = 1, (function(e, t) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: l,
      MAX_SAFE_BUILD_LENGTH: s,
      MAX_LENGTH: d
    } = gn(), u = yn();
    t = e.exports = {};
    const n = t.re = [], h = t.safeRe = [], r = t.src = [], c = t.safeSrc = [], o = t.t = {};
    let i = 0;
    const a = "[a-zA-Z0-9-]", p = [
      ["\\s", 1],
      ["\\d", d],
      [a, s]
    ], g = (m) => {
      for (const [w, R] of p)
        m = m.split(`${w}*`).join(`${w}{0,${R}}`).split(`${w}+`).join(`${w}{1,${R}}`);
      return m;
    }, v = (m, w, R) => {
      const C = g(w), D = i++;
      u(m, D, w), o[m] = D, r[D] = w, c[D] = C, n[D] = new RegExp(w, R ? "g" : void 0), h[D] = new RegExp(C, R ? "g" : void 0);
    };
    v("NUMERICIDENTIFIER", "0|[1-9]\\d*"), v("NUMERICIDENTIFIERLOOSE", "\\d+"), v("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${a}*`), v("MAINVERSION", `(${r[o.NUMERICIDENTIFIER]})\\.(${r[o.NUMERICIDENTIFIER]})\\.(${r[o.NUMERICIDENTIFIER]})`), v("MAINVERSIONLOOSE", `(${r[o.NUMERICIDENTIFIERLOOSE]})\\.(${r[o.NUMERICIDENTIFIERLOOSE]})\\.(${r[o.NUMERICIDENTIFIERLOOSE]})`), v("PRERELEASEIDENTIFIER", `(?:${r[o.NONNUMERICIDENTIFIER]}|${r[o.NUMERICIDENTIFIER]})`), v("PRERELEASEIDENTIFIERLOOSE", `(?:${r[o.NONNUMERICIDENTIFIER]}|${r[o.NUMERICIDENTIFIERLOOSE]})`), v("PRERELEASE", `(?:-(${r[o.PRERELEASEIDENTIFIER]}(?:\\.${r[o.PRERELEASEIDENTIFIER]})*))`), v("PRERELEASELOOSE", `(?:-?(${r[o.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${r[o.PRERELEASEIDENTIFIERLOOSE]})*))`), v("BUILDIDENTIFIER", `${a}+`), v("BUILD", `(?:\\+(${r[o.BUILDIDENTIFIER]}(?:\\.${r[o.BUILDIDENTIFIER]})*))`), v("FULLPLAIN", `v?${r[o.MAINVERSION]}${r[o.PRERELEASE]}?${r[o.BUILD]}?`), v("FULL", `^${r[o.FULLPLAIN]}$`), v("LOOSEPLAIN", `[v=\\s]*${r[o.MAINVERSIONLOOSE]}${r[o.PRERELEASELOOSE]}?${r[o.BUILD]}?`), v("LOOSE", `^${r[o.LOOSEPLAIN]}$`), v("GTLT", "((?:<|>)?=?)"), v("XRANGEIDENTIFIERLOOSE", `${r[o.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), v("XRANGEIDENTIFIER", `${r[o.NUMERICIDENTIFIER]}|x|X|\\*`), v("XRANGEPLAIN", `[v=\\s]*(${r[o.XRANGEIDENTIFIER]})(?:\\.(${r[o.XRANGEIDENTIFIER]})(?:\\.(${r[o.XRANGEIDENTIFIER]})(?:${r[o.PRERELEASE]})?${r[o.BUILD]}?)?)?`), v("XRANGEPLAINLOOSE", `[v=\\s]*(${r[o.XRANGEIDENTIFIERLOOSE]})(?:\\.(${r[o.XRANGEIDENTIFIERLOOSE]})(?:\\.(${r[o.XRANGEIDENTIFIERLOOSE]})(?:${r[o.PRERELEASELOOSE]})?${r[o.BUILD]}?)?)?`), v("XRANGE", `^${r[o.GTLT]}\\s*${r[o.XRANGEPLAIN]}$`), v("XRANGELOOSE", `^${r[o.GTLT]}\\s*${r[o.XRANGEPLAINLOOSE]}$`), v("COERCEPLAIN", `(^|[^\\d])(\\d{1,${l}})(?:\\.(\\d{1,${l}}))?(?:\\.(\\d{1,${l}}))?`), v("COERCE", `${r[o.COERCEPLAIN]}(?:$|[^\\d])`), v("COERCEFULL", r[o.COERCEPLAIN] + `(?:${r[o.PRERELEASE]})?(?:${r[o.BUILD]})?(?:$|[^\\d])`), v("COERCERTL", r[o.COERCE], !0), v("COERCERTLFULL", r[o.COERCEFULL], !0), v("LONETILDE", "(?:~>?)"), v("TILDETRIM", `(\\s*)${r[o.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", v("TILDE", `^${r[o.LONETILDE]}${r[o.XRANGEPLAIN]}$`), v("TILDELOOSE", `^${r[o.LONETILDE]}${r[o.XRANGEPLAINLOOSE]}$`), v("LONECARET", "(?:\\^)"), v("CARETTRIM", `(\\s*)${r[o.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", v("CARET", `^${r[o.LONECARET]}${r[o.XRANGEPLAIN]}$`), v("CARETLOOSE", `^${r[o.LONECARET]}${r[o.XRANGEPLAINLOOSE]}$`), v("COMPARATORLOOSE", `^${r[o.GTLT]}\\s*(${r[o.LOOSEPLAIN]})$|^$`), v("COMPARATOR", `^${r[o.GTLT]}\\s*(${r[o.FULLPLAIN]})$|^$`), v("COMPARATORTRIM", `(\\s*)${r[o.GTLT]}\\s*(${r[o.LOOSEPLAIN]}|${r[o.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", v("HYPHENRANGE", `^\\s*(${r[o.XRANGEPLAIN]})\\s+-\\s+(${r[o.XRANGEPLAIN]})\\s*$`), v("HYPHENRANGELOOSE", `^\\s*(${r[o.XRANGEPLAINLOOSE]})\\s+-\\s+(${r[o.XRANGEPLAINLOOSE]})\\s*$`), v("STAR", "(<|>)?=?\\s*\\*"), v("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), v("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(sn, sn.exports)), sn.exports;
}
var xi, $a;
function $s() {
  if ($a) return xi;
  $a = 1;
  const e = Object.freeze({ loose: !0 }), t = Object.freeze({});
  return xi = (s) => s ? typeof s != "object" ? e : s : t, xi;
}
var Ui, qa;
function Xc() {
  if (qa) return Ui;
  qa = 1;
  const e = /^[0-9]+$/, t = (s, d) => {
    if (typeof s == "number" && typeof d == "number")
      return s === d ? 0 : s < d ? -1 : 1;
    const u = e.test(s), n = e.test(d);
    return u && n && (s = +s, d = +d), s === d ? 0 : u && !n ? -1 : n && !u ? 1 : s < d ? -1 : 1;
  };
  return Ui = {
    compareIdentifiers: t,
    rcompareIdentifiers: (s, d) => t(d, s)
  }, Ui;
}
var ki, Ma;
function Ve() {
  if (Ma) return ki;
  Ma = 1;
  const e = yn(), { MAX_LENGTH: t, MAX_SAFE_INTEGER: l } = gn(), { safeRe: s, t: d } = Mr(), u = $s(), { compareIdentifiers: n } = Xc();
  class h {
    constructor(c, o) {
      if (o = u(o), c instanceof h) {
        if (c.loose === !!o.loose && c.includePrerelease === !!o.includePrerelease)
          return c;
        c = c.version;
      } else if (typeof c != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof c}".`);
      if (c.length > t)
        throw new TypeError(
          `version is longer than ${t} characters`
        );
      e("SemVer", c, o), this.options = o, this.loose = !!o.loose, this.includePrerelease = !!o.includePrerelease;
      const i = c.trim().match(o.loose ? s[d.LOOSE] : s[d.FULL]);
      if (!i)
        throw new TypeError(`Invalid Version: ${c}`);
      if (this.raw = c, this.major = +i[1], this.minor = +i[2], this.patch = +i[3], this.major > l || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > l || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > l || this.patch < 0)
        throw new TypeError("Invalid patch version");
      i[4] ? this.prerelease = i[4].split(".").map((a) => {
        if (/^[0-9]+$/.test(a)) {
          const p = +a;
          if (p >= 0 && p < l)
            return p;
        }
        return a;
      }) : this.prerelease = [], this.build = i[5] ? i[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(c) {
      if (e("SemVer.compare", this.version, this.options, c), !(c instanceof h)) {
        if (typeof c == "string" && c === this.version)
          return 0;
        c = new h(c, this.options);
      }
      return c.version === this.version ? 0 : this.compareMain(c) || this.comparePre(c);
    }
    compareMain(c) {
      return c instanceof h || (c = new h(c, this.options)), this.major < c.major ? -1 : this.major > c.major ? 1 : this.minor < c.minor ? -1 : this.minor > c.minor ? 1 : this.patch < c.patch ? -1 : this.patch > c.patch ? 1 : 0;
    }
    comparePre(c) {
      if (c instanceof h || (c = new h(c, this.options)), this.prerelease.length && !c.prerelease.length)
        return -1;
      if (!this.prerelease.length && c.prerelease.length)
        return 1;
      if (!this.prerelease.length && !c.prerelease.length)
        return 0;
      let o = 0;
      do {
        const i = this.prerelease[o], a = c.prerelease[o];
        if (e("prerelease compare", o, i, a), i === void 0 && a === void 0)
          return 0;
        if (a === void 0)
          return 1;
        if (i === void 0)
          return -1;
        if (i === a)
          continue;
        return n(i, a);
      } while (++o);
    }
    compareBuild(c) {
      c instanceof h || (c = new h(c, this.options));
      let o = 0;
      do {
        const i = this.build[o], a = c.build[o];
        if (e("build compare", o, i, a), i === void 0 && a === void 0)
          return 0;
        if (a === void 0)
          return 1;
        if (i === void 0)
          return -1;
        if (i === a)
          continue;
        return n(i, a);
      } while (++o);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(c, o, i) {
      if (c.startsWith("pre")) {
        if (!o && i === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (o) {
          const a = `-${o}`.match(this.options.loose ? s[d.PRERELEASELOOSE] : s[d.PRERELEASE]);
          if (!a || a[1] !== o)
            throw new Error(`invalid identifier: ${o}`);
        }
      }
      switch (c) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", o, i);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", o, i);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", o, i), this.inc("pre", o, i);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", o, i), this.inc("pre", o, i);
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
          const a = Number(i) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [a];
          else {
            let p = this.prerelease.length;
            for (; --p >= 0; )
              typeof this.prerelease[p] == "number" && (this.prerelease[p]++, p = -2);
            if (p === -1) {
              if (o === this.prerelease.join(".") && i === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(a);
            }
          }
          if (o) {
            let p = [o, a];
            i === !1 && (p = [o]), n(this.prerelease[0], o) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = p) : this.prerelease = p;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${c}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return ki = h, ki;
}
var $i, Ba;
function nr() {
  if (Ba) return $i;
  Ba = 1;
  const e = Ve();
  return $i = (l, s, d = !1) => {
    if (l instanceof e)
      return l;
    try {
      return new e(l, s);
    } catch (u) {
      if (!d)
        return null;
      throw u;
    }
  }, $i;
}
var qi, ja;
function cd() {
  if (ja) return qi;
  ja = 1;
  const e = nr();
  return qi = (l, s) => {
    const d = e(l, s);
    return d ? d.version : null;
  }, qi;
}
var Mi, Ha;
function ud() {
  if (Ha) return Mi;
  Ha = 1;
  const e = nr();
  return Mi = (l, s) => {
    const d = e(l.trim().replace(/^[=v]+/, ""), s);
    return d ? d.version : null;
  }, Mi;
}
var Bi, Ga;
function fd() {
  if (Ga) return Bi;
  Ga = 1;
  const e = Ve();
  return Bi = (l, s, d, u, n) => {
    typeof d == "string" && (n = u, u = d, d = void 0);
    try {
      return new e(
        l instanceof e ? l.version : l,
        d
      ).inc(s, u, n).version;
    } catch {
      return null;
    }
  }, Bi;
}
var ji, Wa;
function dd() {
  if (Wa) return ji;
  Wa = 1;
  const e = nr();
  return ji = (l, s) => {
    const d = e(l, null, !0), u = e(s, null, !0), n = d.compare(u);
    if (n === 0)
      return null;
    const h = n > 0, r = h ? d : u, c = h ? u : d, o = !!r.prerelease.length;
    if (!!c.prerelease.length && !o) {
      if (!c.patch && !c.minor)
        return "major";
      if (c.compareMain(r) === 0)
        return c.minor && !c.patch ? "minor" : "patch";
    }
    const a = o ? "pre" : "";
    return d.major !== u.major ? a + "major" : d.minor !== u.minor ? a + "minor" : d.patch !== u.patch ? a + "patch" : "prerelease";
  }, ji;
}
var Hi, Va;
function hd() {
  if (Va) return Hi;
  Va = 1;
  const e = Ve();
  return Hi = (l, s) => new e(l, s).major, Hi;
}
var Gi, za;
function pd() {
  if (za) return Gi;
  za = 1;
  const e = Ve();
  return Gi = (l, s) => new e(l, s).minor, Gi;
}
var Wi, Ya;
function md() {
  if (Ya) return Wi;
  Ya = 1;
  const e = Ve();
  return Wi = (l, s) => new e(l, s).patch, Wi;
}
var Vi, Xa;
function gd() {
  if (Xa) return Vi;
  Xa = 1;
  const e = nr();
  return Vi = (l, s) => {
    const d = e(l, s);
    return d && d.prerelease.length ? d.prerelease : null;
  }, Vi;
}
var zi, Ja;
function st() {
  if (Ja) return zi;
  Ja = 1;
  const e = Ve();
  return zi = (l, s, d) => new e(l, d).compare(new e(s, d)), zi;
}
var Yi, Ka;
function yd() {
  if (Ka) return Yi;
  Ka = 1;
  const e = st();
  return Yi = (l, s, d) => e(s, l, d), Yi;
}
var Xi, Qa;
function vd() {
  if (Qa) return Xi;
  Qa = 1;
  const e = st();
  return Xi = (l, s) => e(l, s, !0), Xi;
}
var Ji, Za;
function qs() {
  if (Za) return Ji;
  Za = 1;
  const e = Ve();
  return Ji = (l, s, d) => {
    const u = new e(l, d), n = new e(s, d);
    return u.compare(n) || u.compareBuild(n);
  }, Ji;
}
var Ki, el;
function Ed() {
  if (el) return Ki;
  el = 1;
  const e = qs();
  return Ki = (l, s) => l.sort((d, u) => e(d, u, s)), Ki;
}
var Qi, tl;
function wd() {
  if (tl) return Qi;
  tl = 1;
  const e = qs();
  return Qi = (l, s) => l.sort((d, u) => e(u, d, s)), Qi;
}
var Zi, rl;
function vn() {
  if (rl) return Zi;
  rl = 1;
  const e = st();
  return Zi = (l, s, d) => e(l, s, d) > 0, Zi;
}
var es, nl;
function Ms() {
  if (nl) return es;
  nl = 1;
  const e = st();
  return es = (l, s, d) => e(l, s, d) < 0, es;
}
var ts, il;
function Jc() {
  if (il) return ts;
  il = 1;
  const e = st();
  return ts = (l, s, d) => e(l, s, d) === 0, ts;
}
var rs, sl;
function Kc() {
  if (sl) return rs;
  sl = 1;
  const e = st();
  return rs = (l, s, d) => e(l, s, d) !== 0, rs;
}
var ns, ol;
function Bs() {
  if (ol) return ns;
  ol = 1;
  const e = st();
  return ns = (l, s, d) => e(l, s, d) >= 0, ns;
}
var is, al;
function js() {
  if (al) return is;
  al = 1;
  const e = st();
  return is = (l, s, d) => e(l, s, d) <= 0, is;
}
var ss, ll;
function Qc() {
  if (ll) return ss;
  ll = 1;
  const e = Jc(), t = Kc(), l = vn(), s = Bs(), d = Ms(), u = js();
  return ss = (h, r, c, o) => {
    switch (r) {
      case "===":
        return typeof h == "object" && (h = h.version), typeof c == "object" && (c = c.version), h === c;
      case "!==":
        return typeof h == "object" && (h = h.version), typeof c == "object" && (c = c.version), h !== c;
      case "":
      case "=":
      case "==":
        return e(h, c, o);
      case "!=":
        return t(h, c, o);
      case ">":
        return l(h, c, o);
      case ">=":
        return s(h, c, o);
      case "<":
        return d(h, c, o);
      case "<=":
        return u(h, c, o);
      default:
        throw new TypeError(`Invalid operator: ${r}`);
    }
  }, ss;
}
var os, cl;
function _d() {
  if (cl) return os;
  cl = 1;
  const e = Ve(), t = nr(), { safeRe: l, t: s } = Mr();
  return os = (u, n) => {
    if (u instanceof e)
      return u;
    if (typeof u == "number" && (u = String(u)), typeof u != "string")
      return null;
    n = n || {};
    let h = null;
    if (!n.rtl)
      h = u.match(n.includePrerelease ? l[s.COERCEFULL] : l[s.COERCE]);
    else {
      const p = n.includePrerelease ? l[s.COERCERTLFULL] : l[s.COERCERTL];
      let g;
      for (; (g = p.exec(u)) && (!h || h.index + h[0].length !== u.length); )
        (!h || g.index + g[0].length !== h.index + h[0].length) && (h = g), p.lastIndex = g.index + g[1].length + g[2].length;
      p.lastIndex = -1;
    }
    if (h === null)
      return null;
    const r = h[2], c = h[3] || "0", o = h[4] || "0", i = n.includePrerelease && h[5] ? `-${h[5]}` : "", a = n.includePrerelease && h[6] ? `+${h[6]}` : "";
    return t(`${r}.${c}.${o}${i}${a}`, n);
  }, os;
}
var as, ul;
function Sd() {
  if (ul) return as;
  ul = 1;
  class e {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(l) {
      const s = this.map.get(l);
      if (s !== void 0)
        return this.map.delete(l), this.map.set(l, s), s;
    }
    delete(l) {
      return this.map.delete(l);
    }
    set(l, s) {
      if (!this.delete(l) && s !== void 0) {
        if (this.map.size >= this.max) {
          const u = this.map.keys().next().value;
          this.delete(u);
        }
        this.map.set(l, s);
      }
      return this;
    }
  }
  return as = e, as;
}
var ls, fl;
function ot() {
  if (fl) return ls;
  fl = 1;
  const e = /\s+/g;
  class t {
    constructor(b, I) {
      if (I = d(I), b instanceof t)
        return b.loose === !!I.loose && b.includePrerelease === !!I.includePrerelease ? b : new t(b.raw, I);
      if (b instanceof u)
        return this.raw = b.value, this.set = [[b]], this.formatted = void 0, this;
      if (this.options = I, this.loose = !!I.loose, this.includePrerelease = !!I.includePrerelease, this.raw = b.trim().replace(e, " "), this.set = this.raw.split("||").map((A) => this.parseRange(A.trim())).filter((A) => A.length), !this.set.length)
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
        for (let b = 0; b < this.set.length; b++) {
          b > 0 && (this.formatted += "||");
          const I = this.set[b];
          for (let A = 0; A < I.length; A++)
            A > 0 && (this.formatted += " "), this.formatted += I[A].toString().trim();
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
    parseRange(b) {
      const A = ((this.options.includePrerelease && p) | (this.options.loose && g)) + ":" + b, k = s.get(A);
      if (k)
        return k;
      const M = this.options.loose, W = M ? r[c.HYPHENRANGELOOSE] : r[c.HYPHENRANGE];
      b = b.replace(W, $(this.options.includePrerelease)), n("hyphen replace", b), b = b.replace(r[c.COMPARATORTRIM], o), n("comparator trim", b), b = b.replace(r[c.TILDETRIM], i), n("tilde trim", b), b = b.replace(r[c.CARETTRIM], a), n("caret trim", b);
      let ie = b.split(" ").map((Y) => R(Y, this.options)).join(" ").split(/\s+/).map((Y) => G(Y, this.options));
      M && (ie = ie.filter((Y) => (n("loose invalid filter", Y, this.options), !!Y.match(r[c.COMPARATORLOOSE])))), n("range list", ie);
      const te = /* @__PURE__ */ new Map(), de = ie.map((Y) => new u(Y, this.options));
      for (const Y of de) {
        if (v(Y))
          return [Y];
        te.set(Y.value, Y);
      }
      te.size > 1 && te.has("") && te.delete("");
      const he = [...te.values()];
      return s.set(A, he), he;
    }
    intersects(b, I) {
      if (!(b instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((A) => w(A, I) && b.set.some((k) => w(k, I) && A.every((M) => k.every((W) => M.intersects(W, I)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(b) {
      if (!b)
        return !1;
      if (typeof b == "string")
        try {
          b = new h(b, this.options);
        } catch {
          return !1;
        }
      for (let I = 0; I < this.set.length; I++)
        if (H(this.set[I], b, this.options))
          return !0;
      return !1;
    }
  }
  ls = t;
  const l = Sd(), s = new l(), d = $s(), u = En(), n = yn(), h = Ve(), {
    safeRe: r,
    t: c,
    comparatorTrimReplace: o,
    tildeTrimReplace: i,
    caretTrimReplace: a
  } = Mr(), { FLAG_INCLUDE_PRERELEASE: p, FLAG_LOOSE: g } = gn(), v = (x) => x.value === "<0.0.0-0", m = (x) => x.value === "", w = (x, b) => {
    let I = !0;
    const A = x.slice();
    let k = A.pop();
    for (; I && A.length; )
      I = A.every((M) => k.intersects(M, b)), k = A.pop();
    return I;
  }, R = (x, b) => (x = x.replace(r[c.BUILD], ""), n("comp", x, b), x = F(x, b), n("caret", x), x = D(x, b), n("tildes", x), x = L(x, b), n("xrange", x), x = z(x, b), n("stars", x), x), C = (x) => !x || x.toLowerCase() === "x" || x === "*", D = (x, b) => x.trim().split(/\s+/).map((I) => P(I, b)).join(" "), P = (x, b) => {
    const I = b.loose ? r[c.TILDELOOSE] : r[c.TILDE];
    return x.replace(I, (A, k, M, W, ie) => {
      n("tilde", x, A, k, M, W, ie);
      let te;
      return C(k) ? te = "" : C(M) ? te = `>=${k}.0.0 <${+k + 1}.0.0-0` : C(W) ? te = `>=${k}.${M}.0 <${k}.${+M + 1}.0-0` : ie ? (n("replaceTilde pr", ie), te = `>=${k}.${M}.${W}-${ie} <${k}.${+M + 1}.0-0`) : te = `>=${k}.${M}.${W} <${k}.${+M + 1}.0-0`, n("tilde return", te), te;
    });
  }, F = (x, b) => x.trim().split(/\s+/).map((I) => O(I, b)).join(" "), O = (x, b) => {
    n("caret", x, b);
    const I = b.loose ? r[c.CARETLOOSE] : r[c.CARET], A = b.includePrerelease ? "-0" : "";
    return x.replace(I, (k, M, W, ie, te) => {
      n("caret", x, k, M, W, ie, te);
      let de;
      return C(M) ? de = "" : C(W) ? de = `>=${M}.0.0${A} <${+M + 1}.0.0-0` : C(ie) ? M === "0" ? de = `>=${M}.${W}.0${A} <${M}.${+W + 1}.0-0` : de = `>=${M}.${W}.0${A} <${+M + 1}.0.0-0` : te ? (n("replaceCaret pr", te), M === "0" ? W === "0" ? de = `>=${M}.${W}.${ie}-${te} <${M}.${W}.${+ie + 1}-0` : de = `>=${M}.${W}.${ie}-${te} <${M}.${+W + 1}.0-0` : de = `>=${M}.${W}.${ie}-${te} <${+M + 1}.0.0-0`) : (n("no pr"), M === "0" ? W === "0" ? de = `>=${M}.${W}.${ie}${A} <${M}.${W}.${+ie + 1}-0` : de = `>=${M}.${W}.${ie}${A} <${M}.${+W + 1}.0-0` : de = `>=${M}.${W}.${ie} <${+M + 1}.0.0-0`), n("caret return", de), de;
    });
  }, L = (x, b) => (n("replaceXRanges", x, b), x.split(/\s+/).map((I) => S(I, b)).join(" ")), S = (x, b) => {
    x = x.trim();
    const I = b.loose ? r[c.XRANGELOOSE] : r[c.XRANGE];
    return x.replace(I, (A, k, M, W, ie, te) => {
      n("xRange", x, A, k, M, W, ie, te);
      const de = C(M), he = de || C(W), Y = he || C(ie), pe = Y;
      return k === "=" && pe && (k = ""), te = b.includePrerelease ? "-0" : "", de ? k === ">" || k === "<" ? A = "<0.0.0-0" : A = "*" : k && pe ? (he && (W = 0), ie = 0, k === ">" ? (k = ">=", he ? (M = +M + 1, W = 0, ie = 0) : (W = +W + 1, ie = 0)) : k === "<=" && (k = "<", he ? M = +M + 1 : W = +W + 1), k === "<" && (te = "-0"), A = `${k + M}.${W}.${ie}${te}`) : he ? A = `>=${M}.0.0${te} <${+M + 1}.0.0-0` : Y && (A = `>=${M}.${W}.0${te} <${M}.${+W + 1}.0-0`), n("xRange return", A), A;
    });
  }, z = (x, b) => (n("replaceStars", x, b), x.trim().replace(r[c.STAR], "")), G = (x, b) => (n("replaceGTE0", x, b), x.trim().replace(r[b.includePrerelease ? c.GTE0PRE : c.GTE0], "")), $ = (x) => (b, I, A, k, M, W, ie, te, de, he, Y, pe) => (C(A) ? I = "" : C(k) ? I = `>=${A}.0.0${x ? "-0" : ""}` : C(M) ? I = `>=${A}.${k}.0${x ? "-0" : ""}` : W ? I = `>=${I}` : I = `>=${I}${x ? "-0" : ""}`, C(de) ? te = "" : C(he) ? te = `<${+de + 1}.0.0-0` : C(Y) ? te = `<${de}.${+he + 1}.0-0` : pe ? te = `<=${de}.${he}.${Y}-${pe}` : x ? te = `<${de}.${he}.${+Y + 1}-0` : te = `<=${te}`, `${I} ${te}`.trim()), H = (x, b, I) => {
    for (let A = 0; A < x.length; A++)
      if (!x[A].test(b))
        return !1;
    if (b.prerelease.length && !I.includePrerelease) {
      for (let A = 0; A < x.length; A++)
        if (n(x[A].semver), x[A].semver !== u.ANY && x[A].semver.prerelease.length > 0) {
          const k = x[A].semver;
          if (k.major === b.major && k.minor === b.minor && k.patch === b.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return ls;
}
var cs, dl;
function En() {
  if (dl) return cs;
  dl = 1;
  const e = /* @__PURE__ */ Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(o, i) {
      if (i = l(i), o instanceof t) {
        if (o.loose === !!i.loose)
          return o;
        o = o.value;
      }
      o = o.trim().split(/\s+/).join(" "), n("comparator", o, i), this.options = i, this.loose = !!i.loose, this.parse(o), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, n("comp", this);
    }
    parse(o) {
      const i = this.options.loose ? s[d.COMPARATORLOOSE] : s[d.COMPARATOR], a = o.match(i);
      if (!a)
        throw new TypeError(`Invalid comparator: ${o}`);
      this.operator = a[1] !== void 0 ? a[1] : "", this.operator === "=" && (this.operator = ""), a[2] ? this.semver = new h(a[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(o) {
      if (n("Comparator.test", o, this.options.loose), this.semver === e || o === e)
        return !0;
      if (typeof o == "string")
        try {
          o = new h(o, this.options);
        } catch {
          return !1;
        }
      return u(o, this.operator, this.semver, this.options);
    }
    intersects(o, i) {
      if (!(o instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new r(o.value, i).test(this.value) : o.operator === "" ? o.value === "" ? !0 : new r(this.value, i).test(o.semver) : (i = l(i), i.includePrerelease && (this.value === "<0.0.0-0" || o.value === "<0.0.0-0") || !i.includePrerelease && (this.value.startsWith("<0.0.0") || o.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && o.operator.startsWith(">") || this.operator.startsWith("<") && o.operator.startsWith("<") || this.semver.version === o.semver.version && this.operator.includes("=") && o.operator.includes("=") || u(this.semver, "<", o.semver, i) && this.operator.startsWith(">") && o.operator.startsWith("<") || u(this.semver, ">", o.semver, i) && this.operator.startsWith("<") && o.operator.startsWith(">")));
    }
  }
  cs = t;
  const l = $s(), { safeRe: s, t: d } = Mr(), u = Qc(), n = yn(), h = Ve(), r = ot();
  return cs;
}
var us, hl;
function wn() {
  if (hl) return us;
  hl = 1;
  const e = ot();
  return us = (l, s, d) => {
    try {
      s = new e(s, d);
    } catch {
      return !1;
    }
    return s.test(l);
  }, us;
}
var fs, pl;
function Ad() {
  if (pl) return fs;
  pl = 1;
  const e = ot();
  return fs = (l, s) => new e(l, s).set.map((d) => d.map((u) => u.value).join(" ").trim().split(" ")), fs;
}
var ds, ml;
function Rd() {
  if (ml) return ds;
  ml = 1;
  const e = Ve(), t = ot();
  return ds = (s, d, u) => {
    let n = null, h = null, r = null;
    try {
      r = new t(d, u);
    } catch {
      return null;
    }
    return s.forEach((c) => {
      r.test(c) && (!n || h.compare(c) === -1) && (n = c, h = new e(n, u));
    }), n;
  }, ds;
}
var hs, gl;
function Td() {
  if (gl) return hs;
  gl = 1;
  const e = Ve(), t = ot();
  return hs = (s, d, u) => {
    let n = null, h = null, r = null;
    try {
      r = new t(d, u);
    } catch {
      return null;
    }
    return s.forEach((c) => {
      r.test(c) && (!n || h.compare(c) === 1) && (n = c, h = new e(n, u));
    }), n;
  }, hs;
}
var ps, yl;
function Cd() {
  if (yl) return ps;
  yl = 1;
  const e = Ve(), t = ot(), l = vn();
  return ps = (d, u) => {
    d = new t(d, u);
    let n = new e("0.0.0");
    if (d.test(n) || (n = new e("0.0.0-0"), d.test(n)))
      return n;
    n = null;
    for (let h = 0; h < d.set.length; ++h) {
      const r = d.set[h];
      let c = null;
      r.forEach((o) => {
        const i = new e(o.semver.version);
        switch (o.operator) {
          case ">":
            i.prerelease.length === 0 ? i.patch++ : i.prerelease.push(0), i.raw = i.format();
          /* fallthrough */
          case "":
          case ">=":
            (!c || l(i, c)) && (c = i);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${o.operator}`);
        }
      }), c && (!n || l(n, c)) && (n = c);
    }
    return n && d.test(n) ? n : null;
  }, ps;
}
var ms, vl;
function bd() {
  if (vl) return ms;
  vl = 1;
  const e = ot();
  return ms = (l, s) => {
    try {
      return new e(l, s).range || "*";
    } catch {
      return null;
    }
  }, ms;
}
var gs, El;
function Hs() {
  if (El) return gs;
  El = 1;
  const e = Ve(), t = En(), { ANY: l } = t, s = ot(), d = wn(), u = vn(), n = Ms(), h = js(), r = Bs();
  return gs = (o, i, a, p) => {
    o = new e(o, p), i = new s(i, p);
    let g, v, m, w, R;
    switch (a) {
      case ">":
        g = u, v = h, m = n, w = ">", R = ">=";
        break;
      case "<":
        g = n, v = r, m = u, w = "<", R = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (d(o, i, p))
      return !1;
    for (let C = 0; C < i.set.length; ++C) {
      const D = i.set[C];
      let P = null, F = null;
      if (D.forEach((O) => {
        O.semver === l && (O = new t(">=0.0.0")), P = P || O, F = F || O, g(O.semver, P.semver, p) ? P = O : m(O.semver, F.semver, p) && (F = O);
      }), P.operator === w || P.operator === R || (!F.operator || F.operator === w) && v(o, F.semver))
        return !1;
      if (F.operator === R && m(o, F.semver))
        return !1;
    }
    return !0;
  }, gs;
}
var ys, wl;
function Pd() {
  if (wl) return ys;
  wl = 1;
  const e = Hs();
  return ys = (l, s, d) => e(l, s, ">", d), ys;
}
var vs, _l;
function Od() {
  if (_l) return vs;
  _l = 1;
  const e = Hs();
  return vs = (l, s, d) => e(l, s, "<", d), vs;
}
var Es, Sl;
function Id() {
  if (Sl) return Es;
  Sl = 1;
  const e = ot();
  return Es = (l, s, d) => (l = new e(l, d), s = new e(s, d), l.intersects(s, d)), Es;
}
var ws, Al;
function Dd() {
  if (Al) return ws;
  Al = 1;
  const e = wn(), t = st();
  return ws = (l, s, d) => {
    const u = [];
    let n = null, h = null;
    const r = l.sort((a, p) => t(a, p, d));
    for (const a of r)
      e(a, s, d) ? (h = a, n || (n = a)) : (h && u.push([n, h]), h = null, n = null);
    n && u.push([n, null]);
    const c = [];
    for (const [a, p] of u)
      a === p ? c.push(a) : !p && a === r[0] ? c.push("*") : p ? a === r[0] ? c.push(`<=${p}`) : c.push(`${a} - ${p}`) : c.push(`>=${a}`);
    const o = c.join(" || "), i = typeof s.raw == "string" ? s.raw : String(s);
    return o.length < i.length ? o : s;
  }, ws;
}
var _s, Rl;
function Nd() {
  if (Rl) return _s;
  Rl = 1;
  const e = ot(), t = En(), { ANY: l } = t, s = wn(), d = st(), u = (i, a, p = {}) => {
    if (i === a)
      return !0;
    i = new e(i, p), a = new e(a, p);
    let g = !1;
    e: for (const v of i.set) {
      for (const m of a.set) {
        const w = r(v, m, p);
        if (g = g || w !== null, w)
          continue e;
      }
      if (g)
        return !1;
    }
    return !0;
  }, n = [new t(">=0.0.0-0")], h = [new t(">=0.0.0")], r = (i, a, p) => {
    if (i === a)
      return !0;
    if (i.length === 1 && i[0].semver === l) {
      if (a.length === 1 && a[0].semver === l)
        return !0;
      p.includePrerelease ? i = n : i = h;
    }
    if (a.length === 1 && a[0].semver === l) {
      if (p.includePrerelease)
        return !0;
      a = h;
    }
    const g = /* @__PURE__ */ new Set();
    let v, m;
    for (const L of i)
      L.operator === ">" || L.operator === ">=" ? v = c(v, L, p) : L.operator === "<" || L.operator === "<=" ? m = o(m, L, p) : g.add(L.semver);
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
      if (v && !s(L, String(v), p) || m && !s(L, String(m), p))
        return null;
      for (const S of a)
        if (!s(L, String(S), p))
          return !1;
      return !0;
    }
    let R, C, D, P, F = m && !p.includePrerelease && m.semver.prerelease.length ? m.semver : !1, O = v && !p.includePrerelease && v.semver.prerelease.length ? v.semver : !1;
    F && F.prerelease.length === 1 && m.operator === "<" && F.prerelease[0] === 0 && (F = !1);
    for (const L of a) {
      if (P = P || L.operator === ">" || L.operator === ">=", D = D || L.operator === "<" || L.operator === "<=", v) {
        if (O && L.semver.prerelease && L.semver.prerelease.length && L.semver.major === O.major && L.semver.minor === O.minor && L.semver.patch === O.patch && (O = !1), L.operator === ">" || L.operator === ">=") {
          if (R = c(v, L, p), R === L && R !== v)
            return !1;
        } else if (v.operator === ">=" && !s(v.semver, String(L), p))
          return !1;
      }
      if (m) {
        if (F && L.semver.prerelease && L.semver.prerelease.length && L.semver.major === F.major && L.semver.minor === F.minor && L.semver.patch === F.patch && (F = !1), L.operator === "<" || L.operator === "<=") {
          if (C = o(m, L, p), C === L && C !== m)
            return !1;
        } else if (m.operator === "<=" && !s(m.semver, String(L), p))
          return !1;
      }
      if (!L.operator && (m || v) && w !== 0)
        return !1;
    }
    return !(v && D && !m && w !== 0 || m && P && !v && w !== 0 || O || F);
  }, c = (i, a, p) => {
    if (!i)
      return a;
    const g = d(i.semver, a.semver, p);
    return g > 0 ? i : g < 0 || a.operator === ">" && i.operator === ">=" ? a : i;
  }, o = (i, a, p) => {
    if (!i)
      return a;
    const g = d(i.semver, a.semver, p);
    return g < 0 ? i : g > 0 || a.operator === "<" && i.operator === "<=" ? a : i;
  };
  return _s = u, _s;
}
var Ss, Tl;
function Zc() {
  if (Tl) return Ss;
  Tl = 1;
  const e = Mr(), t = gn(), l = Ve(), s = Xc(), d = nr(), u = cd(), n = ud(), h = fd(), r = dd(), c = hd(), o = pd(), i = md(), a = gd(), p = st(), g = yd(), v = vd(), m = qs(), w = Ed(), R = wd(), C = vn(), D = Ms(), P = Jc(), F = Kc(), O = Bs(), L = js(), S = Qc(), z = _d(), G = En(), $ = ot(), H = wn(), x = Ad(), b = Rd(), I = Td(), A = Cd(), k = bd(), M = Hs(), W = Pd(), ie = Od(), te = Id(), de = Dd(), he = Nd();
  return Ss = {
    parse: d,
    valid: u,
    clean: n,
    inc: h,
    diff: r,
    major: c,
    minor: o,
    patch: i,
    prerelease: a,
    compare: p,
    rcompare: g,
    compareLoose: v,
    compareBuild: m,
    sort: w,
    rsort: R,
    gt: C,
    lt: D,
    eq: P,
    neq: F,
    gte: O,
    lte: L,
    cmp: S,
    coerce: z,
    Comparator: G,
    Range: $,
    satisfies: H,
    toComparators: x,
    maxSatisfying: b,
    minSatisfying: I,
    minVersion: A,
    validRange: k,
    outside: M,
    gtr: W,
    ltr: ie,
    intersects: te,
    simplifyRange: de,
    subset: he,
    SemVer: l,
    re: e.re,
    src: e.src,
    tokens: e.t,
    SEMVER_SPEC_VERSION: t.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: t.RELEASE_TYPES,
    compareIdentifiers: s.compareIdentifiers,
    rcompareIdentifiers: s.rcompareIdentifiers
  }, Ss;
}
var zt = {}, Dr = { exports: {} };
Dr.exports;
var Cl;
function Fd() {
  return Cl || (Cl = 1, (function(e, t) {
    var l = 200, s = "__lodash_hash_undefined__", d = 1, u = 2, n = 9007199254740991, h = "[object Arguments]", r = "[object Array]", c = "[object AsyncFunction]", o = "[object Boolean]", i = "[object Date]", a = "[object Error]", p = "[object Function]", g = "[object GeneratorFunction]", v = "[object Map]", m = "[object Number]", w = "[object Null]", R = "[object Object]", C = "[object Promise]", D = "[object Proxy]", P = "[object RegExp]", F = "[object Set]", O = "[object String]", L = "[object Symbol]", S = "[object Undefined]", z = "[object WeakMap]", G = "[object ArrayBuffer]", $ = "[object DataView]", H = "[object Float32Array]", x = "[object Float64Array]", b = "[object Int8Array]", I = "[object Int16Array]", A = "[object Int32Array]", k = "[object Uint8Array]", M = "[object Uint8ClampedArray]", W = "[object Uint16Array]", ie = "[object Uint32Array]", te = /[\\^$.*+?()[\]{}|]/g, de = /^\[object .+?Constructor\]$/, he = /^(?:0|[1-9]\d*)$/, Y = {};
    Y[H] = Y[x] = Y[b] = Y[I] = Y[A] = Y[k] = Y[M] = Y[W] = Y[ie] = !0, Y[h] = Y[r] = Y[G] = Y[o] = Y[$] = Y[i] = Y[a] = Y[p] = Y[v] = Y[m] = Y[R] = Y[P] = Y[F] = Y[O] = Y[z] = !1;
    var pe = typeof it == "object" && it && it.Object === Object && it, E = typeof self == "object" && self && self.Object === Object && self, y = pe || E || Function("return this")(), B = t && !t.nodeType && t, N = B && !0 && e && !e.nodeType && e, fe = N && N.exports === B, ye = fe && pe.process, ve = (function() {
      try {
        return ye && ye.binding && ye.binding("util");
      } catch {
      }
    })(), Se = ve && ve.isTypedArray;
    function we(T, U) {
      for (var Z = -1, ce = T == null ? 0 : T.length, De = 0, Ae = []; ++Z < ce; ) {
        var Ue = T[Z];
        U(Ue, Z, T) && (Ae[De++] = Ue);
      }
      return Ae;
    }
    function ze(T, U) {
      for (var Z = -1, ce = U.length, De = T.length; ++Z < ce; )
        T[De + Z] = U[Z];
      return T;
    }
    function Te(T, U) {
      for (var Z = -1, ce = T == null ? 0 : T.length; ++Z < ce; )
        if (U(T[Z], Z, T))
          return !0;
      return !1;
    }
    function Ge(T, U) {
      for (var Z = -1, ce = Array(T); ++Z < T; )
        ce[Z] = U(Z);
      return ce;
    }
    function pt(T) {
      return function(U) {
        return T(U);
      };
    }
    function ct(T, U) {
      return T.has(U);
    }
    function at(T, U) {
      return T?.[U];
    }
    function f(T) {
      var U = -1, Z = Array(T.size);
      return T.forEach(function(ce, De) {
        Z[++U] = [De, ce];
      }), Z;
    }
    function j(T, U) {
      return function(Z) {
        return T(U(Z));
      };
    }
    function V(T) {
      var U = -1, Z = Array(T.size);
      return T.forEach(function(ce) {
        Z[++U] = ce;
      }), Z;
    }
    var se = Array.prototype, X = Function.prototype, ne = Object.prototype, ee = y["__core-js_shared__"], ae = X.toString, ue = ne.hasOwnProperty, Ce = (function() {
      var T = /[^.]+$/.exec(ee && ee.keys && ee.keys.IE_PROTO || "");
      return T ? "Symbol(src)_1." + T : "";
    })(), be = ne.toString, Ee = RegExp(
      "^" + ae.call(ue).replace(te, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    ), _ = fe ? y.Buffer : void 0, q = y.Symbol, J = y.Uint8Array, K = ne.propertyIsEnumerable, Q = se.splice, oe = q ? q.toStringTag : void 0, re = Object.getOwnPropertySymbols, le = _ ? _.isBuffer : void 0, me = j(Object.keys, Object), _e = Gt(y, "DataView"), Ie = Gt(y, "Map"), xe = Gt(y, "Promise"), Pe = Gt(y, "Set"), Ht = Gt(y, "WeakMap"), rt = Gt(Object, "create"), Tt = Pt(_e), hu = Pt(Ie), pu = Pt(xe), mu = Pt(Pe), gu = Pt(Ht), Xs = q ? q.prototype : void 0, An = Xs ? Xs.valueOf : void 0;
    function Ct(T) {
      var U = -1, Z = T == null ? 0 : T.length;
      for (this.clear(); ++U < Z; ) {
        var ce = T[U];
        this.set(ce[0], ce[1]);
      }
    }
    function yu() {
      this.__data__ = rt ? rt(null) : {}, this.size = 0;
    }
    function vu(T) {
      var U = this.has(T) && delete this.__data__[T];
      return this.size -= U ? 1 : 0, U;
    }
    function Eu(T) {
      var U = this.__data__;
      if (rt) {
        var Z = U[T];
        return Z === s ? void 0 : Z;
      }
      return ue.call(U, T) ? U[T] : void 0;
    }
    function wu(T) {
      var U = this.__data__;
      return rt ? U[T] !== void 0 : ue.call(U, T);
    }
    function _u(T, U) {
      var Z = this.__data__;
      return this.size += this.has(T) ? 0 : 1, Z[T] = rt && U === void 0 ? s : U, this;
    }
    Ct.prototype.clear = yu, Ct.prototype.delete = vu, Ct.prototype.get = Eu, Ct.prototype.has = wu, Ct.prototype.set = _u;
    function ut(T) {
      var U = -1, Z = T == null ? 0 : T.length;
      for (this.clear(); ++U < Z; ) {
        var ce = T[U];
        this.set(ce[0], ce[1]);
      }
    }
    function Su() {
      this.__data__ = [], this.size = 0;
    }
    function Au(T) {
      var U = this.__data__, Z = Hr(U, T);
      if (Z < 0)
        return !1;
      var ce = U.length - 1;
      return Z == ce ? U.pop() : Q.call(U, Z, 1), --this.size, !0;
    }
    function Ru(T) {
      var U = this.__data__, Z = Hr(U, T);
      return Z < 0 ? void 0 : U[Z][1];
    }
    function Tu(T) {
      return Hr(this.__data__, T) > -1;
    }
    function Cu(T, U) {
      var Z = this.__data__, ce = Hr(Z, T);
      return ce < 0 ? (++this.size, Z.push([T, U])) : Z[ce][1] = U, this;
    }
    ut.prototype.clear = Su, ut.prototype.delete = Au, ut.prototype.get = Ru, ut.prototype.has = Tu, ut.prototype.set = Cu;
    function bt(T) {
      var U = -1, Z = T == null ? 0 : T.length;
      for (this.clear(); ++U < Z; ) {
        var ce = T[U];
        this.set(ce[0], ce[1]);
      }
    }
    function bu() {
      this.size = 0, this.__data__ = {
        hash: new Ct(),
        map: new (Ie || ut)(),
        string: new Ct()
      };
    }
    function Pu(T) {
      var U = Gr(this, T).delete(T);
      return this.size -= U ? 1 : 0, U;
    }
    function Ou(T) {
      return Gr(this, T).get(T);
    }
    function Iu(T) {
      return Gr(this, T).has(T);
    }
    function Du(T, U) {
      var Z = Gr(this, T), ce = Z.size;
      return Z.set(T, U), this.size += Z.size == ce ? 0 : 1, this;
    }
    bt.prototype.clear = bu, bt.prototype.delete = Pu, bt.prototype.get = Ou, bt.prototype.has = Iu, bt.prototype.set = Du;
    function jr(T) {
      var U = -1, Z = T == null ? 0 : T.length;
      for (this.__data__ = new bt(); ++U < Z; )
        this.add(T[U]);
    }
    function Nu(T) {
      return this.__data__.set(T, s), this;
    }
    function Fu(T) {
      return this.__data__.has(T);
    }
    jr.prototype.add = jr.prototype.push = Nu, jr.prototype.has = Fu;
    function mt(T) {
      var U = this.__data__ = new ut(T);
      this.size = U.size;
    }
    function Lu() {
      this.__data__ = new ut(), this.size = 0;
    }
    function xu(T) {
      var U = this.__data__, Z = U.delete(T);
      return this.size = U.size, Z;
    }
    function Uu(T) {
      return this.__data__.get(T);
    }
    function ku(T) {
      return this.__data__.has(T);
    }
    function $u(T, U) {
      var Z = this.__data__;
      if (Z instanceof ut) {
        var ce = Z.__data__;
        if (!Ie || ce.length < l - 1)
          return ce.push([T, U]), this.size = ++Z.size, this;
        Z = this.__data__ = new bt(ce);
      }
      return Z.set(T, U), this.size = Z.size, this;
    }
    mt.prototype.clear = Lu, mt.prototype.delete = xu, mt.prototype.get = Uu, mt.prototype.has = ku, mt.prototype.set = $u;
    function qu(T, U) {
      var Z = Wr(T), ce = !Z && ef(T), De = !Z && !ce && Rn(T), Ae = !Z && !ce && !De && io(T), Ue = Z || ce || De || Ae, $e = Ue ? Ge(T.length, String) : [], Me = $e.length;
      for (var Fe in T)
        ue.call(T, Fe) && !(Ue && // Safari 9 has enumerable `arguments.length` in strict mode.
        (Fe == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        De && (Fe == "offset" || Fe == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        Ae && (Fe == "buffer" || Fe == "byteLength" || Fe == "byteOffset") || // Skip index properties.
        Xu(Fe, Me))) && $e.push(Fe);
      return $e;
    }
    function Hr(T, U) {
      for (var Z = T.length; Z--; )
        if (eo(T[Z][0], U))
          return Z;
      return -1;
    }
    function Mu(T, U, Z) {
      var ce = U(T);
      return Wr(T) ? ce : ze(ce, Z(T));
    }
    function sr(T) {
      return T == null ? T === void 0 ? S : w : oe && oe in Object(T) ? zu(T) : Zu(T);
    }
    function Js(T) {
      return or(T) && sr(T) == h;
    }
    function Ks(T, U, Z, ce, De) {
      return T === U ? !0 : T == null || U == null || !or(T) && !or(U) ? T !== T && U !== U : Bu(T, U, Z, ce, Ks, De);
    }
    function Bu(T, U, Z, ce, De, Ae) {
      var Ue = Wr(T), $e = Wr(U), Me = Ue ? r : gt(T), Fe = $e ? r : gt(U);
      Me = Me == h ? R : Me, Fe = Fe == h ? R : Fe;
      var Xe = Me == R, nt = Fe == R, Be = Me == Fe;
      if (Be && Rn(T)) {
        if (!Rn(U))
          return !1;
        Ue = !0, Xe = !1;
      }
      if (Be && !Xe)
        return Ae || (Ae = new mt()), Ue || io(T) ? Qs(T, U, Z, ce, De, Ae) : Wu(T, U, Me, Z, ce, De, Ae);
      if (!(Z & d)) {
        var Ze = Xe && ue.call(T, "__wrapped__"), et = nt && ue.call(U, "__wrapped__");
        if (Ze || et) {
          var yt = Ze ? T.value() : T, ft = et ? U.value() : U;
          return Ae || (Ae = new mt()), De(yt, ft, Z, ce, Ae);
        }
      }
      return Be ? (Ae || (Ae = new mt()), Vu(T, U, Z, ce, De, Ae)) : !1;
    }
    function ju(T) {
      if (!no(T) || Ku(T))
        return !1;
      var U = to(T) ? Ee : de;
      return U.test(Pt(T));
    }
    function Hu(T) {
      return or(T) && ro(T.length) && !!Y[sr(T)];
    }
    function Gu(T) {
      if (!Qu(T))
        return me(T);
      var U = [];
      for (var Z in Object(T))
        ue.call(T, Z) && Z != "constructor" && U.push(Z);
      return U;
    }
    function Qs(T, U, Z, ce, De, Ae) {
      var Ue = Z & d, $e = T.length, Me = U.length;
      if ($e != Me && !(Ue && Me > $e))
        return !1;
      var Fe = Ae.get(T);
      if (Fe && Ae.get(U))
        return Fe == U;
      var Xe = -1, nt = !0, Be = Z & u ? new jr() : void 0;
      for (Ae.set(T, U), Ae.set(U, T); ++Xe < $e; ) {
        var Ze = T[Xe], et = U[Xe];
        if (ce)
          var yt = Ue ? ce(et, Ze, Xe, U, T, Ae) : ce(Ze, et, Xe, T, U, Ae);
        if (yt !== void 0) {
          if (yt)
            continue;
          nt = !1;
          break;
        }
        if (Be) {
          if (!Te(U, function(ft, Ot) {
            if (!ct(Be, Ot) && (Ze === ft || De(Ze, ft, Z, ce, Ae)))
              return Be.push(Ot);
          })) {
            nt = !1;
            break;
          }
        } else if (!(Ze === et || De(Ze, et, Z, ce, Ae))) {
          nt = !1;
          break;
        }
      }
      return Ae.delete(T), Ae.delete(U), nt;
    }
    function Wu(T, U, Z, ce, De, Ae, Ue) {
      switch (Z) {
        case $:
          if (T.byteLength != U.byteLength || T.byteOffset != U.byteOffset)
            return !1;
          T = T.buffer, U = U.buffer;
        case G:
          return !(T.byteLength != U.byteLength || !Ae(new J(T), new J(U)));
        case o:
        case i:
        case m:
          return eo(+T, +U);
        case a:
          return T.name == U.name && T.message == U.message;
        case P:
        case O:
          return T == U + "";
        case v:
          var $e = f;
        case F:
          var Me = ce & d;
          if ($e || ($e = V), T.size != U.size && !Me)
            return !1;
          var Fe = Ue.get(T);
          if (Fe)
            return Fe == U;
          ce |= u, Ue.set(T, U);
          var Xe = Qs($e(T), $e(U), ce, De, Ae, Ue);
          return Ue.delete(T), Xe;
        case L:
          if (An)
            return An.call(T) == An.call(U);
      }
      return !1;
    }
    function Vu(T, U, Z, ce, De, Ae) {
      var Ue = Z & d, $e = Zs(T), Me = $e.length, Fe = Zs(U), Xe = Fe.length;
      if (Me != Xe && !Ue)
        return !1;
      for (var nt = Me; nt--; ) {
        var Be = $e[nt];
        if (!(Ue ? Be in U : ue.call(U, Be)))
          return !1;
      }
      var Ze = Ae.get(T);
      if (Ze && Ae.get(U))
        return Ze == U;
      var et = !0;
      Ae.set(T, U), Ae.set(U, T);
      for (var yt = Ue; ++nt < Me; ) {
        Be = $e[nt];
        var ft = T[Be], Ot = U[Be];
        if (ce)
          var so = Ue ? ce(Ot, ft, Be, U, T, Ae) : ce(ft, Ot, Be, T, U, Ae);
        if (!(so === void 0 ? ft === Ot || De(ft, Ot, Z, ce, Ae) : so)) {
          et = !1;
          break;
        }
        yt || (yt = Be == "constructor");
      }
      if (et && !yt) {
        var Vr = T.constructor, zr = U.constructor;
        Vr != zr && "constructor" in T && "constructor" in U && !(typeof Vr == "function" && Vr instanceof Vr && typeof zr == "function" && zr instanceof zr) && (et = !1);
      }
      return Ae.delete(T), Ae.delete(U), et;
    }
    function Zs(T) {
      return Mu(T, nf, Yu);
    }
    function Gr(T, U) {
      var Z = T.__data__;
      return Ju(U) ? Z[typeof U == "string" ? "string" : "hash"] : Z.map;
    }
    function Gt(T, U) {
      var Z = at(T, U);
      return ju(Z) ? Z : void 0;
    }
    function zu(T) {
      var U = ue.call(T, oe), Z = T[oe];
      try {
        T[oe] = void 0;
        var ce = !0;
      } catch {
      }
      var De = be.call(T);
      return ce && (U ? T[oe] = Z : delete T[oe]), De;
    }
    var Yu = re ? function(T) {
      return T == null ? [] : (T = Object(T), we(re(T), function(U) {
        return K.call(T, U);
      }));
    } : sf, gt = sr;
    (_e && gt(new _e(new ArrayBuffer(1))) != $ || Ie && gt(new Ie()) != v || xe && gt(xe.resolve()) != C || Pe && gt(new Pe()) != F || Ht && gt(new Ht()) != z) && (gt = function(T) {
      var U = sr(T), Z = U == R ? T.constructor : void 0, ce = Z ? Pt(Z) : "";
      if (ce)
        switch (ce) {
          case Tt:
            return $;
          case hu:
            return v;
          case pu:
            return C;
          case mu:
            return F;
          case gu:
            return z;
        }
      return U;
    });
    function Xu(T, U) {
      return U = U ?? n, !!U && (typeof T == "number" || he.test(T)) && T > -1 && T % 1 == 0 && T < U;
    }
    function Ju(T) {
      var U = typeof T;
      return U == "string" || U == "number" || U == "symbol" || U == "boolean" ? T !== "__proto__" : T === null;
    }
    function Ku(T) {
      return !!Ce && Ce in T;
    }
    function Qu(T) {
      var U = T && T.constructor, Z = typeof U == "function" && U.prototype || ne;
      return T === Z;
    }
    function Zu(T) {
      return be.call(T);
    }
    function Pt(T) {
      if (T != null) {
        try {
          return ae.call(T);
        } catch {
        }
        try {
          return T + "";
        } catch {
        }
      }
      return "";
    }
    function eo(T, U) {
      return T === U || T !== T && U !== U;
    }
    var ef = Js(/* @__PURE__ */ (function() {
      return arguments;
    })()) ? Js : function(T) {
      return or(T) && ue.call(T, "callee") && !K.call(T, "callee");
    }, Wr = Array.isArray;
    function tf(T) {
      return T != null && ro(T.length) && !to(T);
    }
    var Rn = le || of;
    function rf(T, U) {
      return Ks(T, U);
    }
    function to(T) {
      if (!no(T))
        return !1;
      var U = sr(T);
      return U == p || U == g || U == c || U == D;
    }
    function ro(T) {
      return typeof T == "number" && T > -1 && T % 1 == 0 && T <= n;
    }
    function no(T) {
      var U = typeof T;
      return T != null && (U == "object" || U == "function");
    }
    function or(T) {
      return T != null && typeof T == "object";
    }
    var io = Se ? pt(Se) : Hu;
    function nf(T) {
      return tf(T) ? qu(T) : Gu(T);
    }
    function sf() {
      return [];
    }
    function of() {
      return !1;
    }
    e.exports = rf;
  })(Dr, Dr.exports)), Dr.exports;
}
var bl;
function Ld() {
  if (bl) return zt;
  bl = 1, Object.defineProperty(zt, "__esModule", { value: !0 }), zt.DownloadedUpdateHelper = void 0, zt.createTempUpdateFile = h;
  const e = kr, t = At, l = Fd(), s = /* @__PURE__ */ Rt(), d = Ne;
  let u = class {
    constructor(c) {
      this.cacheDir = c, this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, this._downloadedFileInfo = null;
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
    async validateDownloadedPath(c, o, i, a) {
      if (this.versionInfo != null && this.file === c && this.fileInfo != null)
        return l(this.versionInfo, o) && l(this.fileInfo.info, i.info) && await (0, s.pathExists)(c) ? c : null;
      const p = await this.getValidCachedUpdateFile(i, a);
      return p === null ? null : (a.info(`Update has already been downloaded to ${c}).`), this._file = p, p);
    }
    async setDownloadedFile(c, o, i, a, p, g) {
      this._file = c, this._packageFile = o, this.versionInfo = i, this.fileInfo = a, this._downloadedFileInfo = {
        fileName: p,
        sha512: a.info.sha512,
        isAdminRightsRequired: a.info.isAdminRightsRequired === !0
      }, g && await (0, s.outputJson)(this.getUpdateInfoFile(), this._downloadedFileInfo);
    }
    async clear() {
      this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, await this.cleanCacheDirForPendingUpdate();
    }
    async cleanCacheDirForPendingUpdate() {
      try {
        await (0, s.emptyDir)(this.cacheDirForPendingUpdate);
      } catch {
      }
    }
    /**
     * Returns "update-info.json" which is created in the update cache directory's "pending" subfolder after the first update is downloaded.  If the update file does not exist then the cache is cleared and recreated.  If the update file exists then its properties are validated.
     * @param fileInfo
     * @param logger
     */
    async getValidCachedUpdateFile(c, o) {
      const i = this.getUpdateInfoFile();
      if (!await (0, s.pathExists)(i))
        return null;
      let p;
      try {
        p = await (0, s.readJson)(i);
      } catch (w) {
        let R = "No cached update info available";
        return w.code !== "ENOENT" && (await this.cleanCacheDirForPendingUpdate(), R += ` (error on read: ${w.message})`), o.info(R), null;
      }
      if (!(p?.fileName !== null))
        return o.warn("Cached update info is corrupted: no fileName, directory for cached update will be cleaned"), await this.cleanCacheDirForPendingUpdate(), null;
      if (c.info.sha512 !== p.sha512)
        return o.info(`Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${p.sha512}, expected: ${c.info.sha512}. Directory for cached update will be cleaned`), await this.cleanCacheDirForPendingUpdate(), null;
      const v = d.join(this.cacheDirForPendingUpdate, p.fileName);
      if (!await (0, s.pathExists)(v))
        return o.info("Cached update file doesn't exist"), null;
      const m = await n(v);
      return c.info.sha512 !== m ? (o.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${m}, expected: ${c.info.sha512}`), await this.cleanCacheDirForPendingUpdate(), null) : (this._downloadedFileInfo = p, v);
    }
    getUpdateInfoFile() {
      return d.join(this.cacheDirForPendingUpdate, "update-info.json");
    }
  };
  zt.DownloadedUpdateHelper = u;
  function n(r, c = "sha512", o = "base64", i) {
    return new Promise((a, p) => {
      const g = (0, e.createHash)(c);
      g.on("error", p).setEncoding(o), (0, t.createReadStream)(r, {
        ...i,
        highWaterMark: 1024 * 1024
        /* better to use more memory but hash faster */
      }).on("error", p).on("end", () => {
        g.end(), a(g.read());
      }).pipe(g, { end: !1 });
    });
  }
  async function h(r, c, o) {
    let i = 0, a = d.join(c, r);
    for (let p = 0; p < 3; p++)
      try {
        return await (0, s.unlink)(a), a;
      } catch (g) {
        if (g.code === "ENOENT")
          return a;
        o.warn(`Error on remove temp update file: ${g}`), a = d.join(c, `${i++}-${r}`);
      }
    return a;
  }
  return zt;
}
var fr = {}, on = {}, Pl;
function xd() {
  if (Pl) return on;
  Pl = 1, Object.defineProperty(on, "__esModule", { value: !0 }), on.getAppCacheDir = l;
  const e = Ne, t = dn;
  function l() {
    const s = (0, t.homedir)();
    let d;
    return process.platform === "win32" ? d = process.env.LOCALAPPDATA || e.join(s, "AppData", "Local") : process.platform === "darwin" ? d = e.join(s, "Library", "Caches") : d = process.env.XDG_CACHE_HOME || e.join(s, ".cache"), d;
  }
  return on;
}
var Ol;
function Ud() {
  if (Ol) return fr;
  Ol = 1, Object.defineProperty(fr, "__esModule", { value: !0 }), fr.ElectronAppAdapter = void 0;
  const e = Ne, t = xd();
  let l = class {
    constructor(d = xt.app) {
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
      return (0, t.getAppCacheDir)();
    }
    quit() {
      this.app.quit();
    }
    relaunch() {
      this.app.relaunch();
    }
    onQuit(d) {
      this.app.once("quit", (u, n) => d(n));
    }
  };
  return fr.ElectronAppAdapter = l, fr;
}
var As = {}, Il;
function kd() {
  return Il || (Il = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ElectronHttpExecutor = e.NET_SESSION_NAME = void 0, e.getNetSession = l;
    const t = qe();
    e.NET_SESSION_NAME = "electron-updater";
    function l() {
      return xt.session.fromPartition(e.NET_SESSION_NAME, {
        cache: !1
      });
    }
    class s extends t.HttpExecutor {
      constructor(u) {
        super(), this.proxyLoginCallback = u, this.cachedSession = null;
      }
      async download(u, n, h) {
        return await h.cancellationToken.createPromise((r, c, o) => {
          const i = {
            headers: h.headers || void 0,
            redirect: "manual"
          };
          (0, t.configureRequestUrl)(u, i), (0, t.configureRequestOptions)(i), this.doDownload(i, {
            destination: n,
            options: h,
            onCancel: o,
            callback: (a) => {
              a == null ? r(n) : c(a);
            },
            responseHandler: null
          }, 0);
        });
      }
      createRequest(u, n) {
        u.headers && u.headers.Host && (u.host = u.headers.Host, delete u.headers.Host), this.cachedSession == null && (this.cachedSession = l());
        const h = xt.net.request({
          ...u,
          session: this.cachedSession
        });
        return h.on("response", n), this.proxyLoginCallback != null && h.on("login", this.proxyLoginCallback), h;
      }
      addRedirectHandlers(u, n, h, r, c) {
        u.on("redirect", (o, i, a) => {
          u.abort(), r > this.maxRedirects ? h(this.createMaxRedirectError()) : c(t.HttpExecutor.prepareRedirectUrlOptions(a, n));
        });
      }
    }
    e.ElectronHttpExecutor = s;
  })(As)), As;
}
var dr = {}, Yt = {}, Dl;
function Mt() {
  if (Dl) return Yt;
  Dl = 1, Object.defineProperty(Yt, "__esModule", { value: !0 }), Yt.newBaseUrl = t, Yt.newUrlFromBase = l, Yt.getChannelFilename = s;
  const e = St;
  function t(d) {
    const u = new e.URL(d);
    return u.pathname.endsWith("/") || (u.pathname += "/"), u;
  }
  function l(d, u, n = !1) {
    const h = new e.URL(d, u), r = u.search;
    return r != null && r.length !== 0 ? h.search = r : n && (h.search = `noCache=${Date.now().toString(32)}`), h;
  }
  function s(d) {
    return `${d}.yml`;
  }
  return Yt;
}
var dt = {}, Rs, Nl;
function eu() {
  if (Nl) return Rs;
  Nl = 1;
  var e = "[object Symbol]", t = /[\\^$.*+?()[\]{}|]/g, l = RegExp(t.source), s = typeof it == "object" && it && it.Object === Object && it, d = typeof self == "object" && self && self.Object === Object && self, u = s || d || Function("return this")(), n = Object.prototype, h = n.toString, r = u.Symbol, c = r ? r.prototype : void 0, o = c ? c.toString : void 0;
  function i(m) {
    if (typeof m == "string")
      return m;
    if (p(m))
      return o ? o.call(m) : "";
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
    return m == null ? "" : i(m);
  }
  function v(m) {
    return m = g(m), m && l.test(m) ? m.replace(t, "\\$&") : m;
  }
  return Rs = v, Rs;
}
var Fl;
function Qe() {
  if (Fl) return dt;
  Fl = 1, Object.defineProperty(dt, "__esModule", { value: !0 }), dt.Provider = void 0, dt.findFile = n, dt.parseUpdateInfo = h, dt.getFileList = r, dt.resolveFiles = c;
  const e = qe(), t = ks(), l = St, s = Mt(), d = eu();
  let u = class {
    constructor(i) {
      this.runtimeOptions = i, this.requestHeaders = null, this.executor = i.executor;
    }
    // By default, the blockmap file is in the same directory as the main file
    // But some providers may have a different blockmap file, so we need to override this method
    getBlockMapFiles(i, a, p, g = null) {
      const v = (0, s.newUrlFromBase)(`${i.pathname}.blockmap`, i);
      return [(0, s.newUrlFromBase)(`${i.pathname.replace(new RegExp(d(p), "g"), a)}.blockmap`, g ? new l.URL(g) : i), v];
    }
    get isUseMultipleRangeRequest() {
      return this.runtimeOptions.isUseMultipleRangeRequest !== !1;
    }
    getChannelFilePrefix() {
      if (this.runtimeOptions.platform === "linux") {
        const i = process.env.TEST_UPDATER_ARCH || process.arch;
        return "-linux" + (i === "x64" ? "" : `-${i}`);
      } else
        return this.runtimeOptions.platform === "darwin" ? "-mac" : "";
    }
    // due to historical reasons for windows we use channel name without platform specifier
    getDefaultChannelName() {
      return this.getCustomChannelName("latest");
    }
    getCustomChannelName(i) {
      return `${i}${this.getChannelFilePrefix()}`;
    }
    get fileExtraDownloadHeaders() {
      return null;
    }
    setRequestHeaders(i) {
      this.requestHeaders = i;
    }
    /**
     * Method to perform API request only to resolve update info, but not to download update.
     */
    httpRequest(i, a, p) {
      return this.executor.request(this.createRequestOptions(i, a), p);
    }
    createRequestOptions(i, a) {
      const p = {};
      return this.requestHeaders == null ? a != null && (p.headers = a) : p.headers = a == null ? this.requestHeaders : { ...this.requestHeaders, ...a }, (0, e.configureRequestUrl)(i, p), p;
    }
  };
  dt.Provider = u;
  function n(o, i, a) {
    var p;
    if (o.length === 0)
      throw (0, e.newError)("No files provided", "ERR_UPDATER_NO_FILES_PROVIDED");
    const g = o.filter((m) => m.url.pathname.toLowerCase().endsWith(`.${i.toLowerCase()}`)), v = (p = g.find((m) => [m.url.pathname, m.info.url].some((w) => w.includes(process.arch)))) !== null && p !== void 0 ? p : g.shift();
    return v || (a == null ? o[0] : o.find((m) => !a.some((w) => m.url.pathname.toLowerCase().endsWith(`.${w.toLowerCase()}`))));
  }
  function h(o, i, a) {
    if (o == null)
      throw (0, e.newError)(`Cannot parse update info from ${i} in the latest release artifacts (${a}): rawData: null`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    let p;
    try {
      p = (0, t.load)(o);
    } catch (g) {
      throw (0, e.newError)(`Cannot parse update info from ${i} in the latest release artifacts (${a}): ${g.stack || g.message}, rawData: ${o}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    }
    return p;
  }
  function r(o) {
    const i = o.files;
    if (i != null && i.length > 0)
      return i;
    if (o.path != null)
      return [
        {
          url: o.path,
          sha2: o.sha2,
          sha512: o.sha512
        }
      ];
    throw (0, e.newError)(`No files provided: ${(0, e.safeStringifyJson)(o)}`, "ERR_UPDATER_NO_FILES_PROVIDED");
  }
  function c(o, i, a = (p) => p) {
    const g = r(o).map((w) => {
      if (w.sha2 == null && w.sha512 == null)
        throw (0, e.newError)(`Update info doesn't contain nor sha256 neither sha512 checksum: ${(0, e.safeStringifyJson)(w)}`, "ERR_UPDATER_NO_CHECKSUM");
      return {
        url: (0, s.newUrlFromBase)(a(w.url), i),
        info: w
      };
    }), v = o.packages, m = v == null ? null : v[process.arch] || v.ia32;
    return m != null && (g[0].packageInfo = {
      ...m,
      path: (0, s.newUrlFromBase)(a(m.path), i).href
    }), g;
  }
  return dt;
}
var Ll;
function tu() {
  if (Ll) return dr;
  Ll = 1, Object.defineProperty(dr, "__esModule", { value: !0 }), dr.GenericProvider = void 0;
  const e = qe(), t = Mt(), l = Qe();
  let s = class extends l.Provider {
    constructor(u, n, h) {
      super(h), this.configuration = u, this.updater = n, this.baseUrl = (0, t.newBaseUrl)(this.configuration.url);
    }
    get channel() {
      const u = this.updater.channel || this.configuration.channel;
      return u == null ? this.getDefaultChannelName() : this.getCustomChannelName(u);
    }
    async getLatestVersion() {
      const u = (0, t.getChannelFilename)(this.channel), n = (0, t.newUrlFromBase)(u, this.baseUrl, this.updater.isAddNoCacheQuery);
      for (let h = 0; ; h++)
        try {
          return (0, l.parseUpdateInfo)(await this.httpRequest(n), u, n);
        } catch (r) {
          if (r instanceof e.HttpError && r.statusCode === 404)
            throw (0, e.newError)(`Cannot find channel "${u}" update info: ${r.stack || r.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
          if (r.code === "ECONNREFUSED" && h < 3) {
            await new Promise((c, o) => {
              try {
                setTimeout(c, 1e3 * h);
              } catch (i) {
                o(i);
              }
            });
            continue;
          }
          throw r;
        }
    }
    resolveFiles(u) {
      return (0, l.resolveFiles)(u, this.baseUrl);
    }
  };
  return dr.GenericProvider = s, dr;
}
var hr = {}, pr = {}, xl;
function $d() {
  if (xl) return pr;
  xl = 1, Object.defineProperty(pr, "__esModule", { value: !0 }), pr.BitbucketProvider = void 0;
  const e = qe(), t = Mt(), l = Qe();
  let s = class extends l.Provider {
    constructor(u, n, h) {
      super({
        ...h,
        isUseMultipleRangeRequest: !1
      }), this.configuration = u, this.updater = n;
      const { owner: r, slug: c } = u;
      this.baseUrl = (0, t.newBaseUrl)(`https://api.bitbucket.org/2.0/repositories/${r}/${c}/downloads`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "latest";
    }
    async getLatestVersion() {
      const u = new e.CancellationToken(), n = (0, t.getChannelFilename)(this.getCustomChannelName(this.channel)), h = (0, t.newUrlFromBase)(n, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const r = await this.httpRequest(h, void 0, u);
        return (0, l.parseUpdateInfo)(r, n, h);
      } catch (r) {
        throw (0, e.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${r.stack || r.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(u) {
      return (0, l.resolveFiles)(u, this.baseUrl);
    }
    toString() {
      const { owner: u, slug: n } = this.configuration;
      return `Bitbucket (owner: ${u}, slug: ${n}, channel: ${this.channel})`;
    }
  };
  return pr.BitbucketProvider = s, pr;
}
var wt = {}, Ul;
function ru() {
  if (Ul) return wt;
  Ul = 1, Object.defineProperty(wt, "__esModule", { value: !0 }), wt.GitHubProvider = wt.BaseGitHubProvider = void 0, wt.computeReleaseNotes = c;
  const e = qe(), t = Zc(), l = St, s = Mt(), d = Qe(), u = /\/tag\/(v?[^/]+)$/;
  class n extends d.Provider {
    constructor(i, a, p) {
      super({
        ...p,
        /* because GitHib uses S3 */
        isUseMultipleRangeRequest: !1
      }), this.options = i, this.baseUrl = (0, s.newBaseUrl)((0, e.githubUrl)(i, a));
      const g = a === "github.com" ? "api.github.com" : a;
      this.baseApiUrl = (0, s.newBaseUrl)((0, e.githubUrl)(i, g));
    }
    computeGithubBasePath(i) {
      const a = this.options.host;
      return a && !["github.com", "api.github.com"].includes(a) ? `/api/v3${i}` : i;
    }
  }
  wt.BaseGitHubProvider = n;
  let h = class extends n {
    constructor(i, a, p) {
      super(i, "github.com", p), this.options = i, this.updater = a;
    }
    get channel() {
      const i = this.updater.channel || this.options.channel;
      return i == null ? this.getDefaultChannelName() : this.getCustomChannelName(i);
    }
    async getLatestVersion() {
      var i, a, p, g, v;
      const m = new e.CancellationToken(), w = await this.httpRequest((0, s.newUrlFromBase)(`${this.basePath}.atom`, this.baseUrl), {
        accept: "application/xml, application/atom+xml, text/xml, */*"
      }, m), R = (0, e.parseXml)(w);
      let C = R.element("entry", !1, "No published versions on GitHub"), D = null;
      try {
        if (this.updater.allowPrerelease) {
          const z = ((i = this.updater) === null || i === void 0 ? void 0 : i.channel) || ((a = t.prerelease(this.updater.currentVersion)) === null || a === void 0 ? void 0 : a[0]) || null;
          if (z === null)
            D = u.exec(C.element("link").attribute("href"))[1];
          else
            for (const G of R.getElements("entry")) {
              const $ = u.exec(G.element("link").attribute("href"));
              if ($ === null)
                continue;
              const H = $[1];
              if (!t.valid(H))
                continue;
              const x = ((p = t.prerelease(H)) === null || p === void 0 ? void 0 : p[0]) || null, b = !z || ["alpha", "beta"].includes(z), I = x !== null && !["alpha", "beta"].includes(String(x));
              if (b && !I && !(z === "beta" && x === "alpha")) {
                D = H, C = G;
                break;
              }
              if (x && x === z) {
                D = H, C = G;
                break;
              }
            }
        } else {
          D = await this.getLatestTagName(m);
          for (const z of R.getElements("entry")) {
            const G = u.exec(z.element("link").attribute("href"));
            if (G != null && G[1] === D) {
              C = z;
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
      let P, F = "", O = "";
      const L = async (z) => {
        F = (0, s.getChannelFilename)(z), O = (0, s.newUrlFromBase)(this.getBaseDownloadPath(String(D), F), this.baseUrl);
        const G = this.createRequestOptions(O);
        try {
          return await this.executor.request(G, m);
        } catch ($) {
          throw $ instanceof e.HttpError && $.statusCode === 404 ? (0, e.newError)(`Cannot find ${F} in the latest release artifacts (${O}): ${$.stack || $.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : $;
        }
      };
      try {
        let z = this.channel;
        this.updater.allowPrerelease && (!((g = t.prerelease(D)) === null || g === void 0) && g[0]) && (z = this.getCustomChannelName(String((v = t.prerelease(D)) === null || v === void 0 ? void 0 : v[0]))), P = await L(z);
      } catch (z) {
        if (this.updater.allowPrerelease)
          P = await L(this.getDefaultChannelName());
        else
          throw z;
      }
      const S = (0, d.parseUpdateInfo)(P, F, O);
      return S.releaseName == null && (S.releaseName = C.elementValueOrEmpty("title")), S.releaseNotes == null && (S.releaseNotes = c(this.updater.currentVersion, this.updater.fullChangelog, R, C)), {
        tag: D,
        ...S
      };
    }
    async getLatestTagName(i) {
      const a = this.options, p = a.host == null || a.host === "github.com" ? (0, s.newUrlFromBase)(`${this.basePath}/latest`, this.baseUrl) : new l.URL(`${this.computeGithubBasePath(`/repos/${a.owner}/${a.repo}/releases`)}/latest`, this.baseApiUrl);
      try {
        const g = await this.httpRequest(p, { Accept: "application/json" }, i);
        return g == null ? null : JSON.parse(g).tag_name;
      } catch (g) {
        throw (0, e.newError)(`Unable to find latest version on GitHub (${p}), please ensure a production release exists: ${g.stack || g.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    get basePath() {
      return `/${this.options.owner}/${this.options.repo}/releases`;
    }
    resolveFiles(i) {
      return (0, d.resolveFiles)(i, this.baseUrl, (a) => this.getBaseDownloadPath(i.tag, a.replace(/ /g, "-")));
    }
    getBaseDownloadPath(i, a) {
      return `${this.basePath}/download/${i}/${a}`;
    }
  };
  wt.GitHubProvider = h;
  function r(o) {
    const i = o.elementValueOrEmpty("content");
    return i === "No content." ? "" : i;
  }
  function c(o, i, a, p) {
    if (!i)
      return r(p);
    const g = /\/tag\/v?([^/]+)$/;
    let v;
    try {
      v = g.exec(p.element("link").attribute("href"))[1], v = t.valid(v) ? v : void 0;
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
      if (!t.valid(R))
        continue;
      const C = t.gt(R, o.raw), D = t.lte(R, v);
      C && D && m.push({
        version: R,
        note: r(w)
      });
    }
    return m.sort((w, R) => t.rcompare(w.version, R.version));
  }
  return wt;
}
var mr = {}, kl;
function qd() {
  if (kl) return mr;
  kl = 1, Object.defineProperty(mr, "__esModule", { value: !0 }), mr.GitLabProvider = void 0;
  const e = qe(), t = St, l = eu(), s = Mt(), d = Qe();
  let u = class extends d.Provider {
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
    constructor(h, r, c) {
      super({
        ...c,
        // GitLab might not support multiple range requests efficiently
        isUseMultipleRangeRequest: !1
      }), this.options = h, this.updater = r, this.cachedLatestVersion = null;
      const i = h.host || "gitlab.com";
      this.baseApiUrl = (0, s.newBaseUrl)(`https://${i}/api/v4`);
    }
    createRequestOptions(h, r) {
      const c = super.createRequestOptions(h, r);
      return c.redirect = "manual", c;
    }
    get channel() {
      const h = this.updater.channel || this.options.channel;
      return h == null ? this.getDefaultChannelName() : this.getCustomChannelName(h);
    }
    async getLatestVersion() {
      const h = new e.CancellationToken(), r = (0, s.newUrlFromBase)(`projects/${this.options.projectId}/releases/permalink/latest`, this.baseApiUrl), c = { Accept: "application/json", ...this.setAuthHeaderForToken(this.options.token || null) };
      let o;
      try {
        o = await this.httpRequest(r, c, h);
      } catch (C) {
        throw (0, e.newError)(`Unable to find latest release on GitLab (${r}): ${C.stack || C.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
      if (!o)
        throw (0, e.newError)("No published releases on GitLab", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
      let i;
      try {
        i = JSON.parse(o);
      } catch (C) {
        throw (0, e.newError)(`Unable to parse latest release response from GitLab (${r}): response was not valid JSON: ${C.stack || C.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
      if (i.upcoming_release)
        throw (0, e.newError)("Latest GitLab release is scheduled but not yet published", "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      const a = i.tag_name;
      let p = null, g = "", v = null;
      const m = async (C) => {
        g = (0, s.getChannelFilename)(C);
        const D = i.assets.links.find((O) => O.name === g);
        if (!D)
          throw (0, e.newError)(`Cannot find ${g} in the latest release assets`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
        v = new t.URL(D.direct_asset_url);
        const P = this.setAuthHeaderForToken(this.options.token || null), F = Object.keys(P).length ? P : void 0;
        try {
          const O = await this.httpRequest(v, F, h);
          if (!O)
            throw (0, e.newError)(`Empty response from ${v}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
          return O;
        } catch (O) {
          throw O instanceof e.HttpError && O.statusCode === 404 ? (0, e.newError)(`Cannot find ${g} in the latest release artifacts (${v}): ${O.stack || O.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : O;
        }
      };
      try {
        p = await m(this.channel);
      } catch (C) {
        if (this.channel !== this.getDefaultChannelName())
          p = await m(this.getDefaultChannelName());
        else
          throw C;
      }
      if (!p)
        throw (0, e.newError)(`Unable to parse channel data from ${g}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
      const w = (0, d.parseUpdateInfo)(p, g, v);
      w.releaseName == null && (w.releaseName = i.name), w.releaseNotes == null && (w.releaseNotes = i.description || null);
      const R = {
        tag: a,
        assets: this.convertAssetsToMap(i.assets),
        ...w
      };
      return this.cachedLatestVersion = R, R;
    }
    /**
     * Utility function to convert GitlabReleaseAsset to Map<string, string>
     * Maps asset names to their download URLs
     */
    convertAssetsToMap(h) {
      const r = /* @__PURE__ */ new Map();
      for (const c of h.links)
        r.set(this.normalizeFilename(c.name), c.direct_asset_url);
      return r;
    }
    /**
     * Find blockmap file URL in assets map for a specific filename
     */
    findBlockMapInAssets(h, r) {
      const c = [`${r}.blockmap`, `${this.normalizeFilename(r)}.blockmap`];
      for (const o of c) {
        const i = h.get(o);
        if (i)
          return new t.URL(i);
      }
      return null;
    }
    async fetchReleaseInfoByVersion(h) {
      const r = new e.CancellationToken(), c = [`v${h}`, h];
      for (const o of c) {
        const i = (0, s.newUrlFromBase)(`projects/${this.options.projectId}/releases/${encodeURIComponent(o)}`, this.baseApiUrl);
        try {
          const a = { Accept: "application/json", ...this.setAuthHeaderForToken(this.options.token || null) }, p = await this.httpRequest(i, a, r);
          if (p)
            return JSON.parse(p);
        } catch (a) {
          if (a instanceof e.HttpError && a.statusCode === 404)
            continue;
          throw (0, e.newError)(`Unable to find release ${o} on GitLab (${i}): ${a.stack || a.message}`, "ERR_UPDATER_RELEASE_NOT_FOUND");
        }
      }
      throw (0, e.newError)(`Unable to find release with version ${h} (tried: ${c.join(", ")}) on GitLab`, "ERR_UPDATER_RELEASE_NOT_FOUND");
    }
    setAuthHeaderForToken(h) {
      const r = {};
      return h != null && (h.startsWith("Bearer") ? r.authorization = h : r["PRIVATE-TOKEN"] = h), r;
    }
    /**
     * Get version info for blockmap files, using cache when possible
     */
    async getVersionInfoForBlockMap(h) {
      if (this.cachedLatestVersion && this.cachedLatestVersion.version === h)
        return this.cachedLatestVersion.assets;
      const r = await this.fetchReleaseInfoByVersion(h);
      return r && r.assets ? this.convertAssetsToMap(r.assets) : null;
    }
    /**
     * Find blockmap URLs from version assets
     */
    async findBlockMapUrlsFromAssets(h, r, c) {
      let o = null, i = null;
      const a = await this.getVersionInfoForBlockMap(r);
      a && (o = this.findBlockMapInAssets(a, c));
      const p = await this.getVersionInfoForBlockMap(h);
      if (p) {
        const g = c.replace(new RegExp(l(r), "g"), h);
        i = this.findBlockMapInAssets(p, g);
      }
      return [i, o];
    }
    async getBlockMapFiles(h, r, c, o = null) {
      if (this.options.uploadTarget === "project_upload") {
        const i = h.pathname.split("/").pop() || "", [a, p] = await this.findBlockMapUrlsFromAssets(r, c, i);
        if (!p)
          throw (0, e.newError)(`Cannot find blockmap file for ${c} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
        if (!a)
          throw (0, e.newError)(`Cannot find blockmap file for ${r} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
        return [a, p];
      } else
        return super.getBlockMapFiles(h, r, c, o);
    }
    resolveFiles(h) {
      return (0, d.getFileList)(h).map((r) => {
        const o = [
          r.url,
          // Original filename
          this.normalizeFilename(r.url)
          // Normalized filename (spaces/underscores → dashes)
        ].find((a) => h.assets.has(a)), i = o ? h.assets.get(o) : void 0;
        if (!i)
          throw (0, e.newError)(`Cannot find asset "${r.url}" in GitLab release assets. Available assets: ${Array.from(h.assets.keys()).join(", ")}`, "ERR_UPDATER_ASSET_NOT_FOUND");
        return {
          url: new t.URL(i),
          info: r
        };
      });
    }
    toString() {
      return `GitLab (projectId: ${this.options.projectId}, channel: ${this.channel})`;
    }
  };
  return mr.GitLabProvider = u, mr;
}
var gr = {}, $l;
function Md() {
  if ($l) return gr;
  $l = 1, Object.defineProperty(gr, "__esModule", { value: !0 }), gr.KeygenProvider = void 0;
  const e = qe(), t = Mt(), l = Qe();
  let s = class extends l.Provider {
    constructor(u, n, h) {
      super({
        ...h,
        isUseMultipleRangeRequest: !1
      }), this.configuration = u, this.updater = n, this.defaultHostname = "api.keygen.sh";
      const r = this.configuration.host || this.defaultHostname;
      this.baseUrl = (0, t.newBaseUrl)(`https://${r}/v1/accounts/${this.configuration.account}/artifacts?product=${this.configuration.product}`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "stable";
    }
    async getLatestVersion() {
      const u = new e.CancellationToken(), n = (0, t.getChannelFilename)(this.getCustomChannelName(this.channel)), h = (0, t.newUrlFromBase)(n, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const r = await this.httpRequest(h, {
          Accept: "application/vnd.api+json",
          "Keygen-Version": "1.1"
        }, u);
        return (0, l.parseUpdateInfo)(r, n, h);
      } catch (r) {
        throw (0, e.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${r.stack || r.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(u) {
      return (0, l.resolveFiles)(u, this.baseUrl);
    }
    toString() {
      const { account: u, product: n, platform: h } = this.configuration;
      return `Keygen (account: ${u}, product: ${n}, platform: ${h}, channel: ${this.channel})`;
    }
  };
  return gr.KeygenProvider = s, gr;
}
var yr = {}, ql;
function Bd() {
  if (ql) return yr;
  ql = 1, Object.defineProperty(yr, "__esModule", { value: !0 }), yr.PrivateGitHubProvider = void 0;
  const e = qe(), t = ks(), l = Ne, s = St, d = Mt(), u = ru(), n = Qe();
  let h = class extends u.BaseGitHubProvider {
    constructor(c, o, i, a) {
      super(c, "api.github.com", a), this.updater = o, this.token = i;
    }
    createRequestOptions(c, o) {
      const i = super.createRequestOptions(c, o);
      return i.redirect = "manual", i;
    }
    async getLatestVersion() {
      const c = new e.CancellationToken(), o = (0, d.getChannelFilename)(this.getDefaultChannelName()), i = await this.getLatestVersionInfo(c), a = i.assets.find((v) => v.name === o);
      if (a == null)
        throw (0, e.newError)(`Cannot find ${o} in the release ${i.html_url || i.name}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
      const p = new s.URL(a.url);
      let g;
      try {
        g = (0, t.load)(await this.httpRequest(p, this.configureHeaders("application/octet-stream"), c));
      } catch (v) {
        throw v instanceof e.HttpError && v.statusCode === 404 ? (0, e.newError)(`Cannot find ${o} in the latest release artifacts (${p}): ${v.stack || v.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : v;
      }
      return g.assets = i.assets, g;
    }
    get fileExtraDownloadHeaders() {
      return this.configureHeaders("application/octet-stream");
    }
    configureHeaders(c) {
      return {
        accept: c,
        authorization: `token ${this.token}`
      };
    }
    async getLatestVersionInfo(c) {
      const o = this.updater.allowPrerelease;
      let i = this.basePath;
      o || (i = `${i}/latest`);
      const a = (0, d.newUrlFromBase)(i, this.baseUrl);
      try {
        const p = JSON.parse(await this.httpRequest(a, this.configureHeaders("application/vnd.github.v3+json"), c));
        if (o) {
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
    resolveFiles(c) {
      return (0, n.getFileList)(c).map((o) => {
        const i = l.posix.basename(o.url).replace(/ /g, "-"), a = c.assets.find((p) => p != null && p.name === i);
        if (a == null)
          throw (0, e.newError)(`Cannot find asset "${i}" in: ${JSON.stringify(c.assets, null, 2)}`, "ERR_UPDATER_ASSET_NOT_FOUND");
        return {
          url: new s.URL(a.url),
          info: o
        };
      });
    }
  };
  return yr.PrivateGitHubProvider = h, yr;
}
var Ml;
function jd() {
  if (Ml) return hr;
  Ml = 1, Object.defineProperty(hr, "__esModule", { value: !0 }), hr.isUrlProbablySupportMultiRangeRequests = h, hr.createClient = r;
  const e = qe(), t = $d(), l = tu(), s = ru(), d = qd(), u = Md(), n = Bd();
  function h(c) {
    return !c.includes("s3.amazonaws.com");
  }
  function r(c, o, i) {
    if (typeof c == "string")
      throw (0, e.newError)("Please pass PublishConfiguration object", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
    const a = c.provider;
    switch (a) {
      case "github": {
        const p = c, g = (p.private ? process.env.GH_TOKEN || process.env.GITHUB_TOKEN : null) || p.token;
        return g == null ? new s.GitHubProvider(p, o, i) : new n.PrivateGitHubProvider(p, o, g, i);
      }
      case "bitbucket":
        return new t.BitbucketProvider(c, o, i);
      case "gitlab":
        return new d.GitLabProvider(c, o, i);
      case "keygen":
        return new u.KeygenProvider(c, o, i);
      case "s3":
      case "spaces":
        return new l.GenericProvider({
          provider: "generic",
          url: (0, e.getS3LikeProviderBaseUrl)(c),
          channel: c.channel || null
        }, o, {
          ...i,
          // https://github.com/minio/minio/issues/5285#issuecomment-350428955
          isUseMultipleRangeRequest: !1
        });
      case "generic": {
        const p = c;
        return new l.GenericProvider(p, o, {
          ...i,
          isUseMultipleRangeRequest: p.useMultipleRangeRequest !== !1 && h(p.url)
        });
      }
      case "custom": {
        const p = c, g = p.updateProvider;
        if (!g)
          throw (0, e.newError)("Custom provider not specified", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
        return new g(p, o, i);
      }
      default:
        throw (0, e.newError)(`Unsupported provider: ${a}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
    }
  }
  return hr;
}
var vr = {}, Er = {}, Xt = {}, Jt = {}, Bl;
function Gs() {
  if (Bl) return Jt;
  Bl = 1, Object.defineProperty(Jt, "__esModule", { value: !0 }), Jt.OperationKind = void 0, Jt.computeOperations = t;
  var e;
  (function(n) {
    n[n.COPY = 0] = "COPY", n[n.DOWNLOAD = 1] = "DOWNLOAD";
  })(e || (Jt.OperationKind = e = {}));
  function t(n, h, r) {
    const c = u(n.files), o = u(h.files);
    let i = null;
    const a = h.files[0], p = [], g = a.name, v = c.get(g);
    if (v == null)
      throw new Error(`no file ${g} in old blockmap`);
    const m = o.get(g);
    let w = 0;
    const { checksumToOffset: R, checksumToOldSize: C } = d(c.get(g), v.offset, r);
    let D = a.offset;
    for (let P = 0; P < m.checksums.length; D += m.sizes[P], P++) {
      const F = m.sizes[P], O = m.checksums[P];
      let L = R.get(O);
      L != null && C.get(O) !== F && (r.warn(`Checksum ("${O}") matches, but size differs (old: ${C.get(O)}, new: ${F})`), L = void 0), L === void 0 ? (w++, i != null && i.kind === e.DOWNLOAD && i.end === D ? i.end += F : (i = {
        kind: e.DOWNLOAD,
        start: D,
        end: D + F
        // oldBlocks: null,
      }, s(i, p, O, P))) : i != null && i.kind === e.COPY && i.end === L ? i.end += F : (i = {
        kind: e.COPY,
        start: L,
        end: L + F
        // oldBlocks: [checksum]
      }, s(i, p, O, P));
    }
    return w > 0 && r.info(`File${a.name === "file" ? "" : " " + a.name} has ${w} changed blocks`), p;
  }
  const l = process.env.DIFFERENTIAL_DOWNLOAD_PLAN_BUILDER_VALIDATE_RANGES === "true";
  function s(n, h, r, c) {
    if (l && h.length !== 0) {
      const o = h[h.length - 1];
      if (o.kind === n.kind && n.start < o.end && n.start > o.start) {
        const i = [o.start, o.end, n.start, n.end].reduce((a, p) => a < p ? a : p);
        throw new Error(`operation (block index: ${c}, checksum: ${r}, kind: ${e[n.kind]}) overlaps previous operation (checksum: ${r}):
abs: ${o.start} until ${o.end} and ${n.start} until ${n.end}
rel: ${o.start - i} until ${o.end - i} and ${n.start - i} until ${n.end - i}`);
      }
    }
    h.push(n);
  }
  function d(n, h, r) {
    const c = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
    let i = h;
    for (let a = 0; a < n.checksums.length; a++) {
      const p = n.checksums[a], g = n.sizes[a], v = o.get(p);
      if (v === void 0)
        c.set(p, i), o.set(p, g);
      else if (r.debug != null) {
        const m = v === g ? "(same size)" : `(size: ${v}, this size: ${g})`;
        r.debug(`${p} duplicated in blockmap ${m}, it doesn't lead to broken differential downloader, just corresponding block will be skipped)`);
      }
      i += g;
    }
    return { checksumToOffset: c, checksumToOldSize: o };
  }
  function u(n) {
    const h = /* @__PURE__ */ new Map();
    for (const r of n)
      h.set(r.name, r);
    return h;
  }
  return Jt;
}
var jl;
function nu() {
  if (jl) return Xt;
  jl = 1, Object.defineProperty(Xt, "__esModule", { value: !0 }), Xt.DataSplitter = void 0, Xt.copyData = n;
  const e = qe(), t = At, l = Ur, s = Gs(), d = Buffer.from(`\r
\r
`);
  var u;
  (function(r) {
    r[r.INIT = 0] = "INIT", r[r.HEADER = 1] = "HEADER", r[r.BODY = 2] = "BODY";
  })(u || (u = {}));
  function n(r, c, o, i, a) {
    const p = (0, t.createReadStream)("", {
      fd: o,
      autoClose: !1,
      start: r.start,
      // end is inclusive
      end: r.end - 1
    });
    p.on("error", i), p.once("end", a), p.pipe(c, {
      end: !1
    });
  }
  let h = class extends l.Writable {
    constructor(c, o, i, a, p, g, v, m) {
      super(), this.out = c, this.options = o, this.partIndexToTaskIndex = i, this.partIndexToLength = p, this.finishHandler = g, this.grandTotalBytes = v, this.onProgress = m, this.start = Date.now(), this.nextUpdate = this.start + 1e3, this.transferred = 0, this.delta = 0, this.partIndex = -1, this.headerListBuffer = null, this.readState = u.INIT, this.ignoreByteCount = 0, this.remainingPartDataCount = 0, this.actualPartLength = 0, this.boundaryLength = a.length + 4, this.ignoreByteCount = this.boundaryLength - 2;
    }
    get isFinished() {
      return this.partIndex === this.partIndexToLength.length;
    }
    // noinspection JSUnusedGlobalSymbols
    _write(c, o, i) {
      if (this.isFinished) {
        console.error(`Trailing ignored data: ${c.length} bytes`);
        return;
      }
      this.handleData(c).then(() => {
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
        i();
      }).catch(i);
    }
    async handleData(c) {
      let o = 0;
      if (this.ignoreByteCount !== 0 && this.remainingPartDataCount !== 0)
        throw (0, e.newError)("Internal error", "ERR_DATA_SPLITTER_BYTE_COUNT_MISMATCH");
      if (this.ignoreByteCount > 0) {
        const i = Math.min(this.ignoreByteCount, c.length);
        this.ignoreByteCount -= i, o = i;
      } else if (this.remainingPartDataCount > 0) {
        const i = Math.min(this.remainingPartDataCount, c.length);
        this.remainingPartDataCount -= i, await this.processPartData(c, 0, i), o = i;
      }
      if (o !== c.length) {
        if (this.readState === u.HEADER) {
          const i = this.searchHeaderListEnd(c, o);
          if (i === -1)
            return;
          o = i, this.readState = u.BODY, this.headerListBuffer = null;
        }
        for (; ; ) {
          if (this.readState === u.BODY)
            this.readState = u.INIT;
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
            if (o = this.searchHeaderListEnd(c, o), o === -1) {
              this.readState = u.HEADER;
              return;
            }
          }
          const i = this.partIndexToLength[this.partIndex], a = o + i, p = Math.min(a, c.length);
          if (await this.processPartStarted(c, o, p), this.remainingPartDataCount = i - (p - o), this.remainingPartDataCount > 0)
            return;
          if (o = a + this.boundaryLength, o >= c.length) {
            this.ignoreByteCount = this.boundaryLength - (c.length - a);
            return;
          }
        }
      }
    }
    copyExistingData(c, o) {
      return new Promise((i, a) => {
        const p = () => {
          if (c === o) {
            i();
            return;
          }
          const g = this.options.tasks[c];
          if (g.kind !== s.OperationKind.COPY) {
            a(new Error("Task kind must be COPY"));
            return;
          }
          n(g, this.out, this.options.oldFileFd, a, () => {
            c++, p();
          });
        };
        p();
      });
    }
    searchHeaderListEnd(c, o) {
      const i = c.indexOf(d, o);
      if (i !== -1)
        return i + d.length;
      const a = o === 0 ? c : c.slice(o);
      return this.headerListBuffer == null ? this.headerListBuffer = a : this.headerListBuffer = Buffer.concat([this.headerListBuffer, a]), -1;
    }
    onPartEnd() {
      const c = this.partIndexToLength[this.partIndex - 1];
      if (this.actualPartLength !== c)
        throw (0, e.newError)(`Expected length: ${c} differs from actual: ${this.actualPartLength}`, "ERR_DATA_SPLITTER_LENGTH_MISMATCH");
      this.actualPartLength = 0;
    }
    processPartStarted(c, o, i) {
      return this.partIndex !== 0 && this.onPartEnd(), this.processPartData(c, o, i);
    }
    processPartData(c, o, i) {
      this.actualPartLength += i - o, this.transferred += i - o, this.delta += i - o;
      const a = this.out;
      return a.write(o === 0 && c.length === i ? c : c.slice(o, i)) ? Promise.resolve() : new Promise((p, g) => {
        a.on("error", g), a.once("drain", () => {
          a.removeListener("error", g), p();
        });
      });
    }
  };
  return Xt.DataSplitter = h, Xt;
}
var wr = {}, Hl;
function Hd() {
  if (Hl) return wr;
  Hl = 1, Object.defineProperty(wr, "__esModule", { value: !0 }), wr.executeTasksUsingMultipleRangeRequests = s, wr.checkIsRangesSupported = u;
  const e = qe(), t = nu(), l = Gs();
  function s(n, h, r, c, o) {
    const i = (a) => {
      if (a >= h.length) {
        n.fileMetadataBuffer != null && r.write(n.fileMetadataBuffer), r.end();
        return;
      }
      const p = a + 1e3;
      d(n, {
        tasks: h,
        start: a,
        end: Math.min(h.length, p),
        oldFileFd: c
      }, r, () => i(p), o);
    };
    return i;
  }
  function d(n, h, r, c, o) {
    let i = "bytes=", a = 0, p = 0;
    const g = /* @__PURE__ */ new Map(), v = [];
    for (let R = h.start; R < h.end; R++) {
      const C = h.tasks[R];
      C.kind === l.OperationKind.DOWNLOAD && (i += `${C.start}-${C.end - 1}, `, g.set(a, R), a++, v.push(C.end - C.start), p += C.end - C.start);
    }
    if (a <= 1) {
      const R = (C) => {
        if (C >= h.end) {
          c();
          return;
        }
        const D = h.tasks[C++];
        if (D.kind === l.OperationKind.COPY)
          (0, t.copyData)(D, r, h.oldFileFd, o, () => R(C));
        else {
          const P = n.createRequestOptions();
          P.headers.Range = `bytes=${D.start}-${D.end - 1}`;
          const F = n.httpExecutor.createRequest(P, (O) => {
            O.on("error", o), u(O, o) && (O.pipe(r, {
              end: !1
            }), O.once("end", () => R(C)));
          });
          n.httpExecutor.addErrorAndTimeoutHandlers(F, o), F.end();
        }
      };
      R(h.start);
      return;
    }
    const m = n.createRequestOptions();
    m.headers.Range = i.substring(0, i.length - 2);
    const w = n.httpExecutor.createRequest(m, (R) => {
      if (!u(R, o))
        return;
      const C = (0, e.safeGetHeader)(R, "content-type"), D = /^multipart\/.+?\s*;\s*boundary=(?:"([^"]+)"|([^\s";]+))\s*$/i.exec(C);
      if (D == null) {
        o(new Error(`Content-Type "multipart/byteranges" is expected, but got "${C}"`));
        return;
      }
      const P = new t.DataSplitter(r, h, g, D[1] || D[2], v, c, p, n.options.onProgress);
      P.on("error", o), R.pipe(P), R.on("end", () => {
        setTimeout(() => {
          w.abort(), o(new Error("Response ends without calling any handlers"));
        }, 1e4);
      });
    });
    n.httpExecutor.addErrorAndTimeoutHandlers(w, o), w.end();
  }
  function u(n, h) {
    if (n.statusCode >= 400)
      return h((0, e.createHttpError)(n)), !1;
    if (n.statusCode !== 206) {
      const r = (0, e.safeGetHeader)(n, "accept-ranges");
      if (r == null || r === "none")
        return h(new Error(`Server doesn't support Accept-Ranges (response code ${n.statusCode})`)), !1;
    }
    return !0;
  }
  return wr;
}
var _r = {}, Gl;
function Gd() {
  if (Gl) return _r;
  Gl = 1, Object.defineProperty(_r, "__esModule", { value: !0 }), _r.ProgressDifferentialDownloadCallbackTransform = void 0;
  const e = Ur;
  var t;
  (function(s) {
    s[s.COPY = 0] = "COPY", s[s.DOWNLOAD = 1] = "DOWNLOAD";
  })(t || (t = {}));
  let l = class extends e.Transform {
    constructor(d, u, n) {
      super(), this.progressDifferentialDownloadInfo = d, this.cancellationToken = u, this.onProgress = n, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.expectedBytes = 0, this.index = 0, this.operationType = t.COPY, this.nextUpdate = this.start + 1e3;
    }
    _transform(d, u, n) {
      if (this.cancellationToken.cancelled) {
        n(new Error("cancelled"), null);
        return;
      }
      if (this.operationType == t.COPY) {
        n(null, d);
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
      }), this.delta = 0), n(null, d);
    }
    beginFileCopy() {
      this.operationType = t.COPY;
    }
    beginRangeDownload() {
      this.operationType = t.DOWNLOAD, this.expectedBytes += this.progressDifferentialDownloadInfo.expectedByteCounts[this.index++];
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
  return _r.ProgressDifferentialDownloadCallbackTransform = l, _r;
}
var Wl;
function iu() {
  if (Wl) return Er;
  Wl = 1, Object.defineProperty(Er, "__esModule", { value: !0 }), Er.DifferentialDownloader = void 0;
  const e = qe(), t = /* @__PURE__ */ Rt(), l = At, s = nu(), d = St, u = Gs(), n = Hd(), h = Gd();
  let r = class {
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
      const g = this.logger, v = (0, u.computeOperations)(a, p, g);
      g.debug != null && g.debug(JSON.stringify(v, null, 2));
      let m = 0, w = 0;
      for (const C of v) {
        const D = C.end - C.start;
        C.kind === u.OperationKind.DOWNLOAD ? m += D : w += D;
      }
      const R = this.blockAwareFileInfo.size;
      if (m + w + (this.fileMetadataBuffer == null ? 0 : this.fileMetadataBuffer.length) !== R)
        throw new Error(`Internal error, size mismatch: downloadSize: ${m}, copySize: ${w}, newSize: ${R}`);
      return g.info(`Full: ${c(R)}, To download: ${c(m)} (${Math.round(m / (R / 100))}%)`), this.downloadFile(v);
    }
    downloadFile(a) {
      const p = [], g = () => Promise.all(p.map((v) => (0, t.close)(v.descriptor).catch((m) => {
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
      const g = await (0, t.open)(this.options.oldFile, "r");
      p.push({ descriptor: g, path: this.options.oldFile });
      const v = await (0, t.open)(this.options.newFile, "w");
      p.push({ descriptor: v, path: this.options.newFile });
      const m = (0, l.createWriteStream)(this.options.newFile, { fd: v });
      await new Promise((w, R) => {
        const C = [];
        let D;
        if (!this.options.isUseMultipleRangeRequest && this.options.onProgress) {
          const $ = [];
          let H = 0;
          for (const b of a)
            b.kind === u.OperationKind.DOWNLOAD && ($.push(b.end - b.start), H += b.end - b.start);
          const x = {
            expectedByteCounts: $,
            grandTotal: H
          };
          D = new h.ProgressDifferentialDownloadCallbackTransform(x, this.options.cancellationToken, this.options.onProgress), C.push(D);
        }
        const P = new e.DigestTransform(this.blockAwareFileInfo.sha512);
        P.isValidateOnEnd = !1, C.push(P), m.on("finish", () => {
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
        }), C.push(m);
        let F = null;
        for (const $ of C)
          $.on("error", R), F == null ? F = $ : F = F.pipe($);
        const O = C[0];
        let L;
        if (this.options.isUseMultipleRangeRequest) {
          L = (0, n.executeTasksUsingMultipleRangeRequests)(this, a, O, g, R), L(0);
          return;
        }
        let S = 0, z = null;
        this.logger.info(`Differential download: ${this.options.newUrl}`);
        const G = this.createRequestOptions();
        G.redirect = "manual", L = ($) => {
          var H, x;
          if ($ >= a.length) {
            this.fileMetadataBuffer != null && O.write(this.fileMetadataBuffer), O.end();
            return;
          }
          const b = a[$++];
          if (b.kind === u.OperationKind.COPY) {
            D && D.beginFileCopy(), (0, s.copyData)(b, O, g, R, () => L($));
            return;
          }
          const I = `bytes=${b.start}-${b.end - 1}`;
          G.headers.range = I, (x = (H = this.logger) === null || H === void 0 ? void 0 : H.debug) === null || x === void 0 || x.call(H, `download range: ${I}`), D && D.beginRangeDownload();
          const A = this.httpExecutor.createRequest(G, (k) => {
            k.on("error", R), k.on("aborted", () => {
              R(new Error("response has been aborted by the server"));
            }), k.statusCode >= 400 && R((0, e.createHttpError)(k)), k.pipe(O, {
              end: !1
            }), k.once("end", () => {
              D && D.endRangeDownload(), ++S === 100 ? (S = 0, setTimeout(() => L($), 1e3)) : L($);
            });
          });
          A.on("redirect", (k, M, W) => {
            this.logger.info(`Redirect to ${o(W)}`), z = W, (0, e.configureRequestUrl)(new d.URL(z), G), A.followRedirect();
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
          (0, n.checkIsRangesSupported)(w, v) && (w.on("error", v), w.on("aborted", () => {
            v(new Error("response has been aborted by the server"));
          }), w.on("data", p), w.on("end", () => g()));
        });
        this.httpExecutor.addErrorAndTimeoutHandlers(m, v), m.end();
      });
    }
  };
  Er.DifferentialDownloader = r;
  function c(i, a = " KB") {
    return new Intl.NumberFormat("en").format((i / 1024).toFixed(2)) + a;
  }
  function o(i) {
    const a = i.indexOf("?");
    return a < 0 ? i : i.substring(0, a);
  }
  return Er;
}
var Vl;
function Wd() {
  if (Vl) return vr;
  Vl = 1, Object.defineProperty(vr, "__esModule", { value: !0 }), vr.GenericDifferentialDownloader = void 0;
  const e = iu();
  let t = class extends e.DifferentialDownloader {
    download(s, d) {
      return this.doDownload(s, d);
    }
  };
  return vr.GenericDifferentialDownloader = t, vr;
}
var Ts = {}, zl;
function Bt() {
  return zl || (zl = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.UpdaterSignal = e.UPDATE_DOWNLOADED = e.DOWNLOAD_PROGRESS = e.CancellationToken = void 0, e.addHandler = s;
    const t = qe();
    Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
      return t.CancellationToken;
    } }), e.DOWNLOAD_PROGRESS = "download-progress", e.UPDATE_DOWNLOADED = "update-downloaded";
    class l {
      constructor(u) {
        this.emitter = u;
      }
      /**
       * Emitted when an authenticating proxy is [asking for user credentials](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login).
       */
      login(u) {
        s(this.emitter, "login", u);
      }
      progress(u) {
        s(this.emitter, e.DOWNLOAD_PROGRESS, u);
      }
      updateDownloaded(u) {
        s(this.emitter, e.UPDATE_DOWNLOADED, u);
      }
      updateCancelled(u) {
        s(this.emitter, "update-cancelled", u);
      }
    }
    e.UpdaterSignal = l;
    function s(d, u, n) {
      d.on(u, n);
    }
  })(Ts)), Ts;
}
var Yl;
function Ws() {
  if (Yl) return Dt;
  Yl = 1, Object.defineProperty(Dt, "__esModule", { value: !0 }), Dt.NoOpLogger = Dt.AppUpdater = void 0;
  const e = qe(), t = kr, l = dn, s = Tc, d = /* @__PURE__ */ Rt(), u = ks(), n = ld(), h = Ne, r = Zc(), c = Ld(), o = Ud(), i = kd(), a = tu(), p = jd(), g = Pc, v = Wd(), m = Bt();
  let w = class su extends s.EventEmitter {
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
      return (0, i.getNetSession)();
    }
    /**
     * The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
     * Set it to `null` if you would like to disable a logging feature.
     */
    get logger() {
      return this._logger;
    }
    set logger(P) {
      this._logger = P ?? new C();
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * test only
     * @private
     */
    set updateConfigPath(P) {
      this.clientPromise = null, this._appUpdateConfigPath = P, this.configOnDisk = new n.Lazy(() => this.loadUpdateConfig());
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
      super(), this.autoDownload = !0, this.autoInstallOnAppQuit = !0, this.autoRunAppAfterInstall = !0, this.allowPrerelease = !1, this.fullChangelog = !1, this.allowDowngrade = !1, this.disableWebInstaller = !1, this.disableDifferentialDownload = !1, this.forceDevUpdateConfig = !1, this.previousBlockmapBaseUrlOverride = null, this._channel = null, this.downloadedUpdateHelper = null, this.requestHeaders = null, this._logger = console, this.signals = new m.UpdaterSignal(this), this._appUpdateConfigPath = null, this._isUpdateSupported = (S) => this.checkIfUpdateSupported(S), this._isUserWithinRollout = (S) => this.isStagingMatch(S), this.clientPromise = null, this.stagingUserIdPromise = new n.Lazy(() => this.getOrCreateStagingUserId()), this.configOnDisk = new n.Lazy(() => this.loadUpdateConfig()), this.checkForUpdatesPromise = null, this.downloadPromise = null, this.updateInfoAndProvider = null, this._testOnlyOptions = null, this.on("error", (S) => {
        this._logger.error(`Error: ${S.stack || S.message}`);
      }), F == null ? (this.app = new o.ElectronAppAdapter(), this.httpExecutor = new i.ElectronHttpExecutor((S, z) => this.emit("login", S, z))) : (this.app = F, this.httpExecutor = null);
      const O = this.app.version, L = (0, r.parse)(O);
      if (L == null)
        throw (0, e.newError)(`App version is not a valid semver version: "${O}"`, "ERR_UPDATER_INVALID_VERSION");
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
      let O;
      typeof P == "string" ? O = new a.GenericProvider({ provider: "generic", url: P }, this, {
        ...F,
        isUseMultipleRangeRequest: (0, p.isUrlProbablySupportMultiRangeRequests)(P)
      }) : O = (0, p.createClient)(P, this, F), this.clientPromise = Promise.resolve(O);
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
      return this._logger.info("Checking for update"), P = this.doCheckForUpdates().then((O) => (F(), O)).catch((O) => {
        throw F(), this.emit("error", O, `Cannot check for updates: ${(O.stack || O).toString()}`), O;
      }), this.checkForUpdatesPromise = P, P;
    }
    isUpdaterActive() {
      return this.app.isPackaged || this.forceDevUpdateConfig ? !0 : (this._logger.info("Skip checkForUpdates because application is not packed and dev update config is not forced"), !1);
    }
    // noinspection JSUnusedGlobalSymbols
    checkForUpdatesAndNotify(P) {
      return this.checkForUpdates().then((F) => F?.downloadPromise ? (F.downloadPromise.then(() => {
        const O = su.formatDownloadNotification(F.updateInfo.version, this.app.name, P);
        new xt.Notification(O).show();
      }), F) : (this._logger.debug != null && this._logger.debug("checkForUpdatesAndNotify called, downloadPromise is null"), F));
    }
    static formatDownloadNotification(P, F, O) {
      return O == null && (O = {
        title: "A new update is ready to install",
        body: "{appName} version {version} has been downloaded and will be automatically installed on exit"
      }), O = {
        title: O.title.replace("{appName}", F).replace("{version}", P),
        body: O.body.replace("{appName}", F).replace("{version}", P)
      }, O;
    }
    async isStagingMatch(P) {
      const F = P.stagingPercentage;
      let O = F;
      if (O == null)
        return !0;
      if (O = parseInt(O, 10), isNaN(O))
        return this._logger.warn(`Staging percentage is NaN: ${F}`), !0;
      O = O / 100;
      const L = await this.stagingUserIdPromise.value, z = e.UUID.parse(L).readUInt32BE(12) / 4294967295;
      return this._logger.info(`Staging percentage: ${O}, percentage: ${z}, user id: ${L}`), z < O;
    }
    computeFinalHeaders(P) {
      return this.requestHeaders != null && Object.assign(P, this.requestHeaders), P;
    }
    async isUpdateAvailable(P) {
      const F = (0, r.parse)(P.version);
      if (F == null)
        throw (0, e.newError)(`This file could not be downloaded, or the latest version (from update server) does not have a valid semver version: "${P.version}"`, "ERR_UPDATER_INVALID_VERSION");
      const O = this.currentVersion;
      if ((0, r.eq)(F, O) || !await Promise.resolve(this.isUpdateSupported(P)) || !await Promise.resolve(this.isUserWithinRollout(P)))
        return !1;
      const S = (0, r.gt)(F, O), z = (0, r.lt)(F, O);
      return S ? !0 : this.allowDowngrade && z;
    }
    checkIfUpdateSupported(P) {
      const F = P?.minimumSystemVersion, O = (0, l.release)();
      if (F)
        try {
          if ((0, r.lt)(O, F))
            return this._logger.info(`Current OS version ${O} is less than the minimum OS version required ${F} for version ${O}`), !1;
        } catch (L) {
          this._logger.warn(`Failed to compare current OS version(${O}) with minimum OS version(${F}): ${(L.message || L).toString()}`);
        }
      return !0;
    }
    async getUpdateInfoAndProvider() {
      await this.app.whenReady(), this.clientPromise == null && (this.clientPromise = this.configOnDisk.value.then((O) => (0, p.createClient)(O, this, this.createProviderRuntimeOptions())));
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
      const O = new e.CancellationToken();
      return {
        isUpdateAvailable: !0,
        versionInfo: F,
        updateInfo: F,
        cancellationToken: O,
        downloadPromise: this.autoDownload ? this.downloadUpdate(O) : null
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
      const O = (L) => {
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
        throw O(L);
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
      return this._appUpdateConfigPath == null && (this._appUpdateConfigPath = this.app.appUpdateConfigPath), (0, u.load)(await (0, d.readFile)(this._appUpdateConfigPath, "utf-8"));
    }
    computeRequestHeaders(P) {
      const F = P.fileExtraDownloadHeaders;
      if (F != null) {
        const O = this.requestHeaders;
        return O == null ? F : {
          ...F,
          ...O
        };
      }
      return this.computeFinalHeaders({ accept: "*/*" });
    }
    async getOrCreateStagingUserId() {
      const P = h.join(this.app.userDataPath, ".updaterId");
      try {
        const O = await (0, d.readFile)(P, "utf-8");
        if (e.UUID.check(O))
          return O;
        this._logger.warn(`Staging user id file exists, but content was invalid: ${O}`);
      } catch (O) {
        O.code !== "ENOENT" && this._logger.warn(`Couldn't read staging user ID, creating a blank one: ${O}`);
      }
      const F = e.UUID.v5((0, t.randomBytes)(4096), e.UUID.OID);
      this._logger.info(`Generated new staging user ID: ${F}`);
      try {
        await (0, d.outputFile)(P, F);
      } catch (O) {
        this._logger.warn(`Couldn't write out staging user ID: ${O}`);
      }
      return F;
    }
    /** @internal */
    get isAddNoCacheQuery() {
      const P = this.requestHeaders;
      if (P == null)
        return !0;
      for (const F of Object.keys(P)) {
        const O = F.toLowerCase();
        if (O === "authorization" || O === "private-token")
          return !1;
      }
      return !0;
    }
    async getOrCreateDownloadHelper() {
      let P = this.downloadedUpdateHelper;
      if (P == null) {
        const F = (await this.configOnDisk.value).updaterCacheDirName, O = this._logger;
        F == null && O.error("updaterCacheDirName is not specified in app-update.yml Was app build using at least electron-builder 20.34.0?");
        const L = h.join(this.app.baseCachePath, F || this.app.name);
        O.debug != null && O.debug(`updater cache dir: ${L}`), P = new c.DownloadedUpdateHelper(L), this.downloadedUpdateHelper = P;
      }
      return P;
    }
    async executeDownload(P) {
      const F = P.fileInfo, O = {
        headers: P.downloadUpdateOptions.requestHeaders,
        cancellationToken: P.downloadUpdateOptions.cancellationToken,
        sha2: F.info.sha2,
        sha512: F.info.sha512
      };
      this.listenerCount(m.DOWNLOAD_PROGRESS) > 0 && (O.onProgress = (te) => this.emit(m.DOWNLOAD_PROGRESS, te));
      const L = P.downloadUpdateOptions.updateInfoAndProvider.info, S = L.version, z = F.packageInfo;
      function G() {
        const te = decodeURIComponent(P.fileInfo.url.pathname);
        return te.toLowerCase().endsWith(`.${P.fileExtension.toLowerCase()}`) ? h.basename(te) : h.basename(P.fileInfo.info.url);
      }
      const $ = await this.getOrCreateDownloadHelper(), H = $.cacheDirForPendingUpdate;
      await (0, d.mkdir)(H, { recursive: !0 });
      const x = G();
      let b = h.join(H, x);
      const I = z == null ? null : h.join(H, `package-${S}${h.extname(z.path) || ".7z"}`), A = async (te) => {
        await $.setDownloadedFile(b, I, L, F, x, te), await P.done({
          ...L,
          downloadedFile: b
        });
        const de = h.join(H, "current.blockmap");
        return await (0, d.pathExists)(de) && await (0, d.copyFile)(de, h.join($.cacheDir, "current.blockmap")), I == null ? [b] : [b, I];
      }, k = this._logger, M = await $.validateDownloadedPath(b, L, F, k);
      if (M != null)
        return b = M, await A(!1);
      const W = async () => (await $.clear().catch(() => {
      }), await (0, d.unlink)(b).catch(() => {
      })), ie = await (0, c.createTempUpdateFile)(`temp-${x}`, H, k);
      try {
        await P.task(ie, O, I, W), await (0, e.retry)(() => (0, d.rename)(ie, b), {
          retries: 60,
          interval: 500,
          shouldRetry: (te) => te instanceof Error && /^EBUSY:/.test(te.message) ? !0 : (k.warn(`Cannot rename temp file to final file: ${te.message || te.stack}`), !1)
        });
      } catch (te) {
        throw await W(), te instanceof e.CancellationError && (k.info("cancelled"), this.emit("update-cancelled", L)), te;
      }
      return k.info(`New version ${S} has been downloaded to ${b}`), await A(!0);
    }
    async differentialDownloadInstaller(P, F, O, L, S) {
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
          newFile: O,
          isUseMultipleRangeRequest: z.isUseMultipleRangeRequest,
          requestHeaders: F.requestHeaders,
          cancellationToken: F.cancellationToken
        };
        this.listenerCount(m.DOWNLOAD_PROGRESS) > 0 && (H.onProgress = (k) => this.emit(m.DOWNLOAD_PROGRESS, k));
        const x = async (k, M) => {
          const W = h.join(M, "current.blockmap");
          await (0, d.outputFile)(W, (0, g.gzipSync)(JSON.stringify(k)));
        }, b = async (k) => {
          const M = h.join(k, "current.blockmap");
          try {
            if (await (0, d.pathExists)(M))
              return JSON.parse((0, g.gunzipSync)(await (0, d.readFile)(M)).toString());
          } catch (W) {
            this._logger.warn(`Cannot parse blockmap "${M}", error: ${W}`);
          }
          return null;
        }, I = await $(G[1]);
        await x(I, this.downloadedUpdateHelper.cacheDirForPendingUpdate);
        let A = await b(this.downloadedUpdateHelper.cacheDir);
        return A == null && (A = await $(G[0])), await new v.GenericDifferentialDownloader(P.info, this.httpExecutor, H).download(A, I), !1;
      } catch (z) {
        if (this._logger.error(`Cannot download differentially, fallback to full download: ${z.stack || z}`), this._testOnlyOptions != null)
          throw z;
        return !0;
      }
    }
  };
  Dt.AppUpdater = w;
  function R(D) {
    const P = (0, r.prerelease)(D);
    return P != null && P.length > 0;
  }
  class C {
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
  return Dt.NoOpLogger = C, Dt;
}
var Xl;
function _n() {
  if (Xl) return ar;
  Xl = 1, Object.defineProperty(ar, "__esModule", { value: !0 }), ar.BaseUpdater = void 0;
  const e = hn, t = Ne, l = Ws();
  let s = class extends l.AppUpdater {
    constructor(u, n) {
      super(u, n), this.quitAndInstallCalled = !1, this.quitHandlerAdded = !1;
    }
    quitAndInstall(u = !1, n = !1) {
      this._logger.info("Install on explicit quitAndInstall"), this.install(u, u ? n : this.autoRunAppAfterInstall) ? setImmediate(() => {
        xt.autoUpdater.emit("before-quit-for-update"), this.app.quit();
      }) : this.quitAndInstallCalled = !1;
    }
    executeDownload(u) {
      return super.executeDownload({
        ...u,
        done: (n) => (this.dispatchUpdateDownloaded(n), this.addQuitHandler(), Promise.resolve())
      });
    }
    get installerPath() {
      return this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.file;
    }
    // must be sync (because quit even handler is not async)
    install(u = !1, n = !1) {
      if (this.quitAndInstallCalled)
        return this._logger.warn("install call ignored: quitAndInstallCalled is set to true"), !1;
      const h = this.downloadedUpdateHelper, r = this.installerPath, c = h == null ? null : h.downloadedFileInfo;
      if (r == null || c == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      this.quitAndInstallCalled = !0;
      try {
        return this._logger.info(`Install: isSilent: ${u}, isForceRunAfter: ${n}`), this.doInstall({
          isSilent: u,
          isForceRunAfter: n,
          isAdminRightsRequired: c.isAdminRightsRequired
        });
      } catch (o) {
        return this.dispatchError(o), !1;
      }
    }
    addQuitHandler() {
      this.quitHandlerAdded || !this.autoInstallOnAppQuit || (this.quitHandlerAdded = !0, this.app.onQuit((u) => {
        if (this.quitAndInstallCalled) {
          this._logger.info("Update installer has already been triggered. Quitting application.");
          return;
        }
        if (!this.autoInstallOnAppQuit) {
          this._logger.info("Update will not be installed on quit because autoInstallOnAppQuit is set to false.");
          return;
        }
        if (u !== 0) {
          this._logger.info(`Update will be not installed on quit because application is quitting with exit code ${u}`);
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
    sanitizeEnvPath(u) {
      return u.split(t.delimiter).filter((n) => t.isAbsolute(n)).join(t.delimiter);
    }
    spawnSyncLog(u, n = [], h = {}) {
      var r;
      this._logger.info(`Executing: ${u} with args: ${n}`);
      const c = { ...process.env, ...h }, o = (0, e.spawnSync)(u, n, {
        env: { ...c, PATH: this.sanitizeEnvPath((r = c.PATH) !== null && r !== void 0 ? r : "") },
        encoding: "utf-8",
        shell: !0
      }), { error: i, status: a, stdout: p, stderr: g } = o;
      if (i != null)
        throw this._logger.error(g), i;
      if (a != null && a !== 0)
        throw this._logger.error(g), new Error(`Command ${u} exited with code ${a}`);
      return p.trim();
    }
    /**
     * This handles both node 8 and node 10 way of emitting error when spawning a process
     *   - node 8: Throws the error
     *   - node 10: Emit the error(Need to listen with on)
     */
    // https://github.com/electron-userland/electron-builder/issues/1129
    // Node 8 sends errors: https://nodejs.org/dist/latest-v8.x/docs/api/errors.html#errors_common_system_errors
    async spawnLog(u, n = [], h = void 0, r = "ignore") {
      return this._logger.info(`Executing: ${u} with args: ${n}`), new Promise((c, o) => {
        try {
          const i = { stdio: r, env: h, detached: !0 }, a = (0, e.spawn)(u, n, i);
          a.on("error", (p) => {
            o(p);
          }), a.unref(), a.pid !== void 0 && c(!0);
        } catch (i) {
          o(i);
        }
      });
    }
  };
  return ar.BaseUpdater = s, ar;
}
var Sr = {}, Ar = {}, Jl;
function ou() {
  if (Jl) return Ar;
  Jl = 1, Object.defineProperty(Ar, "__esModule", { value: !0 }), Ar.FileWithEmbeddedBlockMapDifferentialDownloader = void 0;
  const e = /* @__PURE__ */ Rt(), t = iu(), l = Pc;
  let s = class extends t.DifferentialDownloader {
    async download() {
      const h = this.blockAwareFileInfo, r = h.size, c = r - (h.blockMapSize + 4);
      this.fileMetadataBuffer = await this.readRemoteBytes(c, r - 1);
      const o = d(this.fileMetadataBuffer.slice(0, this.fileMetadataBuffer.length - 4));
      await this.doDownload(await u(this.options.oldFile), o);
    }
  };
  Ar.FileWithEmbeddedBlockMapDifferentialDownloader = s;
  function d(n) {
    return JSON.parse((0, l.inflateRawSync)(n).toString());
  }
  async function u(n) {
    const h = await (0, e.open)(n, "r");
    try {
      const r = (await (0, e.fstat)(h)).size, c = Buffer.allocUnsafe(4);
      await (0, e.read)(h, c, 0, c.length, r - c.length);
      const o = Buffer.allocUnsafe(c.readUInt32BE(0));
      return await (0, e.read)(h, o, 0, o.length, r - c.length - o.length), await (0, e.close)(h), d(o);
    } catch (r) {
      throw await (0, e.close)(h), r;
    }
  }
  return Ar;
}
var Kl;
function Ql() {
  if (Kl) return Sr;
  Kl = 1, Object.defineProperty(Sr, "__esModule", { value: !0 }), Sr.AppImageUpdater = void 0;
  const e = qe(), t = hn, l = /* @__PURE__ */ Rt(), s = At, d = Ne, u = _n(), n = ou(), h = Qe(), r = Bt();
  let c = class extends u.BaseUpdater {
    constructor(i, a) {
      super(i, a);
    }
    isUpdaterActive() {
      return process.env.APPIMAGE == null && !this.forceDevUpdateConfig ? (process.env.SNAP == null ? this._logger.warn("APPIMAGE env is not defined, current application is not an AppImage") : this._logger.info("SNAP env is defined, updater is disabled"), !1) : super.isUpdaterActive();
    }
    /*** @private */
    doDownloadUpdate(i) {
      const a = i.updateInfoAndProvider.provider, p = (0, h.findFile)(a.resolveFiles(i.updateInfoAndProvider.info), "AppImage", ["rpm", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "AppImage",
        fileInfo: p,
        downloadUpdateOptions: i,
        task: async (g, v) => {
          const m = process.env.APPIMAGE;
          if (m == null)
            throw (0, e.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
          (i.disableDifferentialDownload || await this.downloadDifferential(p, m, g, a, i)) && await this.httpExecutor.download(p.url, g, v), await (0, l.chmod)(g, 493);
        }
      });
    }
    async downloadDifferential(i, a, p, g, v) {
      try {
        const m = {
          newUrl: i.url,
          oldFile: a,
          logger: this._logger,
          newFile: p,
          isUseMultipleRangeRequest: g.isUseMultipleRangeRequest,
          requestHeaders: v.requestHeaders,
          cancellationToken: v.cancellationToken
        };
        return this.listenerCount(r.DOWNLOAD_PROGRESS) > 0 && (m.onProgress = (w) => this.emit(r.DOWNLOAD_PROGRESS, w)), await new n.FileWithEmbeddedBlockMapDifferentialDownloader(i.info, this.httpExecutor, m).download(), !1;
      } catch (m) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${m.stack || m}`), process.platform === "linux";
      }
    }
    doInstall(i) {
      const a = process.env.APPIMAGE;
      if (a == null)
        throw (0, e.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
      if (!d.isAbsolute(a) || a.includes("\0"))
        throw (0, e.newError)(`APPIMAGE env is not a valid absolute path: "${a}"`, "ERR_UPDATER_OLD_FILE_NOT_FOUND");
      (0, s.unlinkSync)(a);
      let p;
      const g = d.basename(a), v = this.installerPath;
      if (v == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      d.basename(v) === g || !/\d+\.\d+\.\d+/.test(g) ? p = a : p = d.join(d.dirname(a), d.basename(v)), (0, t.execFileSync)("mv", ["-f", v, p]), p !== a && this.emit("appimage-filename-updated", p);
      const m = {
        ...process.env,
        APPIMAGE_SILENT_INSTALL: "true"
      };
      return i.isForceRunAfter ? this.spawnLog(p, [], m) : (m.APPIMAGE_EXIT_AFTER_INSTALL = "true", (0, t.execFileSync)(p, [], { env: m })), !0;
    }
  };
  return Sr.AppImageUpdater = c, Sr;
}
var Rr = {}, Tr = {}, Zl;
function Vs() {
  if (Zl) return Tr;
  Zl = 1, Object.defineProperty(Tr, "__esModule", { value: !0 }), Tr.LinuxUpdater = void 0;
  const e = _n(), t = /^[a-zA-Z0-9_-]+$/;
  let l = class extends e.BaseUpdater {
    constructor(d, u) {
      super(d, u);
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
      const { name: u } = this.app, h = `"${u.replace(/["`$\\!\n\r;|&<>(){}*?[\]#~]/g, "")} would like to update"`, r = this.sudoWithArgs(h);
      this._logger.info(`Running as non-root user, using sudo to install: ${r}`);
      let c = '"';
      return (/pkexec/i.test(r[0]) || r[0] === "sudo") && (c = ""), this.spawnSyncLog(r[0], [...r.length > 1 ? r.slice(1) : [], `${c}/bin/bash`, "-c", `'${d.join(" ")}'${c}`]);
    }
    sudoWithArgs(d) {
      const u = this.determineSudoCommand(), n = [u];
      return /kdesudo/i.test(u) ? (n.push("--comment", d), n.push("-c")) : /gksudo/i.test(u) ? n.push("--message", d) : /pkexec/i.test(u) && n.push("--disable-internal-agent"), n;
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
      for (const u of d)
        if (this.hasCommand(u))
          return u;
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
      var u;
      let n = d;
      const h = (u = process.env.ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER) === null || u === void 0 ? void 0 : u.trim();
      h && (t.test(h) ? n = [h] : this._logger.warn(`ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER "${h}" contains unsafe characters. Ignoring override.`));
      for (const o of n)
        if (this.hasCommand(o))
          return o;
      const r = h ? `ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER override "${h}", ` : "", c = d[0];
      return this._logger.warn(`No package manager found in the list: ${r}${d.join(", ")}. Utilizing default: ${c}`), c;
    }
  };
  return Tr.LinuxUpdater = l, Tr;
}
var ec;
function tc() {
  if (ec) return Rr;
  ec = 1, Object.defineProperty(Rr, "__esModule", { value: !0 }), Rr.DebUpdater = void 0;
  const e = Qe(), t = Bt(), l = Vs();
  let s = class au extends l.LinuxUpdater {
    constructor(u, n) {
      super(u, n);
    }
    /*** @private */
    doDownloadUpdate(u) {
      const n = u.updateInfoAndProvider.provider, h = (0, e.findFile)(n.resolveFiles(u.updateInfoAndProvider.info), "deb", ["AppImage", "rpm", "pacman"]);
      return this.executeDownload({
        fileExtension: "deb",
        fileInfo: h,
        downloadUpdateOptions: u,
        task: async (r, c) => {
          this.listenerCount(t.DOWNLOAD_PROGRESS) > 0 && (c.onProgress = (o) => this.emit(t.DOWNLOAD_PROGRESS, o)), await this.httpExecutor.download(h.url, r, c);
        }
      });
    }
    doInstall(u) {
      const n = this.installerPath;
      if (n == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      if (!this.hasCommand("dpkg") && !this.hasCommand("apt"))
        return this.dispatchError(new Error("Neither dpkg nor apt command found. Cannot install .deb package.")), !1;
      const h = ["dpkg", "apt"], r = this.detectPackageManager(h);
      try {
        au.installWithCommandRunner(r, n, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
      } catch (c) {
        return this.dispatchError(c), !1;
      }
      return u.isForceRunAfter && this.app.relaunch(), !0;
    }
    static installWithCommandRunner(u, n, h, r) {
      var c;
      if (u === "dpkg")
        try {
          h(["dpkg", "-i", n]);
        } catch (o) {
          r.warn((c = o.message) !== null && c !== void 0 ? c : o), r.warn("dpkg installation failed, trying to fix broken dependencies with apt-get"), h(["apt-get", "install", "-f", "-y"]);
        }
      else if (u === "apt")
        r.warn("Using apt to install a local .deb. This may fail for unsigned packages unless properly configured."), h([
          "apt",
          "install",
          "-y",
          "--allow-unauthenticated",
          // needed for unsigned .debs
          "--allow-downgrades",
          // allow lower version installs
          "--allow-change-held-packages",
          n
        ]);
      else
        throw new Error(`Package manager ${u} not supported`);
    }
  };
  return Rr.DebUpdater = s, Rr;
}
var Cr = {}, rc;
function nc() {
  if (rc) return Cr;
  rc = 1, Object.defineProperty(Cr, "__esModule", { value: !0 }), Cr.PacmanUpdater = void 0;
  const e = Bt(), t = Qe(), l = Vs();
  let s = class lu extends l.LinuxUpdater {
    constructor(u, n) {
      super(u, n);
    }
    /*** @private */
    doDownloadUpdate(u) {
      const n = u.updateInfoAndProvider.provider, h = (0, t.findFile)(n.resolveFiles(u.updateInfoAndProvider.info), "pacman", ["AppImage", "deb", "rpm"]);
      return this.executeDownload({
        fileExtension: "pacman",
        fileInfo: h,
        downloadUpdateOptions: u,
        task: async (r, c) => {
          this.listenerCount(e.DOWNLOAD_PROGRESS) > 0 && (c.onProgress = (o) => this.emit(e.DOWNLOAD_PROGRESS, o)), await this.httpExecutor.download(h.url, r, c);
        }
      });
    }
    doInstall(u) {
      const n = this.installerPath;
      if (n == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      try {
        lu.installWithCommandRunner(n, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
      } catch (h) {
        return this.dispatchError(h), !1;
      }
      return u.isForceRunAfter && this.app.relaunch(), !0;
    }
    static installWithCommandRunner(u, n, h) {
      var r;
      try {
        n(["pacman", "-U", "--noconfirm", u]);
      } catch (c) {
        h.warn((r = c.message) !== null && r !== void 0 ? r : c), h.warn("pacman installation failed, attempting to update package database and retry");
        try {
          n(["pacman", "-Sy", "--noconfirm"]), n(["pacman", "-U", "--noconfirm", u]);
        } catch (o) {
          throw h.error("Retry after pacman -Sy failed"), o;
        }
      }
    }
  };
  return Cr.PacmanUpdater = s, Cr;
}
var br = {}, ic;
function sc() {
  if (ic) return br;
  ic = 1, Object.defineProperty(br, "__esModule", { value: !0 }), br.RpmUpdater = void 0;
  const e = Bt(), t = Qe(), l = Vs();
  let s = class cu extends l.LinuxUpdater {
    constructor(u, n) {
      super(u, n);
    }
    /*** @private */
    doDownloadUpdate(u) {
      const n = u.updateInfoAndProvider.provider, h = (0, t.findFile)(n.resolveFiles(u.updateInfoAndProvider.info), "rpm", ["AppImage", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "rpm",
        fileInfo: h,
        downloadUpdateOptions: u,
        task: async (r, c) => {
          this.listenerCount(e.DOWNLOAD_PROGRESS) > 0 && (c.onProgress = (o) => this.emit(e.DOWNLOAD_PROGRESS, o)), await this.httpExecutor.download(h.url, r, c);
        }
      });
    }
    doInstall(u) {
      const n = this.installerPath;
      if (n == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      const h = ["zypper", "dnf", "yum", "rpm"], r = this.detectPackageManager(h);
      try {
        cu.installWithCommandRunner(r, n, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
      } catch (c) {
        return this.dispatchError(c), !1;
      }
      return u.isForceRunAfter && this.app.relaunch(), !0;
    }
    static installWithCommandRunner(u, n, h, r) {
      if (u === "zypper")
        return h(["zypper", "--non-interactive", "--no-refresh", "install", "--allow-unsigned-rpm", "-f", n]);
      if (u === "dnf")
        return h(["dnf", "install", "--nogpgcheck", "-y", n]);
      if (u === "yum")
        return h(["yum", "install", "--nogpgcheck", "-y", n]);
      if (u === "rpm")
        return r.warn("Installing with rpm only (no dependency resolution)."), h(["rpm", "-Uvh", "--replacepkgs", "--replacefiles", "--nodeps", n]);
      throw new Error(`Package manager ${u} not supported`);
    }
  };
  return br.RpmUpdater = s, br;
}
var Pr = {}, oc;
function ac() {
  if (oc) return Pr;
  oc = 1, Object.defineProperty(Pr, "__esModule", { value: !0 }), Pr.MacUpdater = void 0;
  const e = qe(), t = /* @__PURE__ */ Rt(), l = At, s = Ne, d = Ef, u = Ws(), n = Qe(), h = hn, r = kr;
  let c = class uu extends u.AppUpdater {
    constructor(i, a) {
      super(i, a), this.nativeUpdater = xt.autoUpdater, this.squirrelDownloadedUpdate = !1, this.nativeUpdater.on("error", (p) => {
        this._logger.warn(p), this.emit("error", p);
      }), this.nativeUpdater.on("update-downloaded", () => {
        this.squirrelDownloadedUpdate = !0, this.debug("nativeUpdater.update-downloaded");
      });
    }
    /** Filters update files to the appropriate architecture.
     * On arm64 Macs (including Rosetta), arm64 files are preferred when available.
     * On x64 Macs, arm64 files are excluded. */
    static filterFilesForArch(i, a) {
      const p = (g) => {
        var v;
        return g.url.pathname.includes("arm64") || ((v = g.info.url) === null || v === void 0 ? void 0 : v.includes("arm64"));
      };
      return a && i.some(p) ? i.filter((g) => a === p(g)) : i.filter((g) => !p(g));
    }
    debug(i) {
      this._logger.debug != null && this._logger.debug(i);
    }
    closeServerIfExists() {
      this.server && (this.debug("Closing proxy server"), this.server.close((i) => {
        i && this.debug("proxy server wasn't already open, probably attempted closing again as a safety check before quit");
      }));
    }
    async doDownloadUpdate(i) {
      let a = i.updateInfoAndProvider.provider.resolveFiles(i.updateInfoAndProvider.info);
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
      m = m || process.arch === "arm64" || v, a = uu.filterFilesForArch(a, m);
      const w = (0, n.findFile)(a, "zip", ["pkg", "dmg"]);
      if (w == null)
        throw (0, e.newError)(`ZIP file not provided: ${(0, e.safeStringifyJson)(a)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
      const R = i.updateInfoAndProvider.provider, C = "update.zip";
      return this.executeDownload({
        fileExtension: "zip",
        fileInfo: w,
        downloadUpdateOptions: i,
        task: async (D, P) => {
          const F = s.join(this.downloadedUpdateHelper.cacheDir, C), O = () => (0, t.pathExistsSync)(F) ? !i.disableDifferentialDownload : (p.info("Unable to locate previous update.zip for differential download (is this first install?), falling back to full download"), !1);
          let L = !0;
          O() && (L = await this.differentialDownloadInstaller(w, i, D, R, C)), L && await this.httpExecutor.download(w.url, D, P);
        },
        done: async (D) => {
          if (!i.disableDifferentialDownload)
            try {
              const P = s.join(this.downloadedUpdateHelper.cacheDir, C);
              await (0, t.copyFile)(D.downloadedFile, P);
            } catch (P) {
              this._logger.warn(`Unable to copy file for caching for future differential downloads: ${P.message}`);
            }
          return this.updateDownloaded(w, D);
        }
      });
    }
    async updateDownloaded(i, a) {
      var p;
      const g = a.downloadedFile, v = (p = i.info.size) !== null && p !== void 0 ? p : (await (0, t.stat)(g)).size, m = this._logger, w = `fileToProxy=${i.url.href}`;
      this.closeServerIfExists(), this.debug(`Creating proxy server for native Squirrel.Mac (${w})`), this.server = (0, d.createServer)(), this.debug(`Proxy server for native Squirrel.Mac is created (${w})`), this.server.on("close", () => {
        m.info(`Proxy server for native Squirrel.Mac is closed (${w})`);
      });
      const R = (C) => {
        const D = C.address();
        return typeof D == "string" ? D : `http://127.0.0.1:${D?.port}`;
      };
      return await new Promise((C, D) => {
        const P = (0, r.randomBytes)(64).toString("base64").replace(/\//g, "_").replace(/\+/g, "-"), F = Buffer.from(`autoupdater:${P}`, "ascii"), O = `/${(0, r.randomBytes)(64).toString("hex")}.zip`;
        this.server.on("request", (L, S) => {
          const z = L.url;
          if (m.info(`${z} requested`), z === "/") {
            if (!L.headers.authorization || L.headers.authorization.indexOf("Basic ") === -1) {
              S.statusCode = 401, S.statusMessage = "Invalid Authentication Credentials", S.end(), m.warn("No authenthication info");
              return;
            }
            const H = L.headers.authorization.split(" ")[1], x = Buffer.from(H, "base64").toString("ascii"), [b, I] = x.split(":");
            if (b !== "autoupdater" || I !== P) {
              S.statusCode = 401, S.statusMessage = "Invalid Authentication Credentials", S.end(), m.warn("Invalid authenthication credentials");
              return;
            }
            const A = Buffer.from(`{ "url": "${R(this.server)}${O}" }`);
            S.writeHead(200, { "Content-Type": "application/json", "Content-Length": A.length }), S.end(A);
            return;
          }
          if (!z.startsWith(O)) {
            m.warn(`${z} requested, but not supported`), S.writeHead(404), S.end();
            return;
          }
          m.info(`${O} requested by Squirrel.Mac, pipe ${g}`);
          let G = !1;
          S.on("finish", () => {
            G || (this.nativeUpdater.removeListener("error", D), C([]));
          });
          const $ = (0, l.createReadStream)(g);
          $.on("error", (H) => {
            try {
              S.end();
            } catch (x) {
              m.warn(`cannot end response: ${x}`);
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
          }), this.dispatchUpdateDownloaded(a), this.autoInstallOnAppQuit ? (this.nativeUpdater.once("error", D), this.nativeUpdater.checkForUpdates()) : C([]);
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
  return Pr.MacUpdater = c, Pr;
}
var Or = {}, an = {}, lc;
function Vd() {
  if (lc) return an;
  lc = 1, Object.defineProperty(an, "__esModule", { value: !0 }), an.verifySignature = u;
  const e = qe(), t = hn, l = dn, s = Ne;
  function d(c, o) {
    return ['set "PSModulePath=" & chcp 65001 >NUL & powershell.exe', ["-NoProfile", "-NonInteractive", "-InputFormat", "None", "-Command", c], {
      shell: !0,
      timeout: o
    }];
  }
  function u(c, o, i) {
    return new Promise((a, p) => {
      const g = o.replace(/'/g, "''");
      i.info(`Verifying signature ${g}`), (0, t.execFile)(...d(`"Get-AuthenticodeSignature -LiteralPath '${g}' | ConvertTo-Json -Compress"`, 20 * 1e3), (v, m, w) => {
        var R;
        try {
          if (v != null || w) {
            h(i, v, w, p), a(null);
            return;
          }
          const C = n(m);
          if (C.Status === 0) {
            try {
              const O = s.normalize(C.Path), L = s.normalize(o);
              if (i.info(`LiteralPath: ${O}. Update Path: ${L}`), O !== L) {
                h(i, new Error(`LiteralPath of ${O} is different than ${L}`), w, p), a(null);
                return;
              }
            } catch (O) {
              i.warn(`Unable to verify LiteralPath of update asset due to missing data.Path. Skipping this step of validation. Message: ${(R = O.message) !== null && R !== void 0 ? R : O.stack}`);
            }
            const P = (0, e.parseDn)(C.SignerCertificate.Subject);
            let F = !1;
            for (const O of c) {
              const L = (0, e.parseDn)(O);
              if (L.size ? F = Array.from(L.keys()).every((z) => L.get(z) === P.get(z)) : O === P.get("CN") && (i.warn(`Signature validated using only CN ${O}. Please add your full Distinguished Name (DN) to publisherNames configuration`), F = !0), F) {
                a(null);
                return;
              }
            }
          }
          const D = `publisherNames: ${c.join(" | ")}, raw info: ` + JSON.stringify(C, (P, F) => P === "RawData" ? void 0 : F, 2);
          i.warn(`Sign verification failed, installer signed with incorrect certificate: ${D}`), a(D);
        } catch (C) {
          h(i, C, null, p), a(null);
          return;
        }
      });
    });
  }
  function n(c) {
    const o = JSON.parse(c);
    delete o.PrivateKey, delete o.IsOSBinary, delete o.SignatureType;
    const i = o.SignerCertificate;
    return i != null && (delete i.Archived, delete i.Extensions, delete i.Handle, delete i.HasPrivateKey, delete i.SubjectName), o;
  }
  function h(c, o, i, a) {
    if (r()) {
      c.warn(`Cannot execute Get-AuthenticodeSignature: ${o || i}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    try {
      (0, t.execFileSync)(...d("ConvertTo-Json test", 10 * 1e3));
    } catch (p) {
      c.warn(`Cannot execute ConvertTo-Json: ${p.message}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    o != null && a(o), i && a(new Error(`Cannot execute Get-AuthenticodeSignature, stderr: ${i}. Failing signature validation due to unknown stderr.`));
  }
  function r() {
    const c = l.release();
    return c.startsWith("6.") && !c.startsWith("6.3");
  }
  return an;
}
var cc;
function uc() {
  if (cc) return Or;
  cc = 1, Object.defineProperty(Or, "__esModule", { value: !0 }), Or.NsisUpdater = void 0;
  const e = qe(), t = Ne, l = _n(), s = ou(), d = Bt(), u = Qe(), n = /* @__PURE__ */ Rt(), h = Vd(), r = St;
  let c = class extends l.BaseUpdater {
    constructor(i, a) {
      super(i, a), this._verifyUpdateCodeSignature = (p, g) => (0, h.verifySignature)(p, g, this._logger);
    }
    /**
     * The verifyUpdateCodeSignature. You can pass [win-verify-signature](https://github.com/beyondkmp/win-verify-trust) or another custom verify function: ` (publisherName: string[], path: string) => Promise<string | null>`.
     * The default verify function uses [windowsExecutableCodeSignatureVerifier](https://github.com/electron-userland/electron-builder/blob/master/packages/electron-updater/src/windowsExecutableCodeSignatureVerifier.ts)
     */
    get verifyUpdateCodeSignature() {
      return this._verifyUpdateCodeSignature;
    }
    set verifyUpdateCodeSignature(i) {
      i && (this._verifyUpdateCodeSignature = i);
    }
    /*** @private */
    doDownloadUpdate(i) {
      const a = i.updateInfoAndProvider.provider, p = (0, u.findFile)(a.resolveFiles(i.updateInfoAndProvider.info), "exe");
      return this.executeDownload({
        fileExtension: "exe",
        downloadUpdateOptions: i,
        fileInfo: p,
        task: async (g, v, m, w) => {
          const R = p.packageInfo, C = R != null && m != null;
          if (C && i.disableWebInstaller)
            throw (0, e.newError)(`Unable to download new version ${i.updateInfoAndProvider.info.version}. Web Installers are disabled`, "ERR_UPDATER_WEB_INSTALLER_DISABLED");
          !C && !i.disableWebInstaller && this._logger.warn("disableWebInstaller is set to false, you should set it to true if you do not plan on using a web installer. This will default to true in a future version."), (C || i.disableDifferentialDownload || await this.differentialDownloadInstaller(p, i, g, a, e.CURRENT_APP_INSTALLER_FILE_NAME)) && await this.httpExecutor.download(p.url, g, v);
          const D = await this.verifySignature(g);
          if (D != null)
            throw await w(), (0, e.newError)(`New version ${i.updateInfoAndProvider.info.version} is not signed by the application owner: ${D}`, "ERR_UPDATER_INVALID_SIGNATURE");
          if (C && await this.differentialDownloadWebPackage(i, R, m, a))
            try {
              await this.httpExecutor.download(new r.URL(R.path), m, {
                headers: i.requestHeaders,
                cancellationToken: i.cancellationToken,
                sha512: R.sha512
              });
            } catch (P) {
              try {
                await (0, n.unlink)(m);
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
    async verifySignature(i) {
      let a;
      try {
        if (a = (await this.configOnDisk.value).publisherName, a == null)
          return null;
      } catch (p) {
        if (p.code === "ENOENT")
          return null;
        throw p;
      }
      return await this._verifyUpdateCodeSignature(Array.isArray(a) ? a : [a], i);
    }
    doInstall(i) {
      const a = this.installerPath;
      if (a == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      const p = ["--updated"];
      i.isSilent && p.push("/S"), i.isForceRunAfter && p.push("--force-run"), this.installDirectory && p.push(`/D=${this.installDirectory}`);
      const g = this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.packageFile;
      g != null && p.push(`--package-file=${g}`);
      const v = () => {
        this.spawnLog(t.join(process.resourcesPath, "elevate.exe"), [a].concat(p)).catch((m) => this.dispatchError(m));
      };
      return i.isAdminRightsRequired ? (this._logger.info("isAdminRightsRequired is set to true, run installer using elevate.exe"), v(), !0) : (this.spawnLog(a, p).catch((m) => {
        const w = m.code;
        this._logger.info(`Cannot run installer: error code: ${w}, error message: "${m.message}", will be executed again using elevate if EACCES, and will try to use electron.shell.openItem if ENOENT`), w === "UNKNOWN" || w === "EACCES" ? v() : w === "ENOENT" ? xt.shell.openPath(a).catch((R) => this.dispatchError(R)) : this.dispatchError(m);
      }), !0);
    }
    async differentialDownloadWebPackage(i, a, p, g) {
      if (a.blockMapSize == null)
        return !0;
      try {
        const v = {
          newUrl: new r.URL(a.path),
          oldFile: t.join(this.downloadedUpdateHelper.cacheDir, e.CURRENT_APP_PACKAGE_FILE_NAME),
          logger: this._logger,
          newFile: p,
          requestHeaders: this.requestHeaders,
          isUseMultipleRangeRequest: g.isUseMultipleRangeRequest,
          cancellationToken: i.cancellationToken
        };
        this.listenerCount(d.DOWNLOAD_PROGRESS) > 0 && (v.onProgress = (m) => this.emit(d.DOWNLOAD_PROGRESS, m)), await new s.FileWithEmbeddedBlockMapDifferentialDownloader(a, this.httpExecutor, v).download();
      } catch (v) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${v.stack || v}`), process.platform === "win32";
      }
      return !1;
    }
  };
  return Or.NsisUpdater = c, Or;
}
var fc;
function zd() {
  return fc || (fc = 1, (function(e) {
    var t = It && It.__createBinding || (Object.create ? (function(m, w, R, C) {
      C === void 0 && (C = R);
      var D = Object.getOwnPropertyDescriptor(w, R);
      (!D || ("get" in D ? !w.__esModule : D.writable || D.configurable)) && (D = { enumerable: !0, get: function() {
        return w[R];
      } }), Object.defineProperty(m, C, D);
    }) : (function(m, w, R, C) {
      C === void 0 && (C = R), m[C] = w[R];
    })), l = It && It.__exportStar || function(m, w) {
      for (var R in m) R !== "default" && !Object.prototype.hasOwnProperty.call(w, R) && t(w, m, R);
    };
    Object.defineProperty(e, "__esModule", { value: !0 }), e.NsisUpdater = e.MacUpdater = e.RpmUpdater = e.PacmanUpdater = e.DebUpdater = e.AppImageUpdater = e.Provider = e.NoOpLogger = e.AppUpdater = e.BaseUpdater = void 0;
    const s = /* @__PURE__ */ Rt(), d = Ne;
    var u = _n();
    Object.defineProperty(e, "BaseUpdater", { enumerable: !0, get: function() {
      return u.BaseUpdater;
    } });
    var n = Ws();
    Object.defineProperty(e, "AppUpdater", { enumerable: !0, get: function() {
      return n.AppUpdater;
    } }), Object.defineProperty(e, "NoOpLogger", { enumerable: !0, get: function() {
      return n.NoOpLogger;
    } });
    var h = Qe();
    Object.defineProperty(e, "Provider", { enumerable: !0, get: function() {
      return h.Provider;
    } });
    var r = Ql();
    Object.defineProperty(e, "AppImageUpdater", { enumerable: !0, get: function() {
      return r.AppImageUpdater;
    } });
    var c = tc();
    Object.defineProperty(e, "DebUpdater", { enumerable: !0, get: function() {
      return c.DebUpdater;
    } });
    var o = nc();
    Object.defineProperty(e, "PacmanUpdater", { enumerable: !0, get: function() {
      return o.PacmanUpdater;
    } });
    var i = sc();
    Object.defineProperty(e, "RpmUpdater", { enumerable: !0, get: function() {
      return i.RpmUpdater;
    } });
    var a = ac();
    Object.defineProperty(e, "MacUpdater", { enumerable: !0, get: function() {
      return a.MacUpdater;
    } });
    var p = uc();
    Object.defineProperty(e, "NsisUpdater", { enumerable: !0, get: function() {
      return p.NsisUpdater;
    } }), l(Bt(), e);
    let g;
    function v() {
      if (process.platform === "win32")
        g = new (uc()).NsisUpdater();
      else if (process.platform === "darwin")
        g = new (ac()).MacUpdater();
      else {
        g = new (Ql()).AppImageUpdater();
        try {
          const m = d.join(process.resourcesPath, "package-type");
          if (!(0, s.existsSync)(m))
            return g;
          switch ((0, s.readFileSync)(m).toString().trim()) {
            case "deb":
              g = new (tc()).DebUpdater();
              break;
            case "rpm":
              g = new (sc()).RpmUpdater();
              break;
            case "pacman":
              g = new (nc()).PacmanUpdater();
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
  })(It)), It;
}
var Cs = zd();
const Yd = Re(xr(), ".claude", "agentic-processes"), Fr = /* @__PURE__ */ new Map();
async function Xd(e, t, l) {
  fu("global");
  const s = Yd;
  if (console.log("Starting file watcher for:", s), console.log("Path exists:", Oe(s)), !Oe(s)) {
    console.log("Creating agentic-processes directory structure...");
    try {
      await Tn(Re(s, "active"), { recursive: !0 }), await Tn(Re(s, "completed"), { recursive: !0 }), await Tn(Re(s, "failed"), { recursive: !0 }), console.log("agentic-processes directory structure created successfully");
    } catch (r) {
      const c = `Failed to create agentic-processes directory structure: ${r instanceof Error ? r.message : String(r)}`;
      return console.error(c), l && l(c), { success: !1, error: c };
    }
  }
  const d = Is(s, {
    persistent: !0,
    ignoreInitial: !1,
    usePolling: !0,
    interval: 1e3,
    depth: 4,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100
    }
  }), u = (r) => {
    const c = r.replace(/\\/g, "/");
    return c.includes("/active/") || c.includes("/completed/") || c.includes("/failed/");
  }, n = (r) => {
    const c = r.replace(/\\/g, "/");
    return c.endsWith("/process.json") ? "process" : c.endsWith("/log.json") ? "log" : c.endsWith("/pending-interaction.json") ? "pending-interaction" : c.endsWith("/qa-session.json") ? "qa-session" : /\/memory\/[^/]+\.json$/.test(c) ? "memory" : null;
  }, h = (r) => {
    const c = r.replace(/\\/g, "/");
    if (/\/memory\/[^/]+\.json$/.test(c)) {
      const i = He(r), a = He(i);
      return Re(a, "process.json");
    }
    const o = He(r);
    return Re(o, "process.json");
  };
  return d.on("add", async (r) => {
    const c = n(r);
    if (!(!c || !u(r))) {
      console.log(`${c}.json found:`, r);
      try {
        const o = await Je(r, "utf-8"), i = JSON.parse(o), a = h(r);
        console.log(`${c} parsed for process:`, a), t("added", c, { path: r, processPath: a, content: i });
      } catch (o) {
        console.error(`Error reading ${c}.json:`, r, o);
      }
    }
  }), d.on("change", async (r) => {
    const c = n(r);
    if (!(!c || !u(r))) {
      console.log(`${c}.json changed:`, r);
      try {
        const o = await Je(r, "utf-8"), i = JSON.parse(o), a = h(r);
        t("changed", c, { path: r, processPath: a, content: i });
      } catch (o) {
        console.error(`Error reading ${c}.json:`, r, o);
      }
    }
  }), d.on("unlink", (r) => {
    const c = n(r);
    if (!c || !u(r)) return;
    console.log(`${c}.json removed:`, r);
    const o = h(r);
    t("removed", c, { path: r, processPath: o });
  }), d.on("error", (r) => {
    console.error("Watcher error:", r), l && l(`File watcher error: ${r instanceof Error ? r.message : String(r)}`);
  }), d.on("ready", () => {
    console.log(`File watcher ready for: ${s}`);
  }), Fr.set("global", d), { success: !0 };
}
function fu(e) {
  if (e) {
    const t = Fr.get(e);
    t && (t.close(), Fr.delete(e), console.log(`File watcher stopped for: ${e}`));
  } else
    zs();
}
function zs() {
  for (const [e, t] of Fr)
    t.close(), console.log(`File watcher stopped for: ${e}`);
  Fr.clear(), console.log("All file watchers stopped");
}
const bs = gf(yf);
function dc(e, t) {
  try {
    const s = Rc(`reg query "${e}" /v "${t}"`, {
      encoding: "utf8",
      windowsHide: !0,
      stdio: ["pipe", "pipe", "pipe"]
    }).match(/REG_(?:SZ|EXPAND_SZ)\s+(.+)$/m);
    return s ? s[1].trim() : null;
  } catch {
    return null;
  }
}
function Jd() {
  try {
    const e = dc(
      "HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment",
      "Path"
    ) || "", t = dc(
      "HKEY_CURRENT_USER\\Environment",
      "Path"
    ) || "";
    return t && e ? `${t};${e}` : t || e;
  } catch {
    return process.env.PATH || process.env.Path || "";
  }
}
function Kd() {
  const e = { ...process.env }, t = Jd();
  return t && (e.PATH = t, e.Path = t), e;
}
function hc(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
async function pc() {
  const e = cn() === "win32";
  try {
    return e ? await Qd() : await Zd();
  } catch {
    return [];
  }
}
async function Qd() {
  let e;
  try {
    e = (await bs(
      `wmic process where "name like '%claude%'" get ProcessId,ParentProcessId,CommandLine /format:csv`,
      { encoding: "utf8", windowsHide: !0, timeout: 1e4 }
    )).stdout;
  } catch {
    try {
      e = (await bs(
        `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"name like '%claude%'\\" | Select-Object ProcessId,ParentProcessId,CommandLine | ConvertTo-Csv -NoTypeInformation"`,
        { encoding: "utf8", windowsHide: !0, timeout: 15e3 }
      )).stdout;
    } catch {
      return [];
    }
  }
  const t = [], l = e.trim().split(`
`).filter((s) => s.trim());
  for (const s of l) {
    const d = s.split(",");
    if (d.length < 3) continue;
    const u = d.map((i) => parseInt(i.replace(/"/g, "").trim(), 10)).filter((i) => !isNaN(i));
    if (u.length < 2) continue;
    const n = d[0].replace(/"/g, "").trim(), h = isNaN(parseInt(n, 10));
    let r, c, o;
    h ? (r = u[u.length - 1], c = u[u.length - 2], o = d.slice(1, -2).join(",").replace(/"/g, "").trim()) : (r = u[0], c = u[1], o = d.slice(2).join(",").replace(/"/g, "").trim()), r > 0 && t.push({ pid: r, parentPid: c, commandLine: o });
  }
  return t;
}
async function Zd() {
  const e = await bs("ps -eo pid,ppid,args", {
    encoding: "utf8",
    timeout: 5e3
  }), t = [], l = e.stdout.trim().split(`
`).slice(1);
  for (const s of l) {
    const u = s.trim().match(/^(\d+)\s+(\d+)\s+(.+)$/);
    if (!u) continue;
    const n = u[3];
    /claude/i.test(n) && !/grep/i.test(n) && t.push({
      pid: parseInt(u[1], 10),
      parentPid: parseInt(u[2], 10),
      commandLine: n
    });
  }
  return t;
}
function mc(e, t, l) {
  const s = new Map(l.map((n) => [n.pid, n]));
  let d = e;
  const u = /* @__PURE__ */ new Set();
  for (; d > 1 && !u.has(d); ) {
    if (u.add(d), t.has(d)) return !0;
    const n = s.get(d);
    if (!n) break;
    d = n.parentPid;
  }
  return !1;
}
function eh(e) {
  if (cn() === "win32")
    try {
      Rc(`taskkill /PID ${e} /T /F`, { windowsHide: !0, stdio: ["pipe", "pipe", "pipe"] });
    } catch {
    }
  else {
    try {
      process.kill(e, "SIGTERM");
    } catch {
    }
    setTimeout(() => {
      try {
        process.kill(e, 0), process.kill(e, "SIGKILL");
      } catch {
      }
    }, 1e3);
  }
}
const ln = {
  cursor: {
    command: "agent",
    args: [],
    processAttachCommand: (e) => `/process-continue ${e}`,
    available: !1,
    displayName: "Cursor Agent"
  },
  "github-copilot": {
    command: "gh",
    args: ["copilot"],
    processAttachCommand: (e) => "",
    // Future implementation
    available: !1,
    displayName: "GitHub Copilot"
  },
  "claude-code": {
    command: "claude",
    args: [],
    processAttachCommand: (e) => `/process-continue ${e}`,
    available: !0,
    displayName: "Claude Code"
  }
};
class th extends Cc {
  sessions = /* @__PURE__ */ new Map();
  shell;
  constructor() {
    super(), this.shell = cn() === "win32" ? "cmd.exe" : process.env.SHELL || "/bin/bash";
  }
  /**
   * Get all available agent types with their configurations
   */
  getAvailableAgents() {
    return Object.entries(ln).filter(([, t]) => t.available).map(([t, l]) => ({ type: t, config: l }));
  }
  /**
   * Create a new agent session
   */
  async createSession(t, l, s, d) {
    const u = ln[t];
    if (!u.available)
      throw new Error(`Agent type '${t}' is not available yet`);
    const n = vf(), h = {
      id: n,
      agentType: t,
      attachedProcessId: null,
      attachedProcessPath: s || null,
      status: "starting",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      workingDirectory: l,
      pty: null,
      outputBuffer: ""
    };
    this.sessions.set(n, h);
    try {
      const r = cn() === "win32", c = r ? Kd() : process.env, o = r ? c : { ...c, TERM: "xterm-256color", COLORTERM: "truecolor" };
      let i = l;
      if (!Oe(i)) {
        if (s)
          try {
            const v = He(s), m = Re(v, "process.json");
            if (Oe(m)) {
              const w = JSON.parse(un(m, "utf-8")), R = w.metadata?.projectPaths, C = w.metadata?.projectPath, D = Array.isArray(R) && R.length > 0 ? R[0] : typeof C == "string" ? C : null;
              D && Oe(D) && (i = D);
            }
          } catch {
          }
        if (!Oe(i))
          throw new Error(
            `Working directory does not exist: "${l}". The process may have been created on a different machine. Please update the projectPaths in the process.json file.`
          );
      }
      const a = wf(this.shell, [], {
        name: "xterm-256color",
        cols: 120,
        rows: 30,
        cwd: i,
        env: o,
        useConpty: r
        // Use Windows ConPTY for better compatibility
      });
      h.pty = a, a.onData((v) => {
        h.outputBuffer += v, h.outputBuffer.length > 10240 && (h.outputBuffer = h.outputBuffer.slice(-10240)), this.emit("output", {
          sessionId: n,
          data: v
        });
      }), a.onExit(({ exitCode: v }) => {
        const m = this.sessions.get(n);
        if (m) {
          if (m.status === "stopped") {
            m.pty = null;
            return;
          }
          m.status = v === 0 ? "stopped" : "error", m.pty = null, this.emit("status", {
            sessionId: n,
            status: m.status,
            error: v !== 0 ? `Process exited with code ${v}` : void 0
          });
        }
      }), await new Promise((v) => setTimeout(v, 500));
      let p = u.args?.length ? `${u.command} ${u.args.join(" ")}` : u.command;
      d?.permissionMode === "allow-all" && t === "claude-code" && (p = `${p} --dangerously-skip-permissions`), d?.resumeSessionId && t === "claude-code" && (p = `${p} --resume ${d.resumeSessionId}`), a.write(`${p}\r`);
      const g = /[?>]\s*(for shortcuts|$)/;
      return await this.waitForOutput(n, g, 3e4), await new Promise((v) => setTimeout(v, 500)), h.status = "running", this.emit("status", {
        sessionId: n,
        status: "running"
      }), s && await this.attachToProcess(n, s), this.getSessionPublic(h);
    } catch (r) {
      throw h.status = "error", this.emit("status", {
        sessionId: n,
        status: "error",
        error: r instanceof Error ? r.message : "Unknown error"
      }), r;
    }
  }
  /**
   * Attach an existing session to an agentic process
   */
  async attachToProcess(t, l) {
    const s = this.sessions.get(t);
    if (!s)
      throw new Error(`Session '${t}' not found`);
    if (!s.pty)
      throw new Error(`Session '${t}' has no active PTY`);
    const u = ln[s.agentType].processAttachCommand(l);
    if (!u)
      throw new Error(`Agent type '${s.agentType}' does not support process attachment`);
    this.clearOutputBuffer(t), s.pty.write(u);
    const n = u.slice(-20), h = new RegExp(hc(n));
    await this.waitForOutput(t, h, 5e3), await new Promise((r) => setTimeout(r, 100)), s.pty.write("\r"), s.attachedProcessPath = l, this.emit("status", {
      sessionId: t,
      status: s.status
    });
  }
  /**
   * Send a prompt/command to the agent session
   */
  async sendPrompt(t, l) {
    const s = this.sessions.get(t);
    if (!s)
      throw new Error(`Session '${t}' not found`);
    if (!s.pty)
      throw new Error(`Session '${t}' has no active PTY`);
    if (s.status !== "running")
      throw new Error(`Session '${t}' is not running (status: ${s.status})`);
    this.clearOutputBuffer(t), s.pty.write(l);
    const d = l.slice(-20), u = new RegExp(hc(d));
    await this.waitForOutput(t, u, 5e3), await new Promise((n) => setTimeout(n, 100)), s.pty.write("\r");
  }
  /**
   * Resize the PTY terminal
   */
  resizeTerminal(t, l, s) {
    const d = this.sessions.get(t);
    d?.pty && d.pty.resize(l, s);
  }
  /**
   * Send raw input to the PTY (for keyboard events)
   */
  sendInput(t, l) {
    const s = this.sessions.get(t);
    s?.pty && s.pty.write(l);
  }
  /**
   * Kill an agent session
   */
  killSession(t) {
    const l = this.sessions.get(t);
    l && (l.pty && (l.pty.kill(), l.pty = null), l.status = "stopped", this.emit("status", {
      sessionId: t,
      status: "stopped"
    }));
  }
  /**
   * Get a session by ID
   */
  getSession(t) {
    const l = this.sessions.get(t);
    return l ? this.getSessionPublic(l) : null;
  }
  /**
   * Get all active sessions
   */
  listSessions() {
    return Array.from(this.sessions.values()).map((t) => this.getSessionPublic(t));
  }
  /**
   * Get sessions attached to a specific process
   */
  getSessionsForProcess(t) {
    return Array.from(this.sessions.values()).filter((l) => l.attachedProcessPath === t).map((l) => this.getSessionPublic(l));
  }
  /**
   * Discover external Claude Code sessions attached to active processes.
   * Detection is purely file-based: if a .session file exists in the process
   * folder and this app doesn't have a managed session for it, it's external.
   * The OS process scan is deferred to migration time.
   */
  async discoverExternalSessions(t) {
    const l = /* @__PURE__ */ new Map();
    for (const s of t) {
      const d = He(s.path), u = Re(d, ".session");
      let n = null;
      try {
        Oe(u) && (n = un(u, "utf-8").trim());
      } catch {
      }
      !n || this.getSessionsForProcess(s.path).some((r) => r.status === "running" || r.status === "starting") || l.set(s.path, {
        pid: 0,
        commandLine: "",
        claudeSessionId: n,
        processPath: s.path,
        workingDirectory: s.projectPaths?.[0]
      });
    }
    if (l.size > 0)
      try {
        const s = await pc();
        if (s.length > 0) {
          const d = /* @__PURE__ */ new Set();
          for (const n of this.sessions.values())
            n.pty && d.add(n.pty.pid);
          const u = s.filter(
            (n) => !mc(n.pid, d, s)
          );
          for (const [n, h] of l)
            for (const r of u) {
              const c = r.commandLine.includes(h.claudeSessionId), o = h.workingDirectory && r.commandLine.replace(/\\/g, "/").includes(h.workingDirectory.replace(/\\/g, "/"));
              if (c || o) {
                h.pid = r.pid, h.commandLine = r.commandLine;
                break;
              }
            }
        }
      } catch {
      }
    return l;
  }
  /**
   * Migrate an external Claude Code session into this app.
   * Finds and kills the external process, then resumes the session in a new PTY.
   */
  async migrateExternalSession(t, l, s) {
    const d = await pc();
    if (d.length > 0) {
      const u = /* @__PURE__ */ new Set();
      for (const n of this.sessions.values())
        n.pty && u.add(n.pty.pid);
      for (const n of d)
        mc(n.pid, u, d) || eh(n.pid);
    }
    return await new Promise((u) => setTimeout(u, 1500)), this.createSession(
      "claude-code",
      l,
      t.processPath,
      { resumeSessionId: t.claudeSessionId, permissionMode: s?.permissionMode }
    );
  }
  /**
   * Clean up all sessions
   */
  cleanup() {
    for (const [t] of this.sessions)
      this.killSession(t);
    this.sessions.clear();
  }
  /**
   * Wait for a pattern to appear in the PTY output
   * Returns true if pattern found, false if timeout
   */
  waitForOutput(t, l, s = 5e3) {
    return new Promise((d) => {
      const u = this.sessions.get(t);
      if (!u) {
        d(!1);
        return;
      }
      if (l.test(u.outputBuffer)) {
        d(!0);
        return;
      }
      const n = (c) => {
        if (c.sessionId !== t) return;
        const o = this.sessions.get(t);
        o && l.test(o.outputBuffer) && (r(), d(!0));
      }, h = setTimeout(() => {
        r(), d(!1);
      }, s), r = () => {
        clearTimeout(h), this.off("output", n);
      };
      this.on("output", n);
    });
  }
  /**
   * Clear the output buffer for a session
   */
  clearOutputBuffer(t) {
    const l = this.sessions.get(t);
    l && (l.outputBuffer = "");
  }
  /**
   * Convert internal session to public session (without PTY reference)
   */
  getSessionPublic(t) {
    const { pty: l, outputBuffer: s, ...d } = t;
    return d;
  }
}
let Kt = null;
function tt() {
  return Kt || (Kt = new th()), Kt;
}
function rh() {
  Kt && (Kt.cleanup(), Kt = null);
}
const Ir = Re(xr(), ".claude", "agentic-processes", "channels");
class nh extends Cc {
  channels = /* @__PURE__ */ new Map();
  // parentPid → endpoint
  watcher = null;
  sseAbortControllers = /* @__PURE__ */ new Map();
  // parentPid → SSE abort
  constructor() {
    super();
  }
  start() {
    ff(Ir, { recursive: !0 }), this.loadExisting(), this.startWatcher();
  }
  stop() {
    this.watcher && (this.watcher.close(), this.watcher = null);
    for (const [, t] of this.sseAbortControllers)
      t.abort();
    this.sseAbortControllers.clear(), this.channels.clear();
  }
  // -- Public API -----------------------------------------------------------
  getChannelForPid(t) {
    return this.channels.get(t) ?? null;
  }
  listChannels() {
    return Array.from(this.channels.values());
  }
  async checkHealth(t) {
    return new Promise((l) => {
      const s = Cn(
        {
          hostname: "127.0.0.1",
          port: t,
          path: "/health",
          method: "GET",
          timeout: 3e3
        },
        (d) => {
          const u = [];
          d.on("data", (n) => u.push(n)), d.on("end", () => {
            try {
              l(JSON.parse(Buffer.concat(u).toString("utf-8")));
            } catch {
              l(null);
            }
          });
        }
      );
      s.on("error", () => l(null)), s.on("timeout", () => {
        s.destroy(), l(null);
      }), s.end();
    });
  }
  async sendPrompt(t, l, s) {
    return new Promise((d) => {
      const u = JSON.stringify({ prompt: l, meta: s }), n = Cn(
        {
          hostname: "127.0.0.1",
          port: t,
          path: "/prompt",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          timeout: 5e3
        },
        (h) => {
          const r = [];
          h.on("data", (c) => r.push(c)), h.on("end", () => {
            try {
              const c = JSON.parse(Buffer.concat(r).toString("utf-8"));
              d(c);
            } catch {
              d({ ok: !1, error: "Invalid response from channel server" });
            }
          });
        }
      );
      n.on("error", (h) => d({ ok: !1, error: h.message })), n.on("timeout", () => {
        n.destroy(), d({ ok: !1, error: "Request timed out" });
      }), n.write(u), n.end();
    });
  }
  subscribeReplies(t) {
    const l = this.channels.get(t);
    if (!l || this.sseAbortControllers.has(t)) return;
    const s = new AbortController();
    this.sseAbortControllers.set(t, s);
    const d = () => {
      if (s.signal.aborted) return;
      const u = Cn(
        {
          hostname: "127.0.0.1",
          port: l.port,
          path: "/events",
          method: "GET",
          headers: { Accept: "text/event-stream" }
        },
        (n) => {
          let h = "";
          n.on("data", (r) => {
            h += r.toString();
            const c = h.split(`

`);
            h = c.pop() ?? "";
            for (const o of c) {
              const i = o.split(`
`).find((a) => a.startsWith("data: "));
              if (i)
                try {
                  const a = JSON.parse(i.slice(6));
                  this.emit("channel-reply", { parentPid: t, ...a });
                } catch {
                }
            }
          }), n.on("end", () => {
            s.signal.aborted || setTimeout(d, 2e3);
          });
        }
      );
      u.on("error", () => {
        s.signal.aborted || setTimeout(d, 5e3);
      }), s.signal.addEventListener("abort", () => u.destroy()), u.end();
    };
    d();
  }
  unsubscribeReplies(t) {
    const l = this.sseAbortControllers.get(t);
    l && (l.abort(), this.sseAbortControllers.delete(t));
  }
  // -- Discovery watcher ----------------------------------------------------
  loadExisting() {
    if (Oe(Ir))
      for (const t of df(Ir))
        t.endsWith(".json") && this.handleDiscoveryFile(Re(Ir, t));
  }
  startWatcher() {
    this.watcher = Is(Ir, {
      ignoreInitial: !0,
      awaitWriteFinish: { stabilityThreshold: 200 }
    }), this.watcher.on("add", (t) => this.handleDiscoveryFile(t)), this.watcher.on("change", (t) => this.handleDiscoveryFile(t)), this.watcher.on("unlink", (t) => this.handleDiscoveryRemoval(t));
  }
  handleDiscoveryFile(t) {
    try {
      const l = un(t, "utf-8"), s = JSON.parse(l);
      if (!s.port || !s.parentPid) return;
      if (!this.isProcessAlive(s.parentPid)) {
        try {
          hf(t);
        } catch {
        }
        return;
      }
      const d = !this.channels.has(s.parentPid);
      this.channels.set(s.parentPid, s), d && (this.emit("channel-available", {
        parentPid: s.parentPid,
        port: s.port
      }), this.subscribeReplies(s.parentPid));
    } catch {
    }
  }
  handleDiscoveryRemoval(t) {
    const l = t.split(/[/\\]/).pop()?.replace(".json", "");
    if (!l) return;
    const s = parseInt(l, 10);
    isNaN(s) || this.channels.has(s) && (this.channels.delete(s), this.unsubscribeReplies(s), this.emit("channel-removed", { parentPid: s }));
  }
  isProcessAlive(t) {
    try {
      return process.kill(t, 0), !0;
    } catch {
      return !1;
    }
  }
}
let Qt = null;
function ir() {
  return Qt || (Qt = new nh()), Qt;
}
function ih() {
  ir().start();
}
function sh() {
  Qt && (Qt.stop(), Qt = null);
}
const oh = Sc(import.meta.url), gc = He(oh), Ps = Re(xr(), ".claude.json"), Lr = "agentic-processes-channel";
function ah() {
  const e = oo(gc, "..", "channel-server", "dist", "index.js");
  if (Oe(e)) return e;
  const t = oo(process.resourcesPath ?? gc, "channel-server", "dist", "index.js");
  return Oe(t) ? t : e;
}
function Sn() {
  if (!Oe(Ps)) return {};
  try {
    return JSON.parse(un(Ps, "utf-8"));
  } catch {
    return {};
  }
}
function du(e) {
  pf(Ps, JSON.stringify(e, null, 2), "utf-8");
}
function lh() {
  const t = Sn().mcpServers ?? {};
  return Lr in t;
}
function ch() {
  return (Sn().mcpServers ?? {})[Lr]?.args?.[0] ?? null;
}
function uh() {
  try {
    const e = ah();
    if (!Oe(e))
      return { success: !1, error: `Channel server not found at: ${e}. Build the channel server first.` };
    const t = Sn(), l = t.mcpServers ?? {};
    return l[Lr] = {
      command: "node",
      args: [e]
    }, t.mcpServers = l, du(t), { success: !0 };
  } catch (e) {
    return { success: !1, error: e instanceof Error ? e.message : "Unknown error" };
  }
}
function fh() {
  try {
    const e = Sn(), t = e.mcpServers ?? {};
    return Lr in t ? (delete t[Lr], e.mcpServers = t, du(e), { success: !0 }) : { success: !0 };
  } catch (e) {
    return { success: !1, error: e instanceof Error ? e.message : "Unknown error" };
  }
}
const dh = Sc(import.meta.url), ht = He(dh);
let Le = null, fn = null, er = /* @__PURE__ */ new Map(), yc = !1, Lt = /* @__PURE__ */ new Map(), Zt = /* @__PURE__ */ new Map(), Os = /* @__PURE__ */ new Map();
function _t(e, t) {
  Le?.webContents.send(e, t);
  for (const [, l] of Zt)
    l.isDestroyed() || l.webContents.send(e, t);
}
function vc() {
  Le = new $t({
    width: 1400,
    height: 900,
    minWidth: 1e3,
    minHeight: 700,
    icon: Re(ht, "../images/icon.png"),
    backgroundColor: "#0d1117",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: Re(ht, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), process.env.VITE_DEV_SERVER_URL ? (Le.loadURL(process.env.VITE_DEV_SERVER_URL), Le.webContents.openDevTools(), Le.webContents.on("console-message", (e, t, l) => {
    l.includes("Autofill.enable") || l.includes("Autofill.setAddresses");
  })) : Le.loadFile(Re(ht, "../dist/index.html")), Le.on("closed", () => {
    Le = null;
  });
}
function hh(e, t, l) {
  const s = Lt.get(e);
  if (s && !s.isDestroyed()) {
    s.focus();
    return;
  }
  const d = new $t({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    icon: Re(ht, "../images/icon.png"),
    backgroundColor: "#0d1117",
    title: l || "Agent Terminal",
    webPreferences: {
      preload: Re(ht, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  });
  d.setMenuBarVisibility(!1);
  const u = `?sessionId=${encodeURIComponent(e)}&processPath=${encodeURIComponent(t)}&processName=${encodeURIComponent(l)}`;
  process.env.VITE_DEV_SERVER_URL ? d.loadURL(`${process.env.VITE_DEV_SERVER_URL}terminal-window.html${u}`) : d.loadFile(Re(ht, "../dist/terminal-window.html"), {
    search: u
  }), Lt.set(e, d), d.on("closed", () => {
    Lt.delete(e);
  });
}
ge.handle("select-project-folder", async () => {
  const e = await af.showOpenDialog({
    properties: ["openDirectory"],
    title: "Select Project Folder"
  });
  return !e.canceled && e.filePaths.length > 0 ? (fn = e.filePaths[0], fn) : null;
});
ge.handle("get-current-project", () => fn);
ge.handle("set-project-path", (e, t) => (fn = t, !0));
ge.handle("start-watching", async (e, t) => {
  if (Le) {
    const l = await Xd(
      t,
      async (s, d, u) => {
        switch (d) {
          case "process":
            s === "added" || s === "changed" ? Os.set(u.processPath, u.content) : s === "removed" && Os.delete(u.processPath), _t("process-update", {
              event: s,
              data: { path: u.processPath, process: u.content }
            });
            break;
          case "memory":
            try {
              const n = Re(He(u.processPath), "memory");
              if (Oe(n)) {
                const h = await kt(n), r = {};
                for (const c of h)
                  if (c.endsWith(".json"))
                    try {
                      const o = await Je(Re(n, c), "utf-8");
                      r[c.replace(/\.json$/, "")] = JSON.parse(o);
                    } catch {
                    }
                _t("memory-update", {
                  event: s,
                  processPath: u.processPath,
                  memory: r
                });
              }
            } catch (n) {
              console.error("Error aggregating memory topics:", n);
            }
            break;
          case "log":
            _t("log-update", {
              event: s,
              processPath: u.processPath,
              log: u.content
            });
            break;
          case "pending-interaction":
            _t("pending-interaction-update", {
              event: s,
              processPath: u.processPath,
              pendingInteraction: u.content
            });
            break;
          case "qa-session":
            _t("qa-session-update", {
              event: s,
              processPath: u.processPath,
              qaSession: u.content
            });
            break;
        }
      },
      (s) => {
        _t("watcher-error", { error: s });
      }
    );
    if (!l.success)
      return { success: !1, error: l.error };
  }
  return { success: !0 };
});
ge.handle("stop-watching", (e, t) => (fu(t), !0));
ge.handle("stop-all-watching", () => (zs(), !0));
ge.handle("read-process-file", async (e, t, l) => {
  try {
    const s = He(t), d = Re(s, l);
    if (!Oe(d))
      return console.log(`File not found: ${d}`), null;
    const u = await Je(d, "utf-8");
    return JSON.parse(u);
  } catch (s) {
    return console.error(`Error reading ${l}:`, s), null;
  }
});
ge.handle("read-memory-directory", async (e, t) => {
  try {
    const l = He(t), s = Re(l, "memory");
    if (!Oe(s))
      return console.log(`Memory directory not found: ${s}`), null;
    const d = await kt(s), u = {};
    for (const n of d) {
      if (!n.endsWith(".json")) continue;
      const h = Re(s, n);
      try {
        const r = await Je(h, "utf-8"), c = n.replace(/\.json$/, "");
        u[c] = JSON.parse(r);
      } catch (r) {
        console.error(`Error reading memory topic file: ${h}`, r);
      }
    }
    return u;
  } catch (l) {
    return console.error("Error reading memory directory:", l), null;
  }
});
ge.handle("list-process-files", async (e, t) => {
  try {
    const l = He(t);
    if (!Oe(l))
      return console.log(`Process directory not found: ${l}`), [];
    const s = await kt(l), d = [];
    for (const u of s) {
      const n = cf(u).toLowerCase();
      if (n === ".md" || n === ".json") {
        const h = Re(l, u), r = await Nr(h);
        r.isFile() && d.push({
          name: u,
          path: h,
          type: n === ".md" ? "markdown" : "json",
          size: r.size,
          modifiedAt: r.mtime.toISOString()
        });
      }
    }
    return d.sort((u, n) => u.name.localeCompare(n.name)), d;
  } catch (l) {
    return console.error("Error listing process files:", l), [];
  }
});
ge.handle("read-file-content", async (e, t) => {
  try {
    return Oe(t) ? await Je(t, "utf-8") : (console.log(`File not found: ${t}`), null);
  } catch (l) {
    return console.error(`Error reading file content: ${t}`, l), null;
  }
});
ge.handle("watch-file", (e, t) => {
  if (er.has(t))
    return !0;
  if (!Oe(t))
    return console.log(`Cannot watch non-existent file: ${t}`), !1;
  console.log(`Starting file content watcher for: ${t}`);
  const l = Is(t, {
    persistent: !0,
    usePolling: !0,
    interval: 500,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100
    }
  });
  return l.on("change", async (s) => {
    console.log(`File content changed: ${s}`);
    try {
      const d = await Je(s, "utf-8");
      _t("file-content-update", {
        filePath: s,
        content: d
      });
    } catch (d) {
      console.error(`Error reading changed file: ${s}`, d);
    }
  }), l.on("unlink", (s) => {
    console.log(`Watched file removed: ${s}`), _t("file-content-update", {
      filePath: s,
      content: null,
      removed: !0
    });
  }), er.set(t, l), !0;
});
ge.handle("unwatch-file", (e, t) => {
  const l = er.get(t);
  return l && (l.close(), er.delete(t), console.log(`Stopped watching file: ${t}`)), !0;
});
ge.handle("delete-process-instance", async (e, t) => {
  try {
    const l = He(t);
    return l.includes("agentic-processes") ? Oe(l) ? (await uf(l, { recursive: !0, force: !0 }), console.log(`Deleted process directory: ${l}`), { success: !0 }) : { success: !1, error: "Process directory not found" } : { success: !1, error: "Invalid path: not in agentic-processes" };
  } catch (l) {
    return console.error("Error deleting process instance:", l), {
      success: !1,
      error: l instanceof Error ? l.message : "Unknown error"
    };
  }
});
ge.handle("read-qa-session", async (e, t) => {
  try {
    const l = He(t), s = Re(l, "qa-session.json");
    if (!l.includes("agentic-processes"))
      return console.error("Invalid path: not in agentic-processes"), null;
    if (!Oe(s))
      return null;
    const d = await Je(s, "utf-8");
    return JSON.parse(d);
  } catch (l) {
    return console.error("Error reading qa-session.json:", l), null;
  }
});
ge.handle("answer-question", async (e, t, l, s) => {
  try {
    if (!He(t).includes("agentic-processes"))
      return { success: !1, error: "Invalid path" };
    if (!l || typeof l != "string")
      return { success: !1, error: "Invalid question ID" };
    if (!s || typeof s != "string")
      return { success: !1, error: "Invalid answer" };
    const u = l.replace(/[^\w-]/g, ""), n = s.replace(/[\r\n]+/g, " ").trim(), { spawn: h } = await import("child_process"), r = h("python3", [
      "scripts/process_manager.py",
      "update-qa-answer",
      t,
      u,
      n
    ], {
      cwd: Re("C:", "Projects", "HM", "agentic-processes")
    });
    let c = "", o = "";
    return r.stdout.on("data", (i) => {
      c += i.toString();
    }), r.stderr.on("data", (i) => {
      o += i.toString();
    }), new Promise((i) => {
      r.on("close", (a) => {
        a === 0 ? i({ success: !0 }) : (console.error(`Python script failed with code ${a}:`, o), i({ success: !1, error: "Failed to update answer" }));
      });
    });
  } catch (d) {
    return console.error("Error answering question:", d), {
      success: !1,
      error: "Internal error"
    };
  }
});
ge.handle("complete-question", async (e, t, l) => {
  try {
    if (!He(t).includes("agentic-processes"))
      return { success: !1, error: "Invalid path" };
    if (!l || typeof l != "string")
      return { success: !1, error: "Invalid question ID" };
    const d = l.replace(/[^\w-]/g, ""), { spawn: u } = await import("child_process"), n = u("python3", [
      "scripts/process_manager.py",
      "complete-qa-question",
      t,
      d
    ], {
      cwd: Re("C:", "Projects", "HM", "agentic-processes")
    });
    let h = "", r = "";
    return n.stdout.on("data", (c) => {
      h += c.toString();
    }), n.stderr.on("data", (c) => {
      r += c.toString();
    }), new Promise((c) => {
      n.on("close", (o) => {
        o === 0 ? c({ success: !0 }) : (console.error(`Python script failed with code ${o}:`, r), c({ success: !1, error: "Failed to complete question" }));
      });
    });
  } catch (s) {
    return console.error("Error completing question:", s), {
      success: !1,
      error: "Internal error"
    };
  }
});
ge.handle("get-qa-session-status", async (e, t) => {
  try {
    const l = He(t), s = Re(l, "qa-session.json");
    if (!l.includes("agentic-processes") || !Oe(s))
      return null;
    const d = await Je(s, "utf-8");
    return JSON.parse(d).status || null;
  } catch (l) {
    return console.error("Error reading qa-session status:", l), null;
  }
});
const ph = [
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
async function Ec(e, t) {
  if (!(!e.steps || !Array.isArray(e.steps)))
    for (const l of e.steps) {
      if (!l.stepRef || l.stepDefinition && Object.keys(l.stepDefinition).length > 0) continue;
      const s = Re(t, l.stepRef, `${l.stepRef}.json`);
      if (Oe(s))
        try {
          const d = await Je(s, "utf-8"), u = JSON.parse(d), n = {};
          for (const h of ph)
            h in u && (n[h] = u[h]);
          l.stepDefinition = n;
        } catch (d) {
          console.error(`Error resolving step definition: ${s}`, d);
        }
    }
}
ge.handle("load-process-templates", async () => {
  try {
    const e = Re(xr(), ".claude", "agentic-processes", "templates", "processes");
    if (!Oe(e))
      return console.log(`Templates directory not found: ${e}`), [];
    const t = [], l = await kt(e);
    for (const s of l) {
      const d = Re(e, s);
      if (!(await Nr(d)).isDirectory() || s.startsWith(".") || s.startsWith("_"))
        continue;
      const n = Re(d, `${s}.json`);
      if (Oe(n)) {
        try {
          const r = await Je(n, "utf-8"), c = JSON.parse(r);
          c.type === "template" && (c.filePath = n, await Ec(c, d), t.push(c));
        } catch (r) {
          console.error(`Error reading template: ${n}`, r);
        }
        continue;
      }
      const h = await kt(d);
      for (const r of h) {
        const c = Re(d, r);
        if (!(await Nr(c)).isDirectory() || r.startsWith(".") || r.startsWith("_"))
          continue;
        const i = Re(c, `${r}.json`);
        if (Oe(i))
          try {
            const a = await Je(i, "utf-8"), p = JSON.parse(a);
            p.type === "template" && (p.filePath = i, await Ec(p, c), t.push(p));
          } catch (a) {
            console.error(`Error reading template: ${i}`, a);
          }
      }
    }
    return t;
  } catch (e) {
    return console.error("Error loading process templates:", e), [];
  }
});
ge.handle("load-step-templates", async () => {
  try {
    const e = Re(xr(), ".claude", "agentic-processes", "templates", "steps");
    if (!Oe(e))
      return console.log(`Steps directory not found: ${e}`), [];
    const t = [], l = await kt(e);
    for (const s of l) {
      const d = Re(e, s);
      if (!(await Nr(d)).isDirectory() || s.startsWith(".") || s.startsWith("_"))
        continue;
      const n = await kt(d);
      for (const h of n) {
        const r = Re(d, h);
        if (!(await Nr(r)).isDirectory() || h.startsWith(".") || h.startsWith("_"))
          continue;
        const o = Re(r, `${h}.json`);
        if (Oe(o))
          try {
            const i = await Je(o, "utf-8"), a = JSON.parse(i);
            a.type === "step" && (a.filePath = o, t.push(a));
          } catch (i) {
            console.error(`Error reading step: ${o}`, i);
          }
      }
    }
    return t;
  } catch (e) {
    return console.error("Error loading step templates:", e), [];
  }
});
ge.handle("clipboard:read-text", () => _c.readText());
ge.handle("clipboard:write-text", (e, t) => (_c.writeText(t), !0));
function Ys() {
  if (yc) return;
  const e = tt();
  e.on("output", (t) => {
    Le?.webContents.send("agent:output", t);
    const l = Lt.get(t.sessionId);
    l && !l.isDestroyed() && l.webContents.send("agent:output", t);
  }), e.on("status", (t) => {
    Le?.webContents.send("agent:status", t);
    const l = Lt.get(t.sessionId);
    l && !l.isDestroyed() && l.webContents.send("agent:status", t);
  }), yc = !0;
}
ge.handle("agent:get-available", () => Object.entries(ln).map(([e, t]) => ({
  type: e,
  displayName: t.displayName,
  available: t.available
})));
ge.handle("agent:create", async (e, t, l, s, d) => {
  try {
    return Ys(), { success: !0, session: await tt().createSession(t, l, s, {
      permissionMode: d?.permissionMode
    }) };
  } catch (u) {
    return console.error("Error creating agent session:", u), {
      success: !1,
      error: u instanceof Error ? u.message : "Unknown error"
    };
  }
});
ge.handle("agent:attach", async (e, t, l) => {
  try {
    return await tt().attachToProcess(t, l), { success: !0 };
  } catch (s) {
    return console.error("Error attaching to process:", s), {
      success: !1,
      error: s instanceof Error ? s.message : "Unknown error"
    };
  }
});
ge.handle("agent:send-prompt", async (e, t, l) => {
  try {
    return await tt().sendPrompt(t, l), { success: !0 };
  } catch (s) {
    return console.error("Error sending prompt:", s), {
      success: !1,
      error: s instanceof Error ? s.message : "Unknown error"
    };
  }
});
ge.handle("agent:input", (e, t, l) => {
  try {
    return tt().sendInput(t, l), { success: !0 };
  } catch (s) {
    return {
      success: !1,
      error: s instanceof Error ? s.message : "Unknown error"
    };
  }
});
ge.handle("agent:resize", (e, t, l, s) => {
  try {
    return tt().resizeTerminal(t, l, s), { success: !0 };
  } catch (d) {
    return {
      success: !1,
      error: d instanceof Error ? d.message : "Unknown error"
    };
  }
});
ge.handle("agent:kill", (e, t) => {
  try {
    return tt().killSession(t), { success: !0 };
  } catch (l) {
    return {
      success: !1,
      error: l instanceof Error ? l.message : "Unknown error"
    };
  }
});
ge.handle("agent:list", () => {
  try {
    return { success: !0, sessions: tt().listSessions() };
  } catch (e) {
    return {
      success: !1,
      sessions: [],
      error: e instanceof Error ? e.message : "Unknown error"
    };
  }
});
ge.handle("agent:get", (e, t) => {
  try {
    return { success: !0, session: tt().getSession(t) };
  } catch (l) {
    return {
      success: !1,
      session: null,
      error: l instanceof Error ? l.message : "Unknown error"
    };
  }
});
ge.handle("agent:open-window", (e, t, l, s) => {
  try {
    return hh(t, l, s), { success: !0 };
  } catch (d) {
    return console.error("Error opening terminal window:", d), {
      success: !1,
      error: d instanceof Error ? d.message : "Unknown error"
    };
  }
});
ge.handle("agent:close-window", (e) => {
  try {
    const t = $t.getFocusedWindow();
    return t && t !== Le && t.close(), { success: !0 };
  } catch (t) {
    return {
      success: !1,
      error: t instanceof Error ? t.message : "Unknown error"
    };
  }
});
ge.handle("agent:get-window-params", (e) => {
  const t = $t.fromWebContents(e.sender);
  if (!t) return null;
  try {
    const l = t.webContents.getURL(), s = new URL(l);
    return {
      sessionId: s.searchParams.get("sessionId"),
      processPath: s.searchParams.get("processPath"),
      processName: s.searchParams.get("processName")
    };
  } catch {
    return null;
  }
});
ge.handle("agent:get-for-process", (e, t) => {
  try {
    return { success: !0, sessions: tt().getSessionsForProcess(t) };
  } catch (l) {
    return {
      success: !1,
      sessions: [],
      error: l instanceof Error ? l.message : "Unknown error"
    };
  }
});
ge.handle("agent:discover-external", async (e, t) => {
  try {
    Ys();
    const s = await tt().discoverExternalSessions(t), d = {};
    for (const [u, n] of s)
      d[u] = n;
    return { success: !0, sessions: d };
  } catch (l) {
    return console.error("Error discovering external sessions:", l), {
      success: !1,
      sessions: {},
      error: l instanceof Error ? l.message : "Unknown error"
    };
  }
});
ge.handle("agent:migrate-external", async (e, t, l, s) => {
  try {
    return Ys(), { success: !0, session: await tt().migrateExternalSession(t, l, {
      permissionMode: s?.permissionMode
    }) };
  } catch (d) {
    return console.error("Error migrating external session:", d), {
      success: !1,
      error: d instanceof Error ? d.message : "Unknown error"
    };
  }
});
let wc = !1;
function Br() {
  if (wc) return;
  wc = !0, ih();
  const e = ir();
  e.on("channel-available", (t) => {
    Le?.webContents.send("channel:available", t);
  }), e.on("channel-removed", (t) => {
    Le?.webContents.send("channel:removed", t);
  }), e.on("channel-reply", (t) => {
    Le?.webContents.send("channel:reply", t);
  });
}
ge.handle("channel:is-installed", () => lh());
ge.handle("channel:get-installed-path", () => ch());
ge.handle("channel:install", () => uh());
ge.handle("channel:uninstall", () => fh());
ge.handle("channel:list", () => (Br(), ir().listChannels()));
ge.handle("channel:get-for-pid", (e, t) => (Br(), ir().getChannelForPid(t)));
ge.handle("channel:send-prompt", async (e, t, l, s) => (Br(), ir().sendPrompt(t, l, s)));
ge.handle("channel:check-health", async (e, t) => (Br(), ir().checkHealth(t)));
function mh(e) {
  const t = Zt.get("default");
  if (t && !t.isDestroyed()) {
    t.focus();
    return;
  }
  const l = new $t({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: Re(ht, "../images/icon.png"),
    backgroundColor: "#0d1117",
    title: "Processes Overview",
    webPreferences: {
      preload: Re(ht, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  });
  l.setMenuBarVisibility(!1);
  const s = `?projectPaths=${encodeURIComponent(JSON.stringify(e))}`;
  process.env.VITE_DEV_SERVER_URL ? l.loadURL(`${process.env.VITE_DEV_SERVER_URL}overview-window.html${s}`) : l.loadFile(Re(ht, "../dist/overview-window.html"), {
    search: s
  }), Zt.set("default", l), l.on("closed", () => {
    Zt.delete("default");
  });
}
ge.handle("overview:open-window", (e, t) => {
  try {
    return mh(t), { success: !0 };
  } catch (l) {
    return console.error("Error opening overview window:", l), {
      success: !1,
      error: l instanceof Error ? l.message : "Unknown error"
    };
  }
});
ge.handle("overview:get-window-params", (e) => {
  const t = $t.fromWebContents(e.sender);
  if (!t) return null;
  try {
    const l = t.webContents.getURL(), d = new URL(l).searchParams.get("projectPaths");
    return {
      projectPaths: d ? JSON.parse(d) : []
    };
  } catch {
    return null;
  }
});
ge.handle("overview:get-current-processes", () => {
  const e = {};
  for (const [t, l] of Os)
    e[t] = l;
  return e;
});
ge.handle("overview:navigate-to-process", (e, t) => (Le && !Le.isDestroyed() && (Le.webContents.send("navigate-to-process-request", t), Le.focus()), { success: !0 }));
async function jt(e) {
  const { spawn: t } = await import("child_process");
  return new Promise((l) => {
    const s = t("python3", ["scripts/template_manager.py", ...e], {
      cwd: Re("C:", "Projects", "HM", "agentic-processes")
    });
    let d = "", u = "";
    s.stdout.on("data", (n) => {
      d += n.toString();
    }), s.stderr.on("data", (n) => {
      u += n.toString();
    }), s.on("close", (n) => {
      if (n === 0)
        try {
          l({ success: !0, data: JSON.parse(d) });
        } catch {
          l({ success: !1, error: "Failed to parse response" });
        }
      else {
        let h = u || "Command failed";
        try {
          const r = JSON.parse(d);
          r.message && (h = r.message);
        } catch {
        }
        l({ success: !1, error: h });
      }
    }), s.on("error", (n) => {
      l({ success: !1, error: n.message });
    });
  });
}
ge.handle("template-sources:list", async () => jt(["list-sources"]));
ge.handle("template-sources:add", async (e, t, l, s, d) => jt([
  "add-source",
  "--name",
  t,
  "--url",
  l,
  "--branch",
  s,
  "--priority",
  String(d)
]));
ge.handle("template-sources:remove", async (e, t) => jt(["remove-source", "--name", t]));
ge.handle("template-sources:toggle", async (e, t) => jt(["toggle-source", "--name", t]));
ge.handle("template-sources:update", async (e, t, l) => {
  const s = ["update-source", "--name", t];
  return l.newName && s.push("--new-name", l.newName), l.url && s.push("--url", l.url), l.branch && s.push("--branch", l.branch), l.priority !== void 0 && s.push("--priority", String(l.priority)), jt(s);
});
ge.handle("template-sources:sync", async (e, t) => {
  const l = ["sync"];
  return t && l.push("--source", t), jt(l);
});
ge.handle("template-sources:status", async () => jt(["status"]));
const gh = Ut.requestSingleInstanceLock();
gh ? Ut.on("second-instance", () => {
  Le && (Le.isMinimized() && Le.restore(), Le.focus());
}) : Ut.quit();
Ut.whenReady().then(() => {
  lf.setApplicationMenu(null), vc(), Br(), process.env.VITE_DEV_SERVER_URL || (Cs.autoUpdater.autoDownload = !0, Cs.autoUpdater.autoInstallOnAppQuit = !0, Cs.autoUpdater.checkForUpdatesAndNotify().catch((e) => {
    console.log("Auto-update check failed:", e?.message);
  })), Ut.on("activate", () => {
    $t.getAllWindows().length === 0 && vc();
  });
});
Ut.on("window-all-closed", () => {
  zs();
  for (const [, e] of er)
    e.close();
  er.clear();
  for (const [, e] of Lt)
    e.isDestroyed() || e.close();
  Lt.clear();
  for (const [, e] of Zt)
    e.isDestroyed() || e.close();
  Zt.clear(), rh(), sh(), process.platform !== "darwin" && Ut.quit();
});
