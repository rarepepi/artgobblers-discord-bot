"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.AppService = void 0;
var common_1 = require("@nestjs/common");
var _a = require('discord-webhook-node'), Webhook = _a.Webhook, MessageBuilder = _a.MessageBuilder;
var axios_1 = require("axios");
var cron = require('node-cron');
var ethers_1 = require("ethers");
var AppService = /** @class */ (function () {
    function AppService() {
    }
    AppService_1 = AppService;
    AppService.prototype.sendDiscordMessage = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var hook, embed;
            return __generator(this, function (_a) {
                hook = new Webhook(process.env.DISCORD_WEBHOOK);
                embed = new MessageBuilder()
                    .setTitle(AppService_1.titles.sample())
                    .setURL("https://artgobblers.com/gobbler/".concat(data.gobblerId))
                    .setDescription("Gobbler ".concat(data.gobblerId, " (").concat(data.gobblerMetadata.name.split(' –')[1], ")\n        gobbled\n        Page ").concat(data.pageId, " (").concat(data.pageMetadata.name.split(' –')[0], ")\n        ").concat(data.pageMetadata.attributes[1].value))
                    .setThumbnail(data.gobblerMetadata.image)
                    .setImage(data.pageMetadata.image)
                    .setColor(data.pageMetadata.background_color);
                hook.send(embed);
                return [2 /*return*/];
            });
        });
    };
    AppService.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var gobblersAddress, gobbleEventHash, lastBlock, txnList, txns, _i, txns_1, txn, gobblerTokenId, pageTokenId, gobblerMetadata, pageMetadata;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (AppService_1.running) {
                            return [2 /*return*/, 'Already running!'];
                        }
                        gobblersAddress = '0x60bb1e2aa1c9acafb4d34f71585d7e959f387769';
                        gobbleEventHash = ethers_1.ethers.utils.id('ArtGobbled(address,uint256,address,uint256)');
                        lastBlock = 16206244;
                        return [4 /*yield*/, axios_1["default"].get("https://api.etherscan.io/api?module=logs&action=getLogs&address=".concat(gobblersAddress, "&fromBlock=").concat(AppService_1.lastBlockProcessed, "&toBlock=").concat(lastBlock, "&page=1&offset=1000&apikey=").concat(process.env.ETHERSCAN_API_KEY))];
                    case 1:
                        txnList = _a.sent();
                        txns = txnList.data.result;
                        _i = 0, txns_1 = txns;
                        _a.label = 2;
                    case 2:
                        if (!(_i < txns_1.length)) return [3 /*break*/, 7];
                        txn = txns_1[_i];
                        if (AppService_1.txnsAlreadySent.has(txn.transactionHash)) {
                            return [3 /*break*/, 6];
                        }
                        if (!(txn.topics[0] === gobbleEventHash)) return [3 /*break*/, 6];
                        gobblerTokenId = parseInt(txn.topics[2]);
                        pageTokenId = parseInt(txn.data);
                        return [4 /*yield*/, axios_1["default"].get("https://nfts.artgobblers.com/api/gobblers/".concat(gobblerTokenId))];
                    case 3:
                        gobblerMetadata = (_a.sent()).data;
                        return [4 /*yield*/, axios_1["default"].get("https://nfts.artgobblers.com/api/pages/".concat(pageTokenId))];
                    case 4:
                        pageMetadata = (_a.sent()).data;
                        return [4 /*yield*/, this.sendDiscordMessage({
                                gobblerId: gobblerTokenId,
                                gobblerMetadata: gobblerMetadata,
                                pageId: pageTokenId,
                                pageMetadata: pageMetadata
                            })];
                    case 5:
                        _a.sent();
                        AppService_1.txnsAlreadySent.add(txn.transactionHash);
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7:
                        AppService_1.lastBlockProcessed = lastBlock;
                        // });
                        AppService_1.running = true;
                        return [2 /*return*/, 'Running!'];
                }
            });
        });
    };
    var AppService_1;
    AppService.running = false;
    AppService.txnsToSend = new Set();
    AppService.txnsAlreadySent = new Set();
    AppService.lastBlockProcessed = 16203000;
    AppService.titles = ['Looks delicious!', 'Its a feast!', 'Yum!'];
    AppService = AppService_1 = __decorate([
        (0, common_1.Injectable)()
    ], AppService);
    return AppService;
}());
exports.AppService = AppService;
