"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (e) {
    return e && e.__esModule ? e : { default: e };
  };
Object.defineProperty(exports, "__esModule", { value: !0 });
var rxjs_1 = require("rxjs"),
  operators_1 = require("rxjs/operators"),
  ws_1 = __importDefault(require("ws")),
  sensors = [
    { id: "0", name: "Temperature", connected: !1, unit: "°C", value: "15" },
    { id: "1", name: "Pressure", connected: !1, unit: "kPa", value: "101.325" },
    { id: "2", name: "Humidity", connected: !1, unit: "%", value: "45" },
    { id: "3", name: "PM2.5", connected: !1, unit: "PM2.5", value: "50" },
    { id: "4", name: "PM10", connected: !1, unit: "PM10", value: "43" },
    { id: "5", name: "Wind", connected: !1, unit: "m/s", value: "7" },
  ],
  generateSensor = function (e) {
    return {
      id: e.id,
      name: e.name,
      connected: isSensorConnected(e.id),
      unit: e.unit,
      value: isSensorConnected(e.id)
        ? (Math.random() + Number(e.value)).toFixed(3).toString()
        : null,
    };
  },
  connectedSensors = [],
  isSensorConnected = function (e) {
    return connectedSensors.includes(e);
  },
  PORT = 5001,
  initialized = !1,
  wss = new ws_1.default.Server({ port: PORT });
wss.on("connection", function (r) {
  r.on("message", function (n) {
    var t;
    try {
      t = JSON.parse(n);
    } catch (e) {
      t = n;
    }
    console.log("Client -> Server: ", t),
      t && "disconnect" === t.command && void 0 !== t.id
        ? ((connectedSensors = connectedSensors.filter(function (e) {
            return e !== t.id;
          })),
          r.send(
            JSON.stringify(
              generateSensor(
                sensors.find(function (e) {
                  return e.id === t.id;
                })
              )
            )
          ))
        : t && "connect" === t.command && void 0 !== t.id
        ? connectedSensors.includes(t.id) || connectedSensors.push(t.id)
        : console.log("Unhandled message");
  }),
    sensors.forEach(function (e) {
      r.send(JSON.stringify(generateSensor(e)));
    }),
    initialized ||
      (new rxjs_1.Observable(function (n) {
        var e = setInterval(function () {
          sensors.forEach(function (e) {
            n.next(generateSensor(e));
          });
        }, 100);
        return function () {
          clearInterval(e);
        };
      })
        .pipe(
          operators_1.concatMap(function (e) {
            return rxjs_1.of(e).pipe(operators_1.delay(5 + 5 * Math.random()));
          })
        )
        .subscribe(function (n) {
          return (
            connectedSensors.includes(n.id) &&
            wss.clients.forEach(function (e) {
              return e.send(JSON.stringify(n));
            })
          );
        }),
      (initialized = !0));
}),
  console.log("Server started on: ws://localhost:" + PORT);
