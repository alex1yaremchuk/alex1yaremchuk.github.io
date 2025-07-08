"use strict";
var engine = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // dist/index.js
  var index_exports = {};
  __export(index_exports, {
    ConsoleLogger: () => ConsoleLogger,
    HtmlLogger: () => HtmlLogger,
    MultiLogger: () => MultiLogger,
    simulateMatch: () => simulateMatch
  });

  // dist/utils.js
  function adjustByAttribute(base, param) {
    return base * (11 - param) / 10;
  }

  // dist/rally.js
  function formatRallyLog(server, receiver, log) {
    const width = 2;
    const gap = "";
    const maxNameLength = Math.max(server.name.length, receiver.name.length);
    let lineServer = `${server.name.padEnd(maxNameLength, " ")}: `;
    let lineReceiver = `${receiver.name.padEnd(maxNameLength, " ")}: `;
    for (let i = 0; i < log.length; i++) {
      const val = log[i].toFixed(1).padStart(width);
      if (i % 2 === 0) {
        lineServer += gap + val;
        lineReceiver += gap + " ".repeat(width);
      } else {
        lineReceiver += gap + val;
        lineServer += gap + " ".repeat(width);
      }
    }
    return [lineServer, lineReceiver];
  }
  function calculateResponse(player, incoming, risk = 1, rallyFatigue = 0, logger) {
    const globalFatigue = player.fatigue ?? 0;
    const physique = Math.max(0, player.physique - globalFatigue - rallyFatigue);
    const emotion = Math.max(0, player.emotion + (player.emotionState ?? 0));
    const mean = (player.technique + player.mind + physique + emotion) / 4;
    let quality = (mean + (5 - incoming)) * risk;
    quality += Math.random() * 4 - 2;
    if (quality > 10)
      quality = 10;
    if (quality < 0)
      quality = 0;
    return quality;
  }
  function simulateRally(server, receiver, risk = 1, logger) {
    let hitter = receiver;
    let defender = server;
    const rallyFatigue = /* @__PURE__ */ new Map([
      [server, 0],
      [receiver, 0]
    ]);
    const serveEmotion = Math.max(0, server.emotion + (server.emotionState ?? 0));
    let incoming = (server.serve + serveEmotion) / 2 + Math.random() * 4 - 2;
    rallyFatigue.set(server, 0.2);
    const log = [incoming];
    const finishRally = (winner) => {
      for (const p of [server, receiver]) {
        const f = rallyFatigue.get(p) ?? 0;
        const baseFatigue = f * 0.1;
        const fatigueGain = adjustByAttribute(baseFatigue, p.physique);
        p.fatigue = (p.fatigue ?? 0) + fatigueGain;
        rallyFatigue.set(p, 0);
      }
      const [line1, line2] = formatRallyLog(server, receiver, log);
      logger?.log({ level: "rallyDetailed", text: line1 });
      logger?.log({ level: "rallyDetailed", text: line2 });
      logger?.log({ level: "rallyDetailed", text: "" });
      return { winner, log };
    };
    while (true) {
      const hitterFatigue = rallyFatigue.get(hitter) ?? 0;
      const response = calculateResponse(hitter, incoming, risk, hitterFatigue, logger);
      log.push(response);
      if (response >= 9) {
        return finishRally(hitter);
      }
      if (response <= 1) {
        return finishRally(defender);
      }
      incoming = response;
      rallyFatigue.set(hitter, hitterFatigue + 0.2);
      [hitter, defender] = [defender, hitter];
    }
  }

  // dist/logMessages.js
  function msg(level, text) {
    return { level, text };
  }
  var logMessages = {
    rallyStart: (lang, server, first) => msg("rally", lang === "ru" ? `\u0420\u043E\u0437\u044B\u0433\u0440\u044B\u0448 \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F. \u041F\u043E\u0434\u0430\u0435\u0442 ${server}, \u043F\u0435\u0440\u0432\u044B\u0439 \u0443\u0434\u0430\u0440 ${first}` : `Rally starts. Server ${server} first ${first}`),
    rallyWinner: (lang, winner, score) => msg("rally", lang === "ru" ? `\u041E\u0447\u043A\u043E \u0432\u044B\u0438\u0433\u0440\u044B\u0432\u0430\u0435\u0442 ${winner}. \u0421\u0447\u0451\u0442: ${score}` : `Rally winner ${winner}. Score is ${score}.`),
    rallyResponse: (lang, player, quality, incoming) => msg("debug", lang === "ru" ? `${player} \u043E\u0442\u0432\u0435\u0447\u0430\u0435\u0442 ${quality.toFixed(2)} \u043D\u0430 ${incoming}` : `${player} responds ${quality.toFixed(2)} to ${incoming}`),
    gameStart: (lang, server) => msg("game", lang === "ru" ? `\u041D\u0430\u0447\u0430\u043B\u043E \u0433\u0435\u0439\u043C\u0430. \u041F\u043E\u0434\u0430\u0435\u0442 ${server}` : `Game start. Server ${server}`),
    clutchValue: (lang, player, value) => msg("debug", lang === "ru" ? `\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u044C \u043A\u043B\u0430\u0442\u0447\u0430 \u0434\u043B\u044F ${player} \u0440\u0430\u0432\u0435\u043D ${value} ` : `Clutch value for ${player} is ${value} `),
    beforeRally: (lang, aName, aFatigue, aEmotion, bName, bFatigue, bEmotion) => msg("debug", lang === "ru" ? `\u041F\u0435\u0440\u0435\u0434 \u0440\u043E\u0437\u044B\u0433\u0440\u044B\u0448\u0435\u043C: ${aName} \u0423\u0441\u0442:${aFatigue.toFixed(2)} \u042D\u043C:${aEmotion.toFixed(2)} | ${bName} \u0423\u0441\u0442:${bFatigue.toFixed(2)} \u042D\u043C:${bEmotion.toFixed(2)}` : `Before rally: ${aName} F:${aFatigue.toFixed(2)} E:${aEmotion.toFixed(2)} | ${bName} F:${bFatigue.toFixed(2)} E:${bEmotion.toFixed(2)}`),
    score: (lang, a, b, serving) => msg("rally", lang === "ru" ? `${a}-${b} \u043F\u043E\u0434\u0430\u0435\u0442 ${serving}` : `${a}-${b} serving ${serving}`),
    gameWinner: (lang, winner) => msg("game", lang === "ru" ? `\u041F\u043E\u0431\u0435\u0434\u0430 \u0432 \u0433\u0435\u0439\u043C\u0435 ${winner}` : `Game winner ${winner}`),
    matchStart: (lang, a, b) => msg("game", lang === "ru" ? `\u{1F3F8} \u041C\u0430\u0442\u0447: ${a} \u043F\u0440\u043E\u0442\u0438\u0432 ${b}` : `\u{1F3F8} Match: ${a} vs ${b}`),
    gameFinished: (lang, scoreA, scoreB, winner) => msg("game", lang === "ru" ? `\u0413\u0435\u0439\u043C \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D ${scoreA}-${scoreB} \u043F\u043E\u0431\u0435\u0434\u0438\u0442\u0435\u043B\u044C ${winner}` : `Game finished ${scoreA}-${scoreB} winner ${winner}`),
    matchWinner: (lang, winner, loser, scores) => msg("match", lang === "ru" ? `\u{1F3C6} ${winner} \u043F\u043E\u0431\u0435\u0434\u0438\u043B ${loser} (${scores.join(", ")})` : `\u{1F3C6} ${winner} defeated  ${loser} (${scores.join(", ")})`),
    matchResultHeader: (lang) => msg("match", lang === "ru" ? "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u043C\u0430\u0442\u0447\u0430:" : "Match result:"),
    matchResultGame: (lang, game, scoreA, scoreB, winner) => msg("game", lang === "ru" ? `\u0413\u0435\u0439\u043C ${game}: ${scoreA}-${scoreB} \u043F\u043E\u0431\u0435\u0434\u0438\u0442\u0435\u043B\u044C: ${winner}` : `Game ${game}: ${scoreA}-${scoreB} winner: ${winner}`)
  };

  // dist/game.js
  function simulateGame(playerA, playerB, server, logger) {
    let scoreA = 0;
    let scoreB = 0;
    let serving = server;
    let streakA = 0;
    let streakB = 0;
    while (true) {
      const prevScoreA = scoreA;
      const prevScoreB = scoreB;
      const scoreDiff = Math.abs(scoreA - scoreB);
      const isClose = scoreDiff <= 1;
      const tensePlayers = [];
      if (isClose) {
        tensePlayers.push(playerA, playerB);
      }
      if (scoreA >= 19)
        tensePlayers.push(playerA);
      if (scoreB >= 19)
        tensePlayers.push(playerB);
      for (const p of tensePlayers) {
        const clutchPenalty = adjustByAttribute(2, p.emotion);
        logger?.log(logMessages.clutchValue(logger?.language ?? "en", p.name, clutchPenalty));
        p.emotionState = (p.emotionState ?? 0) - clutchPenalty;
      }
      logger?.log(logMessages.beforeRally(logger?.language ?? "en", playerA.name, playerA.fatigue ?? 0, playerA.emotionState ?? 0, playerB.name, playerB.fatigue ?? 0, playerB.emotionState ?? 0));
      const receiver = serving === playerA ? playerB : playerA;
      const { winner: winner2 } = simulateRally(serving, receiver, 1, logger);
      const loser = winner2 === serving ? receiver : serving;
      if (winner2 === serving) {
        if (serving === playerA)
          scoreA++;
        else
          scoreB++;
      } else {
        if (receiver === playerA)
          scoreA++;
        else
          scoreB++;
        serving = receiver;
      }
      if (loser === playerA) {
        streakA++;
        streakB = 0;
        if (streakA <= 3) {
          const penalty = adjustByAttribute(0.5, playerA.emotion);
          playerA.emotionState = (playerA.emotionState ?? 0) - penalty;
        }
        playerB.emotionState = 0;
      } else {
        streakB++;
        streakA = 0;
        if (streakB <= 3) {
          const penalty = adjustByAttribute(0.5, playerB.emotion);
          playerB.emotionState = (playerB.emotionState ?? 0) - penalty;
        }
        playerA.emotionState = 0;
      }
      const reached11 = scoreA === 11 && prevScoreA === 10 || scoreB === 11 && prevScoreB === 10;
      if (reached11) {
        playerA.emotionState = 0;
        playerB.emotionState = 0;
      }
      logger?.log(logMessages.score(logger?.language ?? "en", scoreA, scoreB, serving.name));
      if ((scoreA >= 21 || scoreB >= 21) && Math.abs(scoreA - scoreB) >= 2)
        break;
      if (scoreA === 30 || scoreB === 30)
        break;
    }
    const winner = scoreA > scoreB ? playerA : playerB;
    playerA.emotionState = 0;
    playerB.emotionState = 0;
    return { winner, scoreA, scoreB };
  }

  // dist/match.js
  function simulateMatch(playerA, playerB, logger) {
    let startingServer = playerA;
    const games = [];
    let winsA = 0;
    let winsB = 0;
    logger?.log(logMessages.matchStart(logger?.language ?? "en", playerA.name, playerB.name));
    while (winsA < 2 && winsB < 2) {
      const result = simulateGame(playerA, playerB, startingServer, logger);
      games.push(result);
      if (result.winner === playerA)
        winsA++;
      else
        winsB++;
      logger?.log(logMessages.gameFinished(logger?.language ?? "en", result.scoreA, result.scoreB, result.winner.name));
      startingServer = startingServer === playerA ? playerB : playerA;
    }
    const winner = winsA > winsB ? playerA : playerB;
    const loser = winsA < winsB ? playerA : playerB;
    const losingScores = games.map((g) => {
      if (g.winner === winner) {
        return g.winner === playerA ? g.scoreB : g.scoreA;
      }
      return -(g.winner === playerA ? g.scoreA : g.scoreB);
    });
    logger?.log(logMessages.matchWinner(logger?.language ?? "en", winner.name, loser.name, losingScores));
    return { winner, games };
  }

  // dist/types.js
  var ConsoleLogger = class {
    constructor(enabled, language = "en") {
      this.enabled = enabled;
      this.language = language;
    }
    log(message) {
      if (this.enabled.has(message.level)) {
        console.log(`[${message.level}] ${message.text}`);
      }
    }
  };
  var HtmlLogger = class {
    constructor(enabled, language = "en") {
      this.enabled = enabled;
      this.language = language;
      this.logs = [];
    }
    log(message) {
      if (this.enabled.has(message.level)) {
        this.logs.push(`<p>[${message.level}] ${message.text}</p>`);
      }
    }
    toHtml() {
      return this.logs.join("");
    }
  };
  var MultiLogger = class {
    constructor(loggers, language) {
      this.loggers = loggers;
      this.language = language ?? this.loggers[0]?.language ?? "en";
    }
    log(message) {
      for (const logger of this.loggers) {
        logger.log(message);
      }
    }
  };
  return __toCommonJS(index_exports);
})();
