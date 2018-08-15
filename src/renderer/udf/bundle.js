'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } } };

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

/**
 * If you want to enable logs from datafeed set it to `true`
 */
var isLoggingEnabled = true;
function logMessage(message) {
    if (isLoggingEnabled) {
        var now = new Date();
        console.log(now.toLocaleTimeString() + "." + now.getMilliseconds() + "> " + message);
    }
}
function getErrorMessage(error) {
    if (error === undefined) {
        return '';
    }
    else if (typeof error === 'string') {
        return error;
    }
    return error.message;
}

var HistoryProvider = /** @class */ (function () {
    function HistoryProvider(datafeedUrl, requester) {
        this._datafeedUrl = datafeedUrl;
        this._requester = requester;
    }
    HistoryProvider.prototype.getBars = function (symbolInfo, resolution, rangeStartDate, rangeEndDate) {
        var _this = this;
        var requestParams = {
            symbol: symbolInfo.ticker || '',
            resolution: resolution,
            from: rangeStartDate,
            to: rangeEndDate,
        };
        return new Promise(function (resolve, reject) {
            _this._requester.sendRequest(_this._datafeedUrl, 'history', requestParams)
                .then(function (response) {
                if (response.s !== 'ok' && response.s !== 'no_data') {
                    reject(response.errmsg);
                    return;
                }
                var bars = [];
                var meta = {
                    noData: false,
                };
                if (response.s === 'no_data') {
                    meta.noData = true;
                    meta.nextTime = response.nextTime;
                }
                else {
                    var volumePresent = response.v !== undefined;
                    var ohlPresent = response.o !== undefined;
                    for (var i = 0; i < response.t.length; ++i) {
                        var barValue = {
                            time: response.t[i] * 1000,
                            close: Number(response.c[i]),
                            open: Number(response.c[i]),
                            high: Number(response.c[i]),
                            low: Number(response.c[i]),
                        };
                        if (ohlPresent) {
                            barValue.open = Number(response.o[i]);
                            barValue.high = Number(response.h[i]);
                            barValue.low = Number(response.l[i]);
                        }
                        if (volumePresent) {
                            barValue.volume = Number(response.v[i]);
                        }
                        bars.push(barValue);
                    }
                }
                resolve({
                    bars: bars,
                    meta: meta,
                });
            })
                .catch(function (reason) {
                var reasonString = getErrorMessage(reason);
                console.warn("HistoryProvider: getBars() failed, error=" + reasonString);
                reject(reasonString);
            });
        });
    };
    return HistoryProvider;
}());

var DataPulseProvider = /** @class */ (function () {
    function DataPulseProvider(historyProvider, updateFrequency) {
        this._subscribers = {};
        this._requestsPending = 0;
        this._lastStartTime = -1;
        this._historyProvider = historyProvider;
        console.log('------------------sequence:' + updateFrequency);
        this._interval = setInterval(this._updateData.bind(this), updateFrequency);
    }
    DataPulseProvider.prototype.clearInterval = function () {
        this._lastStartTime = -1;
        if (this._interval) {
            clearInterval(this._interval);
        }
    };
    DataPulseProvider.prototype.subscribeBars = function (symbolInfo, resolution, newDataCallback, listenerGuid) {
        if (this._subscribers.hasOwnProperty(listenerGuid)) {
            logMessage("DataPulseProvider: already has subscriber with id=" + listenerGuid);
            return;
        }
        this._subscribers[listenerGuid] = {
            lastBarTime: null,
            listener: newDataCallback,
            resolution: resolution,
            symbolInfo: symbolInfo,
        };
        logMessage("DataPulseProvider: subscribed for #" + listenerGuid + " - {" + symbolInfo.name + ", " + resolution + "}");
    };
    DataPulseProvider.prototype.unsubscribeBars = function (listenerGuid) {
        delete this._subscribers[listenerGuid];
        logMessage("DataPulseProvider: unsubscribed for #" + listenerGuid);
    };
    DataPulseProvider.prototype._updateData = function () {
        var this$1 = this;

        var _this = this;
        if (this._requestsPending > 0) {
            return;
        }
        this._requestsPending = 0;
        var _loop_1 = function (listenerGuid) {
            this_1._requestsPending += 1;
            this_1._updateDataForSubscriber(listenerGuid)
                .then(function () {
                _this._requestsPending -= 1;
                logMessage("DataPulseProvider: data for #" + listenerGuid + " updated successfully, pending=" + _this._requestsPending);
            })
                .catch(function (reason) {
                _this._requestsPending -= 1;
                logMessage("DataPulseProvider: data for #" + listenerGuid + " updated with error=" + getErrorMessage(reason) + ", pending=" + _this._requestsPending);
            });
        };
        var this_1 = this;
        for (var listenerGuid in this$1._subscribers) {
            _loop_1(listenerGuid);
        }
    };
    DataPulseProvider.prototype._updateDataForSubscriber = function (listenerGuid) {
        var _this = this;
        var subscriptionRecord = this._subscribers[listenerGuid];
        var endTime, startTime;
        endTime = parseInt((Date.now() / 1000).toString());
        if (this._lastStartTime < 0) {
            startTime = endTime - periodLengthSeconds(subscriptionRecord.resolution, 100);
        }
        else {
            startTime = this._lastStartTime;
        }
        var seconds = resolutionToSeconds(subscriptionRecord.resolution);
        if (endTime - startTime < seconds) {
            logMessage("\u4E0D\u5230\u4E00\u4E2A\u5468\u671F\uFF0C\u4E0D\u518D\u8BF7\u6C42\u8BBF\u95EE\u6570\u636E\uFF01");
            return Promise.reject("unavaiable");
        }
        this._lastStartTime = endTime;
        console.log('----resolution - p:-' + periodLengthSeconds(subscriptionRecord.resolution, 100));
        // const rangeEndTime = parseInt((Date.now() / 1000).toString());
        // BEWARE: please note we really need 2 bars, not the only last one
        // see the explanation below. `10` is the `large enough` value to work around holidays
        // const rangeStartTime = rangeEndTime - periodLengthSeconds(subscriptionRecord.resolution, 10);
        console.log("----read history---resolution:" + subscriptionRecord.resolution + " - startTime:" + startTime + ",--endTime:" + endTime + "---");
        return this._historyProvider.getBars(subscriptionRecord.symbolInfo, subscriptionRecord.resolution, startTime, endTime)
            .then(function (result) {
            _this._onSubscriberDataReceived(listenerGuid, result);
        });
    };
    DataPulseProvider.prototype._onSubscriberDataReceived = function (listenerGuid, result) {
        // means the subscription was cancelled while waiting for data
        if (!this._subscribers.hasOwnProperty(listenerGuid)) {
            logMessage("DataPulseProvider: Data comes for already unsubscribed subscription #" + listenerGuid);
            return;
        }
        var bars = result.bars;
        if (bars.length === 0) {
            return;
        }
        var lastBar = bars[bars.length - 1];
        var subscriptionRecord = this._subscribers[listenerGuid];
        if (subscriptionRecord.lastBarTime !== null && lastBar.time < subscriptionRecord.lastBarTime) {
            return;
        }
        var isNewBar = subscriptionRecord.lastBarTime !== null && lastBar.time > subscriptionRecord.lastBarTime;
        // Pulse updating may miss some trades data (ie, if pulse period = 10 secods and new bar is started 5 seconds later after the last update, the
        // old bar's last 5 seconds trades will be lost). Thus, at fist we should broadcast old bar updates when it's ready.
        if (isNewBar) {
            if (bars.length < 2) {
                throw new Error('Not enough bars in history for proper pulse update. Need at least 2.');
            }
            var previousBar = bars[bars.length - 2];
            subscriptionRecord.listener(previousBar);
        }
        subscriptionRecord.lastBarTime = lastBar.time;
        subscriptionRecord.listener(lastBar);
    };
    return DataPulseProvider;
}());
function periodLengthSeconds(resolution, requiredPeriodsCount) {
    var daysCount = 0;
    if (resolution === 'D' || resolution === '1D') {
        daysCount = requiredPeriodsCount;
    }
    else if (resolution === 'M' || resolution === '1M') {
        daysCount = 31 * requiredPeriodsCount;
    }
    else if (resolution === 'W' || resolution === '1W') {
        daysCount = 7 * requiredPeriodsCount;
    }
    else {
        daysCount = requiredPeriodsCount * parseInt(resolution) / (24 * 60);
    }
    return daysCount * 24 * 60 * 60;
}
/**
 *
 * @param resolution 周期
 */
function resolutionToSeconds(resolution) {
    var millis = 0;
    if (resolution === 'D' || resolution === '1D') {
        millis = 86400;
    }
    else if (resolution === 'M' || resolution === '1M') {
        millis = 2678400;
    }
    else if (resolution === 'W' || resolution === '1W') {
        millis = 604800;
    }
    else {
        millis = parseInt(resolution);
    }
    return millis;
}

var QuotesPulseProvider = /** @class */ (function () {
    function QuotesPulseProvider(quotesProvider) {
        this._subscribers = {};
        this._requestsPending = 0;
        this._quotesProvider = quotesProvider;
        setInterval(this._updateQuotes.bind(this, 1 /* Fast */), 10000 /* Fast */);
        setInterval(this._updateQuotes.bind(this, 0 /* General */), 60000 /* General */);
    }
    QuotesPulseProvider.prototype.subscribeQuotes = function (symbols, fastSymbols, onRealtimeCallback, listenerGuid) {
        this._subscribers[listenerGuid] = {
            symbols: symbols,
            fastSymbols: fastSymbols,
            listener: onRealtimeCallback,
        };
        logMessage("QuotesPulseProvider: subscribed quotes with #" + listenerGuid);
    };
    QuotesPulseProvider.prototype.unsubscribeQuotes = function (listenerGuid) {
        delete this._subscribers[listenerGuid];
        logMessage("QuotesPulseProvider: unsubscribed quotes with #" + listenerGuid);
    };
    QuotesPulseProvider.prototype._updateQuotes = function (updateType) {
        var this$1 = this;

        var _this = this;
        if (this._requestsPending > 0) {
            return;
        }
        var _loop_1 = function (listenerGuid) {
            this_1._requestsPending++;
            var subscriptionRecord = this_1._subscribers[listenerGuid];
            this_1._quotesProvider.getQuotes(updateType === 1 /* Fast */ ? subscriptionRecord.fastSymbols : subscriptionRecord.symbols)
                .then(function (data) {
                _this._requestsPending--;
                if (!_this._subscribers.hasOwnProperty(listenerGuid)) {
                    return;
                }
                subscriptionRecord.listener(data);
                logMessage("QuotesPulseProvider: data for #" + listenerGuid + " (" + updateType + ") updated successfully, pending=" + _this._requestsPending);
            })
                .catch(function (reason) {
                _this._requestsPending--;
                logMessage("QuotesPulseProvider: data for #" + listenerGuid + " (" + updateType + ") updated with error=" + getErrorMessage(reason) + ", pending=" + _this._requestsPending);
            });
        };
        var this_1 = this;
        for (var listenerGuid in this$1._subscribers) {
            _loop_1(listenerGuid);
        }
    };
    return QuotesPulseProvider;
}());

function extractField$1(data, field, arrayIndex) {
    var value = data[field];
    return Array.isArray(value) ? value[arrayIndex] : value;
}
var SymbolsStorage = /** @class */ (function () {
    function SymbolsStorage(datafeedUrl, datafeedSupportedResolutions, requester) {
        this._exchangesList = ['NYSE', 'FOREX', 'AMEX'];
        this._symbolsInfo = {};
        this._symbolsList = [];
        this._datafeedUrl = datafeedUrl;
        this._datafeedSupportedResolutions = datafeedSupportedResolutions;
        this._requester = requester;
        this._readyPromise = this._init();
        this._readyPromise.catch(function (error) {
            // seems it is impossible
            console.error("SymbolsStorage: Cannot init, error=" + error.toString());
        });
    }
    // BEWARE: this function does not consider symbol's exchange
    SymbolsStorage.prototype.resolveSymbol = function (symbolName) {
        var _this = this;
        return this._readyPromise.then(function () {
            var symbolInfo = _this._symbolsInfo[symbolName];
            if (symbolInfo === undefined) {
                return Promise.reject('invalid symbol');
            }
            return Promise.resolve(symbolInfo);
        });
    };
    SymbolsStorage.prototype.searchSymbols = function (searchString, exchange, symbolType, maxSearchResults) {
        var _this = this;
        return this._readyPromise.then(function () {
            var weightedResult = [];
            var queryIsEmpty = searchString.length === 0;
            searchString = searchString.toUpperCase();
            var _loop_1 = function (symbolName) {
                var symbolInfo = _this._symbolsInfo[symbolName];
                if (symbolInfo === undefined) {
                    return "continue";
                }
                if (symbolType.length > 0 && symbolInfo.type !== symbolType) {
                    return "continue";
                }
                if (exchange && exchange.length > 0 && symbolInfo.exchange !== exchange) {
                    return "continue";
                }
                var positionInName = symbolInfo.name.toUpperCase().indexOf(searchString);
                var positionInDescription = symbolInfo.description.toUpperCase().indexOf(searchString);
                if (queryIsEmpty || positionInName >= 0 || positionInDescription >= 0) {
                    var alreadyExists = weightedResult.some(function (item) { return item.symbolInfo === symbolInfo; });
                    if (!alreadyExists) {
                        var weight = positionInName >= 0 ? positionInName : 8000 + positionInDescription;
                        weightedResult.push({ symbolInfo: symbolInfo, weight: weight });
                    }
                }
            };
            for (var _i = 0, _a = _this._symbolsList; _i < _a.length; _i++) {
                var symbolName = _a[_i];
                _loop_1(symbolName);
            }
            var result = weightedResult
                .sort(function (item1, item2) { return item1.weight - item2.weight; })
                .slice(0, maxSearchResults)
                .map(function (item) {
                var symbolInfo = item.symbolInfo;
                return {
                    symbol: symbolInfo.name,
                    full_name: symbolInfo.full_name,
                    description: symbolInfo.description,
                    exchange: symbolInfo.exchange,
                    params: [],
                    type: symbolInfo.type,
                    ticker: symbolInfo.name,
                };
            });
            return Promise.resolve(result);
        });
    };
    SymbolsStorage.prototype._init = function () {
        var this$1 = this;

        var _this = this;
        var promises = [];
        var alreadyRequestedExchanges = {};
        for (var _i = 0, _a = this._exchangesList; _i < _a.length; _i++) {
            var exchange = _a[_i];
            if (alreadyRequestedExchanges[exchange]) {
                continue;
            }
            alreadyRequestedExchanges[exchange] = true;
            promises.push(this$1._requestExchangeData(exchange));
        }
        return Promise.all(promises)
            .then(function () {
            _this._symbolsList.sort();
            logMessage('SymbolsStorage: All exchanges data loaded');
        });
    };
    SymbolsStorage.prototype._requestExchangeData = function (exchange) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._requester.sendRequest(_this._datafeedUrl, 'symbol_info', { group: exchange })
                .then(function (response) {
                try {
                    _this._onExchangeDataReceived(exchange, response);
                }
                catch (error) {
                    reject(error);
                    return;
                }
                resolve();
            })
                .catch(function (reason) {
                logMessage("SymbolsStorage: Request data for exchange '" + exchange + "' failed, reason=" + getErrorMessage(reason));
                resolve();
            });
        });
    };
    SymbolsStorage.prototype._onExchangeDataReceived = function (exchange, data) {
        var this$1 = this;

        var symbolIndex = 0;
        try {
            var symbolsCount = data.symbol.length;
            var tickerPresent = data.ticker !== undefined;
            for (; symbolIndex < symbolsCount; ++symbolIndex) {
                var symbolName = data.symbol[symbolIndex];
                var listedExchange = extractField$1(data, 'exchange-listed', symbolIndex);
                var tradedExchange = extractField$1(data, 'exchange-traded', symbolIndex);
                var fullName = tradedExchange + ':' + symbolName;
                var ticker = tickerPresent ? extractField$1(data, 'ticker', symbolIndex) : symbolName;
                var symbolInfo = {
                    ticker: ticker,
                    name: symbolName,
                    base_name: [listedExchange + ':' + symbolName],
                    full_name: fullName,
                    listed_exchange: listedExchange,
                    exchange: tradedExchange,
                    description: extractField$1(data, 'description', symbolIndex),
                    has_intraday: definedValueOrDefault(extractField$1(data, 'has-intraday', symbolIndex), false),
                    has_no_volume: definedValueOrDefault(extractField$1(data, 'has-no-volume', symbolIndex), false),
                    minmov: extractField$1(data, 'minmovement', symbolIndex) || extractField$1(data, 'minmov', symbolIndex) || 0,
                    minmove2: extractField$1(data, 'minmove2', symbolIndex) || extractField$1(data, 'minmov2', symbolIndex),
                    fractional: extractField$1(data, 'fractional', symbolIndex),
                    pricescale: extractField$1(data, 'pricescale', symbolIndex),
                    type: extractField$1(data, 'type', symbolIndex),
                    session: extractField$1(data, 'session-regular', symbolIndex),
                    timezone: extractField$1(data, 'timezone', symbolIndex),
                    supported_resolutions: definedValueOrDefault(extractField$1(data, 'supported-resolutions', symbolIndex), this$1._datafeedSupportedResolutions),
                    force_session_rebuild: extractField$1(data, 'force-session-rebuild', symbolIndex),
                    has_daily: definedValueOrDefault(extractField$1(data, 'has-daily', symbolIndex), true),
                    intraday_multipliers: definedValueOrDefault(extractField$1(data, 'intraday-multipliers', symbolIndex), ['1', '5', '15', '30', '60']),
                    has_weekly_and_monthly: extractField$1(data, 'has-weekly-and-monthly', symbolIndex),
                    has_empty_bars: extractField$1(data, 'has-empty-bars', symbolIndex),
                    volume_precision: definedValueOrDefault(extractField$1(data, 'volume-precision', symbolIndex), 0),
                };
                this$1._symbolsInfo[ticker] = symbolInfo;
                this$1._symbolsInfo[symbolName] = symbolInfo;
                this$1._symbolsInfo[fullName] = symbolInfo;
                this$1._symbolsList.push(symbolName);
            }
        }
        catch (error) {
            throw new Error("SymbolsStorage: API error when processing exchange " + exchange + " symbol #" + symbolIndex + " (" + data.symbol[symbolIndex] + "): " + error.message);
        }
    };
    return SymbolsStorage;
}());
function definedValueOrDefault(value, defaultValue) {
    return value !== undefined ? value : defaultValue;
}

function extractField(data, field, arrayIndex) {
    var value = data[field];
    return Array.isArray(value) ? value[arrayIndex] : value;
}
/**
 * This class implements interaction with UDF-compatible datafeed.
 * See UDF protocol reference at https://github.com/tradingview/charting_library/wiki/UDF
 */
var UDFCompatibleDatafeedBase = /** @class */ (function () {
    function UDFCompatibleDatafeedBase(datafeedURL, quotesProvider, requester, updateFrequency) {
        if (updateFrequency === void 0) { updateFrequency = 60 * 1000; }
        var _this = this;
        this._configuration = defaultConfiguration();
        this._symbolsStorage = null;
        this._datafeedURL = datafeedURL;
        this._requester = requester;
        this._historyProvider = new HistoryProvider(datafeedURL, this._requester);
        this._quotesProvider = quotesProvider;
        this._dataPulseProvider = new DataPulseProvider(this._historyProvider, updateFrequency);
        this._quotesPulseProvider = new QuotesPulseProvider(this._quotesProvider);
        this._configurationReadyPromise = this._requestConfiguration()
            .then(function (configuration) {
            if (configuration === null) {
                configuration = defaultConfiguration();
            }
            _this._setupWithConfiguration(configuration);
        });
    }
    UDFCompatibleDatafeedBase.prototype.clear = function () {
        this._dataPulseProvider.clearInterval();
    };
    UDFCompatibleDatafeedBase.prototype.onReady = function (callback) {
        var _this = this;
        this._configurationReadyPromise.then(function () {
            callback(_this._configuration);
        });
    };
    UDFCompatibleDatafeedBase.prototype.getQuotes = function (symbols, onDataCallback, onErrorCallback) {
        this._quotesProvider.getQuotes(symbols).then(onDataCallback).catch(onErrorCallback);
    };
    UDFCompatibleDatafeedBase.prototype.subscribeQuotes = function (symbols, fastSymbols, onRealtimeCallback, listenerGuid) {
        this._quotesPulseProvider.subscribeQuotes(symbols, fastSymbols, onRealtimeCallback, listenerGuid);
    };
    UDFCompatibleDatafeedBase.prototype.unsubscribeQuotes = function (listenerGuid) {
        this._quotesPulseProvider.unsubscribeQuotes(listenerGuid);
    };
    UDFCompatibleDatafeedBase.prototype.calculateHistoryDepth = function (resolution, resolutionBack, intervalBack) {
        return undefined;
    };
    UDFCompatibleDatafeedBase.prototype.getMarks = function (symbolInfo, startDate, endDate, onDataCallback, resolution) {
        if (!this._configuration.supports_marks) {
            return;
        }
        var requestParams = {
            symbol: symbolInfo.ticker || '',
            from: startDate,
            to: endDate,
            resolution: resolution,
        };
        this._send('marks', requestParams)
            .then(function (response) {
            if (!Array.isArray(response)) {
                var result = [];
                for (var i = 0; i < response.id.length; ++i) {
                    result.push({
                        id: extractField(response, 'id', i),
                        time: extractField(response, 'time', i),
                        color: extractField(response, 'color', i),
                        text: extractField(response, 'text', i),
                        label: extractField(response, 'label', i),
                        labelFontColor: extractField(response, 'labelFontColor', i),
                        minSize: extractField(response, 'minSize', i),
                    });
                }
                response = result;
            }
            onDataCallback(response);
        })
            .catch(function (error) {
            logMessage("UdfCompatibleDatafeed: Request marks failed: " + getErrorMessage(error));
            onDataCallback([]);
        });
    };
    UDFCompatibleDatafeedBase.prototype.getTimescaleMarks = function (symbolInfo, startDate, endDate, onDataCallback, resolution) {
        if (!this._configuration.supports_timescale_marks) {
            return;
        }
        var requestParams = {
            symbol: symbolInfo.ticker || '',
            from: startDate,
            to: endDate,
            resolution: resolution,
        };
        this._send('timescale_marks', requestParams)
            .then(function (response) {
            if (!Array.isArray(response)) {
                var result = [];
                for (var i = 0; i < response.id.length; ++i) {
                    result.push({
                        id: extractField(response, 'id', i),
                        time: extractField(response, 'time', i),
                        color: extractField(response, 'color', i),
                        label: extractField(response, 'label', i),
                        tooltip: extractField(response, 'tooltip', i),
                    });
                }
                response = result;
            }
            onDataCallback(response);
        })
            .catch(function (error) {
            logMessage("UdfCompatibleDatafeed: Request timescale marks failed: " + getErrorMessage(error));
            onDataCallback([]);
        });
    };
    UDFCompatibleDatafeedBase.prototype.getServerTime = function (callback) {
        if (!this._configuration.supports_time) {
            return;
        }
        this._send('time')
            .then(function (response) {
            var time = parseInt(response);
            if (!isNaN(time)) {
                callback(time);
            }
        })
            .catch(function (error) {
            logMessage("UdfCompatibleDatafeed: Fail to load server time, error=" + getErrorMessage(error));
        });
    };
    UDFCompatibleDatafeedBase.prototype.searchSymbols = function (userInput, exchange, symbolType, onResult) {
        if (this._configuration.supports_search) {
            var params = {
                limit: 30 /* SearchItemsLimit */,
                query: userInput.toUpperCase(),
                type: symbolType,
                exchange: exchange,
            };
            this._send('search', params)
                .then(function (response) {
                if (response.s !== undefined) {
                    logMessage("UdfCompatibleDatafeed: search symbols error=" + response.errmsg);
                    onResult([]);
                    return;
                }
                onResult(response);
            })
                .catch(function (reason) {
                logMessage("UdfCompatibleDatafeed: Search symbols for '" + userInput + "' failed. Error=" + getErrorMessage(reason));
                onResult([]);
            });
        }
        else {
            if (this._symbolsStorage === null) {
                throw new Error('UdfCompatibleDatafeed: inconsistent configuration (symbols storage)');
            }
            this._symbolsStorage.searchSymbols(userInput, exchange, symbolType, 30 /* SearchItemsLimit */)
                .then(onResult)
                .catch(onResult.bind(null, []));
        }
    };
    UDFCompatibleDatafeedBase.prototype.resolveSymbol = function (symbolName, onResolve, onError) {
        logMessage('Resolve requested');
        var resolveRequestStartTime = Date.now();
        function onResultReady(symbolInfo) {
            logMessage("Symbol resolved: " + (Date.now() - resolveRequestStartTime) + "ms");
            onResolve(symbolInfo);
        }
        if (!this._configuration.supports_group_request) {
            var params = {
                symbol: symbolName,
            };
            this._send('symbols', params)
                .then(function (response) {
                if (response.s !== undefined) {
                    onError('unknown_symbol');
                }
                else {
                    onResultReady(response);
                }
            })
                .catch(function (reason) {
                logMessage("UdfCompatibleDatafeed: Error resolving symbol: " + getErrorMessage(reason));
                onError('unknown_symbol');
            });
        }
        else {
            if (this._symbolsStorage === null) {
                throw new Error('UdfCompatibleDatafeed: inconsistent configuration (symbols storage)');
            }
            this._symbolsStorage.resolveSymbol(symbolName).then(onResultReady).catch(onError);
        }
    };
    UDFCompatibleDatafeedBase.prototype.getBars = function (symbolInfo, resolution, rangeStartDate, rangeEndDate, onResult, onError) {
        this._historyProvider.getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate)
            .then(function (result) {
            onResult(result.bars, result.meta);
        })
            .catch(onError);
    };
    UDFCompatibleDatafeedBase.prototype.subscribeBars = function (symbolInfo, resolution, onTick, listenerGuid, onResetCacheNeededCallback) {
        this._dataPulseProvider.subscribeBars(symbolInfo, resolution, onTick, listenerGuid);
    };
    UDFCompatibleDatafeedBase.prototype.unsubscribeBars = function (listenerGuid) {
        this._dataPulseProvider.unsubscribeBars(listenerGuid);
    };
    UDFCompatibleDatafeedBase.prototype._requestConfiguration = function () {
        return this._send('config')
            .catch(function (reason) {
            logMessage("UdfCompatibleDatafeed: Cannot get datafeed configuration - use default, error=" + getErrorMessage(reason));
            return null;
        });
    };
    UDFCompatibleDatafeedBase.prototype._send = function (urlPath, params) {
        return this._requester.sendRequest(this._datafeedURL, urlPath, params);
    };
    UDFCompatibleDatafeedBase.prototype._setupWithConfiguration = function (configurationData) {
        this._configuration = configurationData;
        if (configurationData.exchanges === undefined) {
            configurationData.exchanges = [];
        }
        if (!configurationData.supports_search && !configurationData.supports_group_request) {
            throw new Error('Unsupported datafeed configuration. Must either support search, or support group request');
        }
        if (configurationData.supports_group_request || !configurationData.supports_search) {
            this._symbolsStorage = new SymbolsStorage(this._datafeedURL, configurationData.supported_resolutions || [], this._requester);
        }
        logMessage("UdfCompatibleDatafeed: Initialized with " + JSON.stringify(configurationData));
    };
    return UDFCompatibleDatafeedBase;
}());
function defaultConfiguration() {
    return {
        supports_search: false,
        supports_group_request: true,
        supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', '1M'],
        supports_marks: false,
        supports_timescale_marks: false,
    };
}

var QuotesProvider = /** @class */ (function () {
    function QuotesProvider(datafeedUrl, requester) {
        this._datafeedUrl = datafeedUrl;
        this._requester = requester;
    }
    QuotesProvider.prototype.getQuotes = function (symbols) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._requester.sendRequest(_this._datafeedUrl, 'quotes', { symbols: symbols })
                .then(function (response) {
                if (response.s === 'ok') {
                    resolve(response.d);
                }
                else {
                    reject(response.errmsg);
                }
            })
                .catch(function (error) {
                var errorMessage = getErrorMessage(error);
                logMessage("QuotesProvider: getQuotes failed, error=" + errorMessage);
                reject("network error: " + errorMessage);
            });
        });
    };
    return QuotesProvider;
}());

var URL_PREFIX = 'firefly_trade_mock';
var FFWAPI = /** @class */ (function () {
    function FFWAPI(datafeedUrl, params) {
        this._datafeedUrl = datafeedUrl;
        var index = datafeedUrl.indexOf(URL_PREFIX);
        this._params = params;
        this._key = datafeedUrl.substring(index + URL_PREFIX.length + 1, datafeedUrl.length);
        this._horizonServer = datafeedUrl.substring(0, index);
        var assets_split = this._key.split('-');
        var base = assets_split[0];
        var counter = assets_split[1];
        if (base.indexOf('_') > 0) {
            var _base = base.split('_');
            this._baseCode = _base[0];
            this._baseIssuer = _base[1];
        }
        else {
            this._baseCode = 'XLM';
        }
        if (counter.indexOf('_') > 0) {
            var _counter = counter.split('_');
            this._counterCode = _counter[0];
            this._counterIssuer = _counter[1];
        }
        else {
            this._counterCode = 'XLM';
        }
    }
    FFWAPI.prototype.handle = function (urlPath) {
        if ('config' === urlPath) {
            return this.config();
        }
        if ('symbols' === urlPath) {
            return this.symbol();
        }
        if ('history' === urlPath) {
            return this.history();
        }
        return Promise.reject("no implements");
    };
    //获取config内容
    FFWAPI.prototype.config = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var result = {
                supports_search: true,
                supports_group_request: false,
                supported_resolutions: ["1", "5", "15", "60", "1D", "1W"],
                supports_marks: true,
                supports_time: true,
                exchanges: [{
                        value: 'firefly',
                        name: 'firefly',
                        desc: 'firefly',
                    }],
                symbols_types: [{ name: 'Stock', value: 'stock' }]
            };
            resolve(result);
        });
    };
    /**
     * 商品解析
     */
    FFWAPI.prototype.symbol = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            resolve({
                name: _this._baseCode + '/' + _this._counterCode,
                ticker: _this._key,
                description: '',
                type: 'bitcoin',
                exchange: 'firefly',
                timezone: 'UTC',
                minmov: 1,
                // pricescale: 0.0000001,
                minmov2: 0,
                // pointvalue: 1,
                has_intraday: true,
                "intraday_multipliers": ['1'], 
                supported_resolutions: ["1", "5", "15", "60", "1D", "1W"],
                has_seconds: false,
                has_daily: true,
                has_weekly_and_monthly: false,
                has_empty_bars: true,
                has_no_volume: false,
                volume_precision: 7,
                currency_code: _this._counterCode,
                "regular_session": "24x7"
            });
        });
    };
    /**
     * 返回K线数据
     * https://horizon.stellar.org/trade_aggregations?base_asset_type=native&counter_asset_type=credit_alphanum12&counter_asset_code=XCN&counter_asset_issuer=GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY&start_time=1534150599762&end_time=1534151611026&resolution=60000&order=desc
     */
    FFWAPI.prototype.history = function () {
        var _path = new tradeAggregationsParams(this._baseCode, this._baseIssuer, this._counterCode, this._counterIssuer, this._params);
        console.log('--------------------------read history:' + this._horizonServer + 'trade_aggregations?' + _path.params);
        return fetch(this._horizonServer + 'trade_aggregations?' + _path.params)
            .then(function (response) { return response.text(); })
            .then(function (responseTest) {
            var result = JSON.parse(responseTest);
            var records = result._embedded.records;
            if (records.length === 0) {
                return { s: 'no_data', t: [], o: [], h: [], l: [], c: [], v: [], v2: [] };
            }
            var t = [], o = [], h = [], l = [], c = [], v = [], v2 = [];
            records = records.reverse();
            for(let i=0,n=records.length;i<n;i++){
                let item = records[i];
                t.push(item.timestamp / 1000);
                c.push(Number(item.close));
                o.push(Number(item.open));
                h.push(Number(item.high));
                l.push(Number(item.low));
                v.push(Number(item.base_volume));
                // v2.push(Number(item.counter_volume));
            }
            console.log('----------data--------');
            console.log('json--'+JSON.stringify({ s: 'ok', t: t, o: o, h: h, l: l, c: c, v: v }));
            return { s: 'ok', t: t, o: o, h: h, l: l, c: c, v: v };
        });
    };
    return FFWAPI;
}());
var ASSET_TYPE_4 = 'credit_alphanum4';
var ASSET_TYPE_12 = 'credit_alphanum12';
//segment duration as millis since epoch. 
//Supported values are 1 minute (60000), 5 minutes (300000), 15 minutes (900000), 1 hour (3600000), 1 day (86400000) and 1 week (604800000).
var RESOLUTIONS = {
    "1": 60000,
    "5": 300000,
    "15": 900000,
    "60": 3600000,
    "1D": 86400000,
    "D": 86400000,
    "W": 604800000,
    "1W": 604800000
};
var tradeAggregationsParams = /** @class */ (function () {
    function tradeAggregationsParams(baseAssetCode, baseAssetIssuer, counterAssetCode, counterAssetIssuer, params) {
        this.order = 'desc';
        if (this.isNativeAsset(baseAssetCode, baseAssetIssuer)) {
            this._params = 'base_asset_type=native';
        }
        else {
            this._params = 'base_asset_type=';
            if (baseAssetCode.length < 5) {
                this._params += ASSET_TYPE_4;
            }
            else {
                this._params += ASSET_TYPE_12;
            }
            this._params += '&base_asset_code=' + baseAssetCode + '&base_asset_issuer=' + baseAssetIssuer;
        }
        if (this.isNativeAsset(counterAssetCode, counterAssetIssuer)) {
            this._params += '&counter_asset_type=native';
        }
        else {
            this._params += '&counter_asset_type=';
            if (counterAssetCode.length < 5) {
                this._params += ASSET_TYPE_4;
            }
            else {
                this._params += ASSET_TYPE_12;
            }
            this._params += '&counter_asset_code=' + counterAssetCode + '&counter_asset_issuer=' + counterAssetIssuer;
        }
        if (params !== undefined) {
            this._params += '&start_time=' + params['from'] + '000&end_time=' + params['to'] + '000';
            var resolution = RESOLUTIONS[params['resolution'].toString()]; //["1", "15", "60", "1D", "1W"]
            this._params += '&resolution=' + resolution + '&limit=200&order=' + this.order;
        }
    }
    tradeAggregationsParams.prototype.isNativeAsset = function (code, issuer) {
        if (code === 'XLM' && issuer === undefined) {
            return true;
        }
        return false;
    };
    Object.defineProperty(tradeAggregationsParams.prototype, "params", {
        //=XCN&counter_asset_issuer=
        //GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY&
        //start_time=1533830400000&
        //end_time=1534210986767&
        //resolution=60000&
        //order=desc
        get: function () {
            return this._params;
        },
        enumerable: true,
        configurable: true
    });
    return tradeAggregationsParams;
}());

var Requester = /** @class */ (function () {
    function Requester(headers) {
        if (headers) {
            this._headers = headers;
        }
    }
    Requester.prototype.sendRequest = function (datafeedUrl, urlPath, params) {
        // if (params !== undefined) {
        // 	const paramKeys = Object.keys(params);
        // 	if (paramKeys.length !== 0) {
        // 		urlPath += '?';
        // 	}
        // 	urlPath += paramKeys.map((key: string) => {
        // 		return `${encodeURIComponent(key)}=${encodeURIComponent(params[key].toString())}`;
        // 	}).join('&');
        // }
        logMessage('New request: ' + urlPath);
        console.log('---------------------dddddddddddddddddddd---------------');
        console.log(datafeedUrl);
        console.log(urlPath);
        console.log(params);
        // Send user cookies if the URL is on the same origin as the calling script.
        // const options: RequestInit = { credentials: 'same-origin' };
        // if (this._headers !== undefined) {
        // 	options.headers = this._headers;
        // }
        var service = new FFWAPI(datafeedUrl, params);
        return service.handle(urlPath);
        // return fetch(`${datafeedUrl}/${urlPath}`, options)
        // 	.then((response: Response) => response.text())
        // 	.then((responseTest: string) => JSON.parse(responseTest));
        //自定义业务
        /**
             /config返回配置信息，
             {
                    supports_search: false,
                    supports_group_request: true,
                    supported_resolutions: ["1", "5", "15", "30", "60", "1D", "1W", "1M"],
                    supports_marks: false,
                    supports_time: false
                },
                /symbol_info?group=<group_name>  商品集合信息

                商品解析
                /symbols?symbol=<symbol>
                https://b.aitrade.ga/books/tradingview/book/Symbology.html#symbolinfo-structure


                K线柱
                GET /history?symbol=<ticker_name>&from=<unix_timestamp>&to=<unix_timestamp>&resolution=<resolution>
                例:GET /history?symbol=BEAM~0&resolution=D&from=1386493512&to=1395133512
                Response: 响应的预期是一个对象，下面列出了一些属性。每个属性都被视为表的列，如上所述。
                    s: 状态码。 预期值:ok|error|no_data
                    errmsg: 错误消息。只在s = 'error'时出现
                    t: K线时间. unix时间戳 (UTC)
                    c: 收盘价
                    o: 开盘价 (可选)
                    h: 最高价 (可选)
                    l: 最低价(可选)
                    v: 成交量 (可选)
                    nextTime: 下一个K线柱的时间 如果在请求期间无数据 (状态码为no_data) (可选)

                    标识
                    GET /marks?symbol=<ticker_name>&from=<unix_timestamp>&to=<unix_timestamp>&resolution=<resolution>
                    Response: 响应预期是一个对象，下面列出了一些属性。此对象与JS API中的respective response相似，但每个属性都被视为表的列，如上所述。

                    {
                            id: [array of ids],
                            time: [array of times],
                            color: [array of colors],
                            text: [array of texts],
                            label: [array of labels],
                            labelFontColor: [array of label font colors],
                            minSize: [array of minSizes],
                    }
                    //时间刻度标记
                    报价
                        Request:GET /quotes?symbols=<ticker_name_1>,<ticker_name_2>,...,<ticker_name_n>

                        Example:GET /quotes?symbols=NYSE%3AAA%2CNYSE%3AF%2CNasdaqNM%3AAAPL
                        s: status code for request. Expected values:ok|error
                        errmsg: error message for client
                        d:symbols data array
          
          
         **/
    };
    return Requester;
}());

var UDFCompatibleDatafeed = /** @class */ (function (_super) {
    __extends(UDFCompatibleDatafeed, _super);
    function UDFCompatibleDatafeed(datafeedURL, updateFrequency) {
        if (updateFrequency === void 0) { updateFrequency = 60 * 1000; }
        var _this = this;
        var requester = new Requester();
        var quotesProvider = new QuotesProvider(datafeedURL, requester);
        _this = _super.call(this, datafeedURL, quotesProvider, requester, updateFrequency) || this;
        return _this;
    }
    return UDFCompatibleDatafeed;
}(UDFCompatibleDatafeedBase));

exports.UDFCompatibleDatafeed = UDFCompatibleDatafeed;
